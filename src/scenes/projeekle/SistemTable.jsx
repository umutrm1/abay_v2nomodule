// src/scenes/projeler/SistemTable.jsx
import React from 'react';

const SistemTable = ({ systems = [], onEdit, onDelete }) => {
  // Sistem adı: "<ana sistem> <varyant adı>"
  const fullName = (s) => `${s.system?.name || ''} ${s.name || ''}`.trim();

  // İsimlere göre sırala
  const sorted = [...systems].sort((a, b) =>
    fullName(a).toLowerCase().localeCompare(fullName(b).toLowerCase())
  );

  const showNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : '—';
  };

  return (
    <div className="overflow-auto mt-5 border border-border rounded-2xl">
      <table className="table w-full">
        <thead>
          <tr>
            <th className="whitespace-nowrap">Sistem İsmi</th>
            <th className="whitespace-nowrap text-right">En (mm)</th>
            <th className="whitespace-nowrap text-right">Boy (mm)</th>
            <th className="whitespace-nowrap text-right">Adet</th>
            <th className="text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length > 0 ? (
            sorted.map((sys, i) => (
              <tr key={sys.system_variant_id ?? sys.id ?? `sys-${i}`}>
                <td>{fullName(sys)}</td>
                <td className="text-right">{showNum(sys.width_mm)}</td>
                <td className="text-right">{showNum(sys.height_mm)}</td>
                <td className="text-right">{showNum(sys.quantity)}</td>
                <td className="text-right space-x-2">
                  <button
                    className="btn btn-sm btn-outline btn-info"
                    onClick={() => onEdit?.(sys)}
                    aria-label="Sistemi düzenle"
                  >
                    Düzenle
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-error"
                    onClick={() => onDelete?.(sys)}
                    aria-label="Sistemi sil"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-6">
                Sistem bulunamadı
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SistemTable;
