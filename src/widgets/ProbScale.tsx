import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { Frac } from '../components/Rich'
import { dec, gcd } from '../lib/dec'

type Z = 'imp' | 'less' | 'half' | 'more' | 'sure'
type P = { text: string; num: number; den: number }
const DEF: P[] = [{ text: 'ظهور الكتابة عند رمي قطعة نقد', num: 1, den: 2 }]
const ZS: { id: Z; label: string }[] = [
  { id: 'imp', label: 'مستحيل' },
  { id: 'less', label: 'أقل احتمالاً' },
  { id: 'half', label: 'متساوٍ (كاحتمال عدم الوقوع)' },
  { id: 'more', label: 'أكثر احتمالاً' },
  { id: 'sure', label: 'أكيد' },
]
const zoneOf = (n: number, d: number): Z =>
  n === 0 ? 'imp' : n === d ? 'sure' : 2 * n < d ? 'less' : 2 * n === d ? 'half' : 'more'
const HINT: Record<Z, string> = {
  imp: 'ما في ولا ناتج بيحقّق الحادثة، يعني احتمالها صفر: مستحيلة.',
  sure: 'كل النواتج بتحقّق الحادثة، يعني احتمالها ١: أكيدة.',
  half: 'نص النواتج بالضبط بيحقّق الحادثة: احتمال متساوٍ.',
  less: 'النواتج المطلوبة أقل من نص الكل، فالاحتمال بين ٠ والنص: أقل احتمالاً.',
  more: 'النواتج المطلوبة أكتر من نص الكل، فالاحتمال بين النص و١: أكثر احتمالاً.',
}
const MARKS: [number, string][] = [[0, 'مستحيل'], [25, 'أقل احتمالاً'], [50, 'متساوٍ'], [75, 'أكثر احتمالاً'], [100, 'أكيد']]

export default function ProbScale({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [ok, setOk] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const p = problems[i]
  const last = i === problems.length - 1
  const act = zoneOf(p.num, p.den)
  const g = gcd(p.num, p.den)
  const rn = p.num / g
  const rd = p.den / g
  let q = rd
  while (q % 2 === 0) q /= 2
  while (q % 5 === 0) q /= 5
  const exact = q === 1
  const pct = (p.num * 100) / p.den
  const pctTxt = ad(exact ? dec(pct) : Math.round(pct))
  const decTxt = ad(exact ? dec(pct / 100) : dec(Math.round(pct) / 100))
  const rel = exact ? '=' : '≈'

  const choose = (z: Z) => {
    if (ok) return
    if (z === act) { setOk(true); setMsg(null) }
    else setMsg(`مو هيك 🔍 ${HINT[act]} (${ad(p.num)} من ${ad(p.den)})`)
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setOk(false); setMsg(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">وين بتحطّي هالحادثة على مقياس الاحتمال؟ 📏</div>
      <div style={{ textAlign: 'center', fontSize: 17, margin: '8px 0' }}>{p.text}</div>
      <div style={{ position: 'relative', margin: '34px 36px 46px' }}>
        <div style={{ height: 16, borderRadius: 8, background: 'linear-gradient(to right,#ef4444,#f59e0b,#22c55e,#3b82f6,#7c3aed)' }} />
        {MARKS.map(([x, t]) => (
          <span key={x} style={{ position: 'absolute', left: `${x}%`, top: 22, transform: 'translateX(-50%)', fontSize: 11, whiteSpace: 'nowrap' }}>{t}</span>
        ))}
        {ok && (
          <span style={{ position: 'absolute', left: `${(p.num / p.den) * 100}%`, top: -28, transform: 'translateX(-50%)', fontSize: 22 }}>📍</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0' }}>
        {ZS.map((z) => (
          <button key={z.id} className="btn" disabled={ok} onClick={() => choose(z.id)}>{z.label}</button>
        ))}
      </div>
      {msg && <div className="fb no">{msg}</div>}
      {ok && (
        <>
          <div className="fb ok">
            برافو! 🎉 {HINT[act]}
            <div style={{ textAlign: 'center', fontSize: 19, margin: '8px 0' }}>
              ح = {rd === 1 ? <b>{ad(rn)}</b> : <Frac n={String(rn)} d={String(rd)} />} {rel} {decTxt} {rel} {pctTxt}٪
            </div>
            {!exact && <div>(الكسر ما بينتهي بالعشري، فكتبنا قيمة تقريبية ≈)</div>}
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'حادثة تانية ➡️'}</button>
        </>
      )}
    </div>
  )
}