import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@/redux/actions/authActions.js';
import { useTheme } from '@/global/useTheme';
import AppButton from '@/components/ui/AppButton.jsx';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Tema durumu
  const { isDark, toggleTheme } = useTheme();

  // Başarılı login sonrası anasayfaya yönlendir
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 'rememberMe' state'i zaten doğru bir şekilde action'a gönderiliyor
    dispatch(loginUser(username, password, rememberMe));
  };

  /**
   * YENİ: Şifremi unuttum butonu için handler.
   * Bu, kullanıcıyı /forgot-password sayfasına yönlendirir.
   * Bu rotayı ContentArea.jsx dosyanıza eklemeniz gerekecek.
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // SVG ikonları
  const SunIcon = () => (
    <svg
      className="swap-off w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      className="swap-on w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-0.95 8.94 8.94 0 01-0.67-.99z" />
    </svg>
  );

  return (
    // 1. Ana Konteyner
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative">
      
      {/* SAĞ ÜST: Tema butonu */}
      <div className="fixed top-4 right-4 z-50">
        <label
          className="btn btn-ghost btn-sm swap swap-rotate"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <SunIcon />
          <MoonIcon />
        </label>
      </div>

      {/* 2. Ana Login Kartı: Maksimum genişlik artırıldı */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden border border-border bg-card">
        
        {/* 3. Sol Taraf (Logo ve Telefon) */}
        <div className="flex flex-col items-center justify-between p-12 border-b md:border-b-0 md:border-r border-border min-h-[350px]">
          
          {/* Logo (Üstte/Ortada) */}
          <div className="flex-grow flex items-center justify-center">
            <img 
              src="/Logo.png" 
              alt="Logo" 
              className="w-48 h-auto" 
            />
          </div>
          
          {/* Telefonlar (Altta) */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Telefon Numarası:</p>
            <p className="text-lg font-medium text-foreground tracking-wider">0555 041 31 83</p>
            <p className="text-lg font-medium text-foreground tracking-wider">0531 662 53 67</p>
          </div>
        </div>

        {/* 4. Sağ Taraf (Giriş Formu) */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          
          <form
            onSubmit={handleSubmit}
            className="space-y-6 w-full"
          >
            <h1 className="text-3xl font-bold text-center mb-8 text-primary">
              Sisteme Giriş
            </h1>

            {/* Kullanıcı Adı */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input input-bordered w-full"
                placeholder="Kullanıcı Adınız"
              />
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>

            {/* --- DEĞİŞİKLİK BURADA --- */}
            {/* Beni Hatırla & Şifremi Unuttum */}
            <div className="flex justify-between items-center text-sm">
              {/* Oturumu açık tut (Sol Taraf) */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                <label htmlFFor="remember" className="text-sm cursor-pointer">
                  Oturumu açık tut
                </label>
              </div>
              
              {/* Şifremi Unuttum (Sağ Taraf) */}
              <button
                type="button" // Formu submit etmesini engeller
                onClick={handleForgotPassword}
                className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
              >
                Şifremi unuttum?
              </button>
            </div>
            {/* --- DEĞİŞİKLİK BİTTİ --- */}


            {/* Hata ve Yüklenme Mesajları */}
            <div className="h-5 text-center">
              {loading && <p className="text-sm text-muted-foreground">Giriş yapılıyor...</p>}
              {error && <p className="text-error text-sm font-medium">{error}</p>}
            </div>
            
            {/* Giriş Butonu */}
            <AppButton
              type="submit"
              disabled={loading}
              variant="kurumsalmavi"
              size="md"
              shape="none"
              className="w-full !mt-8" 
            >
              {loading ? 'Yükleniyor...' : 'Giriş Yap'}
            </AppButton>

          </form>
        </div>
        
      </div>
    </div>
  );
}
