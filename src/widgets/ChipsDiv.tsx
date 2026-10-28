import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'
import { ChipView } from './ChipsAdd'
import type { Chip } from './ChipsAdd'

const ar = (n: number) => toArabicDigits(String(n))
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export default function ChipsDiv({ onDone }: WidgetProps) {
  const [t, setT] = useState(-8)
  const [g, setG] = useState(2)
  const [n, setN] = useState(0)

  const bump = () => { const c = n + 1; setN(c); if (c === 6) onDone() }
  const stepT = (d: number) => {
    let nt = t + d
    if (nt === 0) nt += d
    setT(clamp(nt, -12, 12))
    bump()
  }
  const stepG = (d: number) => { setG(clamp(g + d, 1, 6)); bump() }

  const abs = Math.abs(t)
  const ok = abs % g === 0
  const per = abs / g
  const chip = (i: number): Chip => ({ id: i, s: t > 0 ? 1 : -1, g: 0, gone: false })
  const kind = t > 0 ? '➕ موجبة' : '➖ سالبة'

  return (
    <div className="card center">
      <h3 className="h3">🍰 قسمة القطع على مجموعات</h3>
      <div className="mut">القسمة = توزيع بالتساوي على مجموعات</div>

      {ok ? (
        <div className="groups" style={{ margin: '10px 0' }}>
          {Array.from({ length: g }, (_, gi) => (
            <div key={gi} className="cbox sm">
              {Array.from({ length: per }, (_, i) => <ChipView key={i} c={chip(i)} sel={false} />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="cbox" style={{ margin: '10px 0' }}>
          {Array.from({ length: abs }, (_, i) => <ChipView key={i} c={chip(i)} sel={false} />)}
        </div>
      )}

      <div className="stepbox">
        <span>عدد القطع</span>
        <button className="iconbtn" onClick={() => stepT(-1)}>−</button>
        <b dir="ltr" style={{ minWidth: 44 }}>{t > 0 ? `+${ar(t)}` : `−${ar(-t)}`}</b>
        <button className="iconbtn" onClick={() => stepT(1)}>+</button>
      </div>
      <div className="stepbox">
        <span>عدد المجموعات</span>
        <button className="iconbtn" onClick={() => stepG(-1)}>−</button>
        <b style={{ minWidth: 30 }}>{ar(g)}</b>
        <button className="iconbtn" onClick={() => stepG(1)}>+</button>
      </div>

      {ok ? (
        <>
          <div className="bigline"><Rich t={`$${sg(t)} ÷ ${g} = ${sg(t / g)}$`} /></div>
          <div className="mut">وزّعنا {ar(abs)} قطعة {kind} على {ar(g)} مجموعات متساوية: كل مجموعة فيها {ar(per)} قطع</div>
        </>
      ) : (
        <div className="fb no">❌ {ar(abs)} قطعة ما بتتوزع بالتساوي على {ar(g)} مجموعات. جرّبي رقم تاني!</div>
      )}
    </div>
  )
}