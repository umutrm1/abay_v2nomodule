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
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// basit debounce hook'u
const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const Teklifler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector(state => state.getProjelerFromApiReducer) || EMPTY_PAGE;

  const [isOverlayLoading, setIsOverlayLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // 🔹 İKİ AYRI ARAMA ALANI: KOD + AD
  const [searchCode, setSearchCode] = useState('');   // proje kodu
  const [searchName, setSearchName] = useState('');   // proje adı
  const debouncedCode = useDebounced(searchCode, 300);
  const debouncedName = useDebounced(searchName, 300);

  const [page, setPage] = useState(1);

  // ❌ Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🟦 Taşıma (teklif → proje) modal state
  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [moving, setMoving] = useState(false);

  // 🔸 Liste çek: page veya filtreler değiştiğinde
  useEffect(() => {
    setListLoading(true);
    Promise.resolve(
      dispatch(
        actions_projeler.getProjelerFromApi({
          page,
          limit: 10,
          name: debouncedName || "",
          code: debouncedCode || "",
          is_teklif: true,            // ✨ sadece teklifler
        })
      )
    ).finally(() => setListLoading(false));
  }, [dispatch, page, debouncedName, debouncedCode]);

  // 🔸 Arama alanları değişince sayfayı 1’e çek
  const onSearchName = (e) => {
    setSearchName(e.target.value);
    setPage(1);
  };
  const onSearchCode = (e) => {
    setSearchCode(e.target.value);
    setPage(1);
  };

  const handleAddProje = useCallback(async (newProje) => {
    setIsOverlayLoading(true);
    const payload = {
      customer_id: newProje.customer_id ?? "8a9c492c-08be-4426-919b-0c1b334b139c",
      project_name: newProje.project_name,
      created_by: newProje.created_by ?? "23691d1d-7545-46b1-bcc3-141a96a7ad3b",
      is_teklif: true
    };

    try {
      const created = await dispatch(actions_projeler.addProjeToApi(payload));
      // ✅ listeyi filtrelerle tazele
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: 10,
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
      }));
      const newId = created?.id || created?.data?.id;
      if (newId) navigate(`/sistemsec/${newId}`);
    } finally {
      setIsOverlayLoading(false);
    }
  }, [dispatch, navigate, page, debouncedName, debouncedCode]);

  // ❌ Silme
  const askDelete = (proje) => {
    setPendingDelete(proje);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(actions_projeler.deleteProjeOnApi(pendingDelete.id));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: 10,
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
      }));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  // 🟦 Teklifi Projeye Taşı
  const askMove = (proje) => {
    setPendingMove(proje);
    setMoveOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;
    try {
      setMoving(true);

      // Kullanıcının verdiği şemaya sadık payload: sadece is_teklif false, diğerleri aynı.
      const p = pendingMove;

      const payload = {
        customer_id: p.customer_id,
        project_name: p.project_name,
        profile_color_id: p.profile_color_id,
        glass_color_id: p.glass_color_id,
        created_at: p.created_at,
        press_price: p.press_price ?? 0,
        painted_price: p.painted_price ?? 0,
        is_teklif: false, // 🔴 sadece bu değişiyor
        paint_status: p.paint_status,
        glass_status: p.glass_status,
        production_status: p.production_status,
      };

      // Not: editProjeOnApi imzası projene göre (id, payload) ya da (payload) olabilir.
      // Aşağıdaki satır (id, payload) varsayımıyla yazıldı.
      await dispatch(actions_projeler.editProjeOnApi(p.id, payload));

      // Listeyi (hala teklifler) tazele — taşınan kayıt artık teklifte görünmemeli
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: 10,
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
      }));
    } finally {
      setMoving(false);
      setPendingMove(null);
      setMoveOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      {isOverlayLoading && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted-foreground/30 border-t-primary"></div>
        </div>
      )}

      <Header title="Teklifler" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          {/* 🔹 SOLDAN SAĞA: PROJE KODU → PROJE ADI */}
          <input
            type="text"
            placeholder="Proje koduna göre ara..."
            value={searchCode}
            onChange={onSearchCode}
            className="input input-bordered w-full md:max-w-sm"
          />
          <input
            type="text"
            placeholder="Proje adına göre ara..."
            value={searchName}
            onChange={onSearchName}
            className="input input-bordered w-full md:max-w-sm"
          />
          <DialogProjeEkle onSave={handleAddProje} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Proje Kodu</th>
                <th>Proje Adı</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr>
                  <td colSpan={3}><Spinner /></td>
                </tr>
              </tbody>
            ) : (data.items ?? []).length > 0 ? (
              <tbody>
                {data.items.map(proje => (
                  <tr key={proje.id}>
                    <td>{proje.project_kodu}</td>
                    <td>{proje.project_name}</td>
                    <td className="text-center space-x-2">
                      {/* 🟦 Projelere Taşı (solda) */}
                      <button
                        onClick={() => askMove(proje)}
                        className="btn btn-primary btn-sm"
                        title="Teklifi projeye taşı"
                      >
                        Projelere Taşı
                      </button>

                      {/* ✏️ Düzenle */}
                      <button
                        onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                        className="btn btn-warning btn-sm"
                        title="Projeyi düzenle"
                      >
                        Düzenle
                      </button>

                      {/* 🗑️ Sil */}
                      <button
                        onClick={() => askDelete(proje)}
                        className="btn btn-error btn-sm"
                        title="Projeyi sil"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={3} className="text-center text-muted-foreground py-10">
                    Gösterilecek proje bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
          <button
            className="btn btn-sm"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </button>

          <button
            className="btn btn-sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="pageNum"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) return setPage(1);
                setPage(Math.min(Math.max(1, val), totalPages));
              }}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {totalPages}</span>
          </form>

          <button
            className="btn btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </button>

          <button
            className="btn btn-sm"
            onClick={() => setPage(totalPages)}
            disabled={data.page === totalPages || totalPages <= 1}
            title="Son sayfa"
          >
            Son »
          </button>
        </div>
      </div>

      {/* ❌ Silme modali */}
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

      {/* 🟦 Teklifi Projeye Taşı modali — ConfirmDeleteModal yapısı ile */}
      <ConfirmDeleteModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        title="Teklifi Projeye Taşımaya Emin Misiniz?"
        description={pendingMove ? `'${pendingMove.project_name}' tekliften projeye taşınacak.` : ""}
        confirmText="Evet, Taşı"
        cancelText="Vazgeç"
        onConfirm={handleConfirmMove}
        loading={moving}
      />
    </div>
  );
};

export default Teklifler;
