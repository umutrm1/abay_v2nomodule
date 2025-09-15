// src/scenes/kumandalar/DialogKumandaEkle.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogKumandaEkle = ({ onSave }) => {
  const [form, setForm] = useState({
    kumanda_isim: '',
    kapasite: 0,
    price:0
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
        <button className="btn w-40 ml-auto bg-blue-700 text-white">
          + Kumanda Ekle
        </button>
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
          <button onClick={handleSave} className="btn btn-success">
            Kaydet
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKumandaEkle;
