// src/redux/actions/actions_kumandalar.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getKumandalarFromApiToReducer(payload) {
  return { type: actionTypes.GET_KUMANDALAR_FROM_API, payload };
}

export function getKumandalarFromApi({ q = "selam", limit = 5, page = 1 } = {}) {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/catalog/remotes?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;
    const res = await fetchWithAuth(
      url,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumandalar getirilemedi (HTTP ${res.status}). ${errTxt}`);
    }
    const data = await res.json();
    dispatch(getKumandalarFromApiToReducer(data));
    return data;
  };
}

export function addKumandaToApi({ kumanda_isim, price, kapasite }) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/remotes`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ kumanda_isim, price, kapasite }),
      },
      dispatch
    );
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda eklenemedi (HTTP ${res.status}). ${errTxt}`);
    }
    return res.json();
  };
}

export function deleteKumandaOnApi(id) {
  return async (dispatch) => {
    if (!id) throw new Error("Silmek için 'id' gerekli.");
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda silinemedi (HTTP ${res.status}). ${errTxt}`);
    }
    return true;
  };
}

export function editKumandaOnApi(id, { kumanda_isim, price, kapasite }) {
  return async (dispatch) => {
    if (!id) throw new Error("Düzenlemek için 'id' gerekli.");
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ kumanda_isim, price, kapasite }),
      },
      dispatch
    );
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda güncellenemedi (HTTP ${res.status}). ${errTxt}`);
    }
    return res.json();
  };
}