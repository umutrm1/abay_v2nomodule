// src/redux/actions/actions_bayiler.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getBayilerFromApiToReducer(payload) {
  return { type: actionTypes.GET_BAYILER_FROM_API, payload };
}

export function SetUserNamePasswordOnApi(token, username, password) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/auth/accept-invite`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, password }),
      },
      dispatch
    );

    if (!res.ok) {
      let msg = `İşlem başarısız (HTTP ${res.status})`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
        if (data?.detail) msg = data.detail;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  };
}

// 1) Listele
export const getDealersFromApi = (q = "search", limit = 5, page = 1) => {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/dealers/?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;
    const res = await fetchWithAuth(
      url,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail;
      try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi listesi alınamadı (${res.status}): ${JSON.stringify(detail)}`);
    }

    const data = await res.json();
    dispatch(getBayilerFromApiToReducer(data));
    return data;
  };
};

// 2) Düzenle
export const editDealerOnApi = (id, payload) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi güncellenemedi (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json();
  };
};

// 3) Sil
export const sellDealerOnApi = (id) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi silinemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    try { return await res.json(); } catch { return true; }
  };
};

// 4) Davet et
export const addDealerOnApi = (payload) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/invite`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi daveti gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json();
  };
};

// 5) Askıya al
export const suspendDealerOnApi = (id) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/suspend`,
      { method: "POST", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi askıya alınamadı (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json().catch(() => true);
  };
};

// 6) Daveti yeniden gönder
export const reSendInviteOnApi = (id) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/resend-invite`,
      { method: "POST", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Davet yeniden gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json().catch(() => true);
  };
};

// 7) Aktif et
export const activateDealerOnApi = (id) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/activate`,
      { method: "POST", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json().catch(() => true);
  };
};

// 8) Yeniden aktifleştir (opsiyonel davet)
export const reActivateDealerOnApi = ({ id, email, sendInvite = true }) => {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/dealers/reactivate?send_invite=${sendInvite ? "true" : "false"}`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ id, email }),
      },
      dispatch
    );

    if (!res.ok) {
      let detail; try { detail = await res.json(); } catch { detail = await res.text(); }
      throw new Error(`Bayi yeniden aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }
    return res.json();
  };
};