// src/scenes/sistemekle/SistemEkleTables.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as math from 'mathjs';
import { editProjeSystemOnApi } from '@/redux/actions/actions_projeler';
import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler';
const SistemEkleTables = ({ systems = [], onRefresh }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const seciliSistemTam = useSelector(
    state => state.getSystemFullVariantsOfSystemFromApiReducer
  ) || {};
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedWidth, setEditedWidth] = useState(0);
  const [editedHeight, setEditedHeight] = useState(0);
  const [editedQuantity, setEditedQuantity] = useState(0);

  const handleEdit = async sys => {
    // 1) Düzenleme başlıyor → spinner göster
    setLoadingEdit(true);
    // 2) Variant verisini çek
    await dispatch(getSystemFullVariantsOfSystemFromApi(sxys.system_variant_id));

    // 3) Düzenleme moduna geç ve değerleri set et
    setEditingId(sys.project_system_id);
    setEditedWidth(sys.width_mm);
    setEditedHeight(sys.height_mm);
    setEditedQuantity(sys.quantity);
    // 4) Veri geldi → spinner’ı gizle
    setLoadingEdit(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (sys) => {
    // 1) Formülleri çalıştırarak profiller-glass-materials yeniden hesapla
    const profiles = (seciliSistemTam.profile_templates || []).map(tpl => {
      const cut_length_mm = math.evaluate(tpl.formula_cut_length, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      const cut_count = math.evaluate(tpl.formula_cut_count, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      const total_weight_kg = cut_length_mm * cut_count * (tpl.profile.birim_agirlik || 0) / 1000;
      return {
        profile_id: tpl.profile_id,
        cut_length_mm,
        cut_count,
        total_weight_kg
      };
    });

    const glasses = (seciliSistemTam.glass_templates || []).map(tpl => {
      const width_mm = math.evaluate(tpl.formula_width, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      const height_mm = math.evaluate(tpl.formula_height, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      const count = math.evaluate(tpl.formula_count, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      const area_m2 = (width_mm * height_mm * count) / 1_000_000;
      return {
        glass_type_id: tpl.glass_type_id,
        width_mm,
        height_mm,
        count,
        area_m2
      };
    });

    const materials = (seciliSistemTam.material_templates || []).map(tpl => {
      const count = math.evaluate(tpl.formula_quantity, {
        sistem_genislik: editedWidth,
        sistem_yukseklik: editedHeight,
        sistem_adet: editedQuantity
      });
      return {
        material_id: tpl.material_id,
        count,
        cut_length_mm: editedWidth
      };
    });

    // 2) API’ye gönderilecek payload’u hazırla
    const editedSystem = {
      project_system_id: sys.project_system_id,
      system_variant_id: sys.system_variant_id,
      width_mm: editedWidth,
      height_mm: editedHeight,
      quantity: editedQuantity,
      profiles,
      glasses,
      materials
    };

    // 3) Dispatch ile PUT isteğini at ve ardından düzenleme modunu kapat
    await dispatch(editProjeSystemOnApi(projectId, sys.project_system_id, editedSystem));
    onRefresh()
    setEditingId(null);
  };

  // Sistemleri ada göre sırala
  const sorted = [...systems].sort((a, b) => {
    const nameA = `${a.system?.name || ''} ${a.name || ''}`.toLowerCase();
    const nameB = `${b.system?.name || ''} ${b.name || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-auto mt-5 border border-gray-200 rounded-2xl">
      {loadingEdit ? (
        <div className="flex justify-center items-center h-32">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <table className="table w-full"><thead>
          <tr>
            <th>Sistem İsmi</th>
            <th>En (mm)</th>
            <th>Boy (mm)</th>
            <th>Adet</th>
            <th className="text-right">İşlemler</th>
          </tr>
        </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map(sys => {
                const fullName = `${sys.system?.name || ''} ${sys.name || ''}`;
                const isEditing = editingId === sys.project_system_id;
                return (
                  <tr key={sys.project_system_id}>
                    <td>{fullName}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedWidth}
                          onChange={e => setEditedWidth(+e.target.value)}
                          className="input input-bordered w-24"
                        />
                      ) : (
                        sys.width_mm
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedHeight}
                          onChange={e => setEditedHeight(+e.target.value)}
                          className="input input-bordered w-24"
                        />
                      ) : (
                        sys.height_mm
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedQuantity}
                          onChange={e => setEditedQuantity(+e.target.value)}
                          className="input input-bordered w-16"
                        />
                      ) : (
                        sys.quantity
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(sys)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            İptal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(sys)}
                            disabled={!!editingId || loadingEdit}
                            className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                          >
                            Düzenle
                          </button>
                          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Sil
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">
                  Sistem bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SistemEkleTables;
