import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { fmtInt } from '../lib/int'

export type NLPoint = { v: number; color?: string; label?: string }
export type NLArc = { from: number; to: number; label?: string; color?: string }

const STEP = 30, PAD = 24, H = 134, Y = 78

export function NumLine({ min, max, points = [], arcs = [], onPick, labelEvery }: {
  min: number; max: number; points?: NLPoint[]; arcs?: NLArc[]
  onPick?: (v: number) => void; labelEvery?: number
}) {
  const n = max - min
  const W = n * STEP + PAD * 2
  const every = labelEvery ?? (n > 12 ? 2 : 1)
  const x = (v: number) => PAD + (v - min) * STEP

  const pick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onPick) return
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    onPick(Math.max(min, Math.min(max, Math.round((vx - PAD) / STEP) + min)))
  }

  return (
    <div className="nl-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className={'nl' + (onPick ? ' pick' : '')} onClick={pick}>
        <line x1={4} y1={Y} x2={W - 4} y2={Y} className="nl-axis" />
        <path d={`M ${W - 4} ${Y} l -9 -6 v 12 z`} className="nl-head" />
        <path d={`M 4 ${Y} l 9 -6 v 12 z`} className="nl-head" />

        {Array.from({ length: n + 1 }, (_, i) => {
          const v = min + i
          return (
            <g key={v}>
              <line x1={x(v)} y1={Y - (v === 0 ? 10 : 6)} x2={x(v)} y2={Y + (v === 0 ? 10 : 6)} className={v === 0 ? 'nl-zero' : 'nl-tick'} />
              {v % every === 0 && <text x={x(v)} y={Y + 30} className="nl-lbl">{fmtInt(v)}</text>}
            </g>
          )
        })}

        {arcs.map((a) => {
          if (a.from === a.to) return null
          const x1 = x(a.from), x2 = x(a.to)
          const h = Math.min(46, 14 + Math.abs(x2 - x1) / 8)
          const c = a.color ?? '#7c3aed'
          return (
            <g key={`${a.from}-${a.to}`}>
              <motion.path
                d={`M ${x1} ${Y - 10} Q ${(x1 + x2) / 2} ${Y - 10 - 2 * h} ${x2} ${Y - 10}`}
                className="nl-arc" stroke={c}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
              />
              <path d={`M ${x2} ${Y - 10} l -5 -9 h 10 z`} fill={c} />
              {a.label && <text x={(x1 + x2) / 2} y={Y - 10 - h - 6} className="nl-arcl" fill={c}>{a.label}</text>}
            </g>
          )
        })}

        {points.map((p) => (
          <g key={p.v}>
            <motion.circle cx={x(p.v)} cy={Y} initial={{ r: 0 }} animate={{ r: 9 }} fill={p.color ?? '#5b5bd6'} stroke="#fff" strokeWidth={3} />
            {p.label && <text x={x(p.v)} y={Y + 54} className="nl-plbl" fill={p.color}>{p.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  )
}