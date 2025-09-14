// src/scenes/sistemler/SistemVaryantOlustur.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "@/components/mycomponents/Header";
import { getSistemlerFromApi, addSystemVariantToApi } from "@/redux/actions/actions_sistemler";

// Seçim diyalogları — PagedSelectDialog tabanlı (tutarlılık için düzen ekrandakiyle aynı katman)
import DialogProfilSec from "./DialogProfilSec";
import DialogCamSec from "./DialogCamSec";
import DialogMalzemeSec from "./DialogMalzemeSec";
import DialogKumandaSec from "./DialogKumandaSec";

// PDF ayar modalı (shadcn/ui dialog ile)
import DialogPdfAyar from "./DialogPdfAyar";

const SistemVaryantOlustur = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 0, total_pages: 1, has_next: false, has_prev: false };
  const systemsPage = useSelector(s => s.getSistemlerFromApiReducer) || EMPTY_PAGE;
  // Bazı eski reducer’larda direkt dizi gelebilir; her iki duruma da dayanıklı ol
  const systemItems = Array.isArray(systemsPage) ? systemsPage : (systemsPage.items || []);
  // Üst form
  const [selectedSystem, setSelectedSystem] = useState("");
  const [variantName, setVariantName] = useState("");

  // Tablolar
  const [profiles, setProfiles] = useState([]);
  const [glasses, setGlasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [remotes, setRemotes] = useState([]); // ✅ Kumandalar da oluşturma ekranında var

  // PDF modal state (tek modal, dört tabloya hizmet ediyor)
  const [openPdfDlg, setOpenPdfDlg] = useState(false);
  const [pdfTarget, setPdfTarget] = useState({ type: null, rowKey: null });
  const [pdfDraft, setPdfDraft] = useState(null);

  // Seçim dialogları (hangi satır düzenleniyor?)
  const [openProfileDlg, setOpenProfileDlg] = useState(false);
  const [editingProfileRowKey, setEditingProfileRowKey] = useState(null);

  const [openCamDlg, setOpenCamDlg] = useState(false);
  const [editingCamRowKey, setEditingCamRowKey] = useState(null);

  const [openMatDlg, setOpenMatDlg] = useState(false);
  const [editingMatRowKey, setEditingMatRowKey] = useState(null);

  const [openRemoteDlg, setOpenRemoteDlg] = useState(false);
  const [editingRemoteRowKey, setEditingRemoteRowKey] = useState(null);

  // Row key üretici (UI için stabil anahtar)
  const createRowKey = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // İlk yükleme: sistemleri çek
  useEffect(() => {
    dispatch(getSistemlerFromApi(1, "", "all"));
  }, [dispatch]);

  // --- Satır ekleme/çıkarma: default pdf hepsi true ---
  const defaultPdf = () => ({
    optimizasyonDetayliCiktisi: true,
    optimizasyonDetaysizCiktisi: true,
    siparisCiktisi: true,
    boyaCiktisi: true,
    profilAksesuarCiktisi: true,
    camCiktisi: true,
  });

  const addProfileRow = () =>
    setProfiles((ps) => [
      ...ps,
      {
        id: "", // DB id’si yok
        rowKey: createRowKey(),
        profile_id: "",
        profil_kodu: "",
        profil_isim: "",
        formula_cut_length: "",
        formula_cut_count: "",
        pdf: defaultPdf(),
      },
    ]);
  const removeProfileRow = (rowKey) =>
    setProfiles((ps) => ps.filter((r) => r.rowKey !== rowKey));

  const addGlassRow = () =>
    setGlasses((gs) => [
      ...gs,
      {
        id: "",
        rowKey: createRowKey(),
        glass_type_id: "",
        cam_isim: "",
        formula_width: "",
        formula_height: "",
        formula_count: "",
        pdf: defaultPdf(),
      },
    ]);
  const removeGlassRow = (rowKey) =>
    setGlasses((gs) => gs.filter((r) => r.rowKey !== rowKey));

  const addMaterialRow = () =>
    setMaterials((ms) => [
      ...ms,
      {
        id: Date.now(), // sadece UI
        rowKey: createRowKey(),
        material_id: "",
        diger_malzeme_isim: "",
        formula_quantity: "",
        formula_cut_length: "",
        pdf: defaultPdf(),
      },
    ]);
  const removeMaterialRow = (rowKey) =>
    setMaterials((ms) => ms.filter((r) => r.rowKey !== rowKey));

  const addRemoteRow = () =>
    setRemotes((rs) => [
      ...rs,
      {
        id: Date.now(), // sadece UI
        rowKey: createRowKey(),
        remote_id: "",
        kumanda_isim: "",
        pdf: defaultPdf(),
      },
    ]);
  const removeRemoteRow = (rowKey) =>
    setRemotes((rs) => rs.filter((r) => r.rowKey !== rowKey));

  // Yukarı/Aşağı taşı (ortak)
  const moveItem = (setArr, rowKey, dir) => {
    setArr((old) => {
      const idx = old.findIndex((r) => r.rowKey === rowKey);
      if (idx < 0) return old;
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= old.length) return old;
      const copy = [...old];
      [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
      return copy;
    });
  };

  // Seçim dialoglarını aç
  const openProfileDialog = (rowKey) => {
    setEditingProfileRowKey(rowKey);
    setOpenProfileDlg(true);
  };
  const openCamDialog = (rowKey) => {
    setEditingCamRowKey(rowKey);
    setOpenCamDlg(true);
  };
  const openMatDialog = (rowKey) => {
    setEditingMatRowKey(rowKey);
    setOpenMatDlg(true);
  };
  const openRemoteDialog = (rowKey) => {
    setEditingRemoteRowKey(rowKey);
    setOpenRemoteDlg(true);
  };

  // Kaydet — POST payload (oluşturma)
  const handleCreate = () => {
    const payload = {
      systemId: selectedSystem,
      name: variantName,
      profile_templates: profiles.map((r, idx) => ({
        profile_id: r.profile_id,
        formula_cut_length: r.formula_cut_length,
        formula_cut_count: r.formula_cut_count,
        order_index: idx,
        pdf: r.pdf, // ✅ PDF alanı
      })),
      glass_templates: glasses.map((r, idx) => ({
        glass_type_id: r.glass_type_id,
        formula_width: r.formula_width,
        formula_height: r.formula_height,
        formula_count: r.formula_count,
        order_index: idx,
        pdf: r.pdf, // ✅
      })),
      material_templates: materials.map((r, idx) => ({
        material_id: r.material_id,
        formula_quantity: r.formula_quantity,
        formula_cut_length: r.formula_cut_length,
        order_index: idx,
        pdf: r.pdf, // ✅
      })),
      remote_templates: remotes.map((r, idx) => ({
        remote_id: r.remote_id,
        order_index: idx,
        pdf: r.pdf, // ✅
      })),
    };

    // API çağrısı
    dispatch(addSystemVariantToApi(payload))
      .then(() => navigate("/sistemler"))
      .catch((err) => console.error("Varyant eklenirken hata:", err));
  };

  return (
    <div className="p-5 space-y-8">
      <Header title="Sistem Varyant Oluştur" />

      {/* Sistem ve Varyant İsmi */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Sistem:</label>
          <select
            className="select select-bordered"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
          >
            <option value="" disabled>
              — Bir sistem seçin —
            </option>
            {systemItems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold">Varyant İsmi:</label>
          <input
            type="text"
            placeholder="Varyant adı"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        </div>

        <button
          onClick={handleCreate}
          className="btn ml-auto bg-green-600 hover:bg-green-700 text-white"
          disabled={!selectedSystem || !variantName}
        >
          Kaydet
        </button>
      </div>

      {/* Profiller */}
      <Section
        title="Profiller"
        columns={["Profil Kodu", "Profil Adı", "Kesim Ölçüsü", "Kesim Adedi", "İşlemler"]}
        rows={profiles}
        addRow={addProfileRow}
        renderRow={(row) => [
          row.profil_kodu || "-",
          row.profil_isim || "-",
          <input
            key="cutlen"
            type="text"
            value={row.formula_cut_length}
            onChange={(e) =>
              setProfiles((ps) =>
                ps.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-24"
          />,
          <input
            key="cutcount"
            type="text"
            value={row.formula_cut_count}
            onChange={(e) =>
              setProfiles((ps) =>
                ps.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_cut_count: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-20"
          />,
          <div key="actions" className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => {
                setPdfTarget({ type: "profile", rowKey: row.rowKey });
                setPdfDraft(row.pdf);
                setOpenPdfDlg(true);
              }}
              className="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              PDF
            </button>
            <button
              onClick={() => moveItem(setProfiles, row.rowKey, "up")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Yukarı taşı"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(setProfiles, row.rowKey, "down")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Aşağı taşı"
            >
              ▼
            </button>
            <button
              onClick={() => openProfileDialog(row.rowKey)}
              className="btn btn-xs bg-green-500 hover:bg-green-600 text-white"
            >
              Seç
            </button>
            <button
              onClick={() => removeProfileRow(row.rowKey)}
              className="btn btn-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Kaldır
            </button>
          </div>,
        ]}
      />

      {/* Camlar */}
      <Section
        title="Camlar"
        columns={["Cam İsmi", "Genişlik Formülü", "Yükseklik Formülü", "Adet Formülü", "İşlemler"]}
        rows={glasses}
        addRow={addGlassRow}
        renderRow={(row) => [
          row.cam_isim || "-",
          <input
            key="w"
            type="text"
            value={row.formula_width}
            onChange={(e) =>
              setGlasses((gs) =>
                gs.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_width: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-20"
          />,
          <input
            key="h"
            type="text"
            value={row.formula_height}
            onChange={(e) =>
              setGlasses((gs) =>
                gs.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_height: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-20"
          />,
          <input
            key="c"
            type="text"
            value={row.formula_count}
            onChange={(e) =>
              setGlasses((gs) =>
                gs.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_count: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-16"
          />,
          <div key="actions" className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => {
                setPdfTarget({ type: "glass", rowKey: row.rowKey });
                setPdfDraft(row.pdf);
                setOpenPdfDlg(true);
              }}
              className="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              PDF
            </button>
            <button
              onClick={() => moveItem(setGlasses, row.rowKey, "up")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Yukarı taşı"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(setGlasses, row.rowKey, "down")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Aşağı taşı"
            >
              ▼
            </button>
            <button
              onClick={() => openCamDialog(row.rowKey)}
              className="btn btn-xs bg-green-500 hover:bg-green-600 text-white"
            >
              Seç
            </button>
            <button
              onClick={() => removeGlassRow(row.rowKey)}
              className="btn btn-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Kaldır
            </button>
          </div>,
        ]}
      />

      {/* Diğer Malzemeler */}
      <Section
        title="Diğer Malzemeler"
        columns={["Malzeme İsmi", "Adet Formülü", "Kesim Ölçüsü Formülü", "İşlemler"]}
        rows={materials}
        addRow={addMaterialRow}
        renderRow={(row) => [
          row.diger_malzeme_isim || "-",
          <input
            key="q"
            type="text"
            value={row.formula_quantity}
            onChange={(e) =>
              setMaterials((ms) =>
                ms.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_quantity: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-20"
          />,
          <input
            key="l"
            type="text"
            value={row.formula_cut_length}
            onChange={(e) =>
              setMaterials((ms) =>
                ms.map((r) =>
                  r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
                )
              )
            }
            className="input input-xs input-bordered w-24"
          />,
          <div key="actions" className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => {
                setPdfTarget({ type: "material", rowKey: row.rowKey });
                setPdfDraft(row.pdf);
                setOpenPdfDlg(true);
              }}
              className="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              PDF
            </button>
            <button
              onClick={() => moveItem(setMaterials, row.rowKey, "up")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Yukarı taşı"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(setMaterials, row.rowKey, "down")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Aşağı taşı"
            >
              ▼
            </button>
            <button
              onClick={() => openMatDialog(row.rowKey)}
              className="btn btn-xs bg-green-500 hover:bg-green-600 text-white"
            >
              Seç
            </button>
            <button
              onClick={() => removeMaterialRow(row.rowKey)}
              className="btn btn-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Kaldır
            </button>
          </div>,
        ]}
      />

      {/* ✅ Kumandalar */}
      <Section
        title="Kumandalar"
        addButtonLabel="Kumanda Ekle"
        columns={["Kumanda İsmi", "İşlemler"]}
        rows={remotes}
        addRow={addRemoteRow}
        renderRow={(row) => [
          row.kumanda_isim || "-",
          <div key="actions" className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => {
                setPdfTarget({ type: "remote", rowKey: row.rowKey });
                setPdfDraft(row.pdf);
                setOpenPdfDlg(true);
              }}
              className="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              PDF
            </button>
            <button
              onClick={() => moveItem(setRemotes, row.rowKey, "up")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Yukarı taşı"
            >
              ▲
            </button>
            <button
              onClick={() => moveItem(setRemotes, row.rowKey, "down")}
              className="btn btn-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Aşağı taşı"
            >
              ▼
            </button>
            <button
              onClick={() => openRemoteDialog(row.rowKey)}
              className="btn btn-xs bg-green-500 hover:bg-green-600 text-white"
            >
              Seç
            </button>
            <button
              onClick={() => removeRemoteRow(row.rowKey)}
              className="btn btn-xs bg-red-500 hover:bg-red-600 text-white"
            >
              Kaldır
            </button>
          </div>,
        ]}
      />

      {/* --- Seçim Dialogları (Paged) --- */}
      <DialogProfilSec
        open={openProfileDlg}
        onOpenChange={setOpenProfileDlg}
        onSelect={(item) => {
          setProfiles((ps) =>
            ps.map((r) =>
              r.rowKey === editingProfileRowKey
                ? {
                    ...r,
                    profile_id: item.id,
                    profil_kodu: item.profil_kodu,
                    profil_isim: item.profil_isim,
                  }
                : r
            )
          );
        }}
      />

      <DialogCamSec
        open={openCamDlg}
        onOpenChange={setOpenCamDlg}
        onSelect={(item) => {
          setGlasses((gs) =>
            gs.map((r) =>
              r.rowKey === editingCamRowKey
                ? { ...r, glass_type_id: item.id, cam_isim: item.cam_isim }
                : r
            )
          );
        }}
      />

      <DialogMalzemeSec
        open={openMatDlg}
        onOpenChange={setOpenMatDlg}
        onSelect={(item) => {
          setMaterials((ms) =>
            ms.map((r) =>
              r.rowKey === editingMatRowKey
                ? {
                    ...r,
                    material_id: item.id,
                    diger_malzeme_isim: item.diger_malzeme_isim,
                  }
                : r
            )
          );
        }}
      />

      <DialogKumandaSec
        open={openRemoteDlg}
        onOpenChange={setOpenRemoteDlg}
        onSelect={(item) => {
          setRemotes((rs) =>
            rs.map((r) =>
              r.rowKey === editingRemoteRowKey
                ? { ...r, remote_id: item.id, kumanda_isim: item.kumanda_isim }
                : r
            )
          );
        }}
      />

      {/* --- PDF Ayarları Modalı (ortak) --- */}
      <DialogPdfAyar
        open={openPdfDlg}
        onOpenChange={setOpenPdfDlg}
        initial={pdfDraft}
        onSave={(val) => {
          if (pdfTarget.type === "profile") {
            setProfiles((ps) =>
              ps.map((r) => (r.rowKey === pdfTarget.rowKey ? { ...r, pdf: { ...r.pdf, ...val } } : r))
            );
          } else if (pdfTarget.type === "glass") {
            setGlasses((gs) =>
              gs.map((r) => (r.rowKey === pdfTarget.rowKey ? { ...r, pdf: { ...r.pdf, ...val } } : r))
            );
          } else if (pdfTarget.type === "material") {
            setMaterials((ms) =>
              ms.map((r) => (r.rowKey === pdfTarget.rowKey ? { ...r, pdf: { ...r.pdf, ...val } } : r))
            );
          } else if (pdfTarget.type === "remote") {
            setRemotes((rs) =>
              rs.map((r) => (r.rowKey === pdfTarget.rowKey ? { ...r, pdf: { ...r.pdf, ...val } } : r))
            );
          }
        }}
      />
    </div>
  );
};

// Reusable Section — addButtonLabel opsiyonel
const Section = ({ title, columns, rows, addRow, renderRow, addButtonLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button
        onClick={addRow}
        className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
      >
        {addButtonLabel || `${title.replace(/lar$|ler$|lar$|ler$/i, "")} Ekle`}
      </button>
    </div>
    <div className="overflow-x-auto border rounded-lg">
      <table className="table w-full">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.rowKey}>
                {renderRow(row).map((cell, idx) => (
                  <td key={idx} className="align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-500 py-4">
                Veri bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default SistemVaryantOlustur;
