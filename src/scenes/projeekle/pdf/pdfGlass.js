// src/scenes/projeekle/pdf/pdfGlass.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { mapGlass } from "./mappers/glass.mapper.js";

/* ===================== ortak yardımcılar ===================== */
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
  // Roboto Regular
  const reg64 = await fetchFontBase64("Roboto-Regular.ttf");
  doc.addFileToVFS("Roboto-Regular.ttf", reg64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  // Roboto Bold
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
    } else if (styles) {
      try { doc.setFont(family, style); return; } catch { }
      try { doc.setFont(family, "normal"); return; } catch { }
    }
  } catch { }
  doc.setFont("helvetica", style === "bold" ? "bold" : "normal");
}
function truncateTo(n, d = 0) {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, d);
  return Math.trunc(n * f) / f;   // kırp, yuvarlama yok
}
function pick(obj, path) {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? "";
}
function openPdf(doc, filename = "cam-ciktisi.pdf") {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    doc.save(filename);
    URL.revokeObjectURL(url);
  }
}
function buildColumnStyles(cols = []) {
  const s = {};
  cols.forEach((c, i) => {
    s[i] = {};
    if (c.width) s[i].cellWidth = c.width;
    if (c.align === "right") s[i].halign = "right";
    if (c.align === "center") s[i].halign = "center";
  });
  return s;
}
function formatCell(v, f) {
  if (f == null) return v ?? "";
  const n = Number(v);
  if (f === "integer") return Number.isFinite(n) ? String(Math.round(n)) : (v ?? "");
  const m = String(f).match(/^number\((\d+)\)$/);
  if (m) {
    const d = +m[1] || 2;
    return Number.isFinite(n) ? n.toFixed(d) : (v ?? "");
  }
    const t = String(f).match(/^truncate\((\d+)\)$/);
  if (t) {
    const d = +t[1] || 0;
   if (!Number.isFinite(n)) return v ?? "";
   const cut = truncateTo(n, d);
   // her zaman sabit hane göstermek için toFixed kullanıyoruz
   return cut.toFixed(d);
  }
  return v ?? "";
}
function sumField(rows, f) {
  return (rows || []).reduce((s, r) => s + (Number(pick(r, f)) || 0), 0);
}

/* ============== split header (brand + pdf.infoRows merge) ============== */
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

  // Başlık
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

  // Satırlar
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
      try { doc.link(rightX + padX, rightCursorY + padY, rightW - 2 * padX, baseFontSize * lineFactor, { url: line.href }); } catch { }
    }
    rightCursorY += h;
  }

  // Sol logo kutusu: sağ blok yüksekliğine eşit
  const rightBottomY = rightCursorY;
  const leftFinalW = leftRequestedW;
  const leftFinalH = rightBottomY - topY;
  doc.setLineWidth(0.8);
  doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

try {
  const resp = await fetch("/logo.png"); // public klasör kökü
  const blob = await resp.blob();
  const leftImg = await new Promise(res => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.readAsDataURL(blob);
  });

  const inset = 2;
  const boxW = leftFinalW - 2 * inset;           // max ~256 px
  const boxH = Math.max(0, leftFinalH - 2 * inset);

  // orijinal boyutları öğren
  const img = new Image();
  img.src = leftImg;
  await new Promise(r => { img.onload = r; });

  const imgW = img.width;
  const imgH = img.height;
  const ratio = imgW / imgH;

  // genişliği kutuya uydur, yüksekliği orantılı
  let drawW = boxW;
  let drawH = drawW / ratio;

  // eğer yükseklik kutuya sığmazsa yüksekliğe göre uyarla
  if (drawH > boxH) {
    drawH = boxH;
    drawW = drawH * ratio;
  }

  // ortala
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

  let blockBottomY = rightBottomY;
  if (rows.length) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(baseFontSize);
    const lineFactor2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

    // ölç ve çiz
    let gridY = blockBottomY;
    for (const rowItems of rows) {
      const actualCols = rowItems.length;
      const cellW = gridW / actualCols;

      // satır yüksekliğini belirle
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
        const contentH = Math.max(baseFontSize * lineFactor2, lines.length * (baseFontSize * lineFactor2));
        const boxH = Math.max(22, contentH + 2 * cellPadY);
        rowMaxH = Math.max(rowMaxH, boxH);
        return { it, lines, boxH };
      });

      // çiz
      for (let c = 0; c < rowItems.length; c++) {
        const cellX = gridLeftX + c * cellW;
        const cellY = gridY;
        const m = prepared[c];

        doc.setLineWidth(0.8);
        doc.rect(cellX, cellY, cellW, rowMaxH, "S");

        const hAlign = (m.it.hAlign || "left");
        const vAlign = (m.it.vAlign || "middle");
        const alignOpt = hAlign === "center" ? "center" : (hAlign === "right" ? "right" : "left");

        let textX;
        if (hAlign === "center") textX = cellX + cellW / 2;
        else if (hAlign === "right") textX = cellX + cellW - cellPadX;
        else textX = cellX + cellPadX;

        const linesH = m.lines.length * (baseFontSize * lineFactor2);
        let textY;
        if (vAlign === "top") textY = cellY + cellPadY + baseFontSize;
        else if (vAlign === "bottom") textY = cellY + rowMaxH - cellPadY - (linesH - baseFontSize);
        else textY = cellY + (rowMaxH - linesH) / 2 + baseFontSize;

        doc.text(m.lines, textX, textY, { align: alignOpt });
      }

      gridY += rowMaxH;
    }

    blockBottomY = gridY;
  }

  return { bottomY: blockBottomY };
}

/* ===================== ANA: Cam Çıktısı ===================== */
export async function generateCamCiktisiPdf(ctx, pdfConfig, brandConfig) {
  
  const { requirements } = ctx;
  const doc = await createPdfDoc();
  const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : "helvetica");

  // 1) Header
  const { bottomY } = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);
  let cursorY = bottomY;

  // 2) Camlar tablosu (sections DB’de yok; biz çiziyoruz)
  const columns = [
    { header: "Cam İsmi", field: "cam_isim", align: "center", grow: 1 },
    { header: "Genişlik (mm)", field: "width_mm", align: "center", width: 90, format: "integer" },
    { header: "Yükseklik (mm)", field: "height_mm", align: "center", width: 100, format: "integer" },
    { header: "Adet", field: "count", align: "center", width: 60, format: "integer" },
    { header: "Metrekare (m²)", field: "m2", align: "center", width: 110, format: "number(2)" }
  ];

  // ✨ PDF render'ından hemen önce: sadece pdf.camCiktisi === true olan camları bırak
  const filteredRequirements = {
    ...requirements,
    systems: (requirements?.systems || []).map(sys => ({
      ...sys,
      glasses: (sys?.glasses || []).filter(g => g?.pdf?.camCiktisi === true)
    })),
    // extra_glasses de aynı kurala tabi olsun
    extra_glasses: (requirements?.extra_glasses || []).filter(g => g?.pdf?.camCiktisi === true)
  };

  const rowsRaw = mapGlass(filteredRequirements);
  // m2 her durumda float ve yuvarlamasız olsun: upstream'de yuvarlama varsa burada sıfırlıyoruz
  const rows = rowsRaw.map(r => {
    const w = Number(pick(r, "width_mm")) || 0;
    const h = Number(pick(r, "height_mm")) || 0;
    const c = Number(pick(r, "count")) || 0;
    // mm * mm * adet => mm² * adet. m²'ye çevirmek için 1e6'ya böl.
    const m2Float = (w * h * c) / 1e6;
    return { ...r, m2: m2Float };
  });

  if (rows.length > 0) {
    const head = [columns.map(c => c.header)];
    const body = rows.map(r => columns.map(
      c => formatCell(pick(r, c.field), c.format)
    ));

    autoTable(doc, {
      startY: cursorY,
      head, body,
      theme: "grid",
      // ✨ split header ile aynı görsel dil:
      // - çizgiler siyah
      // - metinler siyah
      // - çizgi kalınlığı 0.8 (header kutularıyla uyumlu)
      styles: {
        font: fontName,
        fontSize: 10,
        minCellHeight: 22,
        lineWidth: 0.8,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        font: fontName,
        fontStyle: "normal",
        fontSize: 11,
        fillColor: [120, 160, 210]
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      // tablo çerçevesi ve iç ızgara siyah
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.8,
      columnStyles: buildColumnStyles(columns),
      margin: { left: 39.5, right: 39.5 }
    });

    // sadece tablo varsa “Toplam Metrekare” kutusunu çiz
    const at = doc.lastAutoTable;
    const tableBottomY = at?.finalY || cursorY;
    const m2ColIndex = 4; // son sütun
    const firstHead = at?.table?.head?.[0];
    let m2ColX = null, m2ColW = null;
    if (firstHead?.cells) {
      m2ColX = firstHead.cells[m2ColIndex]?.x;
      m2ColW = firstHead.cells[m2ColIndex]?.width;
    }
    if (m2ColX == null || m2ColW == null) {
      const pageW = doc.internal.pageSize.getWidth();
      m2ColW = 110;
      m2ColX = pageW - 40 - m2ColW; // rightMargin = 40
    }

    const totalM2 = sumField(rows, "m2");
    const label = `Toplam Metrekare: ${formatCell(totalM2, "number(2)")}`;
    const fontSize = 10;
    const lineFactor2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
    const padX = 4, padY = 4;
    const lines = doc.splitTextToSize(label, Math.max(10, m2ColW - 2 * padX));
    const contentH = lines.length * (fontSize * lineFactor2);
    const boxH = Math.max(22, contentH + 2 * padY);


    doc.setLineWidth(0.8);
    doc.rect(m2ColX, tableBottomY, m2ColW, boxH, "S");

    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(fontSize);
    const textX = m2ColX + m2ColW / 2;
    const textY = tableBottomY + padY + fontSize;
    doc.text(lines, textX, textY, { align: "center" });
  }

  openPdf(doc);
}
