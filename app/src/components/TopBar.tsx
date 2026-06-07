import { useRef } from 'react';
import './TopBar.css';

interface TopBarProps {
  onFileLoad: (file: File) => void;
  onClearStructure: () => void;
  onExportJSON: () => void;
  hasData: boolean;
}

export default function TopBar({ onFileLoad, onClearStructure, onExportJSON, hasData }: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">🌳 Visualizador de Estructura Taxonómica de Activos</h1>
      </div>
      <div className="topbar-actions">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" className="topbar-btn primary">
          📂 Cargar Excel
        </label>
        <button
          className="topbar-btn danger"
          onClick={onClearStructure}
          disabled={!hasData}
        >
          🗑️ Borrar estructura
        </button>
        <button
          className="topbar-btn"
          onClick={onExportJSON}
          disabled={!hasData}
        >
          📥 Exportar JSON
        </button>
      </div>
    </div>
  );
}
