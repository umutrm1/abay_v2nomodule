import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProfileColorFromApi,
  getGlassColorFromApi,
  addColorToApi,
  editColorInApi,
  deleteColorFromApi
} from '@/redux/actions/actions_boyalar.js';
import Header from '@/components/mycomponents/Header.jsx';
import DialogProfilBoyaEkle from './DialogProfilBoyaEkle.jsx';
import DialogProfilBoyaDuzenle from './DialogProfilBoyaDuzenle.jsx';
import DialogCamBoyaEkle from './DialogCamBoyaEkle.jsx';
import DialogCamBoyaDuzenle from './DialogCamBoyaDuzenle.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';

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

const Boyalar = () => {
  const dispatch = useDispatch();

  // Reducer'ların artık obje tuttuğunu varsayıyoruz:
  const profileData = useSelector(s => s.getProfileColorsFromApiReducer) || EMPTY_PAGE;
  const glassData = useSelector(s => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;

  const [profileSearch, setProfileSearch] = useState('');
  const [glassSearch, setGlassSearch] = useState('');
  const [profilePage, setProfilePage] = useState(1);
  const [glassPage, setGlassPage] = useState(1);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingGlass, setLoadingGlass] = useState(false);

  const confirmRef = useRef(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { kind: 'profile'|'glass', data: color }
  const [deleting, setDeleting] = useState(false);

  // İlk yükleme + sayfa/arama değiştikçe backend'den çek
  useEffect(() => {
    setLoadingProfile(true);
    dispatch(getProfileColorFromApi(profilePage, profileSearch, 5))
      .finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch]);

  useEffect(() => {
    setLoadingGlass(true);
    dispatch(getGlassColorFromApi(glassPage, glassSearch, 5))
      .finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch]);

  // Ekle/Düzenle/Sil sonrası mevcut sayfa ve aramayı koruyarak refetch
  const refetchProfiles = useCallback(() => {
    setLoadingProfile(true);
    dispatch(getProfileColorFromApi(profilePage, profileSearch, 5))
      .finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch]);

  const refetchGlasses = useCallback(() => {
    setLoadingGlass(true);
    dispatch(getGlassColorFromApi(glassPage, glassSearch, 5))
      .finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch]);

  const handleAddProfile = useCallback(data => {
    setLoadingProfile(true);
    dispatch(addColorToApi({ ...data, type: 'profile' }))
      .finally(() => refetchProfiles());
  }, [dispatch, refetchProfiles]);

  const handleEditProfile = useCallback((data) => {
    // data: { id, name, unit_cost, ... }
    setLoadingProfile(true);
    dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0, type: 'profile' }))
      .then(() => dispatch(getProfileColorFromApi(profilePage, profileSearch, 5)))
      .finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch]);

  const handleAddGlass = useCallback(data => {
    setLoadingGlass(true);
    dispatch(addColorToApi({ ...data, type: 'glass' }))
      .finally(() => refetchGlasses());
  }, [dispatch, refetchGlasses]);

  const handleEditGlass = useCallback((data) => {
    setLoadingGlass(true);
    dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0, type: 'glass' }))
      .then(() => dispatch(getGlassColorFromApi(glassPage, glassSearch, 5)))
      .finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch]);

  const askDeleteProfile = (color) => {
    setPendingDelete({ kind: "profile", data: color });
    setDeleteOpen(true);
  };

  const askDeleteGlass = (color) => {
    setPendingDelete({ kind: "glass", data: color });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, data } = pendingDelete;

    try {
      setDeleting(true);
      if (kind === "profile") {
        await dispatch(deleteColorFromApi(data.id));
        await dispatch(getProfileColorFromApi(profilePage, profileSearch, 5));
      } else {
        await dispatch(deleteColorFromApi(data.id));
        await dispatch(getGlassColorFromApi(glassPage, glassSearch, 5));
      }
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      // Modal'ı kapatma ConfirmDeleteModal içinde onConfirm sonrası onOpenChange(false) ile yapılır
    }
  };
  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Boyalar" />

      <div className="space-y-8">
        {/* Profil Boyaları */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-6 text-foreground">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-2xl font-semibold whitespace-nowrap">Profil Boyaları</h2>
            <input
              value={profileSearch}
              onChange={(e) => { setProfileSearch(e.target.value); setProfilePage(1); }}
              className="input input-bordered w-full"
              placeholder="Profil Boyası Ara.."
            />
            <DialogProfilBoyaEkle onSave={handleAddProfile} />

          </div>

          {loadingProfile ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Boya İsmi</th>
                      <th className="text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.items?.length > 0 ? profileData.items.map(color => (
                      <tr key={color.id}>
                        <td>{color.name}</td>
                        <td className="text-right space-x-2">
                          <DialogProfilBoyaDuzenle
                            color={color}
                            onSave={handleEditProfile}
                          />
                          <button
                            onClick={() => askDeleteProfile(color)}
                            className="btn btn-outline btn-error"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-foreground py-4">
                          Veri bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side pagination controls */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                {/* İlk */}
                <button
                  className="btn btn-sm"
                  onClick={() => setProfilePage(1)}
                  disabled={profileData.page === 1}
                >
                  « İlk
                </button>

                {/* Önceki */}
                <button
                  className="btn btn-sm"
                  onClick={() => setProfilePage(p => Math.max(p - 1, 1))}
                  disabled={!profileData.has_prev}
                >
                  ‹ Önceki
                </button>

                {/* Input ile sayfa seçimi */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= profileData.total_pages) {
                      setProfilePage(val);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={profileData.total_pages}
                    defaultValue={profileData.page}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {profileData.total_pages}</span>
                </form>

                {/* Sonraki */}
                <button
                  className="btn btn-sm"
                  onClick={() => setProfilePage(p => p + 1)}
                  disabled={!profileData.has_next}
                >
                  Sonraki ›
                </button>

                {/* Son */}
                <button
                  className="btn btn-sm"
                  onClick={() => setProfilePage(profileData.total_pages)}
                  disabled={profileData.page === profileData.total_pages || profileData.total_pages <= 1}
                >
                  Son »
                </button>
              </div>
            </>
          )}
        </div>

        {/* Cam Boyaları */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-6 text-foreground">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-2xl font-semibold whitespace-nowrap">Cam Boyaları</h2>
            <input
              value={glassSearch}
              onChange={(e) => { setGlassSearch(e.target.value); setGlassPage(1); }}
              className="input input-bordered w-full"
              placeholder='Cam Boyası Ara..'
            />
            <DialogCamBoyaEkle onSave={handleAddGlass} />

          </div>

          {loadingGlass ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Boya İsmi</th>
                      <th className="text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glassData.items?.length > 0 ? glassData.items.map(color => (
                      <tr key={color.id}>
                        <td>{color.name}</td>
                        <td className="text-right space-x-2">
                          <DialogCamBoyaDuzenle
                            color={color}
                            onSave={handleEditGlass}
                          />
                          <button
                            onClick={() => askDeleteGlass(color)}
                            className="btn btn-outline btn-error"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-foreground py-4">
                          Veri bulunamadı
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side pagination controls */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                {/* İlk */}
                <button
                  className="btn btn-sm"
                  onClick={() => setGlassPage(1)}
                  disabled={glassData.page === 1}
                >
                  « İlk
                </button>

                {/* Önceki */}
                <button
                  className="btn btn-sm"
                  onClick={() => setGlassPage(p => Math.max(p - 1, 1))}
                  disabled={!glassData.has_prev}
                >
                  ‹ Önceki
                </button>

                {/* Input ile sayfa seçimi */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= glassData.total_pages) {
                      setGlassPage(val);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={glassData.total_pages}
                    defaultValue={glassData.page}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {glassData.total_pages}</span>
                </form>

                {/* Sonraki */}
                <button
                  className="btn btn-sm"
                  onClick={() => setGlassPage(p => p + 1)}
                  disabled={!glassData.has_next}
                >
                  Sonraki ›
                </button>

                {/* Son */}
                <button
                  className="btn btn-sm"
                  onClick={() => setGlassPage(glassData.total_pages)}
                  disabled={glassData.page === glassData.total_pages || glassData.total_pages <= 1}
                >
                  Son »
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Silmek istediğinize emin misiniz?"
        description={
          pendingDelete
            ? `'${pendingDelete.data.name}' silinecek. Bu işlem geri alınamaz.`
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

export default Boyalar;
