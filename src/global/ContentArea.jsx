import React, { useContext, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SidebarContext } from "./SideBarContext.jsx";
import SideBar from "./SideBar.jsx";
import TopBar from "./TopBar.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginScreen from "@/scenes/login_screen/LoginScreen.jsx";
import Profiller from "../scenes/profiller/Profiller.jsx";
import Bayiler from "../scenes/bayiler/Bayiler.jsx";
import Musteriler from "../scenes/musteriler/Musteriler.jsx";
import Projeler from "../scenes/projeler/Projeler.jsx";
import Sistemler from "../scenes/sistemler/Sistemler.jsx";
import Camlar from "../scenes/camlar/Camlar.jsx";
import DigerMalzemeler from "../scenes/diger_malzemeler/DigerMalzemeler.jsx";
import ProjeDuzenle from "@/scenes/projeekle/ProjeDuzenle.jsx";
import SistemEkle from "@/scenes/sistem_ekle/SistemEkle.jsx";
import SistemSec from "@/scenes/sistemsec/SistemSec.jsx";
import EkstraMalzemeEkle from "@/scenes/ekstramalzemeekle/EkstraMalzemeEkle.jsx";
import Boyalar from "@/scenes/boyalar/Boyalar.jsx";
import TanimlanmayanSayfa from "@/scenes/tanimlanmayan_sayfa/TanimlanmayanSayfa.jsx";
import SistemVaryantDuzenle from "@/scenes/sistemler/SistemVaryantDuzenle.jsx";
import Kumandalar from "@/scenes/kumandalar/Kumandalar.jsx";
import SetPasswordPage from "@/scenes/setpassword/SetPasswordPage.jsx";
import ProfilAksesuarEdit from "@/scenes/projeekle/ProfilAksesuarEdit.jsx";
import Ayarlar from "@/scenes/ayarlar/Ayarlar.jsx";
import Teklifler from "@/scenes/teklifler/Teklifler.jsx";
import { initAuth } from "@/redux/actions/authActions.js";
import ForgotPassword from "@/scenes/forgotpassword/ForgotPassword.jsx";
import ResetPasswordPage from "@/scenes/resetpassword/ResetPasswordPage.jsx";

const ContentArea = () => {
  const dispatch = useDispatch();
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();

  const isLogin =
    location.pathname === "/login" ||
    location.pathname === "/set-password" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  // Rol bilgisi gelene kadar "null" kalsın; böylece UI'yi blur'layabiliriz.
const isAdmin = useSelector((s) => {
  const ia = s.auth?.is_admin ?? s.auth?.user?.is_admin;
  if (ia === true || ia === false) return ia;

  const role = s.auth?.role ?? s.auth?.user?.role;
  return role === "admin";
});
  const bootstrapped = useSelector((s) => !!s.auth?.bootstrapped);

  // Karar verilene kadar (login/refresh sonucu belli olana kadar) blur
  const isBootstrapping = !isLogin && !bootstrapped;

  // 🔐 Sadece ProtectedRoute ile sarılı sayfalarda (yani login ekranı değilken) auth init yap
  useEffect(() => {
    if (!isLogin) {
      dispatch(initAuth());
    }
  }, [dispatch, isLogin]);

  // Sidebar genişliğine göre tüm içerik alanına verilecek sol padding (sadece md ve üzeri)
  const sidebarOffsetClass = !isLogin
    ? expanded
      ? "md:pl-64"
      : "md:pl-20"
    : "";

  return (
    <div className="relative bg-background min-h-screen">
      {/* Blur uygulanacak asıl içerik */}
      <div className={isBootstrapping ? "blur-sm pointer-events-none" : ""}>
        {/* 🔹 Tüm layout: sol padding ile içerik sidebar genişliği kadar içerden başlar */}
        <div className={`flex min-h-screen ${sidebarOffsetClass}`}>
          {/* /login değilse sidebar göster */}
          {!isLogin && <SideBar />}

          {/* TopBar + main kolonu */}
          <div className="flex-1 flex flex-col">
            {/* /login değilse topbar göster */}
            {!isLogin && <TopBar />}

            <main
              className={`
                font-roboto bg-background text-foreground
                ${!isLogin ? "mt-4 transition-all p-4 sm:p-6" : ""}
              `}
            >
              <Routes>
                {/* Login sayfaları (korumasız) */}
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/set-password" element={<SetPasswordPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Aşağıdaki rotalar ProtectedRoute ile korunuyor */}
                <Route element={<ProtectedRoute />}>
                  {isAdmin ? (
                    <>
                      <Route path="/kumandalar" element={<Kumandalar />} />
                      <Route path="/bayiler" element={<Bayiler />} />
                      <Route path="/sistemler" element={<Sistemler />} />
                      <Route path="/profiller" element={<Profiller />} />
                      <Route path="/camlar" element={<Camlar />} />
                      <Route
                        path="/digermalzemeler"
                        element={<DigerMalzemeler />}
                      />
                      <Route path="/boyalar" element={<Boyalar />} />
                      <Route
                        path="/sistemvaryantduzenle/:variantId"
                        element={<SistemVaryantDuzenle />}
                      />

                      <Route path="/" element={<Projeler />} />
                      <Route path="/musteriler" element={<Musteriler />} />
                      <Route path="/projeler" element={<Projeler />} />
                      <Route path="/teklifler" element={<Teklifler />} />
                      <Route
                        path="/sistemekle/:projectId/:variantId"
                        element={<SistemEkle />}
                      />
                      <Route
                        path="/projeduzenle/:id"
                        element={<ProjeDuzenle />}
                      />
                      <Route
                        path="/profilaksesuar/edit/:id"
                        element={<ProfilAksesuarEdit />}
                      />
                      <Route
                        path="/sistemsec/:projectId"
                        element={<SistemSec />}
                      />
                      <Route
                        path="/ekstramalzemeekle/:projectId"
                        element={<EkstraMalzemeEkle />}
                      />
                      <Route path="/ayarlar" element={<Ayarlar />} />
                      <Route path="*" element={<TanimlanmayanSayfa />} />
                    </>
                  ) : (
                    <>

                      <Route path="/" element={<Projeler />} />
                      <Route path="/musteriler" element={<Musteriler />} />
                      <Route path="/projeler" element={<Projeler />} />
                      <Route path="/teklifler" element={<Teklifler />} />
                      <Route
                        path="/sistemekle/:projectId/:variantId"
                        element={<SistemEkle />}
                      />
                      <Route
                        path="/projeduzenle/:id"
                        element={<ProjeDuzenle />}
                      />
                      <Route
                        path="/profilaksesuar/edit/:id"
                        element={<ProfilAksesuarEdit />}
                      />
                      <Route
                        path="/sistemsec/:projectId"
                        element={<SistemSec />}
                      />
                      <Route
                        path="/ekstramalzemeekle/:projectId"
                        element={<EkstraMalzemeEkle />}
                      />
                      <Route path="/ayarlar" element={<Ayarlar />} />
                      <Route path="*" element={<TanimlanmayanSayfa />} />
                    </>
                  )}
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </div>

      {/* Üstte sabit overlay + spinner: sadece is_admin bilinmiyorken */}
      {isBootstrapping && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            <div className="text-sm text-muted-foreground">
              Yetki bilgileri yükleniyor…
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentArea;
