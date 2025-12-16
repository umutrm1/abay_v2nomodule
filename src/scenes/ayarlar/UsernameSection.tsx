// Path: @/scenes/ayarlar/UsernameSection.tsx
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { changeUsername } from "@/redux/actions/authActions";

export default function UsernameSection() {
  const dispatch = useDispatch();
  const user = useSelector((s: any) => s.auth?.user);
  const currentUsername = useMemo(() => String(user?.username ?? ""), [user]);

  const [nextUsername, setNextUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const trimmed = String(nextUsername || "").trim();
    if (!trimmed) return;

    try {
      setSaving(true);
      await dispatch<any>(changeUsername(trimmed));
      setNextUsername("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 text-foreground">
      <div className="text-lg font-semibold mb-4">Kullanıcı Adı Değiştir</div>

      <div className="grid gap-4 max-w-md">
        <div className="grid gap-1">
          <label className="text-sm opacity-80">Mevcut kullanıcı adı</label>
          <input
            readOnly
            value={currentUsername}
            className="input input-bordered opacity-90"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm opacity-80">Yeni kullanıcı adı</label>
          <input
            value={nextUsername}
            onChange={(e) => setNextUsername(e.target.value)}
            className="input input-bordered"
            placeholder="örn: bayi_admin_ankara"
          />
        </div>

        <div className="flex justify-end">
          <AppButton
            onClick={onSave}
            disabled={saving || !String(nextUsername || "").trim()}
            variant="kurumsalmavi"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
