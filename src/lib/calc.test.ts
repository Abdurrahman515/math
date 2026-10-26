import { describe, it, expect } from 'vitest'
import { allowed, evaluate, tokenize } from './calc'

describe('ترتيب العمليات', () => {
  it('الضرب قبل الجمع', () => expect(evaluate('6 + 4 × 3')).toBe(18))
  it('من اليسار لليمين', () => {
    expect(evaluate('8 − 3 + 2')).toBe(7)
    expect(evaluate('12 ÷ 3 × 2')).toBe(8)
  })
  it('الأقواس والقوى', () => {
    expect(evaluate('(6 + 4) × 3')).toBe(30)
    expect(evaluate('5 × 3^2 − 7')).toBe(38)
    expect(evaluate('14 + 3 × (7 − 2)')).toBe(29)
  })
  it('العمليات المسموحة', () => {
    expect(allowed(tokenize('8 − 3 + 2'))).toEqual([1])
    expect(allowed(tokenize('2 + 3 × 4'))).toEqual([3])
  })
})