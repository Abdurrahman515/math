import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type P = { title: string; stages: string[][] }
type N = { id: string; d: number; label: string; y: number; parent?: string }
const DEF: P[] = [{ title: 'قطعة نقد ثم مكعب', stages: [['شعار', 'كتابة'], ['١', '٢', '٣']] }]
const CW = 120, NW = 84, NH = 24, RH = 34, TOP = 20

function layout(stages: string[][]): N[] {
  const out: N[] = []
  let leaf = 0
  const rec = (d: number, id: string, label: string, parent?: string): number => {
    let y: number
    if (d === stages.length) y = leaf++
    else {
      const ys = stages[d].map((o, k) => rec(d + 1, `${id}.${k}`, o, id))
      y = (ys[0] + ys[ys.length - 1]) / 2
    }
    out.push({ id, d, label, y, parent })
    return y
  }
  rec(0, 'r', 'البداية 🌳')
  return out
}

export default function TreeBuilder({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [open, setOpen] = useState<string[]>([])
  const p = problems[i]
  const last = i === problems.length - 1
  const S = p.stages.length
  const nodes = layout(p.stages)
  const byId = new Map(nodes.map((x) => [x.id, x]))
  const internal = nodes.filter((x) => x.d < S)
  const leaves = nodes.filter((x) => x.d === S)
  const done = open.length === internal.length
  const W = (S + 1) * CW + 16
  const H = TOP + (leaves.length - 1) * RH + NH / 2 + 10
  const cx = (d: number) => W - 8 - NW / 2 - d * CW
  const cy = (y: number) => TOP + y * RH
  const shown = nodes.filter((x) => x.d === 0 || (x.parent !== undefined && open.includes(x.parent)))
  const pathOf = (id: string) => {
    const out: string[] = []
    let cur = byId.get(id)
    while (cur && cur.parent) { out.unshift(cur.label); cur = byId.get(cur.parent) }
    return out.join('، ')
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setOpen([]) }
  }

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      {!done && (
        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          اضغطي على العقدة المنقّطة لتفرّعيها 🌿 ({ad(open.length)} من {ad(internal.length)})
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
        {shown.map((x) => {
          const par = x.parent ? byId.get(x.parent) : undefined
          return par ? (
            <line key={`l${x.id}`} x1={cx(par.d) - NW / 2} y1={cy(par.y)} x2={cx(x.d) + NW / 2} y2={cy(x.y)} stroke="currentColor" strokeWidth={1.5} opacity={0.6} />
          ) : null
        })}
        {shown.map((x) => {
          const can = x.d < S && !open.includes(x.id)
          const leaf = x.d === S
          return (
            <g key={x.id} onClick={() => can && setOpen([...open, x.id])} style={{ cursor: can ? 'pointer' : 'default' }}>
              <rect
                x={cx(x.d) - NW / 2} y={cy(x.y) - NH / 2} width={NW} height={NH} rx={12}
                fill={leaf ? '#bbf7d0' : '#ede9fe'} stroke={can ? '#7c3aed' : '#64748b'}
                strokeWidth={can ? 2.5 : 1.2} strokeDasharray={can ? '5 3' : undefined}
              />
              <text x={cx(x.d)} y={cy(x.y) + 4} textAnchor="middle" fontSize={12} fill="#1e293b">{ad(x.label)}</text>
            </g>
          )
        })}
      </svg>
      {done && (
        <>
          <div className="fb ok">
            برافو! 🎉 صار عندنا <b>{ad(leaves.length)}</b> فرع بآخر الشجرة، يعني {ad(leaves.length)} ناتج.
            <div style={{ margin: '6px 0' }}>
              {p.stages.map((s) => ad(s.length)).join(' × ')} = {ad(leaves.length)}
            </div>
          </div>
          <div style={{ margin: '8px 0' }}>
            {leaves.map((l) => (
              <span key={l.id} style={{ display: 'inline-block', padding: '4px 10px', margin: 3, borderRadius: 999, fontSize: 14, background: '#dcfce7', color: '#1e293b' }}>
                {ad(pathOf(l.id))}
              </span>
            ))}
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}