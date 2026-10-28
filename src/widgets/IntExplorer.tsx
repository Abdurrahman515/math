import { useState } from 'react'
import type { WidgetProps } from '../types'
import { NumLine } from '../components/NumLine'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))
const MIN = -10, MAX = 10
const BLUE = '#2563eb', RED = '#dc2626', GRAY = '#64748b'

/** props.mode: 'sign' (موجب/سالب/صفر) أو 'abs' (القيمة المطلقة) */
export default function IntExplorer({ props, onDone }: WidgetProps) {
  const mode = (props?.mode as 'sign' | 'abs' | undefined) ?? 'sign'
  const [v, setV] = useState<number | null>(null)
  const [seen, setSeen] = useState<number[]>([])

  const go = (n: number) => {
    const c = Math.max(MIN, Math.min(MAX, n))
    setV(c)
    const s = seen.includes(c) ? seen : [...seen, c]
    setSeen(s)
    if (s.length >= 4 && s.some((x) => x < 0) && s.some((x) => x > 0)) onDone()
  }

  const a = v === null ? 0 : Math.abs(v)
  const col = v === null ? GRAY : v > 0 ? BLUE : v < 0 ? RED : GRAY
  const points =
    v === null ? [] : mode === 'abs' && a !== 0 ? [{ v: a, color: BLUE }, { v: -a, color: RED }] : [{ v, color: col }]
  const arcs =
    v === null || a === 0 ? [] : mode === 'abs'
      ? [{ from: 0, to: a, label: ar(a), color: BLUE }, { from: 0, to: -a, label: ar(a), color: RED }]
      : [{ from: 0, to: v, label: ar(a), color: col }]

  return (
    <div className="card center">
      <h3 className="h3">{mode === 'abs' ? '📏 كم بعيد عن الصفر؟' : '🧭 خط الأعداد'}</h3>
      <NumLine min={MIN} max={MAX} points={points} arcs={arcs} onPick={go} />

      <div className="row" style={{ marginTop: 0 }}>
        <button className="iconbtn" onClick={() => go((v ?? 0) - 1)} aria-label="أنقص">−</button>
        <button className="iconbtn" onClick={() => go((v ?? 0) + 1)} aria-label="زِد">+</button>
      </div>

      {v === null ? (
        <div className="mut">👆 اضغطي على أي مكان بالخط (أو استعملي + و −)</div>
      ) : mode === 'sign' ? (
        <div>
          {v > 0 ? <Rich t={'🟢 عدد صحيح **موجب**'} /> : v < 0 ? <Rich t={'🔴 عدد صحيح **سالب**'} /> : <Rich t={'⚪ **صفر**: لا موجب ولا سالب'} />}
          {v !== 0 && <div className="mut">بعيد {ar(a)} وحدات عن الصفر</div>}
        </div>
      ) : v === 0 ? (
        <div><Rich t="$|0| = 0$" /> الصفر على الصفر نفسه، فبعده صفر</div>
      ) : (
        <div>
          <div className="bigline"><Rich t={`$|${sg(-a)}| = ${a}$`} />&nbsp;&nbsp;<Rich t={`$|${a}| = ${a}$`} /></div>
          <div className="mut">نفس المسافة عن الصفر ← نفس القيمة المطلقة</div>
        </div>
      )}
    </div>
  )
}