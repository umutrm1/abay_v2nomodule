import React, { useState } from 'react';
// Müşterilerde olduğu gibi ui/dialog parçalarını alıyoruz
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog.jsx";

const DialogProfilEkle = ({ onSave }) => {
  // 1) Form alanlarını tutacak state
  const [form, setForm] = useState({
    profil_kodu: '',
    profil_isim: '',
    birim_agirlik: 0,
    boy_uzunluk: 0,
    unit_price: 0,
    profil_kesit_fotograf: 'string'
  });

  // 2) Input change handler
  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // 3) Kaydet butonuna tıklanınca parent onSave çağrısı
  const handleSave = () => {
    onSave(form);
    // istersen burada form reset de edebilirsin
  };

  return (
    <Dialog>
      {/* 4) Butona tıklayınca modal açılır */}
      <DialogTrigger asChild>
        <button className="btn w-40 ml-auto bg-blue-700 text-white">
          + Profil Ekle
        </button>
      </DialogTrigger>

      {/* 5) Modal içeriği */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Profil Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 6) Her alan için label + input */}
          <label>Profil Kodu</label>
          <input
            name="profil_kodu"
            value={form.profil_kodu}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Profil Adı</label>
          <input
            name="profil_isim"
            value={form.profil_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Birim Ağırlık (kg)</label>
          <input
            type="number"
            name="birim_agirlik"
            value={form.birim_agirlik}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Boy Uzunluk (mm)</label>
          <input
            type="number"
            name="boy_uzunluk"
            value={form.boy_uzunluk}
            onChange={handleChange}
            className="input input-bordered"
          />

        </div>

        {/* 7) Kaydet: modal kapanır, handleSave çağrılır */}
        <DialogClose asChild>
          <button onClick={handleSave} className="btn btn-success">
            Kaydet
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProfilEkle;
