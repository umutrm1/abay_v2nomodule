// src/scenes/musteriler/Musteriler.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getMusterilerFromApi,
  addMusteriToApi,
  editMusteriOnApi,
  deleteMusteriOnApi
} from "@/redux/actions/actions_musteriler.js";
import Header from '@/components/mycomponents/Header.jsx';
import DialogMusteriEkle from './DialogMusteriEkle.jsx';
import DialogMusteriDuzenle from './DialogMusteriDuzenle.jsx';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.jsx';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Backend sayfalama için boş obje
const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false
};

const Musteriler = () => {
  const dispatch = useDispatch();

  // Server-side dönen obje
  const data = useSelector(s => s.getMusterilerFromApiReducer) || EMPTY_PAGE;

  // UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);

  // Silme modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Listeyi çek (sayfa/arama değişince)
  useEffect(() => {
    setListLoading(true);
    Promise.resolve(dispatch(getMusterilerFromApi(page, search, 5)))
      .finally(() => setListLoading(false));
  }, [dispatch, page, search]);

  // Arama değişince 1. sayfaya dön
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // EKLE
  const handleAdd = useCallback(async (payload) => {
    await dispatch(addMusteriToApi(payload));
    await dispatch(getMusterilerFromApi(page, search, 5));
  }, [dispatch, page, search]);

  // DÜZENLE
  const handleEdit = useCallback(async (musteri) => {
    await dispatch(editMusteriOnApi(musteri.id, {
      company_name: musteri.company_name,
      name:        musteri.name,
      phone:       musteri.phone,
      city:        musteri.city
    }));
    await dispatch(getMusterilerFromApi(page, search, 5));
  }, [dispatch, page, search]);

  // SİL → modal aç
  const askDelete = (m) => {
    setPendingDelete(m);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await dispatch(deleteMusteriOnApi(pendingDelete.id));
      await dispatch(getMusterilerFromApi(page, search, 5));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Müşteriler" />

      <div className="bg-card w-full border border-border rounded-2xl p-5 flex flex-col gap-y-4 text-foreground">
        {/* Arama & Ekle — (tasarım korunur) */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Müşteri ismine göre ara..."
            value={search}
            onChange={onSearchChange}
            className="input input-bordered w-full md:w-1/2 lg:w-1/3"
          />
          <DialogMusteriEkle onSave={handleAdd} />
        </div>

        {/* Tablo */}
        <div className="flex-grow overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Şirket İsmi</th>
                <th>İsim</th>
                <th>Telefon</th>
                <th>Şehir</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>

            {listLoading ? (
              <tbody>
                <tr><td colSpan={5}><Spinner /></td></tr>
              </tbody>
            ) : (
              <tbody>
                {(data.items ?? []).length > 0 ? (
                  data.items.map(m => (
                    <tr key={m.id} className="hover">
                      <td className="font-bold">{m.company_name}</td>
                      <td>{m.name}</td>
                      <td>{m.phone}</td>
                      <td>{m.city}</td>
                      <td className="text-right space-x-2">
                        <DialogMusteriDuzenle musteri={m} onSave={handleEdit} />
                        <button
                          onClick={() => askDelete(m)}
                          className="btn btn-sm btn-outline btn-error"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-10">
                      Gösterilecek müşteri bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Sayfalama — boyalardakiyle aynı: İlk/Önceki/Input/Sonraki/Son + toplam */}
        <div className="flex justify-center items-center mt-4 px-4 gap-2 sm:gap-3">
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
              if (!isNaN(val) && val >= 1 && val <= data.total_pages) {
                setPage(val);
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
        title="Müşteriyi silmek istediğinize emin misiniz?"
        description={pendingDelete ? `'${pendingDelete.name}' silinecek. Bu işlem geri alınamaz.` : ""}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default Musteriler;
