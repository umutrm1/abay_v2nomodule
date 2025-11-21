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

  const handleSave = () => {
    onSave({ ...guncelMusteri, id: musteri.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="sari"
            size="sm"
            shape="none"
            title="Müşteriyi düzenle"
          >
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Müşteri Düzenle: {musteri.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Şirket İsmi
            </label>
            <input
              name="company_name"
              value={guncelMusteri.company_name}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              İsim
            </label>
            <input
              name="name"
              value={guncelMusteri.name}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Telefon
            </label>
            <input
              name="phone"
              value={guncelMusteri.phone}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Şehir
            </label>
            <input
              name="city"
              value={guncelMusteri.city}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <DialogClose asChild>
          <AppButton
            onClick={handleSave}
            variant="kurumsalmavi"
            size="md"
            shape="none"
            className="w-full sm:w-auto"
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
