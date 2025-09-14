import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions_siparisler from '@/redux/actions/actions_siparisler';
import * as actions_sistemler from '@/redux/actions/actions_sistemler';
import * as actions_projeler from '@/redux/actions/actions_projeler';
import * as actions_bayiler from '@/redux/actions/actions_bayiler';
import * as actions_musteriler from '@/redux/actions/actions_musteriler';
import * as math from 'mathjs';

// Icons
import { ReactComponent as User } from '@/icons/user_v2.svg';
import { ReactComponent as Clipboard } from '@/icons/clipboard-list_v2.svg';
import { ReactComponent as Wrench } from '@/icons/wrench_v2.svg';
import { ReactComponent as Paintbrush } from '@/icons/paintbrush.svg';
import { ReactComponent as PencilRuler } from '@/icons/pencil-ruler_v2.svg';

// Components
import Header from '@/components/mycomponents/Header';
import GiyotinSiparisTables from './GiyotinSiparisTables';
import DialogProjeSec from './DialogProjeSec';
import DialogSistemSec from './DialogSistemSec';
import DialogEkstraMalzemeler from './DialogEkstraMalzemeler';

const getFormattedDate = () => {
  const t = new Date();
  return `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`;
};

/**
 * Düzenleme modunda kullanılacak sipariş formu.
 */
const SiparisEdit = forwardRef(({ siparis, onDone }, ref) => {
  useImperativeHandle(ref, () => ({ submit: handleSubmit }));
  const [seciliSistem, setSeciliSistem] = useState(null);

  const dispatch = useDispatch();
  const urun = siparis?.urunler?.[0] || {};


  // Load dropdown data
  useEffect(() => {
    dispatch(actions_sistemler.getSistemlerFromApi());
    dispatch(actions_projeler.getProjelerFromApi());
    dispatch(actions_bayiler.getBayilerFromApi());
    dispatch(actions_musteriler.getMusterilerFromApi());
  }, [dispatch]);

  const sistemler = useSelector(s => s.getSistemlerFromApiReducer) || [];
  const projeler = useSelector(s => s.getProjelerFromApiReducer) || [];
  const bayiler = useSelector(s => s.getBayilerFromApiReducer) || [];
  const musteriler = useSelector(s => s.getMusterilerFromApiReducer) || [];

  useEffect(() => {
    // urun.sistem_id siparisten geliyor
    const sistemId = urun?.sistem_id;
    if (sistemId && sistemler.length > 0) {
      const bulunandan = sistemler.find(s => s.id === sistemId) || null;
      setSeciliSistem(bulunandan);
    }
  }, [sistemler, urun?.sistem_id]);
  // Form state
  const [siparisIsim, setSiparisIsim] = useState(siparis?.siparis_isim || '');
  const [siparisTarihi, setSiparisTarihi] = useState(siparis?.siparisTarihi || getFormattedDate());
  const [seciliProje, setSeciliProje] = useState(siparis?.proje || null);
  const [seciliMusteri, setSeciliMusteri] = useState(siparis?.musteri || null);
  const [seciliRenk, setSeciliRenk] = useState(urun?.renk || '');
  const [sistemGenislik, setSistemGenislik] = useState(urun?.girilenOlculer?.genislik || 0);
  const [sistemYukseklik, setSistemYukseklik] = useState(urun?.girilenOlculer?.yukseklik || 0);
  const [sistemAdet, setSistemAdet] = useState(urun?.girilenOlculer?.adet || 1);
  const [ekstraMalzemeler, setEkstraMalzemeler] = useState(
    urun?.ekstraGereksinimler || { profiller: [], camlar: [], diger_malzemeler: [] }
  );

  // Update customer when project changes
  useEffect(() => {
    if (!seciliProje) return setSeciliMusteri(null);
    const cus = musteriler.find(m => m.id === seciliProje.proje_musteri_id)
      || bayiler.find(b => b.id === seciliProje.proje_musteri_id);
    setSeciliMusteri(cus || null);
  }, [seciliProje, musteriler, bayiler]);

  const guvenliHesapla = useCallback((expr, scope) => {
    try { const v = math.evaluate(expr, scope); return isFinite(v) ? v : 0; } catch { return 0; }
  }, []);

  const handleSubmit = () => {
    if (!siparisIsim.trim()) return;
    const scope = { sistem_genislik: +sistemGenislik, sistem_yukseklik: +sistemYukseklik, sistem_adet: +sistemAdet };
    const req = urun?.hesaplananGereksinimler || { profiller: [], camlar: [], diger_malzemeler: [] };
    const hesaplananProfiller = req.profiller.map(p => ({
      profil_id: p.profil_id,
      profil: p.profil,
      formuller: p.formuller,
      hesaplanan_degerler: {
        kesim_olcusu: guvenliHesapla(p.formuller.kesim_olcusu, scope),
        kesim_adedi: guvenliHesapla(p.formuller.kesim_adedi, scope)
      }
    }));

    const { musteri, ...restSiparis } = siparis;

    const updated = {
      ...restSiparis,
      siparis_isim: siparisIsim,
      siparisTarihi,
      urunler: [{
        ...urun,
        renk: seciliRenk,
        girilenOlculer: {
          genislik: scope.sistem_genislik,
          yukseklik: scope.sistem_yukseklik,
          adet: scope.sistem_adet
        },
        hesaplananGereksinimler: {
          profiller: hesaplananProfiller,
          camlar: req.camlar,
          diger_malzemeler: req.diger_malzemeler
        },
        ekstraGereksinimler: ekstraMalzemeler
      }]
    };
    dispatch(actions_siparisler.editSiparisOnApi(siparis.id, updated));
    onDone && onDone();
  };

  return (
    <div className=" w-full grid grid-rows-[auto_auto_auto_1fr] min-h-screen rounded-2xl bg-white border border-gray-200 p-5 gap-y-4">
      {/* Satır 1 */}
      <div className="border rounded-2xl items-center h-20 flex flex-row p-2">
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş No: <span className="font-normal ml-2">{siparis?.siparisNo}</span>
        </div>
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş Adı:
          <input
            type="text"
            value={siparisIsim}
            onChange={e => setSiparisIsim(e.target.value)}
            placeholder="Örn: HLT Villa"
            className="input input-bordered ml-2 w-full max-w-xs"
          />
        </div>
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş Tarihi:
          <input
            type="text"
            value={siparisTarihi}
            onChange={e => setSiparisTarihi(e.target.value)}
            placeholder="GG/AA/YYYY"
            className="input input-bordered ml-2 w-32"
          />
        </div>
      </div>

      {/* Satır 2 */}
      <div className="flex gap-x-5">
        <div className="w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center">
          <User className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className="font-semibold">Müşteri</div>
            <div className="truncate">
              {seciliMusteri?.bayi_isim || seciliMusteri?.isim || ""}
            </div>
          </div>
        </div>
        <div className="w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center">
          <Clipboard className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className="font-semibold">Proje</div>
            <div className="truncate">{seciliProje?.proje_isim || ""}</div>
          </div>

        </div>
        <div className="w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center">
          <Wrench className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className="font-semibold">Sistem</div>
            <div className="truncate">{seciliSistem?.sistem_isim || "Henüz Seçilmedi"}</div>
          </div>

        </div>
      </div>

      {/* Satır 3 */}
      <div className="flex gap-x-5">
        <div className="w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center">
          <Paintbrush className="w-10 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className="font-semibold">Renk</div>
            <div className="truncate">{seciliRenk || "Henüz Seçilmedi"}</div>
          </div>
          <select
            value={seciliRenk}
            onChange={e => setSeciliRenk(e.target.value)}
            className="select select-bordered w-full max-w-xs ml-auto"
          >
            <option value="" disabled>Renk Seçiniz</option>
            {seciliSistem?.renk?.map(renkAdi => (
              <option key={renkAdi} value={renkAdi}>
                {renkAdi.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="w-2/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center">
          <PencilRuler className="w-10 mr-2" />
          <div className="ml-2 flex flex-row gap-2 w-full items-center">
            <div className="font-semibold mr-2">Ölçüler</div>
            <input
              type="number"
              className="input input-bordered w-full max-w-xs"
              placeholder="En (mm)"
              value={sistemGenislik}
              onChange={e => setSistemGenislik(Number(e.target.value))}
            />
            <input
              type="number"
              className="input input-bordered w-full max-w-xs"
              placeholder="Boy (mm)"
              value={sistemYukseklik}
              onChange={e => setSistemYukseklik(Number(e.target.value))}
            />
            <input
              type="number"
              className="input input-bordered w-full max-w-xs"
              placeholder="Adet"
              value={sistemAdet}
              onChange={e => setSistemAdet(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div>
        <GiyotinSiparisTables
          siparis={siparis}
          urunIndex={0}
          sistem_genislik={sistemGenislik}
          sistem_yukseklik={sistemYukseklik}
          sistem_adet={sistemAdet}
          seciliSistem={seciliSistem}
          ekstraGereksinimler={ekstraMalzemeler}
          onEkstraMalzemeEkle={(item, type) => setEkstraMalzemeler(prev => ({ ...prev, [type]: [...prev[type], item] }))}
          onEkstraMalzemeChange={(type, id, field, value) => setEkstraMalzemeler(prev => ({ ...prev, [type]: prev[type].map(m => m.instance_id === id ? { ...m, hesaplanan_degerler: { ...m.hesaplanan_degerler, [field]: value } } : m) }))}
        />
      </div>
    </div>
  );
});

export default SiparisEdit;
