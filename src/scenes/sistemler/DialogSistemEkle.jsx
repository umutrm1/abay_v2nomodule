import React, { useState, useEffect } from 'react';
// Müşterilerdeki örnektekiyle aynı dialog parçaları
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogSistemEkle = ({ system, onSave }) => {
  // 1) system varsa düzenleme, yoksa ekleme formu
  const [form, setForm] = useState({ name: '', description: '' });

  // 2) Props gelen system değişince formu ön-doldur
  useEffect(() => {
    if (system) {
      setForm({ name: system.name, description: system.description });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [system]);

  // 3) Input / textarea handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 4) Kaydet/Güncelle butonuna tıklandığında onSave’i çağır
  const handleSave = () => {
    // id ekle; ekleme için undefined, düzenleme için truthy
    onSave({ id: system?.id, ...form });
  };

  return (
    <Dialog>
      {/* 5) Trigger: ekleme ve düzenleme butonları */}
      <DialogTrigger asChild>
        {system ? (
          <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
            Düzenle
          </button>
        ) : (
          <button className="btn w-40 ml-auto bg-blue-700 hover:bg-blue-800 text-white text-lg">
            + Sistem Ekle
          </button>
        )}
      </DialogTrigger>

      {/* 6) Modal içeriği */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {system ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label>Sistem İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sistem İsmi"
            className="input input-bordered"
          />

          <label>Açıklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Açıklama"
            className="input input-bordered"
          />
        </div>

        {/* 7) Kaydet/Güncelle */}
        <DialogClose asChild>
          <button onClick={handleSave} className="btn btn-success">
            {system ? 'Güncelle' : 'Kaydet'}
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemEkle;
