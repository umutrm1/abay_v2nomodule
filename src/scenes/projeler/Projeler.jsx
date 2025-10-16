import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions_projeler from "@/redux/actions/actions_projeler.js";
import DialogProjeEkle from './DialogProjeEkle.jsx';
import Header from '@/components/mycomponents/Header.jsx';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';
import DialogMusteriSec from '../projeekle/DialogMusteriSec.jsx';
import AppButton from '@/components/ui/AppButton.jsx';

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

/** 🔽 Durum seçenekleri */
const BOYA_DURUMLAR   = ['Boya Durumu','Boyanacak', 'Boyada', 'Boyadan Geldi'];
const CAM_DURUMLAR    = ['Cam Durumu','Cam Çekildi', 'Cam Geldi', 'Cam Çekilecek'];
const URETIM_DURUMLAR = ['Üretim Durumu','Üretimde', 'Sevk Edildi'];

/** Yardımcı: "Durum Belirtilmedi" => "" (URL'e eklenmesin) */
const toParam = (label) => (label && label !== 'Boya Durumu'&& label !== 'Cam Durumu' && label !== 'Üretim Durumu'  ? label : "");

/** 🔵 Durum → text rengi eşlemesi */
const BOYA_BADGE = {
  'Boyanacak':     'bg-red-800 text-white ring-1 ring-white/10 ',
  'Boyada':        'bg-amber-700 text-white ring-1 ring-white/10',
  'Boyadan Geldi': 'bg-blue-800 text-white ring-1 ring-white/10',
};

const CAM_BADGE = {
  'Cam Çekilecek': 'bg-red-800 text-white ring-1 ring-white/10',
  'Cam Çekildi':   'bg-amber-700 text-white ring-1 ring-white/10',
  'Cam Geldi':     'bg-blue-800 text-white ring-1 ring-white/10',
};

const URETIM_BADGE = {
  'Üretimde':   'bg-amber-700 text-white ring-1 ring-white/10',
  'Sevk Edildi':'bg-blue-800 text-white ring-1 ring-white/10',
};

const renderBadge = (value, map) => {
  if (!value) return <span className="opacity-50">—</span>;
  const cls = map[value];

  // eşleşmeyen değer gelirse gri, okunabilir bir chip göster
  const base =
    "inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium whitespace-nowrap";

  if (!cls) {
    return (
      <span className={``}>
        {value}
      </span>
    );
  }
  return <span className={`${base} ${cls}`}>{value}</span>;
};
/** 🔹 approval_date → sadece tarih (TR yereli) */
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR');
};

const Projeler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector(state => state.getProjelerFromApiReducer) || EMPTY_PAGE;

  const [isOverlayLoading, setIsOverlayLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // 🔹 İKİ AYRI ARAMA ALANI: KOD + AD
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const debouncedCode = useDebounced(searchCode, 300);
  const debouncedName = useDebounced(searchName, 300);

  const [page, setPage] = useState(1);

  // 🆕 Proje sayısı (limit)
  const [limit, setLimit] = useState(10);

  // ❌ Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🟦 Tekliflere Taşı modal state
  const [moveOpen, setMoveOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [moving, setMoving] = useState(false);

  // ✅ Dropdown filtre state'leri
  const [paintLabel, setPaintLabel] = useState('Boya Durumu');
  const [glassLabel, setGlassLabel] = useState('Cam Durumu');
  const [prodLabel,  setProdLabel]  = useState('Üretim Durumu');

  const paint_status      = toParam(paintLabel);
  const glass_status      = toParam(glassLabel);
  const production_status = toParam(prodLabel);

  // 🟢 Müşteri filtresi
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    setListLoading(true);
    Promise.resolve(
      dispatch(
        actions_projeler.getProjelerFromApi({
          page,
          limit: Math.min(50, Math.max(1, Number(limit) || 10)),
          name: debouncedName || "",
          code: debouncedCode || "",
          is_teklif: false,
          paint_status,
          glass_status,
          production_status,
          customer_id: selectedCustomer?.id || "",
        })
      )
    ).finally(() => setListLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, debouncedName, debouncedCode, paint_status, glass_status, production_status, selectedCustomer?.id, limit]);

  const onSearchName = (e) => { setSearchName(e.target.value); setPage(1); };
  const onSearchCode = (e) => { setSearchCode(e.target.value); setPage(1); };

  const onPaintChange = (e) => { setPaintLabel(e.target.value); setPage(1); };
  const onGlassChange = (e) => { setGlassLabel(e.target.value); setPage(1); };
  const onProdChange  = (e) => { setProdLabel(e.target.value);  setPage(1); };

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
      created_by: newProje.created_by ?? "23691d1d-7545-46b1-bcc3-141a96a7ad3b",
      is_teklif:false
    };

    try {
      const created = await dispatch(actions_projeler.addProjeToApi(payload));
      await dispatch(actions_projeler.getProjelerFromApi({
        page,
        limit: Math.min(50, Math.max(1, Number(limit) || 10)),
        name: debouncedName || "",
        code: debouncedCode || "",
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
        customer_id: selectedCustomer?.id || "",
      }));
      const newId = created?.id || created?.data?.id;
      if (newId) navigate(`/sistemsec/${newId}`);
    } finally {
      setIsOverlayLoading(false);
    }
  }, [dispatch, navigate, page, debouncedName, debouncedCode, paint_status, glass_status, production_status, selectedCustomer?.id, limit]);

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
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
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
        is_teklif: true,
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
        is_teklif: false,
        paint_status,
        glass_status,
        production_status,
        customer_id: selectedCustomer?.id || "",
      }));
    } finally {
      setMoving(false);
      setPendingMove(null);
      setMoveOpen(false);
    }
  };

  const totalPages = data.total_pages || 1;
  const COL_COUNT = 8;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      {isOverlayLoading && (
        <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted-foreground/30 border-t-primary"></div>
        </div>
      )}

      <Header title="Projeler" />

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama + Filtreler + Ekle */}
        <div className="flex flex-col gap-3 w-full">
          {/* SOLDAN SAĞA: PROJE KODU → PROJE ADI → MÜŞTERİ → PROJE SAYISI → EKLE */}
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

            {/* Müşteriye Göre butonu + seçili müşteri rozeti */}
            <div className="flex items-center gap-2 ml-10">
              <AppButton
                type="button"
                variant="gri"
              className="md:!h-10"

                size="sm"
                shape="none"
                onClick={() => setCustomerDialogOpen(true)}
                title="Müşteriye göre filtrele"
              >
                Müşteriye Göre Ara
              </AppButton>

              {selectedCustomer?.id && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-border text-sm">
                  <span className="truncate max-w-[12rem]">
                    {selectedCustomer.company_name || selectedCustomer.name || 'Seçili müşteri'}
                  </span>
                  <button
                  className='cursor-pointer'
                    onClick={() => { setSelectedCustomer(null); setPage(1); }}
                    title="Müşteri filtresini temizle"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Proje Sayısı (limit) */}
            <div className="flex items-center gap-2 ml-10">
              <label className="text-sm opacity-80">Proje Sayısı</label>
              <input
                type="number"
                min={1}
                max={200}
                value={limit}
                onChange={onLimitChange}
                className="input input-bordered input-sm w-24 text-center"
                title="Sayfa Başına Proje Sayısı (min:1/max:200)"
              />
            </div>

            <DialogProjeEkle onSave={handleAddProje} />
          </div>

          {/* Durum dropdown filtreleri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={paintLabel}
              onChange={onPaintChange}
              className="select select-bordered w-full cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 active:border-primary transition"
              title="Boya durumuna göre filtrele"
            >
              {BOYA_DURUMLAR.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={glassLabel}
              onChange={onGlassChange}
              className="select select-bordered w-full cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 active:border-primary transition"
              title="Cam durumuna göre filtrele"
            >
              {CAM_DURUMLAR.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={prodLabel}
              onChange={onProdChange}
              className="select select-bordered w-full cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 active:border-primary transition"
              title="Üretim durumuna göre filtrele"
            >
              {URETIM_DURUMLAR.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="table w-full border border-base-500 rounded-lg">
            <thead>
              <tr className="border-b border-base-500 dark:border-gray-500">
                <th>Onay Tarihi</th>
                <th>Proje Kodu</th>
                <th>Müşteri Adı</th>
                <th>Proje Adı</th>
                <th>Boya Durumu</th>
                <th>Cam Durumu</th>
                <th>Üretim Durumu</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr className="border-b border-base-400 dark:border-gray-500">
                  <td colSpan={COL_COUNT}><Spinner /></td>
                </tr>
              </tbody>
            ) : (data.items ?? []).length > 0 ? (
              <tbody>
                {data.items.map(proje => (
                  <tr key={proje.id} className="border-b border-base-300 dark:border-gray-500">
                    <td>{formatDate(proje.approval_date)}</td>
                    <td>{proje.project_kodu}</td>
                    <td>{proje.customer_name || '—'}</td>
                    <td>{proje.project_name}</td>
                    <td>{renderBadge(proje.paint_status, BOYA_BADGE)}</td>
                    <td>{renderBadge(proje.glass_status, CAM_BADGE)}</td>
                    <td>{renderBadge(proje.production_status, URETIM_BADGE)}</td>
                    <td className="text-center space-x-2">
                      <AppButton
                        onClick={() => askMove(proje)}
                        variant="kurumsalmavi"
                        size="sm"
                        shape="none"
                        title="Projeyi tekliflere taşı"
                      >
                        Tekliflere Taşı
                      </AppButton>

                      <AppButton
                        onClick={() => navigate(`/projeduzenle/${proje.id}`)}
                        variant="sari"
                        size="sm"
                        shape="none"
                        title="Projeyi düzenle"
                      >
                        Düzenle
                      </AppButton>

                      <AppButton
                        onClick={() => askDelete(proje)}
                        variant="kirmizi"
                        size="sm"
                        shape="none"
                        title="Projeyi sil"
                      >
                        Sil
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr className="border-b border-base-500">
                  <td colSpan={COL_COUNT} className="text-center text-muted-foreground py-10">
                    Gösterilecek proje bulunamadı.
                  </td>
                </tr>
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
            onClick={() => setPage(1)}
            disabled={data.page === 1}
            title="İlk sayfa"
          >
            « İlk
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!data.has_prev}
            title="Önceki sayfa"
          >
            ‹ Önceki
          </AppButton>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.pageNum.value, 10);
              if (!isNaN(val) && val >= 1 && val <= (data.total_pages || 1)) setPage(val);
            }}
            className="flex items-center gap-1"
          >
            <input
              type="number"
              name="pageNum"
              min={1}
              max={data.total_pages || 1}
              value={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) return setPage(1);
                setPage(Math.min(Math.max(1, val), (data.total_pages || 1)));
              }}
              className="input input-bordered input-sm w-16 text-center"
            />
            <span className="text-sm">/ {data.total_pages || 1}</span>
          </form>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            onClick={() => setPage(p => Math.min((data.total_pages || 1), p + 1))}
            disabled={!data.has_next}
            title="Sonraki sayfa"
          >
            Sonraki ›
          </AppButton>

          <AppButton
            variant="kurumsalmavii"
            size="sm"
            shape="none"
            onClick={() => setPage(data.total_pages || 1)}
            disabled={data.page === (data.total_pages || 1) || (data.total_pages || 1) <= 1}
            title="Son sayfa"
          >
            Son »
          </AppButton>
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

      {/* 🟦 Tekliflere Taşı modali */}
      <ConfirmDeleteModal
        open={moveOpen}
        onOpenChange={setMoveOpen}
        title="Projeyi Tekliflere Taşımaya Emin misiniz?"
        description={pendingMove ? `'${pendingMove.project_name}' projeden tekliflere taşınacak.` : ""}
        confirmText="Evet, Taşı"
        cancelText="Vazgeç"
        onConfirm={handleConfirmMove}
        loading={moving}
      />

      {/* 🟢 Müşteri seçimi modali */}
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

export default Projeler;
