import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

const chip = { width: 13, height: 13, borderRadius: '50%', background: '#b45309' } as const

export default function MeanCups({ onDone, props }: WidgetProps) {
  const values = (props?.values as number[] | undefined) ?? [12, 7, 9, 8, 14]
  const extra = props?.extra as number | undefined
  const [cups, setCups] = useState<number[]>(values)
  const [added, setAdded] = useState(false)
  const equal = cups.every((c) => c === cups[0])
  const total = cups.reduce((a, b) => a + b, 0)

  const step = (c: number[]) => {
    const hi = c.indexOf(Math.max(...c))
    const lo = c.indexOf(Math.min(...c))
    const r = [...c]
    r[hi]--
    r[lo]++
    return r
  }
  const one = () => { if (!equal) setCups(step(cups)) }
  const all = () => {
    let c = cups
    while (!c.every((v) => v === c[0])) c = step(c)
    setCups(c)
  }
  const addCup = () => { setCups([...cups, extra as number]); setAdded(true) }

  return (
    <div className="card">
      <div className="q-prompt">
        كل كوب فيه عدد قطع. انقلي قطعة من أكبر كوب لأصغر كوب لحد ما يصير بكل كوب نفس العدد 🔄
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '14px 0', flexWrap: 'wrap' }}>
        {cups.map((c, k) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 46, minHeight: 60, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center',
                gap: 2, padding: 4, border: '2px solid currentColor', borderTop: 'none', borderRadius: '0 0 12px 12px',
              }}
            >
              {Array.from({ length: c }, (_, j) => <span key={j} style={chip} />)}
            </div>
            <b>{ad(c)}</b>
          </div>
        ))}
      </div>
      {!equal && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn" onClick={one}>انقلي قطعة 🔄</button>
          <button className="btn" onClick={all}>وزّعي كلها ⚡</button>
        </div>
      )}
      {equal && (
        <>
          <div className="fb ok">
            صار بكل كوب <b>{ad(cups[0])}</b> قطعة 🎉
            <br />
            المتوسط = المجموع ÷ عدد الأكواب = {ad(total)} ÷ {ad(cups.length)} = <b>{ad(cups[0])}</b> ✔️
          </div>
          {extra !== undefined && !added ? (
            <button className="btn" onClick={addCup}>أضيفي كوب جديد فيه {ad(extra)} قطعة ➕</button>
          ) : (
            <button className="btn" onClick={onDone}>تمام ✅</button>
          )}
        </>
      )}
    </div>
  )
}