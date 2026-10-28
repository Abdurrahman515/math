import { useMemo, useState } from 'react'
import type { WidgetProps } from '../types'
import { Plane } from '../components/Plane'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { shuffle } from '../lib/rng'

type T = { x: number; y: number; label: string }

/** props: tasks: {x, y, label}[]  — تقرئين الزوج المرتب لنقطة مرسومة */
export default function PlaneRead({ props, onDone }: WidgetProps) {
  const tasks = (props?.tasks as T[] | undefined) ?? [{ x: 2, y: 3, label: 'د' }]
  const [i, setI] = useState(0)
  const [bad, setBad] = useState<number[]>([])
  const [ok, setOk] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const { x, y, label } = tasks[i]
  const last = i + 1 >= tasks.length

  const opts = useMemo(() => {
    const raw = [
      { p: [x, y], good: true, why: '' },
      { p: [y, x], good: false, why: 'قلبتي الترتيب! 🔄 الأول لـ **س** (يمين/يسار) والتاني لـ **ص** (فوق/تحت).' },
      { p: [-x, y], good: false, why: `الإشارة غلط بالرقم الأول: النقطة على ${x > 0 ? 'يمين' : 'يسار'} محور الصادات.` },
      { p: [x, -y], good: false, why: `الإشارة غلط بالرقم التاني: النقطة ${y > 0 ? 'فوق' : 'تحت'} محور السينات.` },
    ]
    const seen = new Set<string>()
    return shuffle(raw.filter((o) => (seen.has(o.p.join()) ? false : (seen.add(o.p.join()), true))))
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (k: number) => {
    if (ok || bad.includes(k)) return
    if (opts[k].good) {
      setOk(true)
      setMsg('صح! 🎉 مشينا من الأصل: أول شي أفقي (س) وبعدين عمودي (ص).')
      if (last) onDone()
    } else {
      setBad((b) => [...b, k])
      setMsg(opts[k].why)
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🔎 شو الزوج المرتب للنقطة «{label}»؟</h3>
      <Plane quadrants points={[{ x, y, label, color: '#dc2626' }]} walk={ok ? { x, y } : null} />
      <div className="opts">
        {opts.map((o, k) => (
          <button
            key={k}
            className={'opt' + (bad.includes(k) ? ' bad' : '') + (ok && o.good ? ' good' : '')}
            disabled={ok && !o.good}
            onClick={() => choose(k)}
          >
            <Rich t={`$(${sg(o.p[0])}، ${sg(o.p[1])})$`} />
          </button>
        ))}
      </div>
      {msg && <div className={'fb ' + (ok ? 'ok' : 'no')}><Rich t={msg} /></div>}
      {ok && !last && (
        <button className="btn" onClick={() => { setI(i + 1); setBad([]); setOk(false); setMsg(null) }}>التالي ▶️</button>
      )}
    </div>
  )
}