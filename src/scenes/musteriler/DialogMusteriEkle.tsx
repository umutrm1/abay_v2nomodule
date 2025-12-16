// Path: @/scenes/musteriler/DialogMusteriEkle.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogMusteriEkle = ({ onSave, children }) => {
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
        {children ? (
          children
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="ml-auto w-full sm:w-40"
            title="Yeni müşteri ekle"
          >
            + Müşteri Ekle
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Şirket İsmi
            </label>
            <input
              name="company_name"
              value={yeniMusteri.company_name}
              onChange={handleChange}
              placeholder="Şirket İsmi"
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              İsim
            </label>
            <input
              name="name"
              value={yeniMusteri.name}
              onChange={handleChange}
              placeholder="İsim"
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Telefon
            </label>
            <input
              name="phone"
              value={yeniMusteri.phone}
              onChange={handleChange}
              placeholder="Telefon"
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm">
              Şehir
            </label>
            <input
              name="city"
              value={yeniMusteri.city}
              onChange={handleChange}
              placeholder="Şehir"
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <DialogClose asChild>
          <AppButton
            onClick={handleSaveClick}
            variant="kurumsalmavi"
            size="md"
            shape="none"
            className="w-full sm:w-auto"
            title="Kaydet ve kapat"
          >
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMusteriEkle;
