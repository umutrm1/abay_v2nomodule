// src/scenes/sistemler/PagedSelectDialog.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Küçük debounce hook'u
const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const PagedSelectDialog = ({
  title,
  open,
  onOpenChange,
  data,               // { items, page, total_pages, has_next, has_prev, ... }
  fetchPage,          // (page, q) => Promise
  columns,            // [{ key, label }]
  onSelect,           // (item) => void
  searchPlaceholder,  // string
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 300);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🔒 fetchPage referansını sabitle
  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  }, [fetchPage]);

  // 🔁 Sadece open/page/debouncedSearch değişince çek
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    Promise.resolve(fetchRef.current(page, debouncedSearch))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, page, debouncedSearch]);

  // Arama → page’i 1’e çek
  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const totalPages = data.total_pages || 1;
  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  // Kapandığında local state’i sıfırla
  const handleOpenChange = (v) => {
    onOpenChange(v);
    if (!v) {
      setSearchTerm("");
      setPage(1);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Arama */}
          <input
            type="text"
            placeholder={searchPlaceholder || "Ara..."}
            value={searchTerm}
            onChange={onSearchChange}
            className="input input-bordered w-full"
          />

          {/* Tablo */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th className="text-right">Seç</th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <Spinner />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {(data.items ?? []).length > 0 ? (
                    data.items.map((item) => (
                      <tr key={item.id}>
                        {columns.map((c) => (
                          <td key={c.key}>{item[c.key]}</td>
                        ))}
                        <td className="text-right">
                          {/* Not: DialogClose kapanmayı tetikler */}
                          <DialogClose asChild>
                            <button
                              onClick={() => onSelect(item)}
                              className="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Seç
                            </button>
                          </DialogClose>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="text-center text-gray-500 py-4"
                      >
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* Sayfalama */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <button
              className="btn btn-sm"
              onClick={goFirst}
              disabled={(page || 1) === 1}
              title="İlk sayfa"
            >
              « İlk
            </button>
            <button
              className="btn btn-sm"
              onClick={goPrev}
              disabled={!data.has_prev || page <= 1}
              title="Önceki sayfa"
            >
              ‹ Önceki
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseInt(e.target.elements.pageNum.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setPage(val);
                }
              }}
              className="flex items-center gap-1"
            >
              {/* 👇 Artık controlled; defaultValue yerine value=page */}
              <input
                type="number"
                name="pageNum"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setPage(isNaN(val) ? 1 : Math.max(1, Math.min(totalPages, val)));
                }}
                className="input input-bordered input-sm w-16 text-center"
              />
              <span className="text-sm">/ {totalPages}</span>
            </form>

            <button
              className="btn btn-sm"
              onClick={goNext}
              disabled={!data.has_next || page >= totalPages}
              title="Sonraki sayfa"
            >
              Sonraki ›
            </button>
            <button
              className="btn btn-sm"
              onClick={goLast}
              disabled={page >= totalPages}
              title="Son sayfa"
            >
              Son »
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PagedSelectDialog;
