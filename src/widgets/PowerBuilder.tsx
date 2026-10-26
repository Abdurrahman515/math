import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { Expr } from '../components/Rich'

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

export default function PowerBuilder({ onDone }: WidgetProps) {
  const [b, setB] = useState(2)
  const [e, setE] = useState(3)
  const [taps, setTaps] = useState(0)

  const change = (which: 'b' | 'e', d: number) => {
    if (which === 'b') setB((x) => clamp(x + d, 2, 9))
    else setE((x) => clamp(x + d, 1, 6))
    const t = taps + 1
    setTaps(t)
    if (t === 4) onDone()
  }

  const read = e === 2 ? `${b} تربيع` : e === 3 ? `${b} تكعيب` : `${b} أُس ${e}`

  return (
    <div className="card center">
      <h3 className="h3">🧪 مختبر الأسس: غيّري وشوفي</h3>
      <div className="power" dir="ltr">
        <span className="pw-b">{b}<small>الأساس</small></span>
        <span className="pw-e">{e}<small>الأس</small></span>
      </div>
      <div className="row">
        <div className="stepper">
          <button className="iconbtn" onClick={() => change('b', -1)}>−</button>
          <span>الأساس</span>
          <button className="iconbtn" onClick={() => change('b', 1)}>+</button>
        </div>
        <div className="stepper">
          <button className="iconbtn" onClick={() => change('e', -1)}>−</button>
          <span>الأس</span>
          <button className="iconbtn" onClick={() => change('e', 1)}>+</button>
        </div>
      </div>
      <div className="factors" dir="ltr">
        <AnimatePresence initial={false}>
          {Array.from({ length: e }, (_, i) => (
            <motion.span
              key={i} className="chip" layout
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            >
              {i > 0 ? `× ${b}` : b}
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="eqv">= {b ** e}</span>
      </div>
      <div>👀 لاحظي: الأساس <b>اتكرر {e}</b> {e === 1 ? 'مرة' : 'مرات'}، يعني عدد العوامل = الأس.</div>
      <div className="mut">بنقرأها: <b>{read}</b> &nbsp;<Expr s={`${b}^${e}`} /></div>
    </div>
  )
}