// src/scenes/diger_malzemeler/DigerMalzemeler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import DialogDigerMalzemeEkle from './DialogDigerMalzemeEkle.jsx';
import DialogDigerMalzemeDuzenle from './DialogDigerMalzemeDuzenle.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDigerMalzemelerFromApi,
  addDigerMalzemeToApi,
  editDigerMalzemeOnApi,
  sellDigerMalzemeOnApi
} from '@/redux/actions/actions_diger_malzemeler.js';
import Header from '@/components/mycomponents/Header.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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

const DigerMalzemeler = () => {
  const dispatch = useDispatch();

  // Reducer artık obje (server-side sayfalama sonucu) tutacak
  const data = useSelector(state => state.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;

  // Tasarımı bozmadan mevcut kontrol yapıları:
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1'den başlar
  const [isLoading, setIsLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Veri çekme (page/search değiştikçe)
  useEffect(() => {
    setIsLoading(true);
    dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, 5))
      .finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm]);

  // Arama değişince 1. sayfaya dön
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Ekle/Düzenle/Sil handlers (mevcut sayfa & aramayı koru)
  const handleAddItem = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addDigerMalzemeToApi(row));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

  const handleEditItem = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(editDigerMalzemeOnApi(row.id, {
        diger_malzeme_isim: row.diger_malzeme_isim,
        birim: row.birim,
        birim_agirlik: row.birim_agirlik,
        hesaplama_turu: row.hesaplama_turu,
        unit_price: row.unit_price
      }));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

  const askDelete = (item) => {
    setPendingDelete(item);
    setDeleteOpen(true);
  };

  // Modalda "Evet, sil" onayı
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellDigerMalzemeOnApi(pendingDelete.id));
      await dispatch(getDigerMalzemelerFromApi());
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Diğer Malzemeler" />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-y-4">
        {/* Arama ve Ekle (tasarım aynı) */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Malzeme adına göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full"
          />
          <DialogDigerMalzemeEkle onSave={handleAddItem} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>İsim</th>
                <th>Birim</th>
                <th>Birim Ağırlık</th>
                <th>Birim Fiyat</th>
                <th>Hesaplama Türü</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {data.items?.length > 0 ? data.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.diger_malzeme_isim}</td>
                    <td>{item.birim}</td>
                    <td>{item.birim_agirlik}</td>
                    <td>{item.unit_price}</td>
                    <td>{item.hesaplama_turu}</td>
                    <td className="text-right space-x-2">
                      <DialogDigerMalzemeDuzenle
                        item={item}
                        onSave={handleEditItem}
                      />
                      <button
                        onClick={() => askDelete(item)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama — boyalardakiyle aynı mantık: İlk/Önceki/Input/Sonraki/Son + toplam sayfa */}
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
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete
            ? `'${pendingDelete.diger_malzeme_isim}' silinecek. Bu işlem geri alınamaz.`
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

export default DigerMalzemeler;
