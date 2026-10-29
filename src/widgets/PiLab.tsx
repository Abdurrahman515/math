import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { pi314 } from '../lib/measure'
import { f2 } from '../lib/geo'
import { Slider } from '../components/Slider'

const COL = ['#c4b5fd', '#86efac', '#fcd34d']

export default function PiLab({ onDone }: WidgetProps) {
  const [d, setD] = useState(5)
  const [step, setStep] = useState(0)
  const s = 8, r = (d * s) / 2
  const msg = [
    'الدائرة قطرها ق. نفرد القطر على محيطها مرة بعد مرة 👇',
    'القطر الأول ✅',
    'القطر الثاني ✅ بعدنا ما غطّينا المحيط كله…',
    'القطر الثالث ✅ وضل جزء صغير!',
    `الجزء الباقي ≈ ٠٫١٤ من القطر. إذن المحيط ≈ ٣ أقطار + ٠٫١٤ قطر = ٣٫١٤ × ${ad(String(d))} = ${f2(pi314(d))} سم`,
  ]
  return (
    <div className="card">
      <div className="q-prompt">كم قطراً بيلزم لنلف حول الدائرة؟ 🔵</div>
      <svg viewBox="0 0 300 175" style={{ width: '100%' }}>
        <circle cx={20 + r} cy={10 + r} r={r} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2} />
        <line x1={20} y1={10 + r} x2={20 + 2 * r} y2={10 + r} stroke="#ef4444" strokeWidth={2} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={20 + i * d * s} y={120} width={d * s} height={22} fill={step > i ? COL[i] : 'none'}
              stroke="#94a3b8" strokeDasharray={step > i ? undefined : '4 3'} />
            {step > i && <text x={20 + i * d * s + (d * s) / 2} y={135} textAnchor="middle" fontSize={12}>ق</text>}
          </g>
        ))}
        <rect x={20 + 3 * d * s} y={120} width={0.14 * d * s} height={22} fill={step >= 4 ? '#fb923c' : 'none'}
          stroke="#94a3b8" strokeDasharray={step >= 4 ? undefined : '3 2'} />
      </svg>
      <Slider label="قطر الدائرة" value={d} min={2} max={10} onChange={setD} />
      <div className={'fb' + (step === 4 ? ' ok' : '')}>{msg[step]}</div>
      {step < 4
        ? <button className="btn" onClick={() => setStep(step + 1)}>📏 افرِدي القطر</button>
        : <button className="btn" onClick={onDone}>تمام ✅</button>}
    </div>
  )
}