import React from 'react';
import AppButton from '@/components/ui/AppButton.jsx';

const MalzemeTable = ({
  extraProfiles = [],
  extraGlasses = [],
  extraRequirements = [],
  extraRemotes = []
}) => {
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
        <div className="overflow-auto bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Profiller</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Profil Kodu</th>
                <th>Profil İsim</th>
                <th>Kesim Ölçüsü (mm)</th>
                <th>Kesim Adedi</th>
                <th>Birim Fiyat</th>
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
                  <td>eklenecek</td>
                  <td className="text-right space-x-2">
                    <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                      Düzenle
                    </AppButton>
                    <AppButton variant="kirmizi" size="sm" shape="none" title="Sil">
                      Sil
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekstra Camlar */}
      {extraGlasses.length > 0 && (
        <div className="overflow-auto bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Camlar</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Cam İsim</th>
                <th>Yükseklik (mm)</th>
                <th>Genişlik (mm)</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
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
                  <td>eklenecek</td>
                  <td className="text-right space-x-2">
                    <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                      Düzenle
                    </AppButton>
                    <AppButton variant="kirmizi" size="sm" shape="none" title="Sil">
                      Sil
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ölçülü Ekstra Malzemeler */}
      {olculu.length > 0 && (
        <div className="overflow-auto bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ölçülü Ekstra Malzemeler</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Malzeme İsim</th>
                <th>Birim</th>
                <th>Kesim Ölçüsü (mm)</th>
                <th>Kesim Adedi</th>
                <th>Birim Fiyat</th>
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
                  <td>{m.unit_price}</td>
                  <td className="text-right space-x-2">
                    <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                      Düzenle
                    </AppButton>
                    <AppButton variant="kirmizi" size="sm" shape="none" title="Sil">
                      Sil
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adetli Ekstra Malzemeler */}
      {adetli.length > 0 && (
        <div className="overflow-auto bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Adetli Ekstra Malzemeler</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Malzeme İsim</th>
                <th>Birim</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {adetli.map((m, i) => (
                <tr key={`${m.material_id}_${i}`}>
                  <td>{m.material.diger_malzeme_isim}</td>
                  <td>{m.material.birim}</td>
                  <td>{m.count}</td>
                  <td>{m.unit_price}</td>
                  <td className="text-right space-x-2">
                    <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                      Düzenle
                    </AppButton>
                    <AppButton variant="kirmizi" size="sm" shape="none" title="Sil">
                      Sil
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekstra Kumandalar */}
      {Array.isArray(extraRemotes) && (
        <div className="overflow-auto bg-card text-foreground border border-border rounded-2xl p-4">
          <div className="font-semibold mb-2">Ekstra Kumandalar</div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Kumanda İsim</th>
                <th className="text-right">Adet</th>
                <th className="text-right">Birim Fiyat</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {extraRemotes.length > 0 ? (
                extraRemotes.map((row, i) => {
                  const name = row?.remote?.kumanda_isim || '—';
                  const count = Number(row?.count) || 0;
                  const unitPrice = row?.remote?.price || 0;
                  return (
                    <tr key={`${row.remote_id || 'remote'}_${i}`}>
                      <td>{name}</td>
                      <td className="text-right">{count}</td>
                      <td className="text-right">
                        {unitPrice.toLocaleString('tr-TR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2
                        })} ₺
                      </td>
                      <td className="text-right space-x-2">
                        <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                          Düzenle
                        </AppButton>
                        <AppButton variant="kirmizi" size="sm" shape="none" title="Sil">
                          Sil
                        </AppButton>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground py-6">
                    Ekstra kumanda bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MalzemeTable;
