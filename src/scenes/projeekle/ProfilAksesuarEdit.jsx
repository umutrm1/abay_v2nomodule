// src/scenes/projeekle/ProfilAksesuarEdit.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/mycomponents/Header.jsx";
import * as actions_projeler from "@/redux/actions/actions_projeler.js";
import { getProfilImageFromApi } from "@/redux/actions/actions_profiller.js";
import { getPdfBrandByKey, getPdfTitleByKey } from "@/redux/actions/actionsPdf.js";
import { generateProfileAccessoryPdf } from "./pdf/pdfProfileAccessory.js";
import optimizasyonYap from "@/scenes/optimizasyon/optimizasyon.js";

// Tema uyumlu spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function ProfilAksesuarEdit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const mode = sp.get("mode"); // "press" | "painted" | null

  const [loading, setLoading] = useState(false);

  const proje = useSelector((s) => s.getProjeFromApiReducer) || null;
  const requirements = useSelector((s) => s.getProjeRequirementsFromApiReducer) || {
    systems: [],
    extra_requirements: [],
    extra_profiles: [],
    extra_glasses: [],
  };

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ toplam: 0, kdv: 0, genelToplam: 0 });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await dispatch(actions_projeler.getProjeFromApi(id));
        await dispatch(actions_projeler.getProjeRequirementsFromApi(id));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dispatch, id]);

  function pdfAllow(obj, fallbackKey = "profilAksesuarCiktisi") {
    const pdf = obj?.pdf || {};
    if (typeof pdf.pdfProfileAccessory === "boolean") return pdf.pdfProfileAccessory === true;
    return pdf?.[fallbackKey] === true;
  }
  function safeIndex(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 999999;
  }
  const round2 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100) / 100;
  };

  function buildRemotePlanRowsFromRequirements(requirements) {
    // systems.remotes → sadece pdfAllow(remote) olanlar
    const filteredSystems = (requirements?.systems || []).map((sys) => ({
      ...sys,
      remotes: (sys?.remotes || []).filter((r) => pdfAllow(r)),
    }));

    const totalQty = filteredSystems.reduce((sum, s) => {
      const q = Number(s?.quantity || 0);
      return sum + (Number.isFinite(q) && q > 0 ? q : 0);
    }, 0);

    // kapasite → en ucuz & min(order_index)
    const capacityMap = new Map();
    filteredSystems.forEach((sys) => {
      (sys.remotes || []).forEach((r) => {
        if (r?.pdf?.profilAksesuarCiktisi === false) return;
        const cap = Number(r?.remote?.kapasite ?? r?.kapasite ?? 0);
        if (!Number.isFinite(cap) || cap <= 0) return;
        const name = r?.remote?.kumanda_isim ? String(r.remote.kumanda_isim) : "Kumanda";
        const unitPrice = Number(r?.remote?.price ?? 0);
        const oi = safeIndex(r?.order_index);
        const prev = capacityMap.get(cap);
        if (!prev || unitPrice < prev.unitPrice) {
          capacityMap.set(cap, { name, unitPrice, minOrderIndex: oi });
        } else if (prev && oi < prev.minOrderIndex) {
          prev.minOrderIndex = oi;
        }
      });
    });

    const caps = Array.from(capacityMap.keys());
    const remotePlan = [];

    if (totalQty > 0 && caps.length > 0) {
      let remaining = totalQty;

      if (capacityMap.has(15)) {
        const use15 = Math.floor(remaining / 15);
        if (use15 > 0) {
          const info15 = capacityMap.get(15);
          remotePlan.push({ cap: 15, count: use15, name: info15.name, unitPrice: info15.unitPrice, orderIndex: info15.minOrderIndex });
          remaining -= use15 * 15;
        }
      }
      if (remaining > 5 && capacityMap.has(9)) {
        const info9 = capacityMap.get(9);
        remotePlan.push({ cap: 9, count: 1, name: info9.name, unitPrice: info9.unitPrice, orderIndex: info9.minOrderIndex });
        remaining -= 9;
      }
      if (remaining > 1 && capacityMap.has(5)) {
        const info5 = capacityMap.get(5);
        remotePlan.push({ cap: 5, count: 1, name: info5.name, unitPrice: info5.unitPrice, orderIndex: info5.minOrderIndex });
        remaining -= 5;
      }

      if (remaining > 0) {
        if (capacityMap.has(1)) {
          const info1 = capacityMap.get(1);
          remotePlan.push({ cap: 1, count: remaining, name: info1.name, unitPrice: info1.unitPrice, orderIndex: info1.minOrderIndex });
          remaining = 0;
        } else {
          const capsAsc = [...caps].sort((a, b) => a - b);
          const coverCap = capsAsc.find((c) => c >= remaining) ?? capsAsc[0];
          const ic = capacityMap.get(coverCap);
          remotePlan.push({
            cap: coverCap,
            count: 1,
            name: ic.name,
            unitPrice: ic.unitPrice,
            orderIndex: ic.minOrderIndex,
          });
          remaining = 0;
        }
      }
    }

    const rows = [];
    remotePlan.forEach((it) => {
      if (!it.count) return;
      const adet = round2(it.count);
      const birimFiyat = round2(it.unitPrice || 0);
      const toplamFiyat = round2(adet * birimFiyat);
      rows.push({
        lineType: "remote",
        kod: "",
        ad: it.name,
        adet,
        boy_m: "",
        birimKg: "",
        toplamKg: "",
        birimFiyat,
        toplamFiyat,
        imageData: null,
        orderIndex: safeIndex(it.orderIndex),
      });
    });

    (requirements?.extra_remotes || [])
      .filter((er) => pdfAllow(er) && Number(er?.count || 0) > 0)
      .forEach((er) => {
        const adet = round2(er.count || 0);
        const name = er?.remote?.kumanda_isim ? String(er.remote.kumanda_isim) : er?.name || "Kumanda";
        const birimFiyat = round2(er?.remote?.unit_price ?? er?.unit_price ?? er?.remote?.price ?? 0);
        const toplamFiyat = round2(adet * birimFiyat);
        rows.push({
          lineType: "remote",
          kod: "",
          ad: name,
          adet,
          boy_m: "",
          birimKg: "",
          toplamKg: "",
          birimFiyat,
          toplamFiyat,
          imageData: null,
          orderIndex: safeIndex(er?.order_index),
        });
      });

    rows.sort((a, b) => safeIndex(a.orderIndex) - safeIndex(b.orderIndex));
    return rows;
  }

  function buildSiparisFromRequirements(requirements, filterFn) {
    const systems = requirements?.systems || [];
    const profiller = [];
    systems.forEach((sys) => {
      (sys.profiles || [])
        .filter((p) => pdfAllow(p))
        .filter((p) => (typeof filterFn === "function" ? filterFn(p) : true))
        .forEach((p) => {
          profiller.push({
            profil_id: p.profile_id,
            profil: {
              profil_isim: p.profile?.profil_isim,
              boy_uzunluk: p.profile?.boy_uzunluk,
              birim_agirlik: p.profile?.birim_agirlik,
            },
            hesaplanan_degerler: {
              kesim_olcusu: p.cut_length_mm,
              kesim_adedi: p.cut_count,
            },
          });
        });
    });
    return { urunler: [{ hesaplananGereksinimler: { profiller } }] };
  }

  function mapOptResultsByKey(optSonuclar, paintedKey) {
    const m = new Map();
    (optSonuclar || []).forEach((r) => {
      const pid = r?.profilId;
      const adet = Number(r?.toplamBoySayisi || 0);
      if (pid != null) m.set(`${pid}|${paintedKey}`, adet);
    });
    return m;
  }

  useEffect(() => {
    if (!requirements) return;

    let adetMap = new Map();
    try {
      if (mode === "painted") {
        const siparisP1 = buildSiparisFromRequirements(requirements, (p) => p?.is_painted === true);
        const siparisP0 = buildSiparisFromRequirements(requirements, (p) => p?.is_painted !== true);
        const optP1 = optimizasyonYap(siparisP1) || [];
        const optP0 = optimizasyonYap(siparisP0) || [];
        const m1 = mapOptResultsByKey(optP1, "P1");
        const m0 = mapOptResultsByKey(optP0, "P0");
        adetMap = new Map([...m1, ...m0]);
      } else {
        const siparisAll = buildSiparisFromRequirements(requirements);
        const optAll = optimizasyonYap(siparisAll) || [];
        adetMap = mapOptResultsByKey(optAll, "PX");
      }
    } catch (e) {
      console.warn("optimizasyonYap çalıştırılamadı, adetler cut_count'a düşecek:", e);
      adetMap = new Map();
    }

    // PROFİLLER
    const profAgg = new Map();
    const addedKeys = new Set();
    const addProfile = (p) => {
      if (!pdfAllow(p)) return;
      const pid = p.profile?.id || p.profile_id || p.id;
      if (!pid) return;
      const kod = p.profile?.profil_kodu || "-";
      const ad = p.profile?.profil_isim || "-";
      const boy_m = Number(p.profile?.boy_uzunluk / 1000 || 0);
      const birimKg = Number(p.profile?.birim_agirlik || 0);
      const isPainted = Boolean(p?.is_painted);
      const oi = safeIndex(p?.order_index);

      let birimFiyat = 0;
      if (mode === "press") {
        birimFiyat = Number(proje?.press_price ?? 0);
      } else if (mode === "painted") {
        const painted = Number(proje?.painted_price ?? 0);
        const press = Number(proje?.press_price ?? 0);
        birimFiyat = isPainted ? painted : press;
      } else {
        birimFiyat = Number(p?.profile?.unit_price ?? 0);
      }

      const paintedKey = mode === "painted" ? (isPainted ? "P1" : "P0") : "PX";
      const adetFromOpt = adetMap.get(`${pid}|${paintedKey}`);
      const adetFallback = Number(p.cut_count || 0);
      const adet = Number.isFinite(adetFromOpt) ? adetFromOpt : adetFallback;

      const mainKey = [pid, paintedKey].join("|");
      if (addedKeys.has(mainKey)) return;
      addedKeys.add(mainKey);

      const key = [pid, paintedKey].join("|");
      const prev = profAgg.get(key);
      if (prev) {
        if (oi < prev.minOrderIndex) prev.minOrderIndex = oi;
      } else {
        profAgg.set(key, { pid, kod, ad, adet, boy_m, birimKg, birimFiyat, minOrderIndex: oi });
      }
    };
    (requirements?.systems || []).forEach((sys) => (sys.profiles || []).forEach(addProfile));
    (requirements?.extra_profiles || []).forEach(addProfile);

    // MALZEMELER
    const matAgg = new Map();
    const addMaterial = (m) => {
      if (!pdfAllow(m)) return;
      const mid = m.material?.id || m.id;
      if (!mid) return;
      const ad = m.material?.diger_malzeme_isim || m.material?.name || "-";
      const adet = Number(m.count || 0);
      const cutLen = Number(m.cut_length_mm / 1000 || 0);
      const birimKg = Number(m.material?.birim_agirlik || 0);
      const hesapTuru = String(m.material?.hesaplama_turu || "");
      const birimFiyat = Number(m.material?.unit_price ?? m?.unit_price ?? 0);
      const oi = safeIndex(m?.order_index);
      const key = [mid, cutLen, birimKg].join("|");
      const prev = matAgg.get(key);
      if (prev) {
        prev.adet += adet;
        if (oi < prev.minOrderIndex) prev.minOrderIndex = oi;
      } else {
        matAgg.set(key, { ad, adet, cutLen, birimKg, hesapTuru, birimFiyat, minOrderIndex: oi });
      }
    };
    (requirements?.systems || []).forEach((sys) => (sys.materials || []).forEach(addMaterial));
    (requirements?.extra_requirements || []).forEach(addMaterial);

    const remoteRows = buildRemotePlanRowsFromRequirements(requirements);

    (async () => {
      // PROFİL satırları
      const profRows = [];
      for (const { pid, kod, ad, adet, boy_m, birimKg, birimFiyat, minOrderIndex } of profAgg.values()) {
        const adetR = round2(adet);
        const boy_mR = round2(boy_m);
        const birimKgR = round2(birimKg);
        const toplamKgR = round2(adetR * boy_mR * birimKgR);
        const birimFiyatR = round2(birimFiyat);
        const toplamFiyatR = round2(birimFiyatR ? toplamKgR * birimFiyatR : 0);
        // görselleri dışarıdan PDF üretiminde de çekiyoruz; tablo için boş bırakmak sorun değil.
        profRows.push({
          lineType: "profile",
          kod,
          ad,
          adet: adetR,
          boy_m: boy_mR,
          birimKg: birimKgR,
          toplamKg: toplamKgR,
          birimFiyat: birimFiyatR,
          toplamFiyat: toplamFiyatR,
          imageData: null,
          orderIndex: safeIndex(minOrderIndex),
        });
        // istersen önbelleği ısıt:
        try { await dispatch(getProfilImageFromApi(pid)); } catch {}
      }

      // MALZEME satırları
      const matRows = [];
      for (const { ad, adet, cutLen, birimKg, hesapTuru, birimFiyat, minOrderIndex } of matAgg.values()) {
        const adetR = round2(adet);
        const cutLenR = round2(cutLen || 0);
        const birimFiyatR = round2(birimFiyat);
        const toplamKgR = round2(adetR * cutLenR);
        const hamToplam = birimFiyatR
          ? (hesapTuru === "olculu" ? cutLenR * adetR * birimFiyatR : adetR * birimFiyatR)
          : 0;
        const toplamFiyatR = round2(hamToplam);
        matRows.push({
          lineType: "material",
          kod: "",
          ad,
          adet: adetR,
          boy_m: cutLenR,
          birimKg: "",
          toplamKg: toplamKgR,
          birimFiyat: birimFiyatR,
          toplamFiyat: toplamFiyatR,
          imageData: null,
          orderIndex: safeIndex(minOrderIndex),
        });
      }

      profRows.sort((a, b) => a.orderIndex - b.orderIndex);
      matRows.sort((a, b) => a.orderIndex - b.orderIndex);
      remoteRows.sort((a, b) => a.orderIndex - b.orderIndex);

      const next = [...profRows, ...matRows, ...remoteRows];

      setRows(next);
      const toplam = round2(next.reduce((s, r) => s + Number(r.toplamFiyat || 0), 0));
      const kdv = round2(toplam * 0.2);
      const genelToplam = round2(toplam + kdv);
      setTotals({ toplam, kdv, genelToplam });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirements, proje, mode, dispatch]);

  // NaN güvenli yardımcı
  const toNum = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };

  const onCellChange = (idx, key, val) => {
    setRows((prev) => {
      const copy = prev.slice();
      const row = { ...copy[idx] };
      const numericKeys = ["adet", "boy_m", "birimKg", "birimFiyat", "toplamKg", "toplamFiyat"];
      row[key] = numericKeys.includes(key) ? toNum(val) : val;

      if (key === "adet" || key === "boy_m" || key === "birimKg") {
        const kg = toNum(row.adet) * toNum(row.boy_m) * toNum(row.birimKg);
        row.toplamKg = round2(kg);
      }
      if (key === "birimFiyat" || key === "toplamKg") {
        row.toplamFiyat = round2(toNum(row.birimFiyat) * toNum(row.toplamKg));
      }

      copy[idx] = row;
      return copy;
    });
  };

  const recalcTotals = () => {
    const toplam = round2(rows.reduce((s, r) => s + toNum(r.toplamFiyat), 0));
    const kdvAuto = round2(toplam * 0.2);
    const kdv = toNum(totals.kdv) > 0 ? toNum(totals.kdv) : kdvAuto;
    const genelToplam = round2(toplam + kdv);
    setTotals({ toplam, kdv, genelToplam });
  };

  const handleCreatePdf = async () => {
    const brandCfg = (await dispatch(getPdfBrandByKey("brand.default"))).config_json;
    const accCfg = (await dispatch(getPdfTitleByKey("pdf.profileAccessory0"))).config_json;
    await generateProfileAccessoryPdf(
      {
        dispatch,
        getProfilImageFromApi,
        proje,
        requirements,
        projectName: proje?.project_name || "",
        projectCode: proje?.project_kodu || "",
      },
      accCfg,
      brandCfg,
      { rows, totals }
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="grid grid-rows-[60px_1fr] h-full">
      <div className="flex items-center justify-between px-5">
        <Header title={`Profil Aksesuar – ${proje?.project_kodu || ""} ${proje?.project_name || ""}`} />
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => navigate(-1)}>Geri</button>
          <button className="btn btn-sm bg-green-600 text-white hover:bg-green-700" onClick={handleCreatePdf}>
            Pdf Çıktısı
          </button>
        </div>
      </div>

      <div className="bg-white w-full border-gray-200 border rounded-2xl p-5 h-full flex flex-col gap-4 overflow-hidden">
        {/* Toplamlar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border rounded-xl">
            <label className="block text-xs mb-1">TOPLAM</label>
            <input
              type="number"
              step="0.01"
              className="input input-bordered w-full"
              value={totals.toplam}
              onChange={(e) => setTotals((t) => ({ ...t, toplam: toNum(e.target.value) }))}
            />
          </div>
          <div className="p-3 border rounded-xl bg-blue-50">
            <label className="block text-xs mb-1">KDV</label>
            <input
              type="number"
              step="0.01"
              className="input input-bordered w-full"
              value={totals.kdv}
              onChange={(e) => setTotals((t) => ({ ...t, kdv: toNum(e.target.value) }))}
            />
          </div>
          <div className="p-3 border rounded-xl">
            <label className="block text-xs mb-1">GENEL TOPLAM</label>
            <input
              type="number"
              step="0.01"
              className="input input-bordered w-full"
              value={totals.genelToplam}
              onChange={(e) => setTotals((t) => ({ ...t, genelToplam: toNum(e.target.value) }))}
              onBlur={recalcTotals}
            />
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-auto border rounded-xl">
          <table className="table table-zebra w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="whitespace-nowrap">Profil Kodu</th>
                <th className="whitespace-nowrap">Profil Kesit</th>
                <th className="whitespace-nowrap">Profil / Malzeme / Kumanda</th>
                <th>Adet</th>
                <th>Boy (m)</th>
                <th>Birim Kilo (kg)</th>
                <th>Toplam Kilo (kg)</th>
                <th>Birim Fiyat</th>
                <th>Toplam Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="min-w-[120px]">{r.kod || ""}</td>
                  <td className="min-w-[80px]">
                    {r.imageData ? (
                      <div className="w-16 h-12 flex items-center justify-center">
                        <img
                          src={r.imageData}
                          alt="kesit"
                          className="max-w-full max-h-full object-contain"
                          draggable={false}
                        />
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </td>
                  <td className="min-w-[220px]">{r.ad}</td>
                  <td>
                    <input
                      type="number"
                      step="1"
                      className="input input-bordered w-24"
                      value={r.adet}
                      onChange={(e) => onCellChange(i, "adet", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      className="input input-bordered w-24"
                      value={r.boy_m}
                      onChange={(e) => onCellChange(i, "boy_m", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      className="input input-bordered w-24"
                      value={r.birimKg}
                      onChange={(e) => onCellChange(i, "birimKg", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.00001"
                      className="input input-bordered w-28"
                      value={r.toplamKg}
                      onChange={(e) => onCellChange(i, "toplamKg", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-24"
                      value={r.birimFiyat}
                      onChange={(e) => onCellChange(i, "birimFiyat", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-28"
                      value={r.toplamFiyat}
                      onChange={(e) => onCellChange(i, "toplamFiyat", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn" onClick={recalcTotals}>Toplamları Yeniden Hesapla</button>
          <button className="btn bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreatePdf}>
            Pdf Çıktısı
          </button>
        </div>
      </div>
    </div>
  );
}
