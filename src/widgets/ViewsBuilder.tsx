import { useState, type JSX } from 'react'
import type { WidgetProps } from '../types'

const COLS = 3, DEPTH = 2, MAXH = 3
type Grid = number[][] // [العمق][العمود]
const TARGETS: Grid[] = [
  [[1, 2, 3], [0, 0, 0]],
  [[2, 0, 1], [2, 1, 1]],
  [[3, 1, 0], [1, 0, 0]],
]
type Cell = [number, number]
const top = (g: Grid): Cell[] => g.flatMap((row, d) => row.flatMap((v, c) => (v > 0 ? [[c, d] as Cell] : [])))
const front = (g: Grid): Cell[] => Array.from({ length: COLS }, (_, c) => {
  const m = Math.max(...g.map((r) => r[c])); return Array.from({ length: m }, (_, k) => [c, k] as Cell)
}).flat()
const side = (g: Grid): Cell[] => g.flatMap((row, d) => Array.from({ length: Math.max(...row) }, (_, k) => [d, k] as Cell))
const key = (cs: Cell[]) => cs.map((c) => c.join(',')).sort().join('|')

function Mini({ cells, cols, rows, u = 13 }: { cells: Cell[]; cols: number; rows: number; u?: number }) {
  const on = new Set(cells.map((c) => c.join(',')))
  return (
    <svg viewBox={`0 0 ${cols * u + 2} ${rows * u + 2}`} style={{ width: cols * u * 1.4 }}>
      {Array.from({ length: rows }).flatMap((_, y) => Array.from({ length: cols }).map((__, x) => (
        <rect key={`${x}-${y}`} x={1 + x * u} y={1 + (rows - 1 - y) * u} width={u} height={u}
          fill={on.has(`${x},${y}`) ? '#a78bfa' : '#f8fafc'} stroke="#94a3b8" />
      )))}
    </svg>
  )
}

function Stack({ g }: { g: Grid }) {
  const s = 22, ox = 11, oy = 11, X0 = 10, Y0 = 95
  const out: JSX.Element[] = []
  for (let d = DEPTH - 1; d >= 0; d--)
    for (let k = 0; k < MAXH; k++)
      for (let c = 0; c < COLS; c++) {
        if (g[d][c] <= k) continue
        const x = X0 + c * s + d * ox, y = Y0 - (k + 1) * s - d * oy
        out.push(
          <g key={`${d}-${k}-${c}`} stroke="#475569" strokeWidth={1}>
            <polygon points={`${x},${y} ${x + s},${y} ${x + s + ox},${y - oy} ${x + ox},${y - oy}`} fill="#ddd6fe" />
            <polygon points={`${x + s},${y} ${x + s},${y + s} ${x + s + ox},${y + s - oy} ${x + s + ox},${y - oy}`} fill="#c4b5fd" />
            <rect x={x} y={y} width={s} height={s} fill="#ede9fe" />
          </g>,
        )
      }
  return <svg viewBox="0 0 130 110" style={{ width: '100%', maxWidth: 220 }}>{out}</svg>
}

function Views({ g }: { g: Grid }) {
  return (
    <div className="row" style={{ alignItems: 'flex-end' }}>
      <div><Mini cells={top(g)} cols={COLS} rows={DEPTH} /><div className="mut">علوي</div></div>
      <div><Mini cells={front(g)} cols={COLS} rows={MAXH} /><div className="mut">أمامي</div></div>
      <div><Mini cells={side(g)} cols={DEPTH} rows={MAXH} /><div className="mut">جانبي</div></div>
    </div>
  )
}

export default function ViewsBuilder({ onDone }: WidgetProps) {
  const [ti, setTi] = useState(0)
  const [g, setG] = useState<Grid>(() => Array.from({ length: DEPTH }, () => Array(COLS).fill(0)))
  const T = TARGETS[ti], last = ti === TARGETS.length - 1
  const m = [key(top(g)) === key(top(T)), key(front(g)) === key(front(T)), key(side(g)) === key(side(T))]
  const all = m.every(Boolean)
  const bump = (d: number, c: number) => setG((p) => p.map((row, dd) => row.map((v, cc) => (dd === d && cc === c ? (v + 1) % (MAXH + 1) : v))))
  const next = () => { if (last) onDone(); else { setTi(ti + 1); setG(Array.from({ length: DEPTH }, () => Array(COLS).fill(0))) } }

  return (
    <div className="card">
      <div className="q-prompt">ابني مجسماً مناظره مثل الهدف 🎯 ({ti + 1} من {TARGETS.length})</div>
      <div className="mut">مناظر الهدف:</div>
      <Views g={T} />
      <div className="mut" style={{ marginTop: 8 }}>اضغطي على المربعات لتزيدي عدد المكعبات (٠ إلى ٣):</div>
      {[1, 0].map((d) => (
        <div key={d} className="row">
          <span className="mut" style={{ width: 70 }}>{d === 0 ? 'الصف الأمامي' : 'الصف الخلفي'}</span>
          {g[d].map((v, c) => <button key={c} className="btn alt" style={{ minWidth: 44 }} onClick={() => bump(d, c)}>{v}</button>)}
        </div>
      ))}
      <Stack g={g} />
      <div className="mut">مناظر مجسّمك:</div>
      <Views g={g} />
      <div className="mut">{m.map((x) => (x ? '✅' : '❌')).join(' ')} (علوي، أمامي، جانبي)</div>
      {all && (<>
        <div className="fb ok">طابقتِ المناظر الثلاثة 🎉 وانتبهي: ممكن يكون في أكتر من مجسّم بنفس المناظر! جرّبي ترتيباً تانياً إذا بدك.</div>
        <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'هدف تاني ➡️'}</button>
      </>)}
    </div>
  )
}