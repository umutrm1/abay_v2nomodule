import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";
import { addSystemVariantToApi } from "@/redux/actions/actions_sistemler.js";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogVaryantOlustur = ({ systems = [], onCreated }) => {
  const dispatch = useDispatch();
  const [selectedSystem, setSelectedSystem] = useState("");
  const [variantName, setVariantName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSave = selectedSystem && variantName && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSubmitting(true);
      const payload = {
        systemId: selectedSystem,
        name: variantName,
        profile_templates: [],
        glass_templates: [],
        material_templates: [],
        remote_templates: [],
      };
      await dispatch(addSystemVariantToApi(payload));
      if (typeof onCreated === 'function') await onCreated();
      setSelectedSystem(""); setVariantName("");
      const closeBtn = document.getElementById('dlg-varyant-close');
      closeBtn?.click();
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <AppButton variant="kurumsalmavi" size="mdtxtlg" className="ml-auto w-40">+ Varyant Ekle</AppButton>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader><DialogTitle>Yeni Varyant Oluştur</DialogTitle></DialogHeader>

        <div className="grid gap-3 py-3">
          <label className="text-sm text-muted-foreground">Sistem Seç</label>
          <select className="select select-bordered" value={selectedSystem} onChange={(e) => setSelectedSystem(e.target.value)}>
            <option value="" disabled>— Bir sistem seçin —</option>
            {systems.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>

          <label className="text-sm text-muted-foreground mt-2">Varyant Adı</label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="Örn: Standart, Premium, XL..."
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <DialogClose asChild>
            <AppButton variant="gri">Vazgeç</AppButton>
          </DialogClose>

          <DialogClose asChild>
            <button id="dlg-varyant-close" className="hidden" />
          </DialogClose>

          <AppButton
            variant="kurumsalmavi"
            onClick={handleSave}
            disabled={!canSave}
            title={!selectedSystem ? "Önce sistem seçin" : (!variantName ? "Varyant adı girin" : "")}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogVaryantOlustur;
