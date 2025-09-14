import React from "react";
import { ReactComponent as User } from "@/icons/user_v2.svg";
import { ReactComponent as Clipboard } from "@/icons/clipboard-list_v2.svg";
import { ReactComponent as Wrench } from "@/icons/wrench_v2.svg";
import { ReactComponent as Paintbrush } from "@/icons/paintbrush.svg";
import { ReactComponent as PencilRuler } from "@/icons/pencil-ruler_v2.svg";
import GiyotinSiparisTablesRedingMode from "./GiyotinSiparisTablesRedingMode";

const SiparisDetayHeaderReading = ({ siparis, urun }) => {
  return (
    <div className="bg-white w-full grid grid-rows-[auto_auto_auto_1fr] min-h-screen rounded-2xl border border-gray-200 p-5 gap-y-4">

      {/* Satır 1: Sipariş bilgileri */}
      <div className="border rounded-2xl items-center h-20 flex flex-row p-2">
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş No: <span className="font-normal ml-2">{siparis?.siparisNo}</span>
        </div>
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş Adı: <span className="font-normal ml-2">{siparis?.siparis_isim}</span>
        </div>
        <div className="w-1/3 font-semibold flex items-center p-4">
          Sipariş Tarihi: <span className="font-normal ml-2">{siparis?.siparisTarihi}</span>
        </div>
      </div>

      {/* Satır 2: Müşteri, Proje, Sistem */}
      <div className='flex gap-x-5'>
        <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
          <User className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className='font-semibold'>Müşteri</div>
            <div className='truncate'>{siparis?.musteri?.isim || "-"}</div>
          </div>
        </div>
        <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
          <Clipboard className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className='font-semibold'>Proje</div>
            <div className='truncate'>{siparis?.proje.proje_isim || "-"}</div>
          </div>
        </div>
        <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
          <Wrench className="w-10 ml-2 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className='font-semibold'>Sistem</div>
            <div className='truncate'>{urun?.sistem_isim || "-"}</div>
          </div>
        </div>
      </div>

      {/* Satır 3: Renk & Ölçüler */}
      <div className='flex gap-x-5'>
        <div className='w-1/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
          <Paintbrush className="w-10 mr-2 flex-shrink-0" />
          <div className="ml-2 flex-1 min-w-0">
            <div className='font-semibold'>Renk</div>
            <div className='truncate'>{urun?.renk || "-"}</div>
          </div>
        </div>
        <div className='w-2/3 border border-gray-200 rounded-2xl p-2 flex flex-row items-center'>
          <PencilRuler className="w-10 mr-2" />
          <div className="ml-2 flex flex-row gap-2 w-full items-center">
            <div className='font-semibold mr-2'>Ölçüler</div>
            <span className="font-normal mr-auto">Genişlik: {urun?.girilenOlculer?.genislik || "-"} mm</span>
            <span className="font-normal">Yükseklik: {urun?.girilenOlculer?.yukseklik || "-"} mm</span>
            <span className="font-normal ml-auto mr-10">Adet: {urun?.girilenOlculer?.adet || "-"}</span>
          </div>
        </div>
      </div>
      <div>
      <GiyotinSiparisTablesRedingMode siparis={siparis}  urun={urun} />
    </div>
    </div>
  );
};

export default SiparisDetayHeaderReading;
