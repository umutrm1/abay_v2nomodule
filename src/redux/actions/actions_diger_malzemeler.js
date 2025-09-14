import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

export function getDigerMalzemelerFromApiToReducer(payload) {
  return { type: actionTypes.GET_DIGER_MALZEMELER_FROM_API, payload };
}

/**
 * LISTE: server-side sayfalama + arama
 * - Arama: /catalog/other-materials?q=...&limit=5&page=1
 * - Liste: /catalog/other-materials?limit=5&page=1
 * Not: Her sayfada 5 öğe (limit=5)
 */
export function getDigerMalzemelerFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/catalog/other-materials?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Diğer malzemeler alınamadı: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // data: { items, total, page, limit, total_pages, has_next, has_prev }
        dispatch(getDigerMalzemelerFromApiToReducer(data));
        return data;
      });
  };
}

/** EKLE (POST) – komponentten sonra listeyi tekrar çağıracağız */
export function addDigerMalzemeToApi(addedRow) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/other-materials`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addedRow),
    }).then((res) => {
      if (!res.ok) throw new Error(`Ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

/** DÜZENLE (PUT) */
export function editDigerMalzemeOnApi(id, editedRow) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/other-materials/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedRow),
    }).then((res) => {
      if (!res.ok) throw new Error(`Güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

/** SİL (DELETE) */
export function sellDigerMalzemeOnApi(malzeme_id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/catalog/other-materials/${malzeme_id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Silme başarısız: ${res.status}`);
      return true;
    });
  };
}
