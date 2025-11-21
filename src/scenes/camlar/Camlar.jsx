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

  const [limit, setLimit] = useState(10);

  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit))
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

  const handleAddCam = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addCamToApi({
        cam_isim: row.cam_isim,
        thickness_mm: row.thickness_mm,
        belirtec_1: Number(row.belirtec_1) || 0,
        belirtec_2: Number(row.thickness_mm) === 2 ? (Number(row.belirtec_2) || 0) : 0
      }));
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
        thickness_mm: row.thickness_mm,
        belirtec_1: Number(row.belirtec_1) || 0,
        belirtec_2: Number(row.thickness_mm) === 2 ? (Number(row.belirtec_2) || 0) : 0
      }));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  const askDelete = (cam) => {
    setPendingDelete(cam);
    setDeleteOpen(true);
  };

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

  const camTuru = (v) => {
    if (Number(v) === 1) return "Tek Cam";
    if (Number(v) === 2) return "Çift Cam";
    return "—";
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Camlar" />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          <input
            type="text"
            placeholder="Cam ismine göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80 whitespace-nowrap">Cam Sayısı</label>
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
            <DialogCamEkle onSave={handleAddCam} />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* ---------- DESKTOP TABLO ---------- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table w-full border border-base-500 border-gray-500 rounded-lg">
                <thead>
                  <tr className="border-b border-base-500 border-gray-500">
                    <th>Cam İsmi</th>
                    <th className="text-center">Cam Türü</th>
                    <th className="text-center">İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items?.length > 0 ? (
                    data.items.map(cam => (
                      <tr key={cam.id} className="border-b border-gray-500">
                        <td>{cam.cam_isim}</td>
                        <td className="text-center">{camTuru(cam.thickness_mm)}</td>
                        <td className="text-center space-x-2">
                          <DialogCamDuzenle cam={cam} onSave={handleEditCam} asChild>
                            <AppButton variant="sari" size="sm" shape="none">
                              Düzenle
                            </AppButton>
                          </DialogCamDuzenle>

                          <AppButton
                            variant="kirmizi"
                            size="sm"
                            shape="none"
                            onClick={() => askDelete(cam)}
                          >
                            Sil
                          </AppButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="border-b border-gray-500 text-center text-muted-foreground py-6">
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
                data.items.map(cam => (
                  <div
                    key={cam.id}
                    className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-semibold break-words">
                        {cam.cam_isim}
                      </div>
                      <span className="badge badge-outline whitespace-nowrap">
                        {camTuru(cam.thickness_mm)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <DialogCamDuzenle cam={cam} onSave={handleEditCam}>
                        <AppButton variant="sari" size="md" className="w-full">
                          Düzenle
                        </AppButton>
                      </DialogCamDuzenle>

                      <AppButton
                        variant="kirmizi"
                        size="md"
                        className="w-full"
                        onClick={() => askDelete(cam)}
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
              >
                « İlk
              </AppButton>

              <AppButton
                variant="kurumsalmavi"
                size="sm"
                shape="none"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={!data.has_prev}
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
              >
                Sonraki ›
              </AppButton>

              <AppButton
                variant="kurumsalmavi"
                size="sm"
                shape="none"
                onClick={() => setCurrentPage(totalPages)}
                disabled={data.page === totalPages || totalPages <= 1}
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
