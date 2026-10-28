import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

const clean = (x: number) => Math.round(x * 1e6) / 1e6
const show = (x: number) => toArabicDigits(String(clean(x)).replace('.', '٫'))

export default function BounceDraw({ onDone, props }: WidgetProps) {
  const H = (props?.H as number | undefined) ?? 12
  const n = (props?.n as number | undefined) ?? 4
  const [b, setB] = useState(0)
  const scale = 100 / H
  const finished = b === n

  return (
    <div className="card">
      <div className="q-prompt">
        كرة سقطت من {show(H)} م وكل مرة بترتد لنصف الارتفاع 🏀
        <br />اضغطي لترسمي الارتداد التالي:
      </div>
      <svg viewBox="0 0 340 150" style={{ width: '100%', maxWidth: 360 }}>
        <line x1="5" y1="130" x2="335" y2="130" stroke="currentColor" strokeWidth="2" />
        {Array.from({ length: b + 1 }, (_, k) => {
          const h = (H / 2 ** k) * scale
          const x = 20 + k * 62
          return (
            <g key={k}>
              <rect x={x} y={130 - h} width="34" height={h} rx="6" fill={k === 0 ? '#c4b5fd' : '#8b5cf6'} opacity="0.85" />
              <text x={x + 17} y={124 - h} textAnchor="middle" fontSize="12" fill="currentColor">
                {show(H / 2 ** k)} م
              </text>
              <text x={x + 17} y="146" textAnchor="middle" fontSize="11" fill="currentColor">
                {k === 0 ? 'الإلقاء' : `ارتداد ${toArabicDigits(k)}`}
              </text>
            </g>
          )
        })}
      </svg>
      {!finished ? (
        <button className="btn" onClick={() => setB(b + 1)}>ارتداد جديد ⬆️</button>
      ) : (
        <>
          <div className="fb ok">
            برافو عليكِ! 🎉 بعد الارتداد {toArabicDigits(n)} بتوصل الكرة لارتفاع <b>{show(H / 2 ** n)} م</b>
          </div>
          <button className="btn" onClick={onDone}>تمام ✅</button>
        </>
      )}
    </div>
  )
}