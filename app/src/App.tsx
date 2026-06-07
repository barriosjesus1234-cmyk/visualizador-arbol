import { useState, useCallback } from 'react';
import type { TreeNode, TreeStats, Warning } from './core/types';
import { parseExcelFile } from './core/parser';
import { buildTree, normalizeRows, exportToJSON, searchTree } from './core/treeBuilder';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import TreeVisualization from './components/TreeVisualization';
import './App.css';

export default function App() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState<TreeStats | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [expansionLevel, setExpansionLevel] = useState(0);
  const [hasData, setHasData] = useState(false);

  const handleFileLoad = useCallback(async (file: File) => {
    try {
      const rawRows = await parseExcelFile(file);
      const normalized = normalizeRows(rawRows);
      const result = buildTree(normalized);

      setTree(result.tree);
      setStats(result.stats);
      setWarnings(result.warnings);
      setHasData(true);
      setSelectedNode(null);
      setSearchTerm('');

      // Expandir primer nivel por defecto
      const initialExpanded = new Set<string>();
      initialExpanded.add('__root__');
      if (result.tree[0]?.children) {
        for (const child of result.tree[0].children) {
          initialExpanded.add(child.id);
        }
      }
      setExpandedNodes(initialExpanded);
    } catch (err) {
      console.error('Error al cargar archivo:', err);
      alert('Error al cargar el archivo Excel. Verifique el formato.');
    }
  }, []);

  const handleClearStructure = useCallback(() => {
    const confirmed = window.confirm(
      '¿Está seguro de que desea borrar toda la estructura?\n\n' +
      'Se eliminarán todos los nodos, estadísticas y se limpiará la aplicación.'
    );
    if (!confirmed) return;

    setTree([]);
    setStats(null);
    setWarnings([]);
    setSelectedNode(null);
    setExpandedNodes(new Set());
    setSearchTerm('');
    setExpansionLevel(0);
    setHasData(false);
  }, []);

  const handleExportJSON = useCallback(() => {
    if (!tree.length) return;
    const json = exportToJSON(tree);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estructura-arbol.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tree]);

  const handleSelectNode = useCallback((node: TreeNode) => {
    setSelectedNode(node);
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleToggleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    function collect(nodes: TreeNode[]) {
      for (const node of nodes) {
        allIds.add(node.id);
        if (node.children.length > 0) collect(node.children);
      }
    }
    collect(tree);
    setExpandedNodes(allIds);
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    const rootOnly = new Set<string>();
    rootOnly.add('__root__');
    setExpandedNodes(rootOnly);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleExpansionLevelChange = useCallback((level: number) => {
    setExpansionLevel(level);
    // Expandir hasta el nivel indicado
    const expanded = new Set<string>();
    expanded.add('__root__');

    function expandToLevel(nodes: TreeNode[], currentDepth: number) {
      for (const node of nodes) {
        if (currentDepth < level) {
          expanded.add(node.id);
          expandToLevel(node.children, currentDepth + 1);
        }
      }
    }
    if (tree.length > 0) {
      expandToLevel(tree[0].children, 1);
    }
    setExpandedNodes(expanded);
  }, [tree]);

  const handleSelectFromBreadcrumb = useCallback((node: TreeNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="app">
      <TopBar
        onFileLoad={handleFileLoad}
        onClearStructure={handleClearStructure}
        onExportJSON={handleExportJSON}
        hasData={hasData}
      />
      <div className="app-body">
        <LeftPanel
          stats={stats}
          warnings={warnings}
          searchTerm={searchTerm}
          expansionLevel={expansionLevel}
          onSearchChange={handleSearchChange}
          onExpansionLevelChange={handleExpansionLevelChange}
          onFileLoad={handleFileLoad}
          hasData={hasData}
        />
        <TreeVisualization
          tree={tree}
          selectedNode={selectedNode}
          expandedNodes={expandedNodes}
          searchTerm={searchTerm}
          expansionLevel={expansionLevel}
          onSelectNode={handleSelectNode}
          onToggleExpand={handleToggleExpand}
          onToggleExpandAll={handleToggleExpandAll}
          onCollapseAll={handleCollapseAll}
        />
        <RightPanel
          selectedNode={selectedNode}
          tree={tree}
          onSelectFromBreadcrumb={handleSelectFromBreadcrumb}
        />
      </div>
    </div>
  );
}
