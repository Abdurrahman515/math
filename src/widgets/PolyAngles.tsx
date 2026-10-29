import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { f2, rad, polyAr } from '../lib/geo'

const n = (x: number) => ad(String(x))
const CX = 150, CY = 88, R = 75

export default function PolyAngles({ onDone }: WidgetProps) {
  const [k, setK] = useState(5)
  const [seen, setSeen] = useState<number[]>([5])
  const move = (v: number) => { setK(v); if (!seen.includes(v)) setSeen([...seen, v]) }
  const pts = Array.from({ length: k }, (_, j): [number, number] => [CX + R * Math.cos(rad(90 + (j * 360) / k)), CY - R * Math.sin(rad(90 + (j * 360) / k))])
  const T = 180 * (k - 2)
  const ang = T / k
  const tile = (2 * k) % (k - 2) === 0

  return (
    <div className="card">
      <div className="q-prompt">غيّري عدد الأضلاع وراقبي الزوايا والتبليط 🧱</div>
      <svg viewBox="0 0 300 180" style={{ width: '100%' }}>
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2.5} />
        {pts.slice(2, k - 1).map((p, j) => (
          <line key={j} x1={pts[0][0]} y1={pts[0][1]} x2={p[0]} y2={p[1]} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
        ))}
      </svg>
      <input type="range" min={3} max={12} value={k} onChange={(e) => move(Number(e.target.value))} style={{ width: '100%' }} />
      <div style={{ textAlign: 'center' }}>عدد الأضلاع: <b>{n(k)}</b> {polyAr[k] ? `(${polyAr[k]})` : ''}</div>
      <div style={{ margin: '8px 0', lineHeight: 1.9 }}>
        🔺 عدد المثلثات: {n(k)} − ٢ = <b>{n(k - 2)}</b><br />
        ➕ مجموع الزوايا: {n(k - 2)} × ١٨٠ = <b>{n(T)}°</b><br />
        📐 كل زاوية (إذا كان منتظماً): {n(T)} ÷ {n(k)} ≈ <b>{f2(ang)}°</b><br />
        🧱 ٣٦٠ ÷ {f2(ang)} ≈ <b>{f2(360 / ang)}</b> → {tile ? '✅ عدد صحيح: بيبلّط' : '❌ مش عدد صحيح: ما بيبلّط'}
      </div>
      {seen.length < 4 ? (
        <div style={{ textAlign: 'center' }}>جرّبي ٤ أعداد أضلاع مختلفة ({n(Math.min(seen.length, 4))} من ٤)</div>
      ) : (
        <button className="btn" onClick={onDone}>تمام ✅</button>
      )}
    </div>
  )
}