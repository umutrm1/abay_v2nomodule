import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOAD_USER, LOAD_USER_FAIL,LOGOUT
} from '@/redux/actions/actionTypes'

const initialState = {
token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,  loading: false,
  user: null,
  error: null
}

export default function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null }
    case LOGIN_SUCCESS:
      return { ...state, loading: false, token: action.payload }
    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case LOAD_USER:
      return { ...state, user: action.payload }
    case LOAD_USER_FAIL:
      return { ...state, user: null }
    case LOGOUT:
      return { ...initialState };
    default:
      return state
  }
}
