// src/scenes/kumandalar/Kumandalar.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getKumandalarFromApi, addKumandaToApi, editKumandaOnApi, deleteKumandaOnApi } from "@/redux/actions/actions_kumandalar";
import Header from "@/components/mycomponents/Header";
import AppButton from "@/components/ui/AppButton";
import { useModal } from "@/shared/modals/ModalProvider";
import { useConfirm } from "@/shared/modals/ConfirmProvider";

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

const Kumandalar = () => {
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const confirm = useConfirm();

  const data = useSelector((state: any) => state.getKumandalarFromApiReducer) || EMPTY_PAGE;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));

    dispatch(
      getKumandalarFromApi({
        q: searchTerm,
        limit: safeLimit,
        page: currentPage,
      })
    ).finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [dispatch, currentPage, searchTerm, limit]);

  const onSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const onLimitChange = (e: any) => {
    const raw = parseInt(e.target.value, 10);
    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
    setLimit(clamped);
    setCurrentPage(1);
  };

  const refetch = useCallback(async () => {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    await dispatch(
      getKumandalarFromApi({
        q: searchTerm,
        limit: safeLimit,
        page: currentPage,
      })
    );
  }, [dispatch, searchTerm, limit, currentPage]);

  const handleAdd = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(addKumandaToApi(row));
        await refetch();
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, refetch]
  );

  const handleEdit = useCallback(
    async (row: any) => {
      setIsLoading(true);
      try {
        await dispatch(
          editKumandaOnApi(row.id, {
            kumanda_isim: row.kumanda_isim,
            price: row.price,
            kapasite: row.kapasite,
          })
        );
        await refetch();
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, refetch]
  );

  const openCreate = () => {
    openModal("kumanda.upsert", {
      mode: "create",
      onSave: async (payload: any) => {
        await handleAdd(payload);
      },
    });
  };

  const openEdit = (kumanda: any) => {
    openModal("kumanda.upsert", {
      mode: "edit",
      kumanda,
      onSave: async (payload: any) => {
        await handleEdit(payload);
      },
    });
  };

  const askDelete = async (item: any) => {
    if (!item?.id) return;
    if (deletingId != null) return;

    const ok = await confirm({
      title: "Silmek istediğinize emin misiniz?",
      description: `'${item.kumanda_isim}' silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Evet, sil",
      cancelText: "Vazgeç",
      confirmVariant: "kirmizi",
    });

    if (!ok) return;

    try {
      setDeletingId(item.id);
      await dispatch(deleteKumandaOnApi(item.id));
      await refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = data.total_pages || 1;
  const items = data.items ?? [];

  return (
    <div className="grid grid-rows-[60px_1fr]">
      <Header title="Kumandalar" />

      <div className="bg-card w-full border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-y-4 text-foreground">
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          <div className="w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Kumanda adına göre ara..."
              value={searchTerm}
              onChange={onSearchChange}
              className="input input-bordered w-full text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto md:ml-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm opacity-80 whitespace-nowrap">Kumanda Sayısı</label>
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

            <div className="w-full sm:w-auto sm:ml-auto">
              <AppButton variant="kurumsalmavi" size="mdtxtlg" className="w-full sm:w-auto" onClick={openCreate}>
                + Kumanda Ekle
              </AppButton>
            </div>
          </div>
        </div>

        <div className="hidden md:block flex-grow overflow-x-auto">
          <table className="table w-full border border-gray-500 rounded-lg">
            <thead>
              <tr className="border border-gray-500">
                <th>Kumanda Adı</th>
                <th>Fiyat</th>
                <th>Kapasite</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr className="border border-gray-500">
                  <td colSpan={4}>
                    <Spinner />
                  </td>
                </tr>
              </tbody>
            ) : items.length > 0 ? (
              <tbody>
                {items.map((k: any) => {
                  const isDeleting = deletingId === k.id;
                  return (
                    <tr key={k.id} className="border border-gray-500">
                      <td className="font-bold">{k.kumanda_isim}</td>
                      <td>{k.price}</td>
                      <td>{k.kapasite}</td>
                      <td className="text-center space-x-2">
                        <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit(k)}>
                          Düzenle
                        </AppButton>

                        <AppButton
                          onClick={() => askDelete(k)}
                          variant="kirmizi"
                          size="sm"
                          shape="none"
                          disabled={isDeleting}
                          loading={isDeleting}
                        >
                          Sil
                        </AppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4} className="border border-gray-500 text-center text-muted-foreground py-10">
                    Gösterilecek kumanda bulunamadı.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <Spinner />
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((k: any) => {
                const isDeleting = deletingId === k.id;
                return (
                  <div
                    key={k.id}
                    className="bg-background/60 border border-border rounded-xl p-3 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold text-sm">{k.kumanda_isim || "-"}</div>
                        <div className="text-xs text-muted-foreground">Kapasite: {k.kapasite ?? "—"}</div>
                      </div>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/70 text-[11px]">
                        {k.price ?? "Fiyat yok"}
                      </span>
                    </div>

                    <div className="flex justify-between items-end gap-3 text-sm">
                      <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground mb-0.5">Fiyat</span>
                        <span className="font-medium text-sm">{k.price ?? "—"}</span>
                      </div>

                      <div className="flex gap-2">
                        <AppButton variant="sari" size="sm" shape="none" onClick={() => openEdit(k)}>
                          Düzenle
                        </AppButton>
                        <AppButton
                          variant="kirmizi"
                          size="sm"
                          shape="none"
                          onClick={() => askDelete(k)}
                          disabled={isDeleting}
                          loading={isDeleting}
                        >
                          Sil
                        </AppButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 text-sm">Gösterilecek kumanda bulunamadı.</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-3 mt-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              onClick={() => setCurrentPage(1)}
              disabled={data.page === 1}
            >
              « İlk
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={!data.has_prev}
            >
              ‹ Önceki
            </AppButton>

            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                const val = parseInt(e.currentTarget.elements.pageNum.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) setCurrentPage(val);
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!data.has_next}
            >
              Sonraki ›
            </AppButton>

            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              onClick={() => setCurrentPage(totalPages)}
              disabled={data.page === totalPages || totalPages <= 1}
            >
              Son »
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kumandalar;
