// src/scenes/sistemekle/SistemEkleTables.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as math from 'mathjs';
import { editProjeSystemOnApi } from '@/redux/actions/actions_projeler.js';
import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler.js';
import DialogSistemDuzenleOnProject from './DialogSistemDuzenleOnProject.jsx';

const SistemEkleTables = ({ systems = [], onRefresh }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const seciliSistemTam = useSelector(
    state => state.getSystemFullVariantsOfSystemFromApiReducer
  ) || {};

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedSys, setSelectedSys] = useState(null);

  const handleEdit = async (sys) => {
    setSelectedSys(sys);
    setDialogOpen(true);
    setDialogLoading(true);
    try {
      await dispatch(getSystemFullVariantsOfSystemFromApi(sys.system_variant_id));
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDialogSave = async ({ width_mm, height_mm, quantity }) => {
    if (!selectedSys) return;
    try {
      setSavingEdit(true);

      const profiles = (seciliSistemTam.profile_templates || []).map(tpl => {
        const cut_length_mm = math.evaluate(tpl.formula_cut_length, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        const cut_count = math.evaluate(tpl.formula_cut_count, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        const total_weight_kg = (cut_length_mm * cut_count * (tpl.profile?.birim_agirlik || 0)) / 1000;
        return {
          profile_id: tpl.profile_id,
          cut_length_mm,
          cut_count,
          total_weight_kg
        };
      });

      const glasses = (seciliSistemTam.glass_templates || []).map(tpl => {
        const g_width_mm = math.evaluate(tpl.formula_width, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        const g_height_mm = math.evaluate(tpl.formula_height, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        const g_count = math.evaluate(tpl.formula_count, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        const area_m2 = (g_width_mm * g_height_mm * g_count) / 1_000_000;
        return {
          glass_type_id: tpl.glass_type_id,
          width_mm: g_width_mm,
          height_mm: g_height_mm,
          count: g_count,
          area_m2
        };
      });

      const materials = (seciliSistemTam.material_templates || []).map(tpl => {
        const count = math.evaluate(tpl.formula_quantity, {
          sistem_genislik: width_mm,
          sistem_yukseklik: height_mm,
          sistem_adet: quantity
        });
        return {
          material_id: tpl.material_id,
          count,
          cut_length_mm: width_mm
        };
      });

      const editedSystem = {
        project_system_id: selectedSys.project_system_id,
        system_variant_id: selectedSys.system_variant_id,
        width_mm,
        height_mm,
        quantity,
        profiles,
        glasses,
        materials
      };

      await dispatch(editProjeSystemOnApi(projectId, selectedSys.project_system_id, editedSystem));
      onRefresh?.();
      setDialogOpen(false);
      setSelectedSys(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const sorted = [...systems].sort((a, b) => {
    const nameA = `${a.system?.name || ''} ${a.name || ''}`.toLowerCase();
    const nameB = `${b.system?.name || ''} ${b.name || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-auto mt-5 rounded-2xl border bg-card text-foreground border-border">
      <table className="table w-full">
        <thead className="bg-muted/50 text-foreground">
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
              return (
                <tr key={sys.project_system_id} className="hover:bg-muted/40">
                  <td>{fullName}</td>
                  <td>{sys.width_mm}</td>
                  <td>{sys.height_mm}</td>
                  <td>{sys.quantity}</td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => handleEdit(sys)}
                      disabled={savingEdit}
                      className="btn btn-warning btn-sm"
                      title="Sistemi düzenle"
                    >
                      {savingEdit ? "Kaydediliyor…" : "Düzenle"}
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      disabled={savingEdit}
                      title="Sistemi sil"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted-foreground">
                Sistem bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <DialogSistemDuzenleOnProject
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelectedSys(null);
        }}
        title="Sistem Düzenle"
        initial={{
          width_mm: selectedSys?.width_mm,
          height_mm: selectedSys?.height_mm,
          quantity: selectedSys?.quantity,
        }}
        loading={dialogLoading}
        saving={savingEdit}
        onSave={handleDialogSave}
      />
    </div>
  );
};

export default SistemEkleTables;
