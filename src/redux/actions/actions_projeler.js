// src/redux/actions/actions_projeler.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";
import { toastSuccess, toastError } from "../../lib/toast.js";

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

/* GET: Tek proje — toast yok */
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

/* GET: Proje gereksinimleri (detaylı) — toast yok */
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

/* GET: Proje listesi — toast yok */
export function getProjelerFromApi(arg1 = 1, arg2 = "", arg3 = 10) {
  return async (dispatch) => {
    try {
      // ---- Parametreleri normalize et ----
      let page, limit, name, code, is_teklif,
          paint_status, glass_status, production_status, customer_id;

      if (typeof arg1 === "object" && arg1 !== null) {
        ({
          page = 1,
          limit = 10,
          name = "",
          code = "",
          is_teklif,
          paint_status = "",
          glass_status = "",
          production_status = "",
          customer_id = ""
        } = arg1);
      } else {
        // Eski imza: (page, q=name, limit)
        page = arg1 ?? 1;
        name = arg2 || "";
        limit = arg3 ?? 10;
        code = "";
        is_teklif = undefined;
        paint_status = "";
        glass_status = "";
        production_status = "";
        customer_id = "";
      }

      // ---- URLSearchParams ----
      const params = new URLSearchParams();

      const setIfHas = (k, v) => {
        if (v === null || v === undefined) return;
        if (typeof v === "string") {
          const t = v.trim();
          if (t !== "") params.set(k, t);
        } else if (typeof v === "boolean") {
          params.set(k, String(v));
        } else {
          params.set(k, String(v));
        }
      };

      setIfHas("page", page ?? 1);
      setIfHas("limit", limit ?? 10);
      setIfHas("name", name);
      setIfHas("code", code);
      if (typeof is_teklif === "boolean") setIfHas("is_teklif", is_teklif);
      setIfHas("paint_status", paint_status);
      setIfHas("glass_status", glass_status);
      setIfHas("production_status", production_status);
      setIfHas("customer_id", customer_id);

      const url = `${API_BASE_URL}/projects/?${params.toString()}`;

      const res = await fetchWithAuth(
        url,
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Proje eklenemedi"); // throw
      }
      const created = await res.json();
      toastSuccess();
      await dispatch(getProjelerFromApi());
      return created;
    } catch (err) {
      toastError();
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Proje silinemedi");
      }
      toastSuccess();
      await dispatch(getProjelerFromApi());
      return true;
    } catch (err) {
      toastError();
      console.log("Proje silinirken hata oluştu:", err);
      throw err;
    }
  };
}

/* POST: Sisteme gereksinim ekle */
export function addRequirementsToProjeToApi(projectId, addedSistem) {
  return async (dispatch) => {
    try {
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Ekleme başarısız");
      }
      const data = await res.json();
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/* POST: Extra glass */
export function addExtraGlassToApi(projectId, addedGlass) {
  return async (dispatch) => {
    try {
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Ekleme başarısız");
      }
      const data = await res.json();
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/* POST: Extra profile */
export function addExtraProfileToApi(projectId, addedProfile) {
  return async (dispatch) => {
    try {
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Ekleme başarısız");
      }
      const data = await res.json();
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

export function addExtraRemoteToApi(projectId, addedRemote) {
  return async (dispatch) => {
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/projects/extra-remotes`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addedRemote),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        _assertOk(res, "Ekleme başarısız");
      }
      const data = await res.json();
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
  };
}

/* POST: Extra material */
export function addExtraMaterialToApi(projectId, addedMaterial) {
  return async (dispatch) => {
    try {
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Ekleme başarısız");
      }
      const data = await res.json();
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return data;
    } catch (err) {
      toastError();
      throw err;
    }
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
      if (!res.ok) {
        toastError();
        _assertOk(res, "Sistem düzenlenemedi");
      }
      toastSuccess();
      await dispatch(getProjeRequirementsFromApi(projectId));
      return true;
    } catch (err) {
      toastError();
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

      if (!res.ok) {
        let detail = "";
        try { detail = await res.text(); } catch {}
        toastError();
        throw new Error(`Proje düzenlenemedi: ${res.status} ${detail || ""}`.trim());
      }

      // ✅ Başarılıysa:
      if (res.status === 204) {
        toastSuccess();
        await dispatch(getProjeFromApi(id));
        await dispatch(getProjeRequirementsFromApi(id));
        await dispatch(getProjelerFromApi());
        return { ok: true };
      }

      const updated = await res.json();
      toastSuccess();
      dispatch(getProjeFromApiToReducer(updated));
      await dispatch(getProjeRequirementsFromApi(id));
      await dispatch(getProjelerFromApi());
      return updated;

    } catch (err) {
      toastError();
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
        try { detail = await res.text(); } catch {}
        toastError();
        throw new Error(`Proje fiyatları güncellenemedi: ${res.status} ${detail}`);
      }

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = { ok: true };
      }
      toastSuccess();
      return data;
    } catch (err) {
      toastError();
      console.error("Proje fiyatları güncellenirken hata oluştu:", err);
      throw err;
    }
  };
}


/**
 * Tek bir system-glass kaydının cam rengini güncelle. (PUT)
 */
export const updateSystemGlassColorInProject = (projectId, psgId, glassColorId) => {
  return async (dispatch) => {
    try {
      const url = `${API_BASE_URL}/projects/${projectId}/system-glasses/${psgId}/color`;
      const res = await fetchWithAuth(
        url,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ glass_color_id: glassColorId }),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        _assertOk(res, "Cam rengi güncellenemedi");
      }
      toastSuccess();
      try { return await res.json(); } catch { return { ok: true }; }
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

/**
 * Aynı camları toplu güncelle (bulk). (PUT)
 */
export const updateSameGlassesInProject = (projectId, system_variant_id, glass_type_id, glass_color_id) => {
  return async (dispatch) => {
    try {
      const url = `${API_BASE_URL}/projects/${projectId}/system-glasses/colors/bulk`;
      const res = await fetchWithAuth(
        url,
        {
          method: "PUT",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            system_variant_id,
            glass_type_id,
            glass_color_id,
          }),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        _assertOk(res, "Toplu cam rengi güncellenemedi");
      }
      toastSuccess();
      try { return await res.json(); } catch { return { ok: true }; }
    } catch (err) {
      toastError();
      throw err;
    }
  };
};

// Tüm camların rengini tek seferde güncelle (PUT)
export const updateAllGlassesColorInProject = (projectId, glassColorId) => {
  return async (dispatch) => {
    try {
      const url = `${API_BASE_URL}/projects/${projectId}/glasses/colors/all`;
      const res = await fetchWithAuth(
        url,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ glass_color_id: glassColorId }),
        },
        dispatch
      );
      if (!res.ok) {
        toastError();
        _assertOk(res, "Tüm cam renkleri güncellenemedi");
      }
      toastSuccess();
      try { return await res.json(); } catch { return { ok: true }; }
    } catch (err) {
      toastError();
      throw err;
    }
  };
};
