// src/redux/actions/actions_boyalar.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getProfileColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROFILE_BOYALAR_FROM_API, payload };
}
export function getGlassColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_GLASS_BOYALAR_FROM_API, payload };
}

export function addColorToApi(colorObj) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(colorObj),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Renk ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editColorInApi(colorObj) {
  return async (dispatch) => {
    const { id, name, unit_cost } = colorObj;
    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, unit_cost }),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Renk güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteColorFromApi(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/${id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Renk silme başarısız: ${res.status}`);
    return true;
  };
}

export function getProfileColorFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ type: "profile", limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Profil renkleri alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getProfileColorFromApiToReducer(data));
    return data;
  };
}

export function getGlassColorFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ type: "glass", limit: String(limit), page: String(page) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/colors/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam renkleri alınamadı: ${res.status}`);
    const data = await res.json();
    dispatch(getGlassColorFromApiToReducer(data));
    return data;
  };
}