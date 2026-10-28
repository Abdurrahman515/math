import { describe, it, expect } from 'vitest'
import { buildExam } from './exam'
import { banks, chapters, exams, poolFor } from '../content'
import type { Question } from '../types'

function check(q: Question, where: string) {
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct).length, where).toBe(1)
    expect(new Set(q.options.map((o) => o.text)).size, where).toBe(q.options.length)
    q.options.forEach((o) => expect(o.why.length, where).toBeGreaterThan(5))
  } else {
    expect(Number.isFinite(q.answer), where).toBe(true)
    const vals = q.wrong?.map((w) => w.value) ?? []
    expect(vals.includes(q.answer), where).toBe(false)
    expect(new Set(vals).size, where).toBe(vals.length)
  }
}

describe('بنوك الأسئلة', () => {
  for (const [id, bank] of Object.entries(banks))
    bank.forEach((p, k) =>
      it(`فصل ${id} / درس ${p.lesson} #${k}`, () => {
        for (let n = 0; n < 300; n++) check(p.gen(), `${p.lesson}#${k}`)
      }),
    )
})

describe('الاختبارات', () => {
  for (const e of exams)
    it(e.id, () => {
      const pool = poolFor(e.scope)
      const a = buildExam(e, pool)
      const b = buildExam(e, pool)
      expect(a.length).toBe(e.count)
      expect(a.map((x) => x.q.prompt).join()).not.toBe(b.map((x) => x.q.prompt).join())
      // كل درس في النطاق لازم يكون له مولّد واحد على الأقل
      const covered = new Set(pool.map((p) => p.lesson))
      const missing = chapters
        .filter((c) => e.scope.includes(c.id))
        .flatMap((c) => c.lessons.map((l) => l.id))
        .filter((id) => !covered.has(id))
      expect(missing).toEqual([])
    })
})