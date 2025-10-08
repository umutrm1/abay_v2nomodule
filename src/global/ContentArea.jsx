// src/global/ContentArea.jsx
import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SidebarContext } from "./SideBarContext.jsx";
import SideBar from "./SideBar.jsx";
import TopBar from "./TopBar.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginScreen from "@/scenes/login_screen/LoginScreen.jsx";
import Profiller from "../scenes/profiller/Profiller.jsx";
import AnaSayfa from "../scenes/ana_sayfa/AnaSayfa.jsx";
import Bayiler from "../scenes/bayiler/Bayiler.jsx";
import Musteriler from "../scenes/musteriler/Musteriler.jsx";
import Projeler from "../scenes/projeler/Projeler.jsx";
import Sistemler from "../scenes/sistemler/Sistemler.jsx";
import Camlar from "../scenes/camlar/Camlar.jsx";
import DigerMalzemeler from "../scenes/diger_malzemeler/DigerMalzemeler.jsx";
import Bildirimler from "../scenes/bildirimler/Bildirimler.jsx";
import Takvim from "../scenes/takvim/Takvim.jsx";
import BarGrafigi from "../scenes/bar_grafigi/BarGrafigi.jsx";
import PastaGrafigi from "../scenes/pasta_grafigi/PastaGrafigi.jsx";
import CizgiGrafigi from "../scenes/cizgi_grafigi/CizgiGrafigi.jsx";
import Sss from "../scenes/sss/Sss.jsx";
import ProjeDuzenle from "@/scenes/projeekle/ProjeDuzenle.jsx";
import SistemEkle from "@/scenes/sistem_ekle/SistemEkle.jsx";
import SistemSec from "@/scenes/sistemsec/SistemSec.jsx";
import EkstraMalzemeEkle from "@/scenes/ekstramalzemeekle/EkstraMalzemeEkle.jsx";
import SistemVaryantOlustur from "@/scenes/sistemler/SistemVaryantOlustur.jsx";
import Boyalar from "@/scenes/boyalar/Boyalar.jsx";
import TanimlanmayanSayfa from "@/scenes/tanimlanmayan_sayfa/TanimlanmayanSayfa.jsx";
import SistemVaryantDuzenle from "@/scenes/sistemler/SistemVaryantDuzenle.jsx";
import Kumandalar from "@/scenes/kumandalar/Kumandalar.jsx";
import SetPasswordPage from "@/scenes/setpassword/SetPasswordPage.jsx";
import ProfilAksesuarEdit from "@/scenes/projeekle/ProfilAksesuarEdit.jsx";
import Ayarlar from "@/scenes/ayarlar/Ayarlar.jsx";
import Teklifler from "@/scenes/teklifler/Teklifler.jsx";

const ContentArea = () => {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const isLogin = location.pathname === "/login" || location.pathname === "/set-password";

  return (
    <div className="flex">
      {/* /login değilse göster */}
      {!isLogin && <SideBar />}
      <div className="flex-1 flex flex-col">
        {!isLogin && <TopBar />}
        <main
          className={`
    mt-auto font-roboto bg-background text-foreground
    ${!isLogin ? (expanded ? "ml-64" : "ml-20") : "mx-auto w-full max-w-md"}
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
              <Route path="/teklifler" element={<Teklifler />} />
              <Route path="/sistemler" element={<Sistemler />} />
              <Route path="/profiller" element={<Profiller />} />
              <Route path="/camlar" element={<Camlar />} />
              <Route path="/digermalzemeler" element={<DigerMalzemeler />} />
              <Route path="/bildirimler" element={<Bildirimler />} />
              <Route path="/takvim" element={<Takvim />} />
              <Route path="/bargrafigi" element={<BarGrafigi />} />
              <Route path="/pastagrafigi" element={<PastaGrafigi />} />
              <Route path="/cizgigrafigi" element={<CizgiGrafigi />} />
              <Route path="/sss" element={<Sss />} />
              <Route path="/projeduzenle" element={<ProjeDuzenle />} />
              <Route path="/sistemekle/:projectId/:variantId" element={<SistemEkle />} />
              <Route path="/projeduzenle/:id" element={<ProjeDuzenle />} />
              <Route path="/profilaksesuar/edit/:id" element={<ProfilAksesuarEdit />} />
              <Route path="/sistemsec/:projectId" element={<SistemSec />} />
              <Route path="/ekstramalzemeekle/:projectId" element={<EkstraMalzemeEkle />} />
              <Route path="*" element={<TanimlanmayanSayfa />} />
              <Route path="/sistemvaryantolustur" element={<SistemVaryantOlustur />} />
              <Route path="/boyalar" element={<Boyalar />} />
              <Route path="/sistemvaryantduzenle/:variantId" element={<SistemVaryantDuzenle />} />
              <Route path="/kumandalar" element={<Kumandalar />} />
              <Route path="/ayarlar" element={<Ayarlar />} />


            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ContentArea;
