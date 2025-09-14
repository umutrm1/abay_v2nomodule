// src/scenes/sistemekle/SistemEkleTables.jsx
import React from 'react';
import * as math from 'mathjs';
import { useMemo } from 'react';

// Formül hesaplamalarını güvenli hale getiren yardımcı fonksiyon
const guvenliHesapla = (formula, scope, defaultValue = '-') => {
  if (typeof formula !== 'string' || !formula) return defaultValue;
  try {
    const result = math.evaluate(formula, scope);
    return isFinite(result) ? result : defaultValue;
  } catch {
    return defaultValue;
  }
};

// --- PROFİLLER TABLOSU ---
const ProfillerTable = ({ profiiller, scope }) => {
  if (!profiiller || profiiller.length === 0) return null;

  const hesaplanan = useMemo(() => 
    profiiller.map((tpl, i) => {
      const kesimOlcusu  = guvenliHesapla(tpl.formula_cut_length, scope, 0);
      const kesimAdedi   = guvenliHesapla(tpl.formula_cut_count,  scope, 0);
      const birimAgirlik = tpl.profile?.birim_agirlik || 0;
      const toplamAgi    = (kesimOlcusu * kesimAdedi * birimAgirlik) / 1000;
      return {
        ...tpl.profile,
        kesimOlcusu,
        kesimAdedi,
        birimAgirlik,
        toplamAgi
      };
    })
  , [profiiller, scope]);

  const toplamAgirlik = hesaplanan
    .reduce((sum, p) => sum + (p.toplamAgi || 0), 0)
    .toFixed(3);

  return (
    <div className="overflow-x-auto border border-gray-200 mt-2 rounded-2xl">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">
        Sistem Profilleri
      </h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th colSpan={6} className="text-right font-normal">
              Toplam Ağırlık:
            </th>
            <th className="font-bold">{toplamAgirlik} Kg</th>
          </tr>
          <tr>
            <th>No</th>
            <th>Kod</th>
            <th>Profil Adı</th>
            <th>Kesim Ölçüsü</th>
            <th>Adet</th>
            <th>Birim Ağırlık</th>
            <th>Toplam Ağırlık</th>
          </tr>
        </thead>
        <tbody>
          {hesaplanan.map((p, idx) => (
            <tr key={p.id || idx}>
              <td>{idx + 1}</td>
              <td>{p.profil_kodu}</td>
              <td>{p.profil_isim}</td>
              <td>{p.kesimOlcusu > 0 ? p.kesimOlcusu.toFixed(0) : '-'}</td>
              <td>{p.kesimAdedi > 0 ? p.kesimAdedi : '-'}</td>
              <td>{p.birimAgirlik}</td>
              <td className="font-bold">{p.toplamAgi.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- CAM TABLOSU ---
const CamOlcusuTable = ({ camlar, scope }) => {
  if (!camlar || camlar.length === 0) return null;

  const { items, toplamAlan } = useMemo(() => {
    const arr = camlar.map(cam => {
      const gen = guvenliHesapla(cam.formula_width,  scope, 0);
      const yuk = guvenliHesapla(cam.formula_height, scope, 0);
      const adt = guvenliHesapla(cam.formula_count,  scope, 0);
      const alan = (gen * yuk * adt) / 1_000_000;
      return {
        id:    cam.id,
        isim:  cam.glass_type.cam_isim,
        genislik:  gen.toFixed(0),
        yukseklik: yuk.toFixed(0),
        adet:      adt,
        alan:      alan.toFixed(2)
      };
    });
    const toplam = arr.reduce((sum, i) => sum + (parseFloat(i.alan) || 0), 0).toFixed(2);
    return { items: arr, toplamAlan: toplam };
  }, [camlar, scope]);

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">
        Sistem Camları
      </h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>Cam Adı</th>
            <th>Genişlik</th>
            <th>Yükseklik</th>
            <th>Adet</th>
            <th>Alan (m²)</th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id}>
              <th>{c.isim}</th>
              <td>{c.genislik}</td>
              <td>{c.yukseklik}</td>
              <td>{c.adet}</td>
              <td>{c.alan}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={4} className="text-right">Toplam Alan:</td>
            <td>{toplamAlan} m²</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// --- MALZEMELER TABLOSU ---
const DigerMalzemelerTable = ({ malzemeler, scope }) => {
  if (!malzemeler || malzemeler.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">
        Sistem Malzemeleri
      </h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>Malzeme Adı</th>
            <th>Adet</th>
          </tr>
        </thead>
        <tbody>
          {malzemeler.map(m => (
            <tr key={m.material_id}>
              <td>{m.material.diger_malzeme_isim}</td>
              <td>{guvenliHesapla(m.formula_quantity, scope)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- ANA COMPONENT ---
const SistemEkleTables = ({ sistem_genislik, sistem_yukseklik, sistem_adet, seciliSistemTam }) => {
  const scope = { sistem_genislik, sistem_yukseklik, sistem_adet };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-x-5">
      <div className="w-full lg:w-3/5 flex flex-col">
        <h2 className="text-2xl font-bold mb-2">Sistem Hesaplamaları</h2>
        <ProfillerTable profiiller={seciliSistemTam?.profile_templates} scope={scope} />
      </div>
      <div className="w-full lg:w-2/5 flex flex-col mt-5 lg:mt-0">
        <h2 className="text-2xl font-bold mb-2 ml-5">Diğer Hesaplamalar ve Ekstralar</h2>
        <div className="pl-5">
          <CamOlcusuTable camlar={seciliSistemTam?.glass_templates} scope={scope} />
          <DigerMalzemelerTable malzemeler={seciliSistemTam?.material_templates} scope={scope} />
        </div>
      </div>
    </div>
  );
};


