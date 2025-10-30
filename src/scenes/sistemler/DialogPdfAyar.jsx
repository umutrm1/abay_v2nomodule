import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DEFAULT_PDF = {
  optimizasyonDetayliCiktisi: true,
  optimizasyonDetaysizCiktisi: true,
  siparisCiktisi: true,
  boyaCiktisi: true,
  profilAksesuarCiktisi: true,
  camCiktisi: true,
};

const Row = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
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

  useEffect(() => {
    if (!open) return;
    setForm({ ...DEFAULT_PDF, ...initial });
  }, [open, initial]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const handleOpenChange = (v) => onOpenChange?.(v);

  const handleSave = () => {
    onSave?.(form);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 divide-y divide-border">
          <Row label="Optimizasyon Detaylı Çıktısı"  checked={form.optimizasyonDetayliCiktisi} onChange={(v) => setField("optimizasyonDetayliCiktisi", v)} />
          <Row label="Optimizasyon Detaysız Çıktısı" checked={form.optimizasyonDetaysizCiktisi} onChange={(v) => setField("optimizasyonDetaysizCiktisi", v)} />
          <Row label="Üretim Çıktısı"               checked={form.siparisCiktisi}               onChange={(v) => setField("siparisCiktisi", v)} />
          <Row label="Boya Çıktısı"                  checked={form.boyaCiktisi}                  onChange={(v) => setField("boyaCiktisi", v)} />
          <Row label="Profil Aksesuar Çıktısı"       checked={form.profilAksesuarCiktisi}        onChange={(v) => setField("profilAksesuarCiktisi", v)} />
          <Row label="Cam Çıktısı"                   checked={form.camCiktisi}                   onChange={(v) => setField("camCiktisi", v)} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <AppButton size="sm" variant="gri">Vazgeç</AppButton>
          </DialogClose>
          <AppButton size="sm" variant="kurumsalmavi" onClick={handleSave}>Kaydet</AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPdfAyar;
