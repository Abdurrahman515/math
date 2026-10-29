import { shuffle } from './rng'

export type TimesQ = { a: number; b: number; answer: number }

export const SESSION_SIZE = 30
export const SECONDS = 7

/** ٣٠ سؤالاً مختلفاً عشوائياً من بين ١٠٠ احتمال (١×١ إلى ١٠×١٠)، بلا تكرار داخل الجلسة */
export function buildSession(): TimesQ[] {
  const all: TimesQ[] = []
  for (let a = 1; a <= 10; a++)
    for (let b = 1; b <= 10; b++) all.push({ a, b, answer: a * b })
  return shuffle(all).slice(0, SESSION_SIZE)
}