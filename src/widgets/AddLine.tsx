import { useState } from 'react'
import type { WidgetProps } from '../types'
import { NumLine } from '../components/NumLine'
import { Rich } from '../components/Rich'
import { fmtInt, sg } from '../lib/int'

const BLUE = '#2563eb', ORANGE = '#ea580c'
const cl = (v: number) => Math.max(-5, Math.min(5, v))

export default function AddLine({ onDone }: WidgetProps) {
  const [a, setA] = useState(3)
  const [b, setB] = useState(-5)
  const [n, setN] = useState(0)
  const r = a + b

  const step = (w: 'a' | 'b', d: number) => {
    if (w === 'a') setA(cl(a + d)); else setB(cl(b + d))
    const c = n + 1
    setN(c)
    if (c === 6) onDone()
  }

  const rule =
    a === 0 || b === 0 ? 'الصفر ما بيغيّر العدد 😉'
    : a * b > 0 ? 'نفس الإشارة: الحركتين بنفس الاتجاه، فالمسافتين **بيتجمعوا** ➕'
    : 'إشارتين مختلفتين: الحركة التانية **بترجّعنا** للخلف، فالمسافتين **بيطرحوا** من بعض ⚖️'

  return (
    <div className="card center">
      <h3 className="h3">🏃 امشي على الخط</h3>
      <NumLine
        min={-10} max={10}
        points={[{ v: r, color: '#16a34a' }]}
        arcs={[
          { from: 0, to: a, label: fmtInt(a, true), color: BLUE },
          { from: a, to: r, label: fmtInt(b, true), color: ORANGE },
        ]}
      />
      <div className="stepbox">
        <span style={{ color: BLUE }}>🔵 العدد الأول</span>
        <button className="iconbtn" onClick={() => step('a', -1)}>−</button>
        <b dir="ltr" style={{ minWidth: 44 }}>{fmtInt(a, true)}</b>
        <button className="iconbtn" onClick={() => step('a', 1)}>+</button>
      </div>
      <div className="stepbox">
        <span style={{ color: ORANGE }}>🟠 العدد التاني</span>
        <button className="iconbtn" onClick={() => step('b', -1)}>−</button>
        <b dir="ltr" style={{ minWidth: 44 }}>{fmtInt(b, true)}</b>
        <button className="iconbtn" onClick={() => step('b', 1)}>+</button>
      </div>
      <div className="bigline"><Rich t={`$${sg(a)} + (${sg(b)}) = ${sg(r)}$`} /></div>
      <div><Rich t={rule} /></div>
      <div className="mut">بلّشنا من الصفر، مشينا للأول (🔵)، وبعدين للتاني (🟠) ووصلنا للنتيجة 🟢</div>
    </div>
  )
}