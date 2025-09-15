// src/global/TopBar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { SidebarContext } from "./SideBarContext.jsx";
import profileImg from "../assets/tumen_aliminyum_logo.png";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/redux/actions/authActions.js";

export default function TopBar() {
  const { expanded } = useContext(SidebarContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // 1) Redux state ve localStorage’ı temizle
    dispatch(logoutUser());
    // 2) Login sayfasına yönlendir
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`
        ${expanded ? "ml-64" : "ml-20"} 
        transition-all h-20 bg-white border-b flex items-center px-4
      `}
    >
      {/* Sol tarafta istersen başlık veya breadcrumb ekleyebilirsin */}
      <div className="flex-1"></div>

      {/* Profil resmi ve açılır menü */}
      <div className="relative" ref={dropdownRef}>
        <img
          src={profileImg}
          alt="Profil"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setMenuOpen((open) => !open)}
        />
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
