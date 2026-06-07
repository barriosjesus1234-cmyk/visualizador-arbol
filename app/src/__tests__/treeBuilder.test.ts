import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeRows,
  countHyphens,
  findParentCode,
  buildTree,
} from '../core/treeBuilder';
import type { ExcelRow } from '../core/types';

describe('treeBuilder', () => {
  describe('normalizeRows', () => {
    it('debe normalizar códigos a mayúsculas y trim', () => {
      const rows: ExcelRow[] = [
        { code: '  cb-c01  ', description: 'test' },
        { code: 'cb-c0101', description: 'test2' },
      ];
      const result = normalizeRows(rows);
      expect(result[0].code).toBe('CB-C01');
      expect(result[1].code).toBe('CB-C0101');
    });

    it('debe eliminar filas vacías', () => {
      const rows: ExcelRow[] = [
        { code: 'CB-C01', description: 'test' },
        { code: '', description: 'test2' },
        { code: '   ', description: 'test3' },
      ];
      const result = normalizeRows(rows);
      expect(result.length).toBe(1);
    });
  });

  describe('countHyphens', () => {
    it('debe contar guiones correctamente', () => {
      expect(countHyphens('CB-C01')).toBe(1);
      expect(countHyphens('CB-C0101')).toBe(1);
      expect(countHyphens('CB-C010101')).toBe(1);
      expect(countHyphens('CB-C010102-1LNX11AP001')).toBe(2);
      expect(countHyphens('CB-C010102-1LNX11AP001KP1')).toBe(2);
    });
  });

  describe('findParentCode', () => {
    it('CB-C0101 debe ser hijo de CB-C01', () => {
      const codeSet = new Set(['CB-C01', 'CB-C0101']);
      const parent = findParentCode('CB-C0101', codeSet);
      expect(parent).toBe('CB-C01');
    });

    it('CB-C010102 debe ser hijo de CB-C0101', () => {
      const codeSet = new Set(['CB-C01', 'CB-C0101', 'CB-C010102']);
      const parent = findParentCode('CB-C010102', codeSet);
      expect(parent).toBe('CB-C0101');
    });

    it('CB-C010102-1LNX11AP001 debe ser hijo de CB-C010102', () => {
      const codeSet = new Set([
        'CB-C01',
        'CB-C0101',
        'CB-C010102',
        'CB-C010102-1LNX11AP001',
      ]);
      const parent = findParentCode('CB-C010102-1LNX11AP001', codeSet);
      expect(parent).toBe('CB-C010102');
    });

    it('CB-C010102-1LNX11AP001KP1 debe ser hijo de CB-C010102-1LNX11AP001 (sufijo de 3 caracteres)', () => {
      const codeSet = new Set([
        'CB-C01',
        'CB-C0101',
        'CB-C010102',
        'CB-C010102-1LNX11AP001',
        'CB-C010102-1LNX11AP001KP1',
      ]);
      const parent = findParentCode('CB-C010102-1LNX11AP001KP1', codeSet);
      expect(parent).toBe('CB-C010102-1LNX11AP001');
    });

    it('CB-C010102-1LNX11AP001M01 debe ser hijo de CB-C010102-1LNX11AP001 (sufijo de 3 caracteres)', () => {
      const codeSet = new Set([
        'CB-C01',
        'CB-C0101',
        'CB-C010102',
        'CB-C010102-1LNX11AP001',
        'CB-C010102-1LNX11AP001M01',
      ]);
      const parent = findParentCode('CB-C010102-1LNX11AP001M01', codeSet);
      expect(parent).toBe('CB-C010102-1LNX11AP001');
    });

    it('debe devolver null para nodos sin padre', () => {
      const codeSet = new Set(['CB-C01']);
      const parent = findParentCode('CB-C01', codeSet);
      expect(parent).toBeNull();
    });
  });

  describe('buildTree', () => {
    it('los nodos sin padre deben estar bajo la raíz virtual', () => {
      const rows: ExcelRow[] = [
        { code: 'CB-C01', description: 'Sistema' },
        { code: 'XY-Z99', description: 'Aislado' },
      ];
      const result = buildTree(rows);
      const virtualRoot = result.tree[0];
      expect(virtualRoot.code).toBe('Estructura cargada');
      // CB-C01 no tiene padre pero no es huérfano porque... revisemos
      // En realidad CB-C01 no tiene padre, entonces es huérfano
      const orphanNodes = virtualRoot.children;
      expect(orphanNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('debe detectar duplicados', () => {
      const rows: ExcelRow[] = [
        { code: 'CB-C01', description: 'Sistema' },
        { code: 'CB-C01', description: 'Sistema duplicado' },
        { code: 'CB-C0101', description: 'Subsistema' },
      ];
      const result = buildTree(rows);
      expect(result.stats.duplicates).toBeGreaterThanOrEqual(1);
      const hasDuplicateWarning = result.warnings.some(
        (w) => w.type === 'duplicate'
      );
      expect(hasDuplicateWarning).toBe(true);
    });

    it('debe construir estadísticas correctamente', () => {
      const rows: ExcelRow[] = [
        { code: 'CB-C01', description: 'Sistema' },
        { code: 'CB-C0101', description: 'Subsistema' },
        { code: 'CB-C010101', description: 'Equipo' },
        { code: 'CB-C010101-1LNA10GF001', description: 'Componente' },
      ];
      const result = buildTree(rows);
      expect(result.stats.total).toBe(4);
      expect(result.stats.oneHyphen).toBe(3);
      expect(result.stats.twoHyphen).toBe(1);
    });
  });

  describe('escenario integración con datos reales', () => {
    it('debe construir correctamente la jerarquía con datos de ejemplo', () => {
      const rows: ExcelRow[] = [
        { code: 'CB-C01', description: 'SISTEMA CAPTACION Y ADUCCION COLBUN' },
        { code: 'CB-C0101', description: 'COMPUERTAS INCLINADAS' },
        { code: 'CB-C010101', description: 'COMPUERTAS' },
        { code: 'CB-C010102', description: 'UNIDADES OLEOHIDRAULICAS' },
        { code: 'CB-C010102-1LNX11AP001', description: 'Motobomba Deposito Aceite N°1' },
        { code: 'CB-C010102-1LNX11AP001KP1', description: 'Bomba Deposito Aceite N°1' },
        { code: 'CB-C010102-1LNX11AP001M01', description: 'Motor Bomba Deposito Aceite N°1' },
      ];

      const result = buildTree(rows);
      const virtualRoot = result.tree[0];

      // CB-C01 debe ser hijo directo de raíz virtual
      const cbC01 = virtualRoot.children.find((n) => n.code === 'CB-C01');
      expect(cbC01).toBeDefined();

      // CB-C0101 debe ser hijo de CB-C01
      expect(cbC01!.children.find((n) => n.code === 'CB-C0101')).toBeDefined();

      // CB-C010102-1LNX11AP001 debe ser hijo de CB-C010102
      const cbC010102 = cbC01!.children
        .find((n) => n.code === 'CB-C0101')!.children
        .find((n) => n.code === 'CB-C010102');
      expect(cbC010102).toBeDefined();

      const motobomba = cbC010102!.children.find(
        (n) => n.code === 'CB-C010102-1LNX11AP001'
      );
      expect(motobomba).toBeDefined();

      // KP1 debe ser hijo de la motobomba (sufijo)
      const kp1 = motobomba!.children.find(
        (n) => n.code === 'CB-C010102-1LNX11AP001KP1'
      );
      expect(kp1).toBeDefined();
      expect(kp1!.isSuffixChild).toBe(true);

      // M01 debe ser hijo de la motobomba (sufijo)
      const m01 = motobomba!.children.find(
        (n) => n.code === 'CB-C010102-1LNX11AP001M01'
      );
      expect(m01).toBeDefined();
      expect(m01!.isSuffixChild).toBe(true);
    });
  });
});

describe('logica de reduccion por 2 caracteres', () => {
  it('CB-C010102 debe reducirse correctamente buscando CB-C0101 y luego CB-C01', () => {
    const codeSet = new Set(['CB-C01', 'CB-C0101', 'CB-C010102']);
    const parent = findParentCode('CB-C010102', codeSet);
    expect(parent).toBe('CB-C0101');
  });

  it('codigo con un guion debe reducir lado derecho en bloques de 2', () => {
    const codeSet = new Set([
      'CB-C',
      'CB-C01',
      'CB-C0101',
      'CB-C010102',
    ]);
    // CB-C010102 -> quitar 2 chars -> CB-C0101 (existe)
    expect(findParentCode('CB-C010102', codeSet)).toBe('CB-C0101');
    // CB-C0101 -> quitar 2 chars -> CB-C01 (existe)
    expect(findParentCode('CB-C0101', codeSet)).toBe('CB-C01');
    // CB-C01 -> quitar 2 chars -> CB-C (existe)
    expect(findParentCode('CB-C01', codeSet)).toBe('CB-C');
  });
});
