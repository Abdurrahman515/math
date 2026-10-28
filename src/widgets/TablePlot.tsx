import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Plane } from '../components/Plane'
import type { PPoint } from '../components/Plane'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

type Pair = [number, number]

const DEFAULT: Pair[] = [[1, 2], [2, 4], [3, 6]]

const isPair = (v: unknown, lim: number): v is Pair =>
  Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && Math.abs(n) <= lim)

export default function TablePlot({ props, onDone }: WidgetProps) {
  const lim = typeof props?.lim === 'number' && props.lim >= 3 && props.lim <= 8 ? props.lim : 6
  const raw = props?.pairs
  const pairs = Array.isArray(raw) && raw.length > 0 && raw.length <= 6 && raw.every((p) => isPair(p, lim))
    ? (raw as Pair[]) : DEFAULT
  const title = typeof props?.title === 'string' ? props.title : '📍 علّمي النقاط'
  const rule = typeof props?.rule === 'string' ? props.rule : ''

  const [i, setI] = useState(0)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const done = i >= pairs.length

  const pts: PPoint[] = pairs.slice(0, i).map(([x, y]) => ({
    x, y, color: '#2e9e5b', label: `(${fmtInt(x)} ، ${fmtInt(y)})`,
  }))

  const pick = (x: number, y: number) => {
    if (done) return
    const [ex, ey] = pairs[i]
    if (x === ex && y === ey) {
      const n = i + 1
      setI(n)
      if (n >= pairs.length) {
        setFeedback({ ok: true, text: '🎉 ممتاز! لاحظي: كل النقاط بتقع على **استقامة واحدة**.' })
        onDone()
      } else {
        setFeedback({ ok: true, text: '✅ صح! بالنقطة التالية.' })
      }
    } else if (x === ey && y === ex) {
      setFeedback({ ok: false, text: 'عكستي ترتيب الإحداثيين! الأول **س** (يمين/يسار) والتاني **ص** (فوق/تحت).' })
    } else if (x === ex) {
      setFeedback({ ok: false, text: 'الإحداثي الأول (س) صح، بس ارتفاع النقطة (ص) مو صح. اطلعي أو انزلي للقيمة الصحيحة.' })
    } else if (y === ey) {
      setFeedback({ ok: false, text: 'الارتفاع (ص) صح، بس موضعك الأفقي (س) مو صح. تحرّكي يمين أو يسار.' })
    } else if (x === -ex || y === -ey) {
      setFeedback({ ok: false, text: 'انتبهي للإشارة! الأعداد السالبة بتكون يسار المحور ص أو تحت المحور س.' })
    } else {
      setFeedback({ ok: false, text: 'مو مكانها. ابدأي من نقطة الأصل: امشي أفقياً بمقدار س، وبعدين عمودياً بمقدار ص.' })
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">{title}</h3>
      {rule && <div className="expr">{rule}</div>}

      <table style={{ margin: '10px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 18px', borderBottom: '2px solid #d9d9e8' }}>س</th>
            <th style={{ padding: '4px 18px', borderBottom: '2px solid #d9d9e8' }}>ص</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map(([x, y], k) => (
            <tr key={k} style={{ background: k === i && !done ? '#fff6d6' : 'transparent', opacity: k > i ? 0.6 : 1 }}>
              <td style={{ padding: '4px 18px', textAlign: 'center' }}>{fmtInt(x)}</td>
              <td style={{ padding: '4px 18px', textAlign: 'center' }}>{fmtInt(y)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!done && (
        <div className="mut">
          {toArabicDigits(`علّمي النقطة (${fmtInt(pairs[i][0])} ، ${fmtInt(pairs[i][1])}) بالضغط على المستوى.`)}
        </div>
      )}

      <div style={{ maxWidth: 460, margin: '10px auto' }}>
        <Plane lim={lim} points={pts} onPick={pick} />
      </div>

      {feedback && <div className={`fb ${feedback.ok ? 'ok' : 'no'}`}>{feedback.text}</div>}
    </div>
  )
}