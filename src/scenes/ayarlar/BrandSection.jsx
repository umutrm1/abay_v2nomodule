// File: BrandSection.jsx (aynı klasör)
// ==================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton.jsx";
import { Spinner, CellSpinner } from "./Spinner.jsx";
import {
  getPdfBrandByKey,
  updatePdfBrand,
  getBrandImage,
  putBrandImage,
  deleteBrandImage,
} from "@/redux/actions/actionsPdf";

export default function BrandSection() {
  const dispatch = useDispatch();
  const [brandKey] = useState("brand.default0");
  const [brandDoc, setBrandDoc] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);

  // Brand Image
  const [brandImage, setBrandImage] = useState(null);
  const [brandImageLoading, setBrandImageLoading] = useState(false);
  const [brandImageSaving, setBrandImageSaving] = useState(false);
  const [brandImageDeleting, setBrandImageDeleting] = useState(false);
  const [brandImageFile, setBrandImageFile] = useState(null);
  const brandImageInputRef = useRef(null);
  const [brandImageBlobUrl, setBrandImageBlobUrl] = useState(null);

  useEffect(() => () => {
    if (brandImageBlobUrl) URL.revokeObjectURL(brandImageBlobUrl);
  }, [brandImageBlobUrl]);

  const loadBrandImage = async () => {
    setBrandImageLoading(true);
    try {
      const dataUrl = await getBrandImage();
      if (brandImageBlobUrl) {
        URL.revokeObjectURL(brandImageBlobUrl);
        setBrandImageBlobUrl(null);
      }
      setBrandImage(dataUrl);
    } catch (e) {
      setBrandImage(null);
      console.error("Brand image alınamadı", e);
    } finally {
      setBrandImageLoading(false);
    }
  };

  const handleBrandImageFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setBrandImageFile(file);
    if (brandImageBlobUrl) URL.revokeObjectURL(brandImageBlobUrl);
    if (file) {
      const newBlobUrl = URL.createObjectURL(file);
      setBrandImageBlobUrl(newBlobUrl);
      setBrandImage(newBlobUrl);
    } else {
      setBrandImageBlobUrl(null);
      loadBrandImage();
    }
  };

  const handleBrandImageUpload = async () => {
    if (!brandImageFile) return;
    try {
      setBrandImageSaving(true);
      await dispatch(putBrandImage(brandImageFile));
      await loadBrandImage();
      setBrandImageFile(null);
      setBrandImageBlobUrl(null);
      if (brandImageInputRef.current) brandImageInputRef.current.value = "";
    } catch (e) {
      console.error(e);
      if (brandImageBlobUrl) setBrandImage(brandImageBlobUrl);
    } finally {
      setBrandImageSaving(false);
    }
  };

  const handleBrandImageDelete = async () => {
    try {
      setBrandImageDeleting(true);
      await dispatch(deleteBrandImage());
      if (brandImageBlobUrl) {
        URL.revokeObjectURL(brandImageBlobUrl);
        setBrandImageBlobUrl(null);
      }
      setBrandImage(null);
      setBrandImageFile(null);
      if (brandImageInputRef.current) brandImageInputRef.current.value = "";
    } catch (e) {
      console.error(e);
    } finally {
      setBrandImageDeleting(false);
    }
  };

  // İlk yükler
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
    loadBrandImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await dispatch(updatePdfBrand({ key: brandDoc.key, config_json: cfg }));
    } catch (e) {
      console.error(e);
    } finally {
      setBrandSaving(false);
    }
  };

  return (
    <section className="border border-border rounded-2xl p-4">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">PDF Üst Başlık Değiştirme</h2>
        <AppButton
          onClick={saveBrand}
          disabled={brandLoading || !brandDoc}
          loading={brandSaving}
          size="md"
          variant="kurumsalmavi"
        >
          Kaydet
        </AppButton>
      </header>

      {brandLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Image */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">Brand Image (Logo)</label>
              <div className="border border-border rounded-xl p-2 flex items-center justify-center bg-muted/30 min-h-[100px]">
                {brandImageLoading ? (
                  <CellSpinner />
                ) : (
                  <img
                    src={brandImage || "https://placehold.co/980x300/eee/ccc?text=Logo+Yok"}
                    alt="Brand Image"
                    className="max-h-24 rounded-lg object-contain"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/980x300/eee/ccc?text=Logo+Yok")}
                  />
                )}
              </div>

              <input
                ref={brandImageInputRef}
                type="file"
                accept="image/png"
                onChange={handleBrandImageFileChange}
                className="border border-border rounded-xl px-3 py-2 bg-card text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border"
              />
              {brandImageFile ? (
                <span className="text-xs text-muted-foreground">
                  Seçilen: {brandImageFile.name} ({Math.round(brandImageFile.size / 1024)} KB)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">980x300 px PNG yükleyin.</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <AppButton
                onClick={handleBrandImageUpload}
                disabled={brandImageSaving || !brandImageFile}
                loading={brandImageSaving}
                size="md"
                variant="yesil"
                title="Yeni logoyu yükle/güncelle"
              >
                Yükle/Güncelle
              </AppButton>
              <AppButton
                onClick={handleBrandImageDelete}
                disabled={brandImageDeleting || (!brandImage && !brandImageFile)}
                loading={brandImageDeleting}
                size="md"
                variant="kirmizi"
              >
                Sil
              </AppButton>
            </div>
          </div>

          {/* rightBox.title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Sağ Kutu Başlık</label>
            <input
              type="text"
              value={brandCfg?.rightBox?.title ?? ""}
              onChange={(e) => handleBrandChange(["rightBox", "title"], e.target.value)}
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
              placeholder="Örn: TÜMEN ALÜMİNYUM"
            />
          </div>

          {/* rightBox.lines */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium mb-2">Sağ Kutu Satırları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(brandLines || []).map((ln, idx) => (
                <div key={idx} className="border border-border rounded-xl p-3 flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">Başlık</span>
                    <input
                      className="col-span-3 md:col-span-2 border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground"
                      type="text"
                      value={ln.label ?? ""}
                      onChange={(e) => handleBrandChange(["rightBox", "lines", idx, "label"], e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-xs text-muted-foreground col-span-3 md:col-span-1">Değer</span>
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
          </div>
        </div>
      )}
    </section>
  );
}
