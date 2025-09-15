import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getProfillerFromApi } from "@/redux/actions/actions_profiller.js";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogProfilSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getProfillerFromApiReducer) || EMPTY_PAGE;

  // 🔒 Sabit fonksiyon
  const fetchPage = useCallback((page, q) => dispatch(getProfillerFromApi(page, q, LIMIT)), [dispatch]);

  return (
    <PagedSelectDialog
      title="Profil Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={data}
      fetchPage={fetchPage}
      columns={[
        { key: "profil_kodu", label: "Profil Kodu" },
        { key: "profil_isim", label: "Profil Adı" },
      ]}
      onSelect={onSelect}
      searchPlaceholder="Profil kodu veya adı ile ara…"
    />
  );
};

export default DialogProfilSec;
