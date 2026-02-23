import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const YEARS = ['2026', '2025', '2024_03', '2024_02', '2024', '2023']
const csvData: Record<string, string> = {}
for (const year of YEARS) {
  const filePath = path.resolve(__dirname, 'node_modules/salario-pt/data', `taxas_continente_${year}.csv`)
  csvData[year] = fs.readFileSync(filePath, 'utf-8')
}

// https://vite.dev/config/
export default defineConfig({
  base: '/react-salary-diff/',
  plugins: [
    react(),
    {
      name: 'salario-browser-shim',
      transform(_code: string, id: string) {
        if (id.includes('salario-pt') && (id.includes('/src/tables.js') || id.includes('\\src\\tables.js'))) {
          return {
            code: `
const Papa = require('papaparse');
const CSV_DATA = ${JSON.stringify(csvData)};
const YEARS = ${JSON.stringify(YEARS)};
let cachedTables = null;
function loadTables() {
  if (cachedTables) return cachedTables;
  cachedTables = {};
  for (const year of YEARS) {
    const results = Papa.parse(CSV_DATA[year], { header: true, delimiter: ';' });
    cachedTables[year] = results.data;
  }
  return cachedTables;
}
module.exports = { loadTables };
`,
            map: null
          }
        }
      }
    }
  ],
  optimizeDeps: {
    include: ['salario-pt'],
    esbuildOptions: {
      plugins: [
        {
          name: 'salario-tables-esbuild-shim',
          setup(build) {
            build.onLoad({ filter: /tables\.js$/ }, (args) => {
              if (!args.path.includes('salario-pt')) return undefined
              return {
                contents: `
const Papa = require('papaparse');
const CSV_DATA = ${JSON.stringify(csvData)};
const YEARS = ${JSON.stringify(YEARS)};
let cachedTables = null;
function loadTables() {
  if (cachedTables) return cachedTables;
  cachedTables = {};
  for (const year of YEARS) {
    const results = Papa.parse(CSV_DATA[year], { header: true, delimiter: ';' });
    cachedTables[year] = results.data;
  }
  return cachedTables;
}
module.exports = { loadTables };
`,
                loader: 'js'
              }
            })
          }
        }
      ]
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /salario-pt/]
    }
  }
})
