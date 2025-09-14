import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import * as actions_siparisler from "@/redux/actions/actions_siparisler";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import RobotoUrl from "@/assets/fonts/Roboto-Regular.ttf?url";

import Header from "@/components/mycomponents/Header";
import SiparisDetayHeaderReading from "./readingmode/SiparisDetayHeaderReading";
import OptimizasyonSecModal from "./OptimizasyonSecModal";
import optimizasyonYap from "../optimizasyon/optimizasyon";
import SiparisEdit from "./editmode/SiparisEdit";

const SiparisDetay = () => {
  const editRef = useRef(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  const siparis = useSelector((state) => state.getSiparisDetayReducer);
  const [editMode, setEditMode] = useState(false);
  const [showOptModal, setShowOptModal] = useState(false);

  // Fonksiyonun hook sırası bozulmasın diye en üstte
  const handlePdfExport = useCallback(async (type) => {
    const optSonuclar = optimizasyonYap(siparis, []);
    const doc = new jsPDF();

    // Font yükleme helper
    const arrayBufferToBase64 = (buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach((b) => binary += String.fromCharCode(b));
      return window.btoa(binary);
    };

    // Roboto fontu fetch edip ekle
    try {
      const res = await fetch(RobotoUrl);
      const buffer = await res.arrayBuffer();
      const base64Font = arrayBufferToBase64(buffer);
      doc.addFileToVFS("Roboto-Regular.ttf", base64Font);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto", "normal");
    } catch {
      console.warn("Font yükleme başarısız, default kullanılıyor");
    }

    doc.setFontSize(16);
    doc.text("Sipariş Optimizasyon Raporu", 14, 16);
    doc.setFontSize(12);
    doc.text(`Sipariş Adı: ${siparis.siparis_isim || siparis.siparisNo}`, 14, 26);

    // Tablo render fn
    const renderTable = (head, body, startY) => {
      autoTable(doc, {
        head, body, startY,
        styles: { font: doc.getFont().fontName, fontStyle: "normal", fontSize: 10 },
        headStyles: { fillColor: [220, 220, 220] },
        margin: { left: 14, right: 14 }
      });
      return doc.lastAutoTable.finalY + 10;
    };

    if (type === "detaysiz") {
      renderTable(
        [["Profil Adı", "Boy Sayısı"]],
        optSonuclar.map(r => [r.profilIsim, r.toplamBoySayisi]),
        36
      );
    } else {
      let y = 36;
      optSonuclar.forEach(r => {
        doc.setFontSize(12);
        doc.text(`${r.profilIsim} (${r.toplamBoySayisi} Boy)`, 14, y);
        y = renderTable(
          [["#", "Kesimler (mm)", "Fire/İlave (mm)"]],
          r.boyKesimler.map((line, idx) => {
            const [cuts, waste] = line.split("|").map(s => s.trim());
            return [idx + 1, cuts.replace(/^Boy \d+: Kesimler -> /, ""), waste.replace(/^(Fire|İlave) : /, "")];
          }),
          y + 6
        );
        if (y > 260) { doc.addPage(); y = 20; }
      });
    }

    // PDF'i yeni sekmede aç
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      console.warn('Yeni sekmede açma başarısız, indiriliyor...', e);
      doc.save(`${siparis.siparis_isim || siparis.siparisNo}_Optimizasyon.pdf`);
    }
  }, [siparis]);

  useEffect(() => {
    if (id) dispatch(actions_siparisler.getSiparisDetayFromApi(id));
  }, [dispatch, id]);

  if (!siparis || !siparis.urunler) return <div className="...">Yükleniyor...</div>;

  return (
    <>


      {!editMode ? (
        <div className="">
          <div className="grid grid-rows-[60px_1fr]">
            <div className="grid grid-cols-2 items-center">
              <Header title="Sipariş Detay" />
              <div className="ml-auto flex gap-2">
                <button className="btn max-w-40 ml-auto w-40 hover:btn-active active:btn-active bg-blue-700 border-blue-700 text-white text-lg font-roboto " >PDF Oluştur</button>

                <button className="btn max-w-40 ml-auto w-40 hover:btn-active active:btn-active bg-green-700 border-green-700 text-white text-lg font-roboto" onClick={() => setShowOptModal(true)}>Optimizasyon</button>
                <button className="btn max-w-40 ml-auto w-40 hover:btn-active active:btn-active bg-blue-700 border-blue-700 text-white text-lg font-roboto" onClick={() => setEditMode(true)}>Düzenle</button>
              </div>

            </div>
            <SiparisDetayHeaderReading siparis={siparis} urun={siparis.urunler[0]} />
          </div>
        </div>
      ) : (
        <div className="">
          <div className="grid grid-rows-[60px_1fr]">
            <div className="grid grid-cols-2 items-center">
              <Header title="Sipariş Detay" />
              <div className="ml-auto flex gap-2">
                <button
                  className="btn max-w-40 ml-auto w-40 hover:btn-active active:btn-active bg-green-700 border-green-700 text-white text-lg font-roboto"
                  onClick={() => editRef.current && editRef.current.submit()}
                >
                  Kaydet
                </button>
                <button
                  className="btn max-w-40 ml-auto w-40 hover:btn-active active:btn-active bg-red-700 border-red-700 text-white text-lg font-roboto"
                  onClick={() => setEditMode(false)}
                >
                  İptal Et
                </button>
              </div>

            </div>
            <SiparisEdit
              ref={editRef}

              siparis={siparis}
              onDone={() => setEditMode(false)} />
          </div>
        </div>
      )}
      <OptimizasyonSecModal open={showOptModal} onClose={() => setShowOptModal(false)} onSecim={(type) => { setShowOptModal(false); setTimeout(() => handlePdfExport(type), 200); }} />

    </>
  );
};

export default SiparisDetay;
