// src/scenes/digermalzemeler/DigerMalzemeler.jsx
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

const DigerMalzemeler = () => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [limit, setLimit] = useState(10);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit))
      .finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm, limit]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setCurrentPage(1);
  };

  const handleAddItem = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addDigerMalzemeToApi(row));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

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
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  const askDelete = (item) => {
    setPendingDelete(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellDigerMalzemeOnApi(pendingDelete.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getDigerMalzemelerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  const hesaplamaLabel = (t) => (t === "adetli" ? "Adetli" : "Ölçülü");

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Diğer Malzemeler" />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          <input
            type="text"
            placeholder="Malzeme adına göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80 whitespace-nowrap">Diğer Malzeme Sayısı</label>
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

          <div className="w-full md:w-auto md:ml-auto">
            <DialogDigerMalzemeEkle onSave={handleAddItem} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* ---------- DESKTOP TABLO ---------- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table w-full border border-gray-500 rounded-lg">
                <thead>
                  <tr className="border-b border-gray-500">
                    <th>İsim</th>
                    <th>Birim</th>
                    <th>Birim Ağırlık</th>
                    <th>Birim Fiyat</th>
                    <th>Hesaplama Türü</th>
                    <th className="text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.length > 0 ? (
                    data.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-500">
                        <td>{item.diger_malzeme_isim}</td>
                        <td>{item.birim}</td>
                        <td>{item.birim_agirlik}</td>
                        <td>{item.unit_price}</td>
                        <td>{item.hesaplama_turu}</td>
                        <td className="text-center space-x-2">
                          <DialogDigerMalzemeDuzenle item={item} onSave={handleEditItem} />
                          <AppButton
                            variant="kirmizi"
                            size="sm"
                            shape="none"
                            onClick={() => askDelete(item)}
                            title="Sil"
                          >
                            Sil
                          </AppButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="border-b border-gray-500 text-center text-muted-foreground py-6">
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ---------- MOBİL KART LİSTE ---------- */}
            <div className="md:hidden flex flex-col gap-3">
              {data.items?.length > 0 ? (
                data.items.map(item => (
                  <div
                    key={item.id}
                    className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3"
                  >
                    {/* Başlık */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-semibold break-words">
                        {item.diger_malzeme_isim}
                      </div>
                      <span className="badge badge-outline whitespace-nowrap">
                        {hesaplamaLabel(item.hesaplama_turu)}
                      </span>
                    </div>

                    {/* Detaylar */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-border p-2 bg-muted/20">
                        <div className="text-xs text-muted-foreground">Birim</div>
                        <div className="font-medium break-words">{item.birim || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-border p-2 bg-muted/20">
                        <div className="text-xs text-muted-foreground">Birim Ağırlık</div>
                        <div className="font-medium">{item.birim_agirlik ?? 0}</div>
                      </div>
                      <div className="rounded-lg border border-border p-2 bg-muted/20 col-span-2">
                        <div className="text-xs text-muted-foreground">Birim Fiyat</div>
                        <div className="font-medium">{item.unit_price ?? 0}</div>
                      </div>
                    </div>

                    {/* Aksiyonlar */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <DialogDigerMalzemeDuzenle item={item} onSave={handleEditItem}>
                        <AppButton variant="sari" size="md" className="w-full">
                          Düzenle
                        </AppButton>
                      </DialogDigerMalzemeDuzenle>

                      <AppButton
                        variant="kirmizi"
                        size="md"
                        className="w-full"
                        onClick={() => askDelete(item)}
                      >
                        Sil
                      </AppButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">
                  Veri bulunamadı
                </div>
              )}
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
                  const val = parseInt(e.target.elements.pageNum.value, 10);
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
          </>
        )}
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
