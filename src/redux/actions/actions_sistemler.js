// src/redux/actions/actions_sistemler.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getSistemlerFromApiToReducer(payload) {
  return { type: actionTypes.GET_SISTEMLER_FROM_API, payload };
}
export function getSystemVariantsOfSystemFromApiToReducer(payload) {
  return { type: actionTypes.SYSTEM_VARIANTS_OF_SYSTEM, payload };
}
export function getSystemFullVariantsOfSystemFromApiToReducer(payload) {
  return { type: actionTypes.FULL_VARIANT_OF_SYSTEM, payload };
}
export function getSystemVariantsFromApiToReducer(payload) {
  return { type: actionTypes.GET_SYSTEM_VARIANTS_FROM_API, payload };
}

export function getSystemVariantsFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemVariantsFromApiToReducer(data));
    return data;
  };
}

export function getSistemlerFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSistemlerFromApiToReducer(data));
    return data;
  };
}

export function getSystemVariantsOfSystemFromApi(systemId, page = 1, q = "", limit = 50) {
  return async (dispatch) => {
    const params = new URLSearchParams();
    if (q !== "") params.set("q", q);
    params.set("limit", String(limit));
    params.set("page", String(page));

    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/system/${systemId}?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );

    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemVariantsOfSystemFromApiToReducer(data));
    return data;
  };
}

export function getSystemFullVariantsOfSystemFromApi(variantId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${variantId}`,
      { method: "GET", headers: { Accept: "application/json" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Network not ok (${res.status})`);
    const data = await res.json();
    dispatch(getSystemFullVariantsOfSystemFromApiToReducer(data));
    return data;
  };
}

// --- SYSTEM CRUD ---
export function addSystemToApi(system) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(system),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Sistem ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editSystemOnApi(systemId, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems/${systemId}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Sistem güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteSystemOnApi(systemId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems/${systemId}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Sistem silme başarısız: ${res.status}`);
    return true;
  };
}

// --- SYSTEM VARIANT CRUD ---
export function addSystemVariantToApi(variant) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(variant),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Varyant ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editSystemVariantOnApi(variantId, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${variantId}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editSystemVariantTemplatesOnApi(variantId, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${variantId}/templates`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteSystemVariantOnApi(variantId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${variantId}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Varyant silme başarısız: ${res.status}`);
    return true;
  };
}

// --- SYSTEM TEMPLATE: PROFILE
export function addProfileOnSystemVariant(profileLink) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/profiles`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(profileLink),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Profil ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editProfileOnSystemVariant(id, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/profiles/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Profil güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteProfileOnSystemVariant(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/profiles/${id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Profil silme başarısız: ${res.status}`);
    return true;
  };
}

// --- SYSTEM TEMPLATE: GLASS
export function addGlassOnSystemVariant(glassLink) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/glasses`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(glassLink),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editGlassOnSystemVariant(id, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/glasses/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteGlassOnSystemVariant(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/glasses/${id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Cam silme başarısız: ${res.status}`);
    return true;
  };
}

// --- SYSTEM TEMPLATE: EXTRA MATERIAL
export function addEkstraMalzemeOnSystemVariant(link) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/materials`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(link),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Ekstra malzeme ekleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function editEkstraMalzemeOnSystemVariant(id, updated) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/materials/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Ekstra malzeme güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function deleteEkstraMalzemeOnSystemVariant(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-templates/materials/${id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Ekstra malzeme silme başarısız: ${res.status}`);
    return true;
  };
}

// --- ESKİ MOCK UÇLAR (uyarlandı)
export function editSistemOnApi(sistem_id, editedRow) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems/${sistem_id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(editedRow),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`Sistem güncelleme başarısız: ${res.status}`);
    return res.json();
  };
}

export function addSistemToApi(sistem) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/profiles/`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(sistem),
      },
      dispatch
    );
    if (!res.ok) throw new Error(`İstek başarısız: ${res.status}`);
    return res.json();
  };
}

export function sellSistemOnApi(sistem_id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/systems/${sistem_id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Silme başarısız: ${res.status}`);
    return true;
  };
}

export function sellSystemVariantOnApi(sistem_id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/system-variants/${sistem_id}`,
      { method: "DELETE", headers: { Accept: "*/*" } },
      dispatch
    );
    if (!res.ok) throw new Error(`Varyant silme başarısız: ${res.status}`);
    return true;
  };
}