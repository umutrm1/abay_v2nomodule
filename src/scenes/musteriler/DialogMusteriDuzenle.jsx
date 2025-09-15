import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog.jsx";

const DialogMusteriDuzenle = ({ musteri, onSave }) => {
  const [guncelMusteri, setGuncelMusteri] = useState({
    company_name: '',
    name: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    // API'den dönen objeyi direkt alıyoruz
    setGuncelMusteri({
      company_name: musteri.company_name || '',
      name:         musteri.name         || '',
      phone:        musteri.phone        || '',
      city:         musteri.city         || ''
    });
  }, [musteri]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuncelMusteri(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-sm btn-outline btn-info">Düzenle</button>
      </DialogTrigger>
      <DialogContent className={"max-w-200"}>
        <DialogHeader>
          <DialogTitle>Müşteri Düzenle: {musteri.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label className="font-semibold">Şirket İsmi</label>
          <input name="company_name" value={guncelMusteri.company_name} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">İsim</label>
          <input name="name" value={guncelMusteri.name} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Telefon</label>
          <input name="phone" value={guncelMusteri.phone} onChange={handleChange} className="input input-bordered" />

          <label className="font-semibold">Şehir</label>
          <input name="city" value={guncelMusteri.city} onChange={handleChange} className="input input-bordered" />
        </div>
        <DialogClose asChild>
          <button onClick={() => onSave({ ...guncelMusteri, id: musteri.id })} className="btn btn-success">
            Güncelle
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMusteriDuzenle;
