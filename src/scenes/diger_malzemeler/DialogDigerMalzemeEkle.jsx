import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogDigerMalzemeEkle = ({ onSave }) => {
  const [form, setForm] = useState({
    diger_malzeme_isim: '',
    birim: '',
    birim_agirlik: 0,
    hesaplama_turu: 'olculu',
    unit_price: 0
  });

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn w-40 ml-auto btn-primary">
          + Malzeme Ekle
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Malzeme Ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label>İsim</label>
          <input
            name="diger_malzeme_isim"
            value={form.diger_malzeme_isim}
            onChange={handleChange}
            className="input input-bordered"
          />
          <label>Birim</label>
          <input
            name="birim"
            value={form.birim}
            onChange={handleChange}
            className="input input-bordered"
          />
          <label>Birim Ağırlık</label>
          <input
            type="number"
            name="birim_agirlik"
            value={form.birim_agirlik}
            onChange={handleChange}
            className="input input-bordered"
          />
          <label>Birim Fiyat</label>
          <input
            type="number"
            name="unit_price"
            value={form.unit_price}
            onChange={handleChange}
            className="input input-bordered"
          />
          <label>Hesaplama Türü</label>
          <select
            name="hesaplama_turu"
            value={form.hesaplama_turu}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="olculu">ölçülü</option>
            <option value="adetli">adetli</option>
          </select>
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

export default DialogDigerMalzemeEkle;
