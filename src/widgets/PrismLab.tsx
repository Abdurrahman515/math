import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { f1 } from '../lib/measure'
import { Slider } from '../components/Slider'

const n = (x: number) => ad(String(x))

export default function PrismLab({ onDone, props }: WidgetProps) {
  const tri = props?.mode === 'tri'
  const targets = (props?.targets as number[] | undefined) ?? [24, 36]
  const [l, setL] = useState(3)
  const [w, setW] = useState(2)
  const [h, setH] = useState(2)
  const [ti, setTi] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [b, setB] = useState(6)
  const [t, setT] = useState(4)
  const [H, setHH] = useState(5)
  const [moved, setMoved] = useState(0)
  const mv = (f: (v: number) => void) => (v: number) => { f(v); setMoved((m) => m + 1) }

  if (tri) {
    const s = 12, base = (b * t) / 2
    return (
      <div className="card">
        <div className="q-prompt">منشور ثلاثي: القاعدة مثلث، والمنشور له ارتفاع تاني 🔺</div>
        <svg viewBox="0 0 260 170" style={{ width: '100%' }}>
          <polygon points={`10,${10 + t * s} ${10 + b * s},${10 + t * s} ${10 + b * s * 0.35},10`} fill="#c4b5fd" stroke="#7c3aed" strokeWidth={2} />
          <line x1={10 + b * s * 0.35} y1={10} x2={10 + b * s * 0.35} y2={10 + t * s} stroke="#ef4444" strokeDasharray="4 3" />
          <text x={10 + b * s * 0.35 + 4} y={10 + (t * s) / 2} fontSize={12}>ع المثلث = {n(t)}</text>
          <text x={10 + (b * s) / 2} y={10 + t * s + 14} fontSize={12} textAnchor="middle">ق = {n(b)}</text>
          <rect x={10} y={10 + t * s + 24} width={H * s} height={14} fill="#fde68a" stroke="#d97706" />
          <text x={10 + H * s + 6} y={10 + t * s + 36} fontSize={12}>ارتفاع المنشور = {n(H)}</text>
        </svg>
        <Slider label="قاعدة المثلث ق" value={b} min={2} max={10} onChange={mv(setB)} />
        <Slider label="ارتفاع المثلث" value={t} min={2} max={8} onChange={mv(setT)} />
        <Slider label="ارتفاع المنشور" value={H} min={2} max={10} onChange={mv(setHH)} />
        <div className="fb ok">
          مساحة القاعدة = ½ × {n(b)} × {n(t)} = {f1(base)} سم²{'\n'}
          الحجم = مساحة القاعدة × ارتفاع المنشور = {f1(base)} × {n(H)} = <b>{f1(base * H)} سم³</b>
        </div>
        {moved >= 3 && <button className="btn" onClick={onDone}>فهمت ✅</button>}
      </div>
    )
  }

  const layer = l * w, V = layer * h, u = 14
  const check = () => {
    if (V === targets[ti]) setMsg({ ok: true, t: `✅ ${n(l)} × ${n(w)} × ${n(h)} = ${n(V)}. ممكن في صناديق تانية بنفس الحجم، جرّبي!` })
    else setMsg({ ok: false, t: `حجم صندوقك ${n(V)} ${V > targets[ti] ? '(أكبر من المطلوب)' : '(أقل من المطلوب)'} 🔍 غيّري الأبعاد.` })
  }
  const next = () => { if (ti === targets.length - 1) onDone(); else { setTi(ti + 1); setMsg(null) } }
  return (
    <div className="card">
      <div className="q-prompt">ابني صندوقاً حجمه <b>{n(targets[ti])}</b> سم³ 📦 ({n(ti + 1)} من {n(targets.length)})</div>
      <svg viewBox="0 0 260 125" style={{ width: '100%' }}>
        {Array.from({ length: l * w }, (_, k) => (
          <rect key={k} x={10 + (k % l) * u} y={10 + Math.floor(k / l) * u} width={u} height={u} fill="#ddd6fe" stroke="#7c3aed" />
        ))}
        {Array.from({ length: h }, (_, k) => (
          <g key={k}>
            <rect x={150} y={108 - k * 16} width={95} height={13} rx={3} fill="#c4b5fd" stroke="#7c3aed" />
            <text x={197} y={118 - k * 16} fontSize={10} textAnchor="middle">{n(layer)}</text>
          </g>
        ))}
      </svg>
      <Slider label="الطول" value={l} min={1} max={8} onChange={(v) => { setL(v); setMsg(null) }} />
      <Slider label="العرض" value={w} min={1} max={6} onChange={(v) => { setW(v); setMsg(null) }} />
      <Slider label="الارتفاع (عدد الطبقات)" value={h} min={1} max={6} onChange={(v) => { setH(v); setMsg(null) }} />
      <div className="mut">الطبقة الواحدة = {n(l)} × {n(w)} = {n(layer)} مكعب · {n(h)} طبقات · الحجم = {n(layer)} × {n(h)} = {n(V)} سم³</div>
      {!msg?.ok && <button className="btn" onClick={check}>تحقّقي ✔️</button>}
      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}>{msg.t}</div>}
      {msg?.ok && <button className="btn" onClick={next}>{ti === targets.length - 1 ? 'تمام ✅' : 'حجم تاني ➡️'}</button>}
    </div>
  )
}