import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog.jsx";

const initialForm = { project_name: "" };

const DialogProjeEkle = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm(); // modal kapandığında her durumda sıfırla
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const name = form.project_name.trim();
    if (!name) return; // boş/whitespace engelle
    await onSave?.({ project_name: name });
    setOpen(false); // kapanınca reset tetiklenecek
  };

  const submitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const canSave = form.project_name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn btn-primary w-40 ml-auto">
          + Teklif Ekle
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Teklif Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <label htmlFor="project_name" className="text-sm text-muted-foreground">
            Teklif Adı
          </label>
          <input
            id="project_name"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            onKeyDown={submitOnEnter}
            placeholder="Teklif Adı"
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <button className="btn">Vazgeç</button>
          </DialogClose>
          <button
            onClick={handleSave}
            className="btn btn-success"
            disabled={!canSave}
          >
            Kaydet
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProjeEkle;
