// src/scenes/sistemler/DialogSistemEkle.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
  AddOrUpdateSystemImageFromApi,
  getSystemImageFromApi,
  deleteSystemImageOnApi,
} from "@/redux/actions/actions_sistemler.js";
// Dialog parçaları
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogSistemEkle = ({ system, onSave }) => {
  // 1) system varsa düzenleme, yoksa ekleme formu
  const [form, setForm] = useState({ name: '', description: '' });

  // 2) Foto yükleme/silme local state
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch();

  // 3) Mevcut görseli store’dan oku (düzenle modunda)
  const sysId = system?.id;
  const sysImage = useSelector(s => s.getSystemImageFromApiReducer?.[sysId]);
  const existingUrl = sysImage?.imageUrl;

  // 4) system değişince formu doldur ve görseli çek
  useEffect(() => {
    if (system) {
      setForm({ name: system.name, description: system.description || "" });
      // Mevcut görseli getir (önizleme için)
      if (system.id) dispatch(getSystemImageFromApi(system.id));
    } else {
      setForm({ name: '', description: '' });
    }
    // yeni sistem ekleme ekranına her girişte dosya seçimini sıfırla
    setPhotoFile(null);
  }, [system, dispatch]);

  // 5) Input/textarea handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 6) Local seçilen foto’nun geçici önizlemesi (varsa)
  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try {
      return URL.createObjectURL(photoFile);
    } catch {
      return null;
    }
  }, [photoFile]);

  // 7) Kaydet/Güncelle — üst parent’a foto dosyasını da iletiyoruz
  const handleSave = () => {
    onSave({ id: system?.id, ...form, photoFile });
  };

  // 8) Düzenle modunda tek tıkla yükle
  const handleUploadNow = async () => {
    if (!sysId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(AddOrUpdateSystemImageFromApi(sysId, photoFile));
      await dispatch(getSystemImageFromApi(sysId)); // taze önizleme
      setPhotoFile(null); // seçim sıfırlansın
    } finally {
      setUploading(false);
    }
  };

  // 9) Düzenle modunda foto sil
  const handleDeletePhoto = async () => {
    if (!sysId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemImageOnApi(sysId));
      // store’dan silindi; ek güvence için (önizleme kaybolsun)
      // local seçili dosya da sıfırlansın
      setPhotoFile(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        {system ? (
          <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
            Düzenle
          </button>
        ) : (
          <button className="btn w-40 ml-auto bg-blue-700 hover:bg-blue-800 text-white text-lg">
            + Sistem Ekle
          </button>
        )}
      </DialogTrigger>

      {/* İçerik */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {system ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label>Sistem İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sistem İsmi"
            className="input input-bordered"
          />

          <label>Açıklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Açıklama"
            className="input input-bordered"
          />

          {/* --- Sistem Fotoğraf Alanı --- */}
          <div className="mt-2">
            <label className="block mb-2 font-medium">Sistem Fotoğraf</label>

            {/* Önizleme kutusu */}
            <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
              {(localPreview || existingUrl) ? (
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
            <div className="flex items-center gap-2 mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered file-input-sm"
              />

              {/* Düzenle modunda anında yükle */}
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUploadNow}
                disabled={!sysId || !photoFile || uploading}
                title={!sysId ? "Önce sistemi kaydedin" : (!photoFile ? "Önce dosya seçin" : "")}
              >
                {uploading ? "Yükleniyor..." : "Yükle"}
              </button>

              {/* Düzenle modunda sil */}
              <button
                className="btn btn-sm btn-error"
                onClick={handleDeletePhoto}
                disabled={!sysId || deleting}
                title={!sysId ? "Kayıtlı sistemde kullanılabilir" : ""}
              >
                {deleting ? "Siliniyor..." : "Sil"}
              </button>
            </div>

            {/* Bilgi notu */}
            {!sysId && (
              <p className="text-xs text-gray-500 mt-1">
                * Yeni sistem eklemede fotoğraf, <b>Kaydet</b>’e bastıktan sonra otomatik yüklenecektir.
              </p>
            )}
          </div>
        </div>

        {/* Kaydet/Güncelle */}
        <DialogClose asChild>
          <button onClick={handleSave} className="btn btn-success">
            {system ? 'Güncelle' : 'Kaydet'}
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemEkle;
