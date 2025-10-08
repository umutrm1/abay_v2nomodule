// src/scenes/projeekle/ProjeDuzenle.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import DialogMusteriSec from '@/scenes/projeekle/DialogMusteriSec.jsx';
import DialogCamRenkSec from '@/scenes/projeekle/DialogCamRenkSec.jsx';
import DialogProfilRenkSec from '@/scenes/projeekle/DialogProfilRenkSec.jsx';

import * as actions_projeler from '@/redux/actions/actions_projeler.js';
import { getProfilImageFromApi } from '@/redux/actions/actions_profiller.js';
import Header from '@/components/mycomponents/Header.jsx';
import SistemTable from './SistemTable.jsx';
import MalzemeTable from '@/scenes/projeekle/MalzemeTable.jsx';
import { ReactComponent as Paintbrush } from '../../icons/paintbrush.svg';
import { ReactComponent as User } from '../../icons/user_v2.svg';
import { generateCamCiktisiPdf } from './pdf/pdfGlass.js';
import { generateOrderPdf } from './pdf/pdfOrder.js';
import { generatePaintPdf } from './pdf/pdfPaint.js';
import { generateOptimizeProfilesPdf } from './pdf/pdfOptimizeProfiles.js';
import { getPdfBrandByKey, getPdfTitleByKey } from '@/redux/actions/actionsPdf.js';

// ✅ Tema uyumlu spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

const ProjeDuzenle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ Global sayfa spinner state
  const [loading, setLoading] = useState(false);

  // Orijinal state
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [showOptChoice, setShowOptChoice] = useState(false);

  // ✅ Dialog açık/kapalı state'leri
  const [openMusteri, setOpenMusteri] = useState(false);
  const [openCamRenk, setOpenCamRenk] = useState(false);
  const [openProfilRenk, setOpenProfilRenk] = useState(false);

  // Seçimler
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGlassColor, setSelectedGlassColor] = useState('');
  const [selectedProfileColor, setSelectedProfileColor] = useState('');
  const [selectedGlassName, setSelectedGlassName] = useState('');
  const [selectedProfileName, setSelectedProfileName] = useState('');
  const [pressPrice, setPressPrice] = useState(0);
  const [paintedPrice, setPaintedPrice] = useState(0);
  const [paintStatus, setPaintStatus] = useState('string');
  const [glassStatus, setGlassStatus] = useState('string');
  const [productionStatus, setProductionStatus] = useState('string');

  // durum listeleri (UI'da dropdown'a basmak için)
  const BOYA_DURUMLAR = ['Boyanacak', 'Boyada', 'Boyadan Geldi'];
  const CAM_DURUMLAR = ['Cam Çekildi', 'Cam Geldi', 'Cam Çekilecek'];
  const URETIM_DURUMLAR = ['Üretimde', 'Sevk Edildi'];

  // "string" veya boş değerleri normalize eden yardımcı
  const normalizeStatus = (s) => (s && s !== 'string' ? s : 'string');
  const proje = useSelector(state => state.getProjeFromApiReducer) || null;
  const requirements = useSelector(state => state.getProjeRequirementsFromApiReducer) || {
    systems: [],
    extra_requirements: [],
    extra_profiles: [],
    extra_glasses: [],
    extra_remotes: [],
  };

  // ✅ İlk yüklemelerde ilgili API çağrılarını spinner ile sarmala
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(actions_projeler.getProjeFromApi(id));
        await dispatch(actions_projeler.getProjeRequirementsFromApi(id));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  // Proje temel bilgileri
  useEffect(() => {
    if (!proje) return;
    setProjectCode(proje.project_kodu || '');
    setProjectName(proje.project_name || '');

    if (proje.created_at) {
      const d = new Date(proje.created_at);
      if (!isNaN(d.getTime())) {
        setProjectDate(
          `${String(d.getDate()).padStart(2, '0')}/` +
          `${String(d.getMonth() + 1).padStart(2, '0')}/` +
          d.getFullYear()
        );
      } else {
        setProjectDate('');
      }
    } else {
      setProjectDate('');
    }

    // ✅ Proje yüklenince mevcut press/boyalı fiyatları state'e bas
    setPressPrice(proje?.press_price ? proje.press_price : 0);
    setPaintedPrice(proje?.painted_price ? proje.painted_price : 0);
    setPaintStatus(normalizeStatus(proje?.paint_status));
    setGlassStatus(normalizeStatus(proje?.glass_status));
    setProductionStatus(normalizeStatus(proje?.production_status));
  }, [proje]);

  const handleNumberChange = (setter) => (e) => {
    const v = e.target.value;
    if (v === '') {
      setter(0);
    } else {
      const n = parseFloat(v);
      setter(Number.isFinite(n) ? n : 0);
    }
  };

  const handleNumberBlur = (val, setter) => {
    if (val === 0 || val === '' || isNaN(val)) {
      setter(0);
    }
  };

  // Requirements seçili değerleri
  useEffect(() => {
    if (!requirements) return;
    if (requirements.glass_color) {
      setSelectedGlassColor(requirements.glass_color.id);
      setSelectedGlassName(requirements.glass_color.name || '');
    }
    if (requirements.profile_color) {
      setSelectedProfileColor(requirements.profile_color.id);
      setSelectedProfileName(requirements.profile_color.name || '');
    }
    if (requirements.customer) {
      setSelectedCustomer(requirements.customer);
    }
  }, [requirements]);

  // ✅ Kaydetme işlemini spinner ile sarmala
  const handleSave = async () => {
    try {
      setLoading(true);
      const profileId = selectedProfileColor === '' ? null : selectedProfileColor;
      const glassId = selectedGlassColor === '' ? null : selectedGlassColor;
      await dispatch(actions_projeler.editProjeOnApi(id, {
        project_kodu: projectCode,
        customer_id: selectedCustomer?.id,
        project_name: projectName,
        profile_color_id: profileId,
        glass_color_id: glassId,
        press_price: pressPrice,
        painted_price: paintedPrice,
        paint_status: paintStatus,         
        glass_status: glassStatus,         
        production_status: productionStatus
      }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Global spinner
  if (loading) return <Spinner />;

  return (
    <div className="grid grid-rows-[60px_auto_1fr] h-full">
      {/* Üst Başlık ve Butonlar */}
      {/* Üst Başlık ve Butonlar */}
      <div className="flex items-center justify-between px-5">
        <Header title={`${projectCode} – ${projectName}`} />
        <div className="flex space-x-2 items-start">
          {/* Profil Aksesuar Listesi (Aynen kalsın) */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
              Profil Aksesuar Listesi
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-52"
            >
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a onClick={() => navigate(`/profilaksesuar/edit/${id}?mode=press`)}>Press</a>
              </li>
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a onClick={() => navigate(`/profilaksesuar/edit/${id}?mode=painted`)}>Boyalı</a>
              </li>
            </ul>
          </div>

          {/* BOYA DROPDOWN */}
          <div className="inline-block">
            <div className="dropdown ">
              <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                Boya
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-60"
              >
                {/* Boya Çıktısı */}
                <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                  <a
                    onClick={async () => {
                      const brandCfgold = await dispatch(getPdfBrandByKey());
                      const brandCfg = brandCfgold.config_json;
                      const paintCfgold = await dispatch(getPdfTitleByKey('pdf.paint0'));
                      const paintCfg = paintCfgold.config_json;
                      await generatePaintPdf(
                        { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                        paintCfg,
                        brandCfg
                      );
                    }}
                  >
                    Boya Çıktısı
                  </a>
                </li>

                {/* Durum Seçenekleri */}
                {BOYA_DURUMLAR.map((d) => {
                  const isActive = paintStatus === d;
                  return (
                    <li key={d} className={`${isActive ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
                      <button
                        disabled={isActive}
                        onClick={() => !isActive && setPaintStatus(d)}
                        className="text-left"
                      >
                        {d}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>

          {/* CAM DROPDOWN */}
          <div className="inline-block">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                Cam
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-60"
              >
                {/* Cam Çıktısı */}
                <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                  <a
                    onClick={async () => {
                      const brandCfgold = await dispatch(getPdfBrandByKey());
                      const brandCfg = brandCfgold.config_json;
                      const glassCfgold = await dispatch(getPdfTitleByKey('pdf.glass0'));
                      const glassCfg = glassCfgold.config_json;

                      await generateCamCiktisiPdf(
                        { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                        glassCfg,
                        brandCfg
                      );
                    }}
                  >
                    Cam Çıktısı
                  </a>
                </li>

                {/* Durum Seçenekleri */}
                {CAM_DURUMLAR.map((d) => {
                  const isActive = glassStatus === d;
                  return (
                    <li key={d} className={`${isActive ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
                      <button
                        disabled={isActive}
                        onClick={() => !isActive && setGlassStatus(d)}
                        className="text-left"
                      >
                        {d}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ÜRETİM DROPDOWN */}
          <div className="inline-block">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                Üretim
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-60"
              >
                {/* Üretim Çıktısı */}
                <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                  <a
                    onClick={async () => {
                      const brandCfgold = await dispatch(getPdfBrandByKey());
                      const brandCfg = brandCfgold.config_json;
                      const orderCfgold = await dispatch(getPdfTitleByKey('pdf.order0'));
                      const orderCfg = orderCfgold.config_json;
                      await generateOrderPdf(
                        { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                        orderCfg,
                        brandCfg
                      );
                    }}
                  >
                    Üretim Çıktısı
                  </a>
                </li>

                {/* Durum Seçenekleri */}
                {URETIM_DURUMLAR.map((d) => {
                  const isActive = productionStatus === d;
                  return (
                    <li key={d} className={`${isActive ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'}`}>
                      <button
                        disabled={isActive}
                        onClick={() => !isActive && setProductionStatus(d)}
                        className="text-left"
                      >
                        {d}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>

          {/* Optimizasyon dropdown (seninki olduğu gibi kalsın) */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn bg-blue-600 hover:bg-blue-700 text-white">
              Optimizasyon
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-52"
            >
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a
                  onClick={async () => {
                    const brandCfgold = await dispatch(getPdfBrandByKey());
                    const brandCfg = brandCfgold.config_json;
                    const detayliCfgold = await dispatch(getPdfTitleByKey('pdf.optimize.detayli0'));
                    const detayliCfg = detayliCfgold.config_json;
                    await generateOptimizeProfilesPdf(
                      { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                      'detayli',
                      detayliCfg,
                      brandCfg
                    );
                  }}
                >
                  Detaylı
                </a>
              </li>
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a
                  onClick={async () => {
                    const brandCfgold = await dispatch(getPdfBrandByKey());
                    const brandCfg = brandCfgold.config_json;
                    const detaysizCfgold = await dispatch(getPdfTitleByKey('pdf.optimize.detaysiz0'));
                    const detaysizCfg = detaysizCfgold.config_json;
                    await generateOptimizeProfilesPdf(
                      { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                      'detaysiz',
                      detaysizCfg,
                      brandCfg
                    );
                  }}
                >
                  Detaysız
                </a>
              </li>
            </ul>
          </div>

          {/* Kaydet */}
          <button
            className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
            onClick={handleSave}
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* --- ÖZET DURUM SATIRI --- */}


      {/* Ana içerik */}
      <div className="bg-card text-foreground w-full border border-border rounded-2xl p-5 h-full flex flex-col">
        {(() => {
          const show = (s) => (s === 'string' ? 'Durum Belirtilmedi' : s);
          return (
            <div className="border mb-5 border-border rounded-2xl h-15 items-center text-foreground px-4 py-2 flex justify-between flex-wrap gap-x-6 gap-y-2">
              <div className="font-semibold ml-10">Boya Durum: {show(paintStatus)}</div>

              <div className="font-semibold md:ml-10">Cam Durum: {show(glassStatus)}</div>

              <div className="font-semibold md:ml-10 mr-10">Üretim Durum: {show(productionStatus)}</div>
            </div>
          );
        })()}
        {/* Proje Bilgileri */}
        <div className="border border-border justify-center rounded-2xl h-20 flex">
          <div className="w-1/3 font-semibold flex items-center p-4">
            Proje No:
            <div className="flex items-stretch ml-2">
              <input
                type="text"
                value={projectCode}
                onChange={e => setProjectCode(e.target.value)}
                className="input input-bordered rounded-r w-full max-w-xs"
              />
            </div>
          </div>

          <div className="w-1/3 justify-center font-semibold flex items-center p-4">
            Proje Adı:
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="input input-bordered ml-2 w-full max-w-xs"
            />
          </div>

          <div className="w-1/3 justify-center font-semibold flex items-center p-4">
            Proje Tarihi:
            <input
              type="text"
              value={projectDate}
              readOnly
              className="input input-bordered ml-2 w-32"
            />
          </div>
        </div>

        <div className="border border-border mt-5 rounded-2xl flex h-20">
          <div className="w-1/2 font-semibold flex items-center justify-center p-4">
            Profil Press Fiyatı:
            <div className="flex items-stretch ml-2">
              <input
                type="number"
                step="0.01"
                value={pressPrice === 0 ? '' : pressPrice}
                onChange={handleNumberChange(setPressPrice)}
                onBlur={() => handleNumberBlur(pressPrice, setPressPrice)}
                placeholder="Press Profil Fiyatı Giriniz.."
                className="input input-bordered rounded-r w-full max-w-xs"
              />
            </div>
          </div>

          <div className="w-1/2 font-semibold flex justify-center items-center p-4">
            Profil Boyalı Fiyatı:
            <input
              type="number"
              step="0.01"
              value={paintedPrice === 0 ? '' : paintedPrice}
              onChange={handleNumberChange(setPaintedPrice)}
              onBlur={() => handleNumberBlur(paintedPrice, setPaintedPrice)}
              placeholder="Boyalı Profil Fiyatı Giriniz.."
              className="input input-bordered ml-2 w-full max-w-xs"
            />
          </div>
        </div>

        {/* Renk & Müşteri */}
        <div className="border border-border mt-5 rounded-2xl flex h-20">
          <div className="w-2/3 flex items-center p-2 space-x-6">
            <Paintbrush className="w-10" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Cam Rengi</div>
              <div className="flex items-center gap-3">
                <div className="truncate">
                  {selectedGlassName || requirements?.glass_color?.name || 'Henüz Seçilmedi'}
                </div>
                <button
                  className="btn btn-sm ml-auto bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setOpenCamRenk(true)}
                >
                  Seç
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="font-semibold mb-1">Profil Rengi</div>
              <div className="flex items-center gap-3">
                <div className="truncate">
                  {selectedProfileName || requirements?.profile_color?.name || 'Henüz Seçilmedi'}
                </div>
                <button
                  className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setOpenProfilRenk(true)}
                >
                  Seç
                </button>
              </div>
            </div>
          </div>

          <div className="w-1/3 flex items-center p-2">
            <User className="w-10 ml-2 mr-2" />
            <div className="ml-2 flex-1">
              <div className="font-semibold">Müşteri</div>
              <div className="truncate">
                {selectedCustomer
                  ? `${selectedCustomer.company_name} (${selectedCustomer.name})`
                  : (requirements?.customer
                    ? `${requirements.customer.company_name} (${requirements.customer.name})`
                    : 'Henüz Seçilmedi')}
              </div>
            </div>
            <button
              onClick={() => setOpenMusteri(true)}
              className="btn btn-sm mr-10 bg-blue-600 text-white hover:bg-blue-700"
            >
              Seç
            </button>
          </div>
        </div>

        {/* Tablolar */}
        <div className="mb-5">
          <SistemTable systems={requirements.systems} />
        </div>

        <MalzemeTable
          extraProfiles={requirements.extra_profiles}
          extraGlasses={requirements.extra_glasses}
          extraRequirements={requirements.extra_requirements}
          extraRemotes={requirements.extra_remotes}
        />

        {/* Alt Butonlar */}
        <div className="flex justify-end mt-4 space-x-4">
          <button
            className="btn rounded-xl w-40 bg-blue-700 text-white"
            onClick={() => navigate(`/ekstramalzemeekle/${id}`)}
          >
            Malzeme Ekle
          </button>
          <button
            className="btn rounded-xl w-40 bg-blue-700 text-white"
            onClick={() => navigate(`/sistemsec/${id}`)}
          >
            Sistem Ekle
          </button>
        </div>
      </div>

      {/* ✅ Radix tabanlı diyaloglar */}
      <DialogMusteriSec
        open={openMusteri}
        onOpenChange={setOpenMusteri}
        onSelect={(row) => {
          setSelectedCustomer(row);
          setOpenMusteri(false);
        }}
      />

      <DialogCamRenkSec
        open={openCamRenk}
        onOpenChange={setOpenCamRenk}
        requirements={requirements}   // !!! eklendi
        projectId={id}                // !!! eklendi
      />

      <DialogProfilRenkSec
        open={openProfilRenk}
        onOpenChange={setOpenProfilRenk}
        onSelect={(row) => {
          setSelectedProfileColor(row.id);
          setSelectedProfileName(row.name || '');
          setOpenProfilRenk(false);
        }}
      />
    </div>
  );
};

export default ProjeDuzenle;
