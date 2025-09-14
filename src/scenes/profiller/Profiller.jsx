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
} from '@/redux/actions/actions_profiller';
import DialogProfilEkle from './DialogProfilEkle';
import DialogProfilDuzenle from './DialogProfilDuzenle';
import Header from '@/components/mycomponents/Header';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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

  // Server-side sayfalama objesi
  const data = useSelector(state => state.getProfillerFromApiReducer) || EMPTY_PAGE;

  // Görsel cache (reducer adı kullanıcı talebine göre)
  const imageCache = useSelector(state => state.getProfilImageFromApiReducer) || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Silme modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingImgIds, setLoadingImgIds] = useState(new Set());
  const [uploadingIds, setUploadingIds] = useState(new Set());
  const fileInputRefs = useRef({});
  // Aynı id için tekrarlı istek atmayı önlemek adına ref
  const requestedRef = useRef(new Set());

  // Veri çek: page veya search değişince
  useEffect(() => {
    setIsLoading(true);
    dispatch(getProfillerFromApi(currentPage, searchTerm, 5))
      .finally(() => setIsLoading(false));
  }, [dispatch, currentPage, searchTerm]);

  // Arama değişince 1. sayfa
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
        // başlat: loading'e ekle
        setLoadingImgIds(prev => new Set(prev).add(p.id));
        // istek:
        Promise.resolve(dispatch(getProfilImageFromApi(p.id)))
          .finally(() => {
            // bitti: loading'den çıkar
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
      await dispatch(getProfillerFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

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
      await dispatch(getProfillerFromApi(currentPage, searchTerm, 5));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, currentPage, searchTerm]);

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
      await dispatch(getProfillerFromApi(currentPage, searchTerm, 5));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };
  const handleClickUpload = (profilId) => {
    if (!fileInputRefs.current[profilId]) return;
    fileInputRefs.current[profilId].click(); // gizli input'u tetikle
  };

  const handleFileChange = async (profilId, e) => {
    const file = e.target.files?.[0];
    // aynı input tekrar kullanılabilsin diye değerini temizle
    e.target.value = "";
    if (!file) return;

    // loading set
    setUploadingIds(prev => new Set(prev).add(profilId));
    try {
      await dispatch(uploadProfilImageToApi(profilId, file));
      // yükleme bitti → görseli tazele
      await dispatch(getProfilImageFromApi(profilId));
    } catch (err) {
      console.error("Upload failed", err);
      // tercihen bir toast gösterebilirsiniz
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(profilId);
        return next;
      });
    }
  };
  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Profiller" />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-y-4">
        {/* Arama ve Ekle (tasarımı bozma) */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Profil kodu veya adı ile ara..."
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full"
          />
          <DialogProfilEkle onSave={handleAddProfil} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Profil Kodu</th>
                <th>Profil Adı</th>
                <th>Kesit Fotoğraf</th>
                <th>Birim Ağırlık</th>
                <th>Boy Uzunluk</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
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
                    <tr key={profil.id}>
                      <td>{profil.profil_kodu}</td>
                      <td>{profil.profil_isim}</td>
                      <td>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={`${profil.profil_isim} kesit`}
                            className="h-10 w-16 object-contain border rounded"
                            loading="lazy"
                          />
                        )
                          : failed ? (
                            <span className="opacity-60">—</span>
                          )
                            : isLoadingImg ? (
                              <CellSpinner />

                            )
                              :
                              (<span className="opacity-60">—</span>)}
                      </td>
                      <td>{profil.birim_agirlik}</td>
                      <td>{profil.boy_uzunluk}</td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              await dispatch(deleteProfilImageFromApi(profil.id));
                              
                            } catch (err) {
                              console.error("Fotoğraf silme hatası", err);
                            }
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          Fotoğraf Sil
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputRefs.current[profil.id] = el; }}
                          onChange={(e) => handleFileChange(profil.id, e)}
                        />

                        {/* YENİ: Fotoğraf Yükle butonu */}
                        <button
                          onClick={() => handleClickUpload(profil.id)}
                          className="btn btn-outline btn-sm"
                          disabled={uploadingIds.has(profil.id)} // yükleme sırasında kilitle
                          title="Profil kesit fotoğrafı yükle"
                        >
                          {uploadingIds.has(profil.id) ? "Yükleniyor..." : "Fotoğraf Yükle"}
                        </button>
                        <DialogProfilDuzenle profil={profil} onSave={handleEditProfil} />
                        <button
                          onClick={() => askDelete(profil)}
                          className="btn btn-error btn-sm"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
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
