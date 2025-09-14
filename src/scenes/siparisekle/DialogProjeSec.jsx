// DialogProjeSec.jsx

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { usePaginatedSearch } from "../../functions/usePaginatedSearch"; // Hook'u import et

// Bu component artık arama/sayfalama mantığını kendi içinde tutmuyor.
const DialogProjeSec = ({ projelerArray, setSeciliProje }) => {
    
    // Tüm arama ve sayfalama mantığı bu hook'tan geliyor.
    const {
        searchTerm,
        setSearchTerm,
        currentItems,
        currentPage,
        totalPages,
        handlePageChange
    } = usePaginatedSearch(projelerArray, 'proje_isim');

    return (
        <Dialog>
            <DialogTrigger className={"btn ml-auto w-35 mr-4 rounded-2xl hover:btn-active active:btn-active bg-blue-700 border-blue-700 text-white text-lg font-roboto"}>Proje Seç</DialogTrigger>
            <DialogContent className={"w-200 h-auto"}>
                <DialogTitle>Proje Seç</DialogTitle>
                <DialogDescription>
                    <input
                        type="text"
                        placeholder="Proje ismine göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input text-lg border border-gray-200 mt-4 w-full"
                    />
                </DialogDescription>
                <ProjelerTable
                    projelerArray={currentItems}
                    setSeciliProje={setSeciliProje}
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

const ProjelerTable = ({ projelerArray, setSeciliProje }) => {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr className="text-xl text-black">
                        <th>Proje İsim</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {projelerArray?.map(proje => (
                        <tr key={proje.id}>
                            <th className="w-2/3 text-xl">{proje.proje_isim}</th>
                            <td>
                                <DialogClose onClick={() => setSeciliProje(proje)} className="btn ml-auto h-7 max-w-30 w-30 mr-4 hover:btn-active active:btn-active rounded-xl bg-blue-700 border-blue-700 text-white text-lg font-roboto">Seç</DialogClose>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DialogProjeSec;