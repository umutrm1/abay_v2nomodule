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
  // 1) Form alan state'i
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 0
  });

  // 2) Input değişim handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // 3) Kaydet: parent onSave fonksiyonunu çağır
  const handleSave = () => {
    onSave(form);
    // Not: istersen burada form reset yapabilirsin.
    // setForm({ cam_isim: '', thickness_mm: 0 });
  };

  return (
    <Dialog>
      {/* Tetikleyici: children verilmişse onu kullan; yoksa varsayılan AppButton */}
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
variant="kurumsalmavi" size="mdtxtlg" className="ml-auto w-40"
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

        {/* Kapat/Kaydet: AppButton ile */}
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
