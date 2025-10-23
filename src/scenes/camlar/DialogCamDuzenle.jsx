import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogCamDuzenle = ({ cam, onSave, children }) => {
  // 🧱 Düzenleme state'i: thickness_mm varsayılanı 1 (Tek Cam)
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 1
  });

  // 🔄 cam prop'u gelince formu doldur
  useEffect(() => {
    if (cam) {
      setForm({
        cam_isim: cam.cam_isim || '',
        // Backend'ten 1/2 geliyorsa direkt kullan; yoksa emniyetli olarak 1
        thickness_mm: Number(cam.thickness_mm) === 2 ? 2 : 1
      });
    }
  }, [cam]);

  // 🧠 Ortak handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // 💾 Güncelle: id ile birlikte yolla
  const handleSave = () => {
    onSave({ id: cam.id, ...form });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="sari"
            size="sm"
            shape="none"
            title="Cam bilgisini düzenle"
          >
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cam Düzenle{cam?.cam_isim ? `: ${cam.cam_isim}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label htmlFor="cam_isim">Cam İsmi</label>
          <input
            id="cam_isim"
            name="cam_isim"
            value={form.cam_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label htmlFor="thickness_mm">Cam Türü</label>
          {/* 🔁 number yerine select: form.thickness_mm değeri 1/2 */}
          <select
            id="thickness_mm"
            name="thickness_mm"
            value={String(form.thickness_mm)}
            onChange={(e) =>
              setForm(prev => ({ ...prev, thickness_mm: Number(e.target.value) }))
            }
            className="select select-bordered"
          >
            <option value="1">Tek Cam</option>
            <option value="2">Çift Cam</option>
          </select>
        </div>

        <DialogClose asChild>
          <AppButton
            onClick={handleSave}
            variant="kurumsalmavi"
            size="md"
            shape="none"
            title="Güncelle ve kapat"
          >
            Güncelle
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamDuzenle;
