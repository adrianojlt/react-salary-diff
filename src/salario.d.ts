declare module 'salario-pt' {
  interface SalaryInput {
    situation: string
    numDependents: number
    year: string
    location: string
    salary: number
  }

  interface SalaryOutput {
    grossSalary: number
    netSalary: number
    ssDiscount: number
    irsDiscount: number
    companyMonthlyCost: number
    companyAnnualCost: number
  }

  interface TableInfo {
    location: string
    year: string
    label: string
    validFrom: string
    file: string
    sha256: string
  }

  export function calculateSalary(input: SalaryInput): SalaryOutput
  export const LOCATIONS: string[]
  export const YEARS: string[]
  export const TABLES: TableInfo[]
}
