import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { pi314, f1 } from '../lib/measure'
import { Slider } from '../components/Slider'

const n = (x: number) => ad(String(x))

export default function CylinderStack({ onDone }: WidgetProps) {
  const [r, setR] = useState(2)
  const [h, setH] = useState(3)
  const [moved, setMoved] = useState(0)
  const mv = (f: (v: number) => void) => (v: number) => { f(v); setMoved((m) => m + 1) }
  const s = 9, rx = r * s, ry = rx * 0.3, by = 125, ly = 9
  const vol = (rr: number, hh: number) => pi314(rr * rr * hh)
  const V0 = vol(r, h)
  const rows: [string, number, number][] = [['الأسطوانة الحالية', r, h], ['ضاعفنا نصف القطر', 2 * r, h], ['ضاعفنا الارتفاع', r, 2 * h]]

  return (
    <div className="card">
      <div className="q-prompt">أسطوانة = أقراص دائرية فوق بعض 🥫</div>
      <svg viewBox="0 0 200 150" style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}>
        <path d={`M${100 - rx},${by - h * ly} L${100 - rx},${by} A${rx},${ry} 0 0 0 ${100 + rx},${by} L${100 + rx},${by - h * ly} Z`} fill="#ddd6fe" stroke="#7c3aed" strokeWidth={1.5} />
        {Array.from({ length: h - 1 }, (_, k) => (
          <path key={k} d={`M${100 - rx},${by - (k + 1) * ly} A${rx},${ry} 0 0 0 ${100 + rx},${by - (k + 1) * ly}`} fill="none" stroke="#7c3aed" strokeOpacity={0.35} />
        ))}
        <ellipse cx={100} cy={by - h * ly} rx={rx} ry={ry} fill="#ede9fe" stroke="#7c3aed" strokeWidth={1.5} />
      </svg>
      <Slider label="نصف القطر نق" value={r} min={1} max={6} onChange={mv(setR)} />
      <Slider label="الارتفاع ع" value={h} min={1} max={8} onChange={mv(setH)} />
      <div className="fb ok">
        مساحة القاعدة = ٣٫١٤ × {n(r)}² = {f1(pi314(r * r))} سم² (هاي «طبقة» وحدة){'\n'}
        الحجم = مساحة القاعدة × الارتفاع = {f1(pi314(r * r))} × {n(h)} ≈ <b>{f1(V0)} سم³</b>
      </div>
      <table className="rich-table">
        <thead><tr><th>الحالة</th><th>الحجم</th><th>كم مرة؟</th></tr></thead>
        <tbody>
          {rows.map(([name, rr, hh]) => (
            <tr key={name}><td>{name}</td><td>{f1(vol(rr, hh))}</td><td>× {f1(vol(rr, hh) / V0)}</td></tr>
          ))}
        </tbody>
      </table>
      {moved >= 3 && <button className="btn" onClick={onDone}>فهمت ✅</button>}
    </div>
  )
}