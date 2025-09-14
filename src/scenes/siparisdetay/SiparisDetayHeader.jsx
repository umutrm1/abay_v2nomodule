// src/scenes/siparisdetay/SiparisDetayHeader.jsx
import React from "react";

const SiparisDetayHeader = ({ editMode, setEditMode }) => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Sipariş Detay</h1>
    {!editMode ? (
      <button className="btn bg-blue-600 text-white" onClick={() => setEditMode(true)}>
        Düzenle
      </button>
    ) : (
      <button className="btn btn-outline" onClick={() => setEditMode(false)}>
        Vazgeç
      </button>
    )}
  </div>
);

export default SiparisDetayHeader;
