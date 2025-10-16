import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

const initialState = { width_mm: "", height_mm: "", quantity: "" };

const DialogSistemDuzenleOnProject = ({
  open,
  onOpenChange,
  title = "Sistem Düzenle",
  initial = { width_mm: 0, height_mm: 0, quantity: 0 },
  onSave,
  loading = false,
  saving = false,
}) => {
  const [form, setForm] = useState(initialState);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      width_mm: String(initial?.width_mm ?? ""),
      height_mm: String(initial?.height_mm ?? ""),
      quantity: String(initial?.quantity ?? ""),
    });
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [open, initial]);

  const handleOpenChange = (v) => {
    onOpenChange?.(v);
    if (!v) setForm(initialState);
  };

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const width = toNumber(form.width_mm);
  const height = toNumber(form.height_mm);
  const qtyRaw = toNumber(form.quantity);
  const qty = qtyRaw;

  const errors = {
    width: width <= 0,
    height: height <= 0,
    qty: qty <= 0 || !Number.isInteger(qty),
  };
  const hasError = errors.width || errors.height || errors.qty;
  const canSave = !loading && !saving && !hasError;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!canSave) return;
    onSave?.({ width_mm: width, height_mm: height, quantity: qty });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <form className="mt-2 space-y-3" onSubmit={submit}>
            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">En (mm)</span>
              <input
                ref={firstInputRef}
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.width ? "input-error" : ""}`}
                value={form.width_mm}
                onChange={(e) => setField("width_mm", e.target.value)}
                disabled={saving}
                placeholder="Örn: 1200"
              />
              {errors.width && <span className="text-xs text-destructive mt-1">En 0’dan büyük olmalı.</span>}
            </label>

            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">Boy (mm)</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.height ? "input-error" : ""}`}
                value={form.height_mm}
                onChange={(e) => setField("height_mm", e.target.value)}
                disabled={saving}
                placeholder="Örn: 2400"
              />
              {errors.height && <span className="text-xs text-destructive mt-1">Boy 0’dan büyük olmalı.</span>}
            </label>

            <label className="form-control w-full">
              <span className="label-text text-muted-foreground">Adet</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step="1"
                className={`input input-bordered w-full ${errors.qty ? "input-error" : ""}`}
                value={form.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                disabled={saving}
                placeholder="Örn: 3"
              />
              {errors.qty && <span className="text-xs text-destructive mt-1">Adet pozitif tam sayı olmalı.</span>}
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <AppButton type="button" size="sm" variant="gri" disabled={saving}>
                  Vazgeç
                </AppButton>
              </DialogClose>

              <AppButton
                type="submit"
                size="sm"
                variant="kurumsalmavi"
                className="inline-flex items-center gap-2"
                disabled={!canSave}
              >
                {saving && <span className="loading loading-spinner loading-xs" />}
                Kaydet
              </AppButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemDuzenleOnProject;
