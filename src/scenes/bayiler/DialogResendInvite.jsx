// Path Alias: src/scenes/bayiler/DialogResendInvite.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

export default function DialogResendInvite({ open, onOpenChange, inviteLink = "" }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = inviteLink || "";

  const handleCopy = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // kopyalama hatasını sessizce yutuyoruz
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Tekrar Davet Bağlantısı</DialogTitle>
          <DialogDescription>
            Aşağıdaki bağlantıyı bayi ile paylaşabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label className="text-sm opacity-80">Bağlantı</label>

          {/* Mobilde alt alta, desktopta yan yana */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={fullUrl}
              className="input input-bordered w-full font-mono text-sm"
              title="Davet bağlantısı"
              placeholder="Davet bağlantısı henüz alınamadı."
            />
            <AppButton
              variant="kurumsalmavi"
              onClick={handleCopy}
              className="w-full sm:w-auto"
              disabled={!fullUrl}
            >
              {copied ? "Kopyalandı" : "Kopyala"}
            </AppButton>
          </div>

          {!fullUrl && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              Uyarı: Sunucudan davet bağlantısı alınamadı. Lütfen işlemi tekrar deneyin.
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <DialogClose asChild>
            <AppButton variant="neutral" className="w-full sm:w-auto">
              Kapat
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}