import type { TreeNode } from '../core/types';
import { getBreadcrumb } from '../core/treeBuilder';
import './RightPanel.css';

interface RightPanelProps {
  selectedNode: TreeNode | null;
  tree: TreeNode[];
  onSelectFromBreadcrumb: (node: TreeNode) => void;
}

export default function RightPanel({ selectedNode, tree, onSelectFromBreadcrumb }: RightPanelProps) {
  if (!selectedNode) {
    return (
      <div className="right-panel">
        <div className="no-selection">
          <p>Seleccione un nodo en el árbol para ver sus detalles</p>
        </div>
      </div>
    );
  }

  const breadcrumb = getBreadcrumb(selectedNode.id, tree);

  const nodeColor = selectedNode.isRoot
    ? '#95a5a6'
    : selectedNode.isOrphan
      ? '#e74c3c'
      : selectedNode.isSuffixChild
        ? '#f39c12'
        : selectedNode.hyphenCount >= 2
          ? '#2ecc71'
          : '#3498db';

  return (
    <div className="right-panel">
      <section className="panel-section">
        <h3>Ruta</h3>
        <div className="breadcrumb">
          {breadcrumb.map((node, i) => (
            <span key={node.id} className="breadcrumb-item">
              {i > 0 && <span className="breadcrumb-sep">›</span>}
              <span
                className="breadcrumb-link"
                style={{ color: node.isRoot ? '#95a5a6' : '#3498db' }}
                onClick={() => onSelectFromBreadcrumb(node)}
              >
                {node.code}
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Detalle</h3>
        <div className="detail-card">
          <div className="detail-row">
            <span className="detail-label">Código</span>
            <span className="detail-value code-value" style={{ color: nodeColor }}>
              {selectedNode.code}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Descripción</span>
            <span className="detail-value">{selectedNode.description}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Guiones</span>
            <span className="detail-value">{selectedNode.hyphenCount}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Hijos</span>
            <span className="detail-value">{selectedNode.children.length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Profundidad</span>
            <span className="detail-value">{selectedNode.depth}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tipo</span>
            <span className="detail-value">
              <span
                className="type-badge"
                style={{
                  background: selectedNode.isRoot
                    ? '#95a5a6'
                    : selectedNode.isOrphan
                      ? '#e74c3c'
                      : selectedNode.isSuffixChild
                        ? '#f39c12'
                        : selectedNode.hyphenCount >= 2
                          ? '#2ecc71'
                          : '#3498db',
                }}
              >
                {selectedNode.isRoot
                  ? 'Raíz virtual'
                  : selectedNode.isOrphan
                    ? 'Sin padre'
                    : selectedNode.isSuffixChild
                      ? 'Componente (sufijo)'
                      : selectedNode.hyphenCount === 0
                        ? 'Nodo base'
                        : selectedNode.hyphenCount === 1
                          ? 'Ubicación'
                          : 'Componente'}
              </span>
            </span>
          </div>
        </div>
      </section>

      {selectedNode.children.length > 0 && (
        <section className="panel-section">
          <h3>Hijos ({selectedNode.children.length})</h3>
          <div className="children-list">
            {selectedNode.children.slice(0, 20).map((child) => (
              <div key={child.id} className="child-item">
                <span
                  className="child-code"
                  style={{
                    color: child.isSuffixChild
                      ? '#f39c12'
                      : child.hyphenCount >= 2
                        ? '#2ecc71'
                        : '#3498db',
                  }}
                >
                  {child.code}
                </span>
                <span className="child-desc">{child.description}</span>
              </div>
            ))}
            {selectedNode.children.length > 20 && (
              <div className="more-children">
                ... y {selectedNode.children.length - 20} más
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
