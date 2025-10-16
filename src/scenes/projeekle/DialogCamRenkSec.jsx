import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as RadixDialog from "@radix-ui/react-dialog";

import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getGlassColorFromApi } from "@/redux/actions/actions_boyalar.js";
import * as actions_projeler from "@/redux/actions/actions_projeler.js";
import AppButton from "@/components/ui/AppButton.jsx";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const InlineSpinner = () => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 border-4 border-border border-t-primary rounded-full animate-spin" />
    <span className="text-sm text-foreground/80">Güncelleniyor…</span>
  </div>
);

/**
 * Props:
 * - open, onOpenChange
 * - requirements: Proje gereksinimleri (ProjeDuzenle’den geliyor)
 * - projectId: URL parametresi (ProjeDuzenle’den geliyor)
 */
const DialogCamRenkSec = ({ open, onOpenChange, requirements, projectId }) => {
  const dispatch = useDispatch();

  // Renk seçim modalı için sayfalı veri
  const colorsPage = useSelector((s) => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;
  const fetchPage = useCallback((page, q) => dispatch(getGlassColorFromApi(page, q, LIMIT)), [dispatch]);

  // Üst mod düğmeleri
  const [mode, setMode] = useState("bySystem"); // "bySystem" | "byType" | "all"

  // Alt renk seçim modalı durumu
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [target, setTarget] = useState(null);
  // target:
  //   { type: 'single', psgId }
  //   { type: 'bulk',  glass_type_id, system_variant_id }
  //   { type: 'all' }

  // Refresh spinner (overlay) kontrolü
  const [refreshing, setRefreshing] = useState(false);

  const systems = Array.isArray(requirements?.systems) ? requirements.systems : [];

  // Cam türüne göre tekilleştirme (glass_type_id)
  const uniqueGlassTypes = useMemo(() => {
    const map = new Map();
    systems.forEach((sys) => {
      (sys.glasses || []).forEach((g) => {
        if (!map.has(g.glass_type_id)) {
          map.set(g.glass_type_id, {
            glass_type_id: g.glass_type_id,
            name: g?.glass_type?.cam_isim || "Cam Türü",
          });
        }
      });
    });
    return Array.from(map.values());
  }, [systems]);

  // Belirli bir cam türünün "mevcut renk" özetini üret
  const getColorSummaryForType = useCallback((glass_type_id) => {
    const names = new Set();
    systems.forEach((sys) => {
      (sys.glasses || []).forEach((g) => {
        if (g.glass_type_id === glass_type_id) {
          const nm = g?.glass_color?.name || "-";
          names.add(nm);
        }
      });
    });
    if (names.size === 0) return "-";
    if (names.size === 1) return Array.from(names)[0];
    return `Karma (${names.size} renk)`;
  }, [systems]);

  // Tek bir cam satırı için renk modalını aç
  const openColorForSingle = (psgId) => {
    setTarget({ type: "single", psgId });
    setColorDialogOpen(true);
  };

  // Belirli cam türündeki tüm satırlar için renk modalını aç
  const openColorForType = (glass_type_id) => {
    let system_variant_id = null;
    for (const sys of systems) {
      const hit = (sys.glasses || []).some((g) => g.glass_type_id === glass_type_id);
      if (hit) {
        system_variant_id = sys.system_variant_id || sys?.system_variant?.id || null;
        break;
      }
    }
    setTarget({ type: "bulk", glass_type_id, system_variant_id });
    setColorDialogOpen(true);
  };

  // Renk seçildiğinde API çağrısı + refresh
  const handleColorSelect = async (row) => {
    const glassColorId = row?.id;
    if (!glassColorId || !target) return;

    try {
      setRefreshing(true);

      if (target.type === "single") {
        await dispatch(
          actions_projeler.updateSystemGlassColorInProject(projectId, target.psgId, glassColorId)
        );
      } else if (target.type === "bulk") {
        await dispatch(
          actions_projeler.updateSameGlassesInProject(
            projectId,
            target.system_variant_id,
            target.glass_type_id,
            glassColorId
          )
        );
      } else if (target.type === "all") {
        await dispatch(
          actions_projeler.updateAllGlassesColorInProject(projectId, glassColorId)
        );
      }

      // Yalnızca renk seçme modalını kapat (ana dialog açık kalsın)
      setColorDialogOpen(false);

      // Gereksinimleri tazele
      await dispatch(actions_projeler.getProjeRequirementsFromApi(projectId));
    } finally {
      setRefreshing(false);
      setTarget(null);
    }
  };

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        {/* Overlay */}
        <RadixDialog.Overlay
          className="fixed inset-0 z-40 bg-black/30
                     data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200 data-[state=open]:ease-in-out
                     data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:ease-in-out"
        />

        {/* Merkezleme wrapper */}
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          {/* Panel */}
          <RadixDialog.Content
            className="relative w-full max-w-[1000px] max-h-[90vh]
                       bg-card text-foreground border border-border rounded-2xl shadow-xl
                       p-5 overflow-hidden flex flex-col
                       data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 data-[state=open]:duration-200 data-[state=open]:ease-in-out
                       data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2 data-[state=closed]:duration-200 data-[state=closed]:ease-in-out"
          >
            {/* Refresh overlay */}
            {refreshing && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex items-center justify-center">
                <InlineSpinner />
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <RadixDialog.Title className="text-lg font-semibold">Cam Rengini Uygula</RadixDialog.Title>

            </div>

            {/* Üst mod düğmeleri */}
            <div className="flex gap-2 mb-4">
              <AppButton
                variant={mode === "bySystem" ? "kurumsalmavi" : "gri"}
                size="sm"
                shape="none"
                onClick={() => setMode("bySystem")}
                title="Sistem içindeki tek cam satırına göre uygula"
              >
                Sistem İçindeki Cama Göre
              </AppButton>
              <AppButton
                variant={mode === "byType" ? "kurumsalmavi" : "gri"}
                size="sm"
                shape="none"
                onClick={() => setMode("byType")}
                title="Cam türüne göre tüm satırlara uygula"
              >
                Cam Türüne Göre
              </AppButton>
              <AppButton
                variant={mode === "all" ? "kurumsalmavi" : "gri"}
                size="sm"
                shape="none"
                onClick={() => setMode("all")}
                title="Projede yer alan tüm camlara uygula"
              >
                Tüm Camlar
              </AppButton>
            </div>

            {/* İçerik */}
            <div className="overflow-auto border border-border rounded-xl p-3 space-y-4">
              {mode === "bySystem" &&
                systems.map((sys, sysIdx) => (
                  <div key={sysIdx} className="rounded-xl border border-border">
                    {/* Sistem başlığı */}
                    <div className="px-4 py-3 bg-muted/40 rounded-t-xl font-medium flex flex-wrap gap-4">
                      <span>Ad: <b>{sys.name}</b></span>
                      <span>En (mm): <b>{sys.width_mm}</b></span>
                      <span>Boy (mm): <b>{sys.height_mm}</b></span>
                      <span>Adet: <b>{sys.quantity}</b></span>
                    </div>

                    {/* Sistem camları tablosu */}
                    <div className="p-3">
                      <div className="overflow-x-auto">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Cam Türü</th>
                              <th>Genişlik (mm)</th>
                              <th>Yükseklik (mm)</th>
                              <th>Adet</th>
                              <th>Mevcut Renk</th>
                              <th className="text-right">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(sys.glasses || []).map((g, gIdx) => (
                              <tr key={`${sysIdx}-${gIdx}`}>
                                <td>{g?.glass_type?.cam_isim || "-"}</td>
                                <td>{g.width_mm}</td>
                                <td>{g.height_mm}</td>
                                <td>{g.count}</td>
                                <td>{g?.glass_color?.name || "-"}</td>
                                <td className="text-right">
                                  <AppButton
                                    variant="kurumsalmavi"
                                    size="sm"
                                    shape="none"
                                    onClick={() => openColorForSingle(g.id)}
                                    title="Bu cam için renk seç"
                                  >
                                    Renk Seç
                                  </AppButton>
                                </td>
                              </tr>
                            ))}
                            {(sys.glasses || []).length === 0 && (
                              <tr>
                                <td colSpan={6} className="text-center text-sm text-muted-foreground py-4">
                                  Bu sistemde cam bulunmuyor.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}

              {mode === "byType" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uniqueGlassTypes.map((t, idx) => {
                    const summary = getColorSummaryForType(t.glass_type_id);
                    const totalRowsForType = systems.reduce((acc, sys) => {
                      const c = (sys.glasses || []).filter((g) => g.glass_type_id === t.glass_type_id).length;
                      return acc + c;
                    }, 0);
                    return (
                      <div key={idx} className="border border-border rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Bu türden {totalRowsForType} satır var • Mevcut renk: <b>{summary}</b>
                          </div>
                        </div>
                        <AppButton
                          variant="kurumsalmavi"
                          size="sm"
                          shape="none"
                          onClick={() => openColorForType(t.glass_type_id)}
                          title="Bu cam türündeki tüm satırlar için renk seç"
                        >
                          Renk Seç
                        </AppButton>
                      </div>
                    );
                  })}
                  {uniqueGlassTypes.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      Listelenecek cam türü bulunamadı.
                    </div>
                  )}
                </div>
              )}

              {mode === "all" && (
                <div className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Projede yer alan tüm camlar</div>
                    <div className="text-xs text-muted-foreground">
                      Seçtiğiniz renk, projedeki tüm camlara uygulanacaktır.
                    </div>
                  </div>
                  <AppButton
                    variant="kurumsalmavi"
                    size="sm"
                    shape="none"
                    onClick={() => { setTarget({ type: "all" }); setColorDialogOpen(true); }}
                    title="Tüm camlara renk uygula"
                  >
                    Renk Seç
                  </AppButton>
                </div>
              )}
            </div>

            {/* Alt kapat butonu */}
            <div className="mt-4 flex justify-end">
              <RadixDialog.Close asChild>
                <AppButton variant="kirmizi" size="sm" shape="none" title="Kapat">
                  Kapat
                </AppButton>
              </RadixDialog.Close>
            </div>

            {/* ALT (renk) SEÇİM MODALI */}
            <PagedSelectDialog
              title="Cam Rengi Seç"
              open={colorDialogOpen}
              onOpenChange={setColorDialogOpen}
              data={Array.isArray(colorsPage) ? { ...EMPTY_PAGE, items: colorsPage } : colorsPage}
              fetchPage={fetchPage}
              columns={[{ key: "name", label: "Renk Adı" }]}
              onSelect={handleColorSelect}
              searchPlaceholder="Renk adına göre ara…"
            />
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default DialogCamRenkSec;
