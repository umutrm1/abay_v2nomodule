import React, { useMemo } from 'react';
import * as math from 'mathjs';
import DialogEkstraMalzemeler from './DialogEkstraMalzemeler';

// Güvenli formül hesaplayıcı
const guvenliHesapla = (formula, scope, defaultValue = '-') => {
  if (typeof formula !== 'string' || !formula) return defaultValue;
  try {
    const result = math.evaluate(formula, scope);
    return isFinite(result) ? result : defaultValue;
  } catch {
    return defaultValue;
  }
};

// --- SİSTEM GEREKSİNİMLERİ TABLOLARI (SALT OKUNUR) ---

const ProfillerTable = ({ profiller, scope }) => {
  if (!profiller || profiller.length === 0) return null;

  const hesaplananProfiller = useMemo(() => profiller.map((profil, index) => {
    const kesimOlcusu = guvenliHesapla(profil.formuller.kesim_olcusu, scope, 0);
    const kesimAdet = guvenliHesapla(profil.formuller.kesim_adedi, scope, 0);
    const birimAgirlik = profil.profil?.birim_agirlik || 0;
    const toplamAgirlik = (kesimOlcusu * kesimAdet * birimAgirlik) / 1000;
    return { ...profil, kesimOlcusu, kesimAdet, toplamAgirlik };
  }), [profiller, scope]);

  const toplamSistemAgirlik = hesaplananProfiller.reduce((sum, p) => sum + (p.toplamAgirlik || 0), 0);

  return (
    <div className="overflow-x-auto border border-gray-200 mt-2 rounded-2xl">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Profilleri</h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th colSpan={6} className="text-right font-normal">Toplam Ağırlık:</th>
            <th className="font-bold">{toplamSistemAgirlik.toFixed(3)} Kg</th>
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
          {hesaplananProfiller.map((profil, idx) => (
            <tr key={`${profil.profil_id}-${idx}`}>
              <td>{idx + 1}</td>
              <td>{profil.profil?.profil_kodu}</td>
              <td>{profil.profil?.profil_isim}</td>
              <td>{profil.kesimOlcusu > 0 ? profil.kesimOlcusu.toFixed(0) : '-'}</td>
              <td>{profil.kesimAdet > 0 ? profil.kesimAdet : '-'}</td>
              <td>{profil.profil?.birim_agirlik || 0}</td>
              <td className="font-bold">{profil.toplamAgirlik.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CamOlcusuTable = ({ camlar, scope }) => {
  if (!camlar || camlar.length === 0) return null;

  const hesaplananVeriler = useMemo(() => {
    const items = camlar.map((cam) => {
      const genislik = guvenliHesapla(cam.formuller.cam_genislik, scope, 0);
      const yukseklik = guvenliHesapla(cam.formuller.cam_yukseklik, scope, 0);
      const adet = guvenliHesapla(cam.formuller.cam_adet, scope, 0);
      const alan = (genislik * yukseklik * adet) / 1000000;
      return { id: cam.cam_id, isim: cam.cam.cam_isim, genislik, yukseklik, adet, alan };
    });
    const toplamAlan = items.reduce((sum, it) => sum + (it.alan || 0), 0);
    return { items, toplamAlan };
  }, [camlar, scope]);

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Cam Ölçüleri</h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>Cam Adı</th>
            <th>Genişlik (mm)</th>
            <th>Yükseklik (mm)</th>
            <th>Adet</th>
            <th>Alan (m²)</th>
          </tr>
        </thead>
        <tbody>
          {hesaplananVeriler.items.map((cam, idx) => (
            <tr key={`${cam.id}-${idx}`}> 
              <td className='font-bold'>{cam.isim}</td>
              <td>{cam.genislik.toFixed(0)}</td>
              <td>{cam.yukseklik.toFixed(0)}</td>
              <td>{cam.adet}</td>
              <td>{cam.alan.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={4} className="text-right">Toplam Alan:</td>
            <td>{hesaplananVeriler.toplamAlan.toFixed(2)} m²</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const DigerMalzemelerTable = ({ malzemeler, scope }) => {
  if (!malzemeler || malzemeler.length === 0) return null;
  const olculu = malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'olculu');
  const adetli = malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'adetli');

  return (
    <>
      {olculu.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
          <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Kesimli Malzemeler</h3>
          <table className="table table-compact w-full">
            <thead><tr><th>İsim</th><th>Kesim Ölçüsü</th><th>Adet</th></tr></thead>
            <tbody>
              {olculu.map((m, idx) => (
                <tr key={`${m.diger_malzeme_id}-${idx}`}>
                  <td>{m.diger_malzeme.diger_malzeme_isim}</td>
                  <td>{guvenliHesapla(m.formuller.kesim_olcusu, scope)}</td>
                  <td>{guvenliHesapla(m.formuller.kesim_adedi, scope)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adetli.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
          <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Adetli Malzemeler</h3>
          <table className="table table-compact w-full">
            <thead><tr><th>İsim</th><th>Adet</th></tr></thead>
            <tbody>
              {adetli.map((m, idx) => (
                <tr key={`${m.diger_malzeme_id}-${idx}`}>
                  <td>{m.diger_malzeme.diger_malzeme_isim}</td>
                  <td>{guvenliHesapla(m.formuller.adet, scope)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

// --- EKSTRA GEREKSİNİMLERİ TABLOLARI (İNTERAKTİF) ---

const EkstraProfillerTable = ({ profiller, onItemChange }) => {
  if (!profiller || profiller.length === 0) return null;
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-2">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Profiller</h3>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th>No</th><th>Kod</th><th>Profil Adı</th><th>Kesim Ölçüsü</th><th>Adet</th><th>Toplam Ağırlık (Kg)</th>
          </tr>
        </thead>
        <tbody>
          {profiller.map((item, idx) => {
            const { kesim_olcusu, kesim_adedi, toplam_agirlik } = item.hesaplanan_degerler;
            const birimAgirlik = item.profil?.birim_agirlik || 0;
            return (
              <tr key={`${item.instance_id}-${idx}`}>
                <th>{idx + 1}</th>
                <td>{item.profil?.profil_kodu}</td>
                <td>{item.profil?.profil_isim}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={kesim_olcusu}
                    onChange={e => onItemChange('profiller', item.instance_id, 'kesim_olcusu', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={kesim_adedi}
                    onChange={e => onItemChange('profiller', item.instance_id, 'kesim_adedi', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td className="font-bold">{toplam_agirlik.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const EkstraCamlarTable = ({ camlar, onItemChange }) => {
  if (!camlar || camlar.length === 0) return null;
  const toplamAlan = camlar.reduce((sum, c) => sum + ((c.hesaplanan_degerler.genislik * c.hesaplanan_degerler.yukseklik * c.hesaplanan_degerler.adet) / 1000000), 0);
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-2">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Camlar</h3>
      <table className="table table-compact w-full">
        <thead>
          <tr><th>Cam Adı</th><th>Genişlik</th><th>Yükseklik</th><th>Adet</th><th>Alan</th></tr>
        </thead>
        <tbody>
          {camlar.map((c, idx) => {
            const { genislik, yukseklik, adet } = c.hesaplanan_degerler;
            const alan = (genislik * yukseklik * adet) / 1000000;
            return (
              <tr key={`${c.instance_id}-${idx}`}>
                <th>{c.cam?.cam_isim}</th>
                <td>
                  <input
                    type="number"
                    defaultValue={genislik}
                    onChange={e => onItemChange('camlar', c.instance_id, 'genislik', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={yukseklik}
                    onChange={e => onItemChange('camlar', c.instance_id, 'yukseklik', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={adet}
                    onChange={e => onItemChange('camlar', c.instance_id, 'adet', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td className="font-bold">{alan.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={4} className="text-right">Toplam Ekstra Alan:</td>
            <td>{toplamAlan.toFixed(2)} m²</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const EkstraAdetliDigerTable = ({ malzemeler, onItemChange }) => {
  if (!malzemeler || malzemeler.length === 0) return null;
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-2">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Adetli Malzemeler</h3>
      <table className="table table-compact w-full">
        <thead><tr><th>Malzeme Adı</th><th>Birim</th><th>Adet</th></tr></thead>
        <tbody>
          {malzemeler.map((m, idx) => {
            const adet = m.hesaplanan_degerler.adet;
            return (
              <tr key={`${m.instance_id}-${idx}`}>
                <th>{m.diger_malzeme?.diger_malzeme_isim}</th>
                <td>{m.diger_malzeme?.diger_malzeme_birim}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={adet}
                    onChange={e => onItemChange('diger_malzemeler', m.instance_id, 'adet', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const EkstraOlculuDigerTable = ({ malzemeler, onItemChange }) => {
  if (!malzemeler || malzemeler.length === 0) return null;
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-2">
      <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Ölçülü Malzemeler</h3>
      <table className="table table-compact w-full">
        <thead><tr><th>Malzeme Adı</th><th>Kesim Ölçüsü</th><th>Adet</th></tr></thead>
        <tbody>
          {malzemeler.map((m, idx) => {
            const { kesim_olcusu, adet } = m.hesaplanan_degerler;
            return (
              <tr key={`${m.instance_id}-${idx}`}>
                <th>{m.diger_malzeme?.diger_malzeme_isim}</th>
                <td>
                  <input
                    type="number"
                    defaultValue={kesim_olcusu}
                    onChange={e => onItemChange('diger_malzemeler', m.instance_id, 'kesim_olcusu', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={adet}
                    onChange={e => onItemChange('diger_malzemeler', m.instance_id, 'kesim_adedi', e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- ANA COMPONENT ---

const GiyotinSiparisTables = ({
  siparis,
  urunIndex = 0,
  sistem_genislik,
  sistem_yukseklik,
  sistem_adet,
  ekstraGereksinimler,
  onEkstraMalzemeEkle,
  onEkstraMalzemeChange,
  seciliSistem
}) => {
  const urun = siparis.urunler[urunIndex];
  const scope = { sistem_genislik, sistem_yukseklik, sistem_adet };
  console.log("siparis ",siparis);
  console.log("urun",urun)
  console.log("secilisistem",seciliSistem)


  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-x-5">
      <div className="w-full lg:w-3/5 flex flex-col">
        <h2 className="text-2xl font-bold mb-2">Sistem Hesaplamaları</h2>
        <ProfillerTable profiller={urun.hesaplananGereksinimler.profiller} scope={scope} />
        <EkstraProfillerTable profiller={ekstraGereksinimler.profiller} onItemChange={onEkstraMalzemeChange} />
      </div>
      <div className="w-full lg:w-2/5 flex flex-col mt-5 lg:mt-0">
        <h2 className="text-2xl font-bold mb-2 ml-5">Diğer Hesaplamalar ve Ekstralar</h2>
        <div className="pl-5">
          <CamOlcusuTable camlar={urun.hesaplananGereksinimler.camlar} scope={scope} />
          <DigerMalzemelerTable malzemeler={urun.hesaplananGereksinimler.diger_malzemeler} scope={scope} />
          <h2 className="text-2xl font-bold mb-2 mt-4">Ekstra Malzemeler</h2>
          <EkstraCamlarTable camlar={ekstraGereksinimler.camlar} onItemChange={onEkstraMalzemeChange} />
          <EkstraOlculuDigerTable malzemeler={ekstraGereksinimler.diger_malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'olculu')} onItemChange={onEkstraMalzemeChange} />
          <EkstraAdetliDigerTable malzemeler={ekstraGereksinimler.diger_malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'adetli')} onItemChange={onEkstraMalzemeChange} />
          <div className="pt-4">

          </div>
        </div>
      </div>
    </div>
  );
};

export default GiyotinSiparisTables;
