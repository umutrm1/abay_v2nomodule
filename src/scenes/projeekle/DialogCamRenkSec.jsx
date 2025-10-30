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

  /** Seçim bağlamı: modal açıldığında nereye yazacağız? */
  const [selectContext, setSelectContext] = useState(
    /** { scope: 'single'|'bulk'|'all', key: any, whichColor: 1|2 } */
    null
  );

  // Refresh spinner (dispatch esnasında)
  const [refreshing, setRefreshing] = useState(false);

  const systems = Array.isArray(requirements?.systems) ? requirements.systems : [];

  // ------------------------------------------------------------
  // YARDIMCI: Renk adını ve id'sini örnek verdiğin schema'ya göre güvenli çıkar
  // ------------------------------------------------------------
  const getColorName = (g, slot /* 1|2 */) => {
    if (!g) return "-";
    if (slot === 1) {
      return (
        g?.glass_color_obj_1?.name ??
        (typeof g?.glass_color_1?.name === "string" ? g.glass_color_1 : g?.glass_color_1?.name) ??
        g?.glass_color?.name ?? // legacy tek renk
        "-"
      );
    } else {
      return (
        g?.glass_color_obj_2?.name ??
        (typeof g?.glass_color_2?.name === "string" ? g.glass_color_2 : g?.glass_color_2?.name) ??
        "-"
      );
    }
  };

  const getColorId = (g, slot /* 1|2 */) => {
    if (!g) return null;
    if (slot === 1) {
      return (
        g?.glass_color_obj_1?.id ??
        g?.glass_color_id_1 ??
        g?.glass_color_1?.id ??
        g?.glass_color?.id ?? // legacy tek renk
        null
      );
    } else {
      return (
        g?.glass_color_obj_2?.id ??
        g?.glass_color_id_2 ??
        g?.glass_color_2?.id ??
        null
      );
    }
  };

  // ------------------------------------------------------------
  // STATE: Kullanıcı seçimlerini önce burada biriktireceğiz
// pendingSingle: { [psgId]: { id1?: string, name1?: string, id2?: string, name2?: string } }
// pendingBulk:   { [glass_type_id]: { id1?: string, name1?: string, id2?: string, name2?: string, system_variant_id?: string|null } }
// pendingAll:    { id1?: string, name1?: string, id2?: string, name2?: string }
  // "Uygula" ile tek seferde dispatch edilecek.
  // ------------------------------------------------------------
  const [pendingSingle, setPendingSingle] = useState({});
  const [pendingBulk, setPendingBulk] = useState({});
  const [pendingAll, setPendingAll] = useState({});

  // ------------------------------------------------------------
  // byType (kart) için tekilleştirilmiş cam türleri
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // byType özet: Renk1/Renk2 adlarını kümeler halinde topla ve özet yaz
  // ------------------------------------------------------------
const getTwoColorSummaryForType = useCallback((glass_type_id) => {
  const names1 = new Set();
  const names2 = new Set();
  systems.forEach((sys) => {
    (sys.glasses || []).forEach((g) => {
      if (g.glass_type_id === glass_type_id) {
        names1.add(resolveEffectiveColor(g, 1).name);
        names2.add(resolveEffectiveColor(g, 2).name);
      }
    });
  });

  const fmt = (set) => {
    const filtered = Array.from(set).filter((x) => x && x !== "-");
    if (filtered.length === 0) return "-";
    if (filtered.length === 1) return filtered[0];
    return `Karma (${filtered.length} renk)`;
  };
  return `${fmt(names1)} / ${fmt(names2)}`;
}, [systems, pendingSingle, pendingBulk, pendingAll]);


  // ------------------------------------------------------------
  // Modal açıcılar (sadece seçim yapar; dispatch etmez)
  // ------------------------------------------------------------
  const openSelectSingle = (g /* glass row obj */, whichColor /*1|2*/) => {
    setSelectContext({ scope: "single", key: g?.id, whichColor });
    setColorDialogOpen(true);
  };

  const openSelectType = (glass_type_id, whichColor /*1|2*/) => {
    // Bu glass_type_id'ye ait bir system_variant_id örneği yakalayalım (ilk bulunan)
    let system_variant_id = null;
    for (const sys of systems) {
      const hit = (sys.glasses || []).some((gg) => gg.glass_type_id === glass_type_id);
      if (hit) {
        system_variant_id = sys.system_variant_id || sys?.system_variant?.id || null;
        break;
      }
    }
    // Kartta pending kayıt oluştururken system_variant_id'yi de saklayacağız
    setPendingBulk((prev) => ({
      ...prev,
      [glass_type_id]: {
        ...(prev[glass_type_id] || {}),
        system_variant_id,
      },
    }));
    setSelectContext({ scope: "bulk", key: glass_type_id, whichColor });
    setColorDialogOpen(true);
  };

  const openSelectAll = (whichColor /*1|2*/) => {
    setSelectContext({ scope: "all", key: "all", whichColor });
    setColorDialogOpen(true);
  };

  // ------------------------------------------------------------
  // Modal'da bir renk seçildi: sadece state'e yaz
  // ------------------------------------------------------------
const handleColorPicked = (row) => {
  const chosenId = row?.id;
  const chosenName = row?.name ?? "-";
  if (!chosenId || !selectContext) return;

  const { scope, key, whichColor } = selectContext;

  if (scope === "single") {
    setPendingSingle((prev) => {
      const prevItem = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...prevItem,
          ...(whichColor === 1
            ? { id1: chosenId, name1: chosenName }
            : { id2: chosenId, name2: chosenName }),
        },
      };
    });
  } else if (scope === "bulk") {
    setPendingBulk((prev) => {
      const prevItem = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...prevItem,
          ...(whichColor === 1
            ? { id1: chosenId, name1: chosenName }
            : { id2: chosenId, name2: chosenName }),
        },
      };
    });
  } else if (scope === "all") {
    setPendingAll((prev) => ({
      ...prev,
      ...(whichColor === 1
        ? { id1: chosenId, name1: chosenName }
        : { id2: chosenId, name2: chosenName }),
    }));
  }

  setColorDialogOpen(false);
  setSelectContext(null);
};

const resolveEffectiveColor = (g, slot /* 1|2 */) => {
  // 1) SINGLE (satıra özel)
  const ps = pendingSingle[g?.id] || {};
  if (slot === 1 && ps.id1) return { name: ps.name1 ?? "-", pending: true, source: "single" };
  if (slot === 2 && ps.id2) return { name: ps.name2 ?? "-", pending: true, source: "single" };

  // 2) BULK (cam türü bazlı)
  const pb = pendingBulk[g?.glass_type_id] || {};
  if (slot === 1 && pb.id1) return { name: pb.name1 ?? "-", pending: true, source: "bulk" };
  if (slot === 2 && pb.id2) return { name: pb.name2 ?? "-", pending: true, source: "bulk" };

  // 3) ALL (tüm camlar)
  if (slot === 1 && pendingAll.id1) return { name: pendingAll.name1 ?? "-", pending: true, source: "all" };
  if (slot === 2 && pendingAll.id2) return { name: pendingAll.name2 ?? "-", pending: true, source: "all" };

  // 4) BACKEND (mevcut değer)
  return { name: getColorName(g, slot), pending: false, source: "backend" };
};


  // ------------------------------------------------------------
  // "Uygula" butonları (tek seferde dispatch)
  //  - single: seçilmemiş slotlar mevcut id'lerle korunur
  //  - bulk/all: sadece seçilmiş olan anahtarları gönder (null göndermeyelim)
  // ------------------------------------------------------------
  const applySingle = async (g /* glass row obj */) => {
    const psgId = g?.id;
    if (!psgId) return;

    const cur1 = getColorId(g, 1);
    const cur2 = getColorId(g, 2);
    const pend = pendingSingle[psgId] || {};

    // Seçilmişse kullan; değilse mevcutları koru
    const body = {
      glass_color_id_1: pend.id1 ?? cur1 ?? null,
      glass_color_id_2: pend.id2 ?? cur2 ?? null,
    };

    try {
            console.log(body)

      setRefreshing(true);
      await dispatch(actions_projeler.updateSystemGlassColorInProject(projectId, psgId, body));
      await dispatch(actions_projeler.getProjeRequirementsFromApi(projectId));
      // Uygulandıktan sonra pending'i temizleyelim
      setPendingSingle((prev) => {
        const cp = { ...prev };
        delete cp[psgId];
        return cp;
      });
    } finally {
      setRefreshing(false);
    }
  };

  const applyBulk = async (glass_type_id) => {
    const pend = pendingBulk[glass_type_id] || {};
    const system_variant_id = pend.system_variant_id ?? null;

    // Sadece seçilmiş olanları gönder (backend'e gereksiz anahtar göndermeyelim)
    const body = {
      system_variant_id,
      glass_type_id,
      ...(pend.id1 ? { glass_color_id_1: pend.id1 } : {}),
      ...(pend.id2 ? { glass_color_id_2: pend.id2 } : {}),
    };

    // Eğer hiçbir seçim yapılmadıysa çık
    if (!body.glass_color_id_1 && !body.glass_color_id_2) return;

    try {
      setRefreshing(true);
      await dispatch(actions_projeler.updateSameGlassesInProject(projectId, body));
      await dispatch(actions_projeler.getProjeRequirementsFromApi(projectId));
      // Pending temizle
      setPendingBulk((prev) => {
        const cp = { ...prev };
        delete cp[glass_type_id];
        return cp;
      });
    } finally {
      setRefreshing(false);
    }
  };

  const applyAll = async () => {
    // Sadece seçilmiş olanları gönder
    const body = {
      ...(pendingAll.id1 ? { glass_color_id_1: pendingAll.id1 } : {}),
      ...(pendingAll.id2 ? { glass_color_id_2: pendingAll.id2 } : {}),
    };

    if (!body.glass_color_id_1 && !body.glass_color_id_2) return;

    try {
      setRefreshing(true);
      await dispatch(actions_projeler.updateAllGlassesColorInProject(projectId, body));
      await dispatch(actions_projeler.getProjeRequirementsFromApi(projectId));
      // Pending temizle
      setPendingAll({});
    } finally {
      setRefreshing(false);
    }
  };

  // ------------------------------------------------------------
  // UI yardımcı: Uygula butonunu aktif yapma koşulu
  //  - single: o satıra dair pending varsa (id1/id2)
  //  - bulk: kartta pending varsa
  //  - all: global pending varsa
  // ------------------------------------------------------------
  const hasPendingForSingle = (g) => {
    const row = pendingSingle[g?.id] || {};
    return !!(row.id1 || row.id2);
  };
  const hasPendingForType = (glass_type_id) => {
    const row = pendingBulk[glass_type_id] || {};
    return !!(row.id1 || row.id2);
  };
  const hasPendingForAll = !!(pendingAll.id1 || pendingAll.id2);

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
              {/* -------------------------------------------------- */}
              {/* bySystem: her glass satırı için  Renk1 Seç | Renk2 Seç | Uygula */}
              {/* -------------------------------------------------- */}
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
                              <th>Mevcut Renkler (R1 / R2)</th>
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
<td>
  {(() => {
    const r1 = resolveEffectiveColor(g, 1);
    const r2 = resolveEffectiveColor(g, 2);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span>R1: <b>{r1.name}</b></span>
          {r1.pending && <span className="text-xs italic text-primary/80">(seçildi)</span>}
        </div>
        <div className="flex items-center gap-2">
          <span>R2: <b>{r2.name}</b></span>
          {r2.pending && <span className="text-xs italic text-primary/80">(seçildi)</span>}
        </div>
      </div>
    );
  })()}
</td>
                                <td className="text-right">
                                  <div className="flex gap-2 justify-end">
                                    <AppButton
                                      variant="kurumsalmavi"
                                      size="sm"
                                      shape="none"
                                      onClick={() => openSelectSingle(g, 1)}
                                      title="Bu cam için Renk 1 seç (henüz uygulanmaz)"
                                    >
                                      Renk 1
                                    </AppButton>
                                    <AppButton
                                      variant="kurumsalmavi"
                                      size="sm"
                                      shape="none"
                                      onClick={() => openSelectSingle(g, 2)}
                                      title="Bu cam için Renk 2 seç (henüz uygulanmaz)"
                                    >
                                      Renk 2
                                    </AppButton>
                                    <AppButton
                                      variant="yesil"
                                      size="sm"
                                      shape="none"
                                      disabled={!hasPendingForSingle(g)}
                                      onClick={() => applySingle(g)}
                                      title="Seçimleri uygula (tek dispatch)"
                                    >
                                      Uygula
                                    </AppButton>
                                  </div>
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

              {/* -------------------------------------------------- */}
              {/* byType: her cam türü kartı için Renk1 Seç | Renk2 Seç | Uygula */}
              {/* -------------------------------------------------- */}
              {mode === "byType" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uniqueGlassTypes.map((t, idx) => {
                    const summary = getTwoColorSummaryForType(t.glass_type_id);
                    const totalRowsForType = systems.reduce((acc, sys) => {
                      const c = (sys.glasses || []).filter((g) => g.glass_type_id === t.glass_type_id).length;
                      return acc + c;
                    }, 0);
                    return (
                      <div key={idx} className="border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Bu türden {totalRowsForType} satır var • Mevcut renkler: <b>{summary}</b>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => openSelectType(t.glass_type_id, 1)}
                              title="Bu cam türündeki satırlar için Renk 1 seç (henüz uygulanmaz)"
                            >
                              Renk 1
                            </AppButton>
                            <AppButton
                              variant="kurumsalmavi"
                              size="sm"
                              shape="none"
                              onClick={() => openSelectType(t.glass_type_id, 2)}
                              title="Bu cam türündeki satırlar için Renk 2 seç (henüz uygulanmaz)"
                            >
                              Renk 2
                            </AppButton>
                            <AppButton
                              variant="yesil"
                              size="sm"
                              shape="none"
                              disabled={!hasPendingForType(t.glass_type_id)}
                              onClick={() => applyBulk(t.glass_type_id)}
                              title="Seçimleri uygula (tek dispatch)"
                            >
                              Uygula
                            </AppButton>
                          </div>
                        </div>
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

              {/* -------------------------------------------------- */}
              {/* all: global Renk1 Seç | Renk2 Seç | Uygula */}
              {/* -------------------------------------------------- */}
              {mode === "all" && (
                <div className="border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Projede yer alan tüm camlar</div>
                    <div className="text-xs text-muted-foreground">
                      Seçtiğiniz renk(ler), projedeki tüm camlara uygulanacaktır.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AppButton
                      variant="kurumsalmavi"
                      size="sm"
                      shape="none"
                      onClick={() => openSelectAll(1)}
                      title="Tüm camlar için Renk 1 seç (henüz uygulanmaz)"
                    >
                      Renk 1
                    </AppButton>
                    <AppButton
                      variant="kurumsalmavi"
                      size="sm"
                      shape="none"
                      onClick={() => openSelectAll(2)}
                      title="Tüm camlar için Renk 2 seç (henüz uygulanmaz)"
                    >
                      Renk 2
                    </AppButton>
                    <AppButton
                      variant="yesil"
                      size="sm"
                      shape="none"
                      disabled={!hasPendingForAll}
                      onClick={applyAll}
                      title="Seçimleri uygula (tek dispatch)"
                    >
                      Uygula
                    </AppButton>
                  </div>
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

            {/* ALT (renk) SEÇİM MODALI — sadece state'e yazar, dispatch etmez */}
            <PagedSelectDialog
              title={`Cam Rengi Seç`}
              open={colorDialogOpen}
              onOpenChange={setColorDialogOpen}
              data={Array.isArray(colorsPage) ? { ...EMPTY_PAGE, items: colorsPage } : colorsPage}
              fetchPage={fetchPage}
              columns={[{ key: "name", label: "Renk Adı" }]}
              onSelect={handleColorPicked}
              searchPlaceholder="Renk adına göre ara…"
            />
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default DialogCamRenkSec;
