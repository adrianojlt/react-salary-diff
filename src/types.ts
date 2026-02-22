export interface FormState {
  situation: string
  dependents: number
  year: string
  salary: number
}

export interface SalaryResult {
  grossSalary: number
  netSalary: number
  ssDiscount: number
  irsDiscount: number
  companyMonthlyCost: number
  companyAnnualCost: number
}
