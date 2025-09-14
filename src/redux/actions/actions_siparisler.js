import * as actionTypes from "./actionTypes";

export function getSiparislerFromApiToReducer(payload) {
  return {
    type: actionTypes.GET_SIPARISLER_FROM_API,
    payload: payload,
  };
}

export function getSiparislerFromApi() {
  return async function (dispatch) {
    const url = "http://5.133.102.220/api/system-variants/";
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json",
        }
      });

      // HTTP hata kodu kontrolü
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      // Content-Type kontrolü
      const contentType = res.headers.get("content-type") || "";
      console.log("Gelen content-type:", contentType);

      // JSON’u parse edip dispatch et
      const data = await res.json();
      console.log("JSON alındı:", data);
      dispatch({ type: actionTypes.GET_SIPARISLER_FROM_API, payload: data });

    } catch (err) {
      console.error("Fetch hatası:", err);
      dispatch({ type: "FETCH_SIPARISLER_FAILURE", error: err });
    }
  };
}

export function editSiparisOnApi(siparisId, updatedSiparis) {
  return function (dispatch) {
    fetch(`http://localhost:3000/siparisler/${siparisId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSiparis)
    })
      .then(response => response.json())
      .then(data => {
        dispatch({ type: actionTypes.EDIT_SIPARIS_SUCCESS, payload: data });
        alert("Sipariş başarıyla güncellendi!");
      })
      .catch(err => console.error("Sipariş güncelleme hatası:", err));
  }
}
export function addSiparisToApi(addedRow) {
  return function (dispatch) { // dispatch'i burada kullanabiliriz
    fetch("http://localhost:3000/siparisler/", {
      method: "POST",
      // JSON gönderdiğimizi belirtmek önemlidir.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addedRow),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(savedSiparis => {
        console.log("Sipariş başarıyla API'ye kaydedildi:", savedSiparis);
        // İsteğe bağlı: Başarılı olduğunu belirten yeni bir action dispatch edilebilir.
        // dispatch({ type: "ADD_SIPARIS_SUCCESS", payload: savedSiparis });
      })
      .catch(err => {
        console.error("Sipariş eklenirken hata oluştu:", err);
        // İsteğe bağlı: Hata olduğunu belirten yeni bir action dispatch edilebilir.
        // dispatch({ type: "ADD_SIPARIS_FAILURE", payload: err.message });
      });
  };
}

export function deleteSiparisOnApi(siparisId) {
  return function (dispatch) {
    fetch("http://localhost:3000/siparisler/" + siparisId, {
      method: "DELETE",
    })
      .then(response => {
        if (response.ok) {
          // BAŞARILI OLURSA, REDUCER'A HABER VER!
          // Reducer'ın yakalayabilmesi için yeni bir action dispatch ediyoruz.
          // Payload olarak silinen siparişin ID'sini gönderiyoruz.
          dispatch({ type: actionTypes.DELETE_SIPARIS_FROM_API, payload: siparisId });
        } else {
          throw new Error("Sipariş silinemedi.");
        }
      })
      .catch(err => {
        console.error("Sipariş silinirken hata:", err);
      });
  };
}

export function getSiparisDetayFromApi(siparisId) {
  return function (dispatch) {
    fetch(`http://localhost:3002/siparisler/${siparisId}`)
      .then(response => response.json())
      .then(data => dispatch({ type: actionTypes.GET_SIPARIS_BY_ID_SUCCESS, payload: data }))
      .catch(err => console.error("Sipariş getirme hatası:", err));
  }
}

// Bu fonksiyon artık 3001 portundan, yani hazır birleştirilmiş veriyi çeker.
export function getSiparislerForTableFromApi() {
  return function (dispatch) {
    fetch("http://localhost:3001/siparisler") // DİKKAT: Port 3001
      .then(response => response.json())
      .then(data => dispatch({ type: actionTypes.GET_SIPARISLER_FOR_TABLE_SUCCESS, payload: data }))
      .catch(err => console.error("Tablo için siparişler getirilirken hata:", err));
  };
}

