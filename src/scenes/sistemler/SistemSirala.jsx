// src/scenes/sistemler/SistemSirala.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as RadixDialog from "@radix-ui/react-dialog";
import AppButton from "@/components/ui/AppButton.jsx";
import { getSistemlerFromApi, editSystemOnApi } from "@/redux/actions/actions_sistemler.js";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 0, total_pages: 1, has_next: false, has_prev: false };

const InlineSpinner = () => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" />
    <span className="text-sm text-foreground/80">İşleniyor…</span>
  </div>
);

/**
 * Props:
 *  - open, onOpenChange
 */
export default function SistemSirala({ open, onOpenChange }) {
  const dispatch = useDispatch();

  // Ana reducer: sayfada zaten kullanılan listeyi okuyoruz.
  const systemsPage = useSelector((s) => s.getSistemlerFromApiReducer) || EMPTY_PAGE;

  // Store → items dizisini normalize et
  const storeItems = useMemo(() => {
    if (Array.isArray(systemsPage)) return systemsPage;
    if (Array.isArray(systemsPage?.items)) return systemsPage.items;
    return [];
  }, [systemsPage]);

  // Local sıralama listesi
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal açıldığında TÜM sistemleri limit=all ile çek
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        await dispatch(getSistemlerFromApi(1, "", "all"));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, dispatch]);

  // Store değişince local listeyi sort_index'e göre sırala ve kopyala
  useEffect(() => {
    if (!open) return;
    const sorted = [...storeItems]
      .sort((a, b) => {
        const ai = Number(a?.sort_index ?? 0);
        const bi = Number(b?.sort_index ?? 0);
        if (ai === bi) {
          // eşit durumda deterministik: ada göre
          return String(a?.name || "").localeCompare(String(b?.name || ""), "tr");
        }
        return ai - bi;
      });
    setList(sorted);
  }, [storeItems, open]);

  // Yukarı/aşağı taşı
  const moveUp = (idx) => {
    if (idx <= 0) return;
    setList((prev) => {
      const cp = [...prev];
      const t = cp[idx - 1];
      cp[idx - 1] = cp[idx];
      cp[idx] = t;
      return cp;
    });
  };
  const moveDown = (idx) => {
    setList((prev) => {
      if (idx >= prev.length - 1) return prev;
      const cp = [...prev];
      const t = cp[idx + 1];
      cp[idx + 1] = cp[idx];
      cp[idx] = t;
      return cp;
    });
  };

  // Değişiklik var mı?
  const hasChanges = useMemo(() => {
    if (list.length !== storeItems.length) return true;
    for (let i = 0; i < list.length; i++) {
      const desired = i + 1;
      if (Number(list[i]?.sort_index ?? 0) !== desired) return true;
    }
    return false;
  }, [list, storeItems]);

  // Kaydet
  const onSave = async () => {
    if (!hasChanges || saving) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    try {
      // 1..N yeni index’leri hesapla
      const updates = list.map((sys, i) => ({
        id: sys.id,
        prevIndex: Number(sys?.sort_index ?? 0),
        nextIndex: i + 1,
      }));
      const changed = updates.filter((u) => u.prevIndex !== u.nextIndex);

      // Sadece değişenlere PUT
      for (const u of changed) {
        await dispatch(editSystemOnApi(u.id, { sort_index: u.nextIndex }));
      }

      // Doğrulama için tekrar full listeyi çek
      await dispatch(getSistemlerFromApi(1, "", "all"));

      // Modalı kapat
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 z-40 bg-black/30
                     data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200
                     data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200"
        />
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <RadixDialog.Content
            className="relative w-full max-w-[720px] max-h-[90vh]
                       bg-card text-foreground border border-border rounded-2xl shadow-xl
                       p-5 overflow-hidden flex flex-col"
          >
            {(loading || saving) && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex items-center justify-center">
                <InlineSpinner />
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <RadixDialog.Title className="text-lg font-semibold">
                Sistemleri Sırala
              </RadixDialog.Title>
              <RadixDialog.Close asChild>
                <AppButton variant="kirmizi" size="sm" shape="none">Kapat</AppButton>
              </RadixDialog.Close>
            </div>

            <div className="overflow-auto border border-border rounded-xl">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-16 text-center">Sıra</th>
                    <th>Sistem Adı</th>
                    <th>Açıklama</th>
                    <th className="text-center">Yayın</th>
                    <th className="text-center">Aktif</th>
                    <th className="w-32 text-center">Taşı</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="text-center">{idx + 1}</td>
                      <td>{s.name}</td>
                      <td className="truncate max-w-[280px]">{s.description}</td>
                      <td className="text-center">
                        <span className={`px-2 py-1 rounded-md text-xs ${s.is_published ? 'bg-blue-600 text-white' : 'bg-zinc-600 text-white'}`}>
                          {s.is_published ? 'Yayında' : 'Taslak'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-1 rounded-md text-xs ${s.is_active ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white'}`}>
                          {s.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <AppButton
                            size="sm"
                            variant="gri"
                            shape="none"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            title="Yukarı taşı"
                          >
                            ↑
                          </AppButton>
                          <AppButton
                            size="sm"
                            variant="gri"
                            shape="none"
                            onClick={() => moveDown(idx)}
                            disabled={idx === list.length - 1}
                            title="Aşağı taşı"
                          >
                            ↓
                          </AppButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-foreground">
                        Sistem bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <AppButton
                variant="gri"
                size="sm"
                shape="none"
                onClick={() => {
                  const restored = [...storeItems]
                    .sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
                  setList(restored);
                }}
                disabled={list.length === 0}
                title="Değişiklikleri geri al"
              >
                Sıralamayı Sıfırla
              </AppButton>

              <AppButton
                variant="yesil"
                size="sm"
                shape="none"
                onClick={onSave}
                disabled={list.length === 0 || saving || !hasChanges}
                title="Yeni sıralamayı kaydet (1..N)"
              >
                Kaydet
              </AppButton>
            </div>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
