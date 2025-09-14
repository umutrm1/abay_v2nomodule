import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { usePaginatedSearch } from "../../../functions/usePaginatedSearch"; // Hook'u import edin

const DialogSistemSec = ({ sistemlerArray, setSeciliSistem }) => {
    // Arama ve sayfalama mantığını hook'tan alıyoruz
    const {
        searchTerm,
        setSearchTerm,
        currentItems,
        currentPage,
        totalPages,
        handlePageChange
    } = usePaginatedSearch(sistemlerArray, 'sistem_isim');

    return (
        <Dialog>
            {/* Butonu (DialogTrigger) doğrudan burada tanımlıyoruz */}
            <DialogTrigger className="btn ml-auto w-35 mr-4 rounded-2xl hover:btn-active active:btn-active bg-blue-700 border-blue-700 text-white text-lg font-roboto">
                Sistem Seç
            </DialogTrigger>
            <DialogContent className={"w-200 h-auto"}>
                <DialogTitle>Sistem Seç</DialogTitle>
                <DialogDescription>
                    <input
                        type="text"
                        placeholder="Sistem ismine göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input text-lg border border-gray-200 mt-4 w-full"
                    />
                </DialogDescription>
                <SistemlerTable
                    sistemlerArray={currentItems} // Sayfalanmış veriyi gönderiyoruz
                    setSeciliSistem={setSeciliSistem}
                />
                <div className="flex justify-between items-center mt-4 px-4">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm disabled:opacity-50">
                        Önceki
                    </button>
                    <span className="text-sm">Sayfa {currentPage} / {totalPages || 1}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="btn btn-sm disabled:opacity-50">
                        Sonraki
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const SistemlerTable = ({ sistemlerArray, setSeciliSistem }) => {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead className="text-xl text-black">
                    <tr>
                        <th>Sistem İsim</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {sistemlerArray?.map(sistem => (
                        <tr key={sistem.id}>
                            <th className="w-2/3 text-xl">{sistem.sistem_isim}</th>
                            <td>
                                <DialogClose onClick={() => setSeciliSistem(sistem)} className="btn ml-auto h-7 max-w-30 w-30 mr-4 hover:btn-active active:btn-active rounded-xl bg-blue-700 border-blue-700 text-white text-lg font-roboto">
                                    Seç
                                </DialogClose>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DialogSistemSec;