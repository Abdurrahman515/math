import { useState } from 'react'
import type { WidgetProps } from '../types'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

type Op = '+' | '−' | '×' | '÷'
type Step = { op: Op; n: number }
type Prob = { steps: Step[]; result: number }

const INV: Record<Op, Op> = { '+': '−', '−': '+', '×': '÷', '÷': '×' }
const fwd = (op: Op, n: number, x: number) =>
  op === '+' ? x + n : op === '−' ? x - n : op === '×' ? x * n : x / n
const back = (op: Op, n: number, y: number) => fwd(INV[op], n, y)
const lab = (s: Step) => `${s.op} ${s.n < 0 ? `(${fmtInt(s.n)})` : fmtInt(s.n)}`
const isOp = (o: unknown): o is Op => o === '+' || o === '−' || o === '×' || o === '÷'

const isProb = (v: unknown): v is Prob => {
  if (!v || typeof v !== 'object') return false
  const p = v as Partial<Prob>
  if (!Array.isArray(p.steps) || p.steps.length < 2 || p.steps.length > 4) return false
  if (!Number.isInteger(p.result)) return false
  let cur = p.result as number
  for (let i = p.steps.length - 1; i >= 0; i--) {
    const s = p.steps[i] as Partial<Step>
    if (!isOp(s.op) || !Number.isInteger(s.n) || s.n === 0) return false
    cur = back(s.op, s.n as number, cur)
    if (!Number.isInteger(cur)) return false
  }
  return true
}

const DEFAULT: Prob[] = [
  { steps: [{ op: '×', n: 3 }, { op: '−', n: 6 }], result: 9 },
  { steps: [{ op: '+', n: 4 }, { op: '×', n: 2 }], result: 18 },
  { steps: [{ op: '×', n: -3 }, { op: '−', n: 6 }, { op: '+', n: -7 }], result: -25 },
]

export default function ReverseChain({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProb) ? (raw as Prob[]) : DEFAULT

  const [index, setIndex] = useState(0)
  const [k, setK] = useState(problems[0].steps.length - 1)
  const [cur, setCur] = useState(problems[0].result)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const p = problems[index]
  const finished = k < 0
  const step = finished ? null : p.steps[k]

  const check = () => {
    if (!step || guess.trim() === '') return
    const n = Number(guess)
    if (!Number.isFinite(n)) return
    const expected = back(step.op, step.n, cur)
    if (Math.abs(n - expected) < 1e-9) {
      setCur(n)
      setK(k - 1)
      setGuess('')
      setFeedback(null)
    } else {
      setFeedback(
        toArabicDigits(
          `ما صار! الخطوة (${lab(step)}) عكسها (${INV[step.op]} ${step.n < 0 ? `(${fmtInt(step.n)})` : fmtInt(step.n)}). جرّبي تطبّقيها على ${fmtInt(cur)}.`,
        ),
      )
    }
  }

  const next = () => {
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    const q = problems[index + 1]
    setIndex(index + 1)
    setK(q.steps.length - 1)
    setCur(q.result)
    setGuess('')
    setFeedback(null)
  }

  const verify = toArabicDigits(
    `نبدأ من ${fmtInt(cur)} ونطبّق الخطوات: ${p.steps.map(lab).join(' ثم ')} فنصل إلى ${fmtInt(p.result)} ✔️`,
  )

  return (
    <div className="card center">
      <h3 className="h3">⏪ ارجعي للخلف</h3>
      <div className="mut">
        المثال {toArabicDigits(index + 1)} من {toArabicDigits(problems.length)}: بدأنا بعدد مجهول، طبّقنا عليه الخطوات، ووصلنا للنتيجة. ارجعي خطوة خطوة بالعكس لتلاقي العدد الأول.
      </div>

      <div className="bar" style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ width: `${((index + (finished ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      {!completed && (
        <>
          <div className="expr" style={{ fontSize: 22 }}>
            {toArabicDigits(
              ['؟', ...p.steps.map(lab), `النتيجة ${fmtInt(p.result)}`].join('  ←  '),
            )}
          </div>

          {!finished && step && (
            <>
              <div className="mut" style={{ marginTop: 12 }}>
                الناتج الحالي: <b>{fmtInt(cur)}</b>. ما الناتج **قبل** الخطوة ({toArabicDigits(lab(step))})؟
              </div>

              <div className="numrow" style={{ justifyContent: 'center', marginTop: 14 }}>
                <input
                  className="num"
                  inputMode="decimal"
                  type="number"
                  placeholder="اكتبي الناتج"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') check() }}
                  aria-label="الناتج قبل الخطوة"
                />
                <button className="btn" onClick={check}>تحقّقي ✔️</button>
              </div>

              {feedback && <div className="fb no">{feedback}</div>}
            </>
          )}

          {finished && (
            <>
              <div className="fb ok">
                {toArabicDigits(`✅ العدد الأول هو ${fmtInt(cur)}. ${verify}`)}
              </div>
              <button className="btn" style={{ marginTop: 12 }} onClick={next}>
                {index + 1 === problems.length ? 'أنهي النشاط 🎉' : 'المثال التالي ▶️'}
              </button>
            </>
          )}
        </>
      )}

      {completed && (
        <div className="fb ok">
          🎉 ممتاز! بالحل عكسياً منبدأ من النتيجة ونعمل **العملية العكسية** لكل خطوة، من الآخر للأول.
        </div>
      )}

      <div className="mut" style={{ marginTop: 12 }}>
        تذكّري: الجمع عكسه الطرح، والضرب عكسه القسمة.
      </div>
    </div>
  )
}