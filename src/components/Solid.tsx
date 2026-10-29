import { type JSX } from 'react'

export type SolidKind = 'cube' | 'rectPrism' | 'triPrism' | 'sqPyramid' | 'triPyramid' | 'cylinder' | 'cone' | 'sphere'

const ST = { stroke: '#475569', strokeWidth: 1.3, strokeLinejoin: 'round' as const }
const HID = { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '3 2', fill: 'none' }
const P = (p: number[][]) => p.map((q) => q.join(',')).join(' ')
const Hid = ({ a, b }: { a: number[]; b: number[] }) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...HID} />

function Box({ x, y, w, h, dx, dy }: { x: number; y: number; w: number; h: number; dx: number; dy: number }) {
  const f = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
  const b = f.map(([a, c]) => [a + dx, c - dy])
  return (
    <g>
      <polygon points={P([f[0], f[1], b[1], b[0]])} fill="#ddd6fe" {...ST} />
      <polygon points={P([f[1], f[2], b[2], b[1]])} fill="#c4b5fd" {...ST} />
      <polygon points={P(f)} fill="#ede9fe" {...ST} />
      <Hid a={b[0]} b={b[3]} /><Hid a={b[3]} b={b[2]} /><Hid a={f[3]} b={b[3]} />
    </g>
  )
}

export function Solid({ kind, size = 110 }: { kind: SolidKind; size?: number }) {
  let body: JSX.Element
  switch (kind) {
    case 'cube': body = <Box x={15} y={38} w={44} h={44} dx={24} dy={24} />; break
    case 'rectPrism': body = <Box x={8} y={48} w={58} h={30} dx={26} dy={22} />; break
    case 'triPrism': {
      const A = [14, 82], B = [54, 82], C = [34, 46], A2 = [44, 60], B2 = [84, 60], C2 = [64, 24]
      body = (
        <g>
          <polygon points={P([B, C, C2, B2])} fill="#c4b5fd" {...ST} />
          <polygon points={P([A, B, C])} fill="#ede9fe" {...ST} />
          <Hid a={A} b={A2} /><Hid a={A2} b={B2} /><Hid a={A2} b={C2} />
        </g>
      ); break
    }
    case 'sqPyramid': {
      const fl = [18, 80], fr = [58, 80], br = [86, 60], bl = [46, 60], T = [52, 14]
      body = (
        <g>
          <polygon points={P([T, fr, br])} fill="#c4b5fd" {...ST} />
          <polygon points={P([T, fl, fr])} fill="#ede9fe" {...ST} />
          <Hid a={bl} b={fl} /><Hid a={bl} b={br} /><Hid a={T} b={bl} />
        </g>
      ); break
    }
    case 'triPyramid': {
      const A = [14, 82], B = [64, 82], C = [88, 60], T = [44, 14]
      body = (
        <g>
          <polygon points={P([T, B, C])} fill="#c4b5fd" {...ST} />
          <polygon points={P([T, A, B])} fill="#ede9fe" {...ST} />
          <Hid a={A} b={C} />
        </g>
      ); break
    }
    case 'cylinder':
      body = (
        <g>
          <path d="M20 25 L20 78 A30 10 0 0 0 80 78 L80 25 Z" fill="#ddd6fe" {...ST} />
          <path d="M20 78 A30 10 0 0 1 80 78" {...HID} />
          <ellipse cx={50} cy={25} rx={30} ry={10} fill="#ede9fe" {...ST} />
        </g>
      ); break
    case 'cone':
      body = (
        <g>
          <path d="M50 12 L20 78 A30 10 0 0 0 80 78 Z" fill="#ddd6fe" {...ST} />
          <path d="M20 78 A30 10 0 0 1 80 78" {...HID} />
        </g>
      ); break
    default:
      body = (
        <g>
          <circle cx={50} cy={50} r={36} fill="#ddd6fe" {...ST} />
          <path d="M14 50 A36 11 0 0 0 86 50" fill="none" {...ST} strokeWidth={1} />
          <path d="M14 50 A36 11 0 0 1 86 50" {...HID} />
        </g>
      )
  }
  return <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={kind}>{body}</svg>
}