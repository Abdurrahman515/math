import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

type Prob = { a: number; b: number } // س + a = b

const DEFAULT: Prob[] = [{ a: 2, b: 5 }, { a: 3, b: 7 }, { a: 4, b: 4 }]

const isProb = (v: unknown): v is Prob => {
  if (!v || typeof v !== 'object') return false
  const p = v as Partial<Prob>
  return Number.isInteger(p.a) && Number.isInteger(p.b)
    && (p.a as number) >= 1 && (p.b as number) >= (p.a as number) && (p.b as number) <= 12
}

const side: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center',
  minWidth: 120, minHeight: 96, padding: 10, borderRadius: 14, border: '2px solid #d9d9e8',
}

const Chip = ({ id }: { id: string }) => (
  <motion.span
    key={id}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    style={{
      width: 24, height: 24, borderRadius: '50%', background: '#f5c542',
      border: '2px solid #d9a400', display: 'inline-block',
    }}
  />
)

export default function TileBalance({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProb) ? (raw as Prob[]) : DEFAULT

  const [index, setIndex] = useState(0)
  const [r, setR] = useState(0) // عدد القطع المحذوفة من كل طرف
  const [completed, setCompleted] = useState(false)

  const { a, b } = problems[index]
  const finished = r === a
  const left = r === a ? 'س' : `س + ${a - r}`
  const right = b - r

  const next = () => {
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    setIndex(index + 1)
    setR(0)
  }

  return (
    <div className="card center">
      <h3 className="h3">🥤 الكوب وقطع العد</h3>
      <div className="mut">
        المثال {toArabicDigits(index + 1)} من {toArabicDigits(problems.length)}: الكوب يمثّل س. احذفي العدد نفسه من قطع العد من الطرفين حتى يبقى الكوب وحده.
      </div>

      <div className="bar" style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ width: `${((index + (finished ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      {!completed && (
        <>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
            <div style={side}>
              <span style={{ fontSize: 34 }}>🥤</span>
              {Array.from({ length: a - r }, (_, i) => <Chip key={`l${index}-${i}`} id={`l${index}-${i}`} />)}
            </div>
            <span style={{ fontSize: 28 }}>=</span>
            <div style={side}>
              {right === 0
                ? <span className="mut">فارغ</span>
                : Array.from({ length: right }, (_, i) => <Chip key={`r${index}-${i}`} id={`r${index}-${i}`} />)}
            </div>
          </div>

          <div className="expr" style={{ marginTop: 14 }}>
            {toArabicDigits(`${left} = ${right}`)}
          </div>

          {!finished && (
            <button className="btn" style={{ marginTop: 12 }} onClick={() => setR(r + 1)}>
              احذفي قطعة من كل طرف ➖
            </button>
          )}

          {finished && (
            <>
              <div className="fb ok">
                {toArabicDigits(
                  `✅ بقي الكوب وحده، وعدد القطع في الطرف الثاني ${b - a}؛ إذن س = ${b - a}. والتحقق: ${b - a} + ${a} = ${b}.`,
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
          🎉 ممتاز! كل مرة حذفنا العدد نفسه من الطرفين، فبقي الميزان متوازناً وظهرت قيمة س.
        </div>
      )}
    </div>
  )
}