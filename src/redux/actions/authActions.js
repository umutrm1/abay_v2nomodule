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
  // Not: Şu an her iki durumda da sessionStorage kullanıyor. İstersen rememberMe=true için localStorage'a yazalım.
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

export const refreshAccessToken = () => async (dispatch) => {
  try {
    const { data } = await api.post('/auth/refresh', null, {
      headers: { 'accept': 'application/json' }
      // withCredentials zaten api seviyesinde açık
    })
    const newToken = data?.access_token
    if (!newToken) throw new Error('access_token yok')

    // rememberMe'yi storage'tan anlayamayız; var olan nerede ise oraya yazalım
    const rememberMe = !!localStorage.getItem('token')
    setAccessToken(newToken, rememberMe)

    // Auth reducer'ı güncelle
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token: newToken,
        is_admin: data?.is_admin ?? null,
        role: data?.role ?? null,
      }
    })
    // Sessiz yenileme -> kullanıcıyı bildirim bombardımanına tutmamak için toast koymuyoruz.
    return newToken
  } catch (err) {
    // refresh başarısız: tamamen çıkış
    dispatch({ type: LOAD_USER_FAIL })
    toastError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
    dispatch(logoutUser())
    throw err
  }
}

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
      }
    }
    dispatch({ type: LOAD_USER_FAIL })
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }
}

export const initAuth = () => async (dispatch) => {
  // Token elde etmeyi dener (yoksa refresh eder), sonra /auth/me çeker
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
