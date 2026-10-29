import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { f2 } from '../lib/geo'

const n = (x: number) => ad(String(x))
const U = 9

export default function SimilarLab({ onDone, props }: WidgetProps) {
  const w = (props?.w as number | undefined) ?? 4
  const h = (props?.h as number | undefined) ?? 3
  const [w2, setW2] = useState(8)
  const [h2, setH2] = useState(3)
  const [found, setFound] = useState(false)
  const upd = (nw: number, nh: number) => {
    setW2(nw); setH2(nh)
    if (nw * h === nh * w && nw !== w) setFound(true)
  }
  const sim = w2 * h === h2 * w
  const same = w2 === w && h2 === h

  return (
    <div className="card">
      <div className="q-prompt">الأخضر لازم يكون <b>مشابه</b> للبنفسجي ({n(w)}×{n(h)}) 🔍 بس بحجم مختلف</div>
      <svg viewBox="0 0 300 140" style={{ width: '100%' }}>
        <rect x={10} y={10} width={w * U} height={h * U} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} />
        <text x={10 + (w * U) / 2} y={10 + h * U + 14} textAnchor="middle" fontSize={11} fill="#1e293b">{n(w)}×{n(h)}</text>
        <rect x={100} y={10} width={w2 * U} height={h2 * U} fill={sim ? '#bbf7d0' : '#fee2e2'} stroke={sim ? '#16a34a' : '#dc2626'} strokeWidth={2} />
        <text x={100 + (w2 * U) / 2} y={10 + h2 * U + 14} textAnchor="middle" fontSize={11} fill="#1e293b">{n(w2)}×{n(h2)}</text>
      </svg>
      <div>العرض: {n(w2)}</div>
      <input type="range" min={1} max={16} value={w2} onChange={(e) => upd(Number(e.target.value), h2)} style={{ width: '100%' }} />
      <div>الارتفاع: {n(h2)}</div>
      <input type="range" min={1} max={12} value={h2} onChange={(e) => upd(w2, Number(e.target.value))} style={{ width: '100%' }} />
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        نسبة العرض: {n(w2)} ÷ {n(w)} = <b>{f2(w2 / w)}</b> · نسبة الارتفاع: {n(h2)} ÷ {n(h)} = <b>{f2(h2 / h)}</b>
      </div>
      {same ? (
        <div className="fb">هاد نفس الشكل وبنفس القياس (متطابقان) 🟰 غيّري الحجم.</div>
      ) : sim ? (
        <div className="fb ok">النسبتان متساويتان ← الشكلان <b>متشابهان</b> ✅</div>
      ) : (
        <div className="fb no">النسبتان مختلفتان ← <b>مش متشابهين</b> ❌ (زواياهم كلها قائمة، بس الأضلاع مش متناسبة!)</div>
      )}
      {found && <button className="btn" onClick={onDone}>تمام ✅</button>}
    </div>
  )
}