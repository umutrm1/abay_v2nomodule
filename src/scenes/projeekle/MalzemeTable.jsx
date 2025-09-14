// src/scenes/projeler/MalzemeTable.jsx
import React from 'react';

const MalzemeTable = ({
  extraProfiles = [],
  extraGlasses = [],
  extraRequirements = []
}) => {
  // Sadece malzemelerden, ölçülü ve adetli olarak ayırıyoruz
  const olculu = extraRequirements.filter(
    req => req.material?.hesaplama_turu === 'olculu'
  );
  const adetli = extraRequirements.filter(
    req => req.material?.hesaplama_turu === 'adetli'
  );

  return (
    <div className="space-y-6">
      {/* Ekstra Profiller */}
      {extraProfiles.length > 0 && (
        <div className="overflow-auto border border-gray-200 rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Profiller</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Profil Kodu</th>
                <th>Profil İsim</th>
                <th>Kesim Ölçüsü (mm)</th>
                <th>Kesim Adedi</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {extraProfiles.map((p, i) => (
                <tr key={`${p.profile_id}_${i}`}>
                  <td>{p.profile.profil_kodu}</td>
                  <td>{p.profile.profil_isim}</td>
                  <td>{p.cut_length_mm}</td>
                  <td>{p.cut_count}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
                      Düzenle
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekstra Camlar */}
      {extraGlasses.length > 0 && (
        <div className="overflow-auto border border-gray-200 rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Camlar</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Cam İsim</th>
                <th>Yükseklik (mm)</th>
                <th>Genişlik (mm)</th>
                <th>Adet</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {extraGlasses.map((g, i) => (
                <tr key={`${g.glass_type_id}_${i}`}>
                  <td>{g.glass_type.cam_isim}</td>
                  <td>{g.height_mm}</td>
                  <td>{g.width_mm}</td>
                  <td>{g.count}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
                      Düzenle
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ölçülü Ekstra Malzemeler */}
      {olculu.length > 0 && (
        <div className="overflow-auto border border-gray-200 rounded-2xl p-4">
          <div className="font-semibold mb-2">Ölçülü Ekstra Malzemeler</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Malzeme İsim</th>
                <th>Birim</th>
                <th>Kesim Ölçüsü (mm)</th>
                <th>Kesim Adedi</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {olculu.map((m, i) => (
                <tr key={`${m.material_id}_${i}`}>
                  <td>{m.material.diger_malzeme_isim}</td>
                  <td>{m.material.birim}</td>
                  <td>{m.cut_length_mm}</td>
                  <td>{m.count}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
                      Düzenle
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adetli Ekstra Malzemeler */}
      {adetli.length > 0 && (
        <div className="overflow-auto border border-gray-200 rounded-2xl p-4">
          <div className="font-semibold mb-2">Adetli Ekstra Malzemeler</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Malzeme İsim</th>
                <th>Birim</th>
                <th>Adet</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {adetli.map((m, i) => (
                <tr key={`${m.material_id}_${i}`}>
                  <td>{m.material.diger_malzeme_isim}</td>
                  <td>{m.material.birim}</td>
                  <td>{m.count}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
                      Düzenle
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MalzemeTable;
