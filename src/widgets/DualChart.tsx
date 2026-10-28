import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type Series = { name: string; values: number[] }
const W = 560, H = 280, L = 46, T = 16, B = 40
const CA = '#2563eb', CB = '#ef4444'

export default function DualChart({ onDone, props }: WidgetProps) {
  const cats = (props?.cats as string[] | undefined) ?? ['أ', 'ب']
  const a = (props?.a as Series | undefined) ?? { name: 'الأولى', values: [10, 20] }
  const b = (props?.b as Series | undefined) ?? { name: 'الثانية', values: [20, 10] }
  const title = props?.title as string | undefined
  const [view, setView] = useState<'bars' | 'lines'>('bars')
  const [seen, setSeen] = useState<string[]>(['bars'])
  const [sel, setSel] = useState<number | null>(null)

  const n = cats.length
  const top = Math.max(...a.values, ...b.values)
  const maxV = Math.ceil(top / 20) * 20
  const stepV = maxV / 4
  const gw = (W - L - 10) / n
  const y = (v: number) => T + (H - T - B) * (1 - v / maxV)
  const cx = (k: number) => L + gw * k + gw / 2

  const pick = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const k = Math.floor((vx - L) / gw)
    if (k >= 0 && k < n) setSel(k)
  }
  const go = (v: 'bars' | 'lines') => { setView(v); if (!seen.includes(v)) setSeen([...seen, v]) }
  const ready = seen.length === 2 && sel !== null

  return (
    <div className="card">
      {title && <div className="q-prompt">{title}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
        <button className="btn" onClick={() => go('bars')}>📊 أعمدة مزدوجة</button>
        <button className="btn" onClick={() => go('lines')}>📈 خطوط مزدوجة</button>
      </div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', fontSize: 14 }}>
        <span><b style={{ color: CA }}>■</b> {a.name}</span>
        <span><b style={{ color: CB }}>■</b> {b.name}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} onClick={pick} style={{ width: '100%', cursor: 'pointer' }}>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={L} y1={y(k * stepV)} x2={W - 10} y2={y(k * stepV)} stroke="currentColor" opacity={0.15} />
            <text x={L - 18} y={y(k * stepV) + 4} textAnchor="middle" fontSize={12} fill="currentColor">{ad(k * stepV)}</text>
          </g>
        ))}
        {sel !== null && <rect x={L + gw * sel} y={T} width={gw} height={H - T - B} fill="rgba(124,58,237,.1)" />}
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="currentColor" strokeWidth={2} />
        <line x1={L} y1={H - B} x2={W - 10} y2={H - B} stroke="currentColor" strokeWidth={2} />
        {cats.map((c, k) => <text key={k} x={cx(k)} y={H - B + 20} textAnchor="middle" fontSize={12} fill="currentColor">{c}</text>)}

        {view === 'bars' && cats.map((_, k) => (
          <g key={k}>
            <rect x={cx(k) - gw * 0.3} y={y(a.values[k])} width={gw * 0.28} height={H - B - y(a.values[k])} fill={CA} />
            <rect x={cx(k) + gw * 0.02} y={y(b.values[k])} width={gw * 0.28} height={H - B - y(b.values[k])} fill={CB} />
          </g>
        ))}
        {view === 'lines' && (
          <>
            <polyline points={a.values.map((v, k) => `${cx(k)},${y(v)}`).join(' ')} fill="none" stroke={CA} strokeWidth={3} />
            <polyline points={b.values.map((v, k) => `${cx(k)},${y(v)}`).join(' ')} fill="none" stroke={CB} strokeWidth={3} />
            {a.values.map((v, k) => <circle key={`a${k}`} cx={cx(k)} cy={y(v)} r={5} fill={CA} />)}
            {b.values.map((v, k) => <circle key={`b${k}`} cx={cx(k)} cy={y(v)} r={5} fill={CB} />)}
          </>
        )}
      </svg>
      {sel === null ? (
        <div className="fb tip">اضغطي على أي يوم لتشوفي القيمتين 👆</div>
      ) : (
        <div className="fb ok">
          {cats[sel]}: {a.name} = <b>{ad(a.values[sel])}</b> و{b.name} = <b>{ad(b.values[sel])}</b>
          {' '}← الفرق = {ad(Math.abs(a.values[sel] - b.values[sel]))}
        </div>
      )}
      {seen.length < 2 && <div className="fb tip">جرّبي الشكلين (أعمدة وخطوط) 🔄</div>}
      {ready && <button className="btn" onClick={onDone}>تمام ✅</button>}
    </div>
  )
}