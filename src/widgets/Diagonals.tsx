import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'

const D = (n: number) => (n * (n - 3)) / 2
const COLS = [3, 4, 5, 6, 7]

export default function Diagonals({ onDone }: WidgetProps) {
  const [n, setN] = useState(3)
  const R = 100, C = 120
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    return [C + R * Math.cos(a), C + R * Math.sin(a)] as const
  })
  const diags: [number, number][] = []
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) diags.push([i, j])

  const grow = () => {
    const m = Math.min(n + 1, 7)
    setN(m)
    if (m === 7) onDone()
  }

  return (
    <div className="card center">
      <h3 className="h3">🔷 صيد الأقطار</h3>
      <div className="mut">القطر = خط بيوصل بين رأسين مش متجاورين</div>
      <svg viewBox="0 0 240 240" className="poly">
        <polygon points={pts.map((p) => p.join(',')).join(' ')} className="poly-shape" />
        {diags.map(([i, j], k) => (
          <motion.line
            key={`${n}-${i}-${j}`} className="diag"
            x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]}
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: k * 0.08, duration: 0.35 }}
          />
        ))}
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5} className="vtx" />)}
      </svg>
      <div>عدد الأضلاع: <b>{n}</b> — عدد الأقطار: <b>{D(n)}</b>{n === 3 && ' (المثلث ما فيه ولا قطر 😄)'}</div>

      <div className="table" dir="ltr">
        <div className="trow"><span className="th">أضلاع</span>{COLS.map((c) => <span key={c} className="td">{c}</span>)}</div>
        <div className="trow"><span className="th">أقطار</span>{COLS.map((c) => <span key={c} className={'td' + (c <= n ? ' on' : '')}>{c <= n ? D(c) : '؟'}</span>)}</div>
        <div className="trow"><span className="th">القفزة</span>{COLS.map((c) => <span key={c} className="td jump">{c > 3 && c <= n ? `+${D(c) - D(c - 1)}` : ''}</span>)}</div>
      </div>

      <div className="row">
        <button className="btn" disabled={n >= 7} onClick={grow}>➕ زيدي ضلعاً</button>
        <button className="link" onClick={() => setN(3)}>↩️ من البداية</button>
      </div>
    </div>
  )
}