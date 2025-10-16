import React from 'react';
import AppButton from '@/components/ui/AppButton.jsx';

const SistemTable = ({ systems = [], onEdit, onDelete }) => {
  const fullName = (s) => `${s.system?.name || ''} ${s.name || ''}`.trim();

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
                  <AppButton
                    variant="sari"
                    size="sm"
                    shape="none"
                    onClick={() => onEdit?.(sys)}
                    title="Sistemi düzenle"
                  >
                    Düzenle
                  </AppButton>
                  <AppButton
                    variant="kirmizi"
                    size="sm"
                    shape="none"
                    onClick={() => onDelete?.(sys)}
                    title="Sistemi sil"
                  >
                    Sil
                  </AppButton>
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
