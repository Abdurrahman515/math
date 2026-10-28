import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { gcd, dec, r2 } from '../lib/dec'

type P = { pct: number; n: number; fp: number; fn: number; pOpts: number[]; nOpts: number[]; nHint: string }
const DEF: P[] = [{ pct: 62, n: 520, fp: 60, fn: 500, pOpts: [50, 60, 70], nOpts: [400, 500, 600], nHint: 'لأقرب مئة' }]
const row = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap', fontSize: 20, margin: '6px 0' } as const

export default function EstimateRound({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [stage, setStage] = useState(0)
  const [bad, setBad] = useState('')
  const p = problems[i]
  const last = i === problems.length - 1
  const g = gcd(p.fp, 100)
  const est = r2((p.fp * p.fn) / 100)
  const exact = r2((p.pct * p.n) / 100)

  const pickP = (o: number) => {
    if (o === p.fp) { setStage(1); setBad('') }
    else setBad(`${ad(o)}٪ مو الأقرب لـ ${ad(p.pct)}٪ 🔍 اختاري النسبة الأقرب.`)
  }
  const pickN = (o: number) => {
    if (o === p.fn) { setStage(2); setBad('') }
    else setBad(`${ad(o)} مو الأقرب لـ ${ad(p.n)} 🔍 اختاري الأقرب.`)
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setStage(0); setBad('') }
  }
  const opts = (list: number[], f: (o: number) => void, suffix = '') => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
      {list.map((o) => <button key={o} className="btn" onClick={() => f(o)}>{ad(o)}{suffix}</button>)}
    </div>
  )

  return (
    <div className="card">
      <div className="q-prompt">قدّري <b>{ad(p.pct)}٪ من {ad(p.n)}</b> 🎯</div>
      {stage === 0 && <>
        <div>١) قرّبي <b>{ad(p.pct)}٪</b> لنسبة سهلة:</div>
        {opts(p.pOpts, pickP, '٪')}
      </>}
      {stage >= 1 && <div className="fb ok">{ad(p.pct)}٪ ≈ {ad(p.fp)}٪ ✔️</div>}
      {stage === 1 && <>
        <div>٢) قرّبي <b>{ad(p.n)}</b> ({p.nHint}):</div>
        {opts(p.nOpts, pickN)}
      </>}
      {bad && stage < 2 && <div className="fb no">{bad}</div>}
      {stage === 2 && <>
        <div className="fb ok">{ad(p.n)} ≈ {ad(p.fn)} ✔️</div>
        <div style={row}>
          <span>{ad(p.fp)}٪ =</span><Frac n={ad(p.fp / g)} d={ad(100 / g)} />
        </div>
        <div style={row}>
          <span>{ad(p.fn)} ×</span><Frac n={ad(p.fp / g)} d={ad(100 / g)} /><span>= <b>{ad(dec(est))}</b></span>
        </div>
        <div className="fb tip">
          التقدير ≈ <b>{ad(dec(est))}</b>، والجواب الدقيق {ad(dec(exact))} ← قريبين من بعض! 👌
        </div>
        <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
      </>}
    </div>
  )
}