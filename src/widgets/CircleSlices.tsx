import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { rad } from '../lib/geo'

const P = (p: number[][]) => p.map((q) => q.join(',')).join(' ')
const NS = [4, 8, 16, 32, 64]

export default function CircleSlices({ onDone }: WidgetProps) {
  const [nn, setNn] = useState(4)
  const [big, setBig] = useState(false)
  const R = 45, cx = 55, cy = 60
  const pt = (deg: number) => [cx + R * Math.sin(rad(deg)), cy - R * Math.cos(rad(deg))]
  const b = 2 * R * Math.sin(Math.PI / nn), hh = R * Math.cos(Math.PI / nn)
  const top = 60 - hh / 2, bot = 60 + hh / 2, x0 = 125

  return (
    <div className="card">
      <div className="q-prompt">نقصّ الدائرة لقطاعات ونرتّبها جنب بعض 🍕</div>
      <svg viewBox="0 0 300 120" style={{ width: '100%' }}>
        {Array.from({ length: nn }, (_, k) => {
          const a0 = (k * 360) / nn, a1 = ((k + 1) * 360) / nn
          const [x1, y1] = pt(a0), [x2, y2] = pt(a1)
          return <path key={k} d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`} fill={k % 2 ? '#c4b5fd' : '#fcd34d'} stroke="#fff" strokeWidth={0.6} />
        })}
        {Array.from({ length: nn }, (_, k) => {
          const x = x0 + (k * b) / 2
          const pts = k % 2 === 0 ? [[x, bot], [x + b, bot], [x + b / 2, top]] : [[x, top], [x + b, top], [x + b / 2, bot]]
          return <polygon key={k} points={P(pts)} fill={k % 2 ? '#c4b5fd' : '#fcd34d'} stroke="#fff" strokeWidth={0.6} />
        })}
      </svg>
      <div className="row">
        {NS.map((v) => (
          <button key={v} className={'btn' + (v === nn ? '' : ' alt')}
            onClick={() => { setNn(v); if (v >= 32) setBig(true) }}>{ad(String(v))} قطاعاً</button>
        ))}
      </div>
      <div className="fb" style={{ marginTop: 8 }}>
        كل ما زاد عدد القطاعات، بيقترب الشكل من <b>متوازي أضلاع</b>.
        {nn >= 16 && <>{'\n'}القاعدة ≈ نصف المحيط = ½ × (٢ ط نق) = <b>ط نق</b>، والارتفاع ≈ <b>نق</b>.</>}
        {nn >= 32 && <>{'\n'}المساحة = القاعدة × الارتفاع = ط نق × نق = <b>ط نق²</b> 🎉</>}
      </div>
      {big && <button className="btn" onClick={onDone}>فهمت ✅</button>}
    </div>
  )
}