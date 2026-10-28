import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type P = { title?: string; cats: string[]; values: number[]; max: number; step: number; hist?: boolean }
const DEF: P = { cats: ['أ', 'ب', 'ج'], values: [30, 45, 20], max: 50, step: 5 }
const LP = 44, T = 14, PH = 200

export default function BarBuilder({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? [DEF]
  const [i, setI] = useState(0)
  const p = problems[i]
  const [hs, setHs] = useState<number[]>(() => problems[0].values.map(() => 0))
  const [res, setRes] = useState<{ ok: boolean; bad: string[] } | null>(null)
  const last = i === problems.length - 1
  const nc = p.cats.length
  const PW = Math.max(300, nc * 70)
  const cw = PW / nc
  const W = LP + PW + 10
  const H = T + PH + 44
  const y = (v: number) => T + PH - (v / p.max) * PH
  const ticks = Array.from({ length: Math.floor(p.max / p.step) + 1 }, (_, k) => k * p.step)
  const gap = p.hist ? 0 : cw * 0.24

  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (res?.ok) return
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const vy = ((e.clientY - r.top) / r.height) * H
    const c = Math.floor((vx - LP) / cw)
    if (c < 0 || c >= nc) return
    const raw = ((T + PH - vy) / PH) * p.max
    const v = Math.max(0, Math.min(p.max, Math.round(raw / p.step) * p.step))
    setHs(hs.map((h, k) => (k === c ? v : h)))
    setRes(null)
  }

  const check = () => {
    const bad = p.cats.filter((_, k) => hs[k] !== p.values[k])
    setRes({ ok: bad.length === 0, bad })
  }
  const next = () => {
    if (last) onDone()
    else { const np = problems[i + 1]; setI(i + 1); setHs(np.values.map(() => 0)); setRes(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        {p.title ?? 'ارسمي الأعمدة'} — اضغطي داخل الرسم على الارتفاع المطلوب لكل عمود 👆
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '8px 0' }}>
        {p.cats.map((c, k) => (
          <span key={k} style={{ padding: '4px 10px', borderRadius: 10, background: 'rgba(124,58,237,.12)', fontWeight: 700 }}>
            {c}: {ad(p.values[k])}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} onClick={click} style={{ width: '100%', cursor: 'pointer' }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={LP} y1={y(t)} x2={LP + PW} y2={y(t)} stroke="currentColor" opacity={0.15} />
            <text x={LP - 18} y={y(t) + 4} textAnchor="middle" fontSize={12} fill="currentColor">{ad(t)}</text>
          </g>
        ))}
        <line x1={LP} y1={T} x2={LP} y2={T + PH} stroke="currentColor" strokeWidth={2} />
        <line x1={LP} y1={T + PH} x2={LP + PW} y2={T + PH} stroke="currentColor" strokeWidth={2} />
        {p.cats.map((c, k) => (
          <g key={k}>
            <rect
              x={LP + k * cw + gap / 2} y={y(hs[k])} width={cw - gap} height={(hs[k] / p.max) * PH}
              fill="#5b5bd6" stroke={p.hist ? '#fff' : 'none'} strokeWidth={1.5}
              style={{ transition: 'all .2s' }}
            />
            {hs[k] > 0 && (
              <text x={LP + k * cw + cw / 2} y={y(hs[k]) - 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">{ad(hs[k])}</text>
            )}
            <text x={LP + k * cw + cw / 2} y={T + PH + 18} textAnchor="middle" fontSize={12} fill="currentColor">{c}</text>
          </g>
        ))}
      </svg>
      {p.hist && <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.7 }}>لاحظي: بالمدرج التكراري الأعمدة متلاصقة بدون فراغات 🧱</div>}
      {res && !res.ok && <div className="fb no">راجعي: {res.bad.join('، ')} 🔍 ارتفاعهم مو مطابق للجدول.</div>}
      {res?.ok ? (
        <>
          <div className="fb ok">برافو! 🎉 كل الأعمدة صح ✔️</div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button className="btn" onClick={check}>تحقّقي ✅</button>
        </div>
      )}
    </div>
  )
}