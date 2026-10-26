import { describe, it, expect } from 'vitest'
import { allLessons } from './index'
import { evaluate } from '../lib/calc'
import type { Question } from '../types'

function check(q: Question, where: string) {
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct).length, where).toBe(1)
    q.options.forEach((o) => expect(o.why.length, where).toBeGreaterThan(5))
  } else {
    expect(Number.isFinite(q.answer), where).toBe(true)
    const vals = q.wrong?.map((w) => w.value) ?? []
    expect(vals.includes(q.answer), where).toBe(false)
    expect(new Set(vals).size, where).toBe(vals.length)
  }
}

describe('المحتوى', () => {
  for (const l of allLessons) {
    it(`درس ${l.id}`, () => {
      l.blocks.forEach((b, i) => {
        const w = `${l.id}#${i}`
        if (b.t === 'quiz') check(b.q, w)
        if (b.t === 'practice') for (let k = 0; k < 300; k++) check(b.gen(), w)
        if (b.t === 'widget' && b.id === 'solver')
          (b.props?.exprs as string[]).forEach((e) => expect(Number.isInteger(evaluate(e)), e).toBe(true))
      })
    })
  }
})