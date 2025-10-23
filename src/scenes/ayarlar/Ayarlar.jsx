import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getPdfBrandByKey,
  updatePdfBrand,
  getPdfTitleByKey,
  updatePdfTitle,
  updateProformaRule,
  getProformaRule,
} from "@/redux/actions/actionsPdf";

/* yeni: profil foto aksiyonları */
import {
  getProfilePicture,
  uploadProfilePicture,
  updateProfilePicture,
  deleteProfilePicture,
} from "@/redux/actions/actions_profilfoto";

export default function Ayarlar() {
  const dispatch = useDispatch();

  /* ------- SOL MENÜ (SECTIONS) ------- */
  const SECTIONS = [
    { id: "brand", label: "PDF Üst Başlık" },
    { id: "title", label: "PDF Title Alanları" },
    { id: "rule", label: "Proforma Kuralı" },
    /* yeni section */
    { id: "profilfoto", label: "Profil Fotoğrafı" },
  ];
  const [active, setActive] = useState("brand");

  /* ------- 1) BRAND ------- */
  const [brandKey] = useState("brand.default0");
  const [brandDoc, setBrandDoc] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);

  /* ------- 2) TITLE ------- */
  const TITLE_KEYS = useMemo(
    () => [
      { key: "pdf.profileAccessory0", label: "Profil Aksesuar PDF" },
      { key: "pdf.paint0", label: "Boya Çıktısı PDF" },
      { key: "pdf.order0", label: "Üretim Çıktısı PDF" },
      { key: "pdf.glass0", label: "Cam Çıktısı PDF" },
      { key: "pdf.optimize.detayli0", label: "Detaylı Optimizasyon" },
      { key: "pdf.optimize.detaysiz0", label: "Detaysız Optimizasyon" },
    ],
    []
  );
  const [selectedTitleKey, setSelectedTitleKey] = useState(TITLE_KEYS[3].key); // Cam Çıktısı
  const [titleDoc, setTitleDoc] = useState(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);

  /* ------- 3) RULE ------- */
  const [rule, setRule] = useState({
    prefix: "PRJ",
    separator: "-",
    padding: 4,
    start_number: 1,
  });
  const [ruleSaving, setRuleSaving] = useState(false);

  /* ------- 4) PROFIL FOTO ------- */
  const FALLBACK_IMG = "/profilfoto.png"; // public/profilfoto.png
  const [pfLoading, setPfLoading] = useState(false);
  const [pfSaving, setPfSaving] = useState(false);
  const [pfDeleting, setPfDeleting] = useState(false);
  const [pfUrl, setPfUrl] = useState(null); // gösterilecek URL (sunucu url'si ya da objectURL)
  const [pfBlobUrl, setPfBlobUrl] = useState(null); // memory leak önlemek için
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // profil foto hafıza temizliği
  useEffect(() => {
    return () => {
      if (pfBlobUrl) URL.revokeObjectURL(pfBlobUrl);
    };
  }, [pfBlobUrl]);

  const loadProfilePhoto = async () => {
    setPfLoading(true);
    try {
      const res = await dispatch(getProfilePicture());
      // getProfilePicture iki şekilde dönebilir:
      // 1) { url: "https://..." } gibi JSON
      // 2) { blob, url } (url: objectURL)
      if (res?.url) {
        // JSON veya blob olabilir. blob objectURL geldiyse onu yönetelim:
        if (pfBlobUrl) {
          URL.revokeObjectURL(pfBlobUrl);
          setPfBlobUrl(null);
        }
        setPfUrl(res.url);
      } else if (res?.blob) {
        if (pfBlobUrl) URL.revokeObjectURL(pfBlobUrl);
        const objectUrl = res.url || URL.createObjectURL(res.blob);
        setPfBlobUrl(objectUrl);
        setPfUrl(objectUrl);
      } else {
        // hiç veri yoksa fallback
        setPfUrl(null);
      }
    } catch (e) {
      // 404 gibi durumlarda fallback göster
      setPfUrl(null);
      console.error("Profil foto alınamadı", e);
    } finally {
      setPfLoading(false);
    }
  };

  const handleUploadPost = async () => {
    if (!file) {
      alert("Lütfen bir dosya seçin.");
      return;
    }
    try {
      setPfSaving(true);
      await dispatch(uploadProfilePicture(file));
      await loadProfilePhoto();
      setFile(null);
      fileInputRef.current?.value && (fileInputRef.current.value = "");
      alert("Profil fotoğrafı yüklendi (POST).");
    } catch (e) {
      console.error(e);
      alert("Yükleme sırasında hata oluştu.");
    } finally {
      setPfSaving(false);
    }
  };

  const handleUpdatePut = async () => {
    if (!file) {
      alert("Lütfen bir dosya seçin.");
      return;
    }
    try {
      setPfSaving(true);
      await dispatch(updateProfilePicture(file));
      await loadProfilePhoto();
      setFile(null);
      fileInputRef.current?.value && (fileInputRef.current.value = "");
      alert("Profil fotoğrafı güncellendi (PUT).");
    } catch (e) {
      console.error(e);
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setPfSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setPfDeleting(true);
      await dispatch(deleteProfilePicture());
      if (pfBlobUrl) {
        URL.revokeObjectURL(pfBlobUrl);
        setPfBlobUrl(null);
      }
      setPfUrl(null);
      alert("Profil fotoğrafı silindi.");
    } catch (e) {
      console.error(e);
      alert("Silme sırasında hata oluştu.");
    } finally {
      setPfDeleting(false);
    }
  };

  // Section aktif olduğunda profil foto’yu yükle
  useEffect(() => {
    if (active === "profilfoto") {
      loadProfilePhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ------- İlk Yükler ------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await dispatch(getProformaRule());
        setRule((prev) => ({
          ...prev,
          prefix: typeof data?.prefix === "string" ? data.prefix : prev.prefix,
          separator:
            typeof data?.separator === "string" ? data.separator : prev.separator,
          padding: typeof data?.padding === "number" ? data.padding : prev.padding,
          start_number:
            typeof data?.start_number === "number"
              ? data.start_number
              : prev.start_number,
        }));
      } catch (e) {
        console.error("Proforma kuralı getirilemedi", e);
      }
    })();
  }, [dispatch]);

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

  /* ------- Yardımcılar ------- */
  const brandCfg = brandDoc?.config_json || {};
  const brandLines = brandCfg?.rightBox?.lines || [];

  const handleBrandChange = (path, value) => {
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
      const cfg = { ...brandDoc.config_json };
      await dispatch(
        updatePdfBrand({
          key: brandDoc.key,
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
      next.config_json.infoRows = rows.map((r, i) =>
        i === idx ? { ...r, enabled } : r
      );
      return next;
    });
  };

  const saveTitle = async () => {
    if (!titleDoc) return;
    try {
      setTitleSaving(true);
      await dispatch(
        updatePdfTitle(titleDoc.id, {
          key: titleDoc.key,
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

  /* ------- UI ------- */
  return (
    <div className="bg-card border border-border rounded-2xl p-5 text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sol Dikey Menü */}
        <aside className="md:col-span-3">
          <nav className="sticky top-4 flex md:block gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={
                  "w-full text-left px-3 py-2 rounded-xl border transition " +
                  (active === s.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:bg-muted")
                }
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Sağ İçerik */}
        <main className="md:col-span-9">
          {/* BRAND SECTION */}
          {active === "brand" && (
            <section className="border border-border rounded-2xl p-4">
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">1) PDF Üst Başlık Değiştirme</h2>
                <button
                  disabled={brandSaving || brandLoading}
                  onClick={saveBrand}
                  className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                >
                  {brandSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </header>

              {brandLoading ? (
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Açıklama */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">
                      Brand içi global başlık ve sağ kutu alanları.
                    </p>
                  </div>

                  {/* rightBox.title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      Sağ Kutu Başlık (rightBox.title)
                    </label>
                    <input
                      type="text"
                      value={brandCfg?.rightBox?.title ?? ""}
                      onChange={(e) =>
                        handleBrandChange(["rightBox", "title"], e.target.value)
                      }
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                      placeholder="Örn: TÜMEN ALÜMİNYUM"
                    />
                  </div>

                  {/* rightBox.lines */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium mb-2">
                      Sağ Kutu Satırları (rightBox.lines)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {brandLines.map((ln, idx) => (
                        <div
                          key={idx}
                          className="border border-border rounded-xl p-3 flex flex-col gap-2"
                        >
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">
                              Label
                            </span>
                            <input
                              className="col-span-3 md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                              type="text"
                              value={ln.label ?? ""}
                              onChange={(e) =>
                                handleBrandChange(
                                  ["rightBox", "lines", idx, "label"],
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">
                              Value
                            </span>
                            <textarea
                              className="col-span-3 md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                              rows={2}
                              value={ln.value ?? ""}
                              onChange={(e) =>
                                handleBrandChange(
                                  ["rightBox", "lines", idx, "value"],
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Satır sayısı sabit; yalnızca label & value düzenlenir.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TITLE SECTION */}
          {active === "title" && (
            <section className="border border-border rounded-2xl p-4">
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">2) PDF Başlık (Title) Alanları</h2>
                <button
                  disabled={titleSaving || titleLoading}
                  onClick={saveTitle}
                  className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                >
                  {titleSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
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
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {titleLoading && (
                  <span className="text-xs text-muted-foreground">Yükleniyor...</span>
                )}
              </div>

              {titleDoc?.config_json?.infoRows?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {titleDoc.config_json.infoRows.map((row, idx) => (
                    <label
                      key={idx}
                      className="border border-border rounded-2xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{row.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {`“${row.label}” görünsün mü?`}
                        </div>
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
                <p className="text-sm text-muted-foreground">
                  Seçilen PDF için infoRows bulunamadı.
                </p>
              )}
            </section>
          )}

          {/* RULE SECTION */}
          {active === "rule" && (
            <section className="border border-border rounded-2xl p-4">
              <header className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">3) Proforma No (Project Code) Kuralı</h2>
                <button
                  disabled={ruleSaving}
                  onClick={saveRule}
                  className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                >
                  {ruleSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Önek (prefix)</label>
                  <input
                    type="text"
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                    value={rule.prefix}
                    onChange={(e) => {
                      const raw = e.target.value || "";
                      const cleaned = raw.toUpperCase().replace(/[^A-Z]/g, "");
                      setRule((r) => ({ ...r, prefix: cleaned }));
                    }}
                    pattern="[A-Z]*"
                    title="Sadece büyük harf kullanın (A–Z)"
                    placeholder="Örn: PRJ"
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
                    min={0}
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                    value={rule.padding}
                    onChange={(e) =>
                      setRule((r) => ({ ...r, padding: Number(e.target.value || 0) }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Başlangıç No (start_number)</label>
                  <input
                    type="number"
                    min={0}
                    className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                    value={rule.start_number}
                    onChange={(e) =>
                      setRule((r) => ({
                        ...r,
                        start_number: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-3 text-sm text-foreground">
                <span className="text-muted-foreground">Örnek:</span>{" "}
                <code className="px-2 py-1 border border-border rounded-lg">
                  {rule.prefix}
                  {rule.separator}
                  {String(rule.start_number).padStart(rule.padding, "0")}
                </code>
              </div>
            </section>
          )}

          {/* PROFIL FOTO SECTION */}
          {active === "profilfoto" && (
            <section className="border border-border rounded-2xl p-4">
              <header className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">4) Profil Fotoğrafı</h2>
                <div className="flex gap-2">
                  <button
                    onClick={loadProfilePhoto}
                    disabled={pfLoading}
                    className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                  >
                    {pfLoading ? "Yükleniyor..." : "Yenile"}
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Önizleme */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Mevcut Fotoğraf</span>
                  <div className="border border-border rounded-2xl p-3 flex items-center justify-center bg-muted/30">
                    <img
                      src={pfUrl || FALLBACK_IMG}
                      alt="Profil Fotoğrafı"
                      className="max-h-64 rounded-xl object-contain"
                    />
                  </div>
                  {!pfUrl && (
                    <p className="text-xs text-muted-foreground">
                      Mevcut fotoğraf bulunamadı. Varsayılan görsel gösteriliyor.
                    </p>
                  )}
                </div>

                {/* İşlemler */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Yeni Dosya Seç</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="border border-border rounded-xl px-3 py-2 bg-card text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border"
                    />
                    {file ? (
                      <span className="text-xs text-muted-foreground">
                        Seçilen: {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        JPG/PNG önerilir. Maksimum boyutu API’niz belirler.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleUploadPost}
                      disabled={pfSaving || !file}
                      className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                      title="Yeni yükleme (POST)"
                    >
                      {pfSaving ? "İşleniyor..." : "Yükle (POST)"}
                    </button>
                    <button
                      onClick={handleUpdatePut}
                      disabled={pfSaving || !file}
                      className="px-3 py-1.5 rounded-xl border border-border disabled:opacity-50"
                      title="Var olanı güncelle (PUT)"
                    >
                      {pfSaving ? "İşleniyor..." : "Güncelle (PUT)"}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={pfDeleting}
                      className="px-3 py-1.5 rounded-xl border border-destructive text-destructive disabled:opacity-50"
                    >
                      {pfDeleting ? "Siliniyor..." : "Sil (DELETE)"}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Not: POST genelde yeni ekleme, PUT ise mevcut fotoğrafı değiştirme içindir.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
