import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";

const initialForm = { name: '', unit_cost: 0 };

const DialogProfilBoyaEkle = ({ onSave }) => {
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
    await onSave?.({ ...form, type: 'profile' });
    setOpen(false); // kapanınca onOpenChange(false) -> resetForm()
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn ml-auto bg-blue-700 text-white">+ Ekle</button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Yeni Profil Boyası Ekle</DialogTitle></DialogHeader>

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
            <button className="btn">Vazgeç</button>
          </DialogClose>
          <button onClick={handleSave} className="btn btn-success">Kaydet</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProfilBoyaEkle;
