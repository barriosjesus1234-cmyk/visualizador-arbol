import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { TreeNode } from '../core/types';
import './TreeVisualization.css';

interface TreeVisualizationProps {
  tree: TreeNode[];
  selectedNode: TreeNode | null;
  expandedNodes: Set<string>;
  searchTerm: string;
  expansionLevel: number;
  onSelectNode: (node: TreeNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onToggleExpandAll: () => void;
  onCollapseAll: () => void;
}

export default function TreeVisualization({
  tree,
  selectedNode,
  expandedNodes,
  searchTerm,
  onSelectNode,
  onToggleExpand,
  onToggleExpandAll,
  onCollapseAll,
}: TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tree.length) return;

    const rootData = tree[0];
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 30, right: 250, bottom: 30, left: 250 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // ── Grupo principal con margen ──
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // ── Zoom ──
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.08, 4])
      .on('zoom', (evt) => { g.attr('transform', evt.transform); });
    svg.call(zoom);

    // ── 1. Construir jerarquía ──
    // Usamos any para evitar conflictos de tipos entre d3 versions
    const root: any = d3.hierarchy(rootData, (d: any) => d.children);

    // ── 2. Ocultar hijos de nodos colapsados ──
    function applyExpandState(node: any) {
      if (node.data.id === '__root__') {
        // Raíz virtual siempre expandida
      } else if (!expandedNodes.has(node.data.id) && node.children && node.children.length > 0) {
        node._children = node.children;
        node.children = undefined;
      }
      if (node.children) {
        for (const child of node.children) {
          applyExpandState(child);
        }
      }
    }
    applyExpandState(root);

    // ── 3. Layout de árbol ──
    const treeLayout = d3.tree<any>()
      .size([innerHeight, innerWidth])
      .nodeSize([22, 340])
      .separation((a, b) => {
        function leafCount(n: any): number {
          if (!n.children || n.children.length === 0) return 1;
          let sum = 0;
          for (const c of n.children) sum += leafCount(c);
          return sum;
        }
        const aLeaves = leafCount(a);
        const bLeaves = leafCount(b);
        const factor = Math.max(1, (aLeaves + bLeaves) / 2);
        return a.parent === b.parent ? 1.0 * factor : 1.5 * factor;
      });

    treeLayout(root);

    // ── Color por tipo ──
    function nodeColor(d: any): string {
      if (d.data.isRoot) return '#95a5a6';
      if (d.data.isOrphan) return '#e74c3c';
      if (d.data.isSuffixChild) return '#f39c12';
      if (d.data.hyphenCount >= 2) return '#2ecc71';
      return '#3498db';
    }

    function nodeRadius(d: any): number {
      if (d.data.isRoot) return 8;
      if (!!(d.children?.length) || !!(d._children?.length)) return 6;
      return 4;
    }

    const hasChildren = (d: any): boolean =>
      !!(d.children?.length) || !!(d._children?.length);

    // ── 4. Enlaces ──
    g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', d3.linkHorizontal<any, [number, number]>()
        .x((d: any) => d[1])
        .y((d: any) => d[0]))
      .attr('fill', 'none')
      .attr('stroke', (d: any) => nodeColor(d.target))
      .attr('stroke-width', 0.7)
      .attr('stroke-opacity', 0.45);

    // ── 5. Nodos ──
    const allNodes = root.descendants();
    const nodeG = g.append('g')
      .selectAll('g')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.y ?? 0},${d.x ?? 0})`)
      .attr('cursor', 'pointer')
      .on('click', (_evt: any, d: any) => {
        _evt.stopPropagation();
        onSelectNode(d.data);
      });

    // Círculo
    nodeG.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', nodeColor)
      .attr('stroke', (d: any) => {
        if (d.data.id === selectedNode?.id) return '#2c3e50';
        if (d.data.isOrphan) return '#c0392b';
        return 'none';
      })
      .attr('stroke-width', (d: any) => d.data.id === selectedNode?.id ? 2.5 : 0);

    // Botón expandir / contraer
    nodeG.filter((d: any) => hasChildren(d))
      .append('rect')
      .attr('x', -22)
      .attr('y', -7)
      .attr('width', 14)
      .attr('height', 14)
      .attr('rx', 3)
      .attr('fill', 'white')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .on('click', (evt: any, d: any) => {
        evt.stopPropagation();
        onToggleExpand(d.data.id);
      });

    nodeG.filter((d: any) => hasChildren(d))
      .append('text')
      .attr('x', -15)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('cursor', 'pointer')
      .style('pointer-events', 'none')
      .text((d: any) => d.children ? '−' : '+');

    // Etiqueta
    nodeG.append('text')
      .attr('dx', 11)
      .attr('dy', 4)
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('fill', (d: any) => {
        if (d.data.isRoot) return '#7f8c8d';
        if (d.data.isOrphan) return '#e74c3c';
        return '#2c3e50';
      })
      .style('pointer-events', 'none')
      .text((d: any) => {
        if (d.data.isRoot) return d.data.code;
        return `${d.data.code} — ${d.data.description}`;
      });

    // ── 6. Resaltar búsqueda ──
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      nodeG.filter((d: any) =>
        d.data.code.toLowerCase().includes(lowerTerm) ||
        d.data.description.toLowerCase().includes(lowerTerm)
      )
        .select('circle')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 2.5)
        .attr('r', 10);
    }

    // ── 7. Centrar vista inicial ──
    const centerX = innerWidth / 2 - (root.y ?? 0);
    const centerY = innerHeight / 2 - (root.x ?? 0);
    svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity.translate(centerX, centerY).scale(0.8)
    );

  }, [tree, dimensions, expandedNodes, selectedNode, searchTerm, onSelectNode, onToggleExpand]);

  return (
    <div className="tree-visualization" ref={containerRef}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      <div className="tree-controls">
        <button onClick={onToggleExpandAll} title="Expandir todo">🔽 Expandir todo</button>
        <button onClick={onCollapseAll} title="Contraer todo">🔼 Contraer todo</button>
      </div>
    </div>
  );
}
