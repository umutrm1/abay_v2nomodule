import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { useState } from "react";

const DialogMusteriBayiSec = ({ projelerArray, dialogTriggerClassName, dialogTriggerTitle, setSeciliProje,setSeciliMusteri }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const filteredProjeler = projelerArray.filter(proje =>
        proje.bayi_isim.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredProjeler.length / itemsPerPage);
    const currentItems = filteredProjeler.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };


    return (
        <Dialog  >
            <DialogTrigger className={dialogTriggerClassName}>{dialogTriggerTitle}</DialogTrigger>
            <DialogContent className={"w-200 h-auto"} >
                <DialogTitle>Proje Seç</DialogTitle>
                <DialogDescription>

                </DialogDescription>
                <ProjelerTable
                    projelerArray={currentItems}
                    setSeciliProje={(proje) => {
                        setSeciliProje(proje);
                        setCurrentPage(1); // seçildikten sonra resetle
                        setSearchTerm("");
                    }}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setSeciliMusteri={setSeciliMusteri}

                />
                <div className="flex justify-between items-center mt-4 px-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-sm disabled:opacity-50"
                    >
                        Önceki
                    </button>
                    <span className="text-sm">
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
            </DialogContent>
        </Dialog>
    )
}


const ProjelerTable = ({ projelerArray, setSeciliProje,setSeciliMusteri, searchTerm, setSearchTerm }) => {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                {/* head */}
                <thead className="text-xl text-black">
                    <tr>
                        <th className="flex justify-center items-center">Proje İsim
                            <input
                                type="text"
                                placeholder="Proje ismine göre ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input text-lg border border-gray-200 ml-5 w-full"
                            />
                        </th>

                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody className="">
                    {projelerArray.map(proje => {
                        return (
                            <tr key={proje.id} className="flew flew-row">
                                <th className="w-2/3 text-xl">{proje.bayi_isim}</th>
                                <td><DialogClose onClick={() => {setSeciliProje(proje);
                                    setSeciliMusteri({})
                                }} className="btn ml-auto h-7 max-w-30 w-30 mr-4 hover:btn-active active:btn-active rounded-xl bg-blue-700 border-blue-700 text-white text-lg font-roboto">Seç</DialogClose></td>
                            </tr>
                        )
                    })}


                </tbody>
            </table>
        </div>)
}

export default DialogMusteriBayiSec;