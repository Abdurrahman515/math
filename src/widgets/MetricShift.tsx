import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { n: number; from: string; to: string; k: number; dir: 'mul' | 'div' }
const DEF: P[] = [{ n: 4.5, from: 'لتر', to: 'ملل', k: 3, dir: 'mul' }]
const clean = (x: number) => Math.round(x * 1e9) / 1e9
const show = (x: number) => toArabicDigits(String(clean(x)).replace('.', '٫'))

export default function MetricShift({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const p = problems[i]
  const [v, setV] = useState(problems[0].n)
  const [steps, setSteps] = useState(0)
  const [msg, setMsg] = useState('')
  const target = clean(p.dir === 'mul' ? p.n * 10 ** p.k : p.n / 10 ** p.k)
  const done = clean(v) === target
  const last = i === problems.length - 1

  const move = (d: 'mul' | 'div') => {
    if (done) return
    setV(clean(d === 'mul' ? v * 10 : v / 10))
    setSteps(steps + 1)
    setMsg(
      d === p.dir
        ? ''
        : p.dir === 'mul'
          ? 'قريبة! 💪 من وحدة كبيرة لصغيرة بيكبر العدد، فنضرب 🔍'
          : 'قريبة! 💪 من وحدة صغيرة لكبيرة بيصغر العدد، فنقسم 🔍',
    )
  }
  const reset = () => { setV(p.n); setSteps(0); setMsg('') }
  const next = () => {
    if (last) { onDone(); return }
    setI(i + 1); setV(problems[i + 1].n); setSteps(0); setMsg('')
  }

  return (
    <div className="card">
      <div className="q-prompt">
        حوّلي {show(p.n)} {p.from} إلى {p.to} 🎚️
        <br />حرّكي الفاصلة العشرية خطوة خطوة (كل خطوة = ×١٠ أو ÷١٠):
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, textAlign: 'center', margin: '12px 0' }}>{show(v)}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn" onClick={() => move('mul')}>نضرب ×١٠ (الفاصلة لليمين)</button>
        <button className="btn" onClick={() => move('div')}>نقسم ÷١٠ (الفاصلة لليسار)</button>
        <button className="link" onClick={reset}>🔄 من البداية</button>
      </div>
      <div style={{ textAlign: 'center', margin: '8px 0', opacity: 0.8 }}>عدد الخطوات: {toArabicDigits(steps)}</div>
      {msg && !done && <div className="fb no">{msg}</div>}
      {done && (
        <>
          <div className="fb ok">
            برافو عليكِ! 🎉 {show(p.n)} {p.from} = <b>{show(target)} {p.to}</b>
            {'\n'}تحرّكت الفاصلة {toArabicDigits(p.k)} منازل = ضرب أو قسمة على ١٠ ثلاث مرات حسب العدد ✨
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}