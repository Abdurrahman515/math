import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Plane } from '../components/Plane'
import type { PPoint } from '../components/Plane'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

type Prob = { m: number; b: number } // ص = m س + b

const LIM = 6
const DEFAULT: Prob[] = [{ m: 2, b: 1 }, { m: 1, b: -3 }, { m: -3, b: 0 }]

const isProb = (v: unknown): v is Prob => {
  if (!v || typeof v !== 'object') return false
  const { m, b } = v as Partial<Prob>
  return Number.isInteger(m) && Number.isInteger(b) && m !== 0
    && Math.abs(m as number) <= 4 && Math.abs(b as number) <= 5
}

const eqText = (m: number, b: number) =>
  `ص = ${m === 1 ? '' : m === -1 ? '−' : fmtInt(m)}س${b > 0 ? ` + ${fmtInt(b)}` : b < 0 ? ` − ${fmtInt(-b)}` : ''}`

export default function GraphLine({ props, onDone }: WidgetProps) {
  const raw = props?.problems
  const problems = Array.isArray(raw) && raw.length > 0 && raw.every(isProb) ? (raw as Prob[]) : DEFAULT

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [linked, setLinked] = useState(false)
  const [completed, setCompleted] = useState(false)

  const { m, b } = problems[index]
  const f = (x: number) => m * x + b
  const xs = Array.from({ length: 2 * LIM + 1 }, (_, i) => i - LIM).filter((x) => Math.abs(f(x)) <= LIM)
  const btnXs = xs.filter((x) => Math.abs(x) <= 3)
  const lbl = (x: number) => `(${fmtInt(x)} ، ${fmtInt(f(x))})`

  const pts: PPoint[] = linked
    ? xs.map((x) => (picked.includes(x)
      ? { x, y: f(x), color: '#5b5bd6', label: lbl(x) }
      : { x, y: f(x), color: '#b9b9e6' }))
    : picked.map((x) => ({ x, y: f(x), color: '#5b5bd6', label: lbl(x) }))

  const next = () => {
    if (index + 1 >= problems.length) {
      setCompleted(true)
      onDone()
      return
    }
    setIndex(index + 1)
    setPicked([])
    setLinked(false)
  }

  return (
    <div className="card center">
      <h3 className="h3">📈 ارسمي المعادلة</h3>
      <div className="mut">
        المثال {toArabicDigits(index + 1)} من {toArabicDigits(problems.length)}: اختاري قيماً لـ س، وشوفي كيف بتطلع النقاط.
      </div>

      <div className="bar" style={{ marginTop: 12, marginBottom: 14 }}>
        <div style={{ width: `${((index + (linked ? 1 : 0)) / problems.length) * 100}%` }} />
      </div>

      {!completed && (
        <>
          <div className="expr">{eqText(m, b)}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '10px 0' }}>
            {btnXs.map((x) => (
              <button
                key={x} className="btn" disabled={picked.includes(x) || linked}
                onClick={() => setPicked([...picked, x])}
              >
                {toArabicDigits(`س = ${fmtInt(x)}`)}
              </button>
            ))}
          </div>

          {picked.length > 0 && (
            <table style={{ margin: '8px auto', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['س', 'ص', '(س ، ص)'].map((h) => (
                    <th key={h} style={{ padding: '4px 14px', borderBottom: '2px solid #d9d9e8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {picked.map((x) => (
                  <tr key={x}>
                    <td style={{ padding: '4px 14px', textAlign: 'center' }}>{fmtInt(x)}</td>
                    <td style={{ padding: '4px 14px', textAlign: 'center' }}>{fmtInt(f(x))}</td>
                    <td style={{ padding: '4px 14px', textAlign: 'center' }}>{lbl(x)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ maxWidth: 460, margin: '10px auto' }}>
            <Plane lim={LIM} points={pts} />
          </div>

          {!linked && picked.length >= 4 && (
            <button className="btn" onClick={() => setLinked(true)}>اربطي النقاط 🔗</button>
          )}
          {!linked && picked.length < 4 && (
            <div className="mut">
              {toArabicDigits(`اختاري ${4 - picked.length} قيم أخرى على الأقل.`)}
            </div>
          )}

          {linked && (
            <>
              <div className="fb ok">
                ✅ كل النقاط على **خط مستقيم**! وأي نقطة على هالخط هي حل للمعادلة. لهيك بنسميها **معادلة خطية**.
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
          🎉 ممتاز! بتختاري قيم لـ س، وبتحسبي ص، وبترسمي الأزواج المرتبة، وبتربطيها بخط مستقيم.
        </div>
      )}
    </div>
  )
}