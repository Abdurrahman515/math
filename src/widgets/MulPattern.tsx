import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))
const KS = [3, 2, 1, 0, -1, -2, -3]
const parse = (s: string) => {
  const t = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('−', '-').trim()
  return t === '' ? NaN : Number(t)
}

/** props: base: عدد سالب (مثلاً -3) */
export default function MulPattern({ props, onDone }: WidgetProps) {
  const base = (props?.base as number | undefined) ?? -3
  const inc = Math.abs(base)
  const [shown, setShown] = useState(4)
  const [val, setVal] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const done = shown >= KS.length
  const k = KS[shown]
  const prev = base * KS[shown - 1]

  const check = () => {
    const n = parse(val)
    if (Number.isNaN(n)) return
    if (n === base * k) {
      const s = shown + 1
      setShown(s); setVal('')
      setMsg({ ok: true, t: 'صح! 🎯' })
      if (s >= KS.length) onDone()
    } else {
      setMsg({ ok: false, t: `اتبعي النمط 🧩 كل صف الناتج بيزيد **${ar(inc)}** عن اللي قبله.\nالصف السابق = $${sg(prev)}$ ← $${sg(prev)} + ${inc} = ؟$` })
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🧩 اكتشفي بالنمط</h3>
      <div className="mut">كل ما نقصنا العدد التاني ١، ماذا يحدث للناتج؟</div>

      <div className="patt">
        {KS.slice(0, shown).map((kk, i) => (
          <div key={kk}>
            {i > 0 && <div className="patt-inc">+{ar(inc)} ⬇️</div>}
            <div className="patt-row"><Rich t={`$${sg(base)} × ${term(kk)} = ${sg(base * kk)}$`} /></div>
          </div>
        ))}
        {!done && (
          <div>
            <div className="patt-inc">+{ar(inc)} ⬇️</div>
            <div className="patt-row"><Rich t={`$${sg(base)} × ${term(k)} =$`} />{' '}
              <input
                className="num" dir="ltr" inputMode="numeric" placeholder="؟" style={{ width: 90, minWidth: 0 }}
                value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()}
              />
            </div>
          </div>
        )}
      </div>

      {!done && <button className="btn" onClick={check}>تحقّقي ✔️</button>}
      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}><Rich t={msg.t} /></div>}
      {done && <div className="fb tip">🎉 شفتي؟ لما ضربنا **سالب × سالب** طلع **موجب**، لأنو النمط بيكمّل!</div>}
    </div>
  )
}