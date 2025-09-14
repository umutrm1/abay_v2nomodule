import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as math from "mathjs";

// Actions
import * as actions_sistemler from "@/redux/actions/actions_sistemler";
import * as actions_projeler from "@/redux/actions/actions_projeler";
import * as actions_bayiler from "@/redux/actions/actions_bayiler";
import * as actions_musteriler from "@/redux/actions/actions_musteriler";
import * as actions_profiller from "@/redux/actions/actions_profiller";
import * as actions_camlar from "@/redux/actions/actions_camlar";
import * as actions_diger_malzemeler from "@/redux/actions/actions_diger_malzemeler";
import * as actions_siparisler from "@/redux/actions/actions_siparisler";

// Components & Icons
import Header from '@/components/mycomponents/Header';
import GiyotinSiparisTables from './GiyotinSiparisTables';
import DialogSistemSec from '@/scenes/siparisekle/DialogSistemSec.jsx';
import DialogProjeSec from "@/scenes/siparisekle/DialogProjeSec.jsx";
import { ReactComponent as User } from "../../icons/user_v2.svg";
import { ReactComponent as Clipboard } from "../../icons/clipboard-list_v2.svg";
import { ReactComponent as Wrench } from "../../icons/wrench_v2.svg";
import { ReactComponent as Paintbrush } from "../../icons/paintbrush.svg";
import { ReactComponent as PencilRuler } from "../../icons/pencil-ruler_v2.svg";

const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
};

const SiparisEkle = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const sistemler = useSelector(state => state.getSistemlerFromApiReducer);
    const projeler = useSelector(state => state.getProjelerFromApiReducer);
    const musteriler = useSelector(state => state.getMusterilerFromApiReducer);
    const bayiler = useSelector(state => state.getBayilerFromApiReducer);
    const profiller = useSelector(state => state.getProfillerFromApiReducer);
    const camlar = useSelector(state => state.getCamlarFromApiReducer);
    const digerMalzemeler = useSelector(state => state.getDigerMalzemelerFromApiReducer);
    const siparislerDeneme = useSelector(state => state.getSiparislerFromApiReducer);



    const [siparisIsim, setSiparisIsim] = useState("");
    const [siparisTarihi, setSiparisTarihi] = useState(getFormattedDate());
    const [seciliProje, setSeciliProje] = useState(null);
    const [seciliMusteri, setSeciliMusteri] = useState(null);
    const [seciliSistem, setSeciliSistem] = useState(null);
    const [seciliSistemTuru, setSeciliSistemTuru] = useState(null);
    const [seciliRenk, setSeciliRenk] = useState("");
    const [sistem_genislik, setSistemGenislik] = useState(0);
    const [sistem_yukseklik, setSistemYukseklik] = useState(0);
    const [sistem_adet, setSistemAdet] = useState(1);
    const [ekstraMalzemeler, setEkstraMalzemeler] = useState({ profiller: [], camlar: [], diger_malzemeler: [] });
    const [ekstraMalzemeTuru, setEkstraMalzemeTuru] = useState(0);

    useEffect(() => {
        // dispatch(actions_sistemler.getSistemlerFromApi());
        // dispatch(actions_projeler.getProjelerFromApi());
        // dispatch(actions_bayiler.getBayilerFromApi());
        // dispatch(actions_musteriler.getMusterilerFromApi());
        // dispatch(actions_profiller.getProfillerFromApi());
        // dispatch(actions_camlar.getCamlarFromApi());
        // dispatch(actions_diger_malzemeler.getDigerMalzemelerFromApi());
        dispatch(actions_siparisler.getSiparislerFromApi());
    }, [dispatch]);

    useEffect(() => {
        if (!seciliProje || (!musteriler?.length && !bayiler?.length)) {
            setSeciliMusteri(null);
            return;
        }
        const musteri = musteriler.find(m => m.id === seciliProje.proje_musteri_id);
        if (musteri) {
            setSeciliMusteri(musteri);
        } else {
            const bayi = bayiler.find(b => b.id === seciliProje.proje_musteri_id);
            setSeciliMusteri(bayi || null);
        }
    }, [seciliProje, musteriler, bayiler]);

    useEffect(() => {
        if (!seciliSistem) {
            setSeciliSistemTuru(null);
            setSeciliRenk("");
            return;
        }
        setSeciliSistemTuru(seciliSistem.sistem_turu);
    }, [seciliSistem]);

    const handleEkstraMalzemeEkle = useCallback((item, type) => {
        setEkstraMalzemeler(prevState => {

            // GÜNCELLENDİ: Hatalı slice metodu yerine güvenilir bir harita (map) kullanıyoruz.
            const singularMap = {
                profiller: 'profil',
                camlar: 'cam',
                diger_malzemeler: 'diger_malzeme'
            };
            const anaNesneAnahtari = singularMap[type];

            // Eğer bilinmeyen bir tür gelirse (önlem olarak), işlemi durdur.
            if (!anaNesneAnahtari) {
                console.error("Bilinmeyen ekstra malzeme türü:", type);
                return prevState;
            }

            // Nesne artık doğru anahtarlarla ("profil", "profilId" vb.) oluşturuluyor.
            const newItemInstance = {
                instance_id: `${item.id}-${Date.now()}`,
                [`${anaNesneAnahtari}_id`]: item.id,
                [anaNesneAnahtari]: item,
                kesim_olcusu: '',
                kesim_adedi: '',
                genislik: '',
                yukseklik: '',
                adet: ''
            };

            const updatedTypeArray = [...prevState[type], newItemInstance];
            return { ...prevState, [type]: updatedTypeArray };
        });
    }, []);

    const handleEkstraMalzemeChange = useCallback((type, instance_id, field, value) => {
        setEkstraMalzemeler(prevState => {
            const updatedItems = prevState[type].map(item => {
                if (item.instance_id === instance_id) {
                    return { ...item, [field]: value };
                }
                return item;
            });
            return { ...prevState, [type]: updatedItems };
        });
    }, []);

    const resetForm = () => {
        setSiparisIsim("");
        setSiparisTarihi(getFormattedDate());
        setSeciliProje(null);
        setSeciliMusteri(null);
        setSeciliSistem(null);
        setSeciliSistemTuru(null);
        setSeciliRenk("");
        setSistemGenislik(0);
        setSistemYukseklik(0);
        setSistemAdet(1);
        setEkstraMalzemeler({ profiller: [], camlar: [], diger_malzemeler: [] });
    };
    const guvenliHesapla = (formula, scope, defaultValue = '-') => {
        if (typeof formula !== 'string' || !formula) return defaultValue;
        try {
            const result = math.evaluate(formula, scope);
            return isFinite(result) ? result : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    };

    const handleSiparisGonder = () => {
        // 1. Gerekli verilerin seçilip seçilmediğini kontrol et
        if (!seciliProje || !seciliMusteri || !seciliSistem || !seciliRenk || !siparisIsim) {
            // Uyarıları console'a yazmak daha iyi bir pratiktir.
            console.warn("Lütfen tüm alanları (Proje, Müşteri, Sistem, Renk, Sipariş Adı) doldurduğunuzdan emin olun.");
            return;
        }
        if (!(parseFloat(sistem_genislik) > 0) || !(parseFloat(sistem_yukseklik) > 0) || !(parseInt(sistem_adet) > 0)) {
            console.warn("Lütfen geçerli ölçüler (En, Boy, Adet) girdiğinizden emin olun.");
            return;
        }

        const scope = {
            sistem_genislik: parseFloat(sistem_genislik),
            sistem_yukseklik: parseFloat(sistem_yukseklik),
            sistem_adet: parseInt(sistem_adet)
        };

        // --- AŞAMA 1: Tüm malzeme listelerini ayrı ayrı oluştur ---

        // a) Sistemden Gelen (Hesaplanan) Malzemeler
        const hesaplananProfiller = seciliSistem.profiller.map(p => {
            const kesim_olcusu = guvenliHesapla(p.formuller.kesim_olcusu, scope, 0);
            const kesim_adedi = guvenliHesapla(p.formuller.kesim_adedi, scope, 0);
            return {
                profil_id: p.profil_id,
                profil: p.profil,
                formuller: p.formuller,
                hesaplanan_degerler: { kesim_olcusu, kesim_adedi, toplam_agirlik: (kesim_olcusu * kesim_adedi * p.profil.birim_agirlik) / 1000 }
            };
        });

        const hesaplananCamlar = seciliSistem.camlar.map(c => {
            const genislik = guvenliHesapla(c.formuller.cam_genislik, scope, 0);
            const yukseklik = guvenliHesapla(c.formuller.cam_yukseklik, scope, 0);
            const adet = guvenliHesapla(c.formuller.cam_adet, scope, 0);
            return {
                cam_id: c.cam_id,
                cam: c.cam,
                formuller: c.formuller,
                hesaplanan_degerler: { genislik, yukseklik, adet, alan_m2: (genislik * yukseklik * adet) / 1000000 }
            };
        });

        const hesaplananDiger = seciliSistem.diger_malzemeler.map(malzeme => ({
            diger_malzeme_id: malzeme.diger_malzeme_id,
            diger_malzeme: malzeme.diger_malzeme,
            formuller: malzeme.formuller,
            hesaplanan_degerler: {
                olcu: guvenliHesapla(malzeme.formuller?.kesim_olcusu, scope, 0),
                adet: guvenliHesapla(malzeme.formuller?.kesim_adedi, scope, 0) || guvenliHesapla(malzeme.formuller?.adet, scope, 0)
            }
        }));

        // b) Ekstra Eklenen Malzemeler
        const ekstraProfiller = ekstraMalzemeler.profiller.map(p => ({
            profil_id: p.profil.id,
            profil: p.profil,
            formuller: null, // Ekstra malzemenin sistem formülü yoktur
            hesaplanan_degerler: {
                kesim_olcusu: parseFloat(p.kesim_olcusu) || 0,
                kesim_adedi: parseInt(p.kesim_adedi) || 0,
                toplam_agirlik: ((parseFloat(p.kesim_olcusu) || 0) * (parseInt(p.kesim_adedi) || 0) * p.profil.birim_agirlik) / 1000
            }
        }));

        const ekstraCamlar = ekstraMalzemeler.camlar.map(c => ({
            cam_id: c.cam.id,
            cam: c.cam,
            formuller: null,
            hesaplanan_degerler: {
                genislik: parseFloat(c.genislik) || 0,
                yukseklik: parseFloat(c.yukseklik) || 0,
                adet: parseInt(c.adet) || 0,
                alan_m2: ((parseFloat(c.genislik) || 0) * (parseFloat(c.yukseklik) || 0) * (parseInt(c.adet) || 0)) / 1000000
            }
        }));

        const ekstraDiger = ekstraMalzemeler.diger_malzemeler.map(d => {
            const tur = d.diger_malzeme?.hesaplama_turu;
            let hesaplanan_degerler = {};

            if (tur === 'olculu') {
                hesaplanan_degerler = {
                    kesim_olcusu: parseFloat(d.kesim_olcusu) || 0,
                    adet: parseInt(d.kesim_adedi) || 0 // Ölçülü malzemeler için 'kesim_adedi' kullanılır
                };
            } else { // 'adetli' veya tanımsız ise varsayılan olarak bu yapı kullanılır
                hesaplanan_degerler = {
                    kesim_olcusu: null, // Adetli malzemede kesim ölçüsü olmaz
                    adet: parseInt(d.adet) || 0
                };
            }

            return {
                diger_malzeme_id: d.diger_malzeme.id,
                diger_malzeme: d.diger_malzeme,
                formuller: null, // Ekstra malzemelerin sistem formülü yoktur
                hesaplanan_degerler: hesaplanan_degerler
            };
        });


        // --- AŞAMA 2: Nihai Sipariş Nesnesini Hiyerarşik Olarak Oluştur ---
        const yeniSiparis = {
            id: crypto.randomUUID(),
            siparisNo: "2501",
            siparisTarihi: siparisTarihi,
            siparis_isim: siparisIsim,
            proje_id: seciliProje.id,
            musteri_id: seciliMusteri.id,
            durum: "Yeni Sipariş",
            // 'urunler' dizisi, hiyerarşik yapıyı içeren tek bir nesne barındırır
            urunler: [{
                sistem_id: seciliSistem.id,
                sistem_isim: seciliSistem.sistem_isim,
                renk: seciliRenk,
                girilenOlculer: {
                    genislik: parseFloat(sistem_genislik),
                    yukseklik: parseFloat(sistem_yukseklik),
                    adet: parseInt(sistem_adet)
                },
                // Sistemden gelenler
                hesaplananGereksinimler: {
                    profiller: hesaplananProfiller,
                    camlar: hesaplananCamlar,
                    diger_malzemeler: hesaplananDiger
                },
                // Manuel eklenenler
                ekstraGereksinimler: {
                    profiller: ekstraProfiller,
                    camlar: ekstraCamlar,
                    diger_malzemeler: ekstraDiger
                }
            }]
        };

        console.log("Veritabanına Gönderiliyor (Hiyerarşik Format):", yeniSiparis);
        dispatch(actions_siparisler.addSiparisToApi(yeniSiparis));
        resetForm();
        navigate("/siparisler");
    };

    return (
        <div className="grid grid-rows-[60px_1fr]">
            <div className='flex items-center'>
                <Header title={"Sipariş Ekle"} />
                <button onClick={()=>dispatch(actions_siparisler.getSiparislerFromApi())} className="btn ml-auto max-w-40 w-40 mr-4 active:btn-active bg-green-600 border-green-600 text-white text-lg font-roboto">
                    + Sipariş Ekle
                </button>
            </div>

            <div className='bg-white w-full grid grid-rows-[auto_auto_auto_1fr] min-h-screen rounded-2xl border border-gray-200 p-5 gap-y-4'>
                <div className="border rounded-2xl items-center h-20 flex flex-row p-2">
                    <div className="w-1/3 font-semibold flex items-center p-4">
                        Sipariş No : <span className="font-normal ml-2">2501</span>
                    </div>
                    <div className="w-1/3 font-semibold flex items-center p-4">
                        Sipariş Adı :
                        <input type="text" value={siparisIsim} onChange={(e) => setSiparisIsim(e.target.value)} placeholder="Örn: HLT Villa" className="input input-bordered ml-2 w-full max-w-xs" />
                    </div>
                    <div className="w-1/3 font-semibold flex items-center p-4">
                        Sipariş Tarihi :
                        <input type="text" value={siparisTarihi} onChange={(e) => setSiparisTarihi(e.target.value)} placeholder="GG/AA/YYYY" className="input input-bordered ml-2 w-32" />
                    </div>
                </div>

                <div className='flex gap-x-5'>
                    <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
                        <User className="w-10 ml-2 mr-2 flex-shrink-0" />
                        <div className="ml-2 flex-1 min-w-0">
                            <div className='font-semibold'>Müşteri</div>
                            <div className='truncate'>{seciliMusteri?.isim || seciliMusteri?.isim || "Proje Seçiniz"}</div>
                        </div>
                    </div>
                    <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
                        <Clipboard className="w-10 ml-2 mr-2 flex-shrink-0" />
                        <div className="ml-2 flex-1 min-w-0">
                            <div className='font-semibold'>Proje</div>
                            <div className='truncate'>{seciliProje?.proje_isim || "Henüz Seçilmedi"}</div>
                        </div>
                        <div className="ml-auto mr-2"> <DialogProjeSec projelerArray={projeler} setSeciliProje={setSeciliProje} /> </div>
                    </div>
                    <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
                        <Wrench className="w-10 ml-2 mr-2 flex-shrink-0" />
                        <div className="ml-2 flex-1 min-w-0">
                            <div className='font-semibold'>Sistem</div>
                            <div className='truncate'>{seciliSistem?.sistem_isim || "Henüz Seçilmedi"}</div>
                        </div>
                        <div className="ml-auto mr-2"> <DialogSistemSec sistemlerArray={sistemler} setSeciliSistem={setSeciliSistem} /> </div>
                    </div>
                </div>

                <div className='flex gap-x-5'>
                    <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
                        <Paintbrush className="w-10 mr-2 flex-shrink-0" />
                        <div className="ml-2 flex-1 min-w-0">
                            <div className='font-semibold'>Renk</div>
                            <div className='truncate'>{seciliRenk || "Henüz Seçilmedi"}</div>
                        </div>
                        <select value={seciliRenk} onChange={(e) => setSeciliRenk(e.target.value)} className="select select-bordered w-full max-w-xs ml-auto">
                            <option value="" disabled>Renk Seçiniz</option>
                            {seciliSistem?.renk?.map((renkAdi) => (<option key={renkAdi} value={renkAdi}>{renkAdi.toUpperCase()}</option>))}
                        </select>
                    </div>
                    <div className='w-2/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
                        <PencilRuler className="w-10 mr-2" />
                        <div className="ml-2 flex flex-row gap-2 w-full items-center">
                            <div className='font-semibold mr-2'>Ölçüler</div>
                            <input type="number" className="input input-bordered w-full max-w-xs" placeholder="En (mm)" onChange={(e) => setSistemGenislik(e.target.value)} />
                            <input type="number" className="input input-bordered w-full max-w-xs" placeholder="Boy (mm)" onChange={(e) => setSistemYukseklik(e.target.value)} />
                            <input type="number" className="input input-bordered w-full max-w-xs" placeholder="Adet" value={sistem_adet} onChange={(e) => setSistemAdet(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className='mt-2'>
                    {seciliSistem ? (
                        <GiyotinSiparisTables
                            seciliSistemTam={seciliSistem}
                            sistem_genislik={sistem_genislik}
                            sistem_adet={sistem_adet}
                            sistem_yukseklik={sistem_yukseklik}
                            ekstraMalzemeler={ekstraMalzemeler}
                            onEkstraMalzemeEkle={handleEkstraMalzemeEkle}
                            onEkstraMalzemeChange={handleEkstraMalzemeChange}
                            profillerArray={profiller}
                            digerMalzemelerArray={digerMalzemeler}
                            camlarArray={camlar}
                            ekstraMalzemeTuru={ekstraMalzemeTuru}
                            setEkstraMalzemeTuru={setEkstraMalzemeTuru}
                        />
                    ) : null}

                </div>
            </div>
        </div>
    );
};

export default SiparisEkle;