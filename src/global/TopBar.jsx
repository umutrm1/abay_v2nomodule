// src/global/TopBar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { SidebarContext } from "./SideBarContext.jsx";
import profileImg from "../assets/tumen_aliminyum_logo.png";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/redux/actions/authActions.js";
import { useTheme } from "./useTheme"; // ✅ EKLENDİ: Tema hook'u

export default function TopBar() {
  const { expanded } = useContext(SidebarContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Tema durumu ve değiştirici
  const { isDark, toggleTheme } = useTheme();

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
        /* 🎨 Tema token'ları */
        bg-card text-foreground border-b border-border
      `}
    >
      {/* Sol taraf: istersen başlık/breadcrumb */}
      <div className="flex-1" />

      {/* Sağ küme: Tema anahtarı + profil */}
      <div className="flex items-center gap-3">
        {/* 🌗 Tema Butonu — LoginScreen ile birebir aynı görünüm */}
        <label
          className="btn btn-ghost btn-sm swap swap-rotate"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />

          {/* Gündüz (açık tema) ikonu */}
          <svg
            className="swap-off w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>

          {/* Gece (koyu tema) ikonu */}
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
            src={profileImg}
            alt="Profil"
            className="w-10 h-10 rounded-full cursor-pointer border border-border"
            onClick={() => setMenuOpen((open) => !open)}
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
