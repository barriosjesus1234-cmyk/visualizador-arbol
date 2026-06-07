# 🌳 Visualizador de Estructura Taxonómica de Activos

Aplicación web para visualizar una estructura jerárquica de activos (ubicaciones técnicas) como un árbol navegable.

## Stack tecnológico

- **React** + **TypeScript**
- **Vite** (bundler)
- **D3.js** (visualización de árbol)
- **SheetJS / xlsx** (lectura de Excel)
- **Vitest** (pruebas unitarias)

## Instalación

```bash
cd app
npm install
```

## Ejecución (desarrollo)

```bash
npm run dev
```

Abrir http://localhost:5173 en el navegador.

## Pruebas

```bash
npm test
```

## Carga de archivo Excel

El archivo Excel debe tener:
- **Columna A**: código del equipo o ubicación técnica
- **Columna B**: descripción

Formato soportado: `.xlsx`

## Reglas de construcción del árbol

1. **Normalización**: trim, mayúsculas, eliminar filas vacías.
2. **Códigos con 2 guiones**: primero revisar si existe padre quitando últimos 3 caracteres. Si no, el padre es todo antes del segundo guión.
3. **Códigos con 1 guión**: reducir lado derecho en bloques de 2 caracteres hasta encontrar un padre existente.
4. **Sin padre**: se cuelga bajo la raíz virtual "Estructura cargada".

## Esquema de colores

| Tipo | Color |
|------|-------|
| 1 guión (ubicación) | 🔵 Azul |
| 2 guiones (componente) | 🟢 Verde/Turquesa |
| 2 guiones con sufijo final | 🟠 Naranjo/Ámbar |
| Raíz virtual | ⚪ Gris |
| Nodo sin padre | 🔴 Rojo suave |

## Funcionalidades

- Cargar archivo Excel
- Borrar estructura con confirmación
- Expandir/contraer todo
- Exportar a JSON
- Búsqueda por código y descripción
- Control de nivel de expansión
- Estadísticas detalladas
- Advertencias (duplicados, sin descripción, sin padre)
- Breadcrumb de navegación
- Panel de detalle del nodo seleccionado
- Zoom y pan en el árbol
