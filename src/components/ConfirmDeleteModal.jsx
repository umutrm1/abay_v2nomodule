import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Radix (shadcn/ui) tabanlı onay modali.
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - title?: string
 * - description?: string | ReactNode
 * - confirmText?: string
 * - cancelText?: string
 * - onConfirm?: () => void | Promise<void>
 * - loading?: boolean   // isteğe bağlı: onay butonunu loading göstermek için
 */
export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = "Silmek istediğinize emin misiniz?",
  description = "Bu işlem geri alınamaz.",
  confirmText = "Evet, sil",
  cancelText = "Vazgeç",
  onConfirm,
  loading = false,
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onOpenChange(false);
    } catch (e) {
      // burada istersen toast/hata gösterebilirsin
      // onOpenChange(false); // hatada kapatmak istemiyorsan yoruma al
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* açıklama */}
        <div className="mt-2 text-sm opacity-80">
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>

        {/* butonlar */}
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <button type="button" className="btn">{cancelText}</button>
          </DialogClose>

          <button
            type="button"
            className={`btn btn-error ${loading ? "loading" : ""}`}
            disabled={loading}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
