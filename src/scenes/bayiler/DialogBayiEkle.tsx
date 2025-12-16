// Path: @/scenes/bayiler/DialogBayiEkle.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogBayiEkle = ({ onSave, children }) => {
  const [yeniBayi, setYeniBayi] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setYeniBayi(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    const bayiToSave = {
      name:       yeniBayi.name,
      email:      yeniBayi.email,
      phone:      yeniBayi.phone,
      owner_name: yeniBayi.owner_name,
      city:       yeniBayi.city
    };
    onSave(bayiToSave);
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
            className="w-full md:w-40 md:ml-auto"
          >
            + Bayi Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="w-[94vw] max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Yeni Bayi Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-4">
          <label className="font-semibold">İsim</label>
          <input
            name="name"
            value={yeniBayi.name}
            onChange={handleChange}
            placeholder="İsim"
            className="input input-bordered w-full"
          />

          <label className="font-semibold">E-posta</label>
          <input
            name="email"
            value={yeniBayi.email}
            onChange={handleChange}
            placeholder="E-posta"
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Telefon</label>
          <input
            name="phone"
            value={yeniBayi.phone}
            onChange={handleChange}
            placeholder="Telefon"
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Sahip</label>
          <input
            name="owner_name"
            value={yeniBayi.owner_name}
            onChange={handleChange}
            placeholder="Sahip Adı"
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Şehir</label>
          <input
            name="city"
            value={yeniBayi.city}
            onChange={handleChange}
            placeholder="Şehir"
            className="input input-bordered w-full"
          />
        </div>

        <DialogClose asChild>
          <AppButton
            variant="koyumavi"
            size="md"
            shape="none"
            onClick={handleSaveClick}
            className="w-full sm:w-auto"
          >
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBayiEkle;
