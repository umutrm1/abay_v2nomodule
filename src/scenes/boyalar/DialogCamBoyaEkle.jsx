// src/scenes/boyalar/DialogCamBoyaEkle.jsx
import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from '@/components/ui/AppButton.jsx';

const initialForm = { name: '', unit_cost: 0 };

const DialogCamBoyaEkle = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm(); // Modal kapandı: her durumda sıfırla
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value || 0) : value }));
  };

  const handleSave = async () => {
    await onSave?.({ ...form, type: 'glass' });
    setOpen(false); // kapanınca onOpenChange(false) -> resetForm()
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AppButton variant="kurumsalmavi" size="mdtxtlg" className="ml-auto w-40">+ Cam Boya Ekle</AppButton>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Cam Boyası Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label>Boya İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <AppButton variant="gri">Vazgeç</AppButton>
          </DialogClose>
          <AppButton variant="kurumsalmavi" onClick={handleSave}>
            Kaydet
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamBoyaEkle;
