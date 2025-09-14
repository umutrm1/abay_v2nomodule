// src/scenes/bayiler/Bayiler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getDealersFromApi,
  addDealerOnApi,
  editDealerOnApi,
  sellDealerOnApi,
  reSendInviteOnApi
} from "@/redux/actions/actions_bayiler";
import Header from '@/components/mycomponents/Header';
import DialogBayiEkle from './DialogBayiEkle';
import DialogBayiDuzenle from './DialogBayiDuzenle';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

// Müşteriler ekranındaki spinner ve sayfalama yapısını koruyoruz. :contentReference[oaicite:3]{index=3}
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Backend sayfalama ile uyumlu boş state (Musteriler.jsx ile aynı şema) :contentReference[oaicite:4]{index=4}
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

  // Reducer adı isteğine göre: getBayilerFromApiReducer
  const data = useSelector(s => s.getBayilerFromApiReducer) || EMPTY_PAGE;

  // UI state — Musteriler.jsx ile aynı davranış: arama+sayfa+loading :contentReference[oaicite:5]{index=5}
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Listeyi çek (sayfa/arama değişince). Musteriler.jsx ile aynı lifecycle. :contentReference[oaicite:6]{index=6}
  useEffect(() => {
    setListLoading(true);
    // getDealersFromApi(q, limit, page) — bizim aksiyonumuzun imzası bu.
    // Musteriler'de dispatch(getMusterilerFromApi(page, search, 5)) vardı; burada eşdeğeri:
    Promise
      .resolve(dispatch(getDealersFromApi(search, 5, page)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, search]);

  // Arama değişince 1. sayfaya dön (Musteriler.jsx ile birebir aynı UX) :contentReference[oaicite:7]{index=7}
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // EKLE — Musteriler’deki pattern'e sadık: kaydettikten sonra listeyi yenile. :contentReference[oaicite:8]{index=8}
  const handleAdd = useCallback(async (payload) => {
    await dispatch(addDealerOnApi(payload));
    await dispatch(getDealersFromApi(search, 5, page));
  }, [dispatch, page, search]);

  // DÜZENLE — Musteriler’deki gibi; dialog child onSave ile tetiklenir. :contentReference[oaicite:9]{index=9}
  const handleEdit = useCallback(async (bayi) => {
    await dispatch(editDealerOnApi(bayi.id, {
      name: bayi.name,
      email: bayi.email,
      phone: bayi.phone,
      owner_name: bayi.owner_name,
      city: bayi.city,
      status: bayi.status,
    }));
    await dispatch(getDealersFromApi(search, 5, page));
  }, [dispatch, page, search]);

  // SİL → modal aç/kapat ve onay. Musteriler’deki ile aynı akış. :contentReference[oaicite:10]{index=10}
  const askDelete = (b) => {
    setPendingDelete(b);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellDealerOnApi(pendingDelete.id));
      await dispatch(getDealersFromApi(search, 5, page));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Bayiler" />

      <div className="bg-white w-full border rounded-2xl p-5 flex flex-col gap-y-4">
        {/* Arama & Ekle — müşterilerle aynı layout */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Bayi ismine/maile göre ara..."
            value={search}
            onChange={onSearchChange}
            className="input input-bordered w-full md:w-1/2 lg:w-1/3"
          />
          <DialogBayiEkle onSave={handleAdd} />
        </div>

        {/* Tablo — sütunlar bayi alanlarına göre uyarlanmış */}
        <div className="flex-grow overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>İsim</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Sahip</th>
                <th>Şehir</th>
                <th>Durum</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr><td colSpan={7}><Spinner /></td></tr>
              </tbody>
            ) : (
              <tbody>
                {(data.items ?? []).length > 0 ? (
                  data.items.map(b => (
                    <tr key={b.id} className="hover">
                      <td className="font-bold">{b.name}</td>
                      <td>{b.email}</td>
                      <td>{b.phone}</td>
                      <td>{b.owner_name}</td>
                      <td>{b.city}</td>
                      <td>
                        <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                          {b.status || '—'}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => dispatch(reSendInviteOnApi(b.id))}
                          disabled={b.status === "active"}
                          className="btn btn-sm btn-outline"
                          title={b.status === "active" ? "Aktif bayiye davet gönderilemez" : "Davet mailini tekrar gönder"}
                        >
                          Tekrar Davet Gönder
                        </button>
                        <DialogBayiDuzenle bayi={b} onSave={handleEdit} />
                        <button
                          onClick={() => askDelete(b)}
                          className="btn btn-sm btn-outline btn-error"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-10">
                      Gösterilecek bayi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama — Musteriler.jsx ile aynı kontrol seti/UX :contentReference[oaicite:11]{index=11} */}
        <div className="flex justify-center items-center mt-4 px-4 gap-2 sm:gap-3">
          <button
            className="btn btn-sm"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </button>

          <button
            className="btn btn-sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= data.total_pages) {
                setPage(val);
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="pageNum"
              min={1}
              max={data.total_pages}
              defaultValue={data.page}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {data.total_pages}</span>
          </form>

          <button
            className="btn btn-sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </button>

          <button
            className="btn btn-sm"
            onClick={() => setPage(data.total_pages)}
            disabled={data.page === data.total_pages || data.total_pages <= 1}
            title="Son sayfa"
          >
            Son »
          </button>
        </div>
      </div>

      {/* Silme Onay Modali (Musteriler akışı ile aynı) :contentReference[oaicite:12]{index=12} */}
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
    </div>
  );
};

export default Bayiler;
