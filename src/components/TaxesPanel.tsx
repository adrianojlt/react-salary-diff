import type { ReactElement } from 'react'
import type { SalaryResult } from '../types'

interface TaxesPanelProps {
  side: 'left' | 'right'
  result: SalaryResult | null
}

function fmt(value: number): string {
  return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
}

function pct(value: number, total: number): string {
  if (total === 0) return '0.0%'
  return (value / total * 100).toFixed(1) + '%'
}

interface ArcSegment {
  color: string
  value: number
}

function buildArcs(segments: ArcSegment[], cx: number, cy: number, r: number): ReactElement[] {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return []

  const paths: ReactElement[] = []
  let startAngle = -Math.PI / 2

  for (const seg of segments) {
    if (seg.value <= 0) continue
    const angle = (seg.value / total) * 2 * Math.PI
    const endAngle = startAngle + angle

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    paths.push(<path key={seg.color} d={d} fill={seg.color} />)

    startAngle = endAngle
  }

  return paths
}

export function TaxesPanel({ result }: TaxesPanelProps) {
  const dash = '—'

  if (!result) {
    return (
      <div className="pie-chart-wrapper">
        <svg viewBox="0 0 160 160" width="160" height="160">
          <circle cx="80" cy="80" r="70" fill="#e5e7eb" />
          <circle cx="80" cy="80" r="35" fill="#f8f9fa" />
        </svg>
        <div className="pie-legend">
          {[
            'Custo para a Empresa',
            'Salário Líquido',
            'Impostos Empregado',
            'Impostos Empresa',
            'Total Impostos',
          ].map(label => (
            <div key={label} className="pie-legend-row">
              <span className="pie-swatch" style={{ background: '#e5e7eb' }} />
              <span className="pie-legend-label">{label}</span>
              <span className="pie-legend-value">{dash}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { netSalary, irsDiscount, ssDiscount, companyMonthlyCost } = result
  const companyTaxes = companyMonthlyCost - netSalary - ssDiscount - irsDiscount
  const employeeTaxes = ssDiscount + irsDiscount
  const totalTaxes = companyMonthlyCost - netSalary

  const segments: ArcSegment[] = [
    { color: '#21b047', value: netSalary },
    { color: '#b5a305', value: irsDiscount },
    { color: '#5e7d07', value: ssDiscount },
    { color: '#700707', value: companyTaxes },
  ]

  const arcs = buildArcs(segments, 80, 80, 70)

  return (
    <div className="pie-chart-wrapper">
      <svg viewBox="0 0 160 160" width="160" height="160">
        {arcs}
        <circle cx="80" cy="80" r="35" fill="#f8f9fa" />
      </svg>
      <div className="pie-legend">
        <div className="pie-legend-row">
          <span className="pie-swatch" style={{ background: '#888' }} />
          <span className="pie-legend-label"><strong>Custo para a Empresa</strong></span>
          <span className="pie-legend-value"><strong>{fmt(companyMonthlyCost)}</strong></span>
        </div>
        <div className="pie-legend-row">
          <span className="pie-swatch" style={{ background: '#21b047' }} />
          <span className="pie-legend-label">Salário Líquido</span>
          <span className="pie-legend-value">{fmt(netSalary)} <em>({pct(netSalary, companyMonthlyCost)})</em></span>
        </div>
        <div className="pie-legend-row">
          <span className="pie-swatch" style={{ background: '#7a9006' }} />
          <span className="pie-legend-label">Impostos Empregado</span>
          <span className="pie-legend-value">{fmt(employeeTaxes)} <em>({pct(employeeTaxes, companyMonthlyCost)})</em></span>
        </div>
        <div className="pie-legend-row pie-legend-sub">
          <span className="pie-swatch" style={{ background: '#5e7d07' }} />
          <span className="pie-legend-label">Desc. Seg. Social</span>
          <span className="pie-legend-value">{fmt(ssDiscount)} <em>({pct(ssDiscount, companyMonthlyCost)})</em></span>
        </div>
        <div className="pie-legend-row pie-legend-sub">
          <span className="pie-swatch" style={{ background: '#b5a305' }} />
          <span className="pie-legend-label">Desc. IRS</span>
          <span className="pie-legend-value">{fmt(irsDiscount)} <em>({pct(irsDiscount, companyMonthlyCost)})</em></span>
        </div>
        <div className="pie-legend-row">
          <span className="pie-swatch" style={{ background: '#700707' }} />
          <span className="pie-legend-label">Impostos Empresa</span>
          <span className="pie-legend-value">{fmt(companyTaxes)} <em>({pct(companyTaxes, companyMonthlyCost)})</em></span>
        </div>
        <div className="pie-legend-row">
          <span className="pie-swatch" style={{ background: '#555' }} />
          <span className="pie-legend-label">Total Impostos</span>
          <span className="pie-legend-value">{fmt(totalTaxes)} <em>({pct(totalTaxes, companyMonthlyCost)})</em></span>
        </div>
      </div>
    </div>
  )
}
