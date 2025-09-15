// src/redux/actions/actions_profiller.js
import * as actionTypes from "./actionTypes.js";
import { fetchWithAuth } from "./authFetch.js";
// .env'den taban URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export function getProfillerFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROFILLER_FROM_API, payload }
}
export function getProfilImageFromApiToReducer(payload) {
  return { type: actionTypes.GET_PROFIL_IMAGE_FROM_API, payload }
}

export function getProfillerFromApi(page = 1, q = "", limit = 5) {
  return async (dispatch) => {
    const params = new URLSearchParams({ limit: String(limit), page: String(page) })
    if (q) params.append("q", q)

    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles?${params.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
       dispatch
    )
    if (!res.ok) throw new Error(`Profil listesi alınamadı: ${res.status}`)
    const data = await res.json()
    dispatch(getProfillerFromApiToReducer(data))
    return data
  }
}

export function getProfilImageFromApi(profileId) {
  return async (dispatch,) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles/${profileId}/image`,
      { method: "GET", headers: { Accept: "image/png" } },
       dispatch
    )
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
    const ct = res.headers.get("content-type")
    if (!ct || !ct.includes("image/png")) throw new Error(`Expected image/png but got ${ct}`)
    const blob = await res.blob()
    const base64data = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
    })
    dispatch({ type: "GET_PROFIL_IMAGE_SUCCESS", payload: { profileId, imageData: base64data } })
    return base64data
  }
}

export function editProfillerOnApi(id, editedRow) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles/${id}`,
      {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(editedRow)
      },
       dispatch
    )
    if (!res.ok) throw new Error(`Güncelleme başarısız: ${res.status}`)
    return res.json()
  }
}

export function addProfillerToApi(addedRow) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(addedRow)
      },
       dispatch
    )
    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`)
    return res.json()
  }
}

export function sellProfillerOnApi(id) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles/${id}`,
      { method: "DELETE", headers: { Accept: "application/json" } },
       dispatch
    )
    if (!res.ok) throw new Error(`Silme başarısız: ${res.status}`)
    return true
  }
}

export function uploadProfilImageToApi(profileId, file) {
  return async (dispatch) => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles/${profileId}/image`,
      { method: "POST", headers: { Accept: "application/json" }, body: form },
       dispatch
    )
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Görsel yükleme başarısız: ${res.status} ${text}`)
    }
    return true
  }
}

export function deleteProfilImageFromApi(profileId) {
  return async (dispatch) => {
    const res = await fetchWithAuth(
      `${API_BASE_URL}/catalog/profiles/${profileId}/image`,
      { method: "DELETE", headers: { Accept: "*/*" } },
       dispatch
    )
    if (!res.ok) throw new Error(`Fotoğraf silinemedi: ${res.status}`)
    dispatch({ type: "DELETE_PROFIL_IMAGE_SUCCESS", payload: { profileId } })
    return true
  }
}
