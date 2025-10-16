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
import AppButton from "@/components/ui/AppButton.jsx";

const DialogSystemVariantFoto = ({ open, onOpenChange, variantId }) => {
  const dispatch = useDispatch();
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const vimg = useSelector((s) => s.getSystemVariantImageFromApiReducer?.[variantId]);
  const existingUrl = vimg?.imageUrl;

  useEffect(() => {
    if (open && variantId) { dispatch(getSystemVariantImageFromApi(variantId)).catch(() => {}); }
    if (!open) setPhotoFile(null);
  }, [open, variantId, dispatch]);

  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try { return URL.createObjectURL(photoFile); } catch { return null; }
  }, [photoFile]);

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);

  const handleUpload = async () => {
    if (!variantId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(postSystemVariantImageToApi(variantId, photoFile));
      await dispatch(getSystemVariantImageFromApi(variantId));
      setPhotoFile(null);
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!variantId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemVariantImageFromApi(variantId));
      setPhotoFile(null);
    } finally { setDeleting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader><DialogTitle>Varyant Fotoğraf</DialogTitle></DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="w-full aspect-video bg-muted/20 rounded flex items-center justify-center overflow-hidden border border-border">
            {localPreview || existingUrl ? (
              <img src={localPreview || existingUrl} alt="Önizleme" className="w-full h-full object-contain" />
            ) : (<span className="text-muted-foreground text-sm">Görsel yok</span>)}
          </div>

          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm" />

            <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={handleUpload} disabled={!photoFile || uploading} title={!photoFile ? "Önce dosya seçin" : ""}>
              {uploading ? "Yükleniyor..." : "Yükle"}
            </AppButton>

            <AppButton size="sm" variant="kirmizi" shape="none" onClick={handleDelete} disabled={deleting || !existingUrl} title={!existingUrl ? "Silinecek görsel yok" : ""}>
              {deleting ? "Siliniyor..." : "Sil"}
            </AppButton>
          </div>

          <p className="text-xs text-muted-foreground">* Dosya seçip <b>Yükle</b>’ye bastığınızda görsel hemen güncellenir.</p>
        </div>

        <DialogClose asChild>
          <AppButton variant="gri">Kapat</AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSystemVariantFoto;
