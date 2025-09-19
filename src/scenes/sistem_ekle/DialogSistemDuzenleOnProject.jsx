// src/scenes/sistemekle/DialogSistemDuzenleOnProject.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";

/**
 * DialogSistemDuzenleOnProject
 * - DialogPdfAyar.jsx ile aynı shadcn Dialog katmanını kullanır.
 * - Props:
 *   open, onOpenChange: üstten kontrol
 *   title: başlık (default: "Sistem Düzenle")
 *   initial: { width_mm, height_mm, quantity }
 *   onSave(values): Kaydet tetikleyicisi
 *   loading: variant fetch aşaması (form yerine spinner)
 *   saving: dispatch (Kaydet butonunda spinner)
 */
const DialogSistemDuzenleOnProject = ({
  open,
  onOpenChange,
  title = "Sistem Düzenle",
  initial = { width_mm: 0, height_mm: 0, quantity: 0 },
  onSave,
  loading = false,
  saving = false,
}) => {
  const [form, setForm] = useState({
    width_mm: 0,
    height_mm: 0,
    quantity: 0,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      width_mm: Number(initial.width_mm || 0),
      height_mm: Number(initial.height_mm || 0),
      quantity: Number(initial.quantity || 0),
    });
  }, [open, initial]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const handleSave = () => {
    if (!onSave) return;
    onSave({
      width_mm: Number(form.width_mm || 0),
      height_mm: Number(form.height_mm || 0),
      quantity: Number(form.quantity || 0),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* İçerik */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <label className="form-control w-full">
              <span className="label-text">En (mm)</span>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.width_mm}
                onChange={(e) => setField("width_mm", e.target.value)}
                disabled={saving}
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text">Boy (mm)</span>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.height_mm}
                onChange={(e) => setField("height_mm", e.target.value)}
                disabled={saving}
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text">Adet</span>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                disabled={saving}
              />
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <button
              className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-700"
              disabled={saving}
            >
              Vazgeç
            </button>
          </DialogClose>

          <button
            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            Kaydet
          </button>
        </div>

        <DialogClose asChild>
          {/* <button
            aria-label="Close"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            disabled={saving}
          >
            
          </button> */}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemDuzenleOnProject;
