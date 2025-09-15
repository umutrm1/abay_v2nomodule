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

const Camlar = () => {
  const dispatch = useDispatch();

  // Reducer artık obje (server-side sayfalama sonucu) tutmalı
  const data = useSelector(state => state.getCamlarFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 1'den başlar
  const [isLoading, setIsLoading]     = useState(false);

  // Silme modali (shadcn/Radix)
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // Veri çekme: page / search değişince
  useEffect(() => {
    setIsLoading(true);
    dispatch(getCamlarFromApi(currentPage, searchTerm, 5))
      .finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm]);

  // Arama değişince 1. sayfaya dön
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Ekle / Düzenle
  const handleAddCam = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(addCamToApi(row));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

  const handleEditCam = useCallback(async (row) => {
    setIsLoading(true);
    try {
      await dispatch(editCamOnApi(row.id, {
        cam_isim: row.cam_isim,
        thickness_mm: row.thickness_mm
      }));
      await dispatch(getCamlarFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

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
      await dispatch(getCamlarFromApi(currentPage, searchTerm, 5));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Camlar" />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-y-4">
        {/* Arama ve Ekle (tasarımı bozma) */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Cam ismine göre ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full"
          />
          <DialogCamEkle onSave={handleAddCam} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Cam İsmi</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {data.items?.length > 0 ? data.items.map(cam => (
                  <tr key={cam.id}>
                    <td>{cam.cam_isim}</td>
                    <td className="text-right space-x-2">
                      <DialogCamDuzenle cam={cam} onSave={handleEditCam} />
                      <button
                        onClick={() => askDelete(cam)}
                        className="btn btn-error btn-sm"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 py-4">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama — boyalardakiyle aynı: İlk/Önceki/Input/Sonraki/Son + toplam */}
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

      {/* Silme Onay Modali (shadcn/ui) */}
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
