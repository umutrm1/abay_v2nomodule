// File: ProfilePhotoSection.jsx
// =========================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton.jsx";
import { CellSpinner } from "./Spinner.jsx";
import {
  getProfilePicture, // düz helper: dataURL döndürüyor (daha önce yazdık)
  updateProfilePicture, // PUT: blob gönder
  deleteProfilePicture, // DELETE
} from "@/redux/actions/actions_profilfoto";

export default function ProfilePhotoSection() {
  const dispatch = useDispatch();
  const FALLBACK_IMG = "/profilfoto.png";

  /* ------------------ Mevcut foto akışı ------------------ */
  const [pfLoading, setPfLoading] = useState(false);
  const [pfSaving, setPfSaving] = useState(false);
  const [pfDeleting, setPfDeleting] = useState(false);
  const [pfSrc, setPfSrc] = useState(null); // var olan fotoğrafın gösterim kaynağı (dataURL)

  // abort & revoke yardımcıları
  const abortRef = useRef(null);
  const safeRevoke = (url) => {
    try { if (url && url.startsWith("blob:")) URL.revokeObjectURL(url); } catch {}
  };

  async function loadProfilePhoto() {
    setPfLoading(true);
    try {
      // DİKKAT: dispatch etmiyoruz; düz helper
      const dataUrl = await getProfilePicture({ cacheBust: true });
      // doğrula
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

  /* ------------------ Editör (Twitter tarzı kırpma) ------------------ */
  /**
   * Yaklaşım:
   * - Kare bir çalışma alanı (cropSize px). İçinde <img> transform: translate + scale ile konumlandırılır.
   * - Dışa dairesel maske (CSS) uygulanır => kullanıcı final görünümü “yuvarlak” görür.
   * - Kaydet’te aynı transform matematiğini 512x512 canvasa uygular, kare sonuç üretir.
   */

  // Editör açık mı?
  const [isEditing, setIsEditing] = useState(false);

  // Yüklenen dosyanın ham dataURL’i (sadece editörde kullanılır)
  const [editSrc, setEditSrc] = useState(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 }); // doğal boyutlar

  // Görüntüyü çalışma alanında konumlandırma
  const CROP_SIZE = 300;            // ekrandaki kare çalışma alanı (px)
  const OUTPUT_SIZE = 512;          // çıktının kanvas piksel boyutu
  const [pos, setPos] = useState({ x: 0, y: 0 }); // görüntünün sol-üst köşesinin çalışma alanına göre ofset’i
  const [scale, setScale] = useState(1);          // zoom katsayısı (minScale tabanlı)

  // fare/trackpad sürükleme durumu
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  // Dosya seçildiğinde: dataURL oku, doğal boyutu al, editörü aç
  const fileInputRef = useRef(null);
  const [rawFile, setRawFile] = useState(null); // orijinal File (gerekirse kalite ölçümü vb.)

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRawFile(f);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result; // dataURL
      setEditSrc(src);

      // doğal boyutları öğren
      const img = new Image();
      img.onload = () => {
        setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });

        // Başlangıçta görseli alanı tamamen kaplayacak minimum scale hesapla
        const minScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
        const startScale = minScale * 1.05; // biraz yakınlaştırılmış başlat (daha “Twitter” hissi)
        setScale(startScale);

        // Görseli ortala (scaledWidth/Height bilerek hesapla)
        const scaledW = img.naturalWidth * startScale;
        const scaledH = img.naturalHeight * startScale;
        setPos({
          x: (CROP_SIZE - scaledW) / 2,
          y: (CROP_SIZE - scaledH) / 2,
        });

        setIsEditing(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  // minScale: görselin CROP_SIZE’ı tamamen kaplaması için gerekli en küçük scale
  const minScale = useMemo(() => {
    if (!imgNatural.w || !imgNatural.h) return 1;
    return Math.max(CROP_SIZE / imgNatural.w, CROP_SIZE / imgNatural.h);
  }, [imgNatural.w, imgNatural.h]);

  // Ölçek sınırları
  const MAX_SCALE_MULTIPLIER = 4; // istediğin kadar yükseltebilirsin
  const maxScale = useMemo(() => minScale * MAX_SCALE_MULTIPLIER, [minScale]);

  // pos’u (x,y) clamp’le: boşluk kalmasın
  const clampPos = (px, py, s = scale) => {
    const scaledW = imgNatural.w * s;
    const scaledH = imgNatural.h * s;
    // Görsel tamamen alanı örtmeli, o yüzden min pozisyon: (CROP_SIZE - scaledW)
    const minX = Math.min(0, CROP_SIZE - scaledW);
    const minY = Math.min(0, CROP_SIZE - scaledH);
    const maxX = 0;
    const maxY = 0;
    return {
      x: Math.min(Math.max(px, minX), maxX),
      y: Math.min(Math.max(py, minY), maxY),
    };
  };

  // Sürükleme başlangıcı
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
  // Sürükleme hareketi
  const onDragMove = (e) => {
    if (!dragRef.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    const next = clampPos(dragRef.current.startPosX + dx, dragRef.current.startPosY + dy);
    setPos(next);
  };
  // Sürükleme bırak
  const onDragEnd = () => {
    dragRef.current.dragging = false;
  };

  // Fare tekerleği ile zoom
  const onWheelZoom = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1; // yukarı = zoom in
    const nextScale = Math.min(Math.max(scale + delta * minScale, minScale), maxScale);
    // zoom merkezini crop alanının ortası kabul ediyoruz (basit)
    const factor = nextScale / scale;
    const cx = CROP_SIZE / 2;
    const cy = CROP_SIZE / 2;
    // merkezi sabit tutmak için pozisyonu ayarla
    const newX = cx - (cx - pos.x) * factor;
    const newY = cy - (cy - pos.y) * factor;
    setScale(nextScale);
    setPos(clampPos(newX, newY, nextScale));
  };

  // Slider ile zoom
  const onSliderChange = (v) => {
    const nextScale = Math.min(Math.max(Number(v), minScale), maxScale);
    const factor = nextScale / scale;
    const cx = CROP_SIZE / 2;
    const cy = CROP_SIZE / 2;
    const newX = cx - (cx - pos.x) * factor;
    const newY = cy - (cy - pos.y) * factor;
    setScale(nextScale);
    setPos(clampPos(newX, newY, nextScale));
  };

  // Reset
  const resetEditor = () => {
    if (!imgNatural.w || !imgNatural.h) return;
    const s = minScale * 1.05;
    setScale(s);
    const scaledW = imgNatural.w * s;
    const scaledH = imgNatural.h * s;
    setPos({
      x: (CROP_SIZE - scaledW) / 2,
      y: (CROP_SIZE - scaledH) / 2,
    });
  };

  // İptal
  const cancelEditor = () => {
    setIsEditing(false);
    if (editSrc && editSrc.startsWith("blob:")) safeRevoke(editSrc);
    setEditSrc(null);
    setImgNatural({ w: 0, h: 0 });
    setRawFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Kaydet → Canvas 512x512 render → Blob → PUT
  const handleSaveCropped = async () => {
    try {
      setPfSaving(true);

      // 1) Canvas hazırla
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      // 2) Kaynağı yükle
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = editSrc;
      });

      // 3) Ekrandaki transformu OUTPUT_SIZE’a ölçekle uygula
      // Ekranda: img boyutu = natural * scale (px), konum = pos (px), görünür alan = CROP_SIZE x CROP_SIZE
      // Canvas’ta aynı şeyi (OUTPUT_SIZE x OUTPUT_SIZE) için orantılayalım:
      const scaleFactor = OUTPUT_SIZE / CROP_SIZE;
      const drawX = pos.x * scaleFactor;
      const drawY = pos.y * scaleFactor;
      const drawW = img.naturalWidth * scale * scaleFactor;
      const drawH = img.naturalHeight * scale * scaleFactor;

      // 4) Arkaplanı şeffaf/kare (dilersen beyaz doldurabilirsin)
      // ctx.fillStyle = "#fff"; ctx.fillRect(0,0,OUTPUT_SIZE,OUTPUT_SIZE);

      // 5) Görseli çiz
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // 6) JPEG Blob üret (kalite 0.92)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("Kırpılmış görsel üretilemedi.");

      // 7) Sunucuya gönder
      await dispatch(updateProfilePicture(blob));

      // 8) Editörü kapat + mevcut foto yenile
      cancelEditor();
      await loadProfilePhoto();
    } catch (e) {
      console.error(e);
    } finally {
      setPfSaving(false);
    }
  };

  // Ekran önizleme için img stilini hesapla
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

  /* ------------------ Silme ------------------ */
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
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Profil Fotoğrafı</h2>
        <div className="flex gap-2">
          <AppButton onClick={loadProfilePhoto} disabled={pfLoading} loading={pfLoading} size="md" variant="gri">
            Yenile
          </AppButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sol: Mevcut foto */}
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

        {/* Sağ: İşlemler */}
        <div className="flex flex-col gap-3">
          {/* Dosya seç */}
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

          {/* Editör (Twitter tarzı) */}
          {isEditing && editSrc && (
            <div className="mt-2">
              <div className="flex items-start gap-6 flex-wrap">
                {/* Dairesel maskeli kare çalışma alanı */}
                <div
                  className="relative select-none border border-border rounded-2xl p-4 bg-muted/40"
                  onWheel={onWheelZoom}
                >
                  {/* Mask: dış çerçeve + dairesel kırpma penceresi */}
                  <div
                    className="relative"
                    style={{
                      width: CROP_SIZE,
                      height: CROP_SIZE,
                      borderRadius: "9999px",  // daire
                      overflow: "hidden",       // img dışını gizle
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
                    {/* Arkaplan grid (opsiyonel, hoş bir görünüm) */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.07) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.07) 75%, rgba(0,0,0,0.07) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.07) 25%, rgba(0,0,0,0.07) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.07) 75%, rgba(0,0,0,0.07) 76%, transparent 77%)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                    {/* Görsel (transform ile konumlandırılır) */}
                    <img
                      src={editSrc}
                      alt="Edit"
                      draggable={false}
                      style={previewImgStyle}
                    />
                  </div>

                  {/* Zoom kontrolleri */}
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
                      className="w-52"
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

                  <div className="mt-2 flex items-center gap-2">
                    <AppButton size="sm" variant="gri" onClick={resetEditor}>
                      Sıfırla
                    </AppButton>
                    <AppButton
                      size="sm"
                      variant="yesil"
                      onClick={handleSaveCropped}
                      loading={pfSaving}
                      disabled={pfSaving}
                      title="Kırp ve Kaydet"
                    >
                      Kaydet
                    </AppButton>
                    <AppButton size="sm" variant="kirmizi" onClick={cancelEditor} disabled={pfSaving}>
                      İptal
                    </AppButton>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    İpucu: Resmi sürükleyin, tekerlek veya slider ile yakınlaştırın. Önizleme dairesel; kaydedilen görsel 1:1 kare olarak yüklenir.
                  </p>
                </div>

                {/* Yan canlı küçük önizlemeler */}
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-muted-foreground">Önizlemeler</div>
                  <div className="flex items-center gap-8">
                    <div
                      className="relative border border-border"
                      style={{ width: 80, height: 80, borderRadius: "9999px", overflow: "hidden" }}
                    >
                      <img src={editSrc} alt="mini" draggable={false} style={{
                        ...previewImgStyle,
                        transform: `translate(${(pos.x/ CROP_SIZE)*80}px, ${(pos.y/ CROP_SIZE)*80}px) scale(${scale * (80 / CROP_SIZE)})`,
                      }} />
                    </div>
                    <div
                      className="relative border border-border"
                      style={{ width: 120, height: 120, borderRadius: "9999px", overflow: "hidden" }}
                    >
                      <img src={editSrc} alt="mini" draggable={false} style={{
                        ...previewImgStyle,
                        transform: `translate(${(pos.x/ CROP_SIZE)*120}px, ${(pos.y/ CROP_SIZE)*120}px) scale(${scale * (120 / CROP_SIZE)})`,
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kaydet/Sil butonları (editör dışında) */}
          {!isEditing && (
            <div className="flex flex-wrap gap-2">
              <AppButton
                onClick={() => fileInputRef.current?.click()}
                size="md"
                variant="yesil"
                title="Yeni foto seç ve düzenle"
              >
                Yeni Fotoğraf Yükle
              </AppButton>
              <AppButton
                onClick={handleDelete}
                disabled={pfDeleting}
                loading={pfDeleting}
                size="md"
                variant="kirmizi"
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
