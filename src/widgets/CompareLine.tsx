import { useState } from 'react'
import type { WidgetProps } from '../types'
import { NumLine } from '../components/NumLine'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'

const A = '#2563eb', B = '#ea580c'

export default function CompareLine({ onDone }: WidgetProps) {
  const [a, setA] = useState<number | null>(null)
  const [b, setB] = useState<number | null>(null)
  const [turn, setTurn] = useState<'a' | 'b'>('a')
  const [n, setN] = useState(0)

  const tap = (v: number) => {
    let na = a, nb = b
    if (turn === 'a') { na = v; setA(v); setTurn('b') }
    else { nb = v; setB(v); setTurn('a') }
    if (na !== null && nb !== null && na !== nb) {
      const c = n + 1
      setN(c)
      if (c >= 4) onDone()
    }
  }

  const points = [
    ...(a !== null ? [{ v: a, color: A }] : []),
    ...(b !== null && b !== a ? [{ v: b, color: B }] : []),
  ]

  let line: string
  if (a === null || b === null) line = 'اضغطي على عددين مختلفين 👆\n(الأول 🔵 والتاني 🟠)'
  else if (a === b) line = 'نفس العدد! اضغطي على عدد مختلف.'
  else {
    const lt = a < b
    line = `🔵 ${lt ? 'على يسار' : 'على يمين'} 🟠 ← يعني 🔵 ${lt ? 'أقل' : 'أكبر'}\n$${sg(a)} ${lt ? '<' : '>'} ${sg(b)}$`
  }

  return (
    <div className="card center">
      <h3 className="h3">⚖️ مين الأكبر؟</h3>
      <NumLine min={-10} max={10} points={points} onPick={tap} />
      <div style={{ whiteSpace: 'pre-line' }}><Rich t={line} /></div>
      <div className="fb tip">
        <Rich t='🔑 العدد اللي على **اليمين** هو دايماً الأكبر.' />
      </div>
    </div>
  )
}