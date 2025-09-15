// src/utils/pdf/pdfOrder.js
// Sipariş Çıktısı (Order) PDF — pdfGlass ile aynı header mantığı, glass tablosu yok

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ----------------------------- yardımcılar ----------------------------- */
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
  } catch {}
  doc.setFont("helvetica", style === "bold" ? "bold" : "normal");
}
function pick(obj, path) {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? "";
}
function openPdf(doc, filename = "siparis.pdf") {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) { doc.save(filename); URL.revokeObjectURL(url); }
}

/* ============== split header (brand + pdf.infoRows merge) — pdfGlass ile birebir ============== */
async function drawSplitHeader(doc, brandConfig, pdfConfig, ctx) {
  // brandConfig: leftImage + rightBox
  // pdfConfig: infoRowsLayout + infoRows
  const headerCfg = {
    ...(brandConfig || {}),
    infoRowsLayout: pdfConfig?.infoRowsLayout,
    infoRows: pdfConfig?.infoRows
  };

  const pageW = doc.internal.pageSize.getWidth();
  const leftMargin = 40;
  const rightMargin = 40;
  const padX = 8;
  const padY = 6;
  const baseFontSize = 10;
  const titleFontSize = 12;
  const lineFactor = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
  const fontName = (doc.getFontList && doc.getFontList()["Roboto"])
    ? "Roboto"
    : (doc.getFont().fontName || "helvetica");

  // SOL kutu (logo alanı)
  const leftRequestedW = Number(headerCfg?.leftImage?.width || 260);
  const leftX = leftMargin;
  const topY = 40;

  // SAĞ blok (firma kutuları)
  const rightX = leftX + leftRequestedW;
  const rightW = Math.max(180, pageW - rightMargin - rightX);
  let rightCursorY = topY;

  // Başlık — MERKEZDE
  if (headerCfg?.rightBox?.title) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(titleFontSize);
    const t = String(headerCfg.rightBox.title);
    const titleH = titleFontSize * lineFactor + 2 * padY;
    doc.setLineWidth(0.8);
    doc.rect(rightX, rightCursorY, rightW, titleH, "S");

    const centerX = rightX + rightW / 2;
    const centerY = rightCursorY + titleH / 2 + titleFontSize / 3; // optik dengeleme
    doc.text(t, centerX, centerY, { align: "center" });

    rightCursorY += titleH;
  }

  // Firma satırları
  const rLines = Array.isArray(headerCfg?.rightBox?.lines) ? headerCfg.rightBox.lines : [];
  for (const line of rLines) {
    setFontSafe(doc, fontName, "normal");
    const txt = (line.type === "labelValue")
      ? ((line.label ? (String(line.label) + ": ") : "") + (line.value ?? ""))
      : (String(line.text || line.value || line.href || ""));
    const lines = doc.splitTextToSize(txt, Math.max(10, rightW - 2 * padX));
    const h = Math.max(22, lines.length * (baseFontSize * lineFactor) + 2 * padY);
    doc.setLineWidth(0.8);
    doc.rect(rightX, rightCursorY, rightW, h, "S");
    doc.setFontSize(baseFontSize);
    doc.text(lines, rightX + padX, rightCursorY + padY + baseFontSize, { align: "left" });
    if (line.type === "link" && line.href) {
      try { doc.link(rightX + padX, rightCursorY + padY, rightW - 2 * padX, baseFontSize * lineFactor, { url: line.href }); } catch {}
    }
    rightCursorY += h;
  }

  // Sol logo kutusu: sağ blok yüksekliğine eşit — public/logo.png ile
  const rightBottomY = rightCursorY;
  const leftFinalW = leftRequestedW;
  const leftFinalH = rightBottomY - topY;
  doc.setLineWidth(0.8);
  doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

  try {
    const resp = await fetch("/logo.png"); // public kökü
    const blob = await resp.blob();
    const leftImg = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });

    const inset = 2;
    const boxW = leftFinalW - 2 * inset;
    const boxH = Math.max(0, leftFinalH - 2 * inset);

    const img = new Image();
    img.src = leftImg;
    await new Promise(r => { img.onload = r; });

    const ratio = img.width / img.height;
    let drawW = boxW;
    let drawH = drawW / ratio;
    if (drawH > boxH) { drawH = boxH; drawW = drawH * ratio; }

    const x = leftX + inset + (boxW - drawW) / 2;
    const y = topY + inset + (boxH - drawH) / 2;

    doc.addImage(leftImg, "PNG", x, y, drawW, drawH);
  } catch (e) {
    console.warn("logo.png yüklenemedi:", e);
  }

  // infoRows grid
  const layoutCfg = headerCfg?.infoRowsLayout || {};
  const COLS_MAX = Math.min(3, Number(layoutCfg.columnsPerRow) || 3);
  const cellPadX = Number(layoutCfg.cellPaddingX ?? 6);
  const cellPadY = Number(layoutCfg.cellPaddingY ?? 6);

  const gridLeftX = leftMargin;
  const gridRight = pageW - rightMargin;
  const gridW = gridRight - gridLeftX;

  const itemsAll = Array.isArray(headerCfg?.infoRows) ? headerCfg.infoRows : [];
  const items = itemsAll.filter(it => it == null ? false : (it.enabled !== false));

  const getByPath = (o, p) => !o || !p ? "" : String(p).split(".").reduce((a, k) => (a && a[k] != null ? a[k] : undefined), o);
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

  let bottomY = rightBottomY;
  if (rows.length) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(baseFontSize);
    const lfac = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

    let gy = bottomY;
    for (const rowItems of rows) {
      const cellW = gridW / rowItems.length;
      let rowMaxH = 22;

      const prepared = rowItems.map(it => {
        const label = String(it.label ?? "");
        const val   = String(getValue(it) ?? "");
        const mode  = it.labelMode || "inline";
        let text = "";
        if (mode === "hidden") text = val;
        else if (mode === "stack") text = (label ? (label + ":") : "") + "\n" + val;
        else text = label ? (label + ": " + val) : val;

        const lines = doc.splitTextToSize(text, Math.max(10, cellW - 2 * cellPadX));
        const contentH = Math.max(baseFontSize * lfac, lines.length * (baseFontSize * lfac));
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
        const alignOpt = hAlign === "center" ? "center" : (hAlign === "right" ? "right" : "left");

        let tx;
        if (hAlign === "center") tx = cx + cellW / 2;
        else if (hAlign === "right") tx = cx + cellW - cellPadX;
        else tx = cx + cellPadX;

        const linesH = m.lines.length * (baseFontSize * lfac);
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

  return { bottomY };
}

/* --------------------------- ANA: ORDER PDF ÜRET --------------------------- */
/**
 * pdfOrder: Header pdfGlass ile aynı. Glass tablosu yok.
 * InfoRows -> bitişik Sistem/En/Boy/Adet kutusu -> Profiller -> Malzemeler -> (hemen altında sağda) Toplam Profil Kg
 */
export async function generateOrderPdf(ctx, pdfConfig = {}, brandConfig = {}) {
  const { dispatch, getProfilImageFromApi, requirements } = ctx;

  const doc = await createPdfDoc();
  const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : "helvetica");

  // 1) Header (pdfGlass ile aynı çağrı şekli)
  const { bottomY } = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);
  let cursorY = bottomY; // infoRows biter bitmez

  // 2) Sistemler: sadece pdf.siparisCiktisi === true olanlar kalsın
  const systems = (requirements?.systems || []).map(sys => ({
    ...sys,
    profiles:  (sys.profiles  || []).filter(p => p?.pdf?.siparisCiktisi === true),
    materials: (sys.materials || []).filter(m => m?.pdf?.siparisCiktisi === true),
    // glasses tamamen yok sayılıyor (render edilmeyecek)
  }));

  // Her sistem kendi sayfasında
  for (let si = 0; si < systems.length; si++) {
    const sys = systems[si];
    if (si > 0) { doc.addPage(); cursorY = (await drawSplitHeader(doc, brandConfig, pdfConfig, ctx)).bottomY; }

    // 3) InfoRows'un hemen altında bitişik "Sistem / En / Boy / Adet" kutusu
    const pageW = doc.internal.pageSize.getWidth();
    const leftMargin = 40, rightMargin = 40;
    const boxX = leftMargin, boxW = pageW - leftMargin - rightMargin, boxH = 26;

// (kutuyu zaten çiziyorsun)
doc.setLineWidth(0.8);
doc.rect(boxX, cursorY, boxW, boxH, "S");

// --- TEK KOLON / TEK SATIR METİN ---
setFontSafe(doc, fontName, "normal");

// 1) Birleştirilmiş özet metni hazırla
const sysName = `${(sys.system?.name || "").toString()} ${sys.name || ""}`.trim();
const summary = `Sistem: ${sysName}   En: ${sys.width_mm} mm   Boy: ${sys.height_mm} mm   Adet: ${sys.quantity}`;

// 2) Metin tek satıra sığsın diye dinamik font küçültme
const lfac = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
const padX = 8; // sağ/sol iç boşluk (kutunun içine taşmasın)
let fs = 10;    // başlangıç fontu
doc.setFontSize(fs);
while (doc.getTextWidth(summary) > (boxW - 2 * padX) && fs > 7) {
  fs -= 1;
  doc.setFontSize(fs);
}

// 3) Ortalı yerleşim (yatay + dikey)
const midX = boxX + boxW / 2;
const centerY = cursorY + (boxH - fs * lfac) / 2 + fs;

// 4) Tek satır, tek kolon, ortalı çiz
doc.text(summary, midX, centerY, { align: "center" });


    cursorY += boxH; // ➜ hemen altında tablolar başlar

    /* -------------------------- Profiller Tablosu -------------------------- */
    if ((sys.profiles || []).length > 0) {
      // Profil kesit görsellerini hazırla
        const profilesSorted = [...(sys.profiles || [])].sort((a, b) => {
  const ai = (a?.order_index ?? 0);
  const bi = (b?.order_index ?? 0);
  return ai - bi;
});
      const imageMap = {};
 await Promise.all(
   profilesSorted.map(p =>
          dispatch(getProfilImageFromApi(p.profile_id)).then(d => { imageMap[p.profile_id] = d; }).catch(() => {})
        )
      );

      const head = [['Profil Kodu','Profil Kesit','Profil Adı','Kesim Ölçüsü (mm)','Kesim Adedi','Birim Ağırlık (kg)','Toplam Ağırlık (kg)']];
      const body = profilesSorted.map(p => {
        const { profil_kodu, profil_isim, birim_agirlik } = p.profile || {};
        const toplamAgirlikKg =
          ((Number(birim_agirlik) || 0) * (Number(p.cut_length_mm) || 0) * (Number(p.cut_count) || 0)) / 1000;
        return [
          profil_kodu || "",
          "", // görsel sütun
          profil_isim || "",
          p.cut_length_mm,
          p.cut_count,
          (Number(birim_agirlik) || 0).toFixed(3),
          toplamAgirlikKg.toFixed(3)
        ];
      });

      autoTable(doc, {
        startY: cursorY,
        head, body,
        theme: "grid",
        styles: { font: fontName, fontSize: 10, halign: "center", valign: "middle" }, // tüm row'lar center
        headStyles: { font: fontName, fontStyle: "normal", fontSize: 10, halign: "center", fillColor: [120, 161, 209] },
        columnStyles: { 1: { cellWidth: 40, halign: "center" } },
        didDrawCell: data => {
          if (data.section === "body" && data.column.index === 1) {
            const pid = profilesSorted[data.row.index]?.profile_id;
            const img = imageMap[pid];
            if (img) {
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
            }
          }
        },
        margin: { left: 40, right: 40 }
      });
      cursorY = doc.lastAutoTable?.finalY || cursorY;
    }

    /* ----------------------- Ölçülü / Adetli Malzemeler ----------------------- */
    const olculu = (sys.materials || []).filter(m => m.material?.hesaplama_turu === "olculu");
    const adetli = (sys.materials || []).filter(m => m.material?.hesaplama_turu === "adetli");

    if (olculu.length > 0) {
      autoTable(doc, {
        startY: cursorY, // bitişik
        head: [['Malzeme Adı','Kesim Ölçüsü (mm)','Adet']],
        body: olculu.map(m => [m.material?.diger_malzeme_isim || m.material?.name || "-", m.cut_length_mm, m.count]),
        theme: "grid",
        styles: { font: fontName, fontSize: 10, halign: "center", valign: "middle" }, // center
        headStyles: { font: fontName, fontStyle: "normal", fontSize: 10, halign: "center", fillColor: [120, 161, 209] },
        margin: { left: leftMargin, right: rightMargin }
      });
      cursorY = doc.lastAutoTable?.finalY || cursorY;
    }

    if (adetli.length > 0) {
      autoTable(doc, {
        startY: cursorY, // bitişik
        head: [['Malzeme Adı','Adet']],
        body: adetli.map(m => [m.material?.diger_malzeme_isim || m.material?.name || "-", m.count]),
        theme: "grid",
        styles: { font: fontName, fontSize: 10, halign: "center", valign: "middle" }, // center
        headStyles: { font: fontName, fontStyle: "normal", fontSize: 10, halign: "center", fillColor: [120, 161, 209] },
        margin: { left: leftMargin, right: rightMargin }
      });
      cursorY = doc.lastAutoTable?.finalY || cursorY;
    }

    // 4) Son tablo biter bitmez, en sağda "Toplam Profil Kg" kutusu
    const toplamProfilKg =
      (sys.profiles || []).reduce((sum, p) =>
        sum + ((Number(p.profile?.birim_agirlik) || 0) * (Number(p.cut_length_mm) || 0) * (Number(p.cut_count) || 0)), 0
      ) / 1000;

    const rightBoxW = 200;
    const rightBoxH = 26;
    const rx = pageW - rightMargin - rightBoxW;
    const ry = cursorY; // bitişik

    doc.setLineWidth(0.8);
    doc.rect(rx, ry, rightBoxW, rightBoxH, "S");
    setFontSafe(doc, fontName, "bold");
    doc.setFontSize(10);
    doc.text(`Toplam Profil Kg: ${toplamProfilKg.toFixed(3)}`, rx + rightBoxW / 2, ry + rightBoxH / 2 + 3, { align: "center" });

    cursorY += rightBoxH; // (ileride başka öğe eklemek istersen)
  }

  openPdf(doc);
}
