import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
export function getBayilerFromApiToReducer(payload) {
  return {
    type: actionTypes.GET_BAYILER_FROM_API,
    payload: payload,
  };
}

function authHeaders(getState, extra = {}) {
  const token = _getToken(getState);
  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export function SetUserNamePasswordOnApi(token, username, password) {
  return async (dispatch, getState) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/accept-invite`, {
        method: "POST",
        headers: authHeaders(getState, { "Content-Type": "application/json" }),
        body: JSON.stringify({ token, username, password }),
      });

      if (!res.ok) {
        let msg = `İşlem başarısız (HTTP ${res.status})`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
          if (data?.detail) msg = data.detail;
        } catch {}
        throw new Error(msg);
      }
      return await res.json();
    } catch (err) {
      console.error("SetPassword error:", err);
      throw err;
    }
  };
}




// === 1) Bayi listesi: GET /api/dealers/?q=search&limit=5&page=1 ===
export const getDealersFromApi = (q = "search", limit = 5, page = 1) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;

    const res = await fetch(url, {
      method: "GET",
      headers: authHeaders(getState),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi listesi alınamadı (${res.status}): ${JSON.stringify(detail)}`);
    }

    const data = await res.json();
    dispatch(getBayilerFromApiToReducer(data));
    return data;
  };
};

// === 2) Bayi düzenle: PUT /api/dealers/{id} ===
export const editDealerOnApi = (id, payload) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: authHeaders(getState, { "Content-Type": "application/json" }),
      body: JSON.stringify(payload || {}),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi güncellenemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json();
  };
};

// === 3) Bayi sil (sellDealerOnApi): DELETE /api/dealers/{id} ===
export const sellDealerOnApi = (id) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(getState, { accept: "*/*" }),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi silinemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    try {
      return await res.json();
    } catch {
      return true;
    }
  };
};

// === 4) Bayi davet et: POST /api/dealers/invite ===
export const addDealerOnApi = (payload) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/invite`;

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(getState, { "Content-Type": "application/json" }),
      body: JSON.stringify(payload || {}),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi daveti gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json();
  };
};

// === 5) Bayi askıya al: POST /api/dealers/{id}/suspend ===
export const suspendDealerOnApi = (id) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/suspend`;

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(getState),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi askıya alınamadı (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json().catch(() => true);
  };
};

// === 6) Daveti yeniden gönder: POST /api/dealers/{id}/resend-invite ===
export const reSendInviteOnApi = (id) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/resend-invite`;

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(getState),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Davet yeniden gönderilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json().catch(() => true);
  };
};

// === 7) Bayi aktif et: POST /api/dealers/{id}/activate ===
export const activateDealerOnApi = (id) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/${encodeURIComponent(id)}/activate`;

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(getState),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json().catch(() => true);
  };
};

// === 8) Bayi yeniden aktifleştir: POST /api/dealers/reactivate?send_invite=true|false ===
export const reActivateDealerOnApi = ({ id, email, sendInvite = true }) => {
  return async (dispatch, getState) => {
    const url = `${API_BASE_URL}/dealers/reactivate?send_invite=${sendInvite ? "true" : "false"}`;

    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(getState, { "Content-Type": "application/json" }),
      body: JSON.stringify({ id, email }),
    });

    if (!res.ok) {
      let detail;
      try {
        detail = await res.json();
      } catch {
        detail = await res.text();
      }
      throw new Error(`Bayi yeniden aktifleştirilemedi (${res.status}): ${JSON.stringify(detail)}`);
    }

    return await res.json();
  };
};
