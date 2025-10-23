import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogCamEkle = ({ onSave, children }) => {
  // 🔧 Form state: thickness_mm'i 1 (Tek Cam) olarak varsayılan başlatıyoruz
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 1, // 1: Tek Cam, 2: Çift Cam
  });

  // 🧠 Ortak input handler: text için direkt, select/number için Number()
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // 💾 Kaydet: parent'a doğrudan { cam_isim, thickness_mm } gönderiyoruz
  const handleSave = () => {
    onSave(form);
    // İstersen reset:
    // setForm({ cam_isim: '', thickness_mm: 1 });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="ml-auto w-40"
            title="Yeni cam kaydı ekle"
          >
            + Cam Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Cam Ekle</DialogTitle>
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
          {/* 🔁 number yerine select: 1=Tek, 2=Çift */}
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
            title="Kaydet ve kapat"
          >
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamEkle;
