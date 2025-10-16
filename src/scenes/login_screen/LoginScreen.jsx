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

  // Tema durumu (TopBar’daki ile aynı kanca)
  const { isDark, toggleTheme } = useTheme();

  // Başarılı login sonrası anasayfaya yönlendir
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(username, password, rememberMe));
  };

  return (
    <Fragment>
      {/* SAĞ ÜST: Tema butonu */}
      <div className="fixed top-3 right-3 z-50">
        {/* Buradaki swap animasyonu label tabanlı olduğu için korunuyor */}
        <label
          className="btn btn-ghost btn-sm swap swap-rotate"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          {/* Gündüz ikonu */}
          <svg
            className="swap-off w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
          {/* Gece ikonu */}
          <svg
            className="swap-on w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-0.95 8.94 8.94 0 01-0.67-.99z"/>
          </svg>
        </label>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card border border-border rounded-2xl p-6 text-foreground"
      >
        <div>
          <label htmlFor="username" className="block mb-1">Kullanıcı Adı</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">Şifre</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="checkbox"
          />
          <label htmlFor="remember">Oturumu açık tut</label>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Giriş yapılıyor…</p>}
        {error && <p className="text-error">{error}</p>}

        <AppButton
          type="submit"
          disabled={loading}
          variant="kurumsalmavi"
          size="md"
          shape="none"
          className="w-full"
        >
          Giriş Yap
        </AppButton>
      </form>
    </Fragment>
  );
}
