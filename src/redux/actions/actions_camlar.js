// src/redux/actions/actions_camlar.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getCamlarFromApiToReducer(payload) {
  return { type: actionTypes.GET_CAMLAR_FROM_API, payload };
}

export function getCamlarFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/glass-types?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam listesi alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getCamlarFromApiToReducer(data));
    return data;
  };
}

export function addCamToApi(addedRow) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/glass-types`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(addedRow),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editCamOnApi(id, editedRow) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/glass-types/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(editedRow),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function sellCamOnApi(cam_id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/glass-types/${cam_id}`,
      { method: "DELETE", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam silme başarısız: ${res.status}`);
    return true;
  };
}