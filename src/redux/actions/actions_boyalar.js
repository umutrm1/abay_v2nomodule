import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export function getProfileColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROFILE_BOYALAR_FROM_API, payload };
}
export function getGlassColorFromApiToReducer(payload) {
  return { type: actionTypes.GET_GLASS_BOYALAR_FROM_API, payload };
}

/**
 * Renk ekleme (POST)
 * colorObj: { name, unit_cost, type: 'profile' | 'glass' }
 */
export function addColorToApi(colorObj) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/colors/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(colorObj),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Renk ekleme başarısız: ${res.status}`);
        return res.json();
      })
      .then((data) => data);
  };
}

/**
 * Renk düzenleme (PUT)
 * colorObj: { id, name, unit_cost, type: 'profile' | 'glass' }
 * opts: { page=1, q="", limit=5 } -> düzenleme sonrası mevcut listeyi aynı sayfa/aramayla yenilemek için
 */
export function editColorInApi(colorObj, opts = {}) {
  const { page = 1, q = "", limit = 5 } = opts;
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const { id, name, unit_cost } = colorObj;
    return fetch(`${API_BASE_URL}/colors/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, unit_cost }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Renk güncelleme başarısız: ${res.status}`);
        return res.json();
      })
      .then((data) => data);
  };
}

/**
 * Renk silme (DELETE)
 * params: (id, type, opts)
 * type: 'profile' | 'glass'
 * opts: { page=1, q="", limit=5 } -> silme sonrası mevcut listeyi aynı sayfa/aramayla yenilemek için
 */
export function deleteColorFromApi(id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/colors/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error(`Renk silme başarısız: ${res.status}`);
      return true;
    });
  };
}

/**
 * Sunucu tarafı arama + sayfalama ile PROFIL renkleri çek
 * GET /colors/?type=profile&limit=5&page=1&q=...
 */
export function getProfileColorFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({
      type: "profile",
      limit: String(limit),
      page: String(page),
    });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/colors/?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Profil renkleri alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch(getProfileColorFromApiToReducer(data));
        return data;
      });
  };
}

/**
 * Sunucu tarafı arama + sayfalama ile GLASS renkleri çek
 * GET /colors/?type=glass&limit=5&page=1&q=...
 */
export function getGlassColorFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({
      type: "glass",
      limit: String(limit),
      page: String(page),
    });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/colors/?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Cam renkleri alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch(getGlassColorFromApiToReducer(data));
        return data;
      });
  };
}
