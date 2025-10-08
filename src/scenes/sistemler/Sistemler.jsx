// src/scenes/sistemler/Sistemler.jsx
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
  AddOrUpdateSystemImageFromApi
} from '@/redux/actions/actions_sistemler.js';
import Header from '@/components/mycomponents/Header.jsx';
import DialogSistemEkle from './DialogSistemEkle.jsx';
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

const Sistemler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Server-side sayfalama objeleri
  const systems = useSelector(s => s.getSistemlerFromApiReducer) || EMPTY_PAGE;
  const variants = useSelector(s => s.getSystemVariantsFromApiReducer) || EMPTY_PAGE;

  // Sistemler arama + sayfa
  const [sysSearch, setSysSearch] = useState('');
  const [sysPage, setSysPage] = useState(1);
  const [sysLoading, setSysLoading] = useState(false);

  // Varyantlar sayfa
  const [varPage, setVarPage] = useState(1);
  const [varLoading, setVarLoading] = useState(false);

  // Silme modalları
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingSystem, setPendingSystem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [deleteVarOpen, setDeleteVarOpen] = useState(false);
  const [pendingVariant, setPendingVariant] = useState(null);
  const [deletingVar, setDeletingVar] = useState(false);

  // İlk yükleme + bağımlılıklar
  useEffect(() => {
    setSysLoading(true);
    Promise.resolve(dispatch(getSistemlerFromApi(sysPage, sysSearch, 5)))
      .finally(() => setSysLoading(false));
  }, [dispatch, sysPage, sysSearch]);

  useEffect(() => {
    setVarLoading(true);
    Promise.resolve(dispatch(getSystemVariantsFromApi(varPage, "", 5)))
      .finally(() => setVarLoading(false));
  }, [dispatch, varPage]);

  // Arama değişince sysPage=1
  const onSysSearch = (e) => {
    setSysSearch(e.target.value);
    setSysPage(1);
  };

  // Ekle
  const handleAddSystem = useCallback(async ({ name, description, photoFile }) => {
    // 1) Sistemi oluştur
    const created = await dispatch(addSystemToApi({ name, description }));
    const newId = created?.id;

    // 2) Foto dosyası varsa hemen yükle
    if (photoFile && newId) {
      await dispatch(AddOrUpdateSystemImageFromApi(newId, photoFile));
    }

    // 3) Listeyi tazele
    await dispatch(getSistemlerFromApi(sysPage, sysSearch, 5));
  }, [dispatch, sysPage, sysSearch]);

  // Düzenle
  const handleEditSystem = useCallback(async ({ id, name, description, photoFile }) => {
    await dispatch(editSystemOnApi(id, { name, description }));

    // Kullanıcı dialog içinde "Yükle"ye basmamış ama foto dosyası seçip "Güncelle" demiş olabilir:
    if (photoFile && id) {
      await dispatch(AddOrUpdateSystemImageFromApi(id, photoFile));
    }

    await dispatch(getSistemlerFromApi(sysPage, sysSearch, 5));
  }, [dispatch, sysPage, sysSearch]);

  // Sistem sil → modal
  const askDeleteSystem = (sys) => {
    setPendingSystem(sys);
    setDeleteOpen(true);
  };
  const confirmDeleteSystem = async () => {
    if (!pendingSystem) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemOnApi(pendingSystem.id));
      await dispatch(getSistemlerFromApi(sysPage, sysSearch, 5));
    } finally {
      setDeleting(false);
      setPendingSystem(null);
      setDeleteOpen(false);
    }
  };

  // Varyant sil → modal
  const askDeleteVariant = (variant) => {
    setPendingVariant(variant);
    setDeleteVarOpen(true);
  };
  const confirmDeleteVariant = async () => {
    if (!pendingVariant) return;
    try {
      setDeletingVar(true);
      await dispatch(deleteSystemVariantOnApi(pendingVariant.id));
      await dispatch(getSystemVariantsFromApi(varPage, "", 5));
    } finally {
      setDeletingVar(false);
      setPendingVariant(null);
      setDeleteVarOpen(false);
    }
  };

  const totalSysPages = systems.total_pages || 1;
  const totalVarPages = variants.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen bg-background text-foreground">
      <Header title="Sistemler" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-6">
        {/* Arama ve Sistem Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Sistem adına göre ara..."
            value={sysSearch}
            onChange={onSysSearch}
            className="input input-bordered w-full"
          />
          <DialogSistemEkle onSave={handleAddSystem} />
        </div>

        {/* Sistem Tablosu */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Sistem İsmi</th>
                <th>Açıklama</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {sysLoading ? (
              <tbody>
                <tr><td colSpan={3}><Spinner /></td></tr>
              </tbody>
            ) : (
              <tbody>
                {(systems.items ?? []).map(sys => (
                  <tr key={sys.id} className="hover:bg-muted/40">
                    <td>{sys.name}</td>
                    <td>{sys.description}</td>
                    <td className="text-right space-x-2">
                      <DialogSistemEkle system={sys} onSave={handleEditSystem} />
                      <button
                        onClick={() => askDeleteSystem(sys)}
                        className="btn btn-error btn-sm"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {(!systems.items || systems.items.length === 0) && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted-foreground py-4">Veri bulunamadı</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Sistemler Sayfalama */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          <button className="btn btn-sm" onClick={() => setSysPage(1)} disabled={systems.page === 1}>« İlk</button>
          <button className="btn btn-sm" onClick={() => setSysPage(p => Math.max(p - 1, 1))} disabled={!systems.has_prev}>‹ Önceki</button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.sysPageNum.value, 10);
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
          <button className="btn btn-sm" onClick={() => setSysPage(p => Math.min(totalSysPages, p + 1))} disabled={!systems.has_next}>Sonraki ›</button>
          <button className="btn btn-sm" onClick={() => setSysPage(totalSysPages)} disabled={systems.page === totalSysPages || totalSysPages <= 1}>Son »</button>
        </div>

        {/* Sistem Varyantları Bölümü */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sistem Varyantları</h2>
            <button
              onClick={() => navigate('/sistemvaryantolustur')}
              className="btn btn-success"
            >
              Varyant Oluştur
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Varyant İsmi</th>
                  <th className="text-right">İşlemler</th>
                </tr>
              </thead>

              {varLoading ? (
                <tbody>
                  <tr><td colSpan={2}><Spinner /></td></tr>
                </tbody>
              ) : (
                <tbody>
                  {(variants.items ?? []).map(variant => (
                    <tr key={variant.id} className="hover:bg-muted/40">
                      <td>{variant.name}</td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => navigate(`/sistemvaryantduzenle/${variant.id}`)}
                          className="btn btn-warning btn-sm"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => askDeleteVariant(variant)}
                          className="btn btn-error btn-sm"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!variants.items || variants.items.length === 0) && (
                    <tr>
                      <td colSpan={2} className="text-center text-muted-foreground py-4">Veri bulunamadı</td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* Varyantlar Sayfalama */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
            <button className="btn btn-sm" onClick={() => setVarPage(1)} disabled={variants.page === 1}>« İlk</button>
            <button className="btn btn-sm" onClick={() => setVarPage(p => Math.max(p - 1, 1))} disabled={!variants.has_prev}>‹ Önceki</button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(e.target.elements.varPageNum.value, 10);
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
            <button className="btn btn-sm" onClick={() => setVarPage(p => Math.min(totalVarPages, p + 1))} disabled={!variants.has_next}>Sonraki ›</button>
            <button className="btn btn-sm" onClick={() => setVarPage(totalVarPages)} disabled={variants.page === totalVarPages || totalVarPages <= 1}>Son »</button>
          </div>
        </div>
      </div>

      {/* Sistem Silme Modal */}
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

      {/* Varyant Silme Modal */}
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
