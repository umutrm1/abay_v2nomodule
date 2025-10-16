// src/scenes/bayiler/DialogResendInvite.jsx
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

/**
 * DialogResendInvite
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - debugToken?: string  // reSendInviteOnApi'den dönen token
 *
 * .env tarafında aşağıdakilerden birini tanımlaman yeterli:
 * VITE_APP_BASE_URL  | VITE_WEB_BASE_URL | VITE_CLIENT_BASE_URL
 * Örn: VITE_APP_BASE_URL=https://panel.senin-domenin.com
 */
export default function DialogResendInvite({ open, onOpenChange, debugToken = "" }) {
  const [copied, setCopied] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_API_INVITE_URL;

  // Sağlam birleştirme: sondaki "/"ları temizle, path'i ekle
  const fullUrl = useMemo(() => {
    const cleanBase = (BASE_URL || "").replace(/\/+$/, "");
    const path = "/set-password";
    const tokenQuery = debugToken ? `?token=${encodeURIComponent(debugToken)}` : "";
    return `${cleanBase}${path}${tokenQuery}`;
  }, [BASE_URL, debugToken]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Tekrar Davet Bağlantısı</DialogTitle>
          <DialogDescription>
            Aşağıdaki bağlantıyı bayi ile paylaşabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label className="text-sm opacity-80">Bağlantı</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={fullUrl}
              className="input input-bordered w-full font-mono text-sm"
              title="Davet bağlantısı"
            />
            <AppButton variant="kurumsalmavi" onClick={handleCopy}>
              {copied ? "Kopyalandı" : "Kopyala"}
            </AppButton>
          </div>

          {!BASE_URL && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              Uyarı: Base URL .env’de tanımlı görünmüyor. Lütfen{" "}
              <span className="font-mono">VITE_APP_BASE_URL</span>{" "}
              (veya alternatiflerinden biri) ekleyin.
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <DialogClose asChild>
            <AppButton variant="neutral">Kapat</AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
