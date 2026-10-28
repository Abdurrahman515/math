import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { Frac } from '../components/Rich'
import { gcd } from '../lib/dec'
import { rand } from '../lib/rng'

type P = { title: string; event: string; labels: string[]; goal: number[]; colors?: string[] }
const PAL = ['#fde68a', '#bfdbfe', '#fbcfe8', '#bbf7d0', '#ddd6fe', '#fed7aa', '#a5f3fc', '#fecaca']
const DEF: P[] = [{ title: 'قرص دوّار', event: 'عدد زوجي', labels: ['١', '٢', '٣', '٤', '٥', '٦'], goal: [1, 3, 5] }]
const R = 92
const pt = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]
}

export default function ProbSpinner({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [sel, setSel] = useState<number[]>([])
  const [ok, setOk] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [spins, setSpins] = useState(0)
  const [hits, setHits] = useState(0)
  const p = problems[i]
  const n = p.labels.length
  const k = p.goal.length
  const g = gcd(k, n)
  const step = 360 / n
  const last = i === problems.length - 1

  const toggle = (j: number) => {
    if (ok) return
    setMsg(null)
    setSel(sel.includes(j) ? sel.filter((x) => x !== j) : [...sel, j])
  }
  const check = () => {
    const extra = sel.filter((x) => !p.goal.includes(x))
    const miss = p.goal.filter((x) => !sel.includes(x))
    if (!sel.length) setMsg('اضغطي على الأقسام اللي بتحقّق الحادثة أول 👆')
    else if (extra.length) setMsg('في قسم اخترتيه ما بيحقّق الحادثة 🔍 اقرئي الشرط مرة تانية.')
    else if (miss.length) setMsg('لسا في أقسام بتحقّق الحادثة وما اخترتيها 🔍 دوّري كمان.')
    else setOk(true)
  }
  const spin = () => {
    let h = 0
    for (let s = 0; s < 20; s++) if (p.goal.includes(rand(0, n - 1))) h++
    setSpins(spins + 20)
    setHits(hits + h)
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setSel([]); setOk(false); setMsg(null); setSpins(0); setHits(0) }
  }
  const order = p.labels.map((_, j) => j).sort((a, b) => Number(sel.includes(a)) - Number(sel.includes(b)))

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      <div style={{ textAlign: 'center', margin: '6px 0' }}>
        {ok ? 'الحادثة: ' : 'اضغطي على كل قسم بيحقّق الحادثة: '}
        <b>«{p.event}»</b>
      </div>
      <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 240, display: 'block', margin: '0 auto' }}>
        {order.map((j) => {
          const a0 = -90 + j * step
          const [x0, y0] = pt(a0, R)
          const [x1, y1] = pt(a0 + step, R)
          const [tx, ty] = pt(a0 + step / 2, R * 0.62)
          const on = sel.includes(j)
          return (
            <g key={j} onClick={() => toggle(j)} style={{ cursor: ok ? 'default' : 'pointer' }}>
              <path
                d={`M100 100 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`}
                fill={p.colors?.[j] ?? PAL[j % PAL.length]}
                stroke={on ? '#7c3aed' : '#64748b'}
                strokeWidth={on ? 4 : 1.5}
              />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize={n > 6 ? 14 : 17} fill="#1e293b" style={{ pointerEvents: 'none' }}>
                {ad(p.labels[j])}
              </text>
              {on && (
                <text x={tx} y={ty + 17} textAnchor="middle" fontSize={12} fill="#7c3aed" style={{ pointerEvents: 'none' }}>✔</text>
              )}
            </g>
          )
        })}
      </svg>
      {msg && <div className="fb no">{msg}</div>}
      {!ok && (
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <button className="btn" onClick={check}>تأكّدي ✅</button>
        </div>
      )}
      {ok && (
        <>
          <div className="fb ok">
            برافو! 🎉 عدد النواتج في الحادثة = <b>{ad(k)}</b>، والعدد الكلي للنواتج = <b>{ad(n)}</b>
            <div style={{ textAlign: 'center', fontSize: 20, margin: '8px 0' }}>
              ح(الحادثة) = <Frac n={String(k)} d={String(n)} />
              {g > 1 && (
                <>
                  {' '}= <Frac n={String(k / g)} d={String(n / g)} />
                </>
              )}
            </div>
            {g > 1 && <div>بسّطنا الكسر على {ad(g)} 👌</div>}
          </div>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <button className="btn" onClick={spin}>🎡 دوّري ٢٠ مرة</button>
          </div>
          {spins > 0 && (
            <div className="fb tip">
              دوّرتي {ad(spins)} مرة، ووقف المؤشر داخل الحادثة {ad(hits)} مرة (حوالي {ad(Math.round((hits * 100) / spins))}٪).
              الاحتمال المتوقع حوالي {ad(Math.round((k * 100) / n))}٪. ما لازم يتطابقوا بالضبط، بس كل ما دوّرتي أكتر بيقرّبوا 😉
            </div>
          )}
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}