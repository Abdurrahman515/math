import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { dec } from '../lib/dec'

type K = 'pct' | 'part' | 'whole'
type P = { kind: K; part?: number; whole?: number; pct?: number }
const DEF: P[] = [{ kind: 'pct', part: 8, whole: 20 }]
const NAME: Record<K, string> = { pct: 'النسبة المئوية', part: 'الجزء', whole: 'الكل' }
const LET: Record<K, string> = { pct: 'ن', part: 'ج', whole: 'ك' }
const f = (x: number) => ad(dec(x))
const row = { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: 22, margin: '10px 0' } as const

export default function PercentProportion({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [stage, setStage] = useState(0)
  const [bad, setBad] = useState(false)
  const p = problems[i]
  const last = i === problems.length - 1
  const part = p.part ?? 0, whole = p.whole ?? 0, pct = p.pct ?? 0
  const L = LET[p.kind]
  const cell = (k: K, v: number) => (p.kind === k ? L : f(v))
  const prod = p.kind === 'part' ? pct * whole : part * 100
  const coef = p.kind === 'pct' ? whole : p.kind === 'part' ? 100 : pct
  const raw = prod / coef
  const ans = Math.round(raw * 10) / 10
  const exactAns = Math.abs(raw - ans) < 1e-9
  const sentence =
    p.kind === 'pct' ? `ما النسبة المئوية للعدد ${f(part)} من ${f(whole)}؟`
    : p.kind === 'part' ? `ما العدد الذي يساوي ${f(pct)}٪ من ${f(whole)}؟`
    : `ما العدد الذي ${f(pct)}٪ منه تساوي ${f(part)}؟`
  const cross =
    p.kind === 'pct' ? `${f(prod)} = ${f(whole)} ن`
    : p.kind === 'part' ? `١٠٠ ج = ${f(prod)}`
    : `${f(prod)} = ${f(pct)} ك`

  const choose = (k: K) => { if (k === p.kind) { setStage(1); setBad(false) } else setBad(true) }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setStage(0); setBad(false) }
  }

  return (
    <div className="card">
      <div className="q-prompt">{sentence} 🤔</div>
      {stage === 0 && <>
        <div>شو هو المجهول بالسؤال؟</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
          {(Object.keys(NAME) as K[]).map((k) => <button key={k} className="btn" onClick={() => choose(k)}>{NAME[k]}</button>)}
        </div>
        {bad && <div className="fb no">قريبة! 💪 تذكّري: <b>الكل</b> هو العدد اللي بعد كلمة «من»، و<b>النسبة</b> عليها ٪.</div>}
      </>}
      {stage >= 1 && <>
        <div className="fb ok">المجهول هو {NAME[p.kind]}، نرمز له بـ <b>{L}</b> ✔️</div>
        <div style={row}>
          <Frac n={cell('part', part)} d={cell('whole', whole)} />
          <span>=</span>
          <Frac n={cell('pct', pct)} d={f(100)} />
        </div>
        <div style={{ textAlign: 'center', opacity: 0.8 }}>جزء ÷ كل = نسبة ÷ ١٠٠</div>
      </>}
      {stage === 1 && <button className="btn" onClick={() => setStage(2)}>الضرب التبادلي ✖️</button>}
      {stage >= 2 && <div className="fb tip" style={{ textAlign: 'center', fontSize: 20 }}>{cross}</div>}
      {stage === 2 && <button className="btn" onClick={() => setStage(3)}>نقسم ➗</button>}
      {stage >= 3 && <>
        <div style={row}>
          <span>{L} = {f(prod)} ÷ {f(coef)} {exactAns ? '=' : '≈'} <b>{f(ans)}{p.kind === 'pct' ? '٪' : ''}</b></span>
        </div>
        {!exactAns && <div className="fb tip">القسمة ما انتهت، فقرّبنا لأقرب عُشر 👌</div>}
        <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
      </>}
    </div>
  )
}