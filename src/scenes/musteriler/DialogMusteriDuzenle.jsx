import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const DialogMusteriDuzenle = ({ musteri, onSave, children }) => {
  const [guncelMusteri, setGuncelMusteri] = useState({
    company_name: '',
    name: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
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
        {children ? (
          children
        ) : (
          <AppButton variant="sari" size="sm" shape="none" title="Müşteriyi düzenle">
            Düzenle
          </AppButton>
        )}
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
          <AppButton
            onClick={() => onSave({ ...guncelMusteri, id: musteri.id })}
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

export default DialogMusteriDuzenle;
