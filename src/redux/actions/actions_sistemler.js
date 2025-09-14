import * as actionTypes from "./actionTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

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
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/system-variants/?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Network not ok (${r.status})`);
        return r.json();
      })
      .then((data) => {
        // data: { items, total, page, limit, total_pages, has_next, has_prev }
        dispatch(getSystemVariantsFromApiToReducer(data));
        return data;
      });
  };
}

export function getSistemlerFromApi(page = 1, q = "", limit = 5) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) params.append("q", q);

    return fetch(`${API_BASE_URL}/systems?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Network not ok (${r.status})`);
        return r.json();
      })
      .then((data) => {
        // data: { items, total, page, limit, total_pages, has_next, has_prev }
        dispatch(getSistemlerFromApiToReducer(data));
        return data;
      });
  };
}

export function getSystemVariantsOfSystemFromApi(systemId, page = 1, q = "", limit = 50) {
  return async (dispatch, getState) => {
    const token = _getToken(getState);

    // query parametrelerini hazırla
    const params = new URLSearchParams();
    if (q !== "") params.set("q", q);
    params.set("limit", String(limit));
    params.set("page", String(page));

    const url = `${API_BASE_URL}/system-variants/system/${systemId}?${params.toString()}`;

    try {
      const r = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!r.ok) {
        throw new Error(`Network not ok (${r.status})`);
      }

      const data = await r.json();
      dispatch(getSystemVariantsOfSystemFromApiToReducer(data));
    } catch (err) {
      console.error("getSystemVariantsOfSystemFromApi API hatası:", err);
    }
  };
}


export function getSystemFullVariantsOfSystemFromApi(variantId) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    fetch(`${API_BASE_URL}/system-variants/${variantId}`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Network not ok (${r.status})`);
        return r.json();
      })
      .then((data) => dispatch(getSystemFullVariantsOfSystemFromApiToReducer(data)))
      .catch((err) =>
        console.error("getSystemVariantsOfSystemFromApi API hatası:", err)
      );
  };
}

// --- SYSTEM CRUD ---
export function addSystemToApi(system) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/systems`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(system),
    }).then((res) => {
      if (!res.ok) throw new Error(`Sistem ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editSystemOnApi(systemId, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/systems/${systemId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Sistem güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function deleteSystemOnApi(systemId) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/systems/${systemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Sistem silme başarısız: ${res.status}`);
    });
  };
}

// --- SYSTEM VARIANT CRUD ---
export function addSystemVariantToApi(variant) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-variants/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variant),
    }).then((res) => {
      if (!res.ok) throw new Error(`Varyant ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editSystemVariantOnApi(variantId, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-variants/${variantId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editSystemVariantTemplatesOnApi(variantId, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-variants/${variantId}/templates`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Varyant güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function deleteSystemVariantOnApi(variantId) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-variants/${variantId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Varyant silme başarısız: ${res.status}`);
    });
  };
}

// --- PROFILE ON SYSTEM VARIANT CRUD ---
export function addProfileOnSystemVariant(profileLink) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/profiles`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileLink),
    }).then((res) => {
      if (!res.ok) throw new Error(`Profil ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editProfileOnSystemVariant(id, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/profiles/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Profil güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function deleteProfileOnSystemVariant(id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/profiles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Profil silme başarısız: ${res.status}`);
    });
  };
}

// --- GLASS ON SYSTEM VARIANT CRUD ---
export function addGlassOnSystemVariant(glassLink) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/glasses`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(glassLink),
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editGlassOnSystemVariant(id, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/glasses/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function deleteGlassOnSystemVariant(id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/glasses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Cam silme başarısız: ${res.status}`);
    });
  };
}

// --- EXTRA MATERIAL ON SYSTEM VARIANT CRUD ---
export function addEkstraMalzemeOnSystemVariant(link) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/materials`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(link),
    }).then((res) => {
      if (!res.ok) throw new Error(`Ekstra malzeme ekleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function editEkstraMalzemeOnSystemVariant(id, updated) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/materials/${id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    }).then((res) => {
      if (!res.ok) throw new Error(`Ekstra malzeme güncelleme başarısız: ${res.status}`);
      return res.json();
    });
  };
}

export function deleteEkstraMalzemeOnSystemVariant(id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-templates/materials/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`Ekstra malzeme silme başarısız: ${res.status}`);
    });
  };
}

/** (ESKİ MOCK UÇLAR)
 * Aşağıdaki localhost fonksiyonları muhtemelen eski/mock amaçlıydı.
 * Yine de .env ve token kuralına uydurmak istersen, gerçek API eşleşmeleri gerekli.
 * Bu fonksiyonları projede kullanmıyorsan kaldırmanı öneririm.
 */
export function editSistemOnApi(sistem_id, editedRow) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/systems/${sistem_id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedRow),
    }).then((r) => r.json());
  };
}
export function addSistemToApi(sistem) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/profiles/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sistem),
    });
  };
}
export function sellSistemOnApi(sistem_id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/systems/${sistem_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };
}

export function sellSystemVariantOnApi(sistem_id) {
  return (dispatch, getState) => {
    const token = _getToken(getState);
    return fetch(`${API_BASE_URL}/system-variants/${sistem_id}`, {
      method: "DELETE",
      headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
    })
      .then(() => dispatch(getSystemVariantsFromApi()))
      .catch((err) => console.log(err));
  };
}
