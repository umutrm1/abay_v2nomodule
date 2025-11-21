// src/scenes/bayiler/Bayiler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getDealersFromApi,
  addDealerOnApi,
  editDealerOnApi,
  sellDealerOnApi,
  reSendInviteOnApi
} from "@/redux/actions/actions_bayiler.js";
import Header from '@/components/mycomponents/Header.jsx';
import DialogBayiEkle from './DialogBayiEkle.jsx';
import DialogBayiDuzenle from './DialogBayiDuzenle.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import AppButton from '@/components/ui/AppButton.jsx';
import DialogResendInvite from "./DialogResendInvite.jsx";

/** Spinner — Teklifler.jsx ile aynı görsel yapı */
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

/** Backend sayfalama ile uyumlu boş state — Teklifler.jsx şeması */
const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false
};

const Bayiler = () => {
  const dispatch = useDispatch();

  // Reducer
  const data = useSelector(s => s.getBayilerFromApiReducer) || EMPTY_PAGE;

  // Arama / sayfa / loading
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  // Limit
  const [limit, setLimit] = useState(10);

  // Resend modal
  const [resendOpen, setResendOpen] = useState(false);
  const [resendToken, setResendToken] = useState("");

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Tekrar Davet Gönder — buton handler'ı
  const handleResendInvite = useCallback(async (bayi) => {
    try {
      const res = await dispatch(reSendInviteOnApi(bayi.id));
      const token = res?.debug_token || "";
      setResendToken(token);
      setResendOpen(true);
    } catch (e) {}
  }, [dispatch]);

  // Listeyi çek — sayfa/arama/limit değişince
  useEffect(() => {
    setListLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    Promise
      .resolve(dispatch(getDealersFromApi(search, safeLimit, page)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, search, limit]);

  // Arama değişince 1. sayfaya dön
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Limit değişimi (clamp + sayfa=1)
  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setPage(1);
  };

  // EKLE — kayıttan sonra listeyi mevcut filtrelerle tazele
  const handleAdd = useCallback(async (payload) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(addDealerOnApi(payload));
    await dispatch(getDealersFromApi(search, safeLimit, page));
  }, [dispatch, page, search, limit]);

  // DÜZENLE — kayıttan sonra listeyi tazele
  const handleEdit = useCallback(async (bayi) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(editDealerOnApi(bayi.id, {
      name: bayi.name,
      email: bayi.email,
      phone: bayi.phone,
      owner_name: bayi.owner_name,
      city: bayi.city,
      status: bayi.status,
    }));
    await dispatch(getDealersFromApi(search, safeLimit, page));
  }, [dispatch, page, search, limit]);

  // SİL → modal
  const askDelete = (b) => {
    setPendingDelete(b);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(sellDealerOnApi(pendingDelete.id));
      await dispatch(getDealersFromApi(search, safeLimit, page));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Bayiler" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama & Ekle & Kayıt Sayısı (limit) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-3 w-full">
          <input
            type="text"
            placeholder="Bayi ismine/maile göre ara..."
            value={search}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

          {/* Kayıt Sayısı */}
          <div className="flex items-center gap-2 md:ml-0">
            <label className="text-sm opacity-80 whitespace-nowrap">Bayi Sayısı</label>
            <input
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={onLimitChange}
              className="input input-bordered input-sm w-24 text-center"
              title="Sayfa Başına Kayıt (min:1 / max:50)"
            />
          </div>

          {/* Mobilde full-width aksiyon */}
          <div className="w-full md:w-auto md:ml-auto">
            <DialogBayiEkle onSave={handleAdd} />
          </div>
        </div>

        {/* =========================
            DESKTOP TABLO (md ve üstü): AYNEN KALDI
           ========================= */}
        <div className="hidden md:flex flex-grow overflow-x-auto">
          <table className="table w-full border border-base-500 border-gray-500 rounded-lg">
            <thead>
              <tr className="border-b border-base-500 border-gray-500">
                <th>İsim</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Sahip</th>
                <th>Şehir</th>
                <th>Durum</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr className="border-b border-base-400 border-gray-500">
                  <td colSpan={7}><Spinner /></td>
                </tr>
              </tbody>
            ) : (data.items ?? []).length > 0 ? (
              <tbody>
                {data.items.map(b => (
                  <tr key={b.id} className="border-b border-gray-500">
                    <td className="font-bold">{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.phone}</td>
                    <td>{b.owner_name}</td>
                    <td>{b.city}</td>
                    <td>
                      <span className={`text ${b.status === 'active' ? 'text-success' : 'text-ghost'}`}>
                        {b.status === "active" ? "Aktif" : "Davet Edildi"}
                      </span>
                    </td>
                    <td className="text-center space-x-2">
                      <AppButton
                        onClick={() => handleResendInvite(b)}
                        disabled={b.status === "active"}
                        variant="koyumavi"
                        size="sm"
                        title={b.status === "active" ? "Aktif bayiye davet gönderilemez" : "Davet mailini tekrar gönder"}
                      >
                        Tekrar Davet Gönder
                      </AppButton>

                      <DialogBayiDuzenle bayi={b} onSave={handleEdit} />

                      <AppButton
                        onClick={() => askDelete(b)}
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        title="Bayiyi sil"
                      >
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={7} className="border-b border-base-500 border-gray-500 text-center text-muted-foreground py-10">
                    Gösterilecek bayi bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* =========================
            MOBİL KART LİSTESİ (md altı)
           ========================= */}
        <div className="md:hidden flex flex-col gap-3">
          {listLoading ? (
            <div className="border border-border rounded-2xl bg-card">
              <Spinner />
            </div>
          ) : (data.items ?? []).length > 0 ? (
            data.items.map(b => {
              const isActive = b.status === "active";
              return (
                <div
                  key={b.id}
                  className="
                    border border-border rounded-2xl p-4
                    bg-card shadow-sm
                    flex flex-col gap-3
                  "
                >
                  {/* Başlık + durum */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.email}</div>
                    </div>

                    <span
                      className={[
                        "px-2 py-1 text-xs rounded-full border whitespace-nowrap",
                        isActive
                          ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                          : "border-amber-500/40 text-amber-600 bg-amber-500/10"
                      ].join(" ")}
                    >
                      {isActive ? "Aktif" : "Davet Edildi"}
                    </span>
                  </div>

                  {/* Bilgi satırları */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Telefon</span>
                      <span className="font-medium">{b.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Sahip</span>
                      <span className="font-medium">{b.owner_name || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Şehir</span>
                      <span className="font-medium">{b.city || "—"}</span>
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <AppButton
                      onClick={() => handleResendInvite(b)}
                      disabled={isActive}
                      variant="koyumavi"
                      size="md"
                      className="w-full"
                      title={isActive ? "Aktif bayiye davet gönderilemez" : "Davet mailini tekrar gönder"}
                    >
                      Tekrar Davet Gönder
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2">
                      <DialogBayiDuzenle bayi={b} onSave={handleEdit}>
                        <AppButton variant="sari" size="md" className="w-full">
                          Düzenle
                        </AppButton>
                      </DialogBayiDuzenle>

                      <AppButton
                        onClick={() => askDelete(b)}
                        variant="kirmizi"
                        size="md"
                        className="w-full"
                        title="Bayiyi sil"
                      >
                        Sil
                      </AppButton>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
              Gösterilecek bayi bulunamadı.
            </div>
          )}
        </div>

        {/* Sayfalama — mobilde de güzel dursun diye full-width buton davranışı ekledim */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-2 sm:mt-4">
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </AppButton>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="pageNum"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) return setPage(1);
                setPage(Math.min(Math.max(1, val), totalPages));
              }}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {totalPages}</span>
          </form>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setPage(totalPages)}
            disabled={data.page === totalPages || totalPages <= 1}
            title="Son sayfa"
          >
            Son »
          </AppButton>
        </div>
      </div>

      {/* Silme Onay Modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Bayiyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />

      {/* Davet Linki Dialog */}
      <DialogResendInvite
        open={resendOpen}
        onOpenChange={setResendOpen}
        debugToken={resendToken}
      />
    </div>
  );
};

export default Bayiler;
