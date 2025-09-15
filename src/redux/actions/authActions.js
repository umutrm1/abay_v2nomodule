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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

function setAccessToken(token, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem('token', token)
    sessionStorage.removeItem('token')
  } else {
    sessionStorage.setItem('token', token)
    localStorage.removeItem('token')
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function getAccessTokenFromStorage() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null
}


// Çıkış yap: hem local hem session storagedan temizle
export const logoutUser = () => dispatch => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  dispatch({ type: LOGOUT })
  delete api.defaults.headers.common['Authorization']
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
    dispatch({ type: LOGIN_SUCCESS, payload: newToken })
    return newToken
  } catch (err) {
    // refresh başarısız: tamamen çıkış
    dispatch({ type: LOAD_USER_FAIL })
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

    dispatch({ type: LOGIN_SUCCESS, payload: token })
    await dispatch(loadCurrentUser()) // token'ı içerden okuyacak
  } catch (err) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: err.response?.status === 401
        ? 'Kullanıcı adı veya şifre hatalı'
        : 'Sunucu hatası'
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