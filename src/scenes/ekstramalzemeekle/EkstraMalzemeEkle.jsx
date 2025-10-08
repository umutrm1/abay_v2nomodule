// src/scenes/ekstramalzemeekle/EkstraMalzemeEkle.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Server-side listeleme (limit 5) — daha önce entegre ettiğimiz fonksiyonlar
import { getCamlarFromApi } from '@/redux/actions/actions_camlar.js';
import { getDigerMalzemelerFromApi } from '@/redux/actions/actions_diger_malzemeler.js';
import { getProfillerFromApi } from '@/redux/actions/actions_profiller.js';
import { getKumandalarFromApi } from '@/redux/actions/actions_kumandalar.js';
// Projeye ekstra ekleme aksiyonları
import {
  addExtraGlassToApi,
  addExtraMaterialToApi,
  addExtraProfileToApi,
  addExtraRemoteToApi
} from '@/redux/actions/actions_projeler.js';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Backend sayfalama objesi boşluğu
const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const EkstraMalzemeEkle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();

  // hangi bölüm?
  const [mode, setMode] = useState(null); // 'profil' | 'cam' | 'malzeme'
  const [notification, setNotification] = useState(null);

  // her tablo için ARAMA + SAYFA + loading
  const [profileSearch, setProfileSearch] = useState('');
  const [profilePage, setProfilePage] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [glassSearch, setGlassSearch] = useState('');
  const [glassPage, setGlassPage] = useState(1);
  const [loadingGlass, setLoadingGlass] = useState(false);

  const [otherSearch, setOtherSearch] = useState('');
  const [otherPage, setOtherPage] = useState(1);
  const [loadingOther, setLoadingOther] = useState(false);

  // satır içi inputlar (ekleme için)
  const [profilInputs, setProfilInputs] = useState({});
  const [camInputs, setCamInputs] = useState({});
  const [malzemeInputs, setMalzemeInputs] = useState({});

  // kumanda için arama/sayfa/loading
  const [kumandaSearch, setKumandaSearch] = useState('');
  const [kumandaPage, setKumandaPage] = useState(1);
  const [loadingKumanda, setLoadingKumanda] = useState(false);
  const [kumandaInputs, setKumandaInputs] = useState({});

  const [profilUnitPrices, setProfilUnitPrices] = useState({});
  const [camUnitPrices, setCamUnitPrices] = useState({});
  const [malzemeUnitPrices, setMalzemeUnitPrices] = useState({});
  const [kumandaUnitPrices, setKumandaUnitPrices] = useState({}); // Kumanda tablosu için
  // reducer’dan sayfalı objeleri al
  const profiller = useSelector(s => s.getProfillerFromApiReducer) || EMPTY_PAGE;
  const camlar = useSelector(s => s.getCamlarFromApiReducer) || EMPTY_PAGE;
  const digerMalzemeler = useSelector(s => s.getDigerMalzemerFromApiReducer || s.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;
  const kumandalar = useSelector(s => s.getKumandalarFromApiReducer) || EMPTY_PAGE;
  // Seçilen moda göre veri çek (server-side)
  useEffect(() => {
    if (mode === 'profil') {
      setLoadingProfile(true);
      Promise.resolve(dispatch(getProfillerFromApi(profilePage, profileSearch, 5)))
        .finally(() => setLoadingProfile(false));
    }
  }, [dispatch, mode, profilePage, profileSearch]);
  useEffect(() => {
    if (mode === 'kumanda') {
      setLoadingKumanda(true);
      Promise
        .resolve(dispatch(getKumandalarFromApi({ page: kumandaPage, q: kumandaSearch, limit: 5 })))
        .finally(() => setLoadingKumanda(false));
    }
  }, [dispatch, mode, kumandaPage, kumandaSearch]);
  useEffect(() => {
    if (mode === 'cam') {
      setLoadingGlass(true);
      Promise.resolve(dispatch(getCamlarFromApi(glassPage, glassSearch, 5)))
        .finally(() => setLoadingGlass(false));
    }
  }, [dispatch, mode, glassPage, glassSearch]);

  useEffect(() => {
    if (mode === 'malzeme') {
      setLoadingOther(true);
      Promise.resolve(dispatch(getDigerMalzemelerFromApi(otherPage, otherSearch, 5)))
        .finally(() => setLoadingOther(false));
    }
  }, [dispatch, mode, otherPage, otherSearch]);

  // bildirim
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // --- Ortak sayfalama barı (boyalardakiyle aynı) ---
  const Pager = ({ data, setPage }) => (
    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
      <button
        className="btn btn-sm"
        onClick={() => setPage(1)}
        disabled={data.page === 1}
        title="İlk sayfa"
      >
        « İlk
      </button>

      <button
        className="btn btn-sm"
        onClick={() => setPage(p => Math.max(1, (typeof p === 'number' ? p : data.page) - 1))}
        disabled={!data.has_prev}
        title="Önceki sayfa"
      >
        ‹ Önceki
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const val = parseInt(e.target.elements.pageNum.value, 10);
          if (!isNaN(val) && val >= 1 && val <= data.total_pages) setPage(val);
        }}
        className="flex items-center gap-1"
      >
        <input
          type="number"
          name="pageNum"
          min={1}
          max={data.total_pages}
          defaultValue={data.page}
          className="input input-bordered input-sm w-16 text-center"
        />
        <span className="text-sm">/ {data.total_pages}</span>
      </form>

      <button
        className="btn btn-sm"
        onClick={() => setPage(p => (typeof p === 'number' ? p + 1 : data.page + 1))}
        disabled={!data.has_next}
        title="Sonraki sayfa"
      >
        Sonraki ›
      </button>

      <button
        className="btn btn-sm"
        onClick={() => setPage(data.total_pages)}
        disabled={data.page === data.total_pages || data.total_pages <= 1}
        title="Son sayfa"
      >
        Son »
      </button>
    </div>
  );

  // --- Ekleme handler’ları ---
  const onAddProfile = useCallback((profil) => {
    const data = profilInputs[profil.id] || {};
    const chosenUnitPrice = Number(
      (profilUnitPrices?.[profil.id] ?? getApiUnitPrice(profil)) || 0
    );
    dispatch(addExtraProfileToApi(projectId, {
      project_id: projectId,
      profile_id: profil.id,
      cut_length_mm: Number(data.cut_length_mm || 0),
      cut_count: Number(data.cut_count || 0),
      unit_price: chosenUnitPrice,
    }))
      .then(() => {
        showNotification('Profil başarıyla eklendi');
        setProfilInputs(prev => {
          const next = { ...prev };
          delete next[profil.id];
          return next;
        });
      })
      .catch(() => showNotification('Profil eklenirken hata oluştu'));
  }, [dispatch, profilInputs, projectId, profilUnitPrices]);

  const onAddGlass = useCallback((cam) => {
    const data = camInputs[cam.id] || {};
    const chosenUnitPrice = Number(
      (camUnitPrices?.[cam.id] ?? getApiUnitPrice(cam)) || 0
    );
    dispatch(addExtraGlassToApi(projectId, {
      project_id: projectId,
      glass_type_id: cam.id,
      width_mm: Number(data.width_mm || 0),
      height_mm: Number(data.height_mm || 0),
      count: Number(data.count || 0),
      unit_price: chosenUnitPrice,
    }))
      .then(() => {
        showNotification('Cam başarıyla eklendi');
        setCamInputs(prev => {
          const next = { ...prev };
          delete next[cam.id];
          return next;
        });
      })
      .catch(() => showNotification('Cam eklenirken hata oluştu'));
  }, [dispatch, camInputs, projectId, camUnitPrices]);

  const onAddOther = useCallback((m) => {
    const data = malzemeInputs[m.id] || {};
    const chosenUnitPrice = Number(
      ((malzemeInputs[m.id]?.unit_price) ?? getApiUnitPrice(m)) || 0
    );
    dispatch(addExtraMaterialToApi(projectId, {
      project_id: projectId,
      material_id: m.id,
      count: Number(data.count || 0),
      cut_length_mm: (m.hesaplama_turu === 'adetli')
        ? 0
        : Number(data.size_input_text || 0),
      unit_price: chosenUnitPrice,
      pdf: {
        "camCiktisi": true,
        "profilAksesuarCiktisi": true,
        "boyaCiktisi": true,
        "siparisCiktisi": true,
        "optimizasyonDetayliCiktisi": true,
        "optimizasyonDetaysizCiktisi": true
      }
    }))
      .then(() => {
        showNotification('Malzeme başarıyla eklendi');
        setMalzemeInputs(prev => {
          const next = { ...prev };
          delete next[m.id];
          return next;
        });
      })
      .catch(() => showNotification('Malzeme eklenirken hata oluştu'));
  }, [dispatch, malzemeInputs, projectId]);



  const onAddRemote = useCallback((remote) => {
    const data = kumandaInputs[remote.id] || {};
    const adet = Number(data.count || 0);
    const chosenUnitPrice = Number(
      (kumandaUnitPrices[remote.id] ?? getApiUnitPrice(remote)) || 0
    );
    dispatch(addExtraRemoteToApi(projectId, {
      project_id: projectId,
      remote_id: remote.id,
      count: adet,
      unit_price: chosenUnitPrice, // örnekteki gibi sabit; istersen API'den gelen price'a bağlayabilirsin
      pdf: {
        camCiktisi: true,
        profilAksesuarCiktisi: true,
        boyaCiktisi: true,
        siparisCiktisi: true,
        optimizasyonDetayliCiktisi: true,
        optimizasyonDetaysizCiktisi: true
      }
    }))
      .then(() => {
        showNotification('Kumanda başarıyla eklendi');
        setKumandaInputs(prev => {
          const next = { ...prev };
          delete next[remote.id];
          return next;
        });
      })
      .catch(() => showNotification('Kumanda eklenirken hata oluştu'));
  }, [dispatch, kumandaInputs, projectId]);




  const getApiUnitPrice = (item) =>
    item?.unit_price ?? item?.price ?? item?.unitPrice ?? item?.fiyat ?? 0;
  return (
    <div className="p-5 text-foreground">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Ekstra Malzeme Ekle</h1>
        <button
          onClick={() => navigate(`/projeduzenle/${projectId}`)}
          className="btn btn-sm ml-auto"
        >
          Projeye Dön
        </button>
      </div>

      {notification && (
        <div className="alert alert-success shadow-lg mb-4">
          <div><span>{notification}</span></div>
        </div>
      )}

      {/* seçim kartları — görünüş aynı */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => { setMode('profil'); setProfilePage(1); }} className="card btn bg-base-100 shadow p-4 hover:bg-primary/10">
          <h2 className="text-lg  font-semibold">Profil Ekle</h2>
        </button>
        <button onClick={() => { setMode('cam'); setGlassPage(1); }} className="card btn bg-base-100 shadow p-4 hover:bg-primary/10">
          <h2 className="text-lg font-semibold">Cam Ekle</h2>
        </button>
        <button onClick={() => { setMode('malzeme'); setOtherPage(1); }} className="card btn bg-base-100 shadow p-4 hover:bg-primary/10">
          <h2 className="text-lg font-semibold">Malzeme Ekle</h2>
        </button>
        <button onClick={() => { setMode('kumanda'); setKumandaPage(1); }} className="card btn bg-base-100 shadow p-4 hover:bg-primary/10">
          <h2 className="text-lg font-semibold">Kumanda Ekle</h2>
        </button>
      </div>

      {!mode ? null : (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            {/* Her tabloya ayrı arama inputu */}
            {mode === 'profil' && (
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => { setProfileSearch(e.target.value); setProfilePage(1); }}
                placeholder="Profil ara..."
                className="input input-bordered w-full max-w-md"
              />
            )}
            {mode === 'cam' && (
              <input
                type="text"
                value={glassSearch}
                onChange={(e) => { setGlassSearch(e.target.value); setGlassPage(1); }}
                placeholder="Cam ara..."
                className="input input-bordered w-full max-w-md"
              />
            )}
            {mode === 'malzeme' && (
              <input
                type="text"
                value={otherSearch}
                onChange={(e) => { setOtherSearch(e.target.value); setOtherPage(1); }}
                placeholder="Malzeme ara..."
                className="input input-bordered w-full max-w-md"
              />
            )}
            {mode === 'kumanda' && (
              <input
                type="text"
                value={kumandaSearch}
                onChange={(e) => { setKumandaSearch(e.target.value); setKumandaPage(1); }}
                placeholder="Kumanda ara..."
                className="input input-bordered w-full max-w-md"
              />
            )}
            <button onClick={() => setMode(null)} className="btn btn-sm ml-4">Geri</button>
          </div>

          {/* PROFİLLER */}
          {mode === 'profil' && (
            <div className="w-full">
              <table className="table w-full">
                <thead >
                  <tr>
                    <th>Profil Kodu</th>
                    <th>Profil Adı</th>
                    <th>Kesim Ölçüsü (mm)</th>
                    <th>Kesim Adedi</th>
                    <th>Birim Fiyat</th>
                    <th className="text-right">Ekle</th>
                  </tr>
                </thead>
                {loadingProfile ? (
                  <tbody><tr><td colSpan={5}><Spinner /></td></tr></tbody>
                ) : (
                  <tbody>
                    {(profiller.items ?? []).map(profil => (
                      <tr className="border border-border" key={profil.id}>
                        <td>{profil.profil_kodu}</td>
                        <td>{profil.profil_isim}</td>
                        <td>
                          <input
                            type="number"
                            placeholder="mm"
                            className="input input-sm input-bordered w-24"
                            value={profilInputs[profil.id]?.cut_length_mm || ''}
                            onChange={e =>
                              setProfilInputs(prev => ({
                                ...prev,
                                [profil.id]: { ...(prev[profil.id] || {}), cut_length_mm: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Adet"
                            className="input input-sm input-bordered w-20"
                            value={profilInputs[profil.id]?.cut_count || ''}
                            onChange={e =>
                              setProfilInputs(prev => ({
                                ...prev,
                                [profil.id]: { ...(prev[profil.id] || {}), cut_count: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-24"
                              value={
                                profilUnitPrices[profil.id] ??
                                getApiUnitPrice(profil) // açılışta API fiyatı
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                setProfilUnitPrices((prev) => ({ ...prev, [profil.id]: v }));
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() =>
                                setProfilUnitPrices((prev) => ({
                                  ...prev,
                                  [profil.id]: getApiUnitPrice(profil),
                                }))
                              }
                            >
                              Sıfırla
                            </button>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onAddProfile(profil)}
                          >
                            Ekle
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!profiller.items || profiller.items.length === 0) && (
                      <tr><td colSpan={5} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                    )}
                  </tbody>
                )}
              </table>

              {/* sayfalama */}
              <Pager data={profiller || EMPTY_PAGE} setPage={setProfilePage} />
            </div>
          )}

          {/* CAMLAR */}
          {mode === 'cam' && (
            <div className="w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Cam İsmi</th>
                    <th>Genişlik (mm)</th>
                    <th>Yükseklik (mm)</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th className="text-right">Ekle</th>
                  </tr>
                </thead>
                {loadingGlass ? (
                  <tbody><tr><td colSpan={5}><Spinner /></td></tr></tbody>
                ) : (
                  <tbody>
                    {(camlar.items ?? []).map(cam => (
                      <tr className="border border-border" key={cam.id}>
                        <td>{cam.cam_isim}</td>
                        <td>
                          <input
                            type="number"
                            placeholder='mm'
                            className="input input-sm input-bordered w-20"
                            value={camInputs[cam.id]?.width_mm || ''}
                            onChange={e =>
                              setCamInputs(prev => ({
                                ...prev,
                                [cam.id]: { ...(prev[cam.id] || {}), width_mm: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder='mm'
                            className="input input-sm input-bordered w-20"
                            value={camInputs[cam.id]?.height_mm || ''}
                            onChange={e =>
                              setCamInputs(prev => ({
                                ...prev,
                                [cam.id]: { ...(prev[cam.id] || {}), height_mm: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder='Adet'
                            className="input input-sm input-bordered w-16"
                            value={camInputs[cam.id]?.count || ''}
                            onChange={e =>
                              setCamInputs(prev => ({
                                ...prev,
                                [cam.id]: { ...(prev[cam.id] || {}), count: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-24"
                              value={
                                camUnitPrices[cam.id] ??
                                getApiUnitPrice(cam)
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                setCamUnitPrices((prev) => ({ ...prev, [cam.id]: v }));
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() =>
                                setCamUnitPrices((prev) => ({
                                  ...prev,
                                  [cam.id]: getApiUnitPrice(cam),
                                }))
                              }
                            >
                              Sıfırla
                            </button>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onAddGlass(cam)}
                          >
                            Ekle
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!camlar.items || camlar.items.length === 0) && (
                      <tr><td colSpan={5} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                    )}
                  </tbody>
                )}
              </table>

              {/* sayfalama */}
              <Pager data={camlar || EMPTY_PAGE} setPage={setGlassPage} />
            </div>
          )}

          {/* DİĞER MALZEMELER */}
          {mode === 'malzeme' && (
            <div className="w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Adet</th>
                    <th>Kesim Ölçüsü</th>
                    <th>Birim Fiyat</th>
                    <th className="text-right">Ekle</th>
                  </tr>
                </thead>
                {loadingOther ? (
                  <tbody><tr><td colSpan={4}><Spinner /></td></tr></tbody>
                ) : (
                  <tbody>
                    {(digerMalzemeler.items ?? []).map(m => (
                      <tr className="border border-border" key={m.id}>
                        <td>{m.diger_malzeme_isim}</td>
                        <td>
                          <input
                            type="number"
                            placeholder='Adet'
                            className="input input-sm input-bordered w-20"
                            value={malzemeInputs[m.id]?.count || ''}
                            onChange={e =>
                              setMalzemeInputs(prev => ({
                                ...prev,
                                [m.id]: { ...(prev[m.id] || {}), count: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          {m.hesaplama_turu === 'olculu' ? (
                            <input
                              type="number"
                              placeholder="mm"
                              className="input input-sm input-bordered w-40"
                              value={malzemeInputs[m.id]?.size_input_text || ''}
                              onChange={(e) =>
                                setMalzemeInputs((prev) => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), size_input_text: e.target.value }
                                }))
                              }
                            />
                          ) : (
                            // 'adetli' ise input gizlenir; görsel olarak kısa bir ibare gösterilebilir
                            <span className="text-muted-foreground">Adetli Malzeme</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-24"
                              value={
                                (malzemeInputs[m.id]?.unit_price) ?? getApiUnitPrice(m) // açılışta API fiyatı
                              }
                              onChange={(e) => {
                                const v = e.target.value; // string gelir
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), unit_price: v }
                                }));
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() =>
                                setMalzemeInputs(prev => ({
                                  ...prev,
                                  [m.id]: { ...(prev[m.id] || {}), unit_price: getApiUnitPrice(m) }
                                }))
                              }
                            >
                              Sıfırla
                            </button>

                          </div>
                        </td>

                        <td className="text-right">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onAddOther(m)}
                          >
                            Ekle
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!digerMalzemeler.items || digerMalzemeler.items.length === 0) && (
                      <tr><td colSpan={4} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                    )}
                  </tbody>
                )}
              </table>

              {/* sayfalama */}
              <Pager data={digerMalzemeler || EMPTY_PAGE} setPage={setOtherPage} />
            </div>
          )}
          {mode === 'kumanda' && (
            <div className="w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Kumanda İsmi</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th className="text-right">Ekle</th>
                  </tr>
                </thead>

                {loadingKumanda ? (
                  <tbody><tr><td colSpan={3}><Spinner /></td></tr></tbody>
                ) : (
                  <tbody>
                    {(kumandalar.items ?? []).map(remote => (
                      <tr className="border border-border" key={remote.id}>
                        <td>{remote.kumanda_isim || remote.isim || remote.name}</td>
                        <td>
                          <input
                            type="number"
                            placeholder="Adet"
                            className="input input-sm input-bordered w-20"
                            value={kumandaInputs[remote.id]?.count || ''}
                            onChange={e =>
                              setKumandaInputs(prev => ({
                                ...prev,
                                [remote.id]: { ...(prev[remote.id] || {}), count: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className="input input-sm input-bordered w-24"
                              value={
                                kumandaUnitPrices[remote.id] ??
                                getApiUnitPrice(remote)
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                setKumandaUnitPrices(prev => ({ ...prev, [remote.id]: v }));
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-xs"
                              onClick={() =>
                                setKumandaUnitPrices(prev => ({
                                  ...prev,
                                  [remote.id]: getApiUnitPrice(remote)
                                }))
                              }
                            >
                              Sıfırla
                            </button>
                          </div>
                        </td>

                        <td className="text-right">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onAddRemote(remote)}
                          >
                            Ekle
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(!kumandalar.items || kumandalar.items.length === 0) && (
                      <tr><td colSpan={3} className="text-center text-muted-foreground py-6">Kayıt yok</td></tr>
                    )}
                  </tbody>
                )}
              </table>

              {/* sayfalama */}
              <Pager data={kumandalar || EMPTY_PAGE} setPage={setKumandaPage} />
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default EkstraMalzemeEkle;
