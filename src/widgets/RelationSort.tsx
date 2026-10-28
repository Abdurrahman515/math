import { useState } from 'react'
import type { WidgetProps } from '../types'

type Kind = 'pos' | 'neg' | 'none'
type Round = { kind: Kind; title: string; xl: string; yl: string }
const POS: [number, number][] = [[1, 1.5], [2, 2.5], [2.5, 2], [3.5, 4], [4.5, 4], [5, 6], [6, 5.5], [7, 7.5], [8, 8], [9, 9]]
const SETS: Record<Kind, [number, number][]> = {
  pos: POS,
  neg: POS.map(([x, y]) => [x, 10 - y] as [number, number]),
  none: [[1, 6], [2, 2], [3, 8.5], [4, 4], [5, 9], [5.5, 1.5], [6.5, 7], [7.5, 3], [8.5, 5.5], [9, 8]],
}
const NAMES: Record<Kind, string> = { pos: 'علاقة طردية', neg: 'علاقة عكسية', none: 'لا توجد علاقة' }
const WHY: Record<Kind, string> = {
  pos: 'النقاط بتصعد من اليسار لليمين: لما تزيد س بتزيد ص 📈',
  neg: 'النقاط بتنزل من اليسار لليمين: لما تزيد س بتنقص ص 📉',
  none: 'النقاط مشتتة وما في اتجاه واضح، يعني ما في ارتباط 🔀',
}
const DEF: Round[] = [{ kind: 'pos', title: 'مثال', xl: 'س', yl: 'ص' }]
const gx = (x: number) => 40 + x * 26
const gy = (y: number) => 215 - y * 19

export default function RelationSort({ onDone, props }: WidgetProps) {
  const rounds = (props?.rounds as Round[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<Kind | null>(null)
  const r = rounds[i]
  const last = i === rounds.length - 1
  const ok = pick === r.kind
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setPick(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">أيّ علاقة بتشوفي بين «{r.title}»؟ 🔎</div>
      <svg viewBox="0 0 300 250" style={{ width: '100%', maxWidth: 360, display: 'block', margin: '0 auto' }}>
        <line x1={40} y1={215} x2={290} y2={215} stroke="currentColor" strokeWidth={2} />
        <line x1={40} y1={215} x2={40} y2={15} stroke="currentColor" strokeWidth={2} />
        {[2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line x1={gx(v)} y1={20} x2={gx(v)} y2={215} stroke="currentColor" opacity={0.12} />
            <line x1={40} y1={gy(v)} x2={285} y2={gy(v)} stroke="currentColor" opacity={0.12} />
          </g>
        ))}
        <text x={165} y={240} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">{r.xl}</text>
        <text x={60} y={12} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">{r.yl}</text>
        {SETS[r.kind].map(([x, y], k) => <circle key={k} cx={gx(x)} cy={gy(y)} r={6} fill="#5b5bd6" stroke="#fff" strokeWidth={1.5} />)}
      </svg>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
        {(['pos', 'neg', 'none'] as Kind[]).map((k) => (
          <button key={k} className="btn" onClick={() => setPick(k)}>{NAMES[k]}</button>
        ))}
      </div>
      {pick && !ok && <div className="fb no">مو هيك 😅 فكّري باتجاه النقاط من اليسار لليمين.</div>}
      {ok && (
        <>
          <div className="fb ok">برافو! 🎉 {WHY[r.kind]}</div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'رسم تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}