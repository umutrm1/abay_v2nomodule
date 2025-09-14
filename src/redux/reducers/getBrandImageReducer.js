import * as actionTypes from "../actions/actionTypes";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/**
 * Amaç: getBrandImage başarılı olduğunda gelen veriyi state’e yazmak.
 * Başlangıç state’i {}.
 */
export default function getBrandImageReducer(state = {}, action) {
  switch (action.type) {
    case actionTypes.GET_BRAND_IMAGE_SUCCESS: {
      const payload = action.payload || {};
      return {
        ...payload,
        // logo_url varsa tam URL haline getiriyoruz
        logo_url: payload.logo_url
          ? `${BASE_ORIGIN}${payload.logo_url}`
          : null,
      };
    }

    default:
      return state;
  }
}