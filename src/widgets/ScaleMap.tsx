import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { k: number; unit: string; target: number; label: string }
const DEF: P[] = [{ k: 24, unit: 'كلم', target: 3, label: 'مكة المكرمة وجدة' }]
const clean = (x: number) => Math.round(x * 1e6) / 1e6
const s = (x: number) => String(clean(x)).replace('.', '٫')

export default function ScaleMap({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [cm, setCm] = useState(1)
  const p = problems[i]
  const last = i === problems.length - 1
  const done = cm === p.target

  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setCm(1) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        الخريطة: ١ سم = {toArabicDigits(p.k)} {p.unit} 🗺️
        <br />المسافة بين {p.label}: حرّكي المسطرة لتصير <b>{toArabicDigits(s(p.target))} سم</b>
      </div>
      <input
        type="range" min={0} max={10} step={0.5} value={cm}
        onChange={(e) => setCm(Number(e.target.value))}
        style={{ width: '100%', margin: '10px 0' }}
      />
      <div style={{ height: 14, borderRadius: 7, background: '#a78bfa', width: `${cm * 10}%`, minWidth: 4 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '14px 0', fontSize: 20 }}>
        <Frac n="1 سم" d={`${s(p.k)} ${p.unit}`} />
        <span>=</span>
        <Frac n={`${s(cm)} سم`} d={`${s(cm * p.k)} ${p.unit}`} />
      </div>
      {done && (
        <>
          <div className="fb ok">
            برافو عليكِ! 🎉 المسافة الفعلية = {toArabicDigits(s(p.target))} × {toArabicDigits(p.k)} = <b>{toArabicDigits(s(p.target * p.k))} {p.unit}</b>
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}