// src/scenes/sistemler/DialogSystemVariantFoto.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  postSystemVariantImageToApi,
  getSystemVariantImageFromApi,
  deleteSystemVariantImageFromApi,
} from "@/redux/actions/actions_sistemler.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";

/**
 * Props:
 *  - open: boolean
 *  - onOpenChange: (open:boolean) => void
 *  - variantId: string
 */
const DialogSystemVariantFoto = ({ open, onOpenChange, variantId }) => {
  const dispatch = useDispatch();

  // local state
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // store’dan mevcut görsel (ObjectURL) — reducer: getSystemVariantImageFromApiReducer
  const vimg = useSelector(
    (s) => s.getSystemVariantImageFromApiReducer?.[variantId]
  );
  const existingUrl = vimg?.imageUrl;

  // dialog açıldığında mevcut fotoğrafı çek
  useEffect(() => {
    if (open && variantId) {
      dispatch(getSystemVariantImageFromApi(variantId)).catch(() => {});
    }
    // dialog kapanırken local seçimi temizle
    if (!open) setPhotoFile(null);
  }, [open, variantId, dispatch]);

  // local seçilen dosya için geçici önizleme
  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try {
      return URL.createObjectURL(photoFile);
    } catch {
      return null;
    }
  }, [photoFile]);

  // local objectURL’i serbest bırak (hafıza için)
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleUpload = async () => {
    if (!variantId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(postSystemVariantImageToApi(variantId, photoFile));
      await dispatch(getSystemVariantImageFromApi(variantId)); // taze önizleme
      setPhotoFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!variantId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemVariantImageFromApi(variantId));
      setPhotoFile(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Varyant Fotoğraf</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Önizleme kutusu */}
          <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
            {localPreview || existingUrl ? (
              <img
                src={localPreview || existingUrl}
                alt="Önizleme"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">Görsel yok</span>
            )}
          </div>

          {/* Dosya seç + aksiyonlar */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="file-input file-input-bordered file-input-sm"
            />

            <button
              className="btn btn-sm btn-primary"
              onClick={handleUpload}
              disabled={!photoFile || uploading}
              title={!photoFile ? "Önce dosya seçin" : ""}
            >
              {uploading ? "Yükleniyor..." : "Yükle"}
            </button>

            <button
              className="btn btn-sm btn-error"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            * Dosya seçip <b>Yükle</b>’ye bastığınızda görsel hemen güncellenir.
          </p>
        </div>

        <DialogClose asChild>
          <button className="btn">Kapat</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSystemVariantFoto;
