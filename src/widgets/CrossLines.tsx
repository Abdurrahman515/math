import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { rad } from '../lib/geo'
import { shuffle } from '../lib/rng'

const CX = 150, CY = 100
const xy = (deg: number, r: number): [number, number] => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))]
const sector = (a: number, b: number, r: number) => {
  const [x0, y0] = xy(a, r), [x1, y1] = xy(b, r)
  return `M${CX},${CY} L${x0},${y0} A${r},${r} 0 0 0 ${x1},${y1} Z`
}
const PAIRS: [number, number][] = [[1, 2], [2, 3], [3, 4], [4, 1], [1, 3], [2, 4]]
const n = (x: number) => ad(String(x))

export default function CrossLines({ onDone }: WidgetProps) {
  const [th, setTh] = useState(60)
  const [quiz, setQuiz] = useState<[number, number][] | null>(null)
  const [qi, setQi] = useState(0)
  const [fb, setFb] = useState<{ ok: boolean; t: string } | null>(null)

  const spans: [number, number][] = [[0, th], [th, 180], [180, 180 + th], [180 + th, 360]]
  const meas = [th, 180 - th, th, 180 - th]
  const cur = quiz ? quiz[qi] : null
  const [l1a, l1b] = [xy(0, 125), xy(180, 125)]
  const [l2a, l2b] = [xy(th, 95), xy(th + 180, 95)]

  const answer = (vert: boolean) => {
    if (!cur) return
    const [a, b] = cur
    const isV = Math.abs(a - b) === 2
    if (vert === isV)
      setFb({ ok: true, t: isV ? `صح! ∠${n(a)} و∠${n(b)} مقابل بعض وما بيتشاركوا ضلع ✔️` : `صح! ∠${n(a)} و∠${n(b)} جنب بعض: رأس مشترك وضلع مشترك ✔️` })
    else
      setFb({ ok: false, t: isV ? `∠${n(a)} و∠${n(b)} ما بيتشاركوا ضلع، هني مقابل بعض: متقابلتان بالرأس 🔍` : `∠${n(a)} و∠${n(b)} جنب بعض وبيتشاركوا ضلع: متجاورتان 🔍` })
  }
  const next = () => {
    if (!quiz) return
    if (qi === quiz.length - 1) onDone()
    else { setQi(qi + 1); setFb(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">{quiz ? `ما هي العلاقة؟ (${n(qi + 1)} من ٣)` : 'حرّكي المستقيم المائل وراقبي الزوايا الأربع 🔀'}</div>
      <svg viewBox="0 0 300 200" style={{ width: '100%' }}>
        {spans.map(([a, b], k) => {
          const asked = cur && (cur[0] === k + 1 || cur[1] === k + 1)
          const [tx, ty] = xy((a + b) / 2, 26)
          return (
            <g key={k}>
              <path d={sector(a, b, 44)} fill={asked ? '#fca5a5' : k % 2 === 0 ? '#fde68a' : '#bfdbfe'} opacity={0.9} />
              <text x={tx} y={ty + 4} textAnchor="middle" fontSize={13} fill="#1e293b">{n(k + 1)}</text>
            </g>
          )
        })}
        <line x1={l1a[0]} y1={l1a[1]} x2={l1b[0]} y2={l1b[1]} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
        <line x1={l2a[0]} y1={l2a[1]} x2={l2b[0]} y2={l2b[1]} stroke="#7c3aed" strokeWidth={3} strokeLinecap="round" />
      </svg>
      {!quiz ? (
        <>
          <input type="range" min={20} max={160} step={1} value={th} onChange={(e) => setTh(Number(e.target.value))} style={{ width: '100%' }} />
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            ∠١ = {n(meas[0])}° ، ∠٢ = {n(meas[1])}° ، ∠٣ = {n(meas[2])}° ، ∠٤ = {n(meas[3])}°
          </div>
          <div style={{ textAlign: 'center' }}>شو لاحظتِ على الزوايا اللي بنفس اللون؟ 🤔</div>
          <button className="btn" onClick={() => { setQuiz(shuffle(PAIRS).slice(0, 3)); setQi(0); setFb(null) }}>جاهزة للأسئلة ➡️</button>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', margin: '6px 0' }}>الزاويتان المظلّلتان بالأحمر: ∠{n(cur![0])} و∠{n(cur![1])}</div>
          {fb && <div className={fb.ok ? 'fb ok' : 'fb no'}>{fb.t}</div>}
          {fb?.ok ? (
            <button className="btn" onClick={next}>{qi === 2 ? 'تمام ✅' : 'التالي ➡️'}</button>
          ) : (
            <div>
              <button className="btn" onClick={() => answer(true)}>متقابلتان بالرأس</button>{' '}
              <button className="btn" onClick={() => answer(false)}>متجاورتان</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}