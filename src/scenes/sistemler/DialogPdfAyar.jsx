// src/scenes/sistemler/DialogPdfAyar.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx"; // PagedSelectDialog ile aynı dialog katmanı

// Proje genelinde varsayılan pdf alanları
const DEFAULT_PDF = {
  optimizasyonDetayliCiktisi: true,
  optimizasyonDetaysizCiktisi: true,
  siparisCiktisi: true,
  boyaCiktisi: true,
  profilAksesuarCiktisi: true,
  camCiktisi: true,
};

const Row = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-2 border-b last:border-b-0">
    <span className="text-sm">{label}</span>
    <input
      type="checkbox"
      className="checkbox checkbox-primary"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

const DialogPdfAyar = ({
  open,
  onOpenChange,
  initial = DEFAULT_PDF,
  onSave,
  title = "PDF Çıktı Ayarları",
}) => {
  const [form, setForm] = useState({ ...DEFAULT_PDF });

  // modal her açıldığında başlangıç değerlerini güncelle
  useEffect(() => {
    if (!open) return;
    setForm({
      ...DEFAULT_PDF,
      ...initial,
    });
  }, [open, initial]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // shadcn Dialog open state’i üst komponentten yönetiliyor
  const handleOpenChange = (v) => {
    onOpenChange?.(v);
    // kapanışta lokal state’i sıfırlamaya gerek yok; open=true olduğunda yeniden set ediliyor
  };

  const handleSave = () => {
    onSave?.(form);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* İçerik */}
        <div className="mt-2 divide-y">
          <Row
            label="Optimizasyon Detaylı Çıktısı"
            checked={form.optimizasyonDetayliCiktisi}
            onChange={(v) => setField("optimizasyonDetayliCiktisi", v)}
          />
          <Row
            label="Optimizasyon Detaysız Çıktısı"
            checked={form.optimizasyonDetaysizCiktisi}
            onChange={(v) => setField("optimizasyonDetaysizCiktisi", v)}
          />
          <Row
            label="Sipariş Çıktısı"
            checked={form.siparisCiktisi}
            onChange={(v) => setField("siparisCiktisi", v)}
          />
          <Row
            label="Boya Çıktısı"
            checked={form.boyaCiktisi}
            onChange={(v) => setField("boyaCiktisi", v)}
          />
          <Row
            label="Profil Aksesuar Çıktısı"
            checked={form.profilAksesuarCiktisi}
            onChange={(v) => setField("profilAksesuarCiktisi", v)}
          />
          <Row
            label="Cam Çıktısı"
            checked={form.camCiktisi}
            onChange={(v) => setField("camCiktisi", v)}
          />
        </div>

        {/* Aksiyonlar */}
        <div className="mt-6 flex justify-end gap-2">
          {/* DialogClose ile anında kapanış (kaydetmeden) */}
          <DialogClose asChild>
            <button className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-700">
              Vazgeç
            </button>
          </DialogClose>

          <button
            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            Kaydet
          </button>
        </div>

        {/* Sağ üst X */}
        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPdfAyar;
