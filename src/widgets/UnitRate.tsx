import { useState } from 'react'
import type { WidgetProps } from '../types'
import { dec } from '../lib/dec'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { total: number; what: string; n: number; per: string }
const DEF: P[] = [{ total: 840, what: 'ريالاً', n: 40, per: 'ساعة' }]

export default function UnitRate({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [split, setSplit] = useState(false)
  const p = problems[i]
  const last = i === problems.length - 1
  const each = toArabicDigits(dec(p.total / p.n))

  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setSplit(false) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        {toArabicDigits(p.total)} {p.what} لكل {toArabicDigits(p.n)} {p.per} 🧮
      </div>
      {!split ? (
        <button className="btn" onClick={() => setSplit(true)}>
          اقسمي على {toArabicDigits(p.n)} ➗
        </button>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 6, margin: '10px 0' }}>
            <div className="fb tip">
              نقسم البسط والمقام على {toArabicDigits(p.n)}:{'\n'}
              {toArabicDigits(p.total)} ÷ {toArabicDigits(p.n)} = <b>{each}</b>{'\n'}
              {toArabicDigits(p.n)} ÷ {toArabicDigits(p.n)} = <b>١</b>
            </div>
            <div className="fb ok">
              معدل الوحدة: <b>{each} {p.what} لكل ١ {p.per}</b> 🎉
            </div>
          </div>
          {p.n <= 10 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {Array.from({ length: p.n }, (_, k) => (
                <span key={k} style={{ border: '2px solid #34d399', borderRadius: 10, padding: '4px 10px' }}>
                  {each}
                </span>
              ))}
            </div>
          )}
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}