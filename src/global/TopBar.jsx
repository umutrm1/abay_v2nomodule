// src/global/TopBar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { SidebarContext } from "./SideBarContext.jsx";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/redux/actions/authActions.js";
import { useTheme } from "./useTheme";
import { getProfilePicture } from "@/redux/actions/actions_profilfoto.js"; // → dataURL dönen yardımcı

const FALLBACK_AVATAR = "/profilfoto.png"; // public klasörü

export default function TopBar() {
  const { expanded } = useContext(SidebarContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isDark, toggleTheme } = useTheme();

  // 🔹 Avatar kaynağı
  // getProfilePicture() bizim önerdiğimiz haliyle "data:image/jpeg;base64,..." döndürüyor.
  // Data URL’ler için revoke gerekmez ama güvenlik için blob: ihtimali varsa ele aldık.
  const [avatarSrc, setAvatarSrc] = useState(FALLBACK_AVATAR);
  const lastBlobUrlRef = useRef(null);

  // Dışarı tıklayınca profil menüsünü kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Mount olduğunda profil fotoğrafını getir
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // cacheBust: true → varsa tarayıcı cache’ini baypas et (sunucu 1 saat cache’liyor olabilir)
        const src = await getProfilePicture({ cacheBust: true });

        if (cancelled) return;

        // Eski blob URL varsa temizle (biz dataURL dönüyoruz; blob ihtimaline karşı güvenlik)
        if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(lastBlobUrlRef.current);
          lastBlobUrlRef.current = null;
        }

        setAvatarSrc(src || FALLBACK_AVATAR);
      } catch (err) {
        // Ağ hatası / yetki / 404 vb. durumda fallback kullan
        if (!cancelled) setAvatarSrc(FALLBACK_AVATAR);
      }
    })();

    return () => {
      cancelled = true;
      // Topbar unmount olurken olası blob URL’yi temizle
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`
        ${expanded ? "ml-64" : "ml-20"}
        transition-all h-20
        flex items-center px-4
        bg-card text-foreground border-b border
      `}
    >
      <div className="flex-1" />

      {/* Tema anahtarı + profil */}
      <div className="flex items-center gap-3">
        {/* 🌗 Tema butonu */}
        <label
          className="btn btn-ghost btn-sm swap swap-rotate"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          {/* Gündüz (açık tema) */}
          <svg
            className="swap-off w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
          {/* Gece (koyu tema) */}
          <svg
            className="swap-on w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-.95 8.94 8.94 0 01-.67-.99z"/>
          </svg>
        </label>

        {/* 👤 Profil resmi ve açılır menü */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={avatarSrc}
            alt="Profil"
            className="w-10 h-10 rounded-full cursor-pointer border border-border object-cover"
            onClick={() => setMenuOpen((open) => !open)}
            // Render sırasında <img> yüklenemezse (ör. bozuk base64), garanti fallback:
            onError={(e) => {
              if (avatarSrc !== FALLBACK_AVATAR) {
                e.currentTarget.src = FALLBACK_AVATAR;
                setAvatarSrc(FALLBACK_AVATAR);
              }
            }}
          />
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 z-50
                         rounded-lg border border-border
                         bg-card text-foreground shadow-lg p-1"
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md
                           hover:bg-secondary transition
                           focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
