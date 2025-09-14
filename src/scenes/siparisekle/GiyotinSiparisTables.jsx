import React from 'react';
import * as math from "mathjs";
import DialogEkstraMalzemeler from "./DialogEkstraMalzemeler";
import { useMemo } from "react";

// Formül hesaplamalarını güvenli hale getiren yardımcı fonksiyon
const guvenliHesapla = (formula, scope, defaultValue = '-') => {
    if (typeof formula !== 'string' || !formula) return defaultValue;
    try {
        const result = math.evaluate(formula, scope);
        return isFinite(result) ? result : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

// --- SİSTEM GEREKSİNİMLERİ TABLOLARI (SALT OKUNUR) ---

const ProfillerTable = ({ profiller, scope }) => {
    if (!profiller || profiller.length === 0) return null;

    const hesaplananProfiller = useMemo(() => profiller.map(profil => {
        const kesimOlcusu = guvenliHesapla(profil.formuller.kesim_olcusu, scope, 0);
        const kesimAdet = guvenliHesapla(profil.formuller.kesim_adedi, scope, 0);
        const birimAgirlik = profil.profil?.birim_agirlik || 0;
        const toplamAgirlik = (kesimOlcusu * kesimAdet * birimAgirlik) / 1000;
        return { ...profil, kesimOlcusu, kesimAdet, toplamAgirlik };
    }), [profiller, scope]);

    const toplamSistemAgirlik = hesaplananProfiller.reduce((acc, profil) => acc + (profil.toplamAgirlik || 0), 0);

    return (
        <div className="overflow-x-auto border border-gray-200 mt-2 rounded-2xl">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Profilleri</h3>
            <table className="table table-compact w-full">
                <thead>
                    <tr><th colSpan={6} className="text-right font-normal">Toplam Ağırlık:</th><th className="font-bold">{toplamSistemAgirlik.toFixed(3)} Kg</th></tr>
                    <tr><th>No</th><th>Kod</th><th>Profil Adı</th><th>Kesim Ölçüsü</th><th>Adet</th><th>Birim Ağırlık</th><th>Toplam Ağırlık</th></tr>
                </thead>
                <tbody>
                    {hesaplananProfiller.map((profil, index) => (
                        <tr key={profil.profil_id + '-' + index}>
                            <td>{index + 1}</td>
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
        const items = camlar.map(cam => {
            const genislik = guvenliHesapla(cam.formuller.cam_genislik, scope, 0);
            const yukseklik = guvenliHesapla(cam.formuller.cam_yukseklik, scope, 0);
            const adet = guvenliHesapla(cam.formuller.cam_adet, scope, 0);
            const alan = (genislik * yukseklik * adet) / 1000000;
            return {
                id: cam.cam_id, isim: cam.cam.cam_isim, genislik: genislik.toFixed(0),
                yukseklik: yukseklik.toFixed(0), adet: adet, alan: alan.toFixed(2)
            };
        });
        const toplamAlan = items.reduce((acc, item) => acc + (parseFloat(item.alan) || 0), 0);
        return { items, toplamAlan: toplamAlan.toFixed(2) };
    }, [camlar, scope]);

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Cam Ölçüleri</h3>
            <table className="table table-compact w-full">
                <thead><tr><th>Cam Adı</th><th>Genişlik (mm)</th><th>Yükseklik (mm)</th><th>Adet</th><th>Alan (m²)</th></tr></thead>
                <tbody>
                    {hesaplananVeriler.items.map((cam, index) => (
                        <tr key={cam.id + '-' + index}><th>{cam.isim}</th><td>{cam.genislik}</td><td>{cam.yukseklik}</td><td>{cam.adet}</td><td>{cam.alan}</td></tr>
                    ))}
                </tbody>
                <tfoot><tr className="font-bold"><td colSpan={4} className="text-right">Toplam Alan:</td><td>{hesaplananVeriler.toplamAlan} m²</td></tr></tfoot>
            </table>
        </div>
    );
};

const DigerMalzemelerTable = ({ malzemeler, scope }) => {
    if (!malzemeler || malzemeler.length === 0) return null;
    const olculuMalzemeler = malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'olculu');
    const adetliMalzemeler = malzemeler.filter(m => m.diger_malzeme.hesaplama_turu === 'adetli');

    return (
        <>
            {olculuMalzemeler.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
                    <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Kesimli Malzemeler</h3>
                    <table className="table table-compact w-full">
                        <thead><tr><th>İsim</th><th>Kesim Ölçüsü</th><th>Adet</th></tr></thead>
                        <tbody>
                            {olculuMalzemeler.map((malzeme, index) => (
                                <tr key={malzeme.diger_malzeme_id + '-' + index}>
                                    <td>{malzeme.diger_malzeme.diger_malzeme_isim}</td>
                                    <td>{guvenliHesapla(malzeme.formuller.kesim_olcusu, scope)}</td>
                                    <td>{guvenliHesapla(malzeme.formuller.kesim_adedi, scope)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {adetliMalzemeler.length > 0 && (
                 <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
                    <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Sistem Adetli Malzemeler</h3>
                    <table className="table table-compact w-full">
                        <thead><tr><th>İsim</th><th>Adet</th></tr></thead>
                        <tbody>
                            {adetliMalzemeler.map((malzeme, index) => (
                                <tr key={malzeme.diger_malzeme_id + '-' + index}>
                                    <td>{malzeme.diger_malzeme.diger_malzeme_isim}</td>
                                    <td>{guvenliHesapla(malzeme.formuller.adet, scope)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};


// --- EKSTRA GEREKSİNİMLERİ TABLOLARI (İnteraktif) ---

const EkstraProfillerTable = ({ profiller, onItemChange }) => {
    if (!profiller || profiller.length === 0) return null;
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Profiller</h3>
            <table className="table table-compact w-full">
                <thead><tr><th>No</th><th>Kod</th><th>Profil Adı</th><th>Kesim Ölçüsü</th><th>Adet</th><th>Toplam Ağırlık (Kg)</th></tr></thead>
                <tbody>
                    {profiller.map((item, index) => {
                        const birimAgirlik = item.profil?.birim_agirlik || 0;
                        const toplamAgirlik = ((parseFloat(item.kesim_olcusu) || 0) * (parseInt(item.kesim_adedi) || 0) * birimAgirlik) / 1000;
                        return (
                            <tr key={item.instance_id}>
                                <th>{index + 1}</th>
                                <td>{item.profil?.profil_kodu}</td>
                                <td>{item.profil?.profil_isim}</td>
                                <td><input type="number" value={item.kesim_olcusu || ''} onChange={(e) => onItemChange('profiller', item.instance_id, 'kesim_olcusu', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                                <td><input type="number" value={item.kesim_adedi || ''} onChange={(e) => onItemChange('profiller', item.instance_id, 'kesim_adedi', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                                <td className="font-bold">{toplamAgirlik.toFixed(3)}</td>
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
    const toplamAlan = camlar.reduce((acc, item) => acc + (((parseFloat(item.genislik) || 0) * (parseFloat(item.yukseklik) || 0) * (parseInt(item.adet) || 0)) / 1000000), 0);
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Camlar</h3>
            <table className="table table-compact w-full">
                <thead><tr><th>Cam Adı</th><th>Genişlik</th><th>Yükseklik</th><th>Adet</th><th>Alan (m²)</th></tr></thead>
                <tbody>
                    {camlar.map(item => {
                        const alan = ((parseFloat(item.genislik) || 0) * (parseFloat(item.yukseklik) || 0) * (parseInt(item.adet) || 0)) / 1000000;
                        return (
                            <tr key={item.instance_id}>
                                <th>{item.cam?.cam_isim}</th>
                                <td><input type="number" value={item.genislik || ''} onChange={(e) => onItemChange('camlar', item.instance_id, 'genislik', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                                <td><input type="number" value={item.yukseklik || ''} onChange={(e) => onItemChange('camlar', item.instance_id, 'yukseklik', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                                <td><input type="number" value={item.adet || ''} onChange={(e) => onItemChange('camlar', item.instance_id, 'adet', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                                <td className="font-bold">{alan.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot><tr className="font-bold text-lg"><td colSpan={4} className="text-right">Toplam Ekstra Alan:</td><td>{toplamAlan.toFixed(2)} m²</td></tr></tfoot>
            </table>
        </div>
    );
};

// YENİ: Sadece ADETLİ olan ekstra diğer malzemeler için tablo
const EkstraAdetliDigerTable = ({ malzemeler, onItemChange }) => {
    if (!malzemeler || malzemeler.length === 0) return null;
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Adetli Malzemeler</h3>
            <table className="table table-compact w-full">
                <thead><tr><th>Malzeme Adı</th><th>Birim</th><th>Adet</th></tr></thead>
                <tbody>
                    {malzemeler.map(item => (
                        <tr key={item.instance_id}>
                            <th>{item.diger_malzeme?.diger_malzeme_isim}</th>
                            <td>{item.diger_malzeme?.diger_malzeme_birim}</td>
                            <td><input type="number" value={item.adet || ''} onChange={(e) => onItemChange('diger_malzemeler', item.instance_id, 'adet', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// YENİ: Sadece ÖLÇÜLÜ olan ekstra diğer malzemeler için tablo
const EkstraOlculuDigerTable = ({ malzemeler, onItemChange }) => {
    if (!malzemeler || malzemeler.length === 0) return null;
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Ölçülü Malzemeler</h3>
            <table className="table table-compact w-full">
                <thead><tr><th>Malzeme Adı</th><th>Kesim Ölçüsü (mm)</th><th>Adet</th></tr></thead>
                <tbody>
                    {malzemeler.map(item => (
                        <tr key={item.instance_id}>
                            <th>{item.diger_malzeme?.diger_malzeme_isim}</th>
                            <td><input type="number" value={item.kesim_olcusu || ''} onChange={(e) => onItemChange('diger_malzemeler', item.instance_id, 'kesim_olcusu', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                            <td><input type="number" value={item.kesim_adedi || ''} onChange={(e) => onItemChange('diger_malzemeler', item.instance_id, 'kesim_adedi', e.target.value)} className="input input-bordered input-sm w-full" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
// --- ANA COMPONENT ---

const GiyotinSiparisTables = ({ onEkstraMalzemeChange, onEkstraMalzemeEkle, camlarArray, digerMalzemelerArray, profillerArray, ekstraMalzemeTuru, setEkstraMalzemeTuru, ekstraMalzemeler, sistem_genislik, sistem_yukseklik, sistem_adet, seciliSistemTam }) => {
    const scope = { sistem_genislik, sistem_yukseklik, sistem_adet };
        const ekstraOlculuDiger = ekstraMalzemeler.diger_malzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'olculu');
        const ekstraAdetliDiger = ekstraMalzemeler.diger_malzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'adetli');

    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-x-5">
            <div className="w-full lg:w-3/5 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Sistem Hesaplamaları</h2>
                <ProfillerTable profiller={seciliSistemTam.profiller} scope={scope} />
                <EkstraProfillerTable profiller={ekstraMalzemeler.profiller} onItemChange={onEkstraMalzemeChange} />
            </div>
            <div className="w-full lg:w-2/5 flex flex-col mt-5 lg:mt-0">
                <h2 className="text-2xl font-bold mb-2 ml-5">Diğer Hesaplamalar ve Ekstralar</h2>
                <div className="pl-5">
                    <CamOlcusuTable camlar={seciliSistemTam.camlar} scope={scope} />
                    <DigerMalzemelerTable malzemeler={seciliSistemTam.diger_malzemeler} scope={scope} />
                    
                    <h2 className="text-2xl font-bold mb-2 mt-4">Ekstra Malzemeler</h2>
                    <EkstraCamlarTable camlar={ekstraMalzemeler.camlar} onItemChange={onEkstraMalzemeChange} />
                    <EkstraOlculuDigerTable malzemeler={ekstraOlculuDiger} onItemChange={onEkstraMalzemeChange} />
                    <EkstraAdetliDigerTable malzemeler={ekstraAdetliDiger} onItemChange={onEkstraMalzemeChange} />

                    <div className="pt-4">
                        <DialogEkstraMalzemeler
                            dialogTriggerClassName={"btn w-full active:btn-active bg-green-600 border-green-600 text-white text-lg font-roboto"}
                            dialogTriggerTitle={"+ Ekstra Malzeme Ekle"}
                            onEkstraMalzemeEkle={onEkstraMalzemeEkle}
                            profillerArray={profillerArray}
                            digerMalzemelerArray={digerMalzemelerArray}
                            camlarArray={camlarArray}
                            ekstraMalzemeTuru={ekstraMalzemeTuru}
                            setEkstraMalzemeTuru={setEkstraMalzemeTuru}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiyotinSiparisTables;