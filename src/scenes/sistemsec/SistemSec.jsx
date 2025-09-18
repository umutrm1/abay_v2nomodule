import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
  getSistemlerFromApi,                 // tüm sistemler (all)
  getSystemVariantsOfSystemFromApi,    // seçili sistemin varyantları
  // Foto GET aksiyonlarını sadece "return değeri" için kullanıyoruz (reducer'a yazsın yazmasın fark etmez)
  getSystemImageFromApi,
  getSystemVariantImageFromApi,
} from '@/redux/actions/actions_sistemler.js';

/** Spinner (senin verdiğin) */
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);
const MiniSpinner = () => (
  <div className="flex justify-center items-center w-full h-40">
    <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);
const SistemSec = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const navigate = useNavigate();

  // --- Listeler (fotoğraflar hariç) ---
  const sistemler = useSelector(state => state.getSistemlerFromApiReducer); // { items: [...] }
  const systemVariants = useSelector(state => state.systemVariantsOfSystem); // { items: [...] }

  // --- FOTOĞRAF CACHE (sadece component içinde) ---
  // Ekranın kullanacağı "id -> imageUrl" haritaları:
  const [sysImageUrls, setSysImageUrls] = useState({});      // systemId -> ObjectURL
  const [varImageUrls, setVarImageUrls] = useState({});      // variantId -> ObjectURL

  // Aynı id için ikinci kez GET atılmaması için promise cache:
  const sysImgPromisesRef = useRef(new Map());   // systemId -> Promise
  const varImgPromisesRef = useRef(new Map());   // variantId -> Promise

  // Oluşturulan ObjectURL'leri unmount'ta revoke etmek için:
  const sysObjUrlsRef = useRef(new Set());       // Set<string>
  const varObjUrlsRef = useRef(new Set());       // Set<string>

  // --- UI seçim/yükleme durumları ---
  const [selectedSistemId, setSelectedSistemId] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
const [sysImgLoading, setSysImgLoading] = useState({}); // systemId -> bool
const [varImgLoading, setVarImgLoading] = useState({}); // variantId -> boo
  // 1) İlk yüklemede tüm sistemleri getir
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSystems(true);
        await dispatch(getSistemlerFromApi(1, "", "all"));
      } finally {
        if (mounted) setLoadingSystems(false);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch]);

  // --- Sistem foto GET: her id için sadece 1 kez ---
const fetchSystemImageOnce = useCallback(async (systemId) => {
  if (sysImgPromisesRef.current.has(systemId)) {
    return sysImgPromisesRef.current.get(systemId);
  }
  if (sysImageUrls[systemId]) return;

  // BAŞLANGIÇ: Yükleniyor işaretini aç
  setSysImgLoading(prev => ({ ...prev, [systemId]: true }));

  const p = (async () => {
    try {
      const res = await dispatch(getSystemImageFromApi(systemId));
      if (res?.imageUrl) {
        sysObjUrlsRef.current.add(res.imageUrl);
        setSysImageUrls(prev => ({ ...prev, [systemId]: res.imageUrl }));
      }
    } catch {
      // foto yoksa sessiz geçiyoruz
    } finally {
      // BİTİŞ: Yükleniyor işaretini kapat + promise’ı sil
      setSysImgLoading(prev => ({ ...prev, [systemId]: false }));
      sysImgPromisesRef.current.delete(systemId);
    }
  })();

  sysImgPromisesRef.current.set(systemId, p);
  return p;
}, [dispatch, sysImageUrls]);
  // Sistemler değişince hepsi için (sadece eksik olanlar) GET tetikle
  useEffect(() => {
    const items = sistemler?.items || [];
    if (!items.length) return;
    items.forEach(s => {
      // state'te yoksa/yüklenmemişse getir
      if (!sysImageUrls[s.id]) fetchSystemImageOnce(s.id);
    });
  }, [sistemler?.items, sysImageUrls, fetchSystemImageOnce]);

  // 2) Sistem seçilince varyantları getir
  const handleSystemSelect = useCallback(async (sistemId) => {
    setSelectedSistemId(sistemId);
    setSelectedVariantId(null);
    try {
      setLoadingVariants(true);
      await dispatch(getSystemVariantsOfSystemFromApi(sistemId));
    } finally {
      setLoadingVariants(false);
    }
  }, [dispatch]);

const fetchVariantImageOnce = useCallback(async (variantId) => {
  if (varImgPromisesRef.current.has(variantId)) {
    return varImgPromisesRef.current.get(variantId);
  }
  if (varImageUrls[variantId]) return;

  setVarImgLoading(prev => ({ ...prev, [variantId]: true }));

  const p = (async () => {
    try {
      const res = await dispatch(getSystemVariantImageFromApi(variantId));
      if (res?.imageUrl) {
        varObjUrlsRef.current.add(res.imageUrl);
        setVarImageUrls(prev => ({ ...prev, [variantId]: res.imageUrl }));
      }
    } catch {
      // foto yoksa sessiz geç
    } finally {
      setVarImgLoading(prev => ({ ...prev, [variantId]: false }));
      varImgPromisesRef.current.delete(variantId);
    }
  })();

  varImgPromisesRef.current.set(variantId, p);
  return p;
}, [dispatch, varImageUrls]);

  // Varyant listesi değişince hepsi için (sadece eksikler) GET tetikle
  useEffect(() => {
    const vItems = systemVariants?.items || [];
    if (!vItems.length) return;
    vItems.forEach(v => {
      if (!varImageUrls[v.id]) fetchVariantImageOnce(v.id);
    });
  }, [systemVariants?.items, varImageUrls, fetchVariantImageOnce]);

  // 3) Variant seçimi → yönlendirme
  const handleVariantSelect = useCallback((variantId) => {
    setSelectedVariantId(variantId);
    navigate(`/sistemekle/${projectId}/${variantId}`);
  }, [navigate, projectId]);

  // 4) ObjectURL temizliği
  useEffect(() => {
    return () => {
      sysObjUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      varObjUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      sysObjUrlsRef.current.clear();
      varObjUrlsRef.current.clear();
    };
  }, []);

  return (
    <div className="p-5">
      <div className="w-full flex">
        <h1 className="text-3xl font-bold mb-4">Sistem Seç</h1>
        <button className="btn ml-auto" onClick={() => navigate(`/projeduzenle/${projectId}`)}>
          Projeye Dön
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl w-full min-h-300 h-full p-5 overflow-auto">

        {/* Sistemler Bölümü */}
        <section>
          {loadingSystems ? (
            <Spinner />
          ) : !sistemler?.items?.length ? (
            <div className="text-gray-600">Hiç Sistem Bulunmuyor</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sistemler.items.map((sistem) => {
                const imgUrl = sysImageUrls[sistem.id] || '/placeholder-system.png';
                const isSysLoading = !!sysImgLoading[sistem.id];
                return (
                  <div
                    key={sistem.id}
                    className={`bg-white w-80 h-70 rounded-2xl border p-4 flex flex-col items-center ${
                      selectedSistemId === sistem.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {/* Sistem Fotoğrafı — oran korunur, max width */}
<div className="mb-4 flex justify-center w-full">
  {isSysLoading ? (
    <MiniSpinner />
  ) : (
    <img
      src={imgUrl}
      alt={sistem.name}
      className="w-full max-w-70 max-h-40 h-auto object-contain rounded"

    />
  )}
</div>

                    <h3 className="text-xl font-semibold mb-2 mt-auto text-center">{sistem.name}</h3>

                    <button
                      onClick={() => handleSystemSelect(sistem.id)}
                      className="mt-auto bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 focus:outline-none"
                    >
                      Seç
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Variant’lar Bölümü */}
        {selectedSistemId && (
          <section>
            <h2 className="text-2xl font-bold mb-4 mt-5">Alt Sistem Seç</h2>

            {loadingVariants ? (
              <Spinner />
            ) : systemVariants?.items?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {systemVariants.items.map((variant) => {
                  const vImgUrl = varImageUrls[variant.id] || '/placeholder-variant.png';
                  const isVarLoading = !!varImgLoading[variant.id];
                  return (
                    <div
                      key={variant.id}
                      className={`bg-white w-80 h-70 rounded-2xl border p-4 flex flex-col items-center ${
                        selectedVariantId === variant.id ? 'border-green-500 shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      {/* Variant Fotoğrafı — oran korunur, max width */}
<div className="mb-4 flex justify-center w-full">
  {isVarLoading ? (
    <MiniSpinner />
  ) : (
    <img
      src={vImgUrl}
      alt={variant.name}
      className="w-full max-w-70 max-h-40 h-auto object-contain rounded"

    />
  )}
</div>

                      <h3 className="text-lg mt-auto font-medium mb-2 text-center">{variant.name}</h3>

                      <button
                        onClick={() => handleVariantSelect(variant.id)}
                        className="mt-auto bg-green-500 text-white px-4 py-2 rounded-2xl hover:bg-green-600 focus:outline-none"
                      >
                        Seç
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Bu sisteme ait hiç alt sistem bulunmuyor.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default SistemSec;
