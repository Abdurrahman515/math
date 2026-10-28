import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { dec } from '../lib/dec'
import { sum, sortAsc, rangeOf, medianOf, modesOf, tenth } from '../lib/stats'

type P = { data: number[]; title?: string; addable?: number[] }
const DEF: P = { data: [9, 4, 7, 12, 5, 4, 15], addable: [] }
const f = (x: number) => ad(dec(tenth(x)))

const measures = (d: number[]) => ({
  mean: sum(d) / d.length,
  median: medianOf(d),
  modes: modesOf(d),
  range: rangeOf(d),
})

export default function CentralLab({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? [DEF]
  const [i, setI] = useState(0)
  const [strikes, setStrikes] = useState<number | null>(null)
  const [added, setAdded] = useState<number[]>([])
  const p = problems[i]
  const last = i === problems.length - 1
  const data = [...p.data, ...added]
  const n = data.length
  const sorted = sortAsc(data)
  const maxS = Math.floor((n - 1) / 2)
  const shown = strikes === null ? data : sorted
  const found = strikes !== null && strikes >= maxS
  const mid = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]
  const cur = measures(data)
  const base = measures(p.data)
  const hasAdd = (p.addable?.length ?? 0) > 0

  const addVal = (v: number) => { setAdded([...added, v]); setStrikes(Math.floor(n / 2)) }
  const undo = () => { setAdded(added.slice(0, -1)); setStrikes(Math.floor((n - 2) / 2)) }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setStrikes(null); setAdded([]) }
  }

  const chipStyle = (idx: number) => {
    const struck = strikes !== null && (idx < strikes || idx >= n - strikes)
    const isMid = found && mid.includes(idx)
    const isMode = found && cur.modes.includes(shown[idx])
    return {
      padding: '6px 11px', borderRadius: 10, fontSize: 17, fontWeight: 700,
      background: isMid ? '#fde68a' : 'rgba(124,58,237,.12)',
      border: isMode ? '2px solid #7c3aed' : '2px solid transparent',
      opacity: struck ? 0.3 : 1,
      textDecoration: struck ? 'line-through' : 'none',
    } as const
  }

  const card = (name: string, now: string, was: string, changed: boolean) => (
    <div style={{ flex: '1 1 110px', padding: 10, borderRadius: 12, background: 'rgba(124,58,237,.08)', textAlign: 'center' }}>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{name}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{now}</div>
      {added.length > 0 && <div style={{ fontSize: 12 }}>{changed ? `كان ${was} 🔄` : 'ما تغيّر ✨'}</div>}
    </div>
  )
  const modeTxt = (md: number[]) => (md.length ? md.map(ad).join(' و') : 'لا يوجد')

  return (
    <div className="card">
      {p.title && <div className="q-prompt">{p.title}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
        {shown.map((v, idx) => <span key={idx} style={chipStyle(idx)}>{ad(v)}</span>)}
      </div>

      {strikes === null && <div style={{ textAlign: 'center' }}><button className="btn" onClick={() => setStrikes(0)}>رتّبي من الأصغر للأكبر 🔢</button></div>}
      {strikes !== null && !found && (
        <div style={{ textAlign: 'center' }}>
          <div className="fb tip">اشطبي الأصغر والأكبر مرة بعد مرة، والباقي بالنص هو الوسيط 🎯</div>
          <button className="btn" onClick={() => setStrikes(strikes + 1)}>اشطبي الأصغر والأكبر ✂️</button>
        </div>
      )}

      {found && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' }}>
            {card('المتوسط', f(cur.mean), f(base.mean), tenth(cur.mean) !== tenth(base.mean))}
            {card('الوسيط', f(cur.median), f(base.median), cur.median !== base.median)}
            {card('المنوال', modeTxt(cur.modes), modeTxt(base.modes), cur.modes.join() !== base.modes.join())}
            {card('المدى', f(cur.range), f(base.range), cur.range !== base.range)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.75, textAlign: 'center' }}>
            🟨 الوسيط · المربعات ذات الإطار البنفسجي هي المنوال
            {n % 2 === 0 && ' · العدد زوجي، فالوسيط هو متوسط القيمتين الملوّنتين'}
          </div>
          {hasAdd && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
              {p.addable!.map((v) => <button key={v} className="btn" onClick={() => addVal(v)}>أضيفي {ad(v)} ➕</button>)}
              {added.length > 0 && <button className="btn" onClick={undo}>↩️ تراجع</button>}
            </div>
          )}
          {(!hasAdd || added.length > 0) && (
            <div style={{ textAlign: 'center' }}>
              <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}