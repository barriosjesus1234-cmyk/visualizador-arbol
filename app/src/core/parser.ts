import * as XLSX from 'xlsx';
import type { ExcelRow } from './types';

/**
 * Lee un archivo Excel y extrae las filas con código y descripción.
 * Columna A = código, Columna B = descripción.
 */
export function parseExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(firstSheet, {
          header: 1,
          defval: '',
        });

        const rows: ExcelRow[] = [];
        let startIndex = 0;

        // Buscar encabezados o empezar desde la primera fila
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length > 0) {
            const firstCell = String(row[0]).trim().toUpperCase();
            if (firstCell === 'UBICAC.TÉCNICA' || firstCell === 'UBICAC.TECNICA' || firstCell === 'CODIGO' || firstCell === 'CÓDIGO' || firstCell === 'CODE') {
              startIndex = i + 1;
              break;
            }
          }
        }

        // Si no se encontró encabezado, empezar desde fila 1
        for (let i = startIndex; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          const code = String(row[0] || '').trim();
          const description = String(row[1] || '').trim();
          if (code) {
            rows.push({ code, description });
          }
        }

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}
