// src/scenes/kumandalar/Kumandalar.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getKumandalarFromApi,
  addKumandaToApi,
  editKumandaOnApi,
  deleteKumandaOnApi
} from '@/redux/actions/actions_kumandalar.js';
import DialogKumandaEkle from './DialogKumandaEkle.jsx';
import DialogKumandaDuzenle from './DialogKumandaDuzenle.jsx';
import Header from '@/components/mycomponents/Header.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import AppButton from '@/components/ui/AppButton.jsx';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const Kumandalar = () => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.getKumandalarFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 Limit
  const [limit, setLimit] = useState(10);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Veri çekme
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getKumandalarFromApi({ q: searchTerm, limit: safeLimit, page: currentPage }))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [dispatch, currentPage, searchTerm, limit]);

  // Arama
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 🆕 Limit değişimi
  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setCurrentPage(1);
  };

  // Ekle
  const handleAdd = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addKumandaToApi(row));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: safeLimit, page: currentPage }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // Düzenle
  const handleEdit = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(
        editKumandaOnApi(row.id, {
          kumanda_isim: row.kumanda_isim,
          price: row.price,
          kapasite: row.kapasite,
        })
      );
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: safeLimit, page: currentPage }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // Silme akışı
  const askDelete = (item) => {
    setPendingDelete(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(deleteKumandaOnApi(pendingDelete.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: safeLimit, page: currentPage }));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Kumandalar" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Limit + Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full">
          <input
            type="text"
            placeholder="Kumanda adına göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

          {/* 🆕 Kayıt Sayısı (limit) */}
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Kumanda Sayısı</label>
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

          <DialogKumandaEkle onSave={handleAdd} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full border border-base-500 dark:border-gray-500 rounded-lg">
            <thead>
              <tr className="border-b border-base-500">
                <th>Kumanda Adı</th>
                <th>Fiyat</th>
                <th>Kapasite</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr className="border-b border-base-400">
                  <td colSpan={4}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : (data.items?.length > 0 ? (
              <tbody>
                {data.items.map(kumanda => (
                  <tr key={kumanda.id} className="border-b border-base-300">
                    <td>{kumanda.kumanda_isim}</td>
                    <td>{kumanda.price}</td>
                    <td>{kumanda.kapasite}</td>
                    <td className="text-center space-x-2">
                      <DialogKumandaDuzenle kumanda={kumanda} onSave={handleEdit} />
                      <AppButton
                        onClick={() => askDelete(kumanda)}
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        title="Kumandayı sil"
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
                  <td colSpan={4} className="border-b border-base-500 text-center text-muted-foreground py-4">
                    Veri bulunamadı
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>

        {/* Sayfalama */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setCurrentPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </AppButton>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.currentTarget.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                setCurrentPage(val);
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="pageNum"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) return setCurrentPage(1);
                setCurrentPage(Math.min(Math.max(1, val), totalPages));
              }}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {totalPages}</span>
          </form>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setCurrentPage(totalPages)}
            disabled={data.page === totalPages || totalPages <= 1}
            title="Son sayfa"
          >
            Son »
          </AppButton>
        </div>
      </div>

      {/* Silme onay modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete
            ? `'${pendingDelete.kumanda_isim}' silinecek. Bu işlem geri alınamaz.`
            : ""
        }
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Kumandalar;
