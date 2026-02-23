import { useRef } from 'react'

interface ResultsPanelProps {
  leftNet: number
  rightNet: number
  grossDiff: number
  netDiff: number
  onDoubleClickBlue: () => void
  onDoubleClickRed: () => void
}

export function ResultsPanel({
  leftNet,
  rightNet,
  grossDiff,
  netDiff,
  onDoubleClickBlue,
  onDoubleClickRed,
}: ResultsPanelProps) {
  const lastTap = useRef(0)

  function handleClick(callback: () => void) {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      callback()
    }
    lastTap.current = now
  }

  return (
    <div className="results-panel">
      <div
        className="result-box blue"
        onClick={() => handleClick(onDoubleClickBlue)}
        onDoubleClick={onDoubleClickBlue}
      >
        <span className="result-label">salário líquido A</span>
        <span className="result-value">{leftNet.toFixed(2)} €</span>
      </div>

      <div
        className="result-box red"
        onClick={() => handleClick(onDoubleClickRed)}
        onDoubleClick={onDoubleClickRed}
      >
        <span className="result-label">salário líquido B</span>
        <span className="result-value">{rightNet.toFixed(2)} €</span>
      </div>

      <div className={`result-box ${leftNet > rightNet ? 'blue-light' : rightNet > leftNet ? 'red-light' : 'white'}`}>
        <span className="result-label">diferenca liquida</span>
        <span className="result-value dark">{netDiff.toFixed(2)} €</span>
      </div>

      <div className="result-box brown">
        <span className="result-label">diferenca bruta</span>
        <span className="result-value">{grossDiff.toFixed(2)} €</span>
      </div>
    </div>
  )
}
