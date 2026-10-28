import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { dec } from '../lib/dec'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { n: number; from: 'big' | 'small'; big: string; small: string; f: number }
const DEF: P[] = [{ n: 20, from: 'big', big: 'قدم', small: 'بوصة', f: 12 }]


const Btn = ({ k, f, choose, done, correct }: { k: 'A' | 'B'; f: { n: string; d: string }, choose: (k: 'A' | 'B') => void, done: boolean, correct: "A" | "B" }) => (
    <button
        className="btn"
        onClick={() => choose(k)}
        style={{ opacity: done && k !== correct ? 0.4 : 1, padding: '10px 16px' }}
    >
        <Frac n={f.n} d={f.d} />
    </button>
)


export default function ConvertSteps({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [done, setDone] = useState(false)
  const [bad, setBad] = useState(false)
  const p = problems[i]
  const last = i === problems.length - 1

  const given = p.from === 'big' ? p.big : p.small
  const target = p.from === 'big' ? p.small : p.big
  const result = p.from === 'big' ? p.n * p.f : p.n / p.f
  const A = { n: `${p.f} ${p.small}`, d: `1 ${p.big}` }
  const B = { n: `1 ${p.big}`, d: `${p.f} ${p.small}` }
  const correct = p.from === 'big' ? 'A' : 'B'

  const choose = (k: 'A' | 'B') => {
    if (done) return
    if (k === correct) { setDone(true); setBad(false) } else setBad(true)
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setDone(false); setBad(false) }
  }



  return (
    <div className="card">
      <div className="q-prompt">
        حوّلي {toArabicDigits(p.n)} {given} إلى {target} 🔄
        <br />أي عامل ضرب بيخلّي وحدة {given} <b>تختفي</b>؟ (لازم تكون بالمقام)
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: '12px 0' }}>
        <span>{toArabicDigits(p.n)} {given} ×</span>
        <Btn k="A" f={A} choose={choose} done={done} correct={correct} />
        <span>أو</span>
        <Btn k="B" f={B} choose={choose} done={done} correct={correct} />
      </div>
      {bad && !done && (
        <div className="fb no">
          قريبة! 💪 بهالعامل وحدة {given} بتضل فوق وما بتختفي. جرّبي العامل التاني 🔍
        </div>
      )}
      {done && (
        <>
          <div className="fb ok">
            برافو عليكِ! 🎉 وحدة {given} اختفت وبقيت {target}:{'\n'}
            {p.from === 'big'
              ? `${toArabicDigits(p.n)} × ${toArabicDigits(p.f)}`
              : `${toArabicDigits(p.n)} ÷ ${toArabicDigits(p.f)}`}
            {' = '}<b>{toArabicDigits(dec(result))} {target}</b>
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}