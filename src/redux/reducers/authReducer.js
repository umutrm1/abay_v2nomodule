// src/redux/reducers/authReducer.js 
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOAD_USER, LOAD_USER_FAIL,LOGOUT
} from '@/redux/actions/actionTypes.js'

const initialState = {
token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,  loading: false,
  user: null,
  error: null,
  is_admin: null,
  role: null
}

export default function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null }
    case LOGIN_SUCCESS:
      // payload string (token) ya da { token, is_admin, role } olabilir
      const isObj = action && typeof action.payload === 'object' && action.payload !== null
      return {
        ...state,
        loading: false,
        token: isObj ? action.payload.token : action.payload,
        is_admin: isObj && 'is_admin' in action.payload ? action.payload.is_admin : state.is_admin,
        role: isObj && 'role' in action.payload ? action.payload.role : state.role,
      }    
      case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case LOAD_USER:
      return {
        ...state,
        user: action.payload,
        // /auth/me yanıtında is_admin/role varsa state’e yaz
        is_admin: action.payload?.is_admin ?? state.is_admin,
        role: action.payload?.role ?? state.role,
      }    
      case LOAD_USER_FAIL:
      return { ...state, user: null, is_admin: null, role: null }
    case LOGOUT:
      return { ...initialState };
    default:
      return state
  }
}
