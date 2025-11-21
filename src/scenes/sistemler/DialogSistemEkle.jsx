import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
  AddOrUpdateSystemImageFromApi,
  getSystemImageFromApi,
  deleteSystemImageOnApi,
} from "@/redux/actions/actions_sistemler.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogSistemEkle = ({ system, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch();
  const sysId = system?.id;
  const sysImage = useSelector(s => s.getSystemImageFromApiReducer?.[sysId]);
  const existingUrl = sysImage?.imageUrl;

  useEffect(() => {
    if (system) {
      setForm({ name: system.name, description: system.description || "" });
      if (system.id) dispatch(getSystemImageFromApi(system.id));
    } else {
      setForm({ name: '', description: '' });
    }
    setPhotoFile(null);
  }, [system, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try { return URL.createObjectURL(photoFile); } catch { return null; }
  }, [photoFile]);

  const handleSave = () => { onSave({ id: system?.id, ...form, photoFile }); };

  const handleUploadNow = async () => {
    if (!sysId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(AddOrUpdateSystemImageFromApi(sysId, photoFile));
      await dispatch(getSystemImageFromApi(sysId));
      setPhotoFile(null);
    } finally { setUploading(false); }
  };

  const handleDeletePhoto = async () => {
    if (!sysId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemImageOnApi(sysId));
      setPhotoFile(null);
    } finally { setDeleting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {system ? (
          <AppButton size="sm" variant="sari" shape="none">Düzenle</AppButton>
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            // ✅ Musteriler responsive standardı
            className="w-full sm:w-40 sm:ml-auto"
          >
            + Sistem Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>{system ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <label className="text-sm text-muted-foreground">Sistem İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sistem İsmi"
            className="input input-bordered"
          />

          <label className="text-sm text-muted-foreground">Açıklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Açıklama"
            className="textarea textarea-bordered"
          />

          <div className="mt-2">
            <label className="block mb-2 text-sm text-muted-foreground">Sistem Fotoğraf</label>

            <div className="w-full aspect-video bg-muted/20 rounded flex items-center justify-center overflow-hidden border border-border">
              {(localPreview || existingUrl) ? (
                <img
                  src={localPreview || existingUrl}
                  alt="Önizleme"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Görsel yok</span>
              )}
            </div>

            {/* ✅ mobilde alt alta dizilsin */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
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
                onClick={handleUploadNow}
                disabled={!sysId || !photoFile || uploading}
                title={!sysId ? "Önce sistemi kaydedin" : (!photoFile ? "Önce dosya seçin" : "")}
              >
                {uploading ? "Yükleniyor..." : "Yükle"}
              </AppButton>

              <AppButton
                size="sm"
                variant="kirmizi"
                shape="none"
                onClick={handleDeletePhoto}
                disabled={!sysId || deleting}
                title={!sysId ? "Kayıtlı sistemde kullanılabilir" : ""}
              >
                {deleting ? "Siliniyor..." : "Sil"}
              </AppButton>
            </div>

            {!sysId && (
              <p className="text-xs text-muted-foreground mt-1">
                * Yeni sistem eklemede fotoğraf, <b>Kaydet</b>’e bastıktan sonra otomatik yüklenecektir.
              </p>
            )}
          </div>
        </div>

        <DialogClose asChild>
          <AppButton variant="kurumsalmavi" onClick={handleSave}>
            {system ? 'Güncelle' : 'Kaydet'}
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemEkle;
