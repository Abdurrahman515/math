import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { f1 } from '../lib/measure'
import { Slider } from '../components/Slider'

const n = (x: number) => ad(String(x))
const P = (p: number[][]) => p.map((q) => q.join(',')).join(' ')

export default function AreaLab({ onDone, props }: WidgetProps) {
  const tri = ((props?.mode as string | undefined) ?? 'tri') === 'tri'
  const [a, setA] = useState(tri ? 6 : 4)   // مثلث: القاعدة | شبه منحرف: ق₁ (العليا)
  const [b, setB] = useState(8)             // شبه منحرف: ق₂ (السفلى)
  const [h, setH] = useState(4)
  const [two, setTwo] = useState(false)
  const [moved, setMoved] = useState(0)
  const mv = (f: (v: number) => void) => (v: number) => { f(v); setMoved((m) => m + 1) }

  const base = tri ? a : a + b
  const u = Math.min(18, 220 / base), H = h * u, xt = 24, y0 = 12, yb = y0 + H
  const shapeA = tri
    ? [[10, yb], [10 + a * u, yb], [10 + a * u + xt, y0]]
    : [[10, yb], [10 + b * u, yb], [10 + xt + a * u, y0], [10 + xt, y0]]
  const shapeB = tri
    ? [[10 + a * u + xt, y0], [10 + xt, y0], [10, yb]]
    : [[10 + b * u, yb], [10 + (a + b) * u, yb], [10 + xt + (a + b) * u, y0], [10 + xt + a * u, y0]]

  const info = !two
    ? 'هاي قطعة وحدة. ألصقي نسخة مقلوبة منها وشوفي شو بيتكوّن 👇'
    : tri
      ? `متوازي الأضلاع: ق × ع = ${n(a)} × ${n(h)} = ${n(a * h)} سم². المثلث نصفه ← م = ½ × ق × ع = ${f1((a * h) / 2)} سم²`
      : `متوازي الأضلاع قاعدته (ق₁ + ق₂) = ${n(a)} + ${n(b)} = ${n(a + b)} وارتفاعه ع = ${n(h)}، فمساحته ${n((a + b) * h)}. شبه المنحرف نصفه ← م = ½ × ع × (ق₁ + ق₂) = ${f1(((a + b) * h) / 2)} سم²`

  return (
    <div className="card">
      <div className="q-prompt">{tri ? 'مثلث + مثلث مقلوب = متوازي أضلاع 🔺' : 'شبه منحرف + شبه منحرف مقلوب = متوازي أضلاع 🔷'}</div>
      <svg viewBox="0 0 270 175" style={{ width: '100%' }}>
        <polygon points={P(shapeA)} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
        <polygon points={P(shapeB)} fill={two ? '#fde68a' : 'none'} stroke={two ? '#d97706' : '#94a3b8'} strokeWidth={2} strokeDasharray={two ? undefined : '4 3'} />
        <line x1={10 + xt} y1={y0} x2={10 + xt} y2={yb} stroke="#ef4444" strokeDasharray="4 3" />
        <text x={10 + xt + 4} y={(y0 + yb) / 2} fontSize={12} fill="#ef4444">ع = {n(h)}</text>
        {tri ? (
          <text x={10 + (a * u) / 2} y={yb + 14} fontSize={12} textAnchor="middle" fill="#1e293b">ق = {n(a)}</text>
        ) : (
          <>
            <text x={10 + (b * u) / 2} y={yb + 14} fontSize={12} textAnchor="middle" fill="#1e293b">ق₂ = {n(b)}</text>
            <text x={10 + xt + (a * u) / 2} y={y0 - 2} fontSize={12} textAnchor="middle" fill="#1e293b">ق₁ = {n(a)}</text>
          </>
        )}
      </svg>
      <Slider label={tri ? 'القاعدة ق' : 'القاعدة العليا ق₁'} value={a} min={2} max={tri ? 12 : 8} onChange={mv(setA)} />
      {!tri && <Slider label="القاعدة السفلى ق₂" value={b} min={2} max={10} onChange={mv(setB)} />}
      <Slider label="الارتفاع ع" value={h} min={2} max={8} onChange={mv(setH)} />
      {!two && <button className="btn" onClick={() => setTwo(true)}>🔄 ألصقي نسخة مقلوبة</button>}
      <div className={'fb' + (two ? ' ok' : '')} style={{ marginTop: 8 }}>{info}</div>
      {two && moved >= 2 && <button className="btn" onClick={onDone}>فهمت ✅</button>}
    </div>
  )
}