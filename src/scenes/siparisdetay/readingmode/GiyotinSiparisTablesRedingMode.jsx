import React from 'react';

// --- SİSTEM GEREKSİNİMLERİ TABLOLARI (SALT OKUNUR, DB'DEN) ---

const ProfillerTable = ({ profiller }) => {
    if (!profiller || profiller.length === 0) return null;
    const toplamSistemAgirlik = profiller.reduce((acc, p) => acc + (p.hesaplanan_degerler?.toplam_agirlik || 0), 0);

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
                    {profiller.map((profil, index) => (
                        <tr key={profil.profil_id + '-' + index}>
                            <td>{index + 1}</td>
                            <td>{profil.profil?.profil_kodu}</td>
                            <td>{profil.profil?.profil_isim}</td>
                            <td>{profil.hesaplanan_degerler?.kesim_olcusu ?? '-'}</td>
                            <td>{profil.hesaplanan_degerler?.kesim_adedi ?? '-'}</td>
                            <td>{profil.profil?.birim_agirlik || 0}</td>
                            <td className="font-bold">{(profil.hesaplanan_degerler?.toplam_agirlik ?? 0).toFixed(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CamOlcusuTable = ({ camlar }) => {
    if (!camlar || camlar.length === 0) return null;
    const toplamAlan = camlar.reduce((acc, c) => acc + (c.hesaplanan_degerler?.alan_m2 || 0), 0);

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
                    {camlar.map((cam, index) => (
                        <tr key={cam.cam_id + '-' + index}>
                            <th>{cam.cam?.cam_isim}</th>
                            <td>{cam.hesaplanan_degerler?.genislik ?? '-'}</td>
                            <td>{cam.hesaplanan_degerler?.yukseklik ?? '-'}</td>
                            <td>{cam.hesaplanan_degerler?.adet ?? '-'}</td>
                            <td>{(cam.hesaplanan_degerler?.alan_m2 ?? 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold">
                        <td colSpan={4} className="text-right">Toplam Alan:</td>
                        <td>{toplamAlan.toFixed(2)} m²</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const DigerMalzemelerTable = ({ malzemeler }) => {
    if (!malzemeler || malzemeler.length === 0) return null;
    const olculuMalzemeler = malzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'olculu');
    const adetliMalzemeler = malzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'adetli');

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
                                    <td>{malzeme.diger_malzeme?.diger_malzeme_isim}</td>
                                    <td>{malzeme.hesaplanan_degerler?.olcu ?? '-'}</td>
                                    <td>{malzeme.hesaplanan_degerler?.adet ?? '-'}</td>
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
                                    <td>{malzeme.diger_malzeme?.diger_malzeme_isim}</td>
                                    <td>{malzeme.hesaplanan_degerler?.adet ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};


// --- EKSTRA GEREKSİNİMLERİ TABLOLARI (SALT OKUNUR, DB'DEN) ---

const EkstraProfillerTable = ({ profiller }) => {
    if (!profiller || profiller.length === 0) return null;
    const toplamEkstraAgirlik = profiller.reduce((acc, p) => acc + (p.hesaplanan_degerler?.toplam_agirlik || 0), 0);

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mt-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Profiller</h3>
            <table className="table table-compact w-full">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kod</th>
                        <th>Profil Adı</th>
                        <th>Kesim Ölçüsü</th>
                        <th>Adet</th>
                        <th>Toplam Ağırlık (Kg)</th>
                    </tr>
                </thead>
                <tbody>
                    {profiller.map((item, index) => (
                        <tr key={item.profil_id + '-' + index}>
                            <th>{index + 1}</th>
                            <td>{item.profil?.profil_kodu}</td>
                            <td>{item.profil?.profil_isim}</td>
                            <td>{item.hesaplanan_degerler?.kesim_olcusu ?? '-'}</td>
                            <td>{item.hesaplanan_degerler?.kesim_adedi ?? '-'}</td>
                            <td className="font-bold">{(item.hesaplanan_degerler?.toplam_agirlik ?? 0).toFixed(3)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-right font-bold">Toplam:</td>
                        <td className="font-bold">{toplamEkstraAgirlik.toFixed(3)} Kg</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const EkstraCamlarTable = ({ camlar }) => {
    if (!camlar || camlar.length === 0) return null;
    const toplamAlan = camlar.reduce((acc, c) => acc + (c.hesaplanan_degerler?.alan_m2 || 0), 0);

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
            <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Camlar</h3>
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
                    {camlar.map((item, index) => (
                        <tr key={item.cam_id + '-' + index}>
                            <th>{item.cam?.cam_isim}</th>
                            <td>{item.hesaplanan_degerler?.genislik ?? '-'}</td>
                            <td>{item.hesaplanan_degerler?.yukseklik ?? '-'}</td>
                            <td>{item.hesaplanan_degerler?.adet ?? '-'}</td>
                            <td className="font-bold">{(item.hesaplanan_degerler?.alan_m2 ?? 0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="text-right font-bold">Toplam:</td>
                        <td className="font-bold">{toplamAlan.toFixed(2)} m²</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const EkstraDigerTable = ({ digerMalzemeler }) => {
    if (!digerMalzemeler || digerMalzemeler.length === 0) return null;

    // Hem olculu hem adetli tabloyu aynı anda göstermek için
    const olculu = digerMalzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'olculu');
    const adetli = digerMalzemeler.filter(m => m.diger_malzeme?.hesaplama_turu === 'adetli');

    return (
        <>
            {olculu.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
                    <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Ölçülü Malzemeler</h3>
                    <table className="table table-compact w-full">
                        <thead><tr><th>Malzeme Adı</th><th>Kesim Ölçüsü (mm)</th><th>Adet</th></tr></thead>
                        <tbody>
                            {olculu.map((item, idx) => (
                                <tr key={item.diger_malzeme_id + '-' + idx}>
                                    <th>{item.diger_malzeme?.diger_malzeme_isim}</th>
                                    <td>{item.hesaplanan_degerler?.kesim_olcusu ?? '-'}</td>
                                    <td>{item.hesaplanan_degerler?.adet ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {adetli.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl mb-5">
                    <h3 className="text-xl font-semibold p-3 bg-base-200 rounded-t-2xl">Ekstra Adetli Malzemeler</h3>
                    <table className="table table-compact w-full">
                        <thead><tr><th>Malzeme Adı</th><th>Birim</th><th>Adet</th></tr></thead>
                        <tbody>
                            {adetli.map((item, idx) => (
                                <tr key={item.diger_malzeme_id + '-' + idx}>
                                    <th>{item.diger_malzeme?.diger_malzeme_isim}</th>
                                    <td>{item.diger_malzeme?.diger_malzeme_birim}</td>
                                    <td>{item.hesaplanan_degerler?.adet ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};


// --- ANA COMPONENT ---

const GiyotinSiparisTablesRedingMode = ({ urun }) => {
    // urun = siparis.urunler[0]
    if (!urun) return null;
    return (
        <div className="flex flex-col lg:flex-row h-full w-full gap-x-5">
            <div className="w-full lg:w-3/5 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Sistem Hesaplamaları</h2>
                <ProfillerTable profiller={urun.hesaplananGereksinimler?.profiller} />
                <EkstraProfillerTable profiller={urun.ekstraGereksinimler?.profiller} />
            </div>
            <div className="w-full lg:w-2/5 flex flex-col mt-5 lg:mt-0">
                <h2 className="text-2xl font-bold mb-2 ml-5">Diğer Hesaplamalar ve Ekstralar</h2>
                <div className="pl-5">
                    <CamOlcusuTable camlar={urun.hesaplananGereksinimler?.camlar} />
                    <DigerMalzemelerTable malzemeler={urun.hesaplananGereksinimler?.diger_malzemeler} />

                    <h2 className="text-2xl font-bold mb-2 mt-4">Ekstra Malzemeler</h2>
                    <EkstraCamlarTable camlar={urun.ekstraGereksinimler?.camlar} />
                    <EkstraDigerTable digerMalzemeler={urun.ekstraGereksinimler?.diger_malzemeler} />
                </div>
            </div>
        </div>
    );
};

export default GiyotinSiparisTablesRedingMode;
