// src/utils/pdf/pdfPaint.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import optimizasyonYap from "@/scenes/optimizasyon/optimizasyon.js";
/* ───── yardımcılar ───── */
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
function openPdf(doc, filename = "boya-ciktisi.pdf") {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) { doc.save(filename); URL.revokeObjectURL(url); }
}

/* ───── split header (brand + pdf.infoRows birleştirme) ───── */
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

  // sol kutu
  const leftRequestedW = Number(headerCfg?.leftImage?.width || 260);
  const leftX = leftMargin, topY = 40;

  // sağ blok
  const rightX = leftX + leftRequestedW;
  const rightW = Math.max(180, pageW - rightMargin - rightX);
  let rightCursorY = topY;

  // (4) Brand title hep merkezde
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

  // sağ bilgi satırları (varsa)
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

  // sol logo kutusu sağ yükseklikle eşit
  const rightBottom = rightCursorY;
  const leftFinalW = leftRequestedW;
  const leftFinalH = rightBottom - topY;
  doc.setLineWidth(0.8);
  doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

  // (3) Logo: sadece public/logo.png, orantılı ve ortalanmış şekilde
  try {
    const resp = await fetch("/logo.png");
    if (resp.ok) {
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

      const imgW = img.width;
      const imgH = img.height;
      const ratio = imgW / imgH;

      let drawW = boxW;
      let drawH = drawW / ratio;
      if (drawH > boxH) { drawH = boxH; drawW = drawH * ratio; }

      const x = leftX + inset + (boxW - drawW) / 2;
      const y = topY + inset + (boxH - drawH) / 2;

      doc.addImage(leftImg, headerCfg?.leftImage?.type || "PNG", x, y, drawW, drawH);
    }
  } catch (e) {
    console.warn("logo.png yüklenemedi:", e);
  }

  // infoRows
  const layout = headerCfg?.infoRowsLayout || {};
  const COLS = Math.min(3, Number(layout.columnsPerRow) || 3);
  const cellPadX = Number(layout.cellPaddingX ?? 6);
  const cellPadY = Number(layout.cellPaddingY ?? 6);
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
  for (let i = 0; i < items.length; i += COLS) rows.push(items.slice(i, i + COLS));

  let bottomY = rightBottom;
  if (rows.length) {
    setFontSafe(doc, fontName, "normal");
    doc.setFontSize(baseFontSize);
    const lfac = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;

    let gy = bottomY;
    for (const rowItems of rows) {
      const cellW = gridW / rowItems.length;
      // satır yüksekliği ölç
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
        const contentH = Math.max(baseFontSize * lfac, lines.length * (baseFontSize * lfac));
        const boxH = Math.max(22, contentH + 2 * cellPadY);
        rowMaxH = Math.max(rowMaxH, boxH);
        return { it, lines };
      });

      // çizim
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

  return { bottomY, leftMargin, rightMargin };
}

/* ───── ANA: Boya Çıktısı ───── */
export async function generatePaintPdf(ctx, pdfConfig, brandConfig) {
  const { dispatch, getProfilImageFromApi, requirements } = ctx;

  const doc = await createPdfDoc();
  const header = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);

  // (5) infoRows biter bitmez tablo başlasın (hiç ekstra boşluk yok)
  let cursorY = header.bottomY;

  /* (2) PDF filtresi: yalnızca pdf.boyaCiktisi === true olan profiller */
const filteredRequirements = {
  ...requirements,
  systems: (requirements?.systems || []).map(sys => ({
    ...sys,
    profiles: (sys?.profiles || [])
      .filter(p => p?.pdf?.boyaCiktisi === true)
      .slice()
      .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
  }))
};
  // opt. girdisi (filtrelenmiş profiller)
  const siparis = {
    urunler: (filteredRequirements.systems || []).map(sys => ({
      hesaplananGereksinimler: {
        profiller: (sys.profiles || []).map(p => ({
          profil_id: p.profile_id,
          profil: {
            profil_isim: p.profile?.profil_isim,
            boy_uzunluk: p.profile?.boy_uzunluk,
            birim_agirlik: p.profile?.birim_agirlik
          },
          hesaplanan_degerler: {
            kesim_olcusu: p.cut_length_mm,
            kesim_adedi: p.cut_count
          }
        }))
      }
    }))
  };

  // optimizasyon (varsa)
  // optimizasyon (import ile)
  let optimSonuclar = [];
  try {
    optimSonuclar = optimizasyonYap(siparis);
  } catch (e) {
    console.warn("optimizasyonYap çalıştırılamadı:", e);
    optimSonuclar = [];
  }

  // kesit görselleri (yalnızca body’de kullanılacak profiller için)
  const imageMap = {};
  await Promise.all(
    optimSonuclar.map(res => {
      // filteredRequirements üzerinden kod/isim bulacağız; id’yi kullanıp görsel al
      const entry = (filteredRequirements.systems || []).flatMap(s => s.profiles).find(p => p.profile_id === res.profilId);
      if (!entry) return Promise.resolve();
      return dispatch(getProfilImageFromApi(entry.profile_id)).then(d => { imageMap[res.profilId] = d; }).catch(() => { });
    })
  );

  // tablo başlıkları aynı
  const head = [['Profil Kodu', 'Profil Kesit', 'Profil Adı', 'Adet', 'Boy (mm)', 'Birim Kilo (kg)', 'Toplam Kilo (kg)']];

  // (2) body: yalnız filtrelenmiş kayıtlardan
  const body = optimSonuclar.map(res => {
    const entry = (filteredRequirements.systems || []).flatMap(s => s.profiles).find(p => p.profile_id === res.profilId);
    const kod = entry?.profile?.profil_kodu || '-';
    const isim = entry?.profile?.profil_isim || '-';
    const boy = Number(entry?.profile?.boy_uzunluk || 0);
    const birimKg = Number(entry?.profile?.birim_agirlik || 0);
    const adet = Number(res?.toplamBoySayisi || 0);
    const toplamKg = adet * boy / 1000 * birimKg;
    return [kod, '', isim, adet, boy, birimKg.toFixed(2), toplamKg.toFixed(2)];
  });

  // (2) satır yoksa tablo hiç çizme
  if (body.length > 0) {
    const IMG_MAX_W = 35;   // pt cinsinden maksimum genişlik (A4 pt: 595 x 842)
    const IMG_PAD   = 2;    // hücre içi kenar boşluğu
   
    autoTable(doc, {
      startY: cursorY,
      head,
      body,
      theme: 'grid',
        styles: {
          font: 'Roboto', fontSize: 10, minCellHeight: 22,
          halign: 'center', valign: 'middle',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        headStyles: { font: 'Roboto', fontStyle: 'normal', fontSize: 11, fillColor: [120, 160, 210],  lineColor: [0, 0, 0],         // sütun ayırıcı çizgiler siyah
  lineWidth: 0.5     },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        headStyles: { font: 'Roboto', fontStyle: 'normal', fontSize: 11, fillColor: [120, 160, 210],  lineColor: [0, 0, 0],         // sütun ayırıcı çizgiler siyah
  lineWidth: 0.5     },
      columnStyles: {
        // Profil Kesit kolonu = index 1
        // Hücre genişliği, görüntünün max-width + padding olacak şekilde sabitleniyor
        1: { cellWidth: (IMG_MAX_W + 2 * IMG_PAD), halign: 'center', valign: 'middle' }
      },
      // 1) satır yüksekliğini ÖNCEDEN görüntü boyuna göre ayarlıyoruz (sığdırma yok)
      didParseCell: (data) => {
        if (data.section !== 'body' || data.column.index !== 1) return;
        const resObj = optimSonuclar[data.row.index];
        const pid = resObj?.profilId;
        const img = pid != null ? imageMap[pid] : null;
        if (typeof img !== 'string' || !img.startsWith('data:image')) return;
        try {
          const props = doc.getImageProperties(img); // { width, height, ... } (px cinsinden; oran için kullanıyoruz)
          const ratio = props.width / props.height;
          const drawW = IMG_MAX_W;        // sadece max-width uyguluyoruz
          const drawH = drawW / ratio;    // oran korunuyor

          // Hücre minimum yüksekliğini görsel yüksekliğine göre büyüt
          const needed = drawH + 2 * IMG_PAD;
          data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, needed);
        } catch {}
      },
      // 2) çizimde ise hücreye sığdırma YOK — sadece max-width'e göre, merkezde çiz
      didDrawCell: data => {
    if (data.section !== 'body' || data.column.index !== 1) return;
    const resObj = optimSonuclar[data.row.index];
    const pid = resObj?.profilId;
    const img = pid != null ? imageMap[pid] : null;
    if (typeof img !== 'string' || !img.startsWith('data:image')) return;

    const cellX = data.cell.x + IMG_PAD;
    const cellY = data.cell.y + IMG_PAD;
    const cellW = data.cell.width  - 2 * IMG_PAD;
    const cellH = data.cell.height - 2 * IMG_PAD;

    try {
     // SENKRON: en-boy özelliklerini jsPDF'ten al
      const props = doc.getImageProperties(img);
      const ratio = props.width / props.height;
      const drawW = Math.min(IMG_MAX_W, cellW); // güvenlik: hücre genişliğinden taşmasın
      const drawH = drawW / ratio;
      const dx = cellX + (cellW - drawW) / 2;  // yatay merkez
      const dy = cellY + (cellH - drawH) / 2;  // dikey merkez (satır yüksekliği önceden artırıldı)


      // formatı data URL'den tespit et (PNG/JPEG); PNG'ye zorlamayalım
      const fmt = img.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
      doc.addImage(img, fmt, dx, dy, drawW, drawH);
    } catch (e) {
      console.warn('Profil kesit resmi çizilemedi:', e);
    }
      },
      margin: { left: 40, right: 40 }
    });

    // (7) GENEL TOPLAM KİLO kutusu: "Toplam Kilo (kg)" kolonunun tam altında, aynı genişlikte
    const at = doc.lastAutoTable;
    const tableBottomY = at?.finalY || cursorY;

    // head -> son kolon bilgisi (index 6)
    const colIndex = 6;
    const headRow = at?.table?.head?.[0];
    let colX = null, colW = null;

    if (headRow?.cells) {
      colX = headRow.cells[colIndex]?.x;
      colW = headRow.cells[colIndex]?.width;
    } else if (Array.isArray(headRow)) {
      colX = headRow[colIndex]?.x;
      colW = headRow[colIndex]?.width;
    }

    // fallback (her ihtimale karşı)
    if (colX == null || colW == null) {
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 40, rightMargin = 40;
      // yaklaşık: son kolonu sabit 110pt gibi kabul et
      colW = 110;
      colX = pageWidth - rightMargin - colW;
    }

    // Genel toplamı, satırlardaki ham verilerden yeniden ve tam hassasiyetle hesapla:
    const genelToplamKg = optimSonuclar.reduce((sum, res) => {
      const entry = (filteredRequirements.systems || []).flatMap(s => s.profiles).find(p => p.profile_id === res.profilId);
      if (!entry) return sum;
      const boy = Number(entry?.profile?.boy_uzunluk || 0);
      const birimKg = Number(entry?.profile?.birim_agirlik || 0);
      const adet = Number(res?.toplamBoySayisi || 0);
      const toplam = adet * boy / 1000 * birimKg; // kg
      return sum + toplam;
    }, 0);
    const label = `Toplam Kilo: ${genelToplamKg.toFixed(2)} kg`;

    const fontSize = 10;
    const lineFactor2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
    const padX = 4, padY = 4;
    const lines = doc.splitTextToSize(label, Math.max(10, colW - 2 * padX));
    const contentH = lines.length * (fontSize * lineFactor2);
    const boxH = Math.max(22, contentH + 2 * padY);

    // tablo çizgi rengi ile aynı tonu yakala
    const lineClr =
      at?.styles?.lineColor ??
      at?.settings?.styles?.lineColor ??
      at?.table?.styles?.lineColor ??
      [0, 0, 0];

    if (Array.isArray(lineClr)) doc.setDrawColor(lineClr[0], lineClr[1], lineClr[2]);
    else if (typeof lineClr === "number") doc.setDrawColor(lineClr);
    else doc.setDrawColor(0, 0, 0);

    doc.setLineWidth(0.8);
    doc.rect(colX, tableBottomY + 0, colW, boxH, "S"); // hemen altında (0 boşluk)

    setFontSafe(doc, 'Roboto', 'normal');
    doc.setFontSize(fontSize);
    const textX = colX + colW / 2;
    const textY = tableBottomY + padY + fontSize;
    doc.text(lines, textX, textY, { align: "center" });
  }
  openPdf(doc);
}
