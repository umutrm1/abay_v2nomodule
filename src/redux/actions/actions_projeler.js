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

/* GET: Proje listesi — yeni endpoint sözleşmesi */
export function getProjelerFromApi(arg1 = 1, arg2 = "", arg3 = 10) {
  return async (dispatch) => {
    try {
      // ---- Parametreleri normalize et (yeni + eski imzaya uyum) ----
      let page, limit, name, code, is_teklif;

      if (typeof arg1 === "object" && arg1 !== null) {
        // Yeni kullanım: getProjelerFromApi({ page, limit, name, code, is_teklif })
        ({ page = 1, limit = 10, name = "", code = "", is_teklif } = arg1);
      } else {
        // Eski kullanım: getProjelerFromApi(page=1, q="", limit=10)
        page = arg1 ?? 1;
        limit = arg3 ?? 10;
        // Yeni API'de "q" yok; geriye dönük uyumluluk için q'yu "name" olarak kullanıyoruz.
        name = arg2 || "";
        code = "";
        is_teklif = undefined; // Eski çağrıda bu yoktu; URL'e koymayacağız.
      }

      // ---- URLSearchParams inşası ----
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (name) params.set("name", name);
      if (code) params.set("code", code);
      if (typeof is_teklif === "boolean") {
        // Backend "true"/"false" bekliyor
        params.set("is_teklif", String(is_teklif));
      }

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
export function addExtraRemoteToApi(projectId, addedRemote) {
  return async (dispatch) => {
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


/**
 * Tek bir system-glass kaydının cam rengini güncelle.
 * @param {string} projectId           Proje ID
 * @param {string} psgId               Project System Glass ID
 * @param {string} glassColorId        Yeni cam rengi ID'si
 * @returns {Function} thunk -> Promise<any> (API yanıtı)
 *
 * Örnek:
 * await dispatch(updateSystemGlassColorInProject(projectId, psgId, selectedColorId));
 */
export const updateSystemGlassColorInProject = (projectId, psgId, glassColorId) => {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/projects/${projectId}/system-glasses/${psgId}/color`;
    const res = await fetchWithAuth(
      url,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ glass_color_id: glassColorId }), // ✅ sadece bu obje
      },
      dispatch
    );
    _assertOk(res, "Cam rengi güncellenemedi");
    // Body olmayabilir; çağıran tarafta zaten requirements refresh var.
    try { return await res.json(); } catch { return { ok: true }; }
  };
};

/**
 * Aynı camları toplu güncelle (bulk).
 * @param {string} projectId           Proje ID
 * @param {{project_system_glass_id: string, glass_color_id: string}[]} items
 * @returns {Function} thunk -> Promise<any> (API yanıtı)
 *
 * Örnek:
 * const items = rows.map(r => ({ project_system_glass_id: r.id, glass_color_id: colorId }));
 * await dispatch(updateSameGlassesInProject(projectId, items));
 */
export const updateSameGlassesInProject = (projectId, system_variant_id, glass_type_id, glass_color_id) => {
  return async (dispatch) => {
    const url = `${API_BASE_URL}/projects/${projectId}/system-glasses/colors/bulk`;
    const res = await fetchWithAuth(
      url,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          system_variant_id,   // ✅ senin istediğin payload
          glass_type_id,
          glass_color_id,
        }),
      },
      dispatch
    );
    _assertOk(res, "Toplu cam rengi güncellenemedi");
    try { return await res.json(); } catch { return { ok: true }; }
  };
};

// Tüm camların rengini tek seferde güncelle
export const updateAllGlassesColorInProject = (projectId, glassColorId) => {
  return async (dispatch) => {
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
    _assertOk(res, "Tüm cam renkleri güncellenemedi");
    try { return await res.json(); } catch { return { ok: true }; }
  };
};