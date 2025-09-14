// SiparislerTable.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
const SiparisCard = ({ siparis }) => {
    const navigate = useNavigate();

    // Sipariş durumunu kontrol edip metne çevirme
    const durumMetni = siparis.durum === 1 || siparis.durum === 'Onaylandı' || siparis.durum === "Yeni Sipariş" ? 'Onay Bekliyor' : siparis.durum;
    const durumClass = durumMetni === 'Onay Bekliyor' ? 'text-yellow-600' : 'text-green-600';

    return (
        <div className="w-full m-3 font-roboto max-w-180 grid grid-rows-[3fr_1fr] h-35 rounded-2xl shadow-md border border-gray-200 bg-gray-50">

            <div className="grid p-4 grid-cols-3">

                <div className="grid grid-cols-[auto_1fr] mb-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800">Sipariş Adı: </div>
                    <div className="text-xl mt-auto truncate"> {siparis.siparis_isim}</div>
                </div>

                <div className="grid grid-cols-[auto_1fr] mb-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800 ">Sipariş Sahibi: </div>
                    <div className="text-xl mt-auto truncate">{siparis?.siparis_sahibi}</div>
                </div>

                <div className="grid grid-cols-[auto_1fr] mb-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800">Durum: </div>
                    <div className={`font-semibold text-xl ${durumClass}`}>
                        {durumMetni}
                    </div>
                </div>

                <div className="grid grid-cols-[auto_1fr] mt-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800">Sistem Türü:</div>
                    <div className="text-xl mt-auto truncate ">{siparis?.sistem_turu}</div>
                </div>

                <div className="grid grid-cols-[auto_1fr] mt-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800">Proje: </div>
                    {/* projeAdi alanı sipariş nesnenizde olmadığı için projeId gösteriliyor, isterseniz proje nesnesini de siparişe ekleyebilirsiniz. */}
                    <div className="text-xl mt-auto truncate">{siparis?.proje_isim}</div>
                </div>

                <div className="grid grid-cols-[auto_1fr] mt-auto gap-x-2">
                    <div className="font-semibold mt-auto text-xl text-gray-800">Satış Fiyatı:</div>
                    <div className="text-xl mt-auto truncate">- ₺</div>
                </div>

            </div>
            <div className="grid grid-cols-[1fr_1fr] border-t border-gray-200 ">
                <span onClick={() => navigate(`/siparis/${siparis.id}`)} className="hover:bg-yellow-200 flex items-center justify-center rounded-bl-2xl h-full active:bg-yellow-200 text-xl cursor-pointer font-semibold font-roboto ">Detaya Git</span>
                {/* "Sil" butonu (span) geri eklendi */}
                <span className="hover:bg-red-200 flex items-center justify-center rounded-br-2xl h-full active:bg-red-200 text-xl cursor-pointer font-semibold font-roboto ">Sil</span>
            </div>
        </div>
    );
};

export default SiparisCard;