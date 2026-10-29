import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { rad } from '../lib/geo'

const n = (x: number) => ad(String(x))
const tick = (p: [number, number], q: [number, number]) => {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2
  const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy)
  const ux = (-dy / L) * 7, uy = (dx / L) * 7
  return <line x1={mx - ux} y1={my - uy} x2={mx + ux} y2={my + uy} stroke="#7c3aed" strokeWidth={2} />
}

export default function IsoLab({ onDone }: WidgetProps) {
  const [A, setA] = useState(40)
  const [rows, setRows] = useState<number[]>([])
  const B = (180 - A) / 2
  const L = 125, cx = 150, top = 15
  const hx = L * Math.sin(rad(A / 2)), hy = L * Math.cos(rad(A / 2))
  const ap: [number, number] = [cx, top], lf: [number, number] = [cx - hx, top + hy], rt: [number, number] = [cx + hx, top + hy]

  return (
    <div className="card">
      <div className="q-prompt">غيّري زاوية الرأس، واكتبي كل مثال بالجدول 📝</div>
      <svg viewBox="0 0 300 160" style={{ width: '100%' }}>
        <polygon points={[ap, lf, rt].map((p) => p.join(',')).join(' ')} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2.5} />
        {tick(ap, lf)}
        {tick(ap, rt)}
        <text x={cx} y={top + 32} textAnchor="middle" fontSize={12} fill="#1e293b">{n(A)}°</text>
        <text x={lf[0] + 24} y={lf[1] - 5} textAnchor="middle" fontSize={12} fill="#1e293b">{n(B)}°</text>
        <text x={rt[0] - 24} y={rt[1] - 5} textAnchor="middle" fontSize={12} fill="#1e293b">{n(B)}°</text>
      </svg>
      <input type="range" min={20} max={140} step={2} value={A} onChange={(e) => setA(Number(e.target.value))} style={{ width: '100%' }} />
      <div style={{ textAlign: 'center', margin: '6px 0' }}>الرأس {n(A)}° ← زاويتا القاعدة {n(B)}° و{n(B)}°</div>
      <button className="btn" onClick={() => !rows.includes(A) && setRows([...rows, A])}>سجّلي هالمثال ✍️</button>
      {rows.length > 0 && (
        <table className="rich-table" style={{ margin: '8px auto' }}>
          <thead><tr><th>الرأس</th><th>القاعدة ١</th><th>القاعدة ٢</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r}><td>{n(r)}°</td><td>{n((180 - r) / 2)}°</td><td>{n((180 - r) / 2)}°</td></tr>)}</tbody>
        </table>
      )}
      {rows.length < 4 ? (
        <div style={{ textAlign: 'center' }}>سجّلي ٤ أمثلة مختلفة ({n(rows.length)} من ٤)</div>
      ) : (
        <>
          <div className="fb ok">
            بكل الأمثلة زاويتا القاعدة متساويتان! 🎉 هاد اسمه <b>تبرير استقرائي</b>: قاعدة طلعت من تجربة أمثلة.
          </div>
          <button className="btn" onClick={onDone}>تمام ✅</button>
        </>
      )}
    </div>
  )
}