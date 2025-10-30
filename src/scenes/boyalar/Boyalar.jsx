// src/scenes/boyalar/Boyalar.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProfileColorFromApi,
  getGlassColorFromApi,
  addColorToApi,
  editColorInApi,
  deleteColorFromApi,
  makeDefaultColorOne,
  makeDefaultColorTwo
} from '@/redux/actions/actions_boyalar.js';
import Header from '@/components/mycomponents/Header.jsx';
import DialogProfilBoyaEkle from './DialogProfilBoyaEkle.jsx';
import DialogProfilBoyaDuzenle from './DialogProfilBoyaDuzenle.jsx';
import DialogCamBoyaEkle from './DialogCamBoyaEkle.jsx';
import DialogCamBoyaDuzenle from './DialogCamBoyaDuzenle.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import AppButton from '@/components/ui/AppButton.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

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

  // Reducer'ların obje döndüğünü varsayıyoruz:
  const profileData = useSelector(s => s.getProfileColorsFromApiReducer) || EMPTY_PAGE;
  const glassData = useSelector(s => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;

  // Arama
  const [profileSearch, setProfileSearch] = useState('');
  const [glassSearch, setGlassSearch] = useState('');

  // Sayfa
  const [profilePage, setProfilePage] = useState(1);
  const [glassPage, setGlassPage] = useState(1);

  // 🆕 Limit (kullanıcıdan): min 1, max 50, varsayılan 10
  const [profileLimit, setProfileLimit] = useState(10);
  const [glassLimit, setGlassLimit] = useState(10);

  // Loading
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingGlass, setLoadingGlass] = useState(false);

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { kind: 'profile'|'glass', data: color }
  const [deleting, setDeleting] = useState(false);
  // Varsayılan atama modal state
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState(null); // { id, name, ... }
  const [defaultLoading, setDefaultLoading] = useState(false);
  // Liste fetch — Profil
  useEffect(() => {
    setLoadingProfile(true);
    const safeLimit = Math.min(50, Math.max(1, Number(profileLimit) || 10));
    dispatch(getProfileColorFromApi(profilePage, profileSearch, safeLimit))
      .finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch, profileLimit]);

  // Liste fetch — Cam
  useEffect(() => {
    setLoadingGlass(true);
    const safeLimit = Math.min(50, Math.max(1, Number(glassLimit) || 10));
    dispatch(getGlassColorFromApi(glassPage, glassSearch, safeLimit))
      .finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch, glassLimit]);

  // Ekle/Düzenle/Sil sonrası mevcut sayfa ve aramayı koruyarak refetch
  const refetchProfiles = useCallback(() => {
    setLoadingProfile(true);
    const safeLimit = Math.min(50, Math.max(1, Number(profileLimit) || 10));
    dispatch(getProfileColorFromApi(profilePage, profileSearch, safeLimit))
      .finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch, profileLimit]);

  const refetchGlasses = useCallback(() => {
    setLoadingGlass(true);
    const safeLimit = Math.min(50, Math.max(1, Number(glassLimit) || 10));
    dispatch(getGlassColorFromApi(glassPage, glassSearch, safeLimit))
      .finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch, glassLimit]);

  // Profil — Ekle
  const handleAddProfile = useCallback((data) => {
    setLoadingProfile(true);
    dispatch(addColorToApi({ ...data, type: 'profile' }))
      .finally(() => refetchProfiles());
  }, [dispatch, refetchProfiles]);

  // Profil — Düzenle
  const handleEditProfile = useCallback((data) => {
    setLoadingProfile(true);
    dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0, type: 'profile' }))
      .then(() => refetchProfiles())
      .finally(() => setLoadingProfile(false));
  }, [dispatch, refetchProfiles]);

  // Cam — Ekle
  const handleAddGlass = useCallback((data) => {
    setLoadingGlass(true);
    dispatch(addColorToApi({ ...data, type: 'glass' }))
      .finally(() => refetchGlasses());
  }, [dispatch, refetchGlasses]);

  // Cam — Düzenle
  const handleEditGlass = useCallback((data) => {
    setLoadingGlass(true);
    dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0, type: 'glass' }))
      .then(() => refetchGlasses())
      .finally(() => setLoadingGlass(false));
  }, [dispatch, refetchGlasses]);

  // Silme modali
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
      await dispatch(deleteColorFromApi(data.id));
      if (kind === "profile") {
        await refetchProfiles();
      } else {
        await refetchGlasses();
      }
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      // Modal kapatma: ConfirmDeleteModal içinden onOpenChange(false) ile
    }
  };
  // Modalı aç
  const askSetDefaultGlass = (color) => {
    setDefaultTarget(color);
    setDefaultOpen(true);
  };

  // Varsayılan 1 atama
  const handleSetDefaultOne = async () => {
    if (!defaultTarget) return;
    try {
      setDefaultLoading(true);
      await dispatch(makeDefaultColorOne(defaultTarget.id));
      await refetchGlasses(); // listeyi güncelle
      setDefaultOpen(false);
    } finally {
      setDefaultLoading(false);
    }
  };

  // Varsayılan 2 atama
  const handleSetDefaultTwo = async () => {
    if (!defaultTarget) return;
    try {
      setDefaultLoading(true);
      await dispatch(makeDefaultColorTwo(defaultTarget.id));
      await refetchGlasses();
      setDefaultOpen(false);
    } finally {
      setDefaultLoading(false);
    }
  };

  // İsim yanındaki BADGE render helper
  const renderDefaultBadge = (color) => {
    if (color?.is_default && color?.is_default_2) {
      return (
        <span className="badge badge-success ml-2 whitespace-nowrap">
          Varsayılan 1 ve 2 Olarak Atandı
        </span>
      );
    }
    if (color?.is_default) {
      return (
        <span className="badge badge-success ml-2 whitespace-nowrap">
          Varsayılan 1 Olarak Atandı
        </span>
      );
    }
    if (color?.is_default_2) {
      return (
        <span className="badge badge-success ml-2 whitespace-nowrap">
          Varsayılan 2 Olarak Atandı
        </span>
      );
    }
    return null;
  };

  const profileTotalPages = profileData.total_pages || 1;
  const glassTotalPages = glassData.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Boyalar" />

      <div className="space-y-8">
        {/* Profil Boyaları */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-6 text-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full">
            <h2 className="text-2xl font-semibold whitespace-nowrap">Profil Boyaları</h2>
            <input
              value={profileSearch}
              onChange={(e) => { setProfileSearch(e.target.value); setProfilePage(1); }}
              className="input input-bordered w-full md:max-w-sm"
              placeholder="Profil Boyası Ara.."
            />

            {/* 🆕 Kayıt Sayısı (limit) inputu */}
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80">Boya Sayısı</label>
              <input
                type="number"
                min={1}
                max={50}
                value={profileLimit}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
                  setProfileLimit(clamped);
                  setProfilePage(1);
                }}
                className="input input-bordered input-sm w-24 text-center"
                title="Sayfa Başına Kayıt (min:1 / max:50)"
              />
            </div>

            <DialogProfilBoyaEkle onSave={handleAddProfile} />
          </div>

          {loadingProfile ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full border border-base-500 border-gray-500 rounded-lg">
                  <thead>
                    <tr className="border-b border-base-500 border-gray-500">
                      <th>Boya İsmi</th>
                      <th className="text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.items?.length > 0 ? (
                      profileData.items.map(color => (
                        <tr key={color.id} className="border-b  border-gray-500">
                          <td>{color.name}</td>

                          <td className="text-center space-x-2">
                            <DialogProfilBoyaDuzenle
                              color={color}
                              onSave={handleEditProfile}
                            />
                            <AppButton
                              size="sm"
                              variant="kirmizi"
                              onClick={() => askDeleteProfile(color)}
                            >
                              Sil
                            </AppButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="border-b border-base-500 border-gray-500 text-center text-muted-foreground py-4">
                          Veri bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama — Teklifler.jsx UX */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage(1)}
                  disabled={profileData.page === 1}
                  title="İlk sayfa"
                >
                  « İlk
                </AppButton>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage(p => Math.max(p - 1, 1))}
                  disabled={!profileData.has_prev}
                  title="Önceki sayfa"
                >
                  ‹ Önceki
                </AppButton>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= profileTotalPages) {
                      setProfilePage(val);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={profileTotalPages}
                    value={profileData.page || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) return setProfilePage(1);
                      setProfilePage(Math.min(Math.max(1, val), profileTotalPages));
                    }}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {profileTotalPages}</span>
                </form>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage(p => Math.min(profileTotalPages, p + 1))}
                  disabled={!profileData.has_next}
                  title="Sonraki sayfa"
                >
                  Sonraki ›
                </AppButton>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage(profileTotalPages)}
                  disabled={profileData.page === profileTotalPages || profileTotalPages <= 1}
                  title="Son sayfa"
                >
                  Son »
                </AppButton>
              </div>
            </>
          )}
        </div>

        {/* Cam Boyaları */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-6 text-foreground">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-3 w-full">
            <h2 className="text-2xl font-semibold whitespace-nowrap">Cam Boyaları</h2>
            <input
              value={glassSearch}
              onChange={(e) => { setGlassSearch(e.target.value); setGlassPage(1); }}
              className="input input-bordered w-full md:max-w-sm"
              placeholder="Cam Boyası Ara.."
            />

            {/* 🆕 Kayıt Sayısı (limit) inputu */}
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80">Boya Sayısı</label>
              <input
                type="number"
                min={1}
                max={50}
                value={glassLimit}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
                  setGlassLimit(clamped);
                  setGlassPage(1);
                }}
                className="input input-bordered input-sm w-24 text-center"
                title="Sayfa Başına Kayıt (min:1 / max:50)"
              />
            </div>

            <DialogCamBoyaEkle onSave={handleAddGlass} />
          </div>

          {loadingGlass ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full border border-base-500 border-gray-500 rounded-lg">
                  <thead>
                    <tr className="border-b border-base-500 border-gray-500">
                      <th>Boya İsmi</th>
                      <th className="text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glassData.items?.length > 0 ? (
                      glassData.items.map(color => (
                        <tr key={color.id} className="border-b border-gray-500">
                          <td className="flex items-center gap-1">
                            <span>{color.name}</span>
                            {renderDefaultBadge(color)}
                          </td>
                          <td className="text-center space-x-2">
                            <DialogCamBoyaDuzenle
                              color={color}
                              onSave={handleEditGlass}
                            />
                            <AppButton
                              size="sm"
                              variant="yesil"
                              onClick={() => askSetDefaultGlass(color)}
                              title="Bu rengi Varsayılan olarak ata"
                            >
                              Varsayılan Ata
                            </AppButton>
                            <AppButton
                              size="sm"
                              variant="kirmizi"
                              onClick={() => askDeleteGlass(color)}
                            >
                              Sil
                            </AppButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="border-b border-base-500 border-gray-500 text-center text-muted-foreground py-4">
                          Veri bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama — Teklifler.jsx UX */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage(1)}
                  disabled={glassData.page === 1}
                  title="İlk sayfa"
                >
                  « İlk
                </AppButton>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage(p => Math.max(p - 1, 1))}
                  disabled={!glassData.has_prev}
                  title="Önceki sayfa"
                >
                  ‹ Önceki
                </AppButton>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= glassTotalPages) {
                      setGlassPage(val);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={glassTotalPages}
                    value={glassData.page || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) return setGlassPage(1);
                      setGlassPage(Math.min(Math.max(1, val), glassTotalPages));
                    }}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {glassTotalPages}</span>
                </form>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage(p => Math.min(glassTotalPages, p + 1))}
                  disabled={!glassData.has_next}
                  title="Sonraki sayfa"
                >
                  Sonraki ›
                </AppButton>

                <AppButton
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage(glassTotalPages)}
                  disabled={glassData.page === glassTotalPages || glassTotalPages <= 1}
                  title="Son sayfa"
                >
                  Son »
                </AppButton>
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
      {/* Varsayılan Ata Modal */}
      <Dialog open={defaultOpen} onOpenChange={setDefaultOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Varsayılan Ata</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm opacity-80">
            {defaultTarget ? (
              <p>
                <b>{defaultTarget.name}</b> rengi için varsayılan atama yapın.
              </p>
            ) : (
              <p>Bir renk seçin.</p>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <AppButton
              variant="kurumsalmavi"
              onClick={handleSetDefaultOne}
              loading={defaultLoading}
              disabled={!defaultTarget || defaultLoading}
            >
              Varsayılan 1 ata
            </AppButton>
            <AppButton
              variant="mor"
              onClick={handleSetDefaultTwo}
              loading={defaultLoading}
              disabled={!defaultTarget || defaultLoading}
            >
              Varsayılan 2 ata
            </AppButton>
            <DialogClose asChild>
              <AppButton variant="gri">Vazgeç</AppButton>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Boyalar;
