// src/redux/reducers/authReducer.js 
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOAD_USER, LOAD_USER_FAIL, LOGOUT
} from '@/redux/actions/actionTypes.js'

// ✅ KURAL: is_admin null/undefined ise role === "admin" → true, değilse false
function normalizeIsAdmin(rawIsAdmin, role, prevIsAdmin) {
  // 1) boolean geldiyse net onu kullan
  if (rawIsAdmin === true || rawIsAdmin === false) return rawIsAdmin;

  // 2) null/undefined ise role’a göre hesapla
  if (typeof role === "string") return role === "admin";

  // 3) role da yoksa, önceki değeri koru; o da yoksa false
  if (prevIsAdmin === true || prevIsAdmin === false) return prevIsAdmin;

  return false;
}

const initialState = {
  token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
  loading: false,
  user: null,
  error: null,
  is_admin: null,
  role: null,
  bootstrapped: false
}

export default function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null }

    case LOGIN_SUCCESS: {
      const isObj =
        action && typeof action.payload === 'object' && action.payload !== null;

      const nextToken = isObj ? action.payload.token : action.payload;

      const nextRole =
        isObj && 'role' in action.payload
          ? action.payload.role
          : state.role;

      const rawIsAdmin =
        isObj && 'is_admin' in action.payload
          ? action.payload.is_admin
          : state.is_admin;

      return {
        ...state,
        loading: false,
        token: nextToken,
        role: nextRole,
        // ✅ burada asla null kalmaz
        is_admin: normalizeIsAdmin(rawIsAdmin, nextRole, state.is_admin),
        bootstrapped: true,
      };
    }

    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }

    case LOAD_USER: {
      const nextUser = action.payload;

      const nextRole = nextUser?.role ?? state.role;
      const rawIsAdmin = nextUser?.is_admin ?? state.is_admin;

      return {
        ...state,
        user: nextUser,
        role: nextRole,
        // ✅ /auth/me is_admin göndermese bile role’dan true/false üretir
        is_admin: normalizeIsAdmin(rawIsAdmin, nextRole, state.is_admin),
      };
    }

    case LOAD_USER_FAIL:
      return { ...state, user: null, is_admin: false, role: null, bootstrapped: true }

    case LOGOUT:
      return { ...initialState, is_admin: false, bootstrapped: true }

    default:
      return state
  }
}
