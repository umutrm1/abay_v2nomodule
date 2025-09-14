// src/utils/pdf/pdfProfileAccessory.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ========== yardımcılar ========== */
function arrayBufferToBase64(buf) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buf], { type: "font/ttf" });
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function fetchFontBase64(path) {
  const url = `${import.meta.env.BASE_URL}fonts/${path}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Font indirilemedi: ${url}`);
  const buf = await resp.arrayBuffer();
  return await arrayBufferToBase64(buf);
}

async function createPdfDoc() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const reg64 = await fetchFontBase64("Roboto-Regular.ttf");
  doc.addFileToVFS("Roboto-Regular.ttf", reg64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

  const bold64 = await fetchFontBase64("Roboto-Bold.ttf");
  doc.addFileToVFS("Roboto-Bold.ttf", bold64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

  doc.setFont("Roboto", "normal");
  return doc;
}
function setFontSafe(doc, family, style = "normal") {
  try {
    const list = doc.getFontList?.() || {};
    const styles = list?.[family];
    if (Array.isArray(styles)) {
      if (styles.includes(style)) { doc.setFont(family, style); return; }
      if (styles.includes("normal")) { doc.setFont(family, "normal"); return; }
    }
  } catch { }
  doc.setFont("helvetica", style === "bold" ? "bold" : "normal");
}
function openPdf(doc, filename = "profil-aksesuar.pdf") {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) { doc.save(filename); URL.revokeObjectURL(url); }
}
function fmtMoneyTRY(n) {
  return `₺${Number(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtMax5Digits(n) {
  // "Toplam Kilo maksimum 5 hane" isteği için: ondalıkta en fazla 5 basamak
  if (!Number.isFinite(n)) return "-";
  return Number(n).toFixed(5).replace(/0+$/, "").replace(/\.$/, ""); // sondaki sıfırları kırp, max 5 basamak
}

/* ========== split header (logo + brand center + infoRows) ========== */
async function drawSplitHeader(doc, brandConfig, pdfConfig, ctx) {
  const headerCfg = {
    ...(brandConfig || {}),
    infoRowsLayout: pdfConfig?.infoRowsLayout,
    infoRows: pdfConfig?.infoRows
  };
  const pageW = doc.internal.pageSize.getWidth();
  const leftMargin = 40, rightMargin = 40;
  const padX = 8, padY = 6;
  const baseFontSize = 10, titleFontSize = 12;
  const lineFactor = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
  const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : (doc.getFont().fontName || "helvetica"));

  // sol logo kutusu hedef genişlik
  const leftRequestedW = Number(headerCfg?.leftImage?.width || 260);
  const leftX = leftMargin, topY = 10;

  // sağ blok
  const rightX = leftX + leftRequestedW;
  const rightW = Math.max(180, pageW - rightMargin - rightX);
  let ry = topY;

  // Brand (başlık) — HER ZAMAN ORTALI
  if (headerCfg?.rightBox?.title) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(titleFontSize);
    const t = String(headerCfg.rightBox.title);
    const titleH = titleFontSize * lineFactor + 2 * padY;
    doc.setLineWidth(0.8);
    doc.rect(rightX, ry, rightW, titleH, "S");
    const cx = rightX + rightW / 2;
    const cy = ry + titleH / 2 + titleFontSize / 3;
    doc.text(t, cx, cy, { align: "center" });
    ry += titleH;
  }

  // Sağ bilgi satırları
  const rLines = Array.isArray(headerCfg?.rightBox?.lines) ? headerCfg.rightBox.lines : [];
  for (const line of rLines) {
    setFontSafe(doc, fontName, "normal");
    const txt = (line.type === "labelValue")
      ? ((line.label ? (String(line.label) + ": ") : "") + (line.value ?? ""))
      : (String(line.text || line.value || line.href || ""));
    const lines = doc.splitTextToSize(txt, Math.max(10, rightW - 2 * padX));
    const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
    doc.setLineWidth(0.8);
    doc.rect(rightX, ry, rightW, h, "S");
    doc.setFontSize(baseFontSize);
    doc.text(lines, rightX + padX, ry + padY + baseFontSize, { align: "left" });
    if (line.type === "link" && line.href) {
      try { doc.link(rightX + padX, ry + padY, rightW - 2 * padX, baseFontSize * lineFactor, { url: line.href }); } catch { }
    }
    ry += h;
  }

  // Sol logo kutusunun sınırı (yüksekliği sağ blok ile aynı)
  const rightBottom = ry;
  const leftFinalW = leftRequestedW;
  const leftFinalH = rightBottom - topY;
  doc.setLineWidth(0.8);
  doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

  // Logo: public/logo.png (orantıyı koru, ortala)
  try {
    console.log(ctx.brandLogoUrl)
    const resp = await fetch(ctx.brandLogoUrl);
    if (resp.ok) {
      const blob = await resp.blob();
      const dataUrl = await new Promise(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
      const inset = 2;
      const boxW = leftFinalW - 2 * inset;
      const boxH = Math.max(0, leftFinalH - 2 * inset);
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });
      const ratio = img.width / img.height;
      let w = boxW, h = w / ratio;
      if (h > boxH) { h = boxH; w = h * ratio; }
      const x = leftX + inset + (boxW - w) / 2;
      const y = topY + inset + (boxH - h) / 2;
      doc.addImage(dataUrl, "PNG", x, y, w, h);
    }
  } catch (e) {
    console.warn("logo.png yüklenemedi:", e);
  }

  // infoRows (grid)
  const layoutCfg = headerCfg?.infoRowsLayout || {};
  const COLS_MAX = Math.min(3, Number(layoutCfg.columnsPerRow) || 3);
  const cellPadX = Number(layoutCfg.cellPaddingX ?? 6);
  const cellPadY = Number(layoutCfg.cellPaddingY ?? 6);
  const gridLeftX = leftMargin, gridRight = pageW - rightMargin, gridW = gridRight - gridLeftX;

  const itemsAll = Array.isArray(headerCfg?.infoRows) ? headerCfg.infoRows : [];
  const items = itemsAll.filter(it => it == null ? false : (it.enabled !== false));

  const getByPath = (o, p) => !o || !p ? "" : String(p).split(".").reduce((a, k) => a && a[k] != null ? a[k] : undefined, o);
  const evalExpr = (expr) => /^date\(/i.test(expr)
    ? (() => {
      const inner = expr.slice(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
      const raw = getByPath(ctx, inner);
      if (!raw) return "";
      const d = new Date(raw);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
    })()
    : "";
  const getValue = it => it.valueExpr ? evalExpr(it.valueExpr) : it.valueField ? (getByPath(ctx, it.valueField) ?? "") : "";

  const rows = [];
  for (let i = 0; i < items.length; i += COLS_MAX) rows.push(items.slice(i, i + COLS_MAX));

  let bottomY = rightBottom;
  if (rows.length) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(baseFontSize);
    const lfac2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

    let gy = bottomY;
    for (const rowItems of rows) {
      const cellW = gridW / rowItems.length;
      let rowMaxH = 22;

      const prepared = rowItems.map(it => {
        const label = String(it.label ?? "");
        const val = String(getValue(it) ?? "");
        const mode = it.labelMode || "inline";
        let text = "";
        if (mode === "hidden") text = val;
        else if (mode === "stack") text = (label ? (label + ":") : "") + "\n" + val;
        else text = label ? (label + ": " + val) : val;

        const lines = doc.splitTextToSize(text, Math.max(10, cellW - 2 * cellPadX));
        const contentH = Math.max(baseFontSize * lfac2, lines.length * (baseFontSize * lfac2));
        const boxH = Math.max(22, contentH + 2 * cellPadY);
        rowMaxH = Math.max(rowMaxH, boxH);
        return { it, lines };
      });

      let cx = gridLeftX;
      for (const m of prepared) {
        doc.setLineWidth(0.8);
        doc.rect(cx, gy, cellW, rowMaxH, "S");

        const hAlign = (m.it.hAlign || "left");
        const vAlign = (m.it.vAlign || "middle");
        const alignOpt = hAlign === "center" ? "center" : hAlign === "right" ? "right" : "left";

        let tx;
        if (hAlign === "center") tx = cx + cellW / 2;
        else if (hAlign === "right") tx = cx + cellW - cellPadX;
        else tx = cx + cellPadX;

        const linesH = m.lines.length * (baseFontSize * lfac2);
        let ty;
        if (vAlign === "top") ty = gy + cellPadY + baseFontSize;
        else if (vAlign === "bottom") ty = gy + rowMaxH - cellPadY - (linesH - baseFontSize);
        else ty = gy + (rowMaxH - linesH) / 2 + baseFontSize;

        doc.text(m.lines, tx, ty, { align: alignOpt });
        cx += cellW;
      }

      gy += rowMaxH;
    }
    bottomY = gy;
  }

  return { bottomY: bottomY, leftMargin, rightMargin };
}

/* ========== ANA: Profil + Aksesuar + Kumanda (sipariş) ========== */
export async function generateProfileAccessoryPdf(ctx, pdfConfig, brandConfig, options = {}) {

  const { dispatch, getProfilImageFromApi, requirements } = ctx;
  
  const doc = await createPdfDoc();
  const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : "helvetica");

  // Header aynı
  const { bottomY, leftMargin, rightMargin } = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);
  let cursorY = bottomY;

  // ---- 1) PDF filtresi: sadece pdf.siparisCiktisi === true olanlar kalsın (AYNI) ----
  const filtered = {
    ...requirements,
    systems: (requirements?.systems || []).map(sys => ({
      ...sys,
      profiles: (sys?.profiles || []).filter(p => p?.pdf?.profilAksesuarCiktisi === true),
      materials: (sys?.materials || []).filter(m => m?.pdf?.profilAksesuarCiktisi === true),
      remotes: (sys?.remotes || []).filter(r => r?.pdf?.profilAksesuarCiktisi === true),
    })),
    extra_requirements: (requirements?.extra_requirements || []).filter(er => er?.pdf?.profilAksesuarCiktisi === true),
    extra_profiles: (requirements?.extra_profiles || []).filter(ep => ep?.pdf?.profilAksesuarCiktisi === true),
    extra_glasses: (requirements?.extra_glasses || []).filter(eg => eg?.pdf?.profilAksesuarCiktisi === true),
  };

  // ---- 2) Tablo kolonları (AYNI) ----
  const head = [[
    "Profil Kodu", "Profil Kesit", "Profil / Malzeme / Kumanda", "Adet", "Boy(m)", "Birim Kilo (kg)", "Toplam Kilo (kg)", "Birim Fiyat", "Toplam Fiyat"
  ]];

  const body = [];

  // Eğer options.rows geldiyse onu kullan; yoksa mevcut aggregation



  // ============ YENİ: aynı kalemleri biriktir (aggregation) ============

  // --- Profiller (systems + extra_profiles)
  const profAgg = new Map(); // key: kod|boy|birimKg|birimFiyat
  const pushProfile = (p) => {
    const id = p.profile?.id || p.profile_id || p.id;
    const kod = p.profile?.profil_kodu || "-";
    const ad = p.profile?.profil_isim || "-";
    const adet = Number(p.cut_count || 0);
    const boy_m = Number(p.profile?.boy_uzunluk / 1000 || 0);
    const birimKg = Number(p.profile?.birim_agirlik || 0);
    const isPainted = Boolean(p?.is_painted); // 👈 gelen kalemin boyalı/boyasız bilgisi
    const paintFlag = isPainted ? "P1" : "P0";
    const key = [id || kod, boy_m, birimKg, paintFlag].join("|");
    const prev = profAgg.get(key);
    if (prev) {
      prev.adet += adet;
    } else {
      profAgg.set(key, { id, kod, ad, adet, boy_m, birimKg,isPainted  });
    }
  };
  // --- Profil görsellerini preload et (paint'teki akışa paralel)

  (filtered.systems || []).forEach(sys => (sys.profiles || []).forEach(pushProfile));
  (filtered.extra_profiles || []).forEach(pushProfile);

  // --- Malzemeler (systems.materials + extra_requirements)
  const matAgg = new Map(); // key: ad|cutLen|birimKg|hesapTuru|birimFiyat
  const pushMaterial = (m) => {
    const ad = m.material?.diger_malzeme_isim || m.material?.name || "-";
    const adet = Number(m.count || 0);
    const cutLen = Number(m.cut_length_mm / 1000 || 0);
    const birimKg = Number(m.material?.birim_agirlik || 0);
    const hesapTuru = String(m.material?.hesaplama_turu || "");
    const birimFiyat = Number(m.material?.unit_price || 0);
    const key = [ad, cutLen, birimKg, hesapTuru, birimFiyat].join("|");
    const prev = matAgg.get(key);
    if (prev) {
      prev.adet += adet;
    } else {
      matAgg.set(key, { ad, adet, cutLen, birimKg, hesapTuru, birimFiyat });
    }
  };

  (filtered.systems || []).forEach(sys => (sys.materials || []).forEach(pushMaterial));
  (filtered.extra_requirements || []).forEach(pushMaterial);

  // --- Kumandalar (systems.remotes)
  const remAgg = new Map(); // key: ad|birimFiyat
  const pushRemote = (r) => {
    const ad = r.remote?.kumanda_isim ? String(r.remote.kumanda_isim) : "Kumanda";
    const adet = Number(r.count || 0);
    // Not: mevcut kod r.remote?.unit_price kullanıyordu; davranışı aynen koruyoruz.
    const birimFiyat = Number(r.remote?.unit_price || 0);
    const key = [ad, birimFiyat].join("|");
    const prev = remAgg.get(key);
    if (prev) {
      prev.adet += adet;
    } else {
      remAgg.set(key, { ad, adet, birimFiyat });
    }
  };

  (filtered.systems || []).forEach(sys => (sys.remotes || []).forEach(pushRemote));

  // ============ Biriktirilmiş veriden TABLO SATIRLARINI yaz ============
  const imageMap = {};
  await Promise.all(
    Array.from(profAgg.values()).map(async (row) => {
      if (!row.id) return;
      try {
        const dataUrl = await dispatch(getProfilImageFromApi(row.id));
        imageMap[row.id] = dataUrl; // data:image/png;base64,...
      } catch (e) {
        // isteğe bağlı: sessiz geç
      }
    })
  );
  // Profiller
  const imgMap = pdfConfig?.profilImages || {}; // { [id]: { imageData } }
    for (const { id, kod, ad, adet, boy_m, birimKg, isPainted } of profAgg.values()) {
    // 🔁 Birim fiyatın belirlenmesi (override + boyalı/boyasız kuralı)
    let birimFiyat = 0;
    if (!options?.pricingMode) {
      // orijinal fiyatı requirements içinden bul (senin hali hazırdaki mantığın korunuyor)
      const findOriginal = () => {
        for (const s of (requirements?.systems || [])) {
          for (const pr of (s.profiles || [])) {
            const pid = pr.profile?.id || pr.profile_id || pr.id;
            if (pid && pid === id) return pr;
          }
        }
        for (const pr of (requirements?.extra_profiles || [])) {
          const pid = pr.profile?.id || pr.profile_id || pr.id;
          if (pid && pid === id) return pr;
        }
        return null;
      };
      const original = findOriginal();
      birimFiyat = Number(original?.profile?.unit_price || 0);
    } else if (options?.pricingMode === 'press') {
      // Tüm profiller press fiyatı
      birimFiyat = Number(ctx?.pressPrice ?? ctx?.proje?.press_price ?? 0);
    } else if (options?.pricingMode === 'painted') {
      // 🎯 İSTENEN KURAL:
      // is_painted === true  -> painted price
      // is_painted === false -> press price
      const painted = Number(ctx?.paintedPrice ?? ctx?.proje?.painted_price ?? 0);
      const press   = Number(ctx?.pressPrice    ?? ctx?.proje?.press_price    ?? 0);
      birimFiyat = isPainted ? painted : press;
    }

    const toplamKg = (adet * boy_m * birimKg);
    const toplamFiyat = birimFiyat ? toplamKg * birimFiyat : 0;
    const imageData = id ? imageMap[id] : null;
    body.push([
      kod,
      { content: "", raw: { type: "image", imageData } },
      ad,
      adet,
      boy_m,
      birimKg.toFixed(3),
      fmtMax5Digits(toplamKg),
      birimFiyat.toFixed(2),
      toplamFiyat.toFixed(2)
    ]);
  }

  // Malzemeler
  for (const { ad, adet, cutLen, birimKg, hesapTuru, birimFiyat } of matAgg.values()) {
    const toplamFiyat = birimFiyat
      ? (hesapTuru === "olculu" ? (cutLen * adet * birimFiyat) : (adet * birimFiyat))
      : 0;
      console.log(ad,hesapTuru)
    body.push([
      "",
      "",
      ad,
      adet,
      cutLen || "",
      "",
      adet*cutLen,
      birimFiyat.toFixed(2),
      toplamFiyat.toFixed(2)
    ]);
  }

  // Kumandalar (kapasiteyi yazmıyoruz; aynen korunuyor)
  // ---- 6) Kumandalar: sistemi kapasitelerle planla, 0 adetleri yazma ----

  // ---- Kumandalar: 15'leri maksimize et; sonra 9, sonra 5, kalan 1 ----

  // 1) toplam quantity (yalnız systems)
  const totalQty = (filtered.systems || []).reduce((sum, s) => {
    const q = Number(s?.quantity || 0);
    return sum + (Number.isFinite(q) && q > 0 ? q : 0);
  }, 0);

  // 2) kapasite -> { name, unitPrice } (aynı kapasitelerde en ucuz olan)
  const capacityMap = new Map(); // cap:number -> { name, unitPrice:number }
  (filtered.systems || []).forEach(sys => {
    (sys.remotes || []).forEach(r => {
      if (r?.pdf?.siparisCiktisi !== true) return;
      const cap = Number(r?.remote?.kapasite ?? r?.kapasite ?? 0);
      if (!Number.isFinite(cap) || cap <= 0) return;
      const name = r?.remote?.kumanda_isim ? String(r.remote.kumanda_isim) : "Kumanda";
      const unitPrice = Number(r?.remote?.unit_price ?? r?.unit_price ?? r?.remote?.price ?? 0);
      const prev = capacityMap.get(cap);
      if (!prev || unitPrice < prev.unitPrice) {
        capacityMap.set(cap, { name, unitPrice });
      }
    });
  });

  const caps = Array.from(capacityMap.keys()); // mevcut kapasiteler
  let remotePlan = []; // { cap, count, name, unitPrice }

  if (totalQty > 0 && caps.length > 0) {
    const has15 = capacityMap.has(15);
    let remaining = totalQty;

    // 3) 15'leri maksimize et
    if (has15) {
      const use15 = Math.floor(remaining / 15);
      if (use15 > 0) {
        const info15 = capacityMap.get(15);
        remotePlan.push({ cap: 15, count: use15, name: info15.name, unitPrice: info15.unitPrice });
        remaining -= use15 * 15;
      }
    }

    // 4) kalan için sırasıyla 9 ve 5 kuralı
    if (remaining > 5 && capacityMap.has(9)) {
      const info9 = capacityMap.get(9);
      remotePlan.push({ cap: 9, count: 1, name: info9.name, unitPrice: info9.unitPrice });
      remaining -= 9;
    }

    if (remaining > 1 && capacityMap.has(5)) {
      const info5 = capacityMap.get(5);
      remotePlan.push({ cap: 5, count: 1, name: info5.name, unitPrice: info5.unitPrice });
      remaining -= 5;
    }

    // 5) kalan 0/1 için:
    if (remaining > 0) {
      if (capacityMap.has(1)) {
        const info1 = capacityMap.get(1);
        remotePlan.push({ cap: 1, count: remaining, name: info1.name, unitPrice: info1.unitPrice });
        remaining = 0;
      } else {
        // 1 yoksa: eldeki kapasitelerden remaining'i kapatan en küçük >=remaining kapasiteyi bul,
        // yoksa en küçük kapasiteden 1 adet al (üstünü kapat).
        const capsAsc = [...caps].sort((a, b) => a - b);
        const coverCap = capsAsc.find(c => c >= remaining) ?? capsAsc[0];
        const infoC = capacityMap.get(coverCap);
        remotePlan.push({ cap: coverCap, count: 1, name: infoC.name, unitPrice: infoC.unitPrice });
        remaining = 0;
      }
    }
  }

  // 6) Planı PDF'e yaz (adet > 0), Boy/Birim Kilo/Toplam Kilo boş; toplam fiyat = adet × birim
  remotePlan.forEach(it => {
    if (!it.count) return;
    const adet = it.count;
    const birimFiyat = Number(it.unitPrice || 0);
    const toplamFiyat = adet * birimFiyat;

    body.push([
      "",             // Profil Kodu
      "",             // Profil Kesit
      it.name,        // Kumanda adı
      adet,           // Adet
      "",             // Boy (mm)
      "",             // Birim Kilo (kg)
      "",             // Toplam Kilo (kg)
      birimFiyat.toFixed(2),
      toplamFiyat.toFixed(2)
    ]);
  });

  // 7) extra_remotes (olduğu gibi ekle; hesaplamaya dahil etme)
  (requirements?.extra_remotes || [])
    .filter(er => er?.pdf?.siparisCiktisi === true)
    .forEach(er => {
      const adet = Number(er?.count || 0);
      if (adet <= 0) return;
      const name = er?.remote?.kumanda_isim ? String(er.remote.kumanda_isim) : (er?.name || "Kumanda");
      const birimFiyat = Number(er?.remote?.unit_price ?? er?.unit_price ?? er?.remote?.price ?? 0);
      const toplamFiyat = adet * birimFiyat;

      body.push([
        "",
        "",
        name,
        adet,
        "",
        "",
        "",
        birimFiyat.toFixed(2),
        toplamFiyat.toFixed(2)
      ]);
    });


  // ---- 7) Tablonun kendisi (AYNI) ----
  autoTable(doc, {
    startY: cursorY,
    head,
    body,
    theme: "grid",
    styles: { font: fontName, fontSize: 8, minCellHeight: 18, halign: "center", valign: "middle" },
  headStyles: { font: fontName, fontStyle: "normal", fontSize: 8, halign: "center", fillColor: [120, 160, 210] },
  columnStyles: { 1: { cellWidth: 40, minCellHeight: 35 } },
didDrawCell: (data) => {
  if (data.section !== "body" || data.column.index !== 1) return;

  // ÖNEMLİ: ham satıra git → 1. kolondaki hücrenin orijinal raw’ına ulaş
  const cellRaw = data.row?.raw?.[1]?.raw || {};
  const img = cellRaw.imageData;

  if (typeof img !== "string" || !img.startsWith("data:image")) return;

  const pad = 2;
  const cellX = data.cell.x + pad;
  const cellY = data.cell.y + pad;
  const cellW = data.cell.width  - pad * 2;
  const cellH = data.cell.height - pad * 2;

  try {
    const props = doc.getImageProperties(img);
    const ratio = props.width / props.height;
    let w = cellW, h = w / ratio;
    if (h > cellH) { h = cellH; w = h * ratio; }
    const dx = cellX + (cellW - w) / 2;
    const dy = cellY + (cellH - h) / 2;
    const fmt = img.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
    doc.addImage(img, fmt, dx, dy, w, h);
  } catch (e) {
    console.warn("Profil kesit resmi çizilemedi:", e);
  }
},
    margin: { left: 40, right: 40 }
  });

  // ---- 8) Özet kutuları + AÇIKLAMA + uyarı (AYNI) ----
  const at = doc.lastAutoTable;
  const y0 = at?.finalY || cursorY;

  const pageW = doc.internal.pageSize.getWidth();
  const usableW = pageW - leftMargin - rightMargin;

  const prevRightW = usableW / 2;
  const rightW = (prevRightW * 2) / 3; // width 2/3
  const leftW = usableW - rightW;

  const prevBoxH = 28;
  const boxH = Math.round((prevBoxH * 2) / 3); // height 2/3

  const xLeft = leftMargin;
  const xRight = leftMargin + leftW;

  // Toplam hesapları (genel toplam KDV dahil)
  const toplamFiyat = body.reduce((s, r) => s + (parseFloat(r[8]) || 0), 0); // 8. index = "Toplam Fiyat"
  const kdv = toplamFiyat * 0.20;
  const genelToplam = toplamFiyat + kdv;

  const totalsFontSize = Number(pdfConfig?.totalsFontSize || 8);

  const drawRightRow = (y, label, val, fillBlue = false, bold = false) => {
    const half = rightW / 2;
    const padR = 6;
    const fs = totalsFontSize;

    if (fillBlue) {
      doc.setFillColor(120, 160, 210);
      doc.rect(xRight, y, rightW, boxH, "F");
    }

    doc.setDrawColor(150);
    doc.setLineWidth(0.8);
    doc.rect(xRight, y, half, boxH, "S");
    doc.rect(xRight + half, y, half, boxH, "S");

    const lfac = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
    const cy = y + (boxH - fs * lfac) / 2 + fs;

    setFontSafe(doc, fontName, bold ? "bold" : "normal");
    doc.setFontSize(fs);
    doc.setTextColor(0, 0, 0);
    doc.text(String(label), xRight + half - padR, cy, { align: "right" });

    setFontSafe(doc, fontName, "bold");
    doc.setFontSize(fs);
    doc.setTextColor(200, 0, 0);
    doc.text(fmtMoneyTRY(val), xRight + rightW - padR, cy, { align: "right" });

    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, fontName, "normal");
  };

  drawRightRow(y0 + 0 * boxH, "TOPLAM", toplamFiyat, false, false);
  drawRightRow(y0 + 1 * boxH, "KDV (%20)", kdv, true, true);
  drawRightRow(y0 + 2 * boxH, "GENEL TOPLAM", genelToplam, false, true);

  const leftBoxH = boxH * 3;
  doc.setDrawColor(150); doc.setLineWidth(0.8);
  doc.rect(xLeft, y0, leftW, leftBoxH, "S");

  const aciklamaText = [
    "AÇIKLAMA:",
    "1. Siparişin kabulü:'Fiyat teklifi kabul edilmiştir'. Kaşe ve isim üzerine imzalayarak tarafımıza iletilmesi ve ödemenin %50 sinin yapılmasını takiben sipariş yürürlüğe girer.",
    "2. Ödeme, hizmet ve malların fabrikadan sevk edilmesinden önce tamamlanacaktır.",
    "3. Proje ölçülerine onay verilirken kontrol edilmelidir. Onay verilen proje ölçüleri sorumluluğu alıcıya aittir.",
    "4. TEKLİF ONAYI GELMEYEN SİPARİŞLER İŞLEME ALINMAYACAKTIR.",
    "5. Ürün teslimi : Fiyatlarımız Ankara İvedik fabrika teslim fiyatıdır. Nakliye bedeli alıcıya aittir. Nakliyeden oluşabilecek hasar ve gecikmelerden firmamız sorumlu değildir."
  ].join("\n");

  const padX = 8, padY = 8;
  setFontSafe(doc, fontName, "normal");
  doc.setFontSize(5);
  let lines = doc.splitTextToSize(aciklamaText, leftW - 2 * padX);
  doc.text(lines, xLeft + padX, y0 + padY + doc.getFontSize());

  const warnY = y0 + leftBoxH;
  const warnH = 20;
  const warnText =
    "PROJE ÖLÇÜLERİNİZİ VE SİSTEM ÖZELLİKLERİNİ KONTROL EDİNİZ. ONAY SONRASINDA OLUŞABİLECEK YANLIŞ ÖLÇÜ VE SİSTEM ÖZELLİKLERİNDEN FİRMAMIZ SORUMLU DEĞİLDİR.";

  doc.setDrawColor(150); doc.setLineWidth(0.8);
  doc.rect(leftMargin, warnY, pageW - leftMargin - rightMargin, warnH, "S");
  setFontSafe(doc, fontName, "bold");
  doc.setFontSize(7);
  doc.setTextColor(200, 0, 0);
  const warnLines = doc.splitTextToSize(warnText, pageW - leftMargin - rightMargin - 2 * padX);
  doc.text(warnLines, leftMargin + (pageW - leftMargin - rightMargin) / 2, warnY + warnH / 2, { align: "center" });
  doc.setTextColor(0, 0, 0);

  openPdf(doc);
}

