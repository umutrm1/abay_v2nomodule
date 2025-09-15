// src/scenes/sistemler/DialogKumandaSec.jsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getKumandalarFromApi } from "@/redux/actions/actions_kumandalar.js";

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const LIMIT = 5;

const DialogKumandaSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getKumandalarFromApiReducer) || EMPTY_PAGE;

  // ÖNEMLİ: action obje bekliyor: { page, q, limit }
  const fetchPage = useCallback(
    (page, q) => dispatch(getKumandalarFromApi({ page, q, limit: LIMIT })),
    [dispatch]
  );

  return (
    <PagedSelectDialog
      title="Kumanda Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={data}
      fetchPage={fetchPage}
      columns={[
        { key: "kumanda_isim", label: "Kumanda İsmi" },
        { key: "kapasite",     label: "Kapasite" },
        { key: "price",        label: "Fiyat" },
      ]}
      onSelect={onSelect}
      searchPlaceholder="Kumanda ismi ile ara…"
    />
  );
};

export default DialogKumandaSec;
