import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PagedSelectDialog from "./PagedSelectDialog.jsx";
import { getCamlarFromApi, addCamToApi } from "@/redux/actions/actions_camlar.js";
import DialogCamEkle from "@/scenes/camlar/DialogCamEkle.jsx";

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

const DialogCamSec = ({ open, onOpenChange, onSelect }) => {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.getCamlarFromApiReducer) || EMPTY_PAGE;
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // PagedSelectDialog, page & query parametreleri ile bu fonksiyonu çağıracak
  const fetchPage = useCallback(
    (page, q) => dispatch(getCamlarFromApi(page, q, LIMIT)),
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

  const handleSaveNewCam = async (camData) => {
    await dispatch(addCamToApi(camData));
    setAddDialogOpen(false);
    // Refresh the list
    fetchPage(1, "");
  };

  return (
    <>
      <PagedSelectDialog
        title="Cam Seç"
        open={open}
        onOpenChange={onOpenChange}
        data={data}
        fetchPage={fetchPage}
        columns={[{ key: "cam_isim", label: "Cam İsmi" }]}
        onSelect={onSelect}
        searchPlaceholder="Cam ismi ile ara…"
        onAddNew={handleAddNew}
        addButtonText="+ Cam Ekle"
      />
      <DialogCamEkle
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveNewCam}
      />
    </>
  );
};

export default DialogCamSec;
