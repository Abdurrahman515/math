import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { dec, r2, r3 } from '../lib/dec'

type P = { kind: 'up' | 'down'; price: number; pct: number }
const DEF: P[] = [{ kind: 'down', price: 240, pct: 35 }]
const f = (x: number) => ad(dec(x))
const row = { textAlign: 'center', fontSize: 19, margin: '8px 0' } as const

export default function ChangeBar({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [m, setM] = useState<'a' | 'b'>('a')
  const [step, setStep] = useState(0)
  const p = problems[i]
  const up = p.kind === 'up'
  const last = i === problems.length - 1
  const amount = r2((p.price * p.pct) / 100)
  const res = r2(up ? p.price + amount : p.price - amount)
  const total = up ? 100 + p.pct : 100 - p.pct
  const mult = r3(total / 100)
  const word = up ? 'الزيادة' : 'الخصم'
  const sel = (k: 'a' | 'b') => ({ outline: m === k ? '3px solid #7c3aed' : 'none' })
  const pick = (k: 'a' | 'b') => { setM(k); setStep(0) }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setStep(0); setM('a') }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        سعر سلعة <b>{f(p.price)}</b> ريال، و{up ? 'ارتفع' : 'نزل'} بنسبة <b>{f(p.pct)}٪</b>. كم سعرها الجديد؟ 🏷️
      </div>
      <div style={{ display: 'flex', height: 34, borderRadius: 8, overflow: 'hidden', border: '2px solid currentColor', margin: '12px 0 4px' }}>
        <div style={{ flex: up ? 100 : 100 - p.pct, background: 'rgba(124,58,237,.35)' }} />
        <div style={{ flex: p.pct, background: up ? 'rgba(34,197,94,.55)' : 'rgba(239,68,68,.5)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
        <span>{up ? 'السعر الأصلي ١٠٠٪' : `اللي بيضل ${f(100 - p.pct)}٪`}</span>
        <span>{word} {f(p.pct)}٪</span>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
        <button className="btn" style={sel('a')} onClick={() => pick('a')}>1️⃣ نحسب المقدار أول</button>
        <button className="btn" style={sel('b')} onClick={() => pick('b')}>2️⃣ طريقة مختصرة</button>
      </div>
      {step >= 1 && (m === 'a'
        ? <div style={row}>مقدار {word} = {f(p.pct)}٪ × {f(p.price)} = <b>{f(amount)}</b></div>
        : <div style={row}>١٠٠٪ {up ? '+' : '−'} {f(p.pct)}٪ = {f(total)}٪ = <b>{f(mult)}</b></div>)}
      {step >= 2 && (m === 'a'
        ? <div style={row}>{f(p.price)} {up ? '+' : '−'} {f(amount)} = <b>{f(res)}</b> ريال</div>
        : <div style={row}>{f(p.price)} × {f(mult)} = <b>{f(res)}</b> ريال</div>)}
      {step >= 3 && <div className="fb ok">السعر الجديد أ{up ? 'كبر' : 'قل'} من السعر الأصلي ✔️ ومعقول! 🎉</div>}
      {step < 3 && <button className="btn" onClick={() => setStep(step + 1)}>{step === 0 ? 'ابدأي ▶️' : 'الخطوة التالية ➡️'}</button>}
      {step === 3 && <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>}
    </div>
  )
}