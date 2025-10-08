import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog.jsx";

const DialogCamBoyaDuzenle = ({ color, onSave }) => {
  const [form, setForm] = useState({ name: '', unit_cost: 0 });
  useEffect(() => {
    if (color) setForm({ name: color.name, unit_cost: 0 });
  }, [color]);
  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  const handleSave = () => onSave({ id: color.id, ...form, type: 'glass' });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-warning">
          Düzenle
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Camı Düzenle</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <label>Boya İsmi</label>
          <input name="name" value={form.name} onChange={handleChange} className="input input-bordered" />
        </div>
        <DialogClose asChild>
          <button onClick={handleSave} className="btn btn-success">Güncelle</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamBoyaDuzenle;
