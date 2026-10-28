import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type P = { data: number[]; min: number; max: number; mode?: 'build' | 'explore'; lab?: number; title?: string }
const DEF: P = { data: [3, 5, 5, 6, 6, 6, 8], min: 0, max: 10 }
const PAD = 24

export default function DotPlot({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? [DEF]
  const [i, setI] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [added, setAdded] = useState<number[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const p = problems[i]
  const mode = p.mode ?? 'build'
  const last = i === problems.length - 1
  const n = p.max - p.min
  const S = Math.min(34, 620 / n)
  const W = n * S + PAD * 2
  const lab = p.lab ?? Math.max(1, Math.ceil(n / 10))
  const x = (v: number) => PAD + (v - p.min) * S

  const counts: Record<number, number> = {}
  ;[...p.data, ...added].forEach((v) => { counts[v] = (counts[v] ?? 0) + 1 })
  const stack = Math.max(...Object.values(counts))
  const Y = stack * 15 + 24
  const H = Y + 34

  const run: Record<number, number> = {}
  const dots = [
    ...(mode === 'build' ? placed : p.data).map((v) => ({ v, c: '#5b5bd6' })),
    ...(mode === 'explore' ? added.map((v) => ({ v, c: '#f59e0b' })) : []),
  ].map((d) => {
    const k = run[d.v] ?? 0
    run[d.v] = k + 1
    return { ...d, k }
  })

  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const v = Math.max(p.min, Math.min(p.max, Math.round((vx - PAD) / S) + p.min))
    if (mode === 'build') {
      if (placed.length >= p.data.length) return
      const need = p.data[placed.length]
      if (v === need) { setPlaced([...placed, v]); setMsg(null) }
      else setMsg(`هاي ${ad(v)} 😅 المطلوب ${ad(need)}، دوّري عليها على الخط.`)
    } else {
      setAdded([...added, v])
    }
  }

  const done = mode === 'build' && placed.length === p.data.length
  const bMin = Math.min(...p.data), bMax = Math.max(...p.data)
  const all = [...p.data, ...added]
  const nMin = Math.min(...all), nMax = Math.max(...all)
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setPlaced([]); setAdded([]); setMsg(null) }
  }

  return (
    <div className="card">
      {p.title && <div className="q-prompt">{p.title}</div>}
      {mode === 'build' && !done && (
        <div style={{ textAlign: 'center', fontSize: 18, margin: '8px 0' }}>
          القيمة التالية: <b style={{ fontSize: 26 }}>{ad(p.data[placed.length])}</b>
          <span style={{ opacity: 0.6 }}> ({ad(placed.length)} من {ad(p.data.length)})</span>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="pick" onClick={click} style={{ width: '100%', cursor: 'pointer' }}>
        <line x1={4} y1={Y} x2={W - 4} y2={Y} stroke="currentColor" strokeWidth={2} />
        {Array.from({ length: n + 1 }, (_, k) => {
          const v = p.min + k
          const big = k % lab === 0
          return (
            <g key={v}>
              <line x1={x(v)} y1={Y - (big ? 7 : 4)} x2={x(v)} y2={Y + (big ? 7 : 4)} stroke="currentColor" strokeWidth={big ? 2 : 1} />
              {big && <text x={x(v)} y={Y + 24} textAnchor="middle" fontSize={13} fill="currentColor">{ad(v)}</text>}
            </g>
          )
        })}
        {dots.map((d, k) => (
          <circle key={k} cx={x(d.v)} cy={Y - 11 - d.k * 15} r={6} fill={d.c} stroke="#fff" strokeWidth={1.5} />
        ))}
      </svg>
      {msg && <div className="fb no">{msg}</div>}

      {mode === 'build' && done && (
        <>
          <div className="fb ok">
            برافو! 🎉 أصغر قيمة {ad(bMin)} وأكبر قيمة {ad(bMax)}، فالمدى = {ad(bMax)} − {ad(bMin)} = <b>{ad(bMax - bMin)}</b>
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}

      {mode === 'explore' && (
        <>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            المدى الأصلي: {ad(bMax)} − {ad(bMin)} = <b>{ad(bMax - bMin)}</b>
            {added.length > 0 && <> ← المدى الجديد: {ad(nMax)} − {ad(nMin)} = <b>{ad(nMax - nMin)}</b></>}
          </div>
          {added.length > 0 && (
            <div className={'fb ' + (nMax - nMin !== bMax - bMin ? 'tip' : 'ok')}>
              {nMax - nMin !== bMax - bMin
                ? 'المدى تغيّر! 😮 القيمة الجديدة صارت هي الأكبر أو الأصغر.'
                : 'المدى ما تغيّر ✨ لأنو القيمة الجديدة بين الأصغر والأكبر.'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
            {added.length > 0 && <button className="btn" onClick={() => setAdded(added.slice(0, -1))}>↩️ تراجع</button>}
            {added.length > 0 && <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>}
          </div>
        </>
      )}
    </div>
  )
}