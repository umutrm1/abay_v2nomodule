// src/redux/actions/authFetch.js  (mevcut dosyanın üstüne yaz)
import { LOGIN_SUCCESS, LOAD_USER_FAIL, LOGOUT } from "./actionTypes.js";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Aynı anda birden fazla refresh olmasın
let refreshInFlight = null;

function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
function setStoredToken(token) {
  // Token ilk neredeyse oraya yazalım (rememberMe bilgisini böyle koruruz)
  if (localStorage.getItem("token") !== null) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
}

async function doRefresh(dispatch) {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    // /auth/refresh endpoint’i cookie ile çalışır (withCredentials/credentials: 'include')
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { accept: "application/json" },
      credentials: "include",
      body: null, // backend boş body bekliyorsa (axios kullanan varyantta da null gönderiliyor)
    });

    if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const newToken = data.access_token || data.accessToken || data.token;
    if (!newToken) throw new Error("no access token in refresh payload");

    setStoredToken(newToken);
    // Redux’a başarılı login/refresh’i bildir
    dispatch?.({ type: LOGIN_SUCCESS, payload: newToken });
    return newToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function fetchWithAuth(url, options = {}, dispatch) {
  // 1) İlk deneme: mevcut token ile
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // CORS + cookie (refresh için önemli)
  });

  // 2) 401 ise → bir kez refresh dene, sonra isteği aynı paramlarla tekrar et
  if (res.status === 401) {
    try {
      const newToken = await doRefresh(dispatch);
      const headers2 = new Headers(options.headers || {});
      if (newToken) headers2.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(url, {
        ...options,
        headers: headers2,
        credentials: "include",
      });
    } catch (e) {
      // Refresh başarısız → store’u temizle ve kullanıcıyı dışarı al
      try {
        dispatch?.({ type: LOAD_USER_FAIL });
        dispatch?.({ type: LOGOUT });
      } catch {}
      // Orijinal 401’i geri döndürüyoruz; çağıran yer isterse yakalayıp mesaj verebilir
    }
  }

  return res;
}
