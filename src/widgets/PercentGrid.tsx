import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { num: number; den: number }
const DEF: P[] = [{ num: 3, den: 4 }]

export default function PercentGrid({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [scaled, setScaled] = useState(false)
  const p = problems[i]
  const k = 100 / p.den
  const pct = p.num * k
  const last = i === problems.length - 1

  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setScaled(false) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        حوّلي الكسر لنسبة مئوية 📊
        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', fontSize: 24 }}>
          <Frac n={String(p.num)} d={String(p.den)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, width: 220, margin: '0 auto 12px' }}>
        {Array.from({ length: 100 }, (_, c) => (
          <div key={c} style={{ aspectRatio: '1', borderRadius: 2, background: scaled && c < pct ? '#8b5cf6' : '#e5e7eb55', border: '1px solid #8b5cf655' }} />
        ))}
      </div>
      {!scaled ? (
        <button className="btn" onClick={() => setScaled(true)}>
          اضربي البسط والمقام بـ{toArabicDigits(k)} ليصير المقام ١٠٠ ✖️
        </button>
      ) : (
        <>
          <div className="fb ok" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Frac n={String(p.num)} d={String(p.den)} /> = <Frac n={String(pct)} d="100" /> = <b>{toArabicDigits(pct)}٪</b> 🎉
          </div>
          <div className="fb tip">من أصل ١٠٠ مربع، لوّنّا {toArabicDigits(pct)} مربعاً ✨</div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}