import React, { useRef, useState } from "react";

function Toolbar({ onExport, onImport }) {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const handleChooseFile = () => {
    if (!importing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setImporting(true);
      await onImport(file);
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="toolbar">
      <button
        type="button"
        className="button"
        onClick={onExport}
        disabled={importing}
      >
        Export Excel
      </button>

      <button
        type="button"
        className="button btn1"
        onClick={handleChooseFile}
        disabled={importing}
      >
        {importing ? "Đang import..." : "Import Excel"}
      </button>

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Toolbar;
