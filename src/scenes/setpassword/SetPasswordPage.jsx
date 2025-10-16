import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SetUserNamePasswordOnApi } from "@/redux/actions/actions_bayiler.js";
import AppButton from "@/components/ui/AppButton.jsx";

const Rule = ({ ok, text }) => (
  <div className="flex items-center text-sm">
    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-gray-300"}`} />
    <span className={ok ? "text-green-600" : "text-gray-500"}>{text}</span>
  </div>
);

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const checks = useMemo(() => ({
    len: password.length >= 8,
    num: /\d/.test(password),
    low: /[a-z]/.test(password),
    up: /[A-Z]/.test(password),
    sym: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === confirm,
  }), [password, confirm]);

  const score = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);
  const unameLen = username.trim().length >= 3;
  const unameValid = /^[a-zA-Z0-9_.-]+$/.test(username || "");
  const canSubmit = token && unameLen && unameValid && checks.len && checks.num && checks.low && checks.up && checks.sym && checks.match && !loading;

  useEffect(() => {
    if (!token) setErr("Geçersiz veya eksik bağlantı (token bulunamadı).");
  }, [token]);

  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!canSubmit) return;
    try {
      setLoading(true);
      await dispatch(SetUserNamePasswordOnApi(token, username.trim(), password));
      setDone(true);
    } catch (error) {
      setErr(error?.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            {/* check icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-green-600"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.94a.75.75 0 1 0-1.22-.88l-3.26 4.52-1.69-1.69a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.09l3.84-5.17Z" clipRule="evenodd" /></svg>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Şifren ayarlandı!</h1>
          <p className="text-gray-600 mb-6">Artık hesabına giriş yapabilirsin.</p>
          <AppButton variant="kurumsalmavi" className="w-full" onClick={() => navigate("/login")}>
            Girişe Dön
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Hesabını Aktifleştir</h1>
          <p className="text-sm text-gray-600 mt-1">Kullanıcı adını ve şifreni belirle.</p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="ornek.kullanici"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!token || loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
            <div className="relative mt-1">
              <input
                type={showPw ? "text" : "password"}
                className="input input-bordered w-full pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={!token || loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPw ? (/* eye-off */ <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.86-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.5a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" /></svg>) : (/* eye */ <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.183.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>)}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre (Tekrar)</label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!token || loading}
              required
            />
          </div>

          {/* Güç göstergesi */}
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-2 transition-all duration-300 ${score <= 2 ? "bg-red-400 w-1/5" : score === 3 ? "bg-yellow-400 w-2/5" : score === 4 ? "bg-amber-500 w-3/5" : score === 5 ? "bg-lime-500 w-4/5" : "bg-green-600 w-full"}`}></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Rule ok={unameLen}   text="Kullanıcı adı ≥ 3 karakter" />
              <Rule ok={unameValid} text="Sadece harf/rakam/._-" />
              <Rule ok={checks.len} text="En az 8 karakter" />
              <Rule ok={checks.num} text="Rakam içerir" />
              <Rule ok={checks.low} text="Küçük harf içerir" />
              <Rule ok={checks.up}  text="Büyük harf içerir" />
              <Rule ok={checks.sym} text="Özel karakter içerir" />
              <Rule ok={checks.match} text="Şifreler eşleşiyor" />
            </div>
          </div>

          <AppButton
            type="submit"
            variant={canSubmit ? "kurumsalmavi" : "gri"}
            className="w-full"
            disabled={!canSubmit}
          >
            {loading ? "Gönderiliyor…" : "Şifreyi Kaydet"}
          </AppButton>
        </form>
      </div>
    </div>
  );
}
