// src/scenes/sistemler/SistemSec.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
  getSistemlerFromApi,                 // tüm sistemler (all)
  getSystemVariantsOfSystemFromApi,    // seçili sistemin varyantları
  // Foto GET aksiyonlarını sadece "return değeri" için kullanıyoruz (reducer'a yazsın yazmasın fark etmez)
  getSystemImageFromApi,
  getSystemVariantImageFromApi,
} from '@/redux/actions/actions_sistemler.js';
import AppButton from "@/components/ui/AppButton.jsx";

/** Spinner (temalı) */
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);
const MiniSpinner = () => (
  <div className="flex justify-center items-center w-full h-40">
    <div className="w-6 h-6 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
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
  const [sysImageUrls, setSysImageUrls] = useState({});      // systemId -> ObjectURL
  const [varImageUrls, setVarImageUrls] = useState({});      // variantId -> ObjectURL

  const sysImgPromisesRef = useRef(new Map());   // systemId -> Promise
  const varImgPromisesRef = useRef(new Map());   // variantId -> Promise

  const sysObjUrlsRef = useRef(new Set());       // Set<string>
  const varObjUrlsRef = useRef(new Set());       // Set<string>

  // --- UI seçim/yükleme durumları ---
  const [selectedSistemId, setSelectedSistemId] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loadingSystems, setLoadingSystems] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [sysImgLoading, setSysImgLoading] = useState({}); // systemId -> bool
  const [varImgLoading, setVarImgLoading] = useState({}); // variantId -> bool

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

  // --- SIRALAMALAR (sort_index’e göre) ---
  const sortedSystems = useMemo(() => {
    const arr = Array.isArray(sistemler?.items) ? [...sistemler.items] : [];
    return arr.sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
  }, [sistemler?.items]);

  const sortedVariants = useMemo(() => {
    const arr = Array.isArray(systemVariants?.items) ? [...systemVariants.items] : [];
    return arr.sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
  }, [systemVariants?.items]);

  // --- AKTİF FİLTRELER ---
  // İstek: section'larda is_active:false olanlar listelenmesin.
  // Burada "false olmayan" her şeyi (true, undefined, null) gösteriyoruz; yalnızca explicit false olanları gizliyoruz.
  const activeSortedSystems = useMemo(() => {
    return sortedSystems.filter(s => s?.is_active !== false);
  }, [sortedSystems]);

  const activeSortedVariants = useMemo(() => {
    return sortedVariants.filter(v => v?.is_active !== false);
  }, [sortedVariants]);

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
        // BİTİŞ
        setSysImgLoading(prev => ({ ...prev, [systemId]: false }));
        sysImgPromisesRef.current.delete(systemId);
      }
    })();

    sysImgPromisesRef.current.set(systemId, p);
    return p;
  }, [dispatch, sysImageUrls]);

  // Sistemler değişince (aktif olanlar için) eksik görselleri getir
  useEffect(() => {
    const items = activeSortedSystems || [];
    if (!items.length) return;
    items.forEach(s => {
      if (!sysImageUrls[s.id]) fetchSystemImageOnce(s.id);
    });
  }, [activeSortedSystems, sysImageUrls, fetchSystemImageOnce]);

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

  // Varyant listesi değişince (aktif olanlar için) eksik görselleri getir
  useEffect(() => {
    const vItems = activeSortedVariants || [];
    if (!vItems.length) return;
    vItems.forEach(v => {
      if (!varImageUrls[v.id]) fetchVariantImageOnce(v.id);
    });
  }, [activeSortedVariants, varImageUrls, fetchVariantImageOnce]);

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
    <div className="min-h-screen bg-background text-foreground p-5">
      <div className="w-full flex items-center gap-3">
        <h1 className="text-3xl font-bold mb-4">Sistem Seç</h1>
        <AppButton variant="gri" className="ml-auto" onClick={() => navigate(`/projeduzenle/${projectId}`)}>
          Projeye Dön
        </AppButton>
      </div>

      <div className="bg-card border border-border rounded-2xl w-full min-h-300 h-full p-5 overflow-auto">
        {/* Sistemler Bölümü */}
        <section>
          {loadingSystems ? (
            <Spinner />
          ) : !activeSortedSystems.length ? (
            <div className="text-muted-foreground">Hiç aktif Sistem bulunmuyor</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeSortedSystems.map((sistem) => {
                const imgUrl = sysImageUrls[sistem.id] || '/placeholder-system.png';
                const isSysLoading = !!sysImgLoading[sistem.id];
                const selected = selectedSistemId === sistem.id;
                return (
                  <div
                    key={sistem.id}
                    className={`bg-card w-80 h-70 rounded-2xl border p-4 flex flex-col items-center transition-shadow ${selected ? 'border-primary shadow-lg' : 'border-border'
                      }`}
                  >
                    {/* Sistem Fotoğrafı */}
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

                    <AppButton
                      className="mt-auto"
                      variant="kurumsalmavi"
                      onClick={() => handleSystemSelect(sistem.id)}
                    >
                      Seç
                    </AppButton>
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
            ) : activeSortedVariants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activeSortedVariants.map((variant) => {
                  const vImgUrl = varImageUrls[variant.id] || '/placeholder-variant.png';
                  const isVarLoading = !!varImgLoading[variant.id];
                  const selected = selectedVariantId === variant.id;
                  return (
                    <div
                      key={variant.id}
                      className={`bg-card w-80 h-70 rounded-2xl border p-4 flex flex-col items-center transition-shadow ${selected ? 'border-success shadow-lg' : 'border-border'
                        }`}
                    >
                      {/* Variant Fotoğrafı */}
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

                      <AppButton
                        className="mt-auto"
                        variant="kurumsalmavi"
                        onClick={() => handleVariantSelect(variant.id)}
                      >
                        Seç
                      </AppButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">Bu sisteme ait aktif alt sistem bulunmuyor.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default SistemSec;
