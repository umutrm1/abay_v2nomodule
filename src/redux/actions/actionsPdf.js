// src/redux/actions/actionsPdf.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * PDF TITLE GÜNCELLE (PUT /me/pdf/titles/:id)
 * - Backend örneğinizdeki curl ile birebir aynı payload: { key, config_json }
 * - 401 gelirse fetchWithAuth refresh token akışını otomatik yönetir.
 */
export function updatePdfTitle(id, { key, config_json = {} }) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PDF_TITLE_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/titles/${id}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, config_json }),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF title güncellenemedi: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      dispatch({ type: actionTypes.UPDATE_PDF_TITLE_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.UPDATE_PDF_TITLE_FAILURE,
        payload: error?.message || "PDF title güncellenemedi",
      });
      throw error;
    }
  };
}

/**
 * KEY İLE PDF TITLE GETİR (GET /me/pdf/titles/by-key/:key)
 * - Ör: by-key/selam
 */
export function getPdfTitleByKey(key) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_PDF_TITLE_BY_KEY_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/titles/by-key/${encodeURIComponent(key)}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF title alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      dispatch({ type: actionTypes.GET_PDF_TITLE_BY_KEY_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.GET_PDF_TITLE_BY_KEY_FAILURE,
        payload: error?.message || "PDF title alınamadı",
      });
      throw error;
    }
  };
}

/**
 * KEY İLE PDF BRAND GETİR (GET /me/pdf/brands/by-key/:key)
 * - Ör: by-key/selam
 */
export function getPdfBrandByKey(key) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_PDF_BRAND_BY_KEY_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brands/by-key/${"brand.default0"}`,
        {
          method: "GET",
          headers: { accept: "application/json" },
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF brand alınamadı: ${res.status} ${text}`);
      }

      const data = await res.json();
      dispatch({ type: actionTypes.GET_PDF_BRAND_BY_KEY_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.GET_PDF_BRAND_BY_KEY_FAILURE,
        payload: error?.message || "PDF brand alınamadı",
      });
      throw error;
    }
  };
}

/**
 * PDF BRAND GÜNCELLE (PUT /me/pdf/brands/:id)
 * - Payload: { key, config_json }
 */
export function updatePdfBrand({ key, config_json = {} }) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PDF_BRAND_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/pdf/brands/773363d4-56b6-42a5-9953-7b5339d92acc`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, config_json }),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PDF brand güncellenemedi:  ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      dispatch({ type: actionTypes.UPDATE_PDF_BRAND_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.UPDATE_PDF_BRAND_FAILURE,
        payload: error?.message || "PDF brand güncellenemedi",
      });
      throw error;
    }
  };
}

/**
 * PROFORMA NO (PROJECT-CODE RULE) GÜNCELLE
 * (PUT /me/project-code/rule)
 * - Payload: { prefix, separator, padding, start_number }
 * - Curl örneğinizle birebir aynı alan adları.
 */
export function updateProformaRule({ prefix, separator, padding, start_number }) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_PROFORMA_RULE_REQUEST });
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/me/project-code/rule`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefix, separator, padding, start_number }),
        },
        dispatch
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proforma kuralı güncellenemedi: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      dispatch({ type: actionTypes.UPDATE_PROFORMA_RULE_SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.UPDATE_PROFORMA_RULE_FAILURE,
        payload: error?.message || "Proforma kuralı güncellenemedi",
      });
      throw error;
    }
  };
}

export function getBrandImage(brandId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/me/pdf/brands/4e6a6a7a-8176-4281-8f9e-668108ce69c3/image`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
      dispatch
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Brand image alınamadı: ${res.status} ${text}`);
    }

    const data = await res.json();
    dispatch({ type: actionTypes.GET_BRAND_IMAGE_SUCCESS, payload: data });
  };
}