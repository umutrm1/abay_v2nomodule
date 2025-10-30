import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog.jsx";
import AppButton from "@/components/ui/AppButton.jsx";

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function insertAt(base, index, token) {
  const i = clamp(Number(index) || 0, 0, base.length);
  return base.slice(0, i) + token + base.slice(i);
}

// Boşluklar da dahil edilerek uzunluk sayımı
function countWithSpaces(str) {
  return (str ?? '').length; // boşluklar DAHİL
}

const ArrowStepper = ({ label, value, setValue, min = 0, max = 0, disabled = false }) => {
  const dec = () => !disabled && setValue(v => clamp((Number(v) || 0) - 1, min, max));
  const inc = () => !disabled && setValue(v => clamp((Number(v) || 0) + 1, min, max));
  const onChange = (e) => {
    if (disabled) return;
    const n = Number(e.target.value);
    if (Number.isNaN(n)) return;
    setValue(clamp(n, min, max));
  };

  return (
    <div className={`grid gap-2 ${disabled ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
        <label className="text-sm">{label}</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={dec} className="btn btn-outline btn-sm" disabled={disabled} title="Azalt">
            ▼
          </button>
          <button type="button" onClick={inc} className="btn btn-outline btn-sm" disabled={disabled} title="Arttır">
            ▲
          </button>
        </div>
        <input
          type="number"
          className="input input-bordered input-sm w-24 text-center"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

const PreviewLine = ({ title, value }) => (
  <div className="text-xs p-2 rounded-md border border-border bg-muted/30 font-mono break-all">
    <span className="opacity-70 mr-2">{title}:</span>
    <span>{value}</span>
  </div>
);

const DialogCamEkle = ({ onSave, children }) => {
  // 🔧 Form state
  const [form, setForm] = useState({
    cam_isim: '',
    thickness_mm: 1,      // 1: Tek Cam, 2: Çift Cam
    belirtec_1: 0,
    belirtec_2: 0
  });

const nameLen = (useMemo(() => countWithSpaces(form.cam_isim), [form.cam_isim])+5);
  // cam_isim değişince indeksleri clamp et
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      belirtec_1: clamp(Number(prev.belirtec_1) || 0, 0, nameLen),
      belirtec_2: clamp(Number(prev.belirtec_2) || 0, 0, nameLen)
    }));
  }, [nameLen]);

  // Tek cam ise belirtec_2'yi 0 tut
  useEffect(() => {
    if (Number(form.thickness_mm) !== 2 && Number(form.belirtec_2) !== 0) {
      setForm(prev => ({ ...prev, belirtec_2: 0 }));
    }
  }, [form.thickness_mm]);

  // Ortak input handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // ArrowStepper setterleri
  const setBel1 = (updater) =>
    setForm(prev => ({ ...prev, belirtec_1: typeof updater === 'function' ? updater(prev.belirtec_1) : updater }));
  const setBel2 = (updater) =>
    setForm(prev => ({ ...prev, belirtec_2: typeof updater === 'function' ? updater(prev.belirtec_2) : updater }));

  // 🔍 Önizlemeler
  const previewBoya1 = useMemo(() => {
    const base = form.cam_isim || '';
    return insertAt(base, form.belirtec_1, 'boya1');
  }, [form.cam_isim, form.belirtec_1]);

  const previewBoya12 = useMemo(() => {
    const base = form.cam_isim || '';
    const with1 = insertAt(base, form.belirtec_1, 'boya1');
    return insertAt(with1, form.belirtec_2, 'boya2');
  }, [form.cam_isim, form.belirtec_1, form.belirtec_2]);

  // Kaydet
  const handleSave = () => {
    const isDouble = Number(form.thickness_mm) === 2;
    onSave({
      cam_isim: form.cam_isim,
      thickness_mm: isDouble ? 2 : 1,
      belirtec_1: clamp(Number(form.belirtec_1) || 0, 0, nameLen),
      belirtec_2: isDouble ? clamp(Number(form.belirtec_2) || 0, 0, nameLen) : 0
    });
    // İstersen reset:
    // setForm({ cam_isim: '', thickness_mm: 1, belirtec_1: 0, belirtec_2: 0 });
  };

  const isDouble = Number(form.thickness_mm) === 2;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="ml-auto w-40"
            title="Yeni cam kaydı ekle"
          >
            + Cam Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Cam Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label htmlFor="cam_isim">Cam İsmi</label>
          <input
            id="cam_isim"
            name="cam_isim"
            value={form.cam_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label htmlFor="thickness_mm">Cam Türü</label>
          <select
            id="thickness_mm"
            name="thickness_mm"
            value={String(form.thickness_mm)}
            onChange={(e) =>
              setForm(prev => ({ ...prev, thickness_mm: Number(e.target.value) }))
            }
            className="select select-bordered"
          >
            <option value="1">Tek Cam</option>
            <option value="2">Çift Cam</option>
          </select>

          <div className="mt-2 p-3 rounded-xl border border-border bg-muted/30">
            <div className="font-semibold mb-2">Cam Boyası Belirteci</div>
            <p className="text-xs mb-3 opacity-80">
              Boya stringinin <em>cam_isim</em> içinde hangi indeks(ler)e ekleneceğini seçin.
              Geçerli aralık: <code>0</code> … <code>{nameLen}</code>
            </p>

            <div className="grid gap-3">
              <ArrowStepper
                label="1. Boya İndeksi (belirtec_1)"
                value={form.belirtec_1}
                setValue={setBel1}
                min={0}
                max={nameLen}
                disabled={false}
              />
              {/* 1. önizleme (sadece boya1) */}
              <PreviewLine title="Önizleme (boya1 uygulanmış)" value={previewBoya1} />

              <ArrowStepper
                label="2. Boya İndeksi (belirtec_2)"
                value={form.belirtec_2}
                setValue={setBel2}
                min={0}
                max={nameLen}
                disabled={!isDouble}
              />
              {/* 2. önizleme (boya1 + boya2) */}
              <PreviewLine
                title={`Önizleme (boya1${isDouble ? ' + boya2' : ''} uygulanmış)`}
                value={isDouble ? previewBoya12 : previewBoya1}
              />

              {!isDouble && (
                <div className="text-xs opacity-70">
                  Not: Tek Cam seçildiği için 2. belirteç gönderilmeyecek (0 kabul edilir).
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogClose asChild>
          <AppButton
            onClick={handleSave}
            variant="kurumsalmavi"
            size="md"
            shape="none"
            title="Kaydet ve kapat"
          >
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamEkle;
