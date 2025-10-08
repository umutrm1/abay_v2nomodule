// src/scenes/sistemler/SistemVaryantDuzenle.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSystemFullVariantsOfSystemFromApi,
  editSystemVariantTemplatesOnApi
} from '@/redux/actions/actions_sistemler.js';
import DialogPdfAyar from "./DialogPdfAyar.jsx";
import Header from '@/components/mycomponents/Header.jsx';

// Seçim modalları
import DialogProfilSec from "./DialogProfilSec.jsx";
import DialogCamSec from "./DialogCamSec.jsx";
import DialogMalzemeSec from "./DialogMalzemeSec.jsx";
import DialogKumandaSec from "./DialogKumandaSec.jsx";
import DialogSystemVariantFoto from "./DialogSystemVariantFoto.jsx";

const SistemVaryantDuzenle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { variantId } = useParams();

  const seciliVaryant = useSelector(s => s.getSystemFullVariantsOfSystemFromApiReducer) || {};
  const [openVariantPhotoDlg, setOpenVariantPhotoDlg] = useState(false);
  const [openPdfDlg, setOpenPdfDlg] = useState(false);
  const [pdfTarget, setPdfTarget] = useState({ type: null, rowKey: null });
  const [pdfDraft, setPdfDraft] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [variantName, setVariantName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [glasses, setGlasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [remotes, setRemotes] = useState([]); // ✅ Kumandalar

  // --- Seçim dialogları open + düzenlenen satır id'si ---
  const [openProfileDlg, setOpenProfileDlg] = useState(false);
  const [editingProfileRowKey, setEditingProfileRowKey] = useState(null);

  const [openCamDlg, setOpenCamDlg] = useState(false);
  const [editingCamRowKey, setEditingCamRowKey] = useState(null);

  const [openMatDlg, setOpenMatDlg] = useState(false);
  const [editingMatRowKey, setEditingMatRowKey] = useState(null);

  const [openRemoteDlg, setOpenRemoteDlg] = useState(false); // ✅
  const [editingRemoteRowKey, setEditingRemoteRowKey] = useState(null);

  const createRowKey = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // İlk yükleme: varyantı getir
  useEffect(() => {
    dispatch(getSystemFullVariantsOfSystemFromApi(variantId));
  }, [dispatch, variantId]);

  // Varyant reducer değişince UI state doldur
  useEffect(() => {
    if (seciliVaryant?.id === variantId) {
      setSelectedSystem(seciliVaryant.system?.id ?? '');
      setVariantName(seciliVaryant.name || '');

      const sortedProfileTemplates = [...(seciliVaryant.profile_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setProfiles(sortedProfileTemplates.map(t => ({
        id: t.profile_id,
        rowKey: createRowKey(),
        profile_id: t.profile_id,
        profil_kodu: t.profile?.profil_kodu,
        profil_isim: t.profile?.profil_isim,
        formula_cut_length: t.formula_cut_length || '',
        formula_cut_count: t.formula_cut_count || '',
        is_painted: t.is_painted ?? false,
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: t.pdf?.camCiktisi ?? true,
        }
      })));

      const sortedGlassTemplates = [...(seciliVaryant.glass_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setGlasses(sortedGlassTemplates.map(t => ({
        id: t.glass_type_id,
        rowKey: createRowKey(),
        glass_type_id: t.glass_type_id,
        cam_isim: t.glass_type?.cam_isim,
        formula_width: t.formula_width || '',
        formula_height: t.formula_height || '',
        formula_count: t.formula_count || '',
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: t.pdf?.camCiktisi ?? true,
        }
      })));

      const sortedMaterialTemplates = [...(seciliVaryant.material_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setMaterials(sortedMaterialTemplates.map(t => {
        const isChunk = t.type === 'chunk_by_length';
        return {
          id: t.material_id,
          rowKey: createRowKey(),
          material_id: t.material_id,
          diger_malzeme_isim: t.material?.diger_malzeme_isim,
          formula_quantity: t.formula_quantity || '',
          formula_cut_length: t.formula_cut_length || '',
          chunk_enabled: isChunk,
          piece_length_mm: isChunk ? (t.piece_length_mm ?? '') : '',
          pdf: {
            optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
            optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
            siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
            boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
            profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
            camCiktisi: t.pdf?.camCiktisi ?? true,
          }
        };
      }));

      const sortedRemoteTemplates = [...(seciliVaryant.remote_templates || [])]
        .sort((a, b) => a.order_index - b.order_index);
      setRemotes(sortedRemoteTemplates.map(t => ({
        id: t.remote_id,
        rowKey: createRowKey(),
        remote_id: t.remote_id,
        kumanda_isim: t.remote?.kumanda_isim || '',
        pdf: {
          optimizasyonDetayliCiktisi: t.pdf?.optimizasyonDetayliCiktisi ?? true,
          optimizasyonDetaysizCiktisi: t.pdf?.optimizasyonDetaysizCiktisi ?? true,
          siparisCiktisi: t.pdf?.siparisCiktisi ?? true,
          boyaCiktisi: t.pdf?.boyaCiktisi ?? true,
          profilAksesuarCiktisi: t.pdf?.profilAksesuarCiktisi ?? true,
          camCiktisi: t.pdf?.camCiktisi ?? true,
        }
      })));
    }
  }, [seciliVaryant, variantId]);

  // Satır ekleme/çıkarma
  const addProfileRow = () => setProfiles(ps => [...ps, {
    id: '',
    rowKey: createRowKey(),
    profile_id: '', profil_kodu: '', profil_isim: '',
    formula_cut_length: '', formula_cut_count: '', is_painted: false,
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeProfileRow = rowKey => setProfiles(ps => ps.filter(r => r.rowKey !== rowKey));

  const addGlassRow = () => setGlasses(gs => [...gs, {
    id: '',
    rowKey: createRowKey(),
    glass_type_id: '', cam_isim: '',
    formula_width: '', formula_height: '', formula_count: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeGlassRow = rowKey => setGlasses(gs => gs.filter(r => r.rowKey !== rowKey));

  const addMaterialRow = () => setMaterials(ms => [...ms, {
    id: Date.now(),
    rowKey: createRowKey(),
    material_id: '',
    diger_malzeme_isim: '',
    formula_quantity: '',
    formula_cut_length: '',
    chunk_enabled: false,
    piece_length_mm: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeMaterialRow = rowKey => setMaterials(ms => ms.filter(r => r.rowKey !== rowKey));

  // ✅ Kumanda satırları
  const addRemoteRow = () => setRemotes(rs => [...rs, {
    id: Date.now(), remote_id: '', rowKey: createRowKey(), kumanda_isim: '',
    pdf: {
      optimizasyonDetayliCiktisi: true,
      optimizasyonDetaysizCiktisi: true,
      siparisCiktisi: true,
      boyaCiktisi: true,
      profilAksesuarCiktisi: true,
      camCiktisi: true,
    }
  }]);
  const removeRemoteRow = rowKey => setRemotes(rs => rs.filter(r => r.rowKey !== rowKey));

  // Yukarı/Aşağı taşı (ortak)
  const moveItem = (arr, setArr, rowKey, dir) => {
    setArr(old => {
      const idx = old.findIndex(r => r.rowKey === rowKey);
      if (idx < 0) return old;
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= old.length) return old;
      const copy = [...old];
      [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
      return copy;
    });
  };
  const moveProfileUp = rowKey => moveItem(profiles, setProfiles, rowKey, 'up');
  const moveProfileDown = rowKey => moveItem(profiles, setProfiles, rowKey, 'down');
  const moveCamUp = rowKey => moveItem(glasses, setGlasses, rowKey, 'up');
  const moveCamDown = rowKey => moveItem(glasses, setGlasses, rowKey, 'down');
  const moveMatUp = rowKey => moveItem(materials, setMaterials, rowKey, 'up');
  const moveMatDown = rowKey => moveItem(materials, setMaterials, rowKey, 'down');
  const moveRemoteUp = rowKey => moveItem(remotes, setRemotes, rowKey, 'up');
  const moveRemoteDown = rowKey => moveItem(remotes, setRemotes, rowKey, 'down');

  // --- Seçim dialoglarını aç ---
  const openProfileDialog = (rowKey) => { setEditingProfileRowKey(rowKey); setOpenProfileDlg(true); };
  const openCamDialog = (rowKey) => { setEditingCamRowKey(rowKey); setOpenCamDlg(true); };
  const openMatDialog = (rowKey) => { setEditingMatRowKey(rowKey); setOpenMatDlg(true); };
  const openRemoteDialog = (rowKey) => { setEditingRemoteRowKey(rowKey); setOpenRemoteDlg(true); };

  // --- Kaydet (PUT payload) ---
  const handleSave = () => {
    const payload = {
      name: variantName,
      profile_templates: profiles.map((r, idx) => ({
        profile_id: r.profile_id,
        formula_cut_length: r.formula_cut_length,
        formula_cut_count: r.formula_cut_count,
        order_index: idx,
        is_painted: r.is_painted,
        pdf: r.pdf
      })),
      glass_templates: glasses.map((r, idx) => ({
        glass_type_id: r.glass_type_id,
        formula_width: r.formula_width,
        formula_height: r.formula_height,
        formula_count: r.formula_count,
        order_index: idx,
        pdf: r.pdf
      })),
      material_templates: materials.map((r, idx) => ({
        material_id: r.material_id,
        formula_quantity: r.chunk_enabled ? '0' : r.formula_quantity,
        formula_cut_length: r.formula_cut_length,
        type: r.chunk_enabled ? 'chunk_by_length' : 'none',
        piece_length_mm: r.chunk_enabled ? (Number(r.piece_length_mm) || 0) : 0,
        order_index: idx,
        pdf: r.pdf
      })),
      remote_templates: remotes.map((r, idx) => ({
        remote_id: r.remote_id,
        order_index: idx,
        pdf: r.pdf
      }))
    };

    dispatch(editSystemVariantTemplatesOnApi(variantId, payload))
      .then(() => navigate('/sistemler'))
      .catch(err => console.error('Düzenlerken hata:', err));
  };

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen bg-background text-foreground">
      <Header title="Sistem Varyant Düzenle" />

      <div className="bg-card border border-border rounded-2xl p-5 space-y-8">
        {/* Sistem ve Varyant İsmi */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sistem:</label>
            <select className="select select-bordered" value={selectedSystem} disabled>
              <option>{seciliVaryant.system?.name || '-'}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Varyant İsmi:</label>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={variantName}
              onChange={e => setVariantName(e.target.value)}
            />
          </div>

          <button
            onClick={() => setOpenVariantPhotoDlg(true)}
            className="btn btn-secondary ml-5"
          >
            Fotoğraf
          </button>

          <button
            onClick={handleSave}
            className="btn btn-success ml-auto"
            disabled={!variantName}
          >
            Kaydet
          </button>
        </div>

        {/* Profiller */}
        <Section
          title="Profiller"
          columns={['Profil Kodu', 'Profil Adı', 'Kesim Ölçüsü', 'Kesim Adedi', 'Boyanacak mı?', 'İşlemler']}
          rows={profiles}
          addRow={addProfileRow}
          renderRow={row => [
            row.profil_kodu || '-',
            row.profil_isim || '-',
            <input
              key="cutlen"
              type="text"
              value={row.formula_cut_length}
              onChange={e => setProfiles(ps => ps.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-24"
            />,
            <input
              key="cutcount"
              type="text"
              value={row.formula_cut_count}
              onChange={e => setProfiles(ps => ps.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_count: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-20"
            />,
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Evet/Hayır</span>
              <input
                type="checkbox"
                checked={row.is_painted}
                onChange={e => setProfiles(ps => ps.map(r =>
                  r.rowKey === row.rowKey ? { ...r, is_painted: e.target.checked } : r
                ))}
                className="checkbox checkbox-sm"
              />
            </div>,
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <button
                onClick={() => {
                  setPdfTarget({ type: 'profile', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
                className="btn btn-xs btn-primary"
              >
                PDF
              </button>
              <button onClick={() => moveProfileUp(row.rowKey)} className="btn btn-xs" title="Yukarı taşı">▲</button>
              <button onClick={() => moveProfileDown(row.rowKey)} className="btn btn-xs" title="Aşağı taşı">▼</button>
              <button onClick={() => openProfileDialog(row.rowKey)} className="btn btn-xs btn-success">Seç</button>
              <button onClick={() => removeProfileRow(row.rowKey)} className="btn btn-xs btn-error">Kaldır</button>
            </div>
          ]}
        />

        {/* Camlar */}
        <Section
          title="Camlar"
          columns={['Cam İsmi', 'Genişlik Formülü', 'Yükseklik Formülü', 'Adet Formülü', 'İşlemler']}
          rows={glasses}
          addRow={addGlassRow}
          renderRow={row => [
            row.cam_isim || '-',
            <input
              key="w"
              type="text"
              value={row.formula_width}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_width: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-20"
            />,
            <input
              key="h"
              type="text"
              value={row.formula_height}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_height: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-20"
            />,
            <input
              key="c"
              type="text"
              value={row.formula_count}
              onChange={e => setGlasses(gs => gs.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_count: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-16"
            />,
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <button
                onClick={() => {
                  setPdfTarget({ type: 'glass', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
                className="btn btn-xs btn-primary"
              >
                PDF
              </button>
              <button onClick={() => moveCamUp(row.rowKey)} className="btn btn-xs" title="Yukarı taşı">▲</button>
              <button onClick={() => moveCamDown(row.rowKey)} className="btn btn-xs" title="Aşağı taşı">▼</button>
              <button onClick={() => openCamDialog(row.rowKey)} className="btn btn-xs btn-success">Seç</button>
              <button onClick={() => removeGlassRow(row.rowKey)} className="btn btn-xs btn-error">Kaldır</button>
            </div>
          ]}
        />

        {/* Diğer Malzemeler */}
        <Section
          title="Diğer Malzemeler"
          columns={['Malzeme İsmi', 'Adet Formülü', 'Kesim Ölçüsü Formülü', 'Sayıya Tamamla', 'İşlemler']}
          rows={materials}
          addRow={addMaterialRow}
          renderRow={row => [
            row.diger_malzeme_isim || '-',

            row.chunk_enabled ? (
              <div key="q" className="text-xs italic text-muted-foreground">
                Sayıya Tamamla aktif → Kesim adedi payload’da 0 gider
              </div>
            ) : (
              <input
                key="q"
                type="text"
                value={row.formula_quantity}
                onChange={e => setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey ? { ...r, formula_quantity: e.target.value } : r
                ))}
                className="input input-xs input-bordered w-24"
              />
            ),

            <input
              key="l"
              type="text"
              value={row.formula_cut_length}
              onChange={e => setMaterials(ms => ms.map(r =>
                r.rowKey === row.rowKey ? { ...r, formula_cut_length: e.target.value } : r
              ))}
              className="input input-xs input-bordered w-28"
            />,

            <input
              key="piece"
              type="number"
              min={0}
              step={1}
              placeholder="mm"
              value={row.piece_length_mm}
              onChange={e => {
                const val = e.target.value;
                setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey ? { ...r, piece_length_mm: val } : r
                ));
              }}
              disabled={!row.chunk_enabled}
              className="input input-xs input-bordered w-24"
              title={row.chunk_enabled ? 'Parça uzunluğu (mm)' : 'Önce Sayıya Tamamla’yı açın'}
            />,

            <div key="actions" className="flex justify-center flex-wrap gap-2">
              {/* Sayıya Tamamla toggle */}
              <button
                onClick={() => setMaterials(ms => ms.map(r =>
                  r.rowKey === row.rowKey
                    ? { ...r, chunk_enabled: !r.chunk_enabled }
                    : r
                ))}
                className={`btn btn-xs ${row.chunk_enabled ? 'btn-success' : 'btn-outline'}`}
                title="Sayıya Tamamla"
              >
                {row.chunk_enabled ? '✅' : '☐'}&nbsp;Sayıya Tamamla
              </button>

              <button
                onClick={() => {
                  setPdfTarget({ type: 'material', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
                className="btn btn-xs btn-primary"
              >
                PDF
              </button>
              <button onClick={() => moveMatUp(row.rowKey)} className="btn btn-xs" title="Yukarı taşı">▲</button>
              <button onClick={() => moveMatDown(row.rowKey)} className="btn btn-xs" title="Aşağı taşı">▼</button>
              <button onClick={() => openMatDialog(row.rowKey)} className="btn btn-xs btn-success">Seç</button>
              <button onClick={() => removeMaterialRow(row.rowKey)} className="btn btn-xs btn-error">Kaldır</button>
            </div>
          ]}
        />

        {/* ✅ Kumandalar */}
        <Section
          title="Kumandalar"
          addButtonLabel="Kumanda Ekle"
          columns={['Kumanda İsmi', 'İşlemler']}
          rows={remotes}
          addRow={addRemoteRow}
          renderRow={row => [
            row.kumanda_isim || '-',
            <div key="actions" className="flex justify-center flex-wrap gap-2">
              <button
                onClick={() => {
                  setPdfTarget({ type: 'remote', rowKey: row.rowKey });
                  setPdfDraft(row.pdf);
                  setOpenPdfDlg(true);
                }}
                className="btn btn-xs btn-primary"
              >
                PDF
              </button>
              <button onClick={() => moveRemoteUp(row.rowKey)} className="btn btn-xs" title="Yukarı taşı">▲</button>
              <button onClick={() => moveRemoteDown(row.rowKey)} className="btn btn-xs" title="Aşağı taşı">▼</button>
              <button onClick={() => openRemoteDialog(row.rowKey)} className="btn btn-xs btn-success">Seç</button>
              <button onClick={() => removeRemoteRow(row.rowKey)} className="btn btn-xs btn-error">Kaldır</button>
            </div>
          ]}
        />

        {/* --- Seçim Dialogları --- */}
        <DialogProfilSec
          open={openProfileDlg}
          onOpenChange={setOpenProfileDlg}
          onSelect={(item) => {
            setProfiles(ps => ps.map(r =>
              r.rowKey === editingProfileRowKey
                ? { ...r, profile_id: item.id, profil_kodu: item.profil_kodu, profil_isim: item.profil_isim }
                : r
            ));
          }}
        />

        <DialogCamSec
          open={openCamDlg}
          onOpenChange={setOpenCamDlg}
          onSelect={(item) => {
            setGlasses(gs => gs.map(r =>
              r.rowKey === editingCamRowKey
                ? { ...r, glass_type_id: item.id, cam_isim: item.cam_isim }
                : r
            ));
          }}
        />

        <DialogMalzemeSec
          open={openMatDlg}
          onOpenChange={setOpenMatDlg}
          onSelect={(item) => {
            setMaterials(ms => ms.map(r =>
              r.rowKey === editingMatRowKey
                ? { ...r, material_id: item.id, diger_malzeme_isim: item.diger_malzeme_isim }
                : r
            ));
          }}
        />

        <DialogKumandaSec
          open={openRemoteDlg}
          onOpenChange={setOpenRemoteDlg}
          onSelect={(item) => {
            setRemotes(rs => rs.map(r =>
              r.rowKey === editingRemoteRowKey
                ? { ...r, remote_id: item.id, kumanda_isim: item.kumanda_isim }
                : r
            ));
          }}
        />

        <DialogPdfAyar
          open={openPdfDlg}
          onOpenChange={setOpenPdfDlg}
          initial={pdfDraft}
          onSave={(val) => {
            if (pdfTarget.type === 'profile') {
              setProfiles(ps => ps.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            } else if (pdfTarget.type === 'glass') {
              setGlasses(gs => gs.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            } else if (pdfTarget.type === 'material') {
              setMaterials(ms => ms.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            } else if (pdfTarget.type === 'remote') {
              setRemotes(rs => rs.map(r => r.rowKey === pdfTarget.rowKey ? ({ ...r, pdf: { ...r.pdf, ...val } }) : r));
            }
          }}
        />

        <DialogSystemVariantFoto
          open={openVariantPhotoDlg}
          onOpenChange={setOpenVariantPhotoDlg}
          variantId={variantId}
        />
      </div>
    </div>
  );
};

// Reusable Section — addButtonLabel opsiyonel
const Section = ({ title, columns, rows, addRow, renderRow, addButtonLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={addRow} className="btn btn-sm btn-primary">
        {addButtonLabel ?? `${title.slice(0, -1)} Ekle`}
      </button>
    </div>
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="table w-full">
        <thead>
          <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length > 0
            ? rows.map(r => (
              <tr key={r.rowKey} className="hover:bg-muted/40">
                {renderRow(r).map((cell, i) => <td key={i} className="align-top">{cell}</td>)}
              </tr>
            ))
            : <tr>
              <td colSpan={columns.length} className="text-center text-muted-foreground py-4">
                Veri bulunamadı
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
);

export default SistemVaryantDuzenle;
