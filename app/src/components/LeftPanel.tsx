import type { TreeStats, Warning } from '../core/types';
import './LeftPanel.css';

interface LeftPanelProps {
  stats: TreeStats | null;
  warnings: Warning[];
  searchTerm: string;
  expansionLevel: number;
  onSearchChange: (term: string) => void;
  onExpansionLevelChange: (level: number) => void;
  onFileLoad: (file: File) => void;
  hasData: boolean;
}

export default function LeftPanel({
  stats,
  warnings,
  searchTerm,
  expansionLevel,
  onSearchChange,
  onExpansionLevelChange,
  onFileLoad,
  hasData,
}: LeftPanelProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
  };

  return (
    <div className="left-panel">
      <section className="panel-section">
        <h3>Cargar archivo</h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <p className="file-hint">Formato: .xlsx (Col A: código, Col B: descripción)</p>
      </section>

      <section className="panel-section">
        <h3>Buscar</h3>
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="panel-section">
        <h3>Nivel de expansión</h3>
        <div className="expansion-control">
          <input
            type="range"
            min={0}
            max={10}
            value={expansionLevel}
            onChange={(e) => onExpansionLevelChange(Number(e.target.value))}
            className="expansion-slider"
          />
          <span className="expansion-value">{expansionLevel}</span>
        </div>
      </section>

      {stats && (
        <section className="panel-section">
          <h3>Estadísticas</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total nodos</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">0 guiones</span>
              <span className="stat-value">{stats.zeroHyphen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">1 guion</span>
              <span className="stat-value">{stats.oneHyphen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">2+ guiones</span>
              <span className="stat-value">{stats.twoHyphen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sufijo final</span>
              <span className="stat-value">{stats.suffixComponents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Duplicados</span>
              <span className="stat-value">{stats.duplicates}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sin padre</span>
              <span className="stat-value">{stats.orphans}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prof. máxima</span>
              <span className="stat-value">{stats.maxDepth}</span>
            </div>
          </div>
        </section>
      )}

      {warnings.length > 0 && (
        <section className="panel-section warnings-section">
          <h3>Advertencias ({warnings.length})</h3>
          <div className="warnings-list">
            {warnings.map((w, i) => (
              <div key={i} className={`warning-item warning-${w.type}`}>
                <span className="warning-icon">
                  {w.type === 'duplicate' && '⚠️'}
                  {w.type === 'noDescription' && '📝'}
                  {w.type === 'noParent' && '🔗'}
                  {w.type === 'emptyRow' && '📄'}
                </span>
                <span className="warning-text">{w.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasData && (
        <div className="no-data-message">
          <p>Cargue un archivo Excel para comenzar</p>
        </div>
      )}
    </div>
  );
}
