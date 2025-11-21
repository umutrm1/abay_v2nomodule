import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getMusterilerFromApi,
  addMusteriToApi,
  editMusteriOnApi,
  deleteMusteriOnApi
} from "@/redux/actions/actions_musteriler.js";
import Header from '@/components/mycomponents/Header.jsx';
import DialogMusteriEkle from './DialogMusteriEkle.jsx';
import DialogMusteriDuzenle from './DialogMusteriDuzenle.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import AppButton from '@/components/ui/AppButton.jsx';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Backend sayfalama için boş obje
const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false
};

const Musteriler = () => {
  const dispatch = useDispatch();

  // Server-side dönen obje
  const data = useSelector(s => s.getMusterilerFromApiReducer) || EMPTY_PAGE;

  // UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  // 🆕 Limit
  const [limit, setLimit] = useState(10);

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Listeyi çek
  useEffect(() => {
    setListLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    Promise.resolve(dispatch(getMusterilerFromApi(page, search, safeLimit)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, search, limit]);

  // Arama
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Limit
  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setPage(1);
  };

  // EKLE
  const handleAdd = useCallback(async (payload) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(addMusteriToApi(payload));
    await dispatch(getMusterilerFromApi(page, search, safeLimit));
  }, [dispatch, page, search, limit]);

  // DÜZENLE
  const handleEdit = useCallback(async (musteri) => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(editMusteriOnApi(musteri.id, {
      company_name: musteri.company_name,
      name:        musteri.name,
      phone:       musteri.phone,
      city:        musteri.city
    }));
    await dispatch(getMusterilerFromApi(page, search, safeLimit));
  }, [dispatch, page, search, limit]);

  // SİL
  const askDelete = (m) => {
    setPendingDelete(m);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(deleteMusteriOnApi(pendingDelete.id));
      await dispatch(getMusterilerFromApi(page, search, safeLimit));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;
  const items = data.items ?? [];

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Müşteriler" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama & Ekle & Kayıt Sayısı */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          {/* Arama inputu */}
          <div className="w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Müşteri ismine göre ara..."
              value={search}
              onChange={onSearchChange}
              className="input input-bordered w-full text-sm"
            />
          </div>

          {/* Sayfa başına kayıt ve buton */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto md:ml-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm opacity-80 whitespace-nowrap">
                Müşteri Sayısı
              </label>
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

            <div className="w-full sm:w-auto sm:ml-auto">
              <DialogMusteriEkle onSave={handleAdd} />
            </div>
          </div>
        </div>

        {/* 🔹 Desktop / tablet: Tablo görünümü (md ve üzeri) */}
        <div className="hidden md:block flex-grow overflow-x-auto">
          <table className="table w-full border border-gray-500 rounded-lg">
            <thead>
              <tr className="border border-gray-500">
                <th>Şirket İsmi</th>
                <th>İsim</th>
                <th>Telefon</th>
                <th>Şehir</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr className="border border-gray-500">
                  <td colSpan={5}><Spinner /></td>
                </tr>
              </tbody>
            ) : (items.length > 0 ? (
              <tbody>
                {items.map(m => (
                  <tr key={m.id} className="border border-gray-500">
                    <td className="font-bold">{m.company_name}</td>
                    <td>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>{m.city}</td>
                    <td className="text-center space-x-2">
                      <DialogMusteriDuzenle musteri={m} onSave={handleEdit} />
                      <AppButton
                        onClick={() => askDelete(m)}
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        title="Müşteriyi sil"
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
                  <td
                    colSpan={5}
                    className="border border-gray-500 text-center text-muted-foreground py-10"
                  >
                    Gösterilecek müşteri bulunamadı.
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>

        {/* 🔹 Mobil: Kart görünümü (md altı) */}
        <div className="md:hidden">
          {listLoading ? (
            <Spinner />
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map(m => (
                <div
                  key={m.id}
                  className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-sm">
                        {m.company_name || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.name || "İsim belirtilmemiş"}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/70 text-[11px]">
                      {m.city || "Şehir yok"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end gap-3 text-sm">
                    <div className="flex flex-col text-xs">
                      <span className="text-muted-foreground mb-0.5">
                        Telefon
                      </span>
                      <span className="font-medium text-sm">
                        {m.phone || "—"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <DialogMusteriDuzenle musteri={m} onSave={handleEdit} />
                      <AppButton
                        onClick={() => askDelete(m)}
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        title="Müşteriyi sil"
                      >
                        Sil
                      </AppButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Gösterilecek müşteri bulunamadı.
            </div>
          )}
        </div>

        {/* Sayfalama */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-3 mt-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="none"
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
      </div>

      {/* Silme Onay Modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Müşteriyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Musteriler;
