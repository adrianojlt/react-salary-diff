import { useState, useMemo, useEffect } from 'react'
import { calculateSalary } from 'salario-pt'
import { SalaryForm } from './components/SalaryForm'
import { ResultsPanel } from './components/ResultsPanel'
import type { FormState, SalaryResult } from './types'
import './App.css'

const DEFAULT_FORM: FormState = {
  situation: '0',
  dependents: 0,
  year: '2026',
  salary: 1000,
}

function formToResult(form: FormState): SalaryResult | null {
  try {
    return calculateSalary({
      situation: form.situation,
      numDependents: form.dependents,
      year: form.year,
      salary: form.salary,
    })
  } catch {
    return null
  }
}

function readURLParams(): { left: Partial<FormState>; right: Partial<FormState> } {
  const params = new URLSearchParams(window.location.search)
  return {
    left: {
      situation: params.get('situation01') ?? undefined,
      dependents: params.has('dependents01') ? parseInt(params.get('dependents01')!, 10) : undefined,
      year: params.get('yearLeft') ?? undefined,
      salary: params.has('salaryInputLeft') ? parseInt(params.get('salaryInputLeft')!, 10) : undefined,
    },
    right: {
      situation: params.get('situation02') ?? undefined,
      dependents: params.has('dependents02') ? parseInt(params.get('dependents02')!, 10) : undefined,
      year: params.get('yearRight') ?? undefined,
      salary: params.has('salaryInputRight') ? parseInt(params.get('salaryInputRight')!, 10) : undefined,
    },
  }
}

function mergeWithDefaults(partial: Partial<FormState>): FormState {
  return {
    situation: partial.situation ?? DEFAULT_FORM.situation,
    dependents: partial.dependents !== undefined && !isNaN(partial.dependents) ? partial.dependents : DEFAULT_FORM.dependents,
    year: partial.year ?? DEFAULT_FORM.year,
    salary: partial.salary !== undefined && !isNaN(partial.salary) ? partial.salary : DEFAULT_FORM.salary,
  }
}

export default function App() {

  const urlParams = readURLParams()

  const [leftForm, setLeftForm] = useState<FormState>(() => mergeWithDefaults(urlParams.left))
  const [rightForm, setRightForm] = useState<FormState>(() => mergeWithDefaults(urlParams.right))

  const leftResult = useMemo(() => formToResult(leftForm), [leftForm])
  const rightResult = useMemo(() => formToResult(rightForm), [rightForm])

  const leftNet = leftResult?.netSalary ?? 0
  const rightNet = rightResult?.netSalary ?? 0
  const netDiff = Math.abs(leftNet - rightNet)
  const grossDiff = Math.abs(leftForm.salary - rightForm.salary)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('situation01', leftForm.situation)
    params.set('dependents01', String(leftForm.dependents))
    params.set('yearLeft', leftForm.year)
    params.set('salaryInputLeft', String(leftForm.salary))
    params.set('salaryRangeLeft', String(leftForm.salary))
    params.set('situation02', rightForm.situation)
    params.set('dependents02', String(rightForm.dependents))
    params.set('yearRight', rightForm.year)
    params.set('salaryInputRight', String(rightForm.salary))
    params.set('salaryRangeRight', String(rightForm.salary))
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }, [leftForm, rightForm])

  function copyLeftToRight() {
    setRightForm({ ...leftForm })
  }

  function copyRightToLeft() {
    setLeftForm({ ...rightForm })
  }

  return (
    <div className="app-container">
      <h2 className="app-title">Calculo Salário</h2>
      <div className="main-grid">
        <SalaryForm side="left" form={leftForm} onChange={setLeftForm} />
        <ResultsPanel
          leftNet={leftNet}
          rightNet={rightNet}
          grossDiff={grossDiff}
          netDiff={netDiff}
          onDoubleClickBlue={copyLeftToRight}
          onDoubleClickRed={copyRightToLeft}
        />
        <SalaryForm side="right" form={rightForm} onChange={setRightForm} />
      </div>
    </div>
  )
}
