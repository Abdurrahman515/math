import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WidgetProps } from '../types'

type EquationOperator = '+' | '−' | '×' | '÷'
type EquationProblem = {
  op: EquationOperator
  constant: number
  target: number
  solution: number
  hint: string
}

const DEFAULT_PROBLEMS: EquationProblem[] = [
  { op: '+', constant: 14, target: 18, solution: 4, hint: 'نطرح 14 من الطرفين: 18 − 14 = 4.' },
  { op: '−', constant: 3, target: 7, solution: 10, hint: 'نضيف 3 إلى الطرفين: 7 + 3 = 10.' },
  { op: '×', constant: 3, target: 36, solution: 12, hint: 'نقسم 36 على 3: 36 ÷ 3 = 12.' },
  { op: '÷', constant: 3, target: 4, solution: 12, hint: 'نضرب 4 في 3: 4 × 3 = 12.' },
]

function isProblem(value: unknown): value is EquationProblem {
  if (!value || typeof value !== 'object') return false
  const p = value as Partial<EquationProblem>
  return (p.op === '+' || p.op === '−' || p.op === '×' || p.op === '÷')
    && typeof p.constant === 'number' && p.constant !== 0
    && typeof p.target === 'number'
    && typeof p.solution === 'number'
    && typeof p.hint === 'string'
}

function leftSide(x: number, p: EquationProblem) {
  if (p.op === '+') return x + p.constant
  if (p.op === '−') return x - p.constant
  if (p.op === '×') return x * p.constant
  return x / p.constant
}

function displayNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)))
}

export default function EquationTester({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProblem) ? raw : DEFAULT_PROBLEMS
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [completed, setCompleted] = useState(false)
  const p = problems[index]

  const check = () => {
    if (guess.trim() === '') return
    const n = Number(guess)
    if (!Number.isFinite(n)) return
    const actual = leftSide(n, p)
    if (Math.abs(actual - p.target) < 1e-9) {
      setSolved(true)
      setFeedback(`✅ الطرف الأيسر = ${displayNumber(actual)}، والطرف الآخر = ${p.target}. صار الطرفان متساويين؛ إذن ${n} هو الحل! ${p.hint}`)
    } else {
      setSolved(false)
      setFeedback(`الطرف الأيسر صار ${displayNumber(actual)}، بينما الطرف الآخر ${p.target}. ما زالا غير متساويين. جرّبي العملية العكسية لتجدي قيمة x.`)
    }
  }

  const next = () => {
    if (!solved) return
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    setIndex(index + 1)
    setGuess('')
    setFeedback(null)
    setSolved(false)
  }

  return (
    <div className="card center">
      <h3 className="h3">⚖️ مختبر المعادلات</h3>
      <div className="mut">مثال {index + 1} من {problems.length}: جرّبي قيمة لـ x واختبري هل تجعل الطرفين متساويين.</div>
      <div className="bar" style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ width: `${((index + (solved ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {!completed && (
          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="expr" dir="ltr">x {p.op} {p.constant} = {p.target}</div>
            <div className="mut">إذا كانت قيمة x صحيحة، يجب أن يعطي الحساب على اليسار العدد نفسه الموجود على اليمين.</div>
            <div className="numrow" style={{ justifyContent: 'center', marginTop: 14 }}>
              <input
                className="num"
                dir="ltr"
                inputMode="decimal"
                type="number"
                placeholder="جرّبي قيمة x"
                value={guess}
                disabled={solved}
                onChange={(event) => setGuess(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') check() }}
                aria-label="قيمة التخمين للمتغير x"
              />
              {!solved && <button className="btn" onClick={check}>اختبري ✔️</button>}
            </div>
            {feedback && <div className={`fb ${solved ? 'ok' : 'no'}`}>{feedback}</div>}
            {solved && <button className="btn" style={{ marginTop: 12 }} onClick={next}>{index + 1 === problems.length ? 'أنهي المختبر 🎉' : 'المعادلة التالية ▶️'}</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {completed && <div className="fb ok">🎉 ممتاز! اختبرتِ المعادلات الأربع وتعلمتِ كيف نستخدم العملية العكسية ثم نتحقق بالتعويض.</div>}
      <div className="mut" style={{ marginTop: 12 }}>تذكّري: الجمع عكسه الطرح، والضرب عكسه القسمة.</div>
    </div>
  )
}
