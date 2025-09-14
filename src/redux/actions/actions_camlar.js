import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export function getCamlarFromApiToReducer(payload) {
  return { type: actionTypes.GET_CAMLAR_FROM_API, payload };
}

/**
 * LISTE: server-side sayfalama + arama
 * - Arama:   /catalog/glass-types?q=...&limit=5&page=1
 * - Aramasız:/catalog/glass-types?limit=5&page=1
 */
export function getCamlarFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/catalog/glass-types?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Cam listesi alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // { items, total, page, limit, total_pages, has_next, has_prev }
        dispatch(getCamlarFromApiToReducer(data));
        return data;
      });
  };
}

/** EKLE (POST) – başarılı olunca komponentte mevcut sayfayı refetch edeceğiz */
export function addCamToApi(addedRow) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/glass-types`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addedRow),
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

/** DÜZENLE (PUT) */
export function editCamOnApi(id, editedRow) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/glass-types/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedRow),
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

/** SİL (DELETE) */
export function sellCamOnApi(cam_id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/glass-types/${cam_id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam silme başarısız: ${res.status}`);
      return true;
    });
  };
}
