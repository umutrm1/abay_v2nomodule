// src/scenes/musteriler/DialogMusteriEkle.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog.jsx";

const DialogMusteriEkle = ({ onSave }) => {
  const [yeniMusteri, setYeniMusteri] = useState({
    company_name: '',
    name: '',
    phone: '',
    city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setYeniMusteri(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    // Gönderilecek obje
    const musteriToSave = {
      company_name: yeniMusteri.company_name,
      name:         yeniMusteri.name,
      phone:        yeniMusteri.phone,
      city:         yeniMusteri.city
    };
    onSave(musteriToSave);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-primary max-w-40 ml-auto w-40">+ Müşteri Ekle</button>
      </DialogTrigger>
      <DialogContent className={"max-w-200"}>
        <DialogHeader><DialogTitle>Yeni Müşteri Ekle</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <label className="font-semibold">Şirket İsmi</label>
          <input name="company_name" value={yeniMusteri.company_name} onChange={handleChange} placeholder="Şirket İsmi" className="input input-bordered" />

          <label className="font-semibold">İsim</label>
          <input name="name" value={yeniMusteri.name} onChange={handleChange} placeholder="İsim" className="input input-bordered" />

          <label className="font-semibold">Telefon</label>
          <input name="phone" value={yeniMusteri.phone} onChange={handleChange} placeholder="Telefon" className="input input-bordered" />

          <label className="font-semibold">Şehir</label>
          <input name="city" value={yeniMusteri.city} onChange={handleChange} placeholder="Şehir" className="input input-bordered" />
        </div>
        <DialogClose asChild>
          <button onClick={handleSaveClick} className="btn btn-success">Kaydet</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMusteriEkle;
