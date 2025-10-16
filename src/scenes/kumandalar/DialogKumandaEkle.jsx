import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogKumandaEkle = ({ onSave, children }) => {
  const [form, setForm] = useState({
    kumanda_isim: '',
    kapasite: 0,
    price: 0
  });

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
variant="kurumsalmavi" size="mdtxtlg" className="ml-auto w-40"
            title="Yeni kumanda ekle"
          >
            + Kumanda Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Kumanda Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label>Kumanda İsmi</label>
          <input
            name="kumanda_isim"
            value={form.kumanda_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Kapasite</label>
          <input
            type="number"
            name="kapasite"
            value={form.kapasite}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Fiyat</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <DialogClose asChild>
          <AppButton onClick={handleSave} variant="kurumsalmavi" size="md" shape="none" title="Kaydet ve kapat">
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKumandaEkle;
