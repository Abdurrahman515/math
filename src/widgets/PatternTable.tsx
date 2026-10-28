import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))
const parse = (s: string) => {
  const t = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('−', '-').trim()
  return t === '' ? NaN : Number(t)
}

type P = { xLabel: string; yLabel: string; xs: number[]; ys: number[]; given?: number }

/** props: { xLabel, yLabel, xs, ys, given } ← الصف العلوي كامل، والسفلي تكمّله الطالبة */
export default function PatternTable({ props, onDone }: WidgetProps) {
  const p = props as unknown as P
  const given = p.given ?? 2
  const dx = p.xs[1] - p.xs[0], dy = p.ys[1] - p.ys[0]
  const [k, setK] = useState(given)
  const [val, setVal] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const done = k >= p.ys.length

  const check = () => {
    const n = parse(val)
    if (Number.isNaN(n)) return
    if (n === p.ys[k]) {
      setK(k + 1); setVal('')
      setMsg({ ok: true, t: 'صح! 🎯' })
      if (k + 1 >= p.ys.length) onDone()
    } else {
      setMsg({ ok: false, t: `لاحظي النمط 🧩 كل عمود بيزيد **${ar(dy)}** عن اللي قبله (شوفي الأرقام البرتقالية).\n$${p.ys[k - 1]} + ${dy} = ؟$` })
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🧩 كمّلي الجدول</h3>
      <div className="ptab">
        <div className="ptab-row">
          <span className="ptab-h">{p.xLabel}</span>
          {p.xs.map((x) => <span key={x} className="ptab-c on">{ar(x)}</span>)}
        </div>
        <div className="ptab-row">
          <span className="ptab-h">{p.yLabel}</span>
          {p.ys.map((y, i) =>
            i < k ? <span key={i} className="ptab-c on">{ar(y)}</span>
            : i === k ? (
              <span key={i} className="ptab-c in">
                <input
                  dir="ltr" inputMode="numeric" value={val} placeholder="؟"
                  onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()}
                />
              </span>
            ) : <span key={i} className="ptab-c">؟</span>,
          )}
        </div>
        <div className="ptab-row">
          <span className="ptab-h">الفرق</span>
          {p.xs.map((_, i) => (
            <span key={i} className="ptab-inc">{i > 0 ? `+${ar(dx)} / +${ar(dy)}` : ''}</span>
          ))}
        </div>
      </div>
      {!done && <button className="btn" onClick={check}>تحقّقي ✔️</button>}
      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}><Rich t={msg.t} /></div>}
      {done && <div className="fb tip"><Rich t={`🎉 وصلنا للجواب: **${ar(p.ys[p.ys.length - 1])}** مقابل ${ar(p.xs[p.xs.length - 1])}`} /></div>}
    </div>
  )
}