import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Plane } from '../components/Plane'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))

/** props: targets: [x, y][] (ضمن −٥…٥) */
export default function PlanePlot({ props, onDone }: WidgetProps) {
  const targets = (props?.targets as [number, number][] | undefined) ?? [[2, 3]]
  const [i, setI] = useState(0)
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [tx, ty] = targets[i]
  const last = i + 1 >= targets.length

  const hx = `الإحداثي الأول (السيني) = $${sg(tx)}$: تحرّكي ${ar(Math.abs(tx))} وحدات ${tx > 0 ? 'لليمين' : 'لليسار'}`
  const hy = `الإحداثي التاني (الصادي) = $${sg(ty)}$: تحرّكي ${ar(Math.abs(ty))} وحدات ${ty > 0 ? 'لفوق' : 'لتحت'}`

  const pick = (x: number, y: number) => {
    if (msg?.ok) return
    setPt({ x, y })
    if (x === tx && y === ty) {
      setMsg({ ok: true, t: 'برافو! 🎯' })
      if (last) onDone()
    } else if (x === ty && y === tx && tx !== ty) {
      setMsg({ ok: false, t: 'قلبتي الترتيب! 🔄 الأول لـ **س** (يمين/يسار) والتاني لـ **ص** (فوق/تحت).' })
    } else if (x === tx) {
      setMsg({ ok: false, t: `السيني صح ✅ بس الصادي لأ.\n${hy}` })
    } else if (y === ty) {
      setMsg({ ok: false, t: `الصادي صح ✅ بس السيني لأ.\n${hx}` })
    } else {
      setMsg({ ok: false, t: `ابدئي من نقطة الأصل:\n${hx}\n${hy}` })
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🎯 عيّني النقطة <Rich t={`$(${sg(tx)}، ${sg(ty)})$`} /> ({ar(i + 1)}/{ar(targets.length)})</h3>
      <Plane
        onPick={pick}
        points={pt ? [{ ...pt, color: msg?.ok ? '#16a34a' : '#dc2626' }] : []}
        walk={msg?.ok ? { x: tx, y: ty } : null}
      />
      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}><Rich t={msg.t} /></div>}
      {msg?.ok && !last && (
        <button className="btn" onClick={() => { setI(i + 1); setPt(null); setMsg(null) }}>التالي ▶️</button>
      )}
    </div>
  )
}