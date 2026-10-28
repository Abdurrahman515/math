import { useState } from 'react'
import type { WidgetProps } from '../types'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

type Prob = { a: number; b: number; c: number } // a س + b = c
type Opt = { text: string; ok: boolean; why: string }

const DEFAULT: Prob[] = [
  { a: 3, b: 2, c: 23 },
  { a: -2, b: -7, c: 3 },
  { a: 2, b: -1, c: -3 },
]

const isProb = (v: unknown): v is Prob => {
  if (!v || typeof v !== 'object') return false
  const { a, b, c } = v as Partial<Prob>
  return Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c)
    && a !== 0 && b !== 0 && Math.abs(a as number) <= 12
    && ((c as number) - (b as number)) % (a as number) === 0
}

const coef = (a: number) => (a === 1 ? '' : a === -1 ? '−' : fmtInt(a))
const eqText = (a: number, b: number, c: number) =>
  `${coef(a)}س ${b > 0 ? '+' : '−'} ${fmtInt(Math.abs(b))} = ${fmtInt(c)}`

const firstOpts = (a: number, b: number): Opt[] => [
  {
    text: b > 0 ? `نطرح ${fmtInt(b)} من الطرفين` : `نضيف ${fmtInt(-b)} للطرفين`,
    ok: true,
    why: `صح! بنتخلّص من ${b > 0 ? 'الجمع' : 'الطرح'} أول.`,
  },
  {
    text: `نقسم الطرفين على ${fmtInt(a)}`,
    ok: false,
    why: 'ممكن رياضياً، بس لازم نقسم **كل** الحدود وبتطلع كسور. الأسهل: نتخلّص من الجمع أو الطرح أول، وبعدين من الضرب.',
  },
  {
    text: b > 0 ? `نضيف ${fmtInt(b)} للطرفين` : `نطرح ${fmtInt(-b)} من الطرفين`,
    ok: false,
    why: `هيك بتكبّر الحد الثابت بدل ما تتخلّصي منه. عكس ${b > 0 ? 'الجمع' : 'الطرح'} هو ${b > 0 ? 'الطرح' : 'الجمع'}.`,
  },
  {
    text: `نضرب الطرفين في ${fmtInt(a)}`,
    ok: false,
    why: 'الضرب بيكبّر المعامل بدل ما يخلّيه يختفي. عكس الضرب هو **القسمة**.',
  },
]

const secondOpts = (a: number): Opt[] => [
  { text: `نقسم الطرفين على ${fmtInt(a)}`, ok: true, why: 'صح! القسمة بتفك الضرب وبتفرد س.' },
  { text: `نضرب الطرفين في ${fmtInt(a)}`, ok: false, why: 'الضرب بيزيد المعامل أكتر. عكس الضرب هو **القسمة**.' },
  { text: `نطرح ${fmtInt(a)} من الطرفين`, ok: false, why: 'المعامل بيضرب س مو بيجمع معها، فعكسه **قسمة** مو طرح.' },
]

export default function TwoStepSolver({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProb) ? (raw as Prob[]) : DEFAULT

  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState(0) // 0: الخطوة الأولى، 1: الثانية، 2: انتهى
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [completed, setCompleted] = useState(false)

  const { a, b, c } = problems[index]
  const x = (c - b) / a
  const rawOpts = stage === 0 ? firstOpts(a, b) : stage === 1 ? secondOpts(a) : []
  const rot = rawOpts.length ? (index + stage) % rawOpts.length : 0
  const opts = rawOpts.slice(rot).concat(rawOpts.slice(0, rot))

  const choose = (o: Opt) => {
    if (o.ok) {
      setStage(stage + 1)
      setFeedback({ ok: true, text: `✅ ${o.why}` })
    } else {
      setFeedback({ ok: false, text: o.why })
    }
  }

  const next = () => {
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    setIndex(index + 1)
    setStage(0)
    setFeedback(null)
  }

  const current =
    stage === 0 ? eqText(a, b, c)
      : stage === 1 ? `${coef(a)}س = ${fmtInt(c - b)}`
        : `س = ${fmtInt(x)}`

  return (
    <div className="card center">
      <h3 className="h3">🪜 حلّ على خطوتين</h3>
      <div className="mut">
        المثال {toArabicDigits(index + 1)} من {toArabicDigits(problems.length)}: اختاري الخطوة المناسبة كل مرة.
      </div>

      <div className="bar" style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ width: `${((index + (stage === 2 ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      {!completed && (
        <>
          <div className="expr">{current}</div>

          {stage < 2 && (
            <>
              <div className="mut" style={{ marginTop: 10 }}>
                {stage === 0 ? 'ما الخطوة الأولى؟' : 'والخطوة الثانية؟'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, alignItems: 'center' }}>
                {opts.map((o) => (
                  <button key={o.text} className="btn" onClick={() => choose(o)}>{o.text}</button>
                ))}
              </div>
            </>
          )}

          {feedback && <div className={`fb ${feedback.ok ? 'ok' : 'no'}`}>{feedback.text}</div>}

          {stage === 2 && (
            <>
              <div className="fb ok">
                {toArabicDigits(
                  `✅ س = ${fmtInt(x)}. التحقق: ${fmtInt(a)} × (${fmtInt(x)}) ${b > 0 ? '+' : '−'} ${fmtInt(Math.abs(b))} = ${fmtInt(c)} ✔️`,
                )}
              </div>
              <button className="btn" style={{ marginTop: 12 }} onClick={next}>
                {index + 1 === problems.length ? 'أنهي النشاط 🎉' : 'المعادلة التالية ▶️'}
              </button>
            </>
          )}
        </>
      )}

      {completed && (
        <div className="fb ok">
          🎉 ممتاز! أول شي نتخلّص من الجمع أو الطرح، وبعدين من الضرب بالقسمة.
        </div>
      )}
    </div>
  )
}