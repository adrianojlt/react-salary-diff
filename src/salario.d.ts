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

  export function calculateSalary(input: SalaryInput): SalaryOutput
}
