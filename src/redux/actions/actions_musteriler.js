// src/redux/actions/actions_musteriler.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getMusterilerFromApiToReducer(payload) {
  return {
    type: actionTypes.GET_MUSTERILER_FROM_API,
    payload,
  };
}

export function getMusterilerFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/customers/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) throw new Error(`GET /customers failed: ${res.status}`);

    const data = await res.json();
    dispatch(getMusterilerFromApiToReducer(data));
    return data;
  };
}

export function addMusteriToApi(newCustomer) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/customers/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      },
      dispatch
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Sunucu hatası: ${res.status} ${txt}`);
    }

    // İstersen burada created nesnesini kullanmak istersen -> const created = await res.json();
    await res.json().catch(() => null);
    await dispatch(getMusterilerFromApi());
    return true;
  };
}

export function editMusteriOnApi(id, editedCustomer) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/customers/${id}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCustomer),
      },
      dispatch
    );

    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);

    await res.json().catch(() => null);
    await dispatch(getMusterilerFromApi());
    return true;
  };
}

export function deleteMusteriOnApi(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/customers/${id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );

    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);

    await dispatch(getMusterilerFromApi());
    return true;
  };
}