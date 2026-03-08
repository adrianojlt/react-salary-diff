import { useState, useMemo } from 'react'
import { calculateSalary } from 'salario-pt'
import { SalaryForm } from './components/SalaryForm'
import { ResultsPanel } from './components/ResultsPanel'
import { TaxesPanel } from './components/TaxesPanel'
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

  const [copied, setCopied] = useState(false)

  function buildShareURL() {
    const params = new URLSearchParams()
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
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  function handleShare() {
    navigator.clipboard.writeText(buildShareURL())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLeftToRight() {
    setRightForm({ ...leftForm })
  }

  function copyRightToLeft() {
    setLeftForm({ ...rightForm })
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2 className="app-title">Calculo Salário</h2>
        <button className="share-btn" onClick={handleShare} title="Copiar link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
        {copied && <span className="share-tooltip">Copiado!</span>}
      </div>
      <div className="main-grid">
        <div className="salary-column">
          <SalaryForm side="left" form={leftForm} onChange={setLeftForm} />
          <TaxesPanel side="left" result={leftResult} />
        </div>
        <ResultsPanel
          leftNet={leftNet}
          rightNet={rightNet}
          grossDiff={grossDiff}
          netDiff={netDiff}
          onDoubleClickBlue={copyLeftToRight}
          onDoubleClickRed={copyRightToLeft}
        />
        <div className="salary-column">
          <SalaryForm side="right" form={rightForm} onChange={setRightForm} />
          <TaxesPanel side="right" result={rightResult} />
        </div>
      </div>
    </div>
  )
}
