import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface TableInfo {
  location: string
  year: string
  file: string
}

const dataDir = path.resolve(__dirname, 'node_modules/salario-pt/data')
const manifestPath = path.join(dataDir, 'manifest.json')
if (!fs.existsSync(manifestPath)) {
  throw new Error(`salario-pt manifest not found: ${manifestPath}`)
}
const TABLES: TableInfo[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).tables
const LOCATIONS = [...new Set(TABLES.map(table => table.location))]
const YEARS = [...new Set(TABLES.map(table => table.year))]
const csvData: Record<string, string> = {}

for (const table of TABLES) {
  const filePath = path.join(dataDir, table.file)
  if (!fs.existsSync(filePath)) {
    throw new Error(`salario-pt table listed in manifest not found: ${filePath}`)
  }
  csvData[`${table.location}_${table.year}`] = fs.readFileSync(filePath, 'utf-8')
}

const tablesShim = `
const Papa = require('papaparse');
const CSV_DATA = ${JSON.stringify(csvData)};
const LOCATIONS = ${JSON.stringify(LOCATIONS)};
const YEARS = ${JSON.stringify(YEARS)};
const TABLES = ${JSON.stringify(TABLES)};
let cachedTables = null;
function loadTables(location, year) {
  if (!cachedTables) {
    cachedTables = {};
  }
  const key = location + '_' + year;
  if (cachedTables[key]) {
    return cachedTables[key];
  }
  const csv = CSV_DATA[key];
  if (!csv) {
    return null;
  }
  const results = Papa.parse(csv, { header: true, delimiter: ';' });
  cachedTables[key] = results.data;
  return cachedTables[key];
}
module.exports = { loadTables, LOCATIONS, YEARS, TABLES };
`

export default defineConfig({
  base: '/react-salary-diff/',
  plugins: [
    react(),
    {
      name: 'salario-browser-shim',
      enforce: 'pre' as const,
      transform(_code: string, id: string) {
        if (id.includes('salario-pt/src/tables.js') || id.endsWith('salario-pt/src/tables.js')) {
          return {
            code: tablesShim,
            map: null
          }
        }
        return null
      }
    }
  ],
  optimizeDeps: {
    include: ['papaparse'],
    esbuildOptions: {
      plugins: [
        {
          name: 'salario-tables-esbuild-shim',
          setup(build) {
            build.onLoad({ filter: /tables\.js$/ }, (args) => {
              if (!args.path.includes('salario-pt')) return undefined
              return {
                contents: tablesShim,
                loader: 'js'
              }
            })
          }
        }
      ]
    }
  }
})
