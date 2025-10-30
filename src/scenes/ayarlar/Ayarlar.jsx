// File: Ayarlar.jsx (ana çatı)
// =============================
import React, { useState } from "react";
import AppButton from "@/components/ui/AppButton.jsx";
import BrandSection from "./BrandSection.jsx";
import TitleSection from "./TitleSection.jsx";
import RuleSection from "./RuleSection.jsx";
import PasswordSection from "./PasswordSection.jsx";
import ProfilePhotoSection from "./ProfilePhotoSection.jsx";

export default function Ayarlar() {
  const SECTIONS = [
    { id: "brand", label: "PDF Üst Başlık" },
    { id: "title", label: "PDF Başlık Alanları" },
    { id: "rule", label: "Proforma Kuralı" },
    { id: "password", label: "Şifre Değiştir" },
    { id: "profilfoto", label: "Profil Fotoğrafı" },
  ];
  const [active, setActive] = useState("brand");

  return (
    <div className="bg-card border border-border rounded-2xl p-5 text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sol Dikey Menü */}
        <aside className="md:col-span-3">
          <nav className="sticky top-4 flex md:block gap-2">
            {SECTIONS.map((s) => (
              <AppButton
                key={s.id}
                onClick={() => setActive(s.id)}
                variant="seffaf"
                size="md"
                shape="xl"
                className={[
                  "w-full mb-5 text-left px-3 py-2 border transition",
                  active === s.id
                    ? "border-primary"
                    : "border-border ",
                ].join(" ")}
              >
                {s.label}
              </AppButton>
            ))}
          </nav>
        </aside>

        {/* Sağ İçerik */}
        <main className="md:col-span-9">
          {active === "brand" && <BrandSection />}
          {active === "title" && <TitleSection />}
          {active === "rule" && <RuleSection />}
          {active === "password" && <PasswordSection />}
          {active === "profilfoto" && <ProfilePhotoSection />}
        </main>
      </div>
    </div>
  );
}