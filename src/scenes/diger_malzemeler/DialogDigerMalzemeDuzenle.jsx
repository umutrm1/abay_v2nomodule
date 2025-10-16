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

const DialogDigerMalzemeDuzenle = ({ item, onSave, children }) => {
  const [form, setForm] = useState({
    diger_malzeme_isim: '',
    birim: '',
    birim_agirlik: 0,
    hesaplama_turu: 'olculu',
    unit_price: 0
  });

  useEffect(() => {
    if (item) {
      setForm({
        diger_malzeme_isim: item.diger_malzeme_isim || '',
        birim: item.birim || '',
        birim_agirlik: item.birim_agirlik || 0,
        hesaplama_turu: item.hesaplama_turu || 'olculu',
        unit_price: item.unit_price || 0
      });
    }
  }, [item]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => {
    onSave({ id: item.id, ...form });
  };

  return (
    <Dialog>
      {/* Tetikleyici: children gelirse onu, gelmezse varsayılan AppButton kullan */}
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton variant="sari" size="sm" shape="none" title="Malzemeyi düzenle">
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Malzemeyi Düzenle</DialogTitle>
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

export default DialogDigerMalzemeDuzenle;
