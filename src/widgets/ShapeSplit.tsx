import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { ri, one, toNum } from '../lib/geo'
import { pi314, f1 } from '../lib/measure'

type Kind = 'L' | 'tri' | 'semi' | 'hole'
type T = { kind: Kind; w: number; h: number; p: number; q: number }
const n = (x: number) => ad(String(x))

function gen(kind: Kind): T {
  if (kind === 'L') { const w = ri(6, 10); return { kind, w, h: ri(2, 4), p: ri(2, w - 2), q: ri(2, 5) } }
  if (kind === 'tri') return { kind, w: one([4, 6, 8, 10]), h: ri(2, 5), p: ri(2, 5), q: 0 }
  if (kind === 'semi') return { kind, w: one([4, 6, 8, 10]), h: ri(2, 5), p: 0, q: 0 }
  return { kind, w: ri(10, 14), h: ri(8, 11), p: ri(2, 3), q: 0 }
}

function parts(t: T) {
  const v1 = t.w * t.h
  if (t.kind === 'L') return { l1: 'مساحة المستطيل السفلي', l2: 'مساحة المستطيل العلوي', lt: 'المساحة الكلية', v1, v2: t.p * t.q, tot: v1 + t.p * t.q }
  if (t.kind === 'tri') return { l1: 'مساحة المستطيل', l2: 'مساحة المثلث', lt: 'المساحة الكلية', v1, v2: (t.w * t.p) / 2, tot: v1 + (t.w * t.p) / 2 }
  if (t.kind === 'semi') { const v2 = pi314((t.w / 2) ** 2) / 2; return { l1: 'مساحة المستطيل', l2: 'مساحة نصف الدائرة', lt: 'المساحة الكلية', v1, v2, tot: v1 + v2 } }
  const v2 = pi314(t.p * t.p)
  return { l1: 'مساحة المستطيل', l2: 'مساحة الدائرة (الفتحة)', lt: 'المساحة المظللة', v1, v2, tot: v1 - v2 }
}

const near = (v: number, e: number) => Math.abs(v - e) <= (Number.isInteger(e) ? 0.001 : 0.051)

function hint(t: T, which: 0 | 1 | 2, v: number): string {
  const pt = parts(t)
  if (which === 1) {
    if (t.kind === 'tri' && near(v, t.w * t.p)) return 'نسيتِ النصف 🔍 م = ½ × ق × ع.'
    if (t.kind === 'semi' && near(v, 2 * pt.v2)) return 'هاي الدائرة كاملة 🔍 المطلوب نصفها.'
    if (t.kind === 'semi' && near(v, pi314(t.w * t.w) / 2)) return 'استعملتِ القطر مكان نصف القطر 🔍 نق = ق ÷ ٢.'
    if (t.kind === 'hole' && near(v, pi314(4 * t.p * t.p))) return 'استعملتِ القطر مكان نصف القطر 🔍'
    return 'راجعي القانون وعوّضي بالقيم 🔍'
  }
  if (which === 2) {
    if (t.kind === 'hole' && near(v, pt.v1 + pt.v2)) return 'جمعتِ بدل ما تطرحي 🔍 المظلّل = المستطيل − الفتحة.'
    if (t.kind !== 'hole' && near(v, pt.v1) ) return 'هاي مساحة جزء واحد 🔍 اجمعي الجزأين.'
    return t.kind === 'hole' ? 'اطرحي مساحة الدائرة من المستطيل 🔍' : 'اجمعي مساحتي الجزأين 🔍'
  }
  return 'الطول × العرض 🔍'
}

function Drawing({ t }: { t: T }) {
  const txt = { fontSize: 12, fill: '#1e293b' }
  if (t.kind === 'L') {
    const s = 14, bx = 30, by = 150
    return (<>
      <rect x={bx} y={by - t.h * s} width={t.w * s} height={t.h * s} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
      <rect x={bx} y={by - t.h * s - t.q * s} width={t.p * s} height={t.q * s} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
      <text x={bx + (t.w * s) / 2} y={by + 14} textAnchor="middle" {...txt}>{n(t.w)}</text>
      <text x={bx + t.w * s + 6} y={by - (t.h * s) / 2} {...txt}>{n(t.h)}</text>
      <text x={bx + (t.p * s) / 2} y={by - t.h * s - t.q * s - 4} textAnchor="middle" {...txt}>{n(t.p)}</text>
      <text x={bx - 6} y={by - t.h * s - (t.q * s) / 2} textAnchor="end" {...txt}>{n(t.q)}</text>
    </>)
  }
  if (t.kind === 'tri') {
    const s = 13, bx = 40, by = 150, top = by - t.h * s
    return (<>
      <rect x={bx} y={top} width={t.w * s} height={t.h * s} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
      <polygon points={`${bx},${top} ${bx + t.w * s},${top} ${bx + (t.w * s) / 2},${top - t.p * s}`} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
      <line x1={bx + (t.w * s) / 2} y1={top} x2={bx + (t.w * s) / 2} y2={top - t.p * s} stroke="#ef4444" strokeDasharray="4 3" />
      <text x={bx + (t.w * s) / 2 + 4} y={top - (t.p * s) / 2} {...txt}>{n(t.p)}</text>
      <text x={bx + (t.w * s) / 2} y={by + 14} textAnchor="middle" {...txt}>{n(t.w)}</text>
      <text x={bx + t.w * s + 6} y={by - (t.h * s) / 2} {...txt}>{n(t.h)}</text>
    </>)
  }
  if (t.kind === 'semi') {
    const s = 13, bx = 40, by = 150, top = by - t.h * s, rs = ((t.w / 2) * s)
    return (<>
      <rect x={bx} y={top} width={t.w * s} height={t.h * s} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
      <path d={`M${bx},${top} A${rs},${rs} 0 0 1 ${bx + t.w * s},${top} Z`} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
      <text x={bx + (t.w * s) / 2} y={by + 14} textAnchor="middle" {...txt}>ق = {n(t.w)}</text>
      <text x={bx + t.w * s + 6} y={by - (t.h * s) / 2} {...txt}>{n(t.h)}</text>
    </>)
  }
  const s = 11, bx = 20, by = 150, cx = bx + (t.w * s) / 2, cy = by - (t.h * s) / 2
  return (<>
    <rect x={bx} y={by - t.h * s} width={t.w * s} height={t.h * s} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
    <circle cx={cx} cy={cy} r={t.p * s} fill="#fff" stroke="#7c3aed" strokeWidth={2} />
    <line x1={cx} y1={cy} x2={cx + t.p * s} y2={cy} stroke="#ef4444" strokeWidth={2} />
    <text x={cx + (t.p * s) / 2} y={cy - 4} textAnchor="middle" {...txt}>نق = {n(t.p)}</text>
    <text x={bx + (t.w * s) / 2} y={by + 14} textAnchor="middle" {...txt}>{n(t.w)}</text>
    <text x={bx + t.w * s + 6} y={by - (t.h * s) / 2} {...txt}>{n(t.h)}</text>
  </>)
}

export default function ShapeSplit({ onDone, props }: WidgetProps) {
  const kinds = (props?.kinds as Kind[] | undefined) ?? ['L', 'tri', 'semi', 'hole']
  const [tasks] = useState(() => kinds.map(gen))
  const [i, setI] = useState(0)
  const [vals, setVals] = useState(['', '', ''])
  const [res, setRes] = useState<string[] | null>(null)
  const t = tasks[i], pt = parts(t), last = i === tasks.length - 1
  const exact = [pt.v1, pt.v2, pt.tot]
  const ok = res !== null && res.every((r) => r === '')
  const title = t.kind === 'L' ? 'قصّي الشكل لمستطيلين' : t.kind === 'tri' ? 'مستطيل + مثلث' : t.kind === 'semi' ? 'مستطيل + نصف دائرة (ط ≈ ٣٫١٤)' : 'مستطيل − دائرة (ط ≈ ٣٫١٤)'

  const check = () => setRes(exact.map((e, k) => {
    const v = toNum(vals[k])
    if (!Number.isFinite(v)) return 'اكتبي رقماً.'
    return near(v, e) ? '' : hint(t, k as 0 | 1 | 2, v)
  }))
  const next = () => { if (last) onDone(); else { setI(i + 1); setVals(['', '', '']); setRes(null) } }
  const labels = [pt.l1, pt.l2, pt.lt]

  return (
    <div className="card">
      <div className="q-prompt">{title} ✂️ ({n(i + 1)} من {n(tasks.length)})</div>
      <svg viewBox="0 0 260 165" style={{ width: '100%' }}><Drawing t={t} /></svg>
      <div className="mut">القياسات بالسنتيمتر. قرّبي لأقرب عُشر إن لزم.</div>
      {labels.map((l, k) => (
        <div key={k} style={{ margin: '6px 0' }}>
          {l}: <input inputMode="decimal" value={vals[k]} disabled={ok} style={{ width: 90 }}
            onChange={(e) => { const v = [...vals]; v[k] = e.target.value; setVals(v); setRes(null) }} /> سم²
          {res && res[k] && <div className="fb no">{res[k]}</div>}
        </div>
      ))}
      {!ok && <button className="btn" onClick={check}>تحقّقي ✔️</button>}
      {ok && (<>
        <div className="fb ok">ممتاز ✅ {pt.lt} ≈ {f1(pt.tot)} سم²</div>
        <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'شكل تاني ➡️'}</button>
      </>)}
    </div>
  )
}