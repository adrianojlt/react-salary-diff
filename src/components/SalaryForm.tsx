import { TABLES, type Situation } from 'salario-pt'
import type { FormState } from '../types'

interface SalaryFormProps {
  side: 'left' | 'right'
  form: FormState
  onChange: (form: FormState) => void
}

const YEAR_OPTIONS = [...new Map(TABLES.map(table => [table.year, table.label]))]
  .map(([value, label]) => ({ value, label }))

const SITUATION_OPTIONS = [
  { value: 'NotMarried', label: 'Não Casado' },
  { value: 'MarriedOneHolder', label: 'Casado, 1 titular' },
  { value: 'MarriedTwoHolders', label: 'Casado, 2 titulares' },
]

const LOCATION_OPTIONS = [
  { value: 'continente', label: 'Continente' },
  { value: 'madeira', label: 'Madeira' },
  { value: 'acores', label: 'Açores' },
]

const DEPENDENT_OPTIONS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 ou mais' },
]

const MEAL_TYPE_OPTIONS = [
  { value: 'card', label: 'Cartão' },
  { value: 'cash', label: 'Dinheiro' },
]

const IRS_JOVEM_OPTIONS = [
  { value: 0, label: 'Não' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Ano ${i + 1}` })),
]

export function SalaryForm({ side, form, onChange }: SalaryFormProps) {
  const isLeft = side === 'left'

  const sliderMin = 920
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
          onChange={e => onChange({ ...form, situation: e.target.value as Situation })}
        >
          {SITUATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {row(
        'Localização',
        <select
          className="form-select"
          value={form.location}
          onChange={e => onChange({ ...form, location: e.target.value })}
        >
          {LOCATION_OPTIONS.map(opt => (
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

      <details className="advanced-options">
        <summary className="field-label">Outras Opções</summary>

        {row(
          'Sub. Refeição/dia',
          <input
            className="form-input"
            type="number"
            value={form.mealAmount}
            min={0}
            step={0.01}
            onChange={e => {
              const num = parseFloat(e.target.value)
              onChange({ ...form, mealAmount: isNaN(num) ? 0 : num })
            }}
          />
        )}

        {row(
          'Tipo Refeição',
          <select
            className="form-select"
            value={form.mealType}
            onChange={e => onChange({ ...form, mealType: e.target.value as FormState['mealType'] })}
          >
            {MEAL_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {row(
          'IRS Jovem',
          <select
            className="form-select"
            value={form.irsJovemYear}
            onChange={e => onChange({ ...form, irsJovemYear: parseInt(e.target.value, 10) })}
          >
            {IRS_JOVEM_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        {row(
          'Duodécimos',
          <input
            type="checkbox"
            checked={form.duodecimos}
            onChange={e => onChange({ ...form, duodecimos: e.target.checked })}
          />
        )}
      </details>
    </div>
  )
}
