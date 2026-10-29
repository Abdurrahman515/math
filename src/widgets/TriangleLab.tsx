import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { triPoints, triAngleKind, triSideKind, triAngAr, triSideAr } from '../lib/geo'
import type { TriAngle, TriSide } from '../lib/geo'

type Task = { angle?: TriAngle; side?: TriSide; text: string }
const n = (x: number) => ad(String(x))

export default function TriangleLab({ onDone, props }: WidgetProps) {
  const tasks = (props?.tasks as Task[] | undefined) ?? []
  const free = tasks.length === 0
  const [a, setA] = useState(50)
  const [b, setB] = useState(60)
  const [moves, setMoves] = useState(0)
  const [i, setI] = useState(0)
  const [ok, setOk] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')
  const c = 180 - a - b

  const setAng = (which: 'a' | 'b', raw: number) => {
    const other = which === 'a' ? b : a
    let v = raw
    if (Math.abs(v - 90) <= 1) v = 90
    else if (Math.abs(v - 60) <= 1) v = 60
    else if (Math.abs(v - other) <= 1) v = other
    let o = other
    if (v + o > 170) o = 170 - v
    if (which === 'a') { setA(v); setB(o) } else { setB(v); setA(o) }
    setMoves(moves + 1); setOk(null); setMsg('')
  }

  const pts = triPoints(a, b, 300, 170)
  const g: [number, number] = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3]
  const labs = [a, b, c]
  const ak = triAngleKind(a, b, c)
  const sk = triSideKind(a, b, c)
  const t = tasks[i]
  const last = i === tasks.length - 1
  const check = () => {
    const okA = !t.angle || t.angle === ak
    const okS = !t.side || t.side === sk
    if (okA && okS) { setOk(true); setMsg(`برافو! 🎉 مثلثك ${triAngAr[ak]} و${triSideAr[sk]} ✔️`) }
    else { setOk(false); setMsg(`مثلثك الآن ${triAngAr[ak]} و${triSideAr[sk]} 🔍 حاولي تعدّلي الزوايا.`) }
  }
  const next = () => { if (last) onDone(); else { setI(i + 1); setOk(null); setMsg('') } }

  return (
    <div className="card">
      {!free && <div className="q-prompt">{t.text} 🎯 ({n(i + 1)} من {n(tasks.length)})</div>}
      {free && <div className="q-prompt">حرّكي الشريطين وراقبي مجموع الزوايا 🔺</div>}
      <svg viewBox="0 0 300 170" style={{ width: '100%' }}>
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2.5} />
        {pts.map((p, k) => (
          <text key={k} x={p[0] + (g[0] - p[0]) * 0.3} y={p[1] + (g[1] - p[1]) * 0.3 + 4} fontSize={12} textAnchor="middle" fill="#1e293b">{n(labs[k])}°</text>
        ))}
      </svg>
      <div>الزاوية الأولى: {n(a)}°</div>
      <input type="range" min={10} max={160} value={a} onChange={(e) => setAng('a', Number(e.target.value))} style={{ width: '100%' }} />
      <div>الزاوية الثانية: {n(b)}°</div>
      <input type="range" min={10} max={160} value={b} onChange={(e) => setAng('b', Number(e.target.value))} style={{ width: '100%' }} />
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        {n(a)}° + {n(b)}° + {n(c)}° = <b>١٨٠°</b> (الثالثة تنحسب لحالها)
      </div>
      <div style={{ textAlign: 'center' }}>حسب الزوايا: <b>{triAngAr[ak]}</b> · حسب الأضلاع: <b>{triSideAr[sk]}</b></div>
      {msg && <div className={ok ? 'fb ok' : 'fb no'}>{msg}</div>}
      {free ? (
        moves >= 4 && <button className="btn" onClick={onDone}>تمام ✅ المجموع دايماً ١٨٠°</button>
      ) : ok ? (
        <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'التالي ➡️'}</button>
      ) : (
        <button className="btn" onClick={check}>تحقّقي ✔️</button>
      )}
    </div>
  )
}