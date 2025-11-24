// src/redux/reducers/authReducer.js 
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOAD_USER, LOAD_USER_FAIL, LOGOUT
} from '@/redux/actions/actionTypes.js'

// ✅ is_admin null gelirse role’a göre otomatik hesapla
function resolveIsAdmin(nextIsAdmin, nextRole, prevIsAdmin) {
  // 1) açıkça boolean geldiyse onu kullan
  if (nextIsAdmin === true || nextIsAdmin === false) return nextIsAdmin;

  // 2) null/undefined geldiyse role'a bak
  if (nextRole) return nextRole === "admin";

  // 3) role da yoksa, önceki state'e geri dön (ama null ise false’a düşür)
  return prevIsAdmin === true || prevIsAdmin === false ? prevIsAdmin : false;
}

const initialState = {
  token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
  loading: false,
  user: null,
  error: null,
  is_admin: null,   // başlangıçta null olabilir ama kısa süre sonra resolve edilecek
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
      const nextRole  = isObj && 'role' in action.payload ? action.payload.role : state.role;
      const rawIsAdmin =
        isObj && 'is_admin' in action.payload ? action.payload.is_admin : state.is_admin;

      return {
        ...state,
        loading: false,
        token: nextToken,
        role: nextRole,
        // ✅ burada boolean garanti
        is_admin: resolveIsAdmin(rawIsAdmin, nextRole, state.is_admin),
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
        // ✅ /auth/me is_admin göndermese bile role'dan doldurur
        is_admin: resolveIsAdmin(rawIsAdmin, nextRole, state.is_admin),
      };
    }

    case LOAD_USER_FAIL:
      // ✅ fail durumda bile null bırakma → false
      return {
        ...state,
        user: null,
        is_admin: false,
        role: null,
        bootstrapped: true
      }

    case LOGOUT:
      // ✅ logout sonrası da null kalmasın
      return { ...initialState, is_admin: false, bootstrapped: true };

    default:
      return state
  }
}
