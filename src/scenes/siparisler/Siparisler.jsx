// Siparisler.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import * as actions_siparisler from "../../redux/actions/actions_siparisler";
import { usePaginatedSearch } from '@/functions/usePaginatedSearch';

import Header from '@/components/mycomponents/Header';
import SiparisCard from "./SiparislerTable";

const Siparisler = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const siparislerForTable = useSelector(state => state.siparislerTableReducer || []);

    // Sayfalama varsayılan değere (5) geri döndü
    const {
        currentItems,
        searchTerm,
        setSearchTerm,
        currentPage,
        totalPages,
        handlePageChange
    } = usePaginatedSearch(siparislerForTable, 'siparis_isim', 20);

    useEffect(() => {
        // GÜNCELLENDİ: Artık yeni action'ı dispatch ediyoruz.
        dispatch(actions_siparisler.getSiparislerForTableFromApi());
    }, [dispatch]);

    return (
        <div className="grid grid-rows-[60px_1fr]">
            <Header title={"Siparişler"} />

            <div className='bg-white w-full border-gray-200 border rounded-2xl p-5 flex flex-col gap-y-4'>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                        type="text"
                        placeholder="Sipariş adına göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    {/* Buton eski stiline geri döndü */}
                    <button onClick={() => navigate("/siparisekle")} className="btn max-w-40 w-40 ml-5 hover:btn-active active:btn-active bg-blue-700 border-blue-700 text-white text-lg font-roboto">
                        + Sipariş Ekle
                    </button>
                </div>

                <div className='flex-grow overflow-y-auto'>
                    {currentItems.length > 0 ? (
                        <div className="flex flex-wrap m-3 justify-center">
                            {currentItems.map(siparis => (
                                // onDelete prop'u kaldırıldı
                                <SiparisCard key={siparis.id} siparis={siparis} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Gösterilecek sipariş bulunamadı.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 px-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn btn-sm disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <span className="text-sm mx-4">
                            Sayfa {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn btn-sm disabled:opacity-50"
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Siparisler;