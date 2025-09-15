// src/components/dialogs/DialogCamRenkSec.jsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getGlassColorFromApi } from "@/redux/actions/actions_boyalar.js";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogCamRenkSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;

  const fetchPage = useCallback((page, q) => dispatch(getGlassColorFromApi(page, q, LIMIT)), [dispatch]);

  return (
    <PagedSelectDialog
      title="Cam Rengi Seç"
      open={open}
      onOpenChange={onOpenChange}
      data={Array.isArray(data) ? { ...EMPTY_PAGE, items: data } : data}
      fetchPage={fetchPage}
      columns={[
        { key: "name", label: "Renk Adı" },
        // API alanına göre istersen { key: "code", label: "Kod" } ekleyebilirsin
      ]}
      onSelect={onSelect}
      searchPlaceholder="Renk adına göre ara…"
    />
  );
};

export default DialogCamRenkSec;
