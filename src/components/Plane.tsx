import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { fmtInt } from '../lib/int'

export type PPoint = { x: number; y: number; color?: string; label?: string }
const S = 36, PAD = 30
const QN = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع']

export function Plane({ lim = 5, points = [], walk, quadrants, onPick }: {
  lim?: number; points?: PPoint[]; walk?: { x: number; y: number } | null
  quadrants?: boolean; onPick?: (x: number, y: number) => void
}) {
  const size = 2 * lim * S + PAD * 2
  const px = (x: number) => PAD + (x + lim) * S
  const py = (y: number) => PAD + (lim - y) * S
  const cl = (v: number) => Math.max(-lim, Math.min(lim, v))
  const range = Array.from({ length: 2 * lim + 1 }, (_, i) => i - lim)

  const pick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onPick) return
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * size
    const vy = ((e.clientY - r.top) / r.height) * size
    onPick(cl(Math.round((vx - PAD) / S - lim)), cl(Math.round(lim - (vy - PAD) / S)))
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={'pl' + (onPick ? ' pick' : '')} onClick={pick}>
      {range.map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={py(lim)} x2={px(v)} y2={py(-lim)} className="pl-grid" />
          <line x1={px(-lim)} y1={py(v)} x2={px(lim)} y2={py(v)} className="pl-grid" />
        </g>
      ))}

      {quadrants && [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([sx, sy], k) => (
        <text key={k} x={px((sx * lim) / 2)} y={py((sy * lim) / 2) + 5} className="pl-q">{QN[k]}</text>
      ))}

      <line x1={px(-lim) - 8} y1={py(0)} x2={px(lim) + 12} y2={py(0)} className="pl-axis" />
      <line x1={px(0)} y1={py(-lim) + 8} x2={px(0)} y2={py(lim) - 12} className="pl-axis" />
      <path d={`M ${px(lim) + 14} ${py(0)} l -10 -6 v 12 z`} className="pl-head" />
      <path d={`M ${px(0)} ${py(lim) - 14} l -6 10 h 12 z`} className="pl-head" />
      <text x={px(lim) + 18} y={py(0) + 28} className="pl-ax">س</text>
      <text x={px(0) + 12} y={18} className="pl-ax">ص</text>

      {range.filter((v) => v !== 0).map((v) => (
        <g key={`t${v}`}>
          <text x={px(v)} y={py(0) + 20} textAnchor="middle" className="pl-lbl">{fmtInt(v)}</text>
          <text x={px(0) - 8} y={py(v) + 5} textAnchor="end" className="pl-lbl">{fmtInt(v)}</text>
        </g>
      ))}

      {walk && (
        <>
          <motion.line
            key={`h${walk.x},${walk.y}`} x1={px(0)} y1={py(0)} x2={px(walk.x)} y2={py(0)} className="pl-walk h"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}
          />
          <motion.line
            key={`v${walk.x},${walk.y}`} x1={px(walk.x)} y1={py(0)} x2={px(walk.x)} y2={py(walk.y)} className="pl-walk v"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
          />
        </>
      )}

      <circle cx={px(0)} cy={py(0)} r={4} fill="var(--ink)" />
      {points.map((p, k) => (
        <g key={k}>
          <motion.circle cx={px(p.x)} cy={py(p.y)} initial={{ r: 0 }} animate={{ r: 9 }} fill={p.color ?? '#5b5bd6'} stroke="#fff" strokeWidth={3} />
          {p.label && <text x={px(p.x) + 13} y={py(p.y) - 11} className="pl-pt" fill={p.color ?? '#5b5bd6'}>{p.label}</text>}
        </g>
      ))}
    </svg>
  )
}