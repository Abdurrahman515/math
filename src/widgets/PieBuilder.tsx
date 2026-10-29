import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { rad, toNum } from '../lib/geo'

type Item = { name: string; pct: number }
type Prob = { title: string; items: Item[] }
const DEF: Prob[] = [{ title: 'الرياضة المفضلة ⚽', items: [{ name: 'كرة القدم', pct: 50 }, { name: 'السباحة', pct: 25 }, { name: 'التنس', pct: 25 }] }]
const COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#f472b6']
const n = (x: number) => ad(String(x))

const slice = (r: number, a0: number, a1: number) => {
  const p = (d: number) => [100 + r * Math.sin(rad(d)), 100 - r * Math.cos(rad(d))]
  const [x0, y0] = p(a0), [x1, y1] = p(a1)
  return `M100,100 L${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1} Z`
}

export default function PieBuilder({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as Prob[] | undefined) ?? DEF
  const [pi, setPi] = useState(0)
  const [vals, setVals] = useState<string[]>([])
  const [res, setRes] = useState<string[] | null>(null)
  const [acc, setAcc] = useState(0);
  const p = problems[pi]
  const last = pi === problems.length - 1
  const exact = p.items.map((x) => x.pct * 3.6)
  const allOk = res !== null && res.every((r) => r === '')
  const total = p.items.reduce((s, x) => s + x.pct, 0)

  const check = () => {
    setRes(
      p.items.map((it, k) => {
        const v = toNum(vals[k] ?? '')
        if (!Number.isFinite(v)) return 'اكتبي رقماً بالدرجات.'
        if (Math.abs(v - exact[k]) <= 0.6) return ''
        if (Math.abs(v - it.pct) < 0.01) return 'هاي النسبة نفسها 🔍 اضربيها بـ٣٦٠ ÷ ١٠٠ لتطلع الدرجات.'
        if (Math.abs(v - it.pct * 1.8) <= 0.6) return 'استعملتِ ١٨٠ 🔍 الدائرة كاملة ٣٦٠°.'
        return `جرّبي: ${n(it.pct)} ÷ ١٠٠ × ٣٦٠ 🔍`
      }),
    )
  }
  const next = () => { if (last) onDone(); else { setPi(pi + 1); setVals([]); setRes(null) } }
  const sumStudent = p.items.reduce((s, _x, k) => s + Math.round(toNum(vals[k] ?? '') || 0), 0)

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      <div style={{ textAlign: 'center', margin: '4px 0' }}>
        مجموع النسب {n(total)}% {total === 100 ? '✅' : '⚠️'} · احسبي زاوية كل قطاع (بالدرجات)
      </div>
      {p.items.map((it, k) => (
        <div key={k} style={{ margin: '6px 0' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS[k % COLORS.length], borderRadius: 3, marginInlineEnd: 6 }} />
          {it.name}: <b>{n(it.pct)}%</b> ← {' '}
          <input
            inputMode="decimal" value={vals[k] ?? ''} disabled={allOk}
            onChange={(e) => { const v = [...vals]; v[k] = e.target.value; setVals(v); setRes(null) }}
            style={{ width: 70 }}
          />°
          {res && res[k] && <div className="fb no">{res[k]}</div>}
        </div>
      ))}
      {!allOk && <button className="btn" onClick={check}>تحقّقي ✔️</button>}
      {allOk && (
        <>
          <svg viewBox="0 0 200 200" style={{ width: '60%', display: 'block', margin: '8px auto' }}>
            {p.items.map((it, k) => {
              const a0 = acc, a1 = acc + it.pct * 3.6
              setAcc(a1);
              const t = ((a0 + a1) / 2)
              return (
                <g key={k}>
                  <path d={slice(90, a0, a1)} fill={COLORS[k % COLORS.length]} stroke="#fff" strokeWidth={2} />
                  <text x={100 + 58 * Math.sin(rad(t))} y={104 - 58 * Math.cos(rad(t))} fontSize={11} textAnchor="middle" fill="#1e293b">{n(it.pct)}%</text>
                </g>
              )
            })}
          </svg>
          <div className="fb ok">
            مجموع الدرجات عندك = {n(sumStudent)}° {sumStudent === 360 ? '✅ بالضبط ٣٦٠°' : '← قريب من ٣٦٠° وفرقه بسبب التقريب لأقرب درجة، وهاد طبيعي 👍'}
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}