// src/scenes/camlar/Camlar.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCamlarFromApi,
  addCamToApi,
  editCamOnApi,
  sellCamOnApi
} from '@/redux/actions/actions_camlar.js';
import Header from '@/components/mycomponents/Header.jsx';
import DialogCamEkle from './DialogCamEkle.jsx';
import DialogCamDuzenle from './DialogCamDuzenle.jsx';
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

const Camlar = () => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.getCamlarFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading]     = useState(false);

  // 🆕 Limit: min 1, max 50
  const [limit, setLimit] = useState(10);

  // Silme modali
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // Veri çekme
  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit))
      .finally(() => setIsLoading(false));
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

  // Ekle / Düzenle
  const handleAddCam = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addCamToApi(row));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  const handleEditCam = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(editCamOnApi(row.id, {
        cam_isim: row.cam_isim,
        thickness_mm: row.thickness_mm
      }));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // Sil: modal aç
  const askDelete = (cam) => {
    setPendingDelete(cam);
    setDeleteOpen(true);
  };

  // Modal onay
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellCamOnApi(pendingDelete.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Camlar" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Limit + Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full">
          <input
            type="text"
            placeholder="Cam ismine göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

        {/* 🆕 Kayıt Sayısı (limit) */}
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Cam Sayısı</label>
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

          {/* Not: DialogCamEkle kendi tetikleyicisini içeriyor. İstersen asChild ile AppButton'a taşıyabiliriz. */}
          <DialogCamEkle onSave={handleAddCam} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full border border-base-500 dark:border-gray-500 rounded-lg">
            <thead>
              <tr className="border-b border-base-500 dark:border-gray-500">
                <th>Cam İsmi</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr className="border-b border-base-400 dark:border-gray-500">
                  <td colSpan={2}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : (data.items?.length > 0 ? (
              <tbody>
                {data.items.map(cam => (
                  <tr key={cam.id} className="border-b border-base-300 dark:border-gray-500">
                    <td>{cam.cam_isim}</td>
                    <td className="text-center space-x-2">
                      {/* Düzenle: sari, sm, dikdörtgen */}
                      <DialogCamDuzenle cam={cam} onSave={handleEditCam} asChild>
                        <AppButton variant="sari" size="sm" shape="none" title="Düzenle">
                          Düzenle
                        </AppButton>
                      </DialogCamDuzenle>

                      {/* Sil: kirmizi, sm, dikdörtgen */}
                      <AppButton
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        onClick={() => askDelete(cam)}
                        title="Sil"
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
                  <td colSpan={2} className="border-b border-base-500 dark:border-gray-500 text-center text-muted-foreground py-4">
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
      </div>

      {/* Silme Onay Modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete ? `'${pendingDelete.cam_isim}' silinecek. Bu işlem geri alınamaz.` : ""
        }
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Camlar;
