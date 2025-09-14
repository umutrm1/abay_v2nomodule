import React from "react";

/**
 * OptimizasyonSecModal
 * @param {{ open: boolean; onClose: () => void; onSecim: (type: string) => void; }} props
 */
const OptimizasyonSecModal = ({ open, onClose, onSecim }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50  ">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-2">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Optimizasyon PDF Türü Seç</h3>
        <div className="flex flex-col space-y-4">
          <button
            className="btn w-full bg-blue-700 border-blue-700 hover:bg-blue-800 hover:border-blue-800 text-white font-roboto"
            onClick={() => onSecim("detayli")}
          >
            Detaylı PDF
          </button>

          <button
            className="btn w-full bg-green-700 border-green-700 hover:bg-green-800 hover:border-green-800 text-white font-roboto"
            onClick={() => onSecim("detaysiz")}
          >
            Detaysız PDF
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="btn px-4 py-2 bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 text-white font-roboto rounded-lg"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizasyonSecModal;
