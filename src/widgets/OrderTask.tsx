import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { NumLine } from '../components/NumLine'
import { Rich } from '../components/Rich'
import { fmtInt } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))

/** props: sets: number[][] (أعداد ضمن −١٠…١٠) ، dir: 'asc' | 'desc' */
export default function OrderTask({ props, onDone }: WidgetProps) {
  const sets = (props?.sets as number[][] | undefined) ?? [[3, -2, 0]]
  const dir = (props?.dir as 'asc' | 'desc' | undefined) ?? 'asc'
  const [t, setT] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [shake, setShake] = useState(0)

  const nums = sets[t]
  const sorted = useMemo(() => [...nums].sort((a, b) => (dir === 'asc' ? a - b : b - a)), [nums, dir])
  const rest = nums.filter((x) => !placed.includes(x))
  const finished = placed.length === nums.length
  const last = t + 1 >= sets.length

  const tap = (v: number) => {
    if (finished) return
    const expected = sorted[placed.length]
    if (v === expected) {
      const p = [...placed, v]
      setPlaced(p)
      if (p.length === nums.length) {
        setMsg({ ok: true, t: 'ترتيب مظبوط! 🎉' })
        if (last) onDone()
      } else setMsg({ ok: true, t: 'صح ✔️ كمّلي' })
    } else {
      setShake((s) => s + 1)
      setMsg({
        ok: false,
        t: v < 0 && expected < 0
          ? 'انتبهي! بين الأعداد **السالبة**، الأبعد عن الصفر هو الأصغر (مثلاً $−8$ أقل من $−3$) 👀'
          : dir === 'asc'
            ? 'لسا في عدد أصغر منه! الأصغر هو الأبعد جهة **اليسار** على الخط 👈'
            : 'لسا في عدد أكبر منه! الأكبر هو الأبعد جهة **اليمين** على الخط 👉',
      })
    }
  }

  const points = nums.map((x) => {
    const k = placed.indexOf(x)
    return { v: x, color: k >= 0 ? '#16a34a' : '#94a3b8', label: k >= 0 ? ar(k + 1) : undefined }
  })

  return (
    <div className="card center">
      <h3 className="h3">
        🔢 رتّبي من {dir === 'asc' ? 'الأصغر إلى الأكبر' : 'الأكبر إلى الأصغر'} ({ar(t + 1)}/{ar(sets.length)})
      </h3>
      <NumLine min={-10} max={10} points={points} />

      <div className="mut">اضغطي على الأعداد **بالترتيب**:</div>
      <motion.div key={shake} className="orderrow" animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}>
        {rest.map((x) => (
          <button key={x} className="chip-btn" onClick={() => tap(x)}>{fmtInt(x)}</button>
        ))}
      </motion.div>

      {placed.length > 0 && (
        <div className="orderrow">
          {placed.map((x, k) => (
            <span key={x} className="placed">{k > 0 && '← '}{fmtInt(x)}</span>
          ))}
        </div>
      )}

      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}><Rich t={msg.t} /></div>}
      {finished && !last && (
        <button className="btn" onClick={() => { setT(t + 1); setPlaced([]); setMsg(null) }}>التالي ▶️</button>
      )}
    </div>
  )
}