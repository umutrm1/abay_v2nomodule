// src/components/dialogs/DialogProfilRenkSec.jsx
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getProfileColorFromApi, addColorToApi } from "@/redux/actions/actions_boyalar.js";
import DialogProfilBoyaEkle from "@/scenes/boyalar/DialogProfilBoyaEkle.jsx";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogProfilRenkSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getProfileColorsFromApiReducer) || EMPTY_PAGE;
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchPage = useCallback((page, q) => dispatch(getProfileColorFromApi(page, q, LIMIT)), [dispatch]);

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleSaveNewColor = async (colorData) => {
    await dispatch(addColorToApi(colorData));
    setAddDialogOpen(false);
    // Refresh the list
    fetchPage(1, "");
  };

  return (
    <>
      <PagedSelectDialog
        title="Profil Rengi Seç"
        open={open}
        onOpenChange={onOpenChange}
        data={Array.isArray(data) ? { ...EMPTY_PAGE, items: data } : data}
        fetchPage={fetchPage}
        columns={[
          { key: "name", label: "Renk Adı" },
          // İstersen { key: "code", label: "Kod" } ekle
        ]}
        onSelect={onSelect}
        searchPlaceholder="Renk adına göre ara…"
        onAddNew={handleAddNew}
        addButtonText="+ Boya Ekle"
      />
      <DialogProfilBoyaEkle
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveNewColor}
      />
    </>
  );
};

export default DialogProfilRenkSec;
