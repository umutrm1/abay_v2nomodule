import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getPdfBrandByKey,
  updatePdfBrand,
  getPdfTitleByKey,
  updatePdfTitle,
  updateProformaRule,
} from "@/redux/actions/actionsPdf";

/**
 * PDF AYARLARI SAYFASI
 * - Dış kapsayıcı: bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-y-4
 * - 3 blok:
 *    1) PDF Üst Başlık (Brand) düzenleme
 *    2) PDF Title(infoRows) alanlarının görünürlüğünü yönetme
 *    3) Proforma (Project Code) kuralı ayarları
 */
export default function Ayarlar() {
  const dispatch = useDispatch();

  // --- 1) BRAND (Üst Başlık) ---
  const [brandKey] = useState("brand.default0"); // İsterseniz prop/refactor ile dışarıdan verin
  const [brandDoc, setBrandDoc] = useState(null); // { id?, key, config_json }
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);

  // --- 2) TITLE (infoRows görünürlükleri) ---
  const TITLE_KEYS = useMemo(
    () => [
      { key: "pdf.profileAccessory0", label: "Profil Aksesuar PDF" },
      { key: "pdf.paint0", label: "Boya Çıktısı PDF" },
      { key: "pdf.order0", label: "Üretim Çıktısı PDF" },
      { key: "pdf.glass0", label: "Cam Çıktısı PDF" },
      { key: "pdf.optimize.detayli0", label: "Detaylı Optimizasyon Çıktısı" },
      { key: "pdf.optimize.detaysiz0", label: "Detaysız Optimizasyon Çıktısı" },
    ],
    []
  );
  const [selectedTitleKey, setSelectedTitleKey] = useState(TITLE_KEYS[3].key); // varsayılan: Cam Çıktısı
  const [titleDoc, setTitleDoc] = useState(null); // { id, key, config_json }
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);

  // --- 3) PROFORMA RULE ---
  const [rule, setRule] = useState({ prefix: "PRJ", separator: "-", padding: 4, start_number: 1 });
  const [ruleSaving, setRuleSaving] = useState(false);

  // İlk açılışta BRAND + seçili TITLE getir
  useEffect(() => {
    (async () => {
      try {
        setBrandLoading(true);
        const bd = await dispatch(getPdfBrandByKey(brandKey));
        setBrandDoc(bd);
      } catch (e) {
        console.error("Brand yüklenemedi", e);
      } finally {
        setBrandLoading(false);
      }
    })();
  }, [brandKey, dispatch]);

  useEffect(() => {
    (async () => {
      try {
        setTitleLoading(true);
        const td = await dispatch(getPdfTitleByKey(selectedTitleKey));
        setTitleDoc(td);
      } catch (e) {
        console.error("Title yüklenemedi", e);
      } finally {
        setTitleLoading(false);
      }
    })();
  }, [selectedTitleKey, dispatch]);

  // Güvenli config accessor'ları
  const brandCfg = brandDoc?.config_json || {};
  const brandLines = brandCfg?.rightBox?.lines || [];

  const handleBrandChange = (path, value) => {
    // path: string[] (örn: ["title"]) veya ["rightBox","title"] veya ["rightBox","lines", idx, "label"]
    setBrandDoc((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      let cur = next.config_json ?? (next.config_json = {});
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        if (typeof path[i + 1] === "number") {
          cur[k] = Array.isArray(cur[k]) ? cur[k].slice() : [];
          cur = cur[k];
        } else {
          cur[k] = cur[k] ? { ...cur[k] } : {};
          cur = cur[k];
        }
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const saveBrand = async () => {
    if (!brandDoc) return;
    try {
      setBrandSaving(true);
      // Sadece belirtilen alanları göndermek istiyorsanız burada daraltabilirsiniz.
      const cfg = { ...brandDoc.config_json };
      await dispatch(
        updatePdfBrand({
          key: brandDoc.key, // KEY aynen geri gider
          config_json: cfg,
        })
      );
      alert("Üst başlık (brand) kaydedildi.");
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında hata oluştu.");
    } finally {
      setBrandSaving(false);
    }
  };

  const toggleRowEnabled = (idx, enabled) => {
    setTitleDoc((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const rows = next.config_json?.infoRows || [];
      if (!next.config_json) next.config_json = {};
      next.config_json.infoRows = rows.map((r, i) => (i === idx ? { ...r, enabled } : r));
      return next;
    });
  };

  const saveTitle = async () => {
    if (!titleDoc) return;
    try {
      setTitleSaving(true);
      await dispatch(
        updatePdfTitle(titleDoc.id, {
          key: titleDoc.key, // KEY aynen geri gider
          config_json: titleDoc.config_json,
        })
      );
      alert("PDF title ayarları kaydedildi.");
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında hata oluştu.");
    } finally {
      setTitleSaving(false);
    }
  };

  const saveRule = async () => {
    try {
      setRuleSaving(true);
      await dispatch(updateProformaRule(rule));
      alert("Proforma kuralı kaydedildi.");
    } catch (e) {
      console.error(e);
      alert("Kaydetme sırasında hata oluştu.");
    } finally {
      setRuleSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
      {/* 1) PDF ÜST BAŞLIK */}
      <section className="border border-border rounded-2xl p-4">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">1) PDF Üst Başlık Değiştirme</h2>
          <button
            disabled={brandSaving || brandLoading}
            onClick={saveBrand}
            className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
          >{brandSaving ? "Kaydediliyor..." : "Kaydet"}</button>
        </header>

        {brandLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* config_json.title */}
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Brand içi global başlık. PDF tasarımınız bu alanı kullanıyorsa güncellenir.</p>
            </div>

            {/* rightBox.title */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Sağ Kutu Başlık (rightBox.title)</label>
              <input
                type="text"
                value={brandCfg?.rightBox?.title ?? ""}
                onChange={(e) => handleBrandChange(["rightBox", "title"], e.target.value)}
                className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                placeholder="Örn: TÜMEN ALÜMİNYUM"
              />
            </div>

            {/* rightBox.lines sabit uzunlukta: label & value */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium mb-2">Sağ Kutu Satırları (rightBox.lines)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandLines.map((ln, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-3 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">Label</span>
                      <input
                        className="col-span-3 md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                        type="text"
                        value={ln.label ?? ""}
                        onChange={(e) => handleBrandChange(["rightBox", "lines", idx, "label"], e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">Value</span>
                      <textarea
                        className="col-span-3 md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                        rows={2}
                        value={ln.value ?? ""}
                        onChange={(e) => handleBrandChange(["rightBox", "lines", idx, "value"], e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Satır sayısı sabit tutulur; ekleme/çıkarma yok, sadece label & value düzenlenir.</p>
            </div>
          </div>
        )}
      </section>

      {/* 2) PDF TITLE (infoRows görünürlük) */}
      <section className="border border-border rounded-2xl p-4">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">2) PDF Başlık (Title) Alanları</h2>
          <button
            disabled={titleSaving || titleLoading}
            onClick={saveTitle}
            className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
          >{titleSaving ? "Kaydediliyor..." : "Kaydet"}</button>
        </header>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">PDF Türü</span>
            <select
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              value={selectedTitleKey}
              onChange={(e) => setSelectedTitleKey(e.target.value)}
            >
              {TITLE_KEYS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label} ({opt.key})</option>
              ))}
            </select>
          </div>
          {titleLoading && <span className="text-xs text-muted-foreground">Yükleniyor...</span>}
        </div>

        {titleDoc?.config_json?.infoRows?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {titleDoc.config_json.infoRows.map((row, idx) => (
              <label
                key={idx}
                className="border border-border rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{`\u201C${row.label}\u201D görünsün mü?`}</div>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={!!row.enabled}
                  onChange={(e) => toggleRowEnabled(idx, e.target.checked)}
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Seçilen PDF için infoRows bulunamadı.</p>
        )}
      </section>

      {/* 3) PROFORMA (Project Code) KURALI */}
      <section className="border border-border rounded-2xl p-4">
        <header className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">3) Proforma No (Project Code) Kuralı</h2>
          <button
            disabled={ruleSaving}
            onClick={saveRule}
            className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
          >{ruleSaving ? "Kaydediliyor..." : "Kaydet"}</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Önek (prefix)</label>
            <input
              type="text"
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              value={rule.prefix}
              onChange={(e) => setRule((r) => ({ ...r, prefix: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Ayırıcı (separator)</label>
            <input
              type="text"
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              value={rule.separator}
              onChange={(e) => setRule((r) => ({ ...r, separator: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Basamak (padding)</label>
            <input
              type="number"
              min={1}
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              value={rule.padding}
              onChange={(e) => setRule((r) => ({ ...r, padding: Number(e.target.value || 0) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Başlangıç No (start_number)</label>
            <input
              type="number"
              min={0}
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              value={rule.start_number}
              onChange={(e) => setRule((r) => ({ ...r, start_number: Number(e.target.value || 0) }))}
            />
          </div>
        </div>

        {/* Örnek önizleme */}
        <div className="mt-3 text-sm text-foreground">
          <span className="text-muted-foreground">Örnek:</span>{" "}
          <code className="px-2 py-1 border border-border rounded-lg">
            {rule.prefix}{rule.separator}{String(rule.start_number).padStart(rule.padding, "0")}
          </code>
        </div>
      </section>
    </div>
  );
}
