// Path: @/scenes/sistemler/Sistemler.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getSistemlerFromApi,
  addSystemToApi,
  deleteSystemOnApi,
  editSystemOnApi,
  getSystemVariantsFromApi,
  deleteSystemVariantOnApi,
  AddOrUpdateSystemImageFromApi,
  getSystemVariantsOfSystemFromApi,
  publishSystem,
  editSystemVariantOnApi,
  unpublishSystem,
  activateSystem,
  deactivateSystem,
  publishVariant,
  unpublishVariant,
  activateVariant,
  deactivateVariant,
} from '@/redux/actions/actions_sistemler';
import Header from '@/components/mycomponents/Header';
import DialogSistemEkle from './DialogSistemEkle';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import DialogVaryantOlustur from './DialogVaryantOlustur';
import AppButton from '@/components/ui/AppButton';
import SistemVaryantGorSirala from './SistemVaryantGorSirala';
import SistemSirala from './SistemSirala';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };

const Sistemler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const systems  = useSelector(s => s.getSistemlerFromApiReducer)       || EMPTY_PAGE;
  const variants = useSelector(s => s.getSystemVariantsFromApiReducer) || EMPTY_PAGE;

  const [sysSearch, setSysSearch] = useState('');
  const [sysPage, setSysPage]     = useState(1);
  const [sysLoading, setSysLoading] = useState(false);
  const [sysSortOpen, setSysSortOpen] = useState(false);
  const [sysLimit, setSysLimit] = useState(10);
  const [varLimit, setVarLimit] = useState(10);

  const [varSearch, setVarSearch] = useState('');
  const [varPage, setVarPage]     = useState(1);
  const [varLoading, setVarLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingSystem, setPendingSystem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [deleteVarOpen, setDeleteVarOpen] = useState(false);
  const [pendingVariant, setPendingVariant] = useState(null);
  const [deletingVar, setDeletingVar] = useState(false);

  const [showInactiveSys, setShowInactiveSys] = useState(false);
  const [showInactiveVar, setShowInactiveVar] = useState(false);

  useEffect(() => {
    setSysLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(sysLimit) || 10));
    Promise.resolve(dispatch(getSistemlerFromApi(sysPage, sysSearch, safeLimit)))
      .finally(() => setSysLoading(false));
  }, [dispatch, sysPage, sysSearch, sysLimit]);

  useEffect(() => {
    setVarLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(varLimit) || 10));
    Promise.resolve(dispatch(getSystemVariantsFromApi(varPage, varSearch, safeLimit)))
      .finally(() => setVarLoading(false));
  }, [dispatch, varPage, varSearch, varLimit]);

  const onSysSearch = (e) => { setSysSearch(e.target.value); setSysPage(1); };
  const onVarSearch = (e) => { setVarSearch(e.target.value); setVarPage(1); };

  const onSysLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setSysLimit(clamped); setSysPage(1);
  };
  const onVarLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setVarLimit(clamped); setVarPage(1);
  };

  const refreshSystems = useCallback(async () => {
    const safeLimit = Math.min(50, Math.max(1, Number(sysLimit) || 10));
    await dispatch(getSistemlerFromApi(sysPage, sysSearch, safeLimit));
  }, [dispatch, sysPage, sysSearch, sysLimit]);

  const refreshVariants = useCallback(async () => {
    const safeLimit = Math.min(50, Math.max(1, Number(varLimit) || 10));
    await dispatch(getSystemVariantsFromApi(varPage, varSearch, safeLimit));
  }, [dispatch, varPage, varSearch, varLimit]);

  const handleAddSystem = useCallback(async ({ name, description, photoFile }) => {
    const created = await dispatch(addSystemToApi({ name, description }));
    const newId = created?.id;
    if (photoFile && newId) { await dispatch(AddOrUpdateSystemImageFromApi(newId, photoFile)); }
    await refreshSystems();
  }, [dispatch, refreshSystems]);

  const handleEditSystem = useCallback(async ({ id, name, description, photoFile }) => {
    await dispatch(editSystemOnApi(id, { name, description }));
    if (photoFile && id) { await dispatch(AddOrUpdateSystemImageFromApi(id, photoFile)); }
    await refreshSystems();
  }, [dispatch, refreshSystems]);

  const askDeleteSystem = (sys) => { setPendingSystem(sys); setDeleteOpen(true); };
  const confirmDeleteSystem = async () => {
    if (!pendingSystem) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemOnApi(pendingSystem.id));
      await refreshSystems();
    } finally {
      setDeleting(false); setPendingSystem(null); setDeleteOpen(false);
    }
  };

  const askDeleteVariant = (variant) => { setPendingVariant(variant); setDeleteVarOpen(true); };
  const confirmDeleteVariant = async () => {
    if (!pendingVariant) return;
    try {
      setDeletingVar(true);
      await dispatch(deleteSystemVariantOnApi(pendingVariant.id));
      await refreshVariants();
    } finally {
      setDeletingVar(false); setPendingVariant(null); setDeleteVarOpen(false);
    }
  };

  const togglePublishSystem = async (sys) => {
    if (!sys?.id) return;
    if (sys.is_published) await dispatch(unpublishSystem(sys.id));
    else await dispatch(publishSystem(sys.id));
    await refreshSystems();
  };

  const togglePublishVariant = async (variant) => {
    if (!variant?.id) return;
    if (variant.is_published) await dispatch(unpublishVariant(variant.id));
    else await dispatch(publishVariant(variant.id));
    await refreshVariants();
  };

  const toggleActiveSystem = async (sys) => {
    if (!sys?.id) return;
    if (sys.is_active) await dispatch(deactivateSystem(sys.id));
    else await dispatch(activateSystem(sys.id));
    await refreshSystems();
  };

  const toggleActiveVariant = async (variant) => {
    if (!variant?.id) return;
    if (variant.is_active) await dispatch(deactivateVariant(variant.id));
    else await dispatch(activateVariant(variant.id));
    await refreshVariants();
  };

  const filteredSystemItems = (systems.items ?? []).filter(item => showInactiveSys ? true : item.is_active);
  const filteredVariantItems = (variants.items ?? []).filter(item => showInactiveVar ? true : item.is_active);

  const totalSysPages = systems.total_pages || 1;
  const totalVarPages = variants.total_pages || 1;

  const [siralaOpen, setSiralaOpen] = useState(false);
  const [activeSystemForSort, setActiveSystemForSort] = useState(null);

  const openSortModal = async (sys) => {
    if (!sys?.id) return;
    setActiveSystemForSort(sys);
    setSiralaOpen(true);
    try {
      await dispatch(getSystemVariantsOfSystemFromApi(sys.id, 1, "", "all"));
    } catch (_) {}
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen bg-background text-foreground">
      <Header title="Sistemler" />

      <div className="bg-card border borderorder rounded-2xl p-4 sm:p-5 flex flex-col gap-y-6">

        {/* ===== SISTEMLER ÜST BAR (Musteriler grid toolbar) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <input
            type="text"
            placeholder="Sistem adına göre ara..."
            value={sysSearch}
            onChange={onSysSearch}
            className="input input-bordered w-full md:col-span-4"
          />

          <div className="flex items-center gap-2 md:col-span-2">
            <label className="text-sm opacity-80 whitespace-nowrap">Sistem Sayısı</label>
            <input
              type="number"
              min={1}
              max={50}
              value={sysLimit}
              onChange={onSysLimitChange}
              className="input input-bordered input-sm w-24 text-center"
              title="Sayfa Başına Kayıt (min:1 / max:50)"
            />
          </div>

          <label className="flex items-center gap-2 md:col-span-3 select-none cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showInactiveSys}
              onChange={(e) => setShowInactiveSys(e.target.checked)}
            />
            <span className="text-sm">Aktif Olmayanları Göster</span>
          </label>

          <div className="md:col-span-2 flex md:justify-end">
            <AppButton
              variant="lacivert"
              size="sm"
              shape="none"
              onClick={() => setSysSortOpen(true)}
              title="Sistemlerin genel sıralamasını düzenle"
              className="w-full md:w-auto"
            >
              Sistem Sırala
            </AppButton>
          </div>

          <div className="md:col-span-1 flex md:justify-end">
            <DialogSistemEkle onSave={handleAddSystem} />
          </div>
        </div>

        {/* ===== SISTEMLER TABLO (md+) ===== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table w-full border border-gray-500 rounded-lg">
            <thead>
              <tr className="border border-gray-500">
                <th>Sistem İsmi</th>
                <th>Açıklama</th>
                <th className="text-center">Durumlar</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {sysLoading ? (
              <tbody>
                <tr className="border borderase-400 border-gray-500">
                  <td colSpan={5}><Spinner /></td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {filteredSystemItems.length > 0 ? (
                  filteredSystemItems.map(sys => (
                    <tr key={sys.id} className="border borderase-300 border-gray-500">
                      <td className="font-semibold">{sys.name}</td>
                      <td>{sys.description}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-md ${sys.is_active ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white'}`}>
                            {sys.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                          <span className={`px-2 py-1 rounded-md ${sys.is_published ? 'bg-blue-600 text-white' : 'bg-zinc-600 text-white'}`}>
                            {sys.is_published ? 'Yayında' : 'Taslak'}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <DialogSistemEkle system={sys} onSave={handleEditSystem} />

                          <AppButton
                            size="sm"
                            variant={sys.is_published ? 'gri' : 'kurumsalmavi'}
                            shape="none"
                            onClick={() => togglePublishSystem(sys)}
                          >
                            {sys.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                          </AppButton>

                          <AppButton
                            size="sm"
                            variant={sys.is_active ? 'turuncu' : 'yesil'}
                            shape="none"
                            onClick={() => toggleActiveSystem(sys)}
                          >
                            {sys.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                          </AppButton>

                          <AppButton
                            size="sm"
                            variant="lacivert"
                            shape="none"
                            onClick={() => openSortModal(sys)}
                            title="Bu sistemin varyantlarını gör ve sırala"
                          >
                            Gör ve Sırala
                          </AppButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-gray-500 text-center text-muted-foreground py-4">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* ===== SISTEMLER MOBİL KART (md-) ===== */}
        <div className="md:hidden">
          {sysLoading ? (
            <Spinner />
          ) : filteredSystemItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredSystemItems.map(sys => (
                <div
                  key={sys.id}
                  className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{sys.name}</div>
                      <div className="text-xs text-muted-foreground break-words">
                        {sys.description || "—"}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] items-end">
                      <span className={`px-2 py-0.5 rounded-md ${sys.is_active ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white'}`}>
                        {sys.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md ${sys.is_published ? 'bg-blue-600 text-white' : 'bg-zinc-600 text-white'}`}>
                        {sys.is_published ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <DialogSistemEkle system={sys} onSave={handleEditSystem} />

                    <AppButton
                      size="sm"
                      variant={sys.is_published ? 'gri' : 'kurumsalmavi'}
                      shape="none"
                      onClick={() => togglePublishSystem(sys)}
                    >
                      {sys.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                    </AppButton>

                    <AppButton
                      size="sm"
                      variant={sys.is_active ? 'turuncu' : 'yesil'}
                      shape="none"
                      onClick={() => toggleActiveSystem(sys)}
                    >
                      {sys.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                    </AppButton>

                    <AppButton
                      size="sm"
                      variant="lacivert"
                      shape="none"
                      onClick={() => openSortModal(sys)}
                    >
                      Gör ve Sırala
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6 text-sm">
              Veri bulunamadı
            </div>
          )}
        </div>

        {/* ===== SISTEMLER SAYFALAMA ===== */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setSysPage(1)} disabled={systems.page === 1}>« İlk</AppButton>
          <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setSysPage(p => Math.max(p - 1, 1))} disabled={!systems.has_prev}>‹ Önceki</AppButton>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.currentTarget.elements.sysPageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalSysPages) setSysPage(val);
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="sysPageNum"
              min={1}
              max={totalSysPages}
              value={sysPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSysPage(isNaN(val) ? 1 : Math.max(1, Math.min(totalSysPages, val)));
              }}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {totalSysPages}</span>
          </form>
          <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setSysPage(p => Math.min(totalSysPages, p + 1))} disabled={!systems.has_next}>Sonraki ›</AppButton>
          <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setSysPage(totalSysPages)} disabled={systems.page === totalSysPages || totalSysPages <= 1}>Son »</AppButton>
        </div>

        {/* ===== VARYANTLAR ===== */}
        <div className="mt-8">
          {/* ÜST BAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-4">
            <h2 className="text-xl font-semibold md:col-span-3">Sistem Varyantları</h2>

            <input
              type="text"
              placeholder="Varyant adına göre ara..."
              value={varSearch}
              onChange={onVarSearch}
              className="input input-bordered w-full md:col-span-3"
            />

            <div className="flex items-center gap-2 md:col-span-2">
              <label className="text-sm opacity-80 whitespace-nowrap">Varyant Sayısı</label>
              <input
                type="number"
                min={1}
                max={50}
                value={varLimit}
                onChange={onVarLimitChange}
                className="input input-bordered input-sm w-24 text-center"
                title="Sayfa Başına Kayıt (min:1 / max:50)"
              />
            </div>

            <label className="flex items-center gap-2 md:col-span-2 select-none cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showInactiveVar}
                onChange={(e) => setShowInactiveVar(e.target.checked)}
              />
              <span className="text-sm">Aktif Olmayanları Göster</span>
            </label>

            <div className="md:col-span-2 flex md:justify-end">
              <DialogVaryantOlustur systems={(systems.items ?? [])} onCreated={refreshVariants} />
            </div>
          </div>

          {/* TABLO md+ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full border border-gray-500 rounded-lg">
              <thead>
                <tr className="border border-gray-500">
                  <th>Varyant İsmi</th>
                  <th className="text-center">Durumlar</th>
                  <th className="text-center">İşlemler</th>
                </tr>
              </thead>

              {varLoading ? (
                <tbody>
                  <tr className="border borderase-400 border-gray-500">
                    <td colSpan={3}><Spinner /></td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {filteredVariantItems.length > 0 ? (
                    filteredVariantItems.map(variant => (
                      <tr key={variant.id} className="border borderase-300 border-gray-500">
                        <td>{variant.name} | {variant.system_name}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className={`px-2 py-1 rounded-md ${variant.is_active ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white'}`}>
                              {variant.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                            <span className={`px-2 py-1 rounded-md ${variant.is_published ? 'bg-blue-600 text-white' : 'bg-zinc-600 text-white'}`}>
                              {variant.is_published ? 'Yayında' : 'Taslak'}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex flex-wrap justify-center gap-2">
                            <AppButton size="sm" variant="sari" shape="none" onClick={() => navigate(`/sistemvaryantduzenle/${variant.id}`)}>
                              Düzenle
                            </AppButton>

                            <AppButton
                              size="sm"
                              variant={variant.is_published ? 'gri' : 'kurumsalmavi'}
                              shape="none"
                              onClick={() => togglePublishVariant(variant)}
                            >
                              {variant.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                            </AppButton>

                            <AppButton
                              size="sm"
                              variant={variant.is_active ? 'turuncu' : 'yesil'}
                              shape="none"
                              onClick={() => toggleActiveVariant(variant)}
                            >
                              {variant.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                            </AppButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="border border-gray-500 text-center text-muted-foreground py-4">
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* MOBİL KART md- */}
          <div className="md:hidden">
            {varLoading ? (
              <Spinner />
            ) : filteredVariantItems.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredVariantItems.map(variant => (
                  <div
                    key={variant.id}
                    className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {variant.name} | {variant.system_name}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px] items-end">
                        <span className={`px-2 py-0.5 rounded-md ${variant.is_active ? 'bg-emerald-600 text-white' : 'bg-zinc-600 text-white'}`}>
                          {variant.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md ${variant.is_published ? 'bg-blue-600 text-white' : 'bg-zinc-600 text-white'}`}>
                          {variant.is_published ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AppButton size="sm" variant="sari" shape="none" onClick={() => navigate(`/sistemvaryantduzenle/${variant.id}`)}>
                        Düzenle
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant={variant.is_published ? 'gri' : 'kurumsalmavi'}
                        shape="none"
                        onClick={() => togglePublishVariant(variant)}
                      >
                        {variant.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant={variant.is_active ? 'turuncu' : 'yesil'}
                        shape="none"
                        onClick={() => toggleActiveVariant(variant)}
                      >
                        {variant.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6 text-sm">
                Veri bulunamadı
              </div>
            )}
          </div>

          {/* VARYANT SAYFALAMA */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
            <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setVarPage(1)} disabled={variants.page === 1}>« İlk</AppButton>
            <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setVarPage(p => Math.max(p - 1, 1))} disabled={!variants.has_prev}>‹ Önceki</AppButton>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(e.currentTarget.elements.varPageNum.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalVarPages) setVarPage(val);
              }}
              className="flex items-center gap-1"
            >
              <input
                type="number"
                name="varPageNum"
                min={1}
                max={totalVarPages}
                value={varPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setVarPage(isNaN(val) ? 1 : Math.max(1, Math.min(totalVarPages, val)));
                }}
                className="input input-bordered input-sm w-16 text-center"
              />
              <span className="text-sm">/ {totalVarPages}</span>
            </form>
            <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setVarPage(p => Math.min(totalVarPages, p + 1))} disabled={!variants.has_next}>Sonraki ›</AppButton>
            <AppButton size="sm" variant="kurumsalmavi" shape="none" onClick={() => setVarPage(totalVarPages)} disabled={variants.page === totalVarPages || totalVarPages <= 1}>Son »</AppButton>
          </div>
        </div>
      </div>

      {/* SIRALAMA MODALLARI */}
      <SistemSirala open={sysSortOpen} onOpenChange={(v) => setSysSortOpen(v)} />

      <SistemVaryantGorSirala
        open={siralaOpen}
        onOpenChange={(v) => { 
          setSiralaOpen(v); 
          if (!v) setActiveSystemForSort(null);
        }}
        system={activeSystemForSort}
      />

      {/* SİLME ONAY MODALLARI */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Sistemi silmek istediğinize emin misiniz?"
        description={pendingSystem ? `'${pendingSystem.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDeleteSystem}
        loading={deleting}
      />

      <ConfirmDeleteModal
        open={deleteVarOpen}
        onOpenChange={setDeleteVarOpen}
        title="Varyantı silmek istediğinize emin misiniz?"
        description={pendingVariant ? `'${pendingVariant.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDeleteVariant}
        loading={deletingVar}
      />
    </div>
  );
};

export default Sistemler;
