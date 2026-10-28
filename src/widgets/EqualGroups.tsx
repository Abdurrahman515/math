import { useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

type Prob = { n: number; total: number } // n س = total

const DEFAULT: Prob[] = [{ n: 3, total: 6 }, { n: 2, total: 8 }, { n: 4, total: 12 }]

const isProb = (v: unknown): v is Prob => {
  if (!v || typeof v !== 'object') return false
  const { n, total } = v as Partial<Prob>
  return Number.isInteger(n) && Number.isInteger(total)
    && (n as number) >= 2 && (n as number) <= 6
    && (total as number) >= (n as number) && (total as number) <= 24
    && (total as number) % (n as number) === 0
}

const sCard: CSSProperties = {
  background: '#2e9e5b', color: '#fff', borderRadius: 8, padding: '6px 16px',
  fontWeight: 700, display: 'inline-block',
}
const box: CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center',
  minWidth: 110, minHeight: 56, padding: 10, borderRadius: 14, border: '2px solid #d9d9e8',
}

const Chip = () => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    style={{
      width: 22, height: 22, borderRadius: '50%', background: '#f5c542',
      border: '2px solid #d9a400', display: 'inline-block',
    }}
  />
)

export default function EqualGroups({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProb) ? (raw as Prob[]) : DEFAULT

  const [index, setIndex] = useState(0)
  const [split, setSplit] = useState(false)
  const [completed, setCompleted] = useState(false)

  const { n, total } = problems[index]
  const each = total / n

  const next = () => {
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    setIndex(index + 1)
    setSplit(false)
  }

  return (
    <div className="card center">
      <h3 className="h3">🟩 توزيع القطع بالتساوي</h3>
      <div className="mut">
        المثال {toArabicDigits(index + 1)} من {toArabicDigits(problems.length)}: كل بطاقة (س) ترتبط بالعدد نفسه من القطع. وزّعي القطع بالتساوي لتعرفي قيمة س.
      </div>

      <div className="bar" style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ width: `${((index + (split ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      {!completed && (
        <>
          <div className="expr">{toArabicDigits(`${n} س = ${total}`)}</div>

          {!split ? (
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              <div style={{ ...box, flexDirection: 'column' }}>
                {Array.from({ length: n }, (_, i) => <span key={i} style={sCard}>س</span>)}
              </div>
              <span style={{ fontSize: 28 }}>=</span>
              <div style={box}>
                {Array.from({ length: total }, (_, i) => <Chip key={i} />)}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 12 }}>
              {Array.from({ length: n }, (_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={sCard}>س</span>
                  <span style={{ fontSize: 24 }}>=</span>
                  <div style={box}>
                    {Array.from({ length: each }, (_, j) => <Chip key={j} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!split && (
            <button className="btn" style={{ marginTop: 14 }} onClick={() => setSplit(true)}>
              {toArabicDigits(`وزّعي القطع بالتساوي على ${n} مجموعات ➗`)}
            </button>
          )}

          {split && (
            <>
              <div className="fb ok">
                {toArabicDigits(
                  `✅ كل مجموعة فيها ${each} قطع، يعني س = ${each}. هاد نفسه ${total} ÷ ${n} = ${each}. والتحقق: ${n} × ${each} = ${total}.`,
                )}
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
          🎉 ممتاز! بمعادلات الضرب كل مرة قسمنا على **المعامل** (العدد اللي قدّام س) فظهرت قيمة س.
        </div>
      )}
    </div>
  )
}