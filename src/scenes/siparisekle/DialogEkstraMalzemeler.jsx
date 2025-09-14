// DialogEkstraMalzemeler.jsx

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { usePaginatedSearch } from "../../functions/usePaginatedSearch";

const DialogEkstraMalzemeler = ({
    onEkstraMalzemeEkle,
    camlarArray,
    digerMalzemelerArray,
    profillerArray,
    ekstraMalzemeTuru,
    setEkstraMalzemeTuru,
    dialogTriggerClassName,
    dialogTriggerTitle
}) => {

    const profiller = usePaginatedSearch(profillerArray, 'profil_isim');
    const digerMalzemeler = usePaginatedSearch(digerMalzemelerArray, 'diger_malzeme_isim');
    const camlar = usePaginatedSearch(camlarArray, 'cam_isim');

    return (
        <Dialog>
            <DialogTrigger className={dialogTriggerClassName}>{dialogTriggerTitle}</DialogTrigger>
            <DialogContent className={"w-200 h-auto"}>
                <DialogTitle>Ekstra Malzeme Seç</DialogTitle>
                <DialogDescription></DialogDescription>

                <EkstraMalzemeTable
                    ekstraMalzemeTuru={ekstraMalzemeTuru}
                    setEkstraMalzemeTuru={setEkstraMalzemeTuru}
                    profillerData={profiller}
                    digerMalzemelerData={digerMalzemeler}
                    camlarData={camlar}
                    onEkstraMalzemeEkle={onEkstraMalzemeEkle}
                />
            </DialogContent>
        </Dialog>
    );
};

const EkstraMalzemeTable = ({
    ekstraMalzemeTuru,
    setEkstraMalzemeTuru,
    profillerData,
    digerMalzemelerData,
    camlarData,
    onEkstraMalzemeEkle
}) => {

    // Bu fonksiyon arama çubuğu ve sayfalama butonlarını içerecek şekilde güncellendi.
    const renderTable = (data, placeholder, col1Header, col1Key, type, col2Header) => (
        <div className="flex flex-col">
            {/* YENİDEN EKLENDİ: ARAMA ÇUBUĞU */}
            <input
                type="text"
                placeholder={placeholder}
                value={data.searchTerm}
                onChange={(e) => data.setSearchTerm(e.target.value)}
                className="input text-lg border border-gray-200 ml-auto mr-auto w-full max-w-150 mb-4"
            />

            <table className="table">
                <thead>
                    <tr>
                        {col2Header && <th>{col2Header}</th>}
                        <th>{col1Header}</th>
                        <th className="flex"><span className="ml-auto mr-16">İşlem</span></th>
                    </tr>
                </thead>
                <tbody>
                    {data.currentItems.map((item) => (
                        <tr key={item.id}>
                            {col2Header && <td>{item[col2Header.toLowerCase().replace(" ", "_")]}</td>}
                            <td>{item[col1Key]}</td>
                            <td className="text-right">
                                <DialogClose asChild>
                                    <button
                                        onClick={() => onEkstraMalzemeEkle(item, type)}
                                        className="btn ml-auto h-7 max-w-30 w-30 mr-4 hover:btn-active active:btn-active rounded-xl bg-blue-700 border-blue-700 text-white text-lg font-roboto"
                                    >
                                        Ekle
                                    </button>
                                </DialogClose>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* YENİDEN EKLENDİ: SAYFALAMA KONTROLLERİ */}
            <div className="flex justify-between items-center mt-4 px-4">
                <button
                    onClick={() => data.handlePageChange(data.currentPage - 1)}
                    disabled={data.currentPage === 1}
                    className="btn btn-sm disabled:opacity-50"
                >
                    Önceki
                </button>
                <span className="text-sm">
                    Sayfa {data.currentPage} / {data.totalPages || 1}
                </span>
                <button
                    onClick={() => data.handlePageChange(data.currentPage + 1)}
                    disabled={data.currentPage === data.totalPages || data.totalPages === 0}
                    className="btn btn-sm disabled:opacity-50"
                >
                    Sonraki
                </button>
            </div>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <div className="flex ml-auto mr-auto">
                <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box ml-auto mr-auto text-lg font-semibold">
                    <li onClick={() => setEkstraMalzemeTuru(0)}><a>Profil Ekle</a></li>
                    <li onClick={() => setEkstraMalzemeTuru(1)}><a>Profil Dışı Malzeme Ekle</a></li>
                    <li onClick={() => setEkstraMalzemeTuru(2)}><a>Cam Ekle</a></li>
                </ul>
            </div>

            {ekstraMalzemeTuru === 0 && renderTable(profillerData, "Profil Ara...", "Profil Adı", "profil_isim", "profiller", "Profil Kodu")}
            {ekstraMalzemeTuru === 1 && renderTable(digerMalzemelerData, "Malzeme Ara...", "Malzeme Adı", "diger_malzeme_isim", "diger_malzemeler")}
            {ekstraMalzemeTuru === 2 && renderTable(camlarData, "Cam Ara...", "Cam Adı", "cam_isim", "camlar")}
        </div>
    );
};

export default DialogEkstraMalzemeler;