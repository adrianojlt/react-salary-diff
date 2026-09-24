import type { Situation } from 'salario-pt'

export type { SalaryResult } from 'salario-pt'

export interface FormState {
  situation: Situation
  dependents: number
  year: string
  location: string
  salary: number
  mealAmount: number
  mealType: 'card' | 'cash'
  irsJovemYear: number
  duodecimos: boolean
}
