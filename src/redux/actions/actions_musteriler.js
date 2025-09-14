// src/redux/actions/actions_musteriler.js
import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

export function getMusterilerFromApiToReducer(payload) {
  return {
    type: actionTypes.GET_MUSTERILER_FROM_API,
    payload,
  };
}

export function getMusterilerFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/customers/?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GET /customers failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch(getMusterilerFromApiToReducer(data));
        return data;
      });
  };
}
export function addMusteriToApi(newCustomer) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    fetch(`${API_BASE_URL}/customers/`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCustomer)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        return res.json();
      })
      .then(() => dispatch(getMusterilerFromApi()))
      .catch(err => console.error("POST /customers hata:", err));
  };
}

export function editMusteriOnApi(id, editedCustomer) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedCustomer)
    })
      .then(res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        return res.json();
      })
      .then(() => dispatch(getMusterilerFromApi()))
      .catch(err => console.error(`PUT /customers/${id} hata:`, err));
  };
}

export function deleteMusteriOnApi(id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
      })
      .then(() => dispatch(getMusterilerFromApi()))
      .catch(err => console.error(`DELETE /customers/${id} hata:`, err));
  };
}
