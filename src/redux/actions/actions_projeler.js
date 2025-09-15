// src/redux/actions/actions_projeler.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** İç yardımcı: HTTP 2xx değilse anlamlı hata üret */
function _assertOk(res, msg = "HTTP error") {
  if (!res.ok) {
    const err = new Error(`${msg}! status: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

/* Reducer action creators – (AYNEN KALDI) */
export function getProjelerFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROJELER_FROM_API, payload };
}
export function getProjeFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROJE_FROM_API, payload };
}
export function getProjeRequirementsFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROJE_REQUIREMENTS_FROM_API, payload };
}

/* GET: Tek proje */
export function getProjeFromApi(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${id}`,
        { method: "GET", headers: { Accept: "application/json" } },
        dispatch
      );
      _assertOk(res, "Proje çekilemedi");
      const data = await res.json();
      dispatch(getProjeFromApiToReducer(data));
      return data;
    } catch (err) {
      console.error("Proje çekilirken hata oluştu:", err);
      throw err;
    }
  };
}

/* GET: Proje gereksinimleri (detaylı) */
export function getProjeRequirementsFromApi(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${id}/requirements-detailed`,
        { method: "GET", headers: { Accept: "application/json" } },
        dispatch
      );
      _assertOk(res, "Proje gereksinimleri çekilemedi");
      const data = await res.json();
      dispatch(getProjeRequirementsFromApiToReducer(data));
      return data;
    } catch (err) {
      console.error("Proje gereksinimleri hata:", err);
      throw err;
    }
  };
}

/* GET: Proje listesi */
export function getProjelerFromApi(page = 1, q = "", limit = 10) {
  return async (dispatch) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (q) params.append("q", q);

      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/?${params.toString()}`,
        { method: "GET", headers: { Accept: "application/json" } },
        dispatch
      );
      _assertOk(res, "Projeler çekilemedi");
      const data = await res.json();
      dispatch(getProjelerFromApiToReducer(data));
      return data;
    } catch (err) {
      console.error("Projeler çekilirken hata oluştu:", err);
      throw err;
    }
  };
}

/* POST: Proje ekle */
export function addProjeToApi(addedProje) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addedProje),
        },
        dispatch
      );
      _assertOk(res, "Proje eklenemedi");
      const created = await res.json();
      await dispatch(getProjelerFromApi());
      return created;
    } catch (err) {
      console.error("Proje eklenirken hata oluştu:", err);
      throw err;
    }
  };
}

/* DELETE: Proje sil */
export function deleteProjeOnApi(id) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
        dispatch
      );
      _assertOk(res, "Proje silinemedi");
      await dispatch(getProjelerFromApi());
      return true;
    } catch (err) {
      console.log("Proje silinirken hata oluştu:", err);
      throw err;
    }
  };
}

/* POST: Sisteme gereksinim ekle */
export function addRequirementsToProjeToApi(projectId, addedSistem) {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/projects/${projectId}/add-requirements`;
    const body = JSON.stringify(addedSistem);

    const res = await fetchWithAuth(
      url,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
      },
      dispatch
    );
    _assertOk(res, "Ekleme başarısız");
    const data = await res.json();
    await dispatch(getProjeRequirementsFromApi(projectId));
    return data;
  };
}

/* POST: Extra glass */
export function addExtraGlassToApi(projectId, addedGlass) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/projects/extra-glasses`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addedGlass),
      },
      dispatch
    );
    _assertOk(res, "Ekleme başarısız");
    const data = await res.json();
    await dispatch(getProjeRequirementsFromApi(projectId));
    return data;
  };
}

/* POST: Extra profile */
export function addExtraProfileToApi(projectId, addedProfile) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/projects/extra-profiles`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addedProfile),
      },
      dispatch
    );
    _assertOk(res, "Ekleme başarısız");
    const data = await res.json();
    await dispatch(getProjeRequirementsFromApi(projectId));
    return data;
  };
}

/* POST: Extra material */
export function addExtraMaterialToApi(projectId, addedMaterial) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/projects/extra-materials`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addedMaterial),
      },
      dispatch
    );
    _assertOk(res, "Ekleme başarısız");
    const data = await res.json();
    await dispatch(getProjeRequirementsFromApi(projectId));
    return data;
  };
}

/* PUT: Proje içindeki bir system'i düzenle */
export function editProjeSystemOnApi(projectId, projectSystemId, editedSystem) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${projectId}/systems/${projectSystemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(editedSystem),
        },
        dispatch
      );
      _assertOk(res, "Sistem düzenlenemedi");
      await dispatch(getProjeRequirementsFromApi(projectId));
      return true;
    } catch (err) {
      console.log("Proje düzenlenirken hata oluştu:", err);
      throw err;
    }
  };
}

/* PUT: Proje düzenle (ad, kod, müşteri, renkler) */
export function editProjeOnApi(id, editedProje) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(editedProje),
        },
        dispatch
      );

      // ❌ Başarısız ise reducer'a yazma
      if (!res.ok) {
        let detail = "";
        try { detail = await res.text(); } catch {}
        throw new Error(`Proje düzenlenemedi: ${res.status} ${detail || ""}`.trim());
      }

      // ✅ Başarılıysa:
      if (res.status === 204) {
        // Body yoksa en güvenlisi tekrar çekmek
        await dispatch(getProjeFromApi(id));
        await dispatch(getProjeRequirementsFromApi(id));
        await dispatch(getProjelerFromApi());
        return { ok: true };
      }

      // Body varsa dönen veriyi reducer'a yaz
      const updated = await res.json();
      dispatch(getProjeFromApiToReducer(updated));
      await dispatch(getProjeRequirementsFromApi(id));
      await dispatch(getProjelerFromApi());
      return updated;

    } catch (err) {
      console.error("Proje düzenlenirken hata oluştu:", err);
      throw err;
    }
  };
}

/* PUT: Proje fiyatlarını düzenle (press_price, painted_price) */
export function editProjectPricesOnApi(projectId, prices) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/${projectId}/prices`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prices), // { press_price, painted_price }
        },
        dispatch
      );

      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch {}
        throw new Error(`Proje fiyatları güncellenemedi: ${res.status} ${detail}`);
      }

      // başarılı → body varsa al
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { ok: true };
      }
      return data;
    } catch (err) {
      console.error("Proje fiyatları güncellenirken hata oluştu:", err);
      throw err;
    }
  };
}
