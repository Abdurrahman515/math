import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { gcd, dec, r2 } from '../lib/dec'

type P = { pct: number; n: number }
const DEF: P[] = [{ pct: 5, n: 300 }]
const row = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap', fontSize: 20, margin: '6px 0' } as const

export default function PercentOf({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [method, setMethod] = useState<'f' | 'd'>('f')
  const [step, setStep] = useState(0)
  const p = problems[i]
  const canFrac = Number.isInteger(p.pct)
  const m = canFrac ? method : 'd'
  const g = canFrac ? gcd(p.pct, 100) : 1
  const fn = p.pct / g, fd = 100 / g
  const res = r2((p.pct * p.n) / 100)
  const d = dec(p.pct / 100)
  const last = i === problems.length - 1
  const sel = (k: 'f' | 'd') => ({ outline: m === k ? '3px solid #7c3aed' : 'none' })
  const pick = (k: 'f' | 'd') => { setMethod(k); setStep(0) }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setStep(0); setMethod('f') }
  }

  return (
    <div className="card">
      <div className="q-prompt">احسبي <b>{ad(p.pct)}٪ من {ad(p.n)}</b> 🧮 {canFrac ? 'وجرّبي الطريقتين!' : ''}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0' }}>
        {canFrac && <button className="btn" style={sel('f')} onClick={() => pick('f')}>🔢 كسر اعتيادي</button>}
        <button className="btn" style={sel('d')} onClick={() => pick('d')}>🔟 كسر عشري</button>
      </div>
      {step >= 1 && (m === 'f' ? (
        <div style={row}>
          <span>{ad(p.pct)}٪ =</span><Frac n={ad(p.pct)} d={ad(100)} />
          {g > 1 && <><span>=</span><Frac n={ad(fn)} d={ad(fd)} /></>}
        </div>
      ) : (
        <div style={row}>{ad(p.pct)}٪ = {ad(p.pct)} ÷ ١٠٠ = <b>{ad(d)}</b></div>
      ))}
      {step >= 2 && (m === 'f' ? (
        <div style={row}>
          <span>{ad(p.n)} ×</span><Frac n={ad(fn)} d={ad(fd)} /><span>= <b>{ad(dec(res))}</b></span>
        </div>
      ) : (
        <div style={row}>{ad(p.n)} × {ad(d)} = <b>{ad(dec(res))}</b></div>
      ))}
      {step >= 3 && (
        <div className="fb ok">
          الناتج {p.pct > 100 ? 'أكبر' : 'أقل'} من {ad(p.n)} لأن النسبة {p.pct > 100 ? 'أكبر' : 'أقل'} من ١٠٠٪ ✔️
        </div>
      )}
      {step < 3 && <button className="btn" onClick={() => setStep(step + 1)}>{step === 0 ? 'ابدأي ▶️' : 'الخطوة التالية ➡️'}</button>}
      {step === 3 && <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>}
    </div>
  )
}