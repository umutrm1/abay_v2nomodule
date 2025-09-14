import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
    getSistemlerFromApi,                 // tüm sistemleri çeker
    getSystemVariantsOfSystemFromApi     // seçilen sistemin variant’larını çeker
} from '@/redux/actions/actions_sistemler';

const SistemSec = () => {
    // 1) dispatch ile action’lar tetiklenecek
    const dispatch = useDispatch();
    const { projectId } = useParams();      // ① URL’den projectId’yi alıyoruz
    const navigate = useNavigate();

    // 2) Redux store’daki state’i okuma
    //    - sistemler: tüm sistemler listesi (GET_SISTEMLER_FROM_API reducer’dan)
    //    - systemVariantsOfSystem: seçili sistemin variant’ları (SYSTEM_VARIANTS_OF_SYSTEM reducer’dan)
    const sistemler = useSelector(state => state.getSistemlerFromApiReducer);
    const systemVariants = useSelector(state => state.systemVariantsOfSystem);

    // 3) Local state: şu an hangi sistemi seçtik?
    const [selectedSistemId, setSelectedSistemId] = useState(null);
    const [selectedVariantId, setSelectedVariantId] = useState(null);

    // 4) Component ilk render’da (mount) sistem listesini fetch et
    useEffect(() => {
        dispatch(getSistemlerFromApi());
    }, [dispatch]);

    // Sistem kartındaki "Seç" butonuna basıldığında
    const handleSystemSelect = (sistemId) => {
        setSelectedSistemId(sistemId);
        setSelectedVariantId(null);               // önceki seçimi temizle
        dispatch(getSystemVariantsOfSystemFromApi(sistemId));
    };

    // Variant kartındaki "Seç" butonuna basıldığında
  const handleVariantSelect = (variantId) => {
    // ② projectId ve variantId’yi route’a gömüp SistemEkle’ye geçiyoruz
    navigate(`/sistemekle/${projectId}/${variantId}`);
  };


    return (
        <div className="p-5 space-y-8 ">
            <div className='border border-gray-200 rounded-2xl w-full h-screen p-5'>
                {/* Sistemler Bölümü */}
                <section >
                    <h1 className="text-3xl font-bold mb-4">Sistem Seç</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sistemler.length === 0 && <>Hiç Sistem Bulunmuyor</>}

                        {sistemler?.items?.map(sistem => (
                            <div
                                key={sistem.id}
                                className={`bg-white rounded-2xl border p-4 flex flex-col items-center 
                ${selectedSistemId === sistem.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
                            >
                                {/* Sistem Fotoğrafı; yoksa placeholder */}
                                <img
                                    src={sistem.imageUrl || '/placeholder-system.png'}
                                    alt={sistem.name}
                                    className="w-32 h-32 object-cover rounded mb-4"
                                />
                                {/* Sistem Adı */}
                                <h3 className="text-xl font-semibold mb-2 text-center">
                                    {sistem.name}
                                </h3>
                                {/* Seç Butonu */}
                                <button
                                    onClick={() => handleSystemSelect(sistem.id)}
                                    className="mt-auto bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 focus:outline-none"
                                >
                                    Seç
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Variant’lar Bölümü */}
                {selectedSistemId && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 mt-5">Alt Sistem Seç</h2>
                        {systemVariants?.items?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {systemVariants?.items?.map(variant => (
                                    <div
                                        key={variant.id}
                                        className={`bg-white rounded-2xl border p-4 flex flex-col items-center 
                    ${selectedVariantId === variant.id ? 'border-green-500 shadow-lg' : 'border-gray-200'}`}
                                    >
                                        {/* Variant Fotoğrafı; API’de yoksa placeholder */}
                                        <img
                                            src={variant.imageUrl || '/placeholder-variant.png'}
                                            alt={variant.variantName}
                                            className="w-32 h-32 object-cover rounded mb-4"
                                        />
                                        {/* Variant Adı */}
                                        <h3 className="text-lg font-medium mb-2 text-center">
                                            {variant.name}
                                        </h3>
                                        {/* Seç Butonu */}
                                        <button
                                            onClick={() => handleVariantSelect(variant.id)}
                                            className="mt-auto bg-green-500 text-white px-4 py-2 rounded-2xl hover:bg-green-600 focus:outline-none"
                                        >
                                            Seç
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Bu sisteme ait hiç alt sistem bulunmuyor.</p>
                        )}
                    </section>

                )}
            </div>
        </div>
    );
};


export default SistemSec;
