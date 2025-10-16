// src/scenes/profiller/Profiller.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProfillerFromApi,
  addProfillerToApi,
  editProfillerOnApi,
  sellProfillerOnApi,
  getProfilImageFromApi,
  uploadProfilImageToApi,
  deleteProfilImageFromApi
} from '@/redux/actions/actions_profiller.js';
import DialogProfilEkle from './DialogProfilEkle.jsx';
import DialogProfilDuzenle from './DialogProfilDuzenle.jsx';
import Header from '@/components/mycomponents/Header.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import AppButton from '@/components/ui/AppButton.jsx';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Hücre için minik spinner
const CellSpinner = () => (
  <div className="inline-flex items-center justify-center w-10 h-10">
    <span className="loading loading-spinner loading-sm" />
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

const Profiller = () => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.getProfillerFromApiReducer) || EMPTY_PAGE;
  const imageCache = useSelector(state => state.getProfilImageFromApiReducer) || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 Limit
  const [limit, setLimit] = useState(10);

  // Silme modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingImgIds, setLoadingImgIds] = useState(new Set());
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const fileInputRefs = useRef({});
  const requestedRef = useRef(new Set());

  // Veri çek
  useEffect(() => {
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit))
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

  // Görünen satırlar için profil kesit görselini prefetch et
  useEffect(() => {
    (data?.items ?? []).forEach((p) => {
      const entry = imageCache[p.id];
      const hasImg = (typeof entry === 'string') || !!entry?.imageData;
      const failed = !!entry?.error;
      const isLoading = loadingImgIds.has(p.id);
      if (!hasImg && !failed && !isLoading && !requestedRef.current.has(p.id)) {
        requestedRef.current.add(p.id);
        setLoadingImgIds(prev => new Set(prev).add(p.id));
        Promise.resolve(dispatch(getProfilImageFromApi(p.id)))
          .finally(() => {
            setLoadingImgIds(prev => {
              const next = new Set(prev);
              next.delete(p.id);
              return next;
            });
          });
      }
    });
  }, [dispatch, data?.items, imageCache, loadingImgIds]);

  // EKLE
  const handleAddProfil = useCallback(async (profil) => {
    setIsLoading(true);
    try {
      await dispatch(addProfillerToApi(profil));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // DÜZENLE
  const handleEditProfil = useCallback(async (profil) => {
    setIsLoading(true);
    try {
      await dispatch(editProfillerOnApi(profil.id, {
        profil_kodu: profil.profil_kodu,
        profil_isim: profil.profil_isim,
        birim_agirlik: profil.birim_agirlik,
        boy_uzunluk: profil.boy_uzunluk,
        profil_kesit_fotograf: 'string',
        unit_price: 0
      }));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm, limit]);

  // SİL → modal aç
  const askDelete = (profil) => {
    setPendingDelete(profil);
    setDeleteOpen(true);
  };

  // Modal onay
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(sellProfillerOnApi(pendingDelete.id));
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
      await dispatch(getProfillerFromApi(currentPage, searchTerm, safeLimit));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const handleClickUpload = (profilId) => {
    if (!fileInputRefs.current[profilId]) return;
    fileInputRefs.current[profilId].click();
  };

  const handleFileChange = async (profilId, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingIds(prev => new Set(prev).add(profilId));
    try {
      await dispatch(uploadProfilImageToApi(profilId, file));
      await dispatch(getProfilImageFromApi(profilId));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(profilId);
        return next;
      });
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Profiller" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Limit + Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full">
          <input
            type="text"
            placeholder="Profil kodu veya adı ile ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full md:max-w-sm"
          />

          {/* 🆕 Kayıt Sayısı (limit) */}
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Profil Sayısı</label>
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

          <DialogProfilEkle onSave={handleAddProfil} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full border border-base-500 dark:border-gray-500 rounded-lg">
            <thead>
              <tr className="border-b border-base-500">
                <th>Profil Kodu</th>
                <th>Profil Adı</th>
                <th>Kesit Fotoğraf</th>
                <th>Birim Ağırlık</th>
                <th>Boy Uzunluk</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr className="border-b border-base-400">
                  <td colSpan={6}><Spinner /></td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {(data.items ?? []).length > 0 ? data.items.map(profil => {
                  const entry = imageCache[profil.id];
                  const imgSrc = typeof entry === 'string' ? entry : entry?.imageData;
                  const failed = !!entry?.error;
                  const isLoadingImg = loadingImgIds.has(profil.id);
                  return (
                    <tr key={profil.id} className="border-b border-base-300">
                      <td>{profil.profil_kodu}</td>
                      <td>{profil.profil_isim}</td>
                      <td>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={`${profil.profil_isim} kesit`}
                            className="h-10 w-16 object-contain border border-border rounded"
                            loading="lazy"
                          />
                        ) : failed ? (
                          <span className="opacity-60">—</span>
                        ) : isLoadingImg ? (
                          <CellSpinner />
                        ) : (
                          <span className="opacity-60">—</span>
                        )}
                      </td>
                      <td>{profil.birim_agirlik}</td>
                      <td>{profil.boy_uzunluk}</td>
                      <td className="text-center space-x-2">
                        <AppButton
                          onClick={async () => {
                            try {
                              await dispatch(deleteProfilImageFromApi(profil.id));
                            } catch (err) {
                              console.error("Fotoğraf silme hatası", err);
                            }
                          }}
                          variant="gri"
                          size="sm"
                          shape="none"
                          title="Profil kesit fotoğrafını sil"
                        >
                          Fotoğraf Sil
                        </AppButton>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputRefs.current[profil.id] = el; }}
                          onChange={(e) => handleFileChange(profil.id, e)}
                        />
                        <AppButton
                          onClick={() => handleClickUpload(profil.id)}
                          variant="koyumavi"
                          size="sm"
                          shape="none"
                          disabled={uploadingIds.has(profil.id)}
                          title="Profil kesit fotoğrafı yükle"
                        >
                          {uploadingIds.has(profil.id) ? "Yükleniyor..." : "Fotoğraf Yükle"}
                        </AppButton>

                        <DialogProfilDuzenle profil={profil} onSave={handleEditProfil} />

                        <AppButton
                          onClick={() => askDelete(profil)}
                          variant="kirmizi"
                          size="sm"
                          shape="none"
                          title="Profili sil"
                        >
                          Sil
                        </AppButton>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="border-b border-base-500 text-center text-muted-foreground py-4">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            )}
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

      {/* Silme Onay Modali */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete ? `'${pendingDelete.profil_isim}' silinecek. Bu işlem geri alınamaz.` : ""
        }
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Profiller;
