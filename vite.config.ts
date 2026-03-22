import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const LOCATIONS = ['continente', 'madeira', 'acores']
const YEARS = ['2026', '2025', '2024_03', '2024_02', '2024', '2023']
const csvData: Record<string, string> = {}

for (const location of LOCATIONS) {
  for (const year of YEARS) {
    const filePath = path.resolve(__dirname, 'node_modules/salario-pt/data', `taxas_${location}_${year}.csv`)
    try {
      csvData[`${location}_${year}`] = fs.readFileSync(filePath, 'utf-8')
    } catch {
      csvData[`${location}_${year}`] = ''
    }
  }
}

const tablesShim = `
const Papa = require('papaparse');
const CSV_DATA = ${JSON.stringify(csvData)};
const LOCATIONS = ${JSON.stringify(LOCATIONS)};
const YEARS = ${JSON.stringify(YEARS)};
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
module.exports = { loadTables, LOCATIONS, YEARS };
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
