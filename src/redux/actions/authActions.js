// Path Alias: src/redux/actions/authActions.js
// src/redux/actions/authActions.js
import axios from 'axios'
import {
  LOGOUT,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOAD_USER,
  LOAD_USER_FAIL
} from './actionTypes.js'
import { toastSuccess, toastError } from "../../lib/toast.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

function setAccessToken(token, rememberMe = false) {
  // TODO: rememberMe'ye göre localStorage / sessionStorage ayrımını sonra düzeltebiliriz.
  // Şimdilik mevcut davranışı bozmadan devam ediyoruz.
  if (rememberMe) {
    sessionStorage.setItem('token', token)
  } else {
    sessionStorage.setItem('token', token)
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function getAccessTokenFromStorage() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null
}

function getErrorMessage(err, fallback = 'İşlem başarısız.') {
  // API gövdesi {message, detail, error} varyasyonlarını yakalamaya çalışalım
  const data = err?.response?.data
  return (
    data?.message || data?.detail || data?.error || err?.message || fallback
  )
}

// Çıkış yap: hem local hem session storagedan temizle
export const logoutUser = () => dispatch => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  dispatch({ type: LOGOUT })
  delete api.defaults.headers.common['Authorization']
  toastSuccess('Çıkış yapıldı')
  window.location.href = '/login'
}

/**
 * 🔄 refreshAccessToken için "in-flight" guard
 *
 * Amaç:
 *  - Aynı anda birden fazla refreshAccessToken() çağrılırsa
 *    sadece TEK adet /auth/refresh isteği atsın
 *  - Diğer tüm çağrılar aynı promise'i beklesin
 *
 * Böylece:
 *  - İlk istek 200 → yeni access_token + is_admin: true
 *  - Aynı anda giden ikinci istek → eski refresh_token ile 401 ALMA problemi kalmaz
 */
let refreshPromise = null;

export const refreshAccessToken = () => (dispatch) => {
  // Eğer hâlihazırda bir refresh isteği devam ediyorsa, aynı promise'i döndür
  if (refreshPromise) {
    console.log('[refreshAccessToken] mevcut refreshPromise dönüyor...');
    return refreshPromise;
  }

  // Yeni bir refresh isteği başlat ve referansını sakla
  refreshPromise = (async () => {
    try {
      console.log('[refreshAccessToken] /auth/refresh çağrılıyor (axios)...');
      const { data } = await api.post(
        '/auth/refresh',
        null,
        {
          headers: { accept: 'application/json' }
        }
      );

      console.log('[refreshAccessToken] /auth/refresh status: 200, data:', data);

      const newToken = data?.access_token;
      if (!newToken) throw new Error('access_token yok');

      // rememberMe'yi var olan localStorage kaydından anlıyoruz
      const rememberMe = !!localStorage.getItem('token');
      setAccessToken(newToken, rememberMe);

      // Backend burada is_admin / role dönerse, deriveIsAdmin ile normalize edilecek
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          token: newToken,
          is_admin: data?.is_admin ?? null,
          role: data?.role ?? null,
        },
      });

      // Bu thunk'in sonucunu kullanan yerler (await dispatch(refreshAccessToken()))
      // newToken alacak
      return newToken;
    } catch (err) {
      console.error('[refreshAccessToken] refresh hata:', err?.response || err);

      // Buraya geliyorsak, gerçekten refresh başarısız demektir (401, 403, vs.)
      // Bu durumda oturumu düşürmek hâlâ mantıklı
      dispatch({ type: LOAD_USER_FAIL });
      dispatch({ type: LOGOUT });

      throw err;
    } finally {
      // İstek bittiğinde (başarılı veya hatalı) referansı sıfırla
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// loginUser artık rememberMe de alıyor
export const loginUser = (username, password, rememberMe = false) => async dispatch => {
  dispatch({ type: LOGIN_REQUEST })
  try {
    const params = new URLSearchParams()
    params.append('grant_type',    'password')
    params.append('username',      username)
    params.append('password',      password)
    params.append('scope',         '')
    params.append('client_id',     import.meta.env.REACT_APP_CLIENT_ID)
    params.append('client_secret', import.meta.env.REACT_APP_CLIENT_SECRET)

    const { data } = await api.post(
      '/auth/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const token = data.access_token
    setAccessToken(token, rememberMe)

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token,
        is_admin: data?.is_admin ?? null,
        role: data?.role ?? null,
      }
    })

    await dispatch(loadCurrentUser()) // token'ı içerden okuyacak
  } catch (err) {
    const msg = err?.response?.status === 401
      ? 'Kullanıcı adı veya şifre hatalı'
      : getErrorMessage(err, 'Sunucu hatası')

    dispatch({
      type: LOGIN_FAILURE,
      payload: msg
    })
  }
}

// Mevcut kullanıcı bilgisini al
export const loadCurrentUser = () => async dispatch => {
  let token = getAccessTokenFromStorage()
  if (!token) {
    // hiç token yoksa refresh dene (cookie varsa yeni token verecek)
    try {
      token = await dispatch(refreshAccessToken())
    } catch {
      dispatch({ type: LOAD_USER_FAIL })
      return
    }
  }

  try {
    const { data } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    dispatch({ type: LOAD_USER, payload: data })
    // /auth/me is_admin/role DÖNDÜRMÜYORSA: tek atımlık refresh ile bu alanları garantile
    const meHasIsAdmin = Object.prototype.hasOwnProperty.call(data || {}, 'is_admin')
    if (!meHasIsAdmin) {
      try {
        await dispatch(refreshAccessToken()) // LOGIN_SUCCESS ile is_admin/role store’a yazılır
      } catch {
        // refresh başarısızsa sessiz geç: en azından /auth/me yüklenmiştir
      }
    }
  } catch (err) {
    // access token süresi bitmiş olabilir → refresh dene ve tekrar çağır
    if (err?.response?.status === 401) {
      try {
        const newToken = await dispatch(refreshAccessToken())
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        })
        dispatch({ type: LOAD_USER, payload: data })
        return
      } catch {
        // refresh de başarısız
        // 🔴 refresh de başarısız → kesin logout
        dispatch({ type: LOAD_USER_FAIL })
        dispatch({ type: LOGOUT })
        return
      }
    }
    dispatch({ type: LOAD_USER_FAIL })
    dispatch({ type: LOGOUT }) // refresh yoksa oturum yok
  }
}

export const initAuth = () => async (dispatch) => {
  // axios default Authorization'ı, elde token varsa baştan set et
  try {
    const stored = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (stored) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    }
  } catch {}

  try {
    await dispatch(loadCurrentUser()); // loadCurrentUser zaten yoksa refresh deniyor
  } catch {
    // burada ekstra bir şey yapmana gerek yok; loadCurrentUser zaten FAIL durumda store’u temizliyor
  }
};

/**
 * Şifremi unuttum talebi gönderir.
 * @param {string} email - Kullanıcının e-posta adresi
 * @returns {Promise<object>} API'den dönen yanıt ({ message: "..." })
 */
export const forgotPassword = (email) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/forgot-password',
      { email }, // Body
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    toastSuccess(data?.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')
    // Başarı durumunda API'den gelen mesajı döndür
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre sıfırlama talebi başarısız.')
    toastError(msg)
    // Hata durumunda, hatayı bileşene tekrar fırlat
    console.error('Forgot password error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

/**
 * Mevcut şifreyi değiştirir. (Kullanıcı giriş yapmış olmalı)
 * @param {string} old_password - Mevcut şifre
 * @param {string} new_password - Yeni şifre
 * @returns {Promise<object>} API'den dönen yanıt
 */
export const changePassword = (old_password, new_password) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/change-password',
      { old_password, new_password }, // Body
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
          // Authorization başlığı global 'api' instance'ından otomatik olarak eklenecektir.
        }
      }
    );

    toastSuccess('Şifreniz başarıyla değiştirildi.')
    // Başarılı yanıtı döndür.
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre değiştirme başarısız.')
    toastError(msg)
    console.error('Reset password error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const resetPassword = (token, password) => async (dispatch) => {
  try {
    const { data } = await api.post(
      '/auth/reset-password',
      { token, password }, // Body
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
          // Bu istek için Authorization başlığı GEREKMEZ
        }
      }
    );

    toastSuccess('Şifreniz sıfırlandı. Giriş yapabilirsiniz.')
    // Başarılı yanıtı döndür. 
    // Bileşen bu yanıta göre kullanıcıyı login'e yönlendirebilir.
    return data;
  } catch (err) {
    const msg = getErrorMessage(err, 'Şifre sıfırlama başarısız.')
    toastError(msg)
    console.error('Reset password with token error:', err.response?.data || err.message);
    throw err.response?.data || err;
  }
};