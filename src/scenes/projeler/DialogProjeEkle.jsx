import React, { useState } from 'react';
// 1) ui/dialog bileşenlerinden gerekli parçaları import ediyoruz:
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

const DialogProjeEkle = ({ onSave }) => {
  // 2) Yeni proje objesini tek alanlı olarak tutmak için state oluşturuyoruz:
  const [yeniProje, setYeniProje] = useState({
    project_name: ''
  });

  // 3) Input değiştiğinde state'i güncelleyen handler:
  const handleChange = (e) => {
    const { name, value } = e.target;
    // önceki hali koruyup sadece ilgili alanı güncelliyoruz:
    setYeniProje(prev => ({ ...prev, [name]: value }));
  };

  // 4) Kaydet butonuna tıklanınca parent'ten gelen onSave'i çağırıyoruz:
  const handleSaveClick = () => {
    // onSave, Projeler.jsx içindeki handleAddProje fonksiyonunu tetikleyecek:
    onSave(yeniProje);
  };

  return (
    // 5) <Dialog> kapsayıcısı tüm modal mantığını sağlıyor:
    <Dialog>
      {/* 6) DialogTrigger: butona tıklanınca modal açılır */}
      <DialogTrigger asChild>
        <button className="btn max-w-40 ml-auto w-40 bg-blue-700 text-white">
          + Proje Ekle
        </button>
      </DialogTrigger>

      {/* 7) Modal içeriği */}
      <DialogContent className={"max-w-200"}>
        <DialogHeader>
          <DialogTitle>Yeni Proje Ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <label className="font-semibold">Proje Adı</label>
          {/* 8) Tek bir input, name olarak project_name */}
          <input
            name="project_name"
            value={yeniProje.project_name}
            onChange={handleChange}
            placeholder="Proje Adı"
            className="input input-bordered"
          />
        </div>
        {/* 9) Kaydet butonuna basıldığında önce modal kapanır, sonra handleSaveClick çalışır */}
        <DialogClose asChild>
          <button onClick={handleSaveClick} className="btn btn-success">
            Kaydet
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProjeEkle;
