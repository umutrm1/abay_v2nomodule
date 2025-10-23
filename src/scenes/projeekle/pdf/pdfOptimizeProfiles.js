// src/utils/pdf/pdfOptimizeProfiles.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import optimizasyonYap from "@/scenes/optimizasyon/optimizasyon.js";

/**
 * Optimize Profiller PDF
 * @param {Object} ctx  (dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements)
 * @param {'detayli'|'detaysiz'} type
 * @param {Object} pdfConfig   (infoRowsLayout + infoRows)
 * @param {Object} brandConfig (splitBrand)
 */
export async function generateOptimizeProfilesPdf(ctx, type = 'detayli', pdfConfig, brandConfig) {
  const { dispatch, getProfilImageFromApi, requirements } = ctx;

  /* yardımcılar (font + header) */
  async function arrayBufferToBase64(buf) {
    return new Promise((res, rej) => {
      const blob = new Blob([buf], { type: "font/ttf" });
      const r = new FileReader();
      r.onloadend = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(blob);
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
    // başlangıç fontunu bold yap
    doc.setFont("Roboto", "bold");
    return doc;
  }
  function setFontSafe(doc, family, style = "bold") {
    try {
      const list = doc.getFontList?.() || {};
      const styles = list?.[family];
      if (Array.isArray(styles)) {
        if (styles.includes(style)) { doc.setFont(family, style); return; }
        if (styles.includes("bold")) { doc.setFont(family, "bold"); return; }
        if (styles.includes("normal")) { doc.setFont(family, "normal"); return; }
      }
    } catch { }
    doc.setFont("helvetica", style === "bold" ? "bold" : "normal");
  }
  function openPdf(doc, filename = "optimizasyon.pdf") {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) { doc.save(filename); URL.revokeObjectURL(url); }
  }

  async function drawSplitHeader(doc, brandConfig, pdfConfig, ctx) {
    const headerCfg = { ...(brandConfig || {}), infoRowsLayout: pdfConfig?.infoRowsLayout, infoRows: pdfConfig?.infoRows };

    const pageW = doc.internal.pageSize.getWidth(), leftMargin = 40, rightMargin = 40, padX = 8, padY = 6;
    const baseFontSize = 9, titleFontSize = 9; // tüm font size 9
    const lfac = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
    const fontName = (doc.getFontList?.()["Roboto"] ? "Roboto" : (doc.getFont().fontName || "helvetica"));

    const leftRequestedW = Number(headerCfg?.leftImage?.width || 260), leftX = leftMargin, topY = 5; // topY 5
    const rightX = leftX + leftRequestedW, rightW = Math.max(180, pageW - rightMargin - rightX); let ry = topY;

    // BRAND TITLE: center
    if (headerCfg?.rightBox?.title) {
      setFontSafe(doc, fontName, "bold");
      doc.setFontSize(titleFontSize);
      const t = String(headerCfg.rightBox.title);
      const titleH = titleFontSize * lfac + 2 * padY;
      doc.setLineWidth(0.8);
      doc.rect(rightX, ry, rightW, titleH, "S");
      const centerX = rightX + rightW / 2;
      const centerY = ry + titleH / 2 + titleFontSize / 3; // optik dengeleme
      doc.text(t, centerX, centerY, { align: "center" });
      ry += titleH;
    }

    // Sağ kutudaki satırlar
    const rLines = Array.isArray(headerCfg?.rightBox?.lines) ? headerCfg.rightBox.lines : [];
    for (const line of rLines) {
      setFontSafe(doc, fontName, "bold");
      const txt = (line.type === "labelValue")
        ? ((line.label ? (String(line.label) + ": ") : "") + (line.value ?? ""))
        : (String(line.text || line.value || line.href || ""));
      const lines = doc.splitTextToSize(txt, Math.max(10, rightW - 2 * padX));
      const h = Math.max(22, lines.length * (baseFontSize * lfac) + 2 * padY);
      doc.setLineWidth(0.8);
      doc.rect(rightX, ry, rightW, h, "S");
      doc.setFontSize(baseFontSize);
      doc.text(lines, rightX + padX, ry + padY + baseFontSize, { align: "left" });
      if (line.type === "link" && line.href) {
        try { doc.link(rightX + padX, ry + padY, rightW - 2 * padX, baseFontSize * lfac, { url: line.href }); } catch { }
      }
      ry += h;
    }

    // Sol LOGO kutusu
    const rightBottom = ry, leftFinalW = leftRequestedW, leftFinalH = rightBottom - topY;
    doc.setLineWidth(0.8);
    doc.rect(leftX, topY, leftFinalW, leftFinalH, "S");

    // LOGO: public/logo.png
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

        const ratio = img.width / img.height;

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

    // infoRows grid
    const layout = headerCfg?.infoRowsLayout || {};
    const COLS = Math.min(3, Number(layout.columnsPerRow) || 3);
    const cellPadX = Number(layout.cellPaddingX ?? 6), cellPadY = Number(layout.cellPaddingY ?? 6);
    const gridLeftX = leftMargin, gridRight = pageW - rightMargin, gridW = gridRight - gridLeftX;

    const itemsAll = Array.isArray(headerCfg?.infoRows) ? headerCfg.infoRows : [];
    const items = itemsAll.filter(it => it == null ? false : (it.enabled !== false));
    const getByPath = (o, p) => !o || !p ? "" : String(p).split(".").reduce((a, k) => a && a[k] != null ? a[k] : undefined, o);
    const evalExpr = (expr) => /^date\(/i.test(expr) ? (() => {
      const inner = expr.slice(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
      const raw = getByPath(ctx, inner);
      if (!raw) return "";
      const d = new Date(raw);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
    })() : "";
    const getValue = it => it.valueExpr ? evalExpr(it.valueExpr) : it.valueField ? (getByPath(ctx, it.valueField) ?? "") : "";

    const rows = []; for (let i = 0; i < items.length; i += COLS) rows.push(items.slice(i, i + COLS));
    let bottomY = rightBottom;
    if (rows.length) {
      setFontSafe(doc, fontName, "bold");
      doc.setFontSize(baseFontSize);
      const l2 = (typeof doc.getLineHeightFactor === "function") ? doc.getLineHeightFactor() : 1.15;
      let gy = bottomY;
      for (const rowItems of rows) {
        const cellW = gridW / rowItems.length;
        let rowMaxH = 22;
        const prepared = rowItems.map(it => {
          const label = String(it.label ?? ""), val = String(getValue(it) ?? ""), mode = it.labelMode || "inline";
          let text = ""; if (mode === "hidden") text = val; else if (mode === "stack") text = (label ? (label + ":") : "") + "\n" + val; else text = label ? (label + ": " + val) : val;
          const lines = doc.splitTextToSize(text, Math.max(10, cellW - 2 * cellPadX));
          const contentH = Math.max(baseFontSize * l2, lines.length * (baseFontSize * l2));
          const boxH = Math.max(22, contentH + 2 * cellPadY); rowMaxH = Math.max(rowMaxH, boxH);
          return { it, lines, cellW, rowMaxH: boxH };
        });
        let cx = gridLeftX;
        for (const m of prepared) {
          doc.setLineWidth(0.8);
          doc.rect(cx, gy, m.cellW, rowMaxH, "S");
          const hAlign = (m.it.hAlign || "left"), vAlign = (m.it.vAlign || "middle");
          const alignOpt = hAlign === "center" ? "center" : hAlign === "right" ? "right" : "left";
          let tx; if (hAlign === "center") tx = cx + m.cellW / 2; else if (hAlign === "right") tx = cx + m.cellW - cellPadX; else tx = cx + cellPadX;
          const linesH = m.lines.length * (baseFontSize * l2);
          let ty; if (vAlign === "top") ty = gy + cellPadY + baseFontSize; else if (vAlign === "bottom") ty = gy + rowMaxH - cellPadY - (linesH - baseFontSize); else ty = gy + (rowMaxH - linesH) / 2 + baseFontSize;
          doc.text(m.lines, tx, ty, { align: alignOpt });
          cx += m.cellW;
        }
        gy += rowMaxH;
      }
      bottomY = gy;
    }
    return { bottomY, leftMargin, rightMargin };
  }

  const doc = await createPdfDoc();
  const header = await drawSplitHeader(doc, brandConfig, pdfConfig, ctx);
  let cursorY = header.bottomY; // infoRows biter bitmez hemen altında başla

  /* PDF filtresi: render'dan hemen önce profilleri süz */
  const shouldIncludeProfile = (p) => {
    const f = p?.pdf || {};
    return (type === 'detayli')
      ? (f.optimizasyonDetayliCiktisi === true)
      : (f.optimizasyonDetaysizCiktisi === true);
  };

  const filteredRequirements = {
    ...requirements,
    systems: (requirements?.systems || []).map(sys => ({
      ...sys,
      profiles: (sys?.profiles || [])
        .filter(shouldIncludeProfile)
        .slice()
        .sort((a, b) => (a?.order_index ?? 0) - (b?.order_index ?? 0))
    }))
  };

  // optimizasyon girdisi
  const siparis = {
    urunler: (filteredRequirements.systems || []).map(sys => ({
      hesaplananGereksinimler: {
        profiller: (sys.profiles || []).map(p => ({
          profil_id: p.profile_id,
          profil: p.profile,
          hesaplanan_degerler: {
            kesim_olcusu: p.cut_length_mm,
            kesim_adedi: p.cut_count
          }
        }))
      }
    }))
  };
  const results = optimizasyonYap(siparis);

  // ==== FIRE (mm) TOPLAMLARI ve BİRİM AĞIRLIKLAR ====
  // profilId -> { birim_agirlik(kg/m), profil_kodu }
  const profileMetaMap = new Map();
  for (const sys of filteredRequirements.systems || []) {
    for (const p of sys.profiles || []) {
      profileMetaMap.set(p.profile_id, {
        birim_agirlik: Number(p.profile?.birim_agirlik || 0),
        profil_kodu: p.profile?.profil_kodu || ""
      });
    }
  }

  // profilId -> toplam fire (mm)
  const fireMmByProfile = new Map();
  results.forEach(res => {
    let sumMm = 0;
    if (Array.isArray(res.boyKesimlerDetay) && res.boyKesimlerDetay.length) {
      sumMm = res.boyKesimlerDetay.reduce((acc, b) => acc + Number(b.waste || 0), 0);
    } else if (Array.isArray(res.boyKesimler) && res.boyKesimler.length) {
      for (const line of res.boyKesimler) {
        const m = String(line).match(/Fire:\s*(\d+)\s*mm/i);
        if (m) sumMm += Number(m[1] || 0);
      }
    }
    fireMmByProfile.set(res.profilId, sumMm);
  });

  // kesit görselleri
  const imageMap = {};
  await Promise.all(
    results.map(res =>
      dispatch(getProfilImageFromApi(res.profilId))
        .then(dataUrl => { imageMap[res.profilId] = dataUrl; })
        .catch(() => { })
    )
  );

  // Ortak marginler
  const leftMargin = 40;
  const rightMargin = 40;

  let tableEndY = cursorY; // tablo alt sınırı (kutu nereye çizilecek?)

  if (type === 'detaysiz') {
    // ---------- DETAYSIZ: Profil toplamları ----------
    const head = [['Profil Kodu', 'Profil Kesit', 'Profil İsmi', 'Boy Sayısı', 'Fire(kg)']];

    const body = results.map(res => {
      // kod
      let kod = '';
      for (const sys of filteredRequirements.systems || []) {
        const entry = (sys.profiles || []).find(p => p.profile_id === res.profilId);
        if (entry) { kod = entry.profile?.profil_kodu || ''; break; }
      }
      // toplam fire kg = (toplam_fire_mm / 1000) * birim_agirlik
      const birimAg = Number(profileMetaMap.get(res.profilId)?.birim_agirlik || 0);
      const toplamFireMm = Number(fireMmByProfile.get(res.profilId) || 0);
      const toplamFireKg = (toplamFireMm / 1000) * birimAg;

      return [kod, '', res.profilIsim, String(res.toplamBoySayisi), toplamFireKg.toFixed(2)];
    });

    if (body.length > 0) {
      const IMG_PAD = 2;
      const IMG_MAX_W = 35;
      autoTable(doc, {
        head, body, startY: cursorY, theme: 'grid',
        styles: {
          font: 'Roboto', fontStyle: 'bold', fontSize: 9, minCellHeight: 22,
          halign: 'center', valign: 'middle',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        headStyles: { font: 'Roboto', fontStyle: 'bold', fontSize: 9, fillColor: [120, 160, 210], lineColor: [0, 0, 0], lineWidth: 0.5 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: IMG_MAX_W + 2 * IMG_PAD, halign: "center" },
          2: { cellWidth: 266 }, // isim (düşürüldü)
          3: { cellWidth: 65 },  // boy sayısı (düşürüldü)
          4: { cellWidth: 65 }   // Fire(kg)   (düşürüldü)
        },
        

        didParseCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 1) return;
          const pid = results[data.row.index]?.profilId;
          const img = imageMap[pid];
          if (!img) return;
          try {
            const props = doc.getImageProperties(img);
            const ratio = props.width / props.height;
            const drawH = IMG_MAX_W / ratio;
            const needMinH = drawH + 2 * IMG_PAD;
            if (!data.cell.styles.minCellHeight || data.cell.styles.minCellHeight < needMinH) {
              data.cell.styles.minCellHeight = needMinH;
            }
          } catch {}
        },

        didDrawCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 1) return;
          const pid = results[data.row.index]?.profilId;
          const img = imageMap[pid];
          if (!img) return;

          try {
            const props = doc.getImageProperties(img);
            const ratio = props.width / props.height;
            const drawW = IMG_MAX_W;
            const drawH = drawW / ratio;

            const dx = data.cell.x + (data.cell.width  - drawW) / 2;
            const dy = data.cell.y + (data.cell.height - drawH) / 2;
            const fmt = img.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
            doc.addImage(img, fmt, dx, dy, drawW, drawH);
          } catch (e) {
            console.warn("Profil kesit resmi çizilemedi:", e);
          }
        },

        margin: { left: leftMargin, right: rightMargin }
      });

      tableEndY = (doc.lastAutoTable?.finalY ?? cursorY);
    }

  } else {
    // ---------- DETAYLI: Her boy satırı için fire kg ----------
    const head = [['Profil Kodu', 'Profil Kesit', 'Profil İsmi', 'Boy No', 'Kesimler', 'Fire (mm)', 'Fire(kg)']];
    const body = [];
    const rowProfileIds = [];

    results.forEach(res => {
      // ortak meta
      const birimAg = Number(profileMetaMap.get(res.profilId)?.birim_agirlik || 0);

      let kod = '';
      for (const sys of filteredRequirements.systems || []) {
        const entry = (sys.profiles || []).find(p => p.profile_id === res.profilId);
        if (entry) { kod = entry.profile?.profil_kodu || ''; break; }
      }

      if (Array.isArray(res.boyKesimlerDetay) && res.boyKesimlerDetay.length) {
        res.boyKesimlerDetay.forEach((st, idx) => {
          const wasteMm = Number(st.waste || 0);
          const fireKg = (wasteMm / 1000) * birimAg;
          body.push([kod, '', res.profilIsim, String(idx + 1), (st.cuts || []).join(', '), String(wasteMm), fireKg.toFixed(2)]);
          rowProfileIds.push(res.profilId);
        });
      } else {
        (res.boyKesimler || []).forEach(line => {
          const m = String(line).match(/Boy\s*(\d+):\s*Kesimler\s*->\s*(.*?)\s*\|\s*Fire:\s*(\d+)\s*mm/i);
          if (m) {
            const wasteMm = Number(m[3] || 0);
            const fireKg = (wasteMm / 1000) * birimAg;
            body.push([kod, '', res.profilIsim, m[1], m[2], m[3], fireKg.toFixed(2)]);
            rowProfileIds.push(res.profilId);
          }
        });
      }
    });

    if (body.length > 0) {
      const IMG_PAD = 2;
      const IMG_MAX_W = 35;
      autoTable(doc, {
        head, body, startY: cursorY, theme: 'grid',
        styles: {
          font: 'Roboto', fontStyle: 'bold', fontSize: 9, minCellHeight: 22,
          halign: 'center', valign: 'middle',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.5,
        headStyles: { font: 'Roboto', fontStyle: 'bold', fontSize: 9, fillColor: [120, 160, 210], lineColor: [0, 0, 0], lineWidth: 0.5 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: IMG_MAX_W + 2 * IMG_PAD, halign: "center" },
          // diğer kolonlar otomatik; genişlikler toplam sayfaya göre dağıtılır
        },

        didParseCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 1) return;
          const pid = rowProfileIds[data.row.index];
          const img = imageMap[pid];
          if (!img) return;
          try {
            const props = doc.getImageProperties(img);
            const ratio = props.width / props.height;
            const drawH = IMG_MAX_W / ratio;
            const needMinH = drawH + 2 * IMG_PAD;
            if (!data.cell.styles.minCellHeight || data.cell.styles.minCellHeight < needMinH) {
              data.cell.styles.minCellHeight = needMinH;
            }
          } catch {}
        },

        didDrawCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 1) return;
          const pid = rowProfileIds[data.row.index];
          const img = imageMap[pid];
          if (!img) return;

          try {
            const props = doc.getImageProperties(img);
            const ratio = props.width / props.height;
            const drawW = IMG_MAX_W;
            const drawH = drawW / ratio;

            const dx = data.cell.x + (data.cell.width  - drawW) / 2;
            const dy = data.cell.y + (data.cell.height - drawH) / 2;
            const fmt = img.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
            doc.addImage(img, fmt, dx, dy, drawW, drawH);
          } catch (e) {
            console.warn("Profil kesit resmi çizilemedi:", e);
          }
        },

        margin: { left: leftMargin, right: rightMargin }
      });

      tableEndY = (doc.lastAutoTable?.finalY ?? cursorY);
    }
  }

  // ==== TOPLAM FIRE (kg) ====
  // Formül: (fire_mm / 1000) * birim_agirlik(kg/m)  -> kg
  let toplamFireKg = 0;
  for (const [profilId, fireMm] of fireMmByProfile.entries()) {
    const meta = profileMetaMap.get(profilId) || { birim_agirlik: 0 };
    const metre = Number(fireMm || 0) / 1000; // mm -> m
    const kg = metre * Number(meta.birim_agirlik || 0); // kg
    toplamFireKg += kg;
  }

  // Değeri kutu içinde, tablonun altına sağ tarafa yazdır
  const pageWidth = doc.internal.pageSize.getWidth();
  const fontSize = 9;
  const padX2 = 6, padY2 = 6;
  const boxW = 220; // sağda kompakt kutu
  const colX = pageWidth - rightMargin - boxW;
  const label = `Toplam Fire(kg) : ${toplamFireKg.toFixed(2)}`;
  const lines = doc.splitTextToSize(label, boxW - 2 * padX2);
  const lineFactor = typeof doc.getLineHeightFactor === "function" ? doc.getLineHeightFactor() : 1.15;
  const contentH = lines.length * (fontSize * lineFactor);
  const boxH = Math.max(22, contentH + 2 * padY2);

  // Yeni sayfaya taşma kontrolü
  let drawY = tableEndY + 8;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (drawY + boxH + 20 > pageHeight) {
    doc.addPage();
    drawY = 40; // yeni sayfada üstten makul boşluk
  }

  doc.setLineWidth(0.8);
  doc.rect(colX, drawY, boxW, boxH, "S");
  setFontSafe(doc, 'Roboto', 'bold');
  doc.setFontSize(fontSize);
  doc.text(lines, colX + padX2, drawY + padY2 + fontSize);

  openPdf(doc);
}
