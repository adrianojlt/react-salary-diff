import type { FormState } from '../types'

interface SalaryFormProps {
  side: 'left' | 'right'
  form: FormState
  onChange: (form: FormState) => void
}

const YEAR_OPTIONS = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024_03', label: '2024 11-12' },
  { value: '2024_02', label: '2024 09-10' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
]

const SITUATION_OPTIONS = [
  { value: '0', label: 'Não Casado' },
  { value: '1', label: 'Casado, 1 titular' },
  { value: '2', label: 'Casado, 2 titulares' },
]

const DEPENDENT_OPTIONS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 ou mais' },
]

export function SalaryForm({ side, form, onChange }: SalaryFormProps) {
  const isLeft = side === 'left'

  const sliderMin = 760
  const sliderMax = isLeft ? 10000 : 7000
  const sliderStep = isLeft ? 20 : 5

  function handleSalaryInput(value: string) {
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      onChange({ ...form, salary: num })
    }
  }

  function row(label: string, input: React.ReactNode) {
    if (isLeft) {
      return (
        <div className="form-row">
          <div className="input-cell">{input}</div>
          <label className="field-label">{label}</label>
        </div>
      )
    } else {
      return (
        <div className="form-row">
          <label className="field-label">{label}</label>
          <div className="input-cell">{input}</div>
        </div>
      )
    }
  }

  return (
    <div className={`salary-panel ${side}`}>
      <h3 className="panel-title">{isLeft ? 'Salário A' : 'Salário B'}</h3>

      {row(
        'Ano',
        <select
          className="form-select"
          value={form.year}
          onChange={e => onChange({ ...form, year: e.target.value })}
        >
          {YEAR_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {row(
        'Situação',
        <select
          className="form-select"
          value={form.situation}
          onChange={e => onChange({ ...form, situation: e.target.value })}
        >
          {SITUATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {row(
        'Dependentes',
        <select
          className="form-select"
          value={form.dependents}
          onChange={e => onChange({ ...form, dependents: parseInt(e.target.value, 10) })}
        >
          {DEPENDENT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {row(
        'Salário',
        <input
          className="form-input"
          type="number"
          value={form.salary}
          min={sliderMin}
          onChange={e => handleSalaryInput(e.target.value)}
        />
      )}

      <input
        className="salary-range"
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={form.salary}
        style={isLeft ? undefined : { transform: 'scaleX(-1)' }}
        onChange={e => onChange({ ...form, salary: parseInt(e.target.value, 10) })}
      />
    </div>
  )
}
