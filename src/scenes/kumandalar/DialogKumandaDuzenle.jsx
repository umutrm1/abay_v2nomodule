// src/scenes/kumandalar/DialogKumandaDuzenle.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogKumandaDuzenle = ({ kumanda, onSave }) => {
  const [form, setForm] = useState({
    kumanda_isim: '',
    kapasite: 0,
    price:0
  });

  useEffect(() => {
    if (kumanda) {
      setForm({
        kumanda_isim: kumanda.kumanda_isim || '',
        kapasite: kumanda.kapasite || 0,
        price: kumanda.price || 0
      });
    }
  }, [kumanda]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSave = () => {
    onSave({ ...form, id: kumanda.id });
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
          <DialogTitle>Kumanda Düzenle: {kumanda.kumanda_isim}</DialogTitle>
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
            Güncelle
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKumandaDuzenle;
