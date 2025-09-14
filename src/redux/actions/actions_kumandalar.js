import * as actionTypes from "./actionTypes";

export function getKumandalarFromApiToReducer(payload) {
  return {
    type: actionTypes.GET_KUMANDALAR_FROM_API,
    payload: payload,
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Uygulamadaki (redux -> localStorage -> sessionStorage) önceliğiyle token’ı getirir */
function _getToken(getState) {
  const reduxToken = getState?.().auth?.token;
  if (reduxToken) return reduxToken;
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}


/**
 * 1) GET: Kumandaları API'den çek
 * - Varsayılanlar, örnek cURL’deki gibidir: q=selam, limit=5, page=1
 * - Başarılı olursa reducer’a basar (GET_KUMANDALAR_FROM_API)
 */
export function getKumandalarFromApi({ q = "selam", limit = 5, page = 1 } = {}) {
  return async (dispatch, getState) => {
    const token = _getToken(getState);
    const url = `${API_BASE_URL}/catalog/remotes?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // sunucunun döndürdüğü hatayı görünür kılalım
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumandalar getirilemedi (HTTP ${res.status}). ${errTxt}`);
    }

    const data = await res.json();
    dispatch(getKumandalarFromApiToReducer(data));
    return data;
  };
}

/**
 * 2) POST: Yeni kumanda ekle
 * - body: { kumanda_isim: string, price: number, kapasite: number }
 * - Başarılı olursa eklenen kaydı döndürür. İsterseniz ardından listeyi yenilemek için
 *   getKumandalarFromApi çağırabilirsiniz.
 */
export function addKumandaToApi({ kumanda_isim, price, kapasite }) {
  return async (dispatch, getState) => {
    const token = _getToken(getState);
    const url = `${API_BASE_URL}/catalog/remotes`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kumanda_isim,
        price,
        kapasite,
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda eklenemedi (HTTP ${res.status}). ${errTxt}`);
    }

    const created = await res.json();
    return created;
  };
}

/**
 * 3) DELETE: Kumandayı sil
 * - id: silinecek kaydın UUID’si
 * - Başarılı olursa 204/200 beklenir; response body olmayabilir.
 */
export function deleteKumandaOnApi(id) {
  return async (dispatch, getState) => {
    if (!id) throw new Error("Silmek için 'id' gerekli.");
    const token = _getToken(getState);
    const url = `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda silinemedi (HTTP ${res.status}). ${errTxt}`);
    }

    // bazı API'ler 204 No Content döndürür; tutarlı olmak için nothing döndürelim
    return true;
  };
}

/**
 * 4) PUT: Kumandayı düzenle
 * - id: düzenlenecek kaydın UUID’si
 * - body: { kumanda_isim, price, kapasite }
 * - Başarılı olursa güncellenmiş kaydı döndürür.
 */
export function editKumandaOnApi(id, { kumanda_isim, price, kapasite }) {
  return async (dispatch, getState) => {
    if (!id) throw new Error("Düzenlemek için 'id' gerekli.");
    const token = _getToken(getState);
    const url = `${API_BASE_URL}/catalog/remotes/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kumanda_isim,
        price,
        kapasite,
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Kumanda güncellenemedi (HTTP ${res.status}). ${errTxt}`);
    }

    const updated = await res.json();
    return updated;
  };
}
