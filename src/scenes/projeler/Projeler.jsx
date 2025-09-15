// src/scenes/projeler/Projeler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions_projeler from "@/redux/actions/actions_projeler.js";

import DialogProjeEkle from './DialogProjeEkle.jsx';
import Header from '@/components/mycomponents/Header.jsx';
import { useNavigate } from 'react-router-dom';
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

const Projeler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Server-side dönen sayfalama objesi
  const data = useSelector(state => state.getProjelerFromApiReducer) || EMPTY_PAGE;

  // UI durumları
  const [isOverlayLoading, setIsOverlayLoading] = useState(false); // üstteki global overlay
  const [listLoading, setListLoading] = useState(false);           // tablo spinner
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);


  // Liste çek: page veya arama değiştiğinde
  useEffect(() => {
    setListLoading(true);
    Promise
      .resolve(dispatch(actions_projeler.getProjelerFromApi(page, searchTerm, 10)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, searchTerm]);

  // Arama değişince sayfayı 1’e çek
  const onSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Ekle: oluştur → isteğe bağlı refetch → sistem seç sayfasına git
  const handleAddProje = useCallback(async (newProje) => {
    setIsOverlayLoading(true);

    // payload örneğini dosyanda bu şekilde kullanıyordun, aynısını korudum
    const payload = {
      customer_id: newProje.customer_id ?? "8a9c492c-08be-4426-919b-0c1b334b139c",
      project_name: newProje.project_name,
      created_by: newProje.created_by ?? "23691d1d-7545-46b1-bcc3-141a96a7ad3b"
    };

    try {
      const created = await dispatch(actions_projeler.addProjeToApi(payload));
      // Görünüm güncel kalsın
      await dispatch(actions_projeler.getProjelerFromApi(page, searchTerm, 10));
      // Sistem seçim sayfasına yönlendir
      navigate(`/sistemsec/${created.id}`);
    } finally {
      setIsOverlayLoading(false);
    }
  }, [dispatch, navigate, page, searchTerm]);

  // Silme modalını aç
  const askDelete = (proje) => {
    setPendingDelete(proje);
    setDeleteOpen(true);
  };

  // Modal onay → sil → refetch
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(actions_projeler.deleteProjeOnApi(pendingDelete.id));
      await dispatch(actions_projeler.getProjelerFromApi(page, searchTerm, 10));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      {/* Global overlay loader (eklerken) */}
      {isOverlayLoading && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
        </div>
      )}

      <Header title="Projeler" />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-y-4">
        {/* Arama ve Ekle — tasarım aynen korunur */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Proje adına göre ara..."
            value={searchTerm}
            onChange={onSearch}
            className="input input-bordered w-full"
          />
          <DialogProjeEkle onSave={handleAddProje} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          {listLoading ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proje Kodu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proje Adı</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={3}><Spinner /></td></tr>
              </tbody>
            </table>
          ) : (data.items ?? []).length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proje Kodu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proje Adı</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.items.map(proje => (
                  <tr key={proje.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{proje.project_kodu}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{proje.project_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button
                        onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => askDelete(proje)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none active:opacity-75 active:scale-95 transition"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-10 text-gray-500">Gösterilecek proje bulunamadı.</p>
          )}
        </div>

        {/* Sayfalama — boyalardakiyle aynı: İlk/Önceki/Input/Sonraki/Son + toplam */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
          {/* İlk */}
          <button
            className="btn btn-sm"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </button>

          {/* Önceki */}
          <button
            className="btn btn-sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
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
              if (!isNaN(val) && val >= 1 && val <= data.total_pages) setPage(val);
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
            onClick={() => setPage(p => p + 1)}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </button>

          {/* Son */}
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

      {/* Silme Onay Modali (shadcn/Radix) */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Projeyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.project_name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Projeler;
