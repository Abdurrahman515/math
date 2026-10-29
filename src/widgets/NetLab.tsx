import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { Slider } from '../components/Slider'

const n = (x: number) => ad(String(x))

export default function NetLab({ onDone }: WidgetProps) {
  const [l, setL] = useState(4)
  const [w, setW] = useState(3)
  const [h, setH] = useState(2)
  const [moved, setMoved] = useState(0)
  const mv = (f: (v: number) => void) => (v: number) => { f(v); setMoved((m) => m + 1) }
  const s = 12, x0 = h * s
  const faces: { x: number; y: number; w: number; h: number; a: number; c: string }[] = [
    { x: x0, y: 0, w: l * s, h: h * s, a: l * h, c: '#fde68a' },
    { x: x0, y: h * s, w: l * s, h: w * s, a: l * w, c: '#c4b5fd' },
    { x: x0, y: (h + w) * s, w: l * s, h: h * s, a: l * h, c: '#fde68a' },
    { x: x0, y: (2 * h + w) * s, w: l * s, h: w * s, a: l * w, c: '#c4b5fd' },
    { x: 0, y: h * s, w: h * s, h: w * s, a: h * w, c: '#bbf7d0' },
    { x: x0 + l * s, y: h * s, w: h * s, h: w * s, a: h * w, c: '#bbf7d0' },
  ]
  const total = 2 * (l * w + l * h + w * h)
  return (
    <div className="card">
      <div className="q-prompt">افتحي العلبة وافردي أوجهها 📦</div>
      <svg viewBox="0 0 200 200" style={{ width: '70%', display: 'block', margin: '0 auto' }}>
        <g transform="translate(16,4)">
          {faces.map((f, k) => (
            <g key={k}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={f.c} stroke="#475569" />
              <text x={f.x + f.w / 2} y={f.y + f.h / 2 + 4} fontSize={10} textAnchor="middle">{n(f.a)}</text>
            </g>
          ))}
        </g>
      </svg>
      <Slider label="الطول ل" value={l} min={2} max={6} onChange={mv(setL)} />
      <Slider label="العرض ض" value={w} min={2} max={4} onChange={mv(setW)} />
      <Slider label="الارتفاع ع" value={h} min={2} max={4} onChange={mv(setH)} />
      <div className="fb ok">
        ٦ مستطيلات: ٢×({n(l)}×{n(w)}) + ٢×({n(l)}×{n(h)}) + ٢×({n(w)}×{n(h)}) = {n(2 * l * w)} + {n(2 * l * h)} + {n(2 * w * h)} = <b>{n(total)} سم²</b>
      </div>
      {moved >= 2 && <button className="btn" onClick={onDone}>فهمت ✅</button>}
    </div>
  )
}