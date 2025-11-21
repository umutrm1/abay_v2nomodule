// File: ProfilePhotoSection.jsx
// =========================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton.jsx";
import { CellSpinner } from "./Spinner.jsx";
import {
  getProfilePicture,
  updateProfilePicture,
  deleteProfilePicture,
} from "@/redux/actions/actions_profilfoto";

export default function ProfilePhotoSection() {
  const dispatch = useDispatch();
  const FALLBACK_IMG = "/profilfoto.png";

  const [pfLoading, setPfLoading] = useState(false);
  const [pfSaving, setPfSaving] = useState(false);
  const [pfDeleting, setPfDeleting] = useState(false);
  const [pfSrc, setPfSrc] = useState(null);

  const abortRef = useRef(null);
  const safeRevoke = (url) => {
    try { if (url && url.startsWith("blob:")) URL.revokeObjectURL(url); } catch {}
  };

  async function loadProfilePhoto() {
    setPfLoading(true);
    try {
      const dataUrl = await getProfilePicture({ cacheBust: true });
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      setPfSrc(dataUrl);
    } catch (e) {
      setPfSrc(null);
    } finally {
      setPfLoading(false);
    }
  }

  useEffect(() => {
    loadProfilePhoto();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ Editör ------------------ */
  const [isEditing, setIsEditing] = useState(false);
  const [editSrc, setEditSrc] = useState(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  // 🔹 Mobilde crop boyutu otomatik küçülsün
  const [cropSize, setCropSize] = useState(300);
  const OUTPUT_SIZE = 512;

  useEffect(() => {
    const calc = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 768) {
        // mobilde: ekran - kenarlar, min 220 max 300
        const next = Math.max(220, Math.min(300, window.innerWidth - 80));
        setCropSize(next);
      } else {
        setCropSize(300);
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const fileInputRef = useRef(null);
  const [rawFile, setRawFile] = useState(null);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRawFile(f);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      setEditSrc(src);

      const img = new Image();
      img.onload = () => {
        setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });

        const minScale0 = Math.max(cropSize / img.naturalWidth, cropSize / img.naturalHeight);
        const startScale = minScale0 * 1.05;
        setScale(startScale);

        const scaledW = img.naturalWidth * startScale;
        const scaledH = img.naturalHeight * startScale;
        setPos({
          x: (cropSize - scaledW) / 2,
          y: (cropSize - scaledH) / 2,
        });

        setIsEditing(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  const minScale = useMemo(() => {
    if (!imgNatural.w || !imgNatural.h) return 1;
    return Math.max(cropSize / imgNatural.w, cropSize / imgNatural.h);
  }, [imgNatural.w, imgNatural.h, cropSize]);

  const MAX_SCALE_MULTIPLIER = 4;
  const maxScale = useMemo(() => minScale * MAX_SCALE_MULTIPLIER, [minScale]);

  const clampPos = (px, py, s = scale) => {
    const scaledW = imgNatural.w * s;
    const scaledH = imgNatural.h * s;
    const minX = Math.min(0, cropSize - scaledW);
    const minY = Math.min(0, cropSize - scaledH);
    const maxX = 0;
    const maxY = 0;
    return {
      x: Math.min(Math.max(px, minX), maxX),
      y: Math.min(Math.max(py, minY), maxY),
    };
  };

  const onDragStart = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      dragging: true,
      startX: clientX,
      startY: clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
  };
  const onDragMove = (e) => {
    if (!dragRef.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    const next = clampPos(dragRef.current.startPosX + dx, dragRef.current.startPosY + dy);
    setPos(next);
  };
  const onDragEnd = () => {
    dragRef.current.dragging = false;
  };

  const onWheelZoom = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    const nextScale = Math.min(Math.max(scale + delta * minScale, minScale), maxScale);
    const factor = nextScale / scale;
    const cx = cropSize / 2;
    const cy = cropSize / 2;
    const newX = cx - (cx - pos.x) * factor;
    const newY = cy - (cy - pos.y) * factor;
    setScale(nextScale);
    setPos(clampPos(newX, newY, nextScale));
  };

  const onSliderChange = (v) => {
    const nextScale = Math.min(Math.max(Number(v), minScale), maxScale);
    const factor = nextScale / scale;
    const cx = cropSize / 2;
    const cy = cropSize / 2;
    const newX = cx - (cx - pos.x) * factor;
    const newY = cy - (cy - pos.y) * factor;
    setScale(nextScale);
    setPos(clampPos(newX, newY, nextScale));
  };

  const resetEditor = () => {
    if (!imgNatural.w || !imgNatural.h) return;
    const s = minScale * 1.05;
    setScale(s);
    const scaledW = imgNatural.w * s;
    const scaledH = imgNatural.h * s;
    setPos({
      x: (cropSize - scaledW) / 2,
      y: (cropSize - scaledH) / 2,
    });
  };

  const cancelEditor = () => {
    setIsEditing(false);
    if (editSrc && editSrc.startsWith("blob:")) safeRevoke(editSrc);
    setEditSrc(null);
    setImgNatural({ w: 0, h: 0 });
    setRawFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveCropped = async () => {
    try {
      setPfSaving(true);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = editSrc;
      });

      const scaleFactor = OUTPUT_SIZE / cropSize;
      const drawX = pos.x * scaleFactor;
      const drawY = pos.y * scaleFactor;
      const drawW = img.naturalWidth * scale * scaleFactor;
      const drawH = img.naturalHeight * scale * scaleFactor;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("Kırpılmış görsel üretilemedi.");

      await dispatch(updateProfilePicture(blob));

      cancelEditor();
      await loadProfilePhoto();
    } catch (e) {
      console.error(e);
    } finally {
      setPfSaving(false);
    }
  };

  const previewImgStyle = useMemo(() => {
    return {
      transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
      transformOrigin: "top left",
      width: `${imgNatural.w}px`,
      height: `${imgNatural.h}px`,
      willChange: "transform",
      userSelect: "none",
      pointerEvents: "none",
    };
  }, [pos.x, pos.y, scale, imgNatural.w, imgNatural.h]);

  const handleDelete = async () => {
    try {
      setPfDeleting(true);
      await dispatch(deleteProfilePicture());
      setPfSrc(null);
    } catch (e) {
      console.error(e);
    } finally {
      setPfDeleting(false);
    }
  };

  return (
    <section className="border border-border rounded-2xl p-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Profil Fotoğrafı</h2>
        <div className="flex gap-2">
          <AppButton onClick={loadProfilePhoto} disabled={pfLoading} loading={pfLoading} size="md" variant="gri">
            Yenile
          </AppButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Mevcut Fotoğraf</span>
          <div className="border border-border rounded-2xl p-3 flex items-center justify-center bg-muted/30 min-h-[140px]">
            {pfLoading ? (
              <CellSpinner />
            ) : (
              <img
                src={pfSrc || FALLBACK_IMG}
                alt="Profil Fotoğrafı"
                className="max-h-64 rounded-full object-cover aspect-square"
              />
            )}
          </div>
          {!pfSrc && !pfLoading && (
            <p className="text-xs text-muted-foreground">Mevcut fotoğraf bulunamadı. Varsayılan görsel gösteriliyor.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Yeni Fotoğraf Seç</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="border border-border rounded-xl px-3 py-2 bg-card text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-border"
            />
            {rawFile ? (
              <span className="text-xs text-muted-foreground">
                Seçilen: {rawFile.name} ({Math.round(rawFile.size / 1024)} KB)
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">JPG/PNG önerilir. Büyük görsellerde kalite daha iyi olur.</span>
            )}
          </div>

          {isEditing && editSrc && (
            <div className="mt-2">
              <div className="flex flex-col lg:flex-row items-start gap-4">
                <div
                  className="relative select-none border border-border rounded-2xl p-3 sm:p-4 bg-muted/40 w-full lg:w-auto"
                  onWheel={onWheelZoom}
                >
                  <div
                    className="relative mx-auto"
                    style={{
                      width: cropSize,
                      height: cropSize,
                      borderRadius: "9999px",
                      overflow: "hidden",
                      cursor: dragRef.current.dragging ? "grabbing" : "grab",
                      backgroundColor: "var(--muted)",
                    }}
                    onMouseDown={onDragStart}
                    onMouseMove={onDragMove}
                    onMouseUp={onDragEnd}
                    onMouseLeave={onDragEnd}
                    onTouchStart={onDragStart}
                    onTouchMove={onDragMove}
                    onTouchEnd={onDragEnd}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.07) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.07) 75%, rgba(0,0,0,0.07) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.07) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.07) 75%, rgba(0,0,0,0.07) 76%, transparent 77%)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <img
                      src={editSrc}
                      alt="Edit"
                      draggable={false}
                      style={previewImgStyle}
                    />
                  </div>

                  {/* Mobilde slider full */}
                  <div className="mt-3 flex items-center gap-2">
                    <AppButton
                      size="sm"
                      variant="gri"
                      onClick={() => onSliderChange(Math.max(scale - 0.1 * minScale, minScale))}
                      title="Uzaklaştır"
                    >
                      −
                    </AppButton>
                    <input
                      type="range"
                      min={minScale}
                      max={maxScale}
                      step={minScale / 20}
                      value={scale}
                      onChange={(e) => onSliderChange(e.target.value)}
                      className="w-full sm:w-52"
                    />
                    <AppButton
                      size="sm"
                      variant="gri"
                      onClick={() => onSliderChange(Math.min(scale + 0.1 * minScale, maxScale))}
                      title="Yakınlaştır"
                    >
                      +
                    </AppButton>
                  </div>

                  {/* Mobilde butonlar alt alta full */}
                  <div className="mt-2 grid grid-cols-1 sm:flex sm:items-center gap-2">
                    <AppButton size="sm" variant="gri" onClick={resetEditor} className="w-full sm:w-auto">
                      Sıfırla
                    </AppButton>
                    <AppButton
                      size="sm"
                      variant="yesil"
                      onClick={handleSaveCropped}
                      loading={pfSaving}
                      disabled={pfSaving}
                      title="Kırp ve Kaydet"
                      className="w-full sm:w-auto"
                    >
                      Kaydet
                    </AppButton>
                    <AppButton size="sm" variant="kirmizi" onClick={cancelEditor} disabled={pfSaving} className="w-full sm:w-auto">
                      İptal
                    </AppButton>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    İpucu: Resmi sürükleyin, tekerlek veya slider ile yakınlaştırın. Önizleme dairesel; kaydedilen görsel 1:1 kare olarak yüklenir.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-sm text-muted-foreground">Önizlemeler</div>
                  <div className="flex items-center gap-6">
                    <div
                      className="relative border border-border"
                      style={{ width: 80, height: 80, borderRadius: "9999px", overflow: "hidden" }}
                    >
                      <img src={editSrc} alt="mini" draggable={false} style={{
                        ...previewImgStyle,
                        transform: `translate(${(pos.x/ cropSize)*80}px, ${(pos.y/ cropSize)*80}px) scale(${scale * (80 / cropSize)})`,
                      }} />
                    </div>
                    <div
                      className="relative border border-border"
                      style={{ width: 120, height: 120, borderRadius: "9999px", overflow: "hidden" }}
                    >
                      <img src={editSrc} alt="mini" draggable={false} style={{
                        ...previewImgStyle,
                        transform: `translate(${(pos.x/ cropSize)*120}px, ${(pos.y/ cropSize)*120}px) scale(${scale * (120 / cropSize)})`,
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
              <AppButton
                onClick={() => fileInputRef.current?.click()}
                size="md"
                variant="yesil"
                title="Yeni foto seç ve düzenle"
                className="w-full sm:w-auto"
              >
                Yeni Fotoğraf Yükle
              </AppButton>
              <AppButton
                onClick={handleDelete}
                disabled={pfDeleting}
                loading={pfDeleting}
                size="md"
                variant="kirmizi"
                className="w-full sm:w-auto"
              >
                Sil
              </AppButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
