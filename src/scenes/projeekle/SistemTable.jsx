// src/scenes/projeler/SistemTable.jsx
import React from 'react';

const SistemTable = ({ systems = [] }) => {
  // Combine system.system.name and system.name, then sort by that full name
  const sorted = [...systems].sort((a, b) => {
    const nameA = `${a.system?.name || ''} ${a.name || ''}`.toLowerCase();
    const nameB = `${b.system?.name || ''} ${b.name || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="overflow-auto mt-5 border border-gray-200 rounded-2xl">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Sistem İsmi</th>
            <th>En (mm)</th>
            <th>Boy (mm)</th>
            <th>Adet</th>
            <th className="text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length > 0 ? (
            sorted.map((sys, index) => {
              const fullName = `${sys.system?.name || ''} ${sys.name || ''}`;
              return (
                <tr key={`${sys.system_variant_id}_${index}`}>
                  <td>{fullName}</td>
                  <td>{sys.width_mm}</td>
                  <td>{sys.height_mm}</td>
                  <td>{sys.quantity}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">
                      Düzenle
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500">
                Sistem bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>)
};

export default SistemTable;
