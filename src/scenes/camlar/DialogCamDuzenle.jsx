import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogCamDuzenle = ({ cam, onSave }) => {
  // 1) Düzenlenen cam verisi için state
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 0
  });

  // 2) Props değişince formu ön-doldur
  useEffect(() => {
    if (cam) {
      setForm({
        cam_isim: cam.cam_isim || '',
        thickness_mm: cam.thickness_mm || 0
      });
    }
  }, [cam]);

  // 3) Input değişim handler
  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // 4) Güncelle: onSave ile id dahil gönder
  const handleSave = () => {
    onSave({ id: cam.id, ...form });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-sm btn-outline btn-info">
          Düzenle
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cam Düzenle: {cam.cam_isim}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label>Cam İsmi</label>
          <input
            name="cam_isim"
            value={form.cam_isim}
            onChange={handleChange}
            className="input input-bordered"
          />
          <label>Kalınlık (mm)</label>
          <input
            type="number"
            name="thickness_mm"
            value={form.thickness_mm}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>
        <DialogClose asChild>
          <button onClick={handleSave} className="btn btn-success">
            Güncelle
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamDuzenle;
