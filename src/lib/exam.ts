import type { Question } from '../types'
import { shuffle } from './rng'

export type PoolItem = { lesson: string; gen: () => Question }

export type ExamDef = {
  id: string
  title: string
  emoji: string
  afterChapter: string // يظهر بعد هذا الفصل في الرئيسية
  scope: string[]      // الفصول المشمولة
  count: number
  passPct: number
  strict: boolean      // true: لا تصحيح ولا تفسير إلا بعد تسليم الاختبار
  lockHours: number    // قفل الإعادة بعد الرسوب (0 = بلا قفل)
}

export type ExamQ = { lesson: string; q: Question }

/** توزيع عادل على الدروس (دورة)، وأرقام جديدة في كل مرة، بلا تكرار نص السؤال */
export function buildExam(def: ExamDef, pool: PoolItem[]): ExamQ[] {
  const byLesson = new Map<string, PoolItem[]>()
  pool.forEach((p) => byLesson.set(p.lesson, [...(byLesson.get(p.lesson) ?? []), p]))
  const lessons = shuffle([...byLesson.keys()])
  if (!lessons.length) return []

  const seen = new Set<string>()
  const cursor = new Map<string, number>()
  const out: ExamQ[] = []
  let guard = 0
  while (out.length < def.count && guard++ < def.count * 40) {
    const lesson = lessons[out.length % lessons.length]
    const items = byLesson.get(lesson)!
    const c = cursor.get(lesson) ?? Math.floor(Math.random() * items.length)
    cursor.set(lesson, c + 1)
    const q = items[c % items.length].gen()
    if (seen.has(q.prompt)) continue
    seen.add(q.prompt)
    out.push({ lesson, q: q.kind === 'choice' ? { ...q, options: shuffle(q.options) } : q })
  }
  return out
}