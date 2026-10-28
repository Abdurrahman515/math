import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { Frac } from '../components/Rich'

type P = { text: string; total: number; fav: number; favName: string; notName: string }
const DEF: P[] = [{ text: 'كيس فيه ٨ كرات، منها ٣ حمراء. ظلّلي الكرات الحمراء', total: 8, fav: 3, favName: 'حمراء', notName: 'ليست حمراء' }]

export default function ComplementBar({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [sel, setSel] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const p = problems[i]
  const last = i === problems.length - 1
  const k = sel.length
  const T = p.total

  const tap = (j: number) => {
    if (done) return
    setMsg(null)
    if (sel.includes(j)) { setSel(sel.filter((x) => x !== j)); return }
    if (k >= p.fav) { setMsg(`المطلوب ظلّلي ${ad(p.fav)} بس 😅 شيلي واحدة قبل ما تزيدي.`); return }
    const ns = [...sel, j]
    setSel(ns)
    if (ns.length === p.fav) setDone(true)
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setSel([]); setDone(false); setMsg(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">{p.text}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '12px 0' }}>
        {Array.from({ length: T }, (_, j) => {
          const on = sel.includes(j)
          return (
            <div
              key={j}
              onClick={() => tap(j)}
              style={{
                width: 34, height: 34, borderRadius: '50%', cursor: done ? 'default' : 'pointer',
                border: '2px solid currentColor',
                background: on ? '#7c3aed' : done ? '#f59e0b' : '#e2e8f0',
                transition: 'background .2s',
              }}
            />
          )
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: 17 }}>
        ظلّلتي {ad(k)} من {ad(p.fav)}
      </div>
      {k > 0 && (
        <div style={{ textAlign: 'center', fontSize: 18, margin: '10px 0', lineHeight: 2.2 }}>
          ح({p.favName}) = <Frac n={String(k)} d={String(T)} />
          <br />
          ح({p.notName}) = <Frac n={String(T - k)} d={String(T)} />
        </div>
      )}
      {msg && <div className="fb no">{msg}</div>}
      {done && (
        <>
          <div className="fb ok">
            برافو! 🎉 البنفسجي هو الحادثة، والبرتقالي هو متممتها.
            <div style={{ textAlign: 'center', fontSize: 18, margin: '8px 0' }}>
              <Frac n={String(k)} d={String(T)} /> + <Frac n={String(T - k)} d={String(T)} /> = <Frac n={String(T)} d={String(T)} /> = {ad(1)}
            </div>
            يعني ح({p.notName}) = ١ − ح({p.favName}) ✔️
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}