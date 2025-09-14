// src/global/ContentArea.jsx
import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SidebarContext } from "./SidebarContext";

import SideBar from "./SideBar";
import TopBar from "./TopBar";
import ProtectedRoute from "./ProtectedRoute";

import LoginScreen from "@/scenes/login_screen/LoginScreen";
import Profiller from "../scenes/profiller/Profiller";
import AnaSayfa from "../scenes/ana_sayfa/AnaSayfa";
import Bayiler from "../scenes/bayiler/Bayiler";
import Musteriler from "../scenes/musteriler/Musteriler";
import Projeler from "../scenes/projeler/Projeler";
import Siparisler from "../scenes/siparisler/Siparisler";
import Sistemler from "../scenes/sistemler/Sistemler";
import Camlar from "../scenes/camlar/Camlar";
import DigerMalzemeler from "../scenes/diger_malzemeler/DigerMalzemeler";
import Bildirimler from "../scenes/bildirimler/Bildirimler";
import Takvim from "../scenes/takvim/Takvim";
import BarGrafigi from "../scenes/bar_grafigi/BarGrafigi";
import PastaGrafigi from "../scenes/pasta_grafigi/PastaGrafigi";
import CizgiGrafigi from "../scenes/cizgi_grafigi/CizgiGrafigi";
import Sss from "../scenes/sss/Sss";
import SiparisEkle from "../scenes/siparisekle/SiparisEkle";
import SiparisDetay from "@/scenes/siparisdetay/SiparisDetay";
import ProjeDuzenle from "@/scenes/projeekle/ProjeDuzenle";
import SistemEkle from "@/scenes/sistem_ekle/SistemEkle";
import SistemSec from "@/scenes/sistemsec/SistemSec";
import EkstraMalzemeEkle from "@/scenes/ekstramalzemeekle/EkstraMalzemeEkle";
import SistemVaryantOlustur from "@/scenes/sistemler/SistemVaryantOlustur";
import Boyalar from "@/scenes/boyalar/Boyalar";
import TanimlanmayanSayfa from "@/scenes/tanimlanmayan_sayfa/TanimlanmayanSayfa";
import SistemVaryantDuzenle from "@/scenes/sistemler/SistemVaryantDuzenle";
import Kumandalar from "@/scenes/kumandalar/Kumandalar";
import SetPasswordPage from "@/scenes/setpassword/SetPasswordPage";
import ProfilAksesuarEdit from "@/scenes/projeekle/ProfilAksesuarEdit";

const ContentArea = () => {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const isLogin = location.pathname === "/login"||location.pathname==="/set-password";
  
  return (
    <div className="flex">
      {/* /login değilse göster */}
      {!isLogin && <SideBar />}
      <div className="flex-1 flex flex-col">
        {!isLogin && <TopBar />}
        <main
          className={`
            mt-auto font-roboto bg-gray-50
            ${!isLogin
              ? (expanded ? "ml-64" : "ml-20")
              : "mx-auto w-full max-w-md"}
            transition-all p-6
          `}
        >
          <Routes>
            {/* Login sayfası her zaman açık */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/set-password" element={<SetPasswordPage />} />

            {/* Aşağıdaki rotalar ProtectedRoute ile korunuyor */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AnaSayfa />} />
              <Route path="/bayiler" element={<Bayiler />} />
              <Route path="/musteriler" element={<Musteriler />} />
              <Route path="/projeler" element={<Projeler />} />
              <Route path="/siparisler" element={<Siparisler />} />
              <Route path="/sistemler" element={<Sistemler />} />
              <Route path="/profiller" element={<Profiller />} />
              <Route path="/siparis/:id" element={<SiparisDetay />} />
              <Route path="/camlar" element={<Camlar />} />
              <Route path="/digermalzemeler" element={<DigerMalzemeler />} />
              <Route path="/bildirimler" element={<Bildirimler />} />
              <Route path="/takvim" element={<Takvim />} />
              <Route path="/bargrafigi" element={<BarGrafigi />} />
              <Route path="/pastagrafigi" element={<PastaGrafigi />} />
              <Route path="/cizgigrafigi" element={<CizgiGrafigi />} />
              <Route path="/sss" element={<Sss />} />
              <Route path="/siparisekle" element={<SiparisEkle />} />
              <Route path="/projeduzenle" element={<ProjeDuzenle />} />
              <Route path="/sistemekle/:projectId/:variantId" element={<SistemEkle />} />
              <Route path="/projeduzenle/:id" element={<ProjeDuzenle />} />
              <Route path="/profilaksesuar/:id" element={<ProfilAksesuarEdit />} />
              <Route path="/sistemsec/:projectId" element={<SistemSec />} />
              <Route path="/ekstramalzemeekle/:projectId" element={<EkstraMalzemeEkle />} />
              <Route path="*" element={<TanimlanmayanSayfa />} />
              <Route path="/sistemvaryantolustur" element={<SistemVaryantOlustur />} />
              <Route path="/boyalar" element={<Boyalar />} />
              <Route path="/sistemvaryantduzenle/:variantId" element={<SistemVaryantDuzenle />} />
              <Route path="/kumandalar" element={<Kumandalar />} />
              <Route path="/ayarlar" element={<Kumandalar />} />


            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ContentArea;
