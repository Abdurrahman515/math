import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'
import { Rich } from '../components/Rich'

export default function RectLab({ props, onDone }: WidgetProps) {
  const fp = props?.fixedPerimeter
  const fixed = typeof fp === 'number' && Number.isInteger(fp) && fp >= 8 && fp <= 40 && fp % 2 === 0 ? fp : null
  const half = fixed ? fixed / 2 : 0

  const [l, setL] = useState(fixed ? Math.max(1, Math.floor(half / 4)) : 6)
  const [wFree, setWFree] = useState(3)
  const [moves, setMoves] = useState(0)
  const [finished, setFinished] = useState(false)

  const w = fixed ? half - l : wFree
  const P = 2 * (l + w)
  const A = l * w
  const best = fixed ? Math.floor(half / 2) * Math.ceil(half / 2) : 0

  const cell = Math.min(24, Math.floor(260 / Math.max(l, w)))
  const W = l * cell + 70
  const H = w * cell + 50

  const changeL = (v: number) => { setL(v); setMoves(moves + 1) }
  const changeW = (v: number) => { setWFree(v); setMoves(moves + 1) }

  const end = () => {
    if (!finished) {
      setFinished(true)
      onDone()
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">📏 مختبر المستطيل</h3>
      <div className="mut">
        {fixed
          ? toArabicDigits(`سلك طوله ${fixed} سم صنعنا منه مستطيلاً. غيّري الطول وراقبي كيف بتتغير المساحة.`)
          : 'غيّري الطول والعرض وراقبي المحيط والمساحة.'}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 380, margin: '12px auto', display: 'block' }}>
        <rect x={30} y={14} width={l * cell} height={w * cell} fill="#cfe3ff" stroke="#5b5bd6" strokeWidth={2.5} />
        {Array.from({ length: l + 1 }, (_, i) => (
          <line key={`v${i}`} x1={30 + i * cell} y1={14} x2={30 + i * cell} y2={14 + w * cell} stroke="#8fb0e8" strokeWidth={1} />
        ))}
        {Array.from({ length: w + 1 }, (_, i) => (
          <line key={`h${i}`} x1={30} y1={14 + i * cell} x2={30 + l * cell} y2={14 + i * cell} stroke="#8fb0e8" strokeWidth={1} />
        ))}
        <text x={30 + (l * cell) / 2} y={H - 12} textAnchor="middle" fontSize={15} fill="var(--ink)">
          {toArabicDigits(`ل = ${l}`)}
        </text>
        <text x={30 + l * cell + 8} y={14 + (w * cell) / 2 + 5} fontSize={15} fill="var(--ink)">
          {toArabicDigits(`ض = ${w}`)}
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <label className="mut">
          {fixed ? 'الطول ل: ' : 'الطول ل: '}
          <input
            type="range" min={1} max={fixed ? half - 1 : 12} value={l}
            onChange={(e) => changeL(Number(e.target.value))}
            aria-label="الطول"
          />
        </label>
        {!fixed && (
          <label className="mut">
            العرض ض:{' '}
            <input
              type="range" min={1} max={12} value={w}
              onChange={(e) => changeW(Number(e.target.value))}
              aria-label="العرض"
            />
          </label>
        )}
      </div>

      <div className="expr" style={{ marginTop: 14, fontSize: 18 }}>
        {toArabicDigits(`مح = ٢ × (ل + ض) = ٢ × (${l} + ${w}) = ${P}`)}
      </div>
      <div className="expr" style={{ fontSize: 18 }}>
        {toArabicDigits(`م = ل × ض = ${l} × ${w} = ${A}`)}
      </div>

      {fixed && A === best && (
        <div className="fb ok">🌟 هاي أكبر مساحة ممكنة! لاحظي: الطول والعرض صاروا متساويين (أو أقرب ما يمكن).</div>
      )}

      {moves >= 4 && !finished && (
        <button className="btn" style={{ marginTop: 12 }} onClick={end}>أنهيت الاستكشاف ✔️</button>
      )}
      {finished && (
        <div className="fb ok">
          <Rich 
            t={fixed
              ? '🎉 المحيط بقي ثابت، بس المساحة تغيّرت! وكانت أكبر ما يمكن لما صار الشكل مربعاً.'
              : '🎉 المحيط بيقيس الطريق **حول** الشكل، والمساحة بتقيس عدد المربعات **جوّاته**.'}
          />
        </div>
      )}
    </div>
  )
}