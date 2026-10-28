import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { ChipView } from './ChipsAdd'
import type { Chip } from './ChipsAdd'
import { fmtInt } from '../lib/int'                   
import { toArabicDigits } from '../lib/arabicDigits'

const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))

export default function GroupsMul({ onDone }: WidgetProps) {
  const [a, setA] = useState(4)
  const [b, setB] = useState(-3)
  const [n, setN] = useState(0)

  const bump = () => { const c = n + 1; setN(c); if (c === 5) onDone() }
  const stepA = (d: number) => { setA(Math.max(1, Math.min(5, a + d))); bump() }
  const stepB = (d: number) => {
    let nb = b + d
    if (nb === 0) nb += d
    setB(Math.max(-5, Math.min(5, nb)))
    bump()
  }

  const chip = (i: number): Chip => ({ id: i, s: b > 0 ? 1 : -1, g: 0, gone: false })
  const sum = Array.from({ length: a }, (_, i) => (i === 0 ? sg(b) : term(b))).join(' + ')
  const ar = (n: number) => toArabicDigits(String(n))

  return (
    <div className="card center">
      <h3 className="h3">📦 الضرب = جمع متكرر</h3>
      <div className="mut">{ar(a)} مجموعات، وفي كل مجموعة {ar(Math.abs(b))} قطع {b > 0 ? '➕' : '➖'}</div>
      <b style={{ minWidth: 30 }}>{ar(a)}</b>
      <b dir="ltr" style={{ minWidth: 30 }}>{fmtInt(b, true)}</b>

      <div className="groups" style={{ margin: '10px 0' }}>
        {Array.from({ length: a }, (_, gi) => (
          <div key={gi} className="cbox sm">
            {Array.from({ length: Math.abs(b) }, (_, i) => <ChipView key={i} c={chip(i)} sel={false} />)}
          </div>
        ))}
      </div>

      <div className="stepbox">
        <span>عدد المجموعات</span>
        <button className="iconbtn" onClick={() => stepA(-1)}>−</button>
        <b style={{ minWidth: 30 }}>{a}</b>
        <button className="iconbtn" onClick={() => stepA(1)}>+</button>
      </div>
      <div className="stepbox">
        <span>قيمة كل مجموعة</span>
        <button className="iconbtn" onClick={() => stepB(-1)}>−</button>
        <b dir="ltr" style={{ minWidth: 30 }}>{b > 0 ? `+${b}` : `−${-b}`}</b>
        <button className="iconbtn" onClick={() => stepB(1)}>+</button>
      </div>

      <div className="bigline"><Rich t={`$${sum} = ${sg(a * b)}$`} /></div>
      <div className="bigline"><Rich t={`$${a} × ${term(b)} = ${sg(a * b)}$`} /></div>
      <div className="mut">{b < 0 ? 'جمعنا قطع سالبة كتير ← الناتج سالب 🔴' : 'جمعنا قطع موجبة كتير ← الناتج موجب 🟡'}</div>
    </div>
  )
}