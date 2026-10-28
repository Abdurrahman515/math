import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Plane } from '../components/Plane'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))

// eslint-disable-next-line
export const region = (x: number, y: number) =>
  x === 0 && y === 0 ? 'نقطة الأصل'
  : y === 0 ? 'على محور السينات'
  : x === 0 ? 'على محور الصادات'
  : x > 0 && y > 0 ? 'الربع الأول'
  : x < 0 && y > 0 ? 'الربع الثاني'
  : x < 0 ? 'الربع الثالث' : 'الربع الرابع'

export default function PlaneExplorer({ onDone }: WidgetProps) {
  const [p, setP] = useState<{ x: number; y: number } | null>(null)
  const [seen, setSeen] = useState<string[]>([])

  const go = (x: number, y: number) => {
    setP({ x, y })
    const r = region(x, y)
    const s = seen.includes(r) ? seen : [...seen, r]
    setSeen(s)
    if (s.length >= 4) onDone()
  }

  const steps = p && [
    p.x !== 0 && `${ar(Math.abs(p.x))} وحدات ${p.x > 0 ? 'لليمين ➡️' : 'لليسار ⬅️'}`,
    p.y !== 0 && `${ar(Math.abs(p.y))} وحدات ${p.y > 0 ? 'لفوق ⬆️' : 'لتحت ⬇️'}`,
  ].filter(Boolean)

  return (
    <div className="card center">
      <h3 className="h3">🗺️ استكشفي المستوى</h3>
      <Plane quadrants points={p ? [{ ...p, color: '#dc2626' }] : []} walk={p} onPick={go} />
      {!p ? (
        <div className="mut">👆 اضغطي على أي تقاطع بالشبكة</div>
      ) : (
        <div>
          <div className="bigline"><Rich t={`$(${sg(p.x)}، ${sg(p.y)})$`} /> ← {region(p.x, p.y)}</div>
          <div className="mut">من نقطة الأصل: {steps && steps.length ? steps.join(' ثم ') : 'ما تحرّكنا، نحن على الأصل'}</div>
        </div>
      )}
      <div className="mut">اكتشفتي {ar(seen.length)} من المناطق (لازم ٤ على الأقل)</div>
    </div>
  )
}