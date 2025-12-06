import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getDigerMalzemelerFromApi, addDigerMalzemeToApi } from "@/redux/actions/actions_diger_malzemeler.js";
import DialogDigerMalzemeEkle from "@/scenes/diger_malzemeler/DialogDigerMalzemeEkle.jsx";

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 5, total_pages: 1, has_next: false, has_prev: false };
const LIMIT = 5;

const DialogMalzemeSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getDigerMalzemelerFromApiReducer) || EMPTY_PAGE;
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // PagedSelectDialog, page & query ile bu fonksiyonu çağıracak
  const fetchPage = useCallback(
    (page, q) => dispatch(getDigerMalzemelerFromApi(page, q, LIMIT)),
    [dispatch]
  );

  // Dialog açıldığında ilk sayfayı otomatik yükle (boş arama ile)
  useEffect(() => {
    if (open) {
      fetchPage(1, "");
    }
  }, [open, fetchPage]);

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleSaveNewMalzeme = async (malzemeData) => {
    await dispatch(addDigerMalzemeToApi(malzemeData));
    setAddDialogOpen(false);
    // Refresh the list
    fetchPage(1, "");
  };

  return (
    <>
      <PagedSelectDialog
        title="Malzeme Seç"
        open={open}
        onOpenChange={onOpenChange}
        data={data}
        fetchPage={fetchPage}
        columns={[{ key: "diger_malzeme_isim", label: "Malzeme İsmi" }]}
        onSelect={onSelect}
        searchPlaceholder="Malzeme ismi ile ara…"
        onAddNew={handleAddNew}
        addButtonText="+ Malzeme Ekle"
      />
      <DialogDigerMalzemeEkle
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveNewMalzeme}
      />
    </>
  );
};

export default DialogMalzemeSec;
