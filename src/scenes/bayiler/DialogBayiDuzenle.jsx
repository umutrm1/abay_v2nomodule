// src/scenes/bayiler/DialogBayiDuzenle.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

const DialogBayiDuzenle = ({ bayi, onSave }) => {
  const [guncelBayi, setGuncelBayi] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    city: '',
    status: '' // 'active' | 'suspended' vs… (server ne döndürüyorsa)
  });

  useEffect(() => {
    setGuncelBayi({
      name:       bayi?.name       || '',
      email:      bayi?.email      || '',
      phone:      bayi?.phone      || '',
      owner_name: bayi?.owner_name || '',
      city:       bayi?.city       || '',
      status:     bayi?.status     || ''
    });
  }, [bayi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuncelBayi(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-sm btn-outline btn-info">Düzenle</button>
      </DialogTrigger>
      <DialogContent className={"max-w-200"}>
        <DialogHeader>
          <DialogTitle>Bayi Düzenle: {bayi?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label className="font-semibold">İsim</label>
          <input name="name" value={guncelBayi.name} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">E-posta</label>
          <input name="email" value={guncelBayi.email} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Telefon</label>
          <input name="phone" value={guncelBayi.phone} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Sahip</label>
          <input name="owner_name" value={guncelBayi.owner_name} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Şehir</label>
          <input name="city" value={guncelBayi.city} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Durum</label>
          <select name="status" value={guncelBayi.status} onChange={handleChange} className="select select-bordered">
            <option value="">Seçiniz</option>
            <option value="active">Aktif</option>
            <option value="suspended">Askıda</option>
          </select>
        </div>
        <DialogClose asChild>
          <button
            onClick={() => onSave({ ...guncelBayi, id: bayi.id })}
            className="btn btn-success"
          >
            Güncelle
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBayiDuzenle;
