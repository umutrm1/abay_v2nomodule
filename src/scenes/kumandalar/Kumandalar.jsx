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

// DigerMalzemeler.jsx'deki ile aynı görsel spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Server-side pagination objesi beklerken güvenli default
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

  // ÖNEMLİ: Artık reducer bir "sayfalı obje" tutacak (items, page vs)
  const data = useSelector(state => state.getKumandalarFromApiReducer) || EMPTY_PAGE;

  // DigerMalzemeler.jsx ile aynı state akışı
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Silme modalı (DigerMalzemeler UX'i)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 5; // DigerMalzemeler ile uyumlu tutuyoruz

  // page/search değiştikçe server'dan veri çek
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    dispatch(getKumandalarFromApi({ q: searchTerm, limit: LIMIT, page: currentPage }))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [dispatch, currentPage, searchTerm]);

  // Arama değişince 1. sayfaya dön
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Ekle: başarılı olunca aynı sayfayı ve aynı aramayı tazele
  const handleAdd = useCallback(async (row) => {
    setIsLoading(true);
    try {
      // row: { kumanda_isim, price, kapasite }
      await dispatch(addKumandaToApi(row));
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: LIMIT, page: currentPage }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

  // Düzenle: yeni aksiyon imzası price'ı da bekliyor
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
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: LIMIT, page: currentPage }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

  // Silme akışı: DigerMalzemeler'deki modal davranışı
  const askDelete = (item) => {
    setPendingDelete(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(deleteKumandaOnApi(pendingDelete.id));
      await dispatch(getKumandalarFromApi({ q: searchTerm, limit: LIMIT, page: currentPage }));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Kumandalar" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Ekle (aynı düzen) */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Kumanda adına göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full"
          />
          <DialogKumandaEkle onSave={handleAdd} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Kumanda Adı</th>
                <th>Fiyat</th>
                <th>Kapasite</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {data.items?.length > 0 ? data.items.map(kumanda => (
                  <tr key={kumanda.id}>
                    <td>{kumanda.kumanda_isim}</td>
                    <td>{kumanda.price}</td>
                    <td>{kumanda.kapasite}</td>
                    <td className="text-right space-x-2">
                      <DialogKumandaDuzenle kumanda={kumanda} onSave={handleEdit} />
                      <button
                        onClick={() => askDelete(kumanda)}
                        className="btn btn-outline btn-error"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-4">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* DigerMalzemeler.jsx ile aynı sayfalama barı */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
          {/* İlk */}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </button>

          {/* Önceki */}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </button>

          {/* Sayfa inputu (Enter ile git) + toplam */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= data.total_pages) {
                setCurrentPage(val);
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

          {/* Sonraki */}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </button>

          {/* Son */}
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(data.total_pages)}
            disabled={data.page === data.total_pages || data.total_pages <= 1}
            title="Son sayfa"
          >
            Son »
          </button>
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
