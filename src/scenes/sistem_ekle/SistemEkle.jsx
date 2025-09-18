// src/scenes/sistemekle/SistemEkle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler.js';
import { addRequirementsToProjeToApi } from '@/redux/actions/actions_projeler.js';
import { ReactComponent as PencilRuler } from '../../icons/pencil-ruler_v2.svg';
import * as math from 'mathjs';
import SistemEkleTables from './SistemEkleTables.jsx';
import { getProjeRequirementsFromApi } from '@/redux/actions/actions_projeler.js';

const SistemEkle = () => {
  const { projectId, variantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ölçü girdileri
  const [sistemGenislik, setSistemGenislik] = useState(0);
  const [sistemYukseklik, setSistemYukseklik] = useState(0);
  const [sistemAdet, setSistemAdet] = useState(0);
  
  const requirements = useSelector(
    state => state.getProjeRequirementsFromApiReducer
  ) || { systems: [], extra_requirements: [] };
  // API’den gelen tam variant objesi
  const seciliSistemTam = useSelector(
    state => state.getSystemFullVariantsOfSystemFromApiReducer
  ) || {};
const handleNumberFocus = (val) => {
  return val === 0 ? "" : val;
};

const handleNumberChange = (setter) => (e) => {
  const v = e.target.value;
  // boşsa state'i 0 yapma, sadece "" gösterilsin
  if (v === "") {
    setter(0);
  } else {
    setter(Number(v));
  }
};

const handleNumberBlur = (val, setter) => {
  if (val === 0 || val === "" || isNaN(val)) {
    setter(0);
  }
};
  useEffect(() => {
    dispatch(getSystemFullVariantsOfSystemFromApi(variantId));
    dispatch(getProjeRequirementsFromApi(projectId));

  }, [dispatch, variantId]);
  // formül evaluatör
  const guvenliHesapla = expr => {
    try {
      const scope = {
        sistem_genislik: sistemGenislik,
        sistem_yukseklik: sistemYukseklik,
        sistem_adet: sistemAdet
      };
      const value = math.evaluate(expr, scope);
      return typeof value === 'number' && isFinite(value) ? value : 0;
    } catch {
      return 0;
    }
  };
 function applyChunkByLength(tpl, rl) {
   // rl: formula_cut_length sonucu (uzunluk, mm)
   const pieceLen = Math.max(1, Math.round(tpl?.piece_length_mm || 100));
   const L = Math.max(0, Math.round(rl || 0));
   // 0 ise 0 parça; >0 ise yukarı yuvarla
   const count = L === 0 ? 0 : Math.ceil(L / pieceLen);
   return { count, cut_length_mm: pieceLen };
 }


const handleSistemKaydet = async () => {
  const sys = {
    system_variant_id: variantId,
    color: seciliSistemTam.color_options?.[0] ?? '',
    width_mm: Math.round(sistemGenislik),
    height_mm: Math.round(sistemYukseklik),
    quantity: Math.round(sistemAdet),

    // 1) PROFİLLER → pdf ekle
    profiles: (seciliSistemTam.profile_templates || []).map((tpl, index) => {
      const rawCutLength = guvenliHesapla(tpl.formula_cut_length);
      const rawCutCount  = guvenliHesapla(tpl.formula_cut_count);

      const cut_length_mm = Math.round(rawCutLength);
      const cut_count     = Math.round(rawCutCount);

      const rawWeight = (cut_length_mm * cut_count * (tpl.profile?.birim_agirlik || 0)) / 1000;
      const total_weight_kg = Math.round(rawWeight);

      return {
        profile_id: tpl.profile_id,
        cut_length_mm,
        cut_count,
        total_weight_kg,
        order_index: index + 1,
        pdf: tpl.pdf // <- ŞABLONDAKİ PDF AYNI ŞEKİLDE GERİ GÖNDERİLİYOR
      };
    }),

    // 2) CAMLAR → pdf ekle
    glasses: (seciliSistemTam.glass_templates || []).map((tpl, index) => {
      const rawWidth  = guvenliHesapla(tpl.formula_width);
      const rawHeight = guvenliHesapla(tpl.formula_height);
      const rawCount  = guvenliHesapla(tpl.formula_count);

      const width_mm  = Math.round(rawWidth);
      const height_mm = Math.round(rawHeight);
      const count     = Math.round(rawCount);

      const rawArea = (width_mm * height_mm * count) / 1_000_000;
      const area_m2 = Math.round(rawArea);

      return {
        glass_type_id: tpl.glass_type_id,
        width_mm,
        height_mm,
        count,
        area_m2,
        order_index: index + 1,
        pdf: tpl.pdf // <- PDF ALANI AYNI DÖNÜYOR
      };
    }),

    // 3) MALZEMELER → pdf ekle
     materials: (seciliSistemTam.material_templates || []).map((tpl, i) => {
       const rq = guvenliHesapla(tpl.formula_quantity);     // chunk_by_length değilse kullanılacak
       const rl = guvenliHesapla(tpl.formula_cut_length);   // her iki tip için de gerekli
    
       let count, cut_length_mm;
    
       if (tpl?.type === 'chunk_by_length') {
         // yeni mantık: L’i piece_length_mm’e böl, yukarı yuvarla
         ({ count, cut_length_mm } = applyChunkByLength(tpl, rl));
       } else {
         // eski mantık aynen devam
         count = Math.round(rq);
         cut_length_mm = Math.round(rl);
       }
     
       return {
         material_id: tpl.material_id,
         count,
         cut_length_mm,
         order_index: i + 1,
         pdf: tpl.pdf
       };
     }),

    // 4) YENİ: KUMANDALAR (remotes) → istenen ekleme
    remotes: (seciliSistemTam.remote_templates || []).map((tpl, index) => ({
      remote_id: tpl.remote_id,
      count:0,
      unit_price:tpl.unit_price,
      order_index: index + 1, // istersen tpl.order_index olarak birebir döndürebiliriz
      pdf: tpl.pdf // <- ŞABLONDA NE GELDİYSE AYNEN
    })),
  };

  const payload = { systems: [sys] };

  setIsRefreshing(true);
  try {
    console.log("projeid: ", projectId, "object: ", payload);
    await dispatch(addRequirementsToProjeToApi(projectId, payload));
    await new Promise(res => setTimeout(res, 200));
  } finally {
    setIsRefreshing(false);
  }
};
  const refreshRequirements = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(getProjeRequirementsFromApi(projectId));
      await new Promise(res => setTimeout(res, 200));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 h-screen p-5 flex flex-col">
      {/* Ölçü Girdileri */}
      <div className="border border-gray-200 rounded-2xl w-full p-4 flex gap-4 mb-5 items-center">
        <PencilRuler className="w-10 mr-2" />
        <div className="flex-1 flex gap-2">
<input
  type="number"
  value={sistemGenislik === 0 ? "" : sistemGenislik}
  onChange={handleNumberChange(setSistemGenislik)}
  onBlur={() => handleNumberBlur(sistemGenislik, setSistemGenislik)}
  placeholder="En (mm)"
  className="input input-bordered w-full max-w-xs"
/>

<input
  type="number"
  value={sistemYukseklik === 0 ? "" : sistemYukseklik}
  onChange={handleNumberChange(setSistemYukseklik)}
  onBlur={() => handleNumberBlur(sistemYukseklik, setSistemYukseklik)}
  placeholder="Boy (mm)"
  className="input input-bordered w-full max-w-xs"
/>

<input
  type="number"
  value={sistemAdet === 0 ? "" : sistemAdet}
  onChange={handleNumberChange(setSistemAdet)}
  onBlur={() => handleNumberBlur(sistemAdet, setSistemAdet)}
  placeholder="Adet"
  className="input input-bordered w-full max-w-xs"
/>
        </div>
        <button
          className="btn ml-auto rounded-xl w-40 bg-blue-700 hover:bg-blue-800 text-white text-lg font-roboto"
          onClick={() => navigate(`/projeduzenle/${projectId}`)}
        >
          Projeye Dön
        </button>
        <button
          className="btn ml-auto rounded-xl w-40 bg-blue-700 hover:bg-blue-800 text-white text-lg font-roboto"
          onClick={() => navigate(`/sistemsec/${projectId}`)}
        >
          Sistem Seç
        </button>


        <button
          onClick={handleSistemKaydet}
          className="btn ml-auto rounded-xl w-40 bg-blue-700 hover:bg-blue-800 text-white text-lg font-roboto"
        >
          Sistem Ekle
        </button>
      </div>

      {/* Profiller, Camlar ve Malzemeler */}
      {isRefreshing ? (
        <div className="flex items-center justify-center h-32">
          <span className="loading loading-spinner loading-lg text-blue-700"></span>
        </div>
      ) : (
        <SistemEkleTables onRefresh={refreshRequirements} systems={requirements.systems} />
      )}
    </div>
  );
};

export default SistemEkle;
