// src/scenes/projeekle/ProjeDuzenle.jsx
import DialogMusteriSec from './DialogMusteriSec';
import DialogCamRenkSec from './DialogCamRenkSec';
import DialogProfilRenkSec from './DialogProfilRenkSec';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as actions_projeler from '../../redux/actions/actions_projeler';
import { getProfilImageFromApi } from '../../redux/actions/actions_profiller';
import Header from '@/components/mycomponents/Header';
import SistemTable from './SistemTable';
import MalzemeTable from './MalzemeTable';
import { ReactComponent as Paintbrush } from '../../icons/paintbrush.svg';
import { ReactComponent as User } from '../../icons/user_v2.svg';
import { getBrandConfigByKey, getPdfConfigByKey } from '@/redux/actions/actions_pdfConfig';
import { generateCamCiktisiPdf } from './pdf/pdfGlass';
import { generateOrderPdf } from './pdf/pdfOrder';
import { generatePaintPdf } from './pdf/pdfPaint';
import { generateProfileAccessoryPdf } from './pdf/pdfProfileAccessory';
import { generateOptimizeProfilesPdf } from './pdf/pdfOptimizeProfiles';
import { getBrandImage, getPdfBrandByKey, getPdfTitleByKey } from '@/redux/actions/actionsPdf';
// ✅ Spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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
  const proje = useSelector(state => state.getProjeFromApiReducer) || null;
  const requirements = useSelector(state => state.getProjeRequirementsFromApiReducer) ||
    { systems: [], extra_requirements: [], extra_profiles: [], extra_glasses: [] };
  const brandLogoUrl = useSelector(state => state.getBrandImageReducer?.logo_url) || null;
  // ✅ İlk yüklemelerde ilgili API çağrılarını spinner ile sarmala
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(actions_projeler.getProjeFromApi(id));
        await dispatch(actions_projeler.getProjeRequirementsFromApi(id));
        await dispatch(getBrandImage());

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
    const d = new Date(proje.created_at);
    setProjectDate(
      `${String(d.getDate()).padStart(2, '0')}/` +
      `${String(d.getMonth() + 1).padStart(2, '0')}/` +
      d.getFullYear()
    );
   // ✅ Proje yüklenince mevcut press/boyalı fiyatları state'e bas
setPressPrice(
  (proje?.press_price) ? proje.press_price : 0
);
setPaintedPrice(
  (proje?.painted_price) ? proje.painted_price : 0
);
  }, [proje]);

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
        painted_price: paintedPrice
      }));
    } finally {
      setLoading(false);
    }
  };


  // ✅ Global spinner (tüm sayfayı kaplar)
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-rows-[60px_1fr] h-full">
      {/* Üst Başlık ve Butonlar (değişmedi) */}
      <div className="flex items-center justify-between px-5">
        <Header title={`${projectCode} – ${projectName}`} />
        <div className="flex space-x-2">
          {/* ✅ "Profil Aksesuar Listesi" için Optimizasyon ile aynı görünümde açılır menü */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
              Profil Aksesuar Listesi
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-52">
              <li className='hover:bg-gray-200'>
                <a onClick={async () => {
                  const brandCfgold = await dispatch(getPdfBrandByKey('brand.default'));
                  const brandCfg = brandCfgold.config_json
                  const accCfgold = await dispatch(getPdfTitleByKey('pdf.profileAccessory'));
                  const accCfg = accCfgold.config_json
                  await generateProfileAccessoryPdf(
                    {
                      dispatch,
                      getProfilImageFromApi,
                      projectName,
                      projectCode,
                      proje,
                      requirements,
                      brandLogoUrl,
                      // ✅ PDF tarafına state'teki değerleri de ilet
                      pressPrice: pressPrice === '' ? null : Number(pressPrice),
                      paintedPrice: paintedPrice === '' ? null : Number(paintedPrice)
                    },
                    accCfg,
                    brandCfg,
                    // ✅ "Press" modu
                    { pricingMode: 'press' }
                  );
                }}>
                  Press
                </a>
              </li>
              <li className='hover:bg-gray-200'>
                <a onClick={async () => {
                  const brandCfgold = await dispatch(getPdfBrandByKey('brand.default'));
                  const brandCfg = brandCfgold.config_json
                  const accCfgold = await dispatch(getPdfTitleByKey('pdf.profileAccessory'));
                  const accCfg = accCfgold.config_json
                  await generateProfileAccessoryPdf(
                    {
                      dispatch,
                      getProfilImageFromApi,
                      projectName,
                      projectCode,
                      proje,
                      requirements,
                      brandLogoUrl,
                      pressPrice: pressPrice === '' ? null : Number(pressPrice),
                      paintedPrice: paintedPrice === '' ? null : Number(paintedPrice)
                    },
                    accCfg,
                    brandCfg,
                    // ✅ "Boyalı" modu
                    { pricingMode: 'painted' }
                  );
                }}>
                  Boyalı
                </a>
              </li>
            </ul>
          </div>
          <button className="btn btn-sm btn-outline" onClick={async () => {
            const brandCfg = await dispatch(getBrandConfigByKey('brand.default'));
            const paintCfg = await dispatch(getPdfConfigByKey('pdf.paint'));
            await generatePaintPdf(
              {
                dispatch,
                getProfilImageFromApi,
                projectName,
                projectCode,
                proje,
                requirements
              },
              paintCfg,
              brandCfg
            );
          }}>
            Boya Çıktısı
          </button>
          <button className="btn btn-sm" onClick={async () => {
            const brandCfg = await dispatch(getBrandConfigByKey('brand.default'));
            const orderCfg = await dispatch(getPdfConfigByKey('pdf.order'));
            await generateOrderPdf(
              {
                dispatch,
                getProfilImageFromApi,
                projectName,
                projectCode,
                proje,
                requirements,
              },
              orderCfg,
              brandCfg
            );
          }}>
            Sipariş Çıktısı
          </button>
          <button className="btn btn-sm" onClick={async () => {
            const brandCfg = await dispatch(getBrandConfigByKey('brand.default'));
            const glassCfg = await dispatch(getPdfConfigByKey('pdf.glass'));
            await generateCamCiktisiPdf(
              { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
              glassCfg,
              brandCfg
            );
          }}>
            Cam Çıktısı
          </button>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn bg-blue-600 hover:bg-blue-700 text-white">
              Optimizasyon
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-52">
              <li className='hover:bg-gray-200'>
                <a onClick={async () => {
                  const brandCfg = await dispatch(getBrandConfigByKey('brand.default'));
                  const detaysizCfg = await dispatch(getPdfConfigByKey('pdf.optimize.detaysiz'));
                  const detayliCfg = await dispatch(getPdfConfigByKey('pdf.optimize.detayli'));
                  await generateOptimizeProfilesPdf({ dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements }, 'detayli', detayliCfg, brandCfg);
                }}>
                  Detaylı
                </a>
              </li>
              <li className='hover:bg-gray-200'>
                <a onClick={async () => {
                  const brandCfg = await dispatch(getBrandConfigByKey('brand.default'));
                  const detaysizCfg = await dispatch(getPdfConfigByKey('pdf.optimize.detaysiz'));
                  const detayliCfg = await dispatch(getPdfConfigByKey('pdf.optimize.detayli'));
                  await generateOptimizeProfilesPdf({ dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements }, 'detaysiz', detaysizCfg, brandCfg);
                }}>
                  Detaysız
                </a>
              </li>
            </ul>
          </div>
          <button
            className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
            onClick={handleSave}
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="bg-white w-full border-gray-200  border rounded-2xl p-5 h-full flex flex-col">
        {/* Proje Bilgileri */}
        <div className="border justify-center rounded-2xl h-20 flex">
          <div className="w-1/3 font-semibold flex items-center p-4">
            Proje No:
            <div className="flex items-stretch ml-2">
              <input
                type="text"
                value={projectCode}
                onChange={e => setProjectCode(e.target.value)}
                className="input input-bordered rounded-r w/full max-w-xs"
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
        <div className="border mt-5 rounded-2xl flex h-20">
          <div className="w-1/2 font-semibold flex items-center justify-center p-4 ">
            Profil Press Fiyatı:
            <div className="flex items-stretch ml-2">
              <input
                type="number"
                step="0.01"
                value={pressPrice}
                onChange={(e) => setPressPrice(Number(e.target.value))}
                className="input input-bordered rounded-r w/full max-w-xs"
              />
            </div>
          </div>

          <div className="w-1/2 font-semibold flex justify-center items-center p-4">
            Profil Boyalı Fiyatı:
            <input
                type="number"
                step="0.01"
                value={paintedPrice}
                onChange={(e) => setPaintedPrice(Number(e.target.value))}
              className="input input-bordered ml-2 w-full max-w-xs"
            />
          </div>

        </div>
        {/* Renk & Müşteri - ✅ YENİ: Seç butonları + seçili değerleri metinle göster */}
        <div className="border mt-5 rounded-2xl flex h-20">
          <div className="w-2/3 flex items-center p-2 space-x-6">
            <Paintbrush className="w-10" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Cam Rengi</div>
              <div className="flex items-center gap-3">
                <div className="truncate">
                  {selectedGlassName || requirements?.glass_color?.name || 'Henüz Seçilmedi'}
                </div>
                <button
                  className="btn btn-m ml-auto  bg-blue-600 text-white hover:bg-blue-700"
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
                {(selectedCustomer
                  ? `${selectedCustomer.company_name} (${selectedCustomer.name})`
                  : (requirements?.customer
                      ? `${requirements.customer.company_name} (${requirements.customer.name})`
                      : 'Henüz Seçilmedi'))}
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
        />

        {/* Alt Butonlar */}
        <div className="flex justify-end mt-4 space-x-4">
          <button className="btn rounded-xl w-40 bg-blue-700 text-white" onClick={() => navigate(`/ekstramalzemeekle/${id}`)}>
            Malzeme Ekle
          </button>
          <button className="btn rounded-xl w-40 bg-blue-700 text-white" onClick={() => navigate(`/sistemsec/${id}`)}>
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
        onSelect={(row) => {
          setSelectedGlassColor(row.id);
          setSelectedGlassName(row.name || '');
          setOpenCamRenk(false);
        }}
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
