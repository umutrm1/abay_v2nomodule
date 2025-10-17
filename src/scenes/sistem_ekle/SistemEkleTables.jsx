import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as math from 'mathjs';
import { editProjeSystemOnApi, deleteProjeSystemOnApi } from '@/redux/actions/actions_projeler.js';
import { getSystemFullVariantsOfSystemFromApi } from '@/redux/actions/actions_sistemler.js';
import DialogSistemDuzenleOnProject from '@/components/DialogSistemDuzenleOnProject.jsx';
import AppButton from '@/components/ui/AppButton.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';

// —— SistemEkle.jsx ile aynı yardımcı fonksiyonlar —— //
const round2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

const guvenliHesapla = (expr, scope) => {
  try {
    const value = math.evaluate(expr, scope);
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
};

function applyChunkByLength(tpl, rl) {
  const pieceLen = Math.max(1, Math.round(tpl?.piece_length_mm || 100));
  const L = Math.max(0, Math.round(rl || 0));
  const count = L === 0 ? 0 : Math.ceil(L / pieceLen);
  return { count, cut_length_mm: pieceLen };
}

const SistemEkleTables = ({ systems = [], onRefresh }) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const seciliSistemTam =
    useSelector((state) => state.getSystemFullVariantsOfSystemFromApiReducer) || {};

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedSys, setSelectedSys] = useState(null);

  // --- Silme ile ilgili state'ler ---
  const [confirmOpen, setConfirmOpen] = useState(false);   // onay modal
  const [deletingId, setDeletingId] = useState(null);      // silinecek project_system_id
  const [deleting, setDeleting] = useState(false);         // API çağrısı sırasında kilitle

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

  // —— DÜZENLE KAYDET: SistemEkle.jsx ile aynı hesaplama yöntemi —— //
  const handleDialogSave = async ({ width_mm, height_mm, quantity }) => {
    if (!selectedSys) return;
    try {
      setSavingEdit(true);

      // Girdi güvenliği + yuvarlama
      const W = Math.round(Number(width_mm) || 0);
      const H = Math.round(Number(height_mm) || 0);
      const Q = Math.round(Number(quantity) || 0);

      const scope = {
        sistem_genislik: W,
        sistem_yukseklik: H,
        sistem_adet: Q,
      };

      // ——— PROFİLLER ———
      const profiles = (seciliSistemTam.profile_templates || []).map((tpl) => {
        const cut_length_mm = Math.round(guvenliHesapla(tpl.formula_cut_length, scope));
        const cut_count    = Math.round(guvenliHesapla(tpl.formula_cut_count,   scope));
        const birimAgirlik = Number(tpl.profile?.birim_agirlik || 0);
        const toplamKg     = (cut_length_mm / 1000) * cut_count * birimAgirlik;
        const total_weight_kg = round2(toplamKg);

        return {
          profile_id: tpl.profile_id,
          cut_length_mm,
          cut_count,
          total_weight_kg,
        };
      });

      // ——— CAMLAR ———
      const glasses = (seciliSistemTam.glass_templates || []).map((tpl) => {
        const gW = Math.round(guvenliHesapla(tpl.formula_width,  scope));
        const gH = Math.round(guvenliHesapla(tpl.formula_height, scope));
        const gC = Math.round(guvenliHesapla(tpl.formula_count,  scope));
        const area_m2 = round2((gW * gH * gC) / 1_000_000);

        return {
          glass_type_id: tpl.glass_type_id,
          width_mm: gW,
          height_mm: gH,
          count: gC,
          area_m2,
        };
      });

      // ——— MALZEMELER ———
      const materials = (seciliSistemTam.material_templates || []).map((tpl) => {
        const rq = guvenliHesapla(tpl.formula_quantity,   scope);
        const rl = guvenliHesapla(tpl.formula_cut_length, scope);

        let count;
        let cut_length_mm;

        if (tpl?.type === 'chunk_by_length') {
          // toplam gereksinimi parça boyuna böler
          ({ count, cut_length_mm } = applyChunkByLength(tpl, rl));
        } else {
          count = Math.round(rq);
          cut_length_mm = Math.round(rl);
        }

        return {
          material_id: tpl.material_id,
          count,
          cut_length_mm,
        };
      });

      const editedSystem = {
        project_system_id: selectedSys.project_system_id,
        system_variant_id: selectedSys.system_variant_id,
        width_mm: W,
        height_mm: H,
        quantity: Q,
        profiles,
        glasses,
        materials,
      };

      await dispatch(editProjeSystemOnApi(projectId, selectedSys.project_system_id, editedSystem));
      onRefresh?.();
      setDialogOpen(false);
      setSelectedSys(null);
    } finally {
      setSavingEdit(false);
    }
  };

  // --- Sil akışı ---
  const requestDelete = (sys) => {
    // 1) Sil butonuna basıldı: hedef id'yi al, modal'ı aç
    setDeletingId(sys.project_system_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      // 2) API çağrısı: başarılıysa actions içindeki toastSuccess/refresh zaten tetikleniyor
      await dispatch(deleteProjeSystemOnApi(projectId, deletingId));
      // 3) Listeyi yenile (yine de garanti olsun)
      onRefresh?.();
      // 4) Modal state reset
      setConfirmOpen(false);
      setDeletingId(null);
    } finally {
      setDeleting(false);
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
            sorted.map((sys) => {
              const fullName = `${sys.system?.name || ''} ${sys.name || ''}`;
              const isRowDeleting = deleting && deletingId === sys.project_system_id;
              return (
                <tr key={sys.project_system_id} className="hover:bg-muted/40">
                  <td>{fullName}</td>
                  <td>{sys.width_mm}</td>
                  <td>{sys.height_mm}</td>
                  <td>{sys.quantity}</td>
                  <td className="text-right space-x-2">
                    <AppButton
                      onClick={() => handleEdit(sys)}
                      variant="sari"
                      size="sm"
                      shape="none"
                      disabled={savingEdit || deleting}
                      title="Sistemi düzenle"
                    >
                      {savingEdit && selectedSys?.project_system_id === sys.project_system_id
                        ? 'Kaydediliyor…'
                        : 'Düzenle'}
                    </AppButton>

                    <AppButton
                      variant="kirmizi"
                      size="sm"
                      shape="none"
                      disabled={savingEdit || deleting}
                      title="Sistemi sil"
                      onClick={() => requestDelete(sys)}
                    >
                      {isRowDeleting ? 'Siliniyor…' : 'Sil'}
                    </AppButton>
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

      {/* Düzenleme diyaloğu */}
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

      {/* Silme onay diyaloğu */}
      <ConfirmDeleteModal
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v);
          if (!v) setDeletingId(null);
        }}
        title="Sistemi silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz. İlgili proje sistem kaydı kalıcı olarak silinecek."
        confirmText={deleting ? 'Siliniyor…' : 'Evet, sil'}
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default SistemEkleTables;
