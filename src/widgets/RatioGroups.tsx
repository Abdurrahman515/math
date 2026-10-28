import { useState } from 'react'
import type { WidgetProps } from '../types'
import { gcd } from '../lib/dec'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { a: number; b: number; nameA: string; nameB: string; emojiA: string; emojiB: string }
const DEF: P[] = [
  { a: 6, b: 9, nameA: 'تفاحات', nameB: 'برتقالات', emojiA: '🍎', emojiB: '🍊' },
]

const Row = ({ n, d, emoji }: { n: number; d: number; emoji: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {Array.from({ length: n / d }, (_, g) => (
      <span key={g} style={{ border: '2px dashed #a78bfa', borderRadius: 12, padding: '2px 8px' }}>
        {emoji.repeat(d)}
      </span>
    ))}
  </div>
)

export default function RatioGroups({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [d, setD] = useState(1)
  const p = problems[i]
  const g = gcd(p.a, p.b)
  const divs = Array.from({ length: g }, (_, k) => k + 1).filter((k) => g % k === 0)
  const done = d === g
  const last = i === problems.length - 1

  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setD(1) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        {toArabicDigits(p.a)} {p.nameA} و{toArabicDigits(p.b)} {p.nameB} 👀
        <br />اختاري حجم المجموعة الواحدة، وشوفي كيف بتصغر النسبة:
      </div>
      <div style={{ display: 'grid', gap: 10, margin: '12px 0' }}>
        <Row n={p.a} d={d} emoji={p.emojiA} />
        <Row n={p.b} d={d} emoji={p.emojiB} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {divs.map((k) => (
          <button key={k} className="btn" onClick={() => setD(k)} style={{ opacity: k === d ? 1 : 0.6 }}>
            مجموعات من {toArabicDigits(k)}
          </button>
        ))}
      </div>
      <div className={'fb ' + (done ? 'ok' : 'tip')}>
        النسبة الحالية: <b>{toArabicDigits(p.a / d)} : {toArabicDigits(p.b / d)}</b>
        {'\n'}
        {done
          ? 'ما بقي نبسّط أكتر، هاد أبسط صورة! 🎉'
          : 'بعد في قاسم مشترك أكبر! جرّبي مجموعات أكبر 🔍'}
      </div>
      {done && <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>}
    </div>
  )
}