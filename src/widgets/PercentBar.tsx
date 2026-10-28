import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { dec } from '../lib/dec'

type P = { pct: number; whole: number; unit?: string }
const DEF: P[] = [{ pct: 30, whole: 50, unit: 'ريال' }]
const H = 240
const col = { position: 'relative', height: H } as const
const val = (whole: number, t: number) => ad(dec((whole * t) / 100))

export default function PercentBar({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [lv, setLv] = useState(0)
  const p = problems[i]
  const unit = p.unit ?? 'ريال'
  const hit = lv === p.pct
  const last = i === problems.length - 1
  const move = (d: number) => setLv(Math.max(0, Math.min(100, lv + d)))
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setLv(0) }
  }
  const ticks = Array.from({ length: 11 }, (_, k) => k * 10)
  const lab = (t: number) => ({
    position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 13, bottom: `calc(${t}% - 9px)`,
  }) as const

  return (
    <div className="card">
      <div className="q-prompt">
        ظلّلي المستطيل لحد <b>{ad(p.pct)}٪</b> وشوفي شو بيقابلها على الجنب التاني 👀
        <br />
        (الكل = {ad(p.whole)} {unit})
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '14px 0' }}>
        <div style={{ ...col, width: 52 }}>
          {ticks.map((t) => <span key={t} style={lab(t)}>{ad(t)}٪</span>)}
        </div>
        <div style={{ ...col, width: 70, border: '2px solid currentColor', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${lv}%`, background: 'rgba(124,58,237,.45)', transition: 'height .25s' }} />
          {ticks.slice(1, 10).map((t) => (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, bottom: `${t}%`, borderTop: '1px solid currentColor', opacity: 0.25 }} />
          ))}
        </div>
        <div style={{ ...col, width: 64 }}>
          {ticks.map((t) => <span key={t} style={lab(t)}>{val(p.whole, t)}</span>)}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 18, marginBottom: 8 }}>
        {ad(lv)}٪ من {ad(p.whole)} = <b>{val(p.whole, lv)}</b> {unit}
      </div>
      {!hit && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0' }}>
          <button className="btn" onClick={() => move(-5)}>− ٥٪</button>
          <button className="btn" onClick={() => move(5)}>+ ٥٪</button>
          <button className="btn" onClick={() => move(10)}>+ ١٠٪</button>
        </div>
      )}
      {!hit && lv > p.pct && <div className="fb no">تجاوزتي {ad(p.pct)}٪ 😅 ارجعي لورا شوي.</div>}
      {!hit && lv < p.pct && lv > 0 && <div className="fb tip">كمّلي، لسا ما وصلتي 💪</div>}
      {hit && (
        <>
          <div className="fb ok">
            برافو! 🎉 {ad(p.pct)}٪ من {ad(p.whole)} = <b>{val(p.whole, p.pct)}</b> {unit} ✔️
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}