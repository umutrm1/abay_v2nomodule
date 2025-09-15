import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogCamEkle = ({ onSave }) => {
  // 1) Form alan state'i
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 0
  });

  // 2) Input değişim handler
  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // 3) Kaydet: parent onSave fonksiyonunu çağır
  const handleSave = () => {
    onSave(form);
    // istersen form reset ekleyebilirsin
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn w-40 ml-auto bg-blue-700 text-white">
          + Cam Ekle
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Cam Ekle</DialogTitle>
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
            Kaydet
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamEkle;
