import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { dec } from '../lib/dec'

type P = {
  title?: string; xlabel: string; ylabel: string
  xmin: number; xmax: number; xstep: number; ymin: number; ymax: number; ystep: number
  pts: { x: number; y: number }[]
  connect?: boolean
  /** الخط y = a + b·x */
  a: number; b: number
  targetX: number; tol?: number
}
const W = 560, H = 320, L = 56, R = 20, T = 28, B = 48

export default function Predict({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? []
  const [i, setI] = useState(0)
  const [guess, setGuess] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const p = problems[i]
  if (!p) return null
  const last = i === problems.length - 1
  const px = (v: number) => L + ((v - p.xmin) / (p.xmax - p.xmin)) * (W - L - R)
  const py = (v: number) => T + ((p.ymax - v) / (p.ymax - p.ymin)) * (H - T - B)
  const line = (x: number) => p.a + p.b * x
  const xs = p.pts.map((q) => q.x)
  const x0 = Math.min(...xs), x1 = Math.max(...xs)
  const ty = line(p.targetX)
  const tol = p.tol ?? p.ystep
  const xt: number[] = []
  for (let v = p.xmin; v <= p.xmax; v += p.xstep) xt.push(v)
  const yt: number[] = []
  for (let v = p.ymin; v <= p.ymax; v += p.ystep) yt.push(v)

  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (shown) return
    const r = e.currentTarget.getBoundingClientRect()
    const vy = ((e.clientY - r.top) / r.height) * H
    const v = p.ymax - ((vy - T) / (H - T - B)) * (p.ymax - p.ymin)
    setGuess(Math.max(p.ymin, Math.min(p.ymax, Math.round(v))))
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setGuess(null); setShown(false) }
  }
  const diff = guess === null ? 0 : Math.abs(guess - ty)

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} onClick={click} style={{ width: '100%', cursor: shown ? 'default' : 'pointer' }}>
        {yt.map((v) => (
          <g key={`y${v}`}>
            <line x1={L} y1={py(v)} x2={W - R} y2={py(v)} stroke="currentColor" opacity={0.15} />
            <text x={L - 22} y={py(v) + 4} textAnchor="middle" fontSize={12} fill="currentColor">{ad(v)}</text>
          </g>
        ))}
        {xt.map((v) => (
          <g key={`x${v}`}>
            <line x1={px(v)} y1={T} x2={px(v)} y2={H - B} stroke="currentColor" opacity={0.15} />
            <text x={px(v)} y={H - B + 18} textAnchor="middle" fontSize={12} fill="currentColor">{ad(v)}</text>
          </g>
        ))}
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="currentColor" strokeWidth={2} />
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="currentColor" strokeWidth={2} />
        <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">{p.xlabel}</text>
        <text x={L + 20} y={14} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">{p.ylabel}</text>

        <line x1={px(p.targetX)} y1={T} x2={px(p.targetX)} y2={H - B} stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
        <text x={px(p.targetX)} y={T - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill="#16a34a">{ad(p.targetX)}</text>

        {p.connect && (
          <polyline points={p.pts.map((q) => `${px(q.x)},${py(q.y)}`).join(' ')} fill="none" stroke="#5b5bd6" strokeWidth={2.5} />
        )}
        {shown && !p.connect && (
          <line x1={px(x0)} y1={py(line(x0))} x2={px(x1)} y2={py(line(x1))} stroke="#5b5bd6" strokeWidth={2.5} />
        )}
        {shown && (
          <line x1={px(x1)} y1={py(line(x1))} x2={px(p.targetX)} y2={py(ty)} stroke="#5b5bd6" strokeWidth={2.5} strokeDasharray="7 6" />
        )}
        {p.pts.map((q, k) => <circle key={k} cx={px(q.x)} cy={py(q.y)} r={6} fill="#5b5bd6" stroke="#fff" strokeWidth={2} />)}
        {guess !== null && <circle cx={px(p.targetX)} cy={py(guess)} r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2} />}
        {shown && <circle cx={px(p.targetX)} cy={py(ty)} r={8} fill="#16a34a" stroke="#fff" strokeWidth={2} />}
      </svg>
      {guess !== null && !shown && (
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          توقّعك: <b>{ad(guess)}</b>
          <div><button className="btn" onClick={() => setShown(true)}>اكشفي الخط 👀</button></div>
        </div>
      )}
      {guess === null && <div className="fb tip">اضغطي على الرسم عند الارتفاع اللي بتتوقّعيه على الخط الأخضر المتقطع 👆</div>}
      {shown && (
        <>
          <div className={'fb ' + (diff <= tol ? 'ok' : 'no')}>
            {diff <= tol
              ? `قريب كتير! 🎉 الخط بيعطي ${ad(dec(ty))} وتوقّعك ${ad(guess ?? 0)}.`
              : `ابعدتي شوي 😅 الخط بيعطي ${ad(dec(ty))}. كمّلي الخط بنفس الاتجاه (الخط المتقطع) وشوفي وين بيصل.`}
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}