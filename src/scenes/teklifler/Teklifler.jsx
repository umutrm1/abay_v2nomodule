// src/scenes/projeler/Teklifler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions_projeler from "@/redux/actions/actions_projeler.js";
import DialogProjeEkle from './DialogProjeEkle.jsx';
import Header from '@/components/mycomponents/Header.jsx';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import DialogMusteriSec from '../projeekle/DialogMusteriSec.jsx';
import AppButton from "@/components/ui/AppButton.jsx";

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
  const [sortTeklifler, setSortTeklifler] = useState(false);
  const [sortTekliflerDir, setSortTekliflerDir] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const debouncedCode = useDebounced(searchCode, 300);
  const debouncedName = useDebounced(searchName, 300);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [moving, setMoving] = useState(false);

  const formatOnlyDate = (val) => {
    if (!val) return "—";
    try {
      // En güvenlisi: string başında YYYY-MM-DD yakala ve dönüştür
      if (typeof val === "string") {
        const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/); // 2025-10-28 veya 2025-10-28T...
        if (m) {
          const [, y, mo, d] = m;
          return `${d}/${mo}/${y}`;
        }
      }
      // Diğer durumlar: Date nesnesine çevirip yerel tarihten oluştur
      const d = new Date(val);
      if (isNaN(d.getTime())) return "—";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return "—";
    }
  };

  useEffect(() => {
    setListLoading(true);
    Promise.resolve(
      dispatch(
        actions_projeler.getProjelerFromApi({
          page,
          limit: Math.min(50, Math.max(1, Number(limit) || 10)),
          name: debouncedName || "",
          code: debouncedCode || "",
          is_teklif: true,
          customer_id: selectedCustomer?.id || "",
          ...(sortTeklifler === true ? { teklifler_sorted: true } : {})
        })
      )
    ).finally(() => setListLoading(false));
  }, [dispatch, page, debouncedName, debouncedCode, limit, selectedCustomer?.id,sortTeklifler]);

  const onSearchName = (e) => {
    setSearchName(e.target.value);
    setPage(1);
  };
  const onSearchCode = (e) => {
    setSearchCode(e.target.value);
    setPage(1);
  };

  const onLimitChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(200, Math.max(1, raw));
    setLimit(clamped);
    setPage(1);
  };

  const handleAddProje = useCallback(async (newProje) => {
    setIsOverlayLoading(true);
    const payload = {
      project_name: newProje.project_name,
      created_by:"23691d1d-7545-46b1-bcc3-141a96a7ad3b",
      is_teklif: true
    };
    console.log(payload)

    try {
      const created = await dispatch(actions_projeler.addProjeToApi(payload));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
        customer_id: selectedCustomer?.id || "",
      }));
      const newId = created?.id || created?.data?.id;
      if (newId) navigate(`/sistemsec/${newId}`);
    } finally {
      setIsOverlayLoading(false);
    }
  }, [dispatch, navigate, page, debouncedName, debouncedCode, limit, selectedCustomer?.id]);

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
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
        customer_id: selectedCustomer?.id || "",
      }));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  const askMove = (proje) => {
    setPendingMove(proje);
    setMoveOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!pendingMove) return;
    try {
      setMoving(true);
      const p = pendingMove;
      const payload = {
        customer_id: p.customer_id,
        project_name: p.project_name,
        profile_color_id: p.profile_color_id,
        glass_color_id: p.glass_color_id,
        created_at: p.created_at,
        press_price: p.press_price ?? 0,
        painted_price: p.painted_price ?? 0,
        is_teklif: false,
        paint_status: p.paint_status,
        glass_status: p.glass_status,
        production_status: p.production_status,
      };

      await dispatch(actions_projeler.editProjeOnApi(p.id, payload));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: true,
        customer_id: selectedCustomer?.id || "",
      }));
    } finally {
      setMoving(false);
      setPendingMove(null);
      setMoveOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;
  const COL_COUNT = 5;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      {isOverlayLoading && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted-foreground/30 border-t-primary"></div>
        </div>
      )}

      <Header title="Teklifler" />

      <div className="bg-card border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Ekle */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-0 w-full justify-evenly">
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
            className="input input-bordered w-full md:max-w-sm ml-10"
          />

          <div className="flex items-center gap-2 ml-10">
            <AppButton
              variant="gri"
              size="sm"
              className="md:!h-10"
              onClick={() => setCustomerDialogOpen(true)}
              title="Müşteriye göre filtrele"
            >
              Müşteriye Göre Ara
            </AppButton>

            {selectedCustomer?.id && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-500 text-sm">
                <span className="truncate max-w-[12rem]">
                  {selectedCustomer.company_name || selectedCustomer.name || 'Seçili müşteri'}
                </span>
                <AppButton
                  size="xs"
                  variant="gri"
                  shape="none"
                  onClick={() => { setSelectedCustomer(null); setPage(1); }}
                  title="Müşteri filtresini temizle"
                >
                  ✕
                </AppButton>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-10">
            <label className="text-sm opacity-80">Teklif Sayısı</label>
            <input
              type="number"
              min={1}
              max={200}
              value={limit}
              onChange={onLimitChange}
              className="input input-bordered input-sm w-24 text-center"
              title="Sayfa Başına Teklif Sayısı (min:1/max:200)"
            />
          </div>

          <DialogProjeEkle onSave={handleAddProje} />
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full border borderase-500 rounded-lg">
            <thead>
              <tr className="border borderase-500 border-gray-500">
              <th>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:opacity-80 cursor-pointer select-none "
                  title="Oluşturma tarihine göre sırala"
                  onClick={() => {
                    if(sortTeklifler==false){
                    setSortTeklifler(true);
                    setSortTekliflerDir(prev => (prev === "asc" ? "desc" : "asc"));
                    setPage(1);
                  }
                  else{
                    setSortTeklifler(false);
                    setSortTekliflerDir(prev => (prev === "asc" ? "desc" : "asc"));
                    setPage(1);            
                  }}
                }

                >
                  <span>Oluşturma Tarihi</span>
                  <span className={sortTeklifler ? "" : "opacity-50"}>
                    {sortTekliflerDir === "asc" ? "▲" : "▼"}
                  </span>
                </button>
              </th>
                <th>Proje Kodu</th>
                <th>Müşteri Adı</th>
                <th>Proje Adı</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr className="border borderase-400 border-gray-500">
                  <td colSpan={COL_COUNT}><Spinner /></td>
                </tr>
              </tbody>
            ) : (data.items ?? []).length > 0 ? (
              <tbody>
                {data.items.map(proje => (
                  <tr key={proje.id} className="border borderase-300 border-gray-500">
                    <td>
                      {formatOnlyDate(proje?.created_at ?? proje?.requirements?.created_at)}
                    </td>
                    <td>{proje.project_kodu}</td>
                    <td>{proje.customer_name || '—'}</td>
                    <td>{proje.project_name}</td>
                    <td className="text-center space-x-2">
                      <AppButton
                        size="sm"
                        variant="kurumsalmavi"
                        onClick={() => askMove(proje)}
                        title="Teklifi projeye taşı"
                      >
                        Projelere Taşı
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant="sari"
                        onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                        title="Teklifi düzenle"
                      >
                        Düzenle
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant="kirmizi"
                        onClick={() => askDelete(proje)}
                        title="Teklifi sil"
                      >
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr className="border borderase-500">
                  <td colSpan={COL_COUNT} className="text-center text-muted-foreground py-10">
                    Gösterilecek teklif bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
          <AppButton
            size="sm"
            variant="kurumsalmavi"
            onClick={() => setPage(1)}
            disabled={data.page === 1}
          >
            « İlk
          </AppButton>
          <AppButton
            size="sm"
            variant="kurumsalmavi"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
          >
            ‹ Önceki
          </AppButton>
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
          <AppButton
            size="sm"
            variant="kurumsalmavi"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={!data.has_next}
          >
            Sonraki ›
          </AppButton>
          <AppButton
            size="sm"
            variant="kurumsalmavi"
            onClick={() => setPage(totalPages)}
            disabled={data.page === totalPages || totalPages <= 1}
          >
            Son »
          </AppButton>
        </div>
      </div>

      {/* Modallar */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Teklifi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.project_name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      <ConfirmDeleteModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        title="Teklifi Projeye Taşımaya Emin misiniz?"
        description={pendingMove ? `'${pendingMove.project_name}' tekliften projeye taşınacak.` : ""}
        confirmText="Evet, Taşı"
        cancelText="Vazgeç"
        onConfirm={handleConfirmMove}
        loading={moving}
      />

      <DialogMusteriSec
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSelect={(row) => {
          setSelectedCustomer(row);
          setPage(1);
          setCustomerDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Teklifler;
