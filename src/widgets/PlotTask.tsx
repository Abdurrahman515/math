import { useState } from 'react'
import type { WidgetProps } from '../types'
import { NumLine } from '../components/NumLine'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))

/** props: targets: number[]  (أعداد صحيحة غير صفرية) */
export default function PlotTask({ props, onDone }: WidgetProps) {
  const targets = (props?.targets as number[] | undefined) ?? [3]
  const [i, setI] = useState(0)
  const [placed, setPlaced] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const target = targets[i]

  const pick = (v: number) => {
    if (msg?.ok) return
    setPlaced(v)
    if (v === target) {
      setMsg({ ok: true, t: 'برافو! 🎯' })
      if (i + 1 >= targets.length) onDone()
    } else if (v === 0) {
      setMsg({ ok: false, t: 'هاد الصفر! لازم تبعدي عنه ' + ar(Math.abs(target)) + ' وحدات.' })
    } else if (v === -target) {
      setMsg({ ok: false, t: 'المسافة صح بس الاتجاه معكوس 🔄 الموجبة على يمين الصفر والسالبة على يساره.' })
    } else if (Math.sign(v) !== Math.sign(target)) {
      setMsg({ ok: false, t: `اتجاهك غلط: الأعداد ${target > 0 ? 'الموجبة' : 'السالبة'} على ${target > 0 ? 'يمين' : 'يسار'} الصفر.` })
    } else {
      setMsg({ ok: false, t: `الاتجاه صح بس العدد غلط 🤏 عدّي ${ar(Math.abs(target))} وحدات من الصفر. إنتِ وقفتي على ${fmtInt(v)}.` })
    }
  }

  const next = () => { setI(i + 1); setPlaced(null); setMsg(null) }
  const last = i + 1 >= targets.length

  return (
    <div className="card center">
      <h3 className="h3">🎯 ضعي النقطة على: <span dir="ltr">{fmtInt(target)}</span> ({ar(i + 1)}/{ar(targets.length)})</h3>
      <NumLine
        min={-10} max={10} onPick={pick}
        points={placed === null ? [] : [{ v: placed, color: msg?.ok ? '#16a34a' : '#dc2626' }]}
      />
      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}>{msg.t}</div>}
      {msg?.ok && !last && <button className="btn" onClick={next}>التالي ▶️</button>}
      {msg?.ok && last && <div className="fb tip">🎉 خلصتي كل النقاط!</div>}
    </div>
  )
}