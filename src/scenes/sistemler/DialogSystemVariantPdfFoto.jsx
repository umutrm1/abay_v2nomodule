// src/scenes/sistemler/DialogSystemVariantPdfFoto.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

// ✅ actionsPdf.js içinden yeni fonksiyonlar
import {
  putSystemVariantPdfPhoto,
  getSystemVariantPdfPhoto,
  deleteSystemVariantPdfPhoto,
} from "@/redux/actions/actionsPdf.js";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogSystemVariantPdfFoto = ({ open, onOpenChange, variantId }) => {
  const dispatch = useDispatch();
  const [photoFile, setPhotoFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Dialog açılınca mevcut pdf fotoğrafı çek
  useEffect(() => {
    let mounted = true;

    const fetchExisting = async () => {
      if (!open || !variantId) return;
      try {
        setLoadingExisting(true);
        const url = await dispatch(getSystemVariantPdfPhoto(variantId));
        if (!mounted) return;
        setExistingUrl(url || null);
      } catch (err) {
        // 404 vb. durumda görsel yok kabul
        if (mounted) setExistingUrl(null);
      } finally {
        if (mounted) setLoadingExisting(false);
      }
    };

    fetchExisting();

    if (!open) {
      setPhotoFile(null);
      setExistingUrl(null);
    }

    return () => { mounted = false; };
  }, [open, variantId, dispatch]);

  // local preview
  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try { return URL.createObjectURL(photoFile); } catch { return null; }
  }, [photoFile]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleUpload = async () => {
    if (!variantId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(putSystemVariantPdfPhoto(variantId, photoFile));
      const url = await dispatch(getSystemVariantPdfPhoto(variantId));
      setExistingUrl(url || null);
      setPhotoFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!variantId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemVariantPdfPhoto(variantId));
      setExistingUrl(null);
      setPhotoFile(null);
    } finally {
      setDeleting(false);
    }
  };

  const showUrl = localPreview || existingUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>Varyant Pdf Fotoğraf</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="w-full aspect-video bg-muted/20 rounded flex items-center justify-center overflow-hidden border border-border">
            {loadingExisting ? (
              <span className="text-muted-foreground text-sm">Yükleniyor...</span>
            ) : showUrl ? (
              <img
                src={showUrl}
                alt="Önizleme"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground text-sm">Görsel yok</span>
            )}
          </div>

          {/* ✅ mobilde alt alta */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="file-input file-input-bordered file-input-sm w-full sm:w-auto"
            />

            <AppButton
              size="sm"
              variant="kurumsalmavi"
              shape="none"
              onClick={handleUpload}
              disabled={!photoFile || uploading}
              title={!photoFile ? "Önce dosya seçin" : ""}
            >
              {uploading ? "Yükleniyor..." : "Yükle"}
            </AppButton>

            <AppButton
              size="sm"
              variant="kirmizi"
              shape="none"
              onClick={handleDelete}
              disabled={deleting || !existingUrl}
              title={!existingUrl ? "Silinecek görsel yok" : ""}
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </AppButton>
          </div>

          <p className="text-xs text-muted-foreground">
            * Dosya seçip <b>Yükle</b>’ye bastığınızda görsel hemen güncellenir.
          </p>
        </div>

        <DialogClose asChild>
          <AppButton variant="gri">Kapat</AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSystemVariantPdfFoto;
