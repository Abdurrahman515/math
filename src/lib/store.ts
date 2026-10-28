import { useSyncExternalStore } from 'react'

export type Progress = {
  lessons: Record<string, { stars: number; at: number }>
  mistakes: { lesson: string; q: string; chosen: string; at: number }[]
  exams: Record<string, ExamRecord>
}

const KEY = 'math-app:v1'
const empty = (): Progress => ({ lessons: {}, mistakes: [], exams: {} })

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p.lessons === 'object')
        return {
          lessons: p.lessons,
          mistakes: Array.isArray(p.mistakes) ? p.mistakes : [],
          exams: p.exams && typeof p.exams === 'object' ? p.exams : {},
        }
    }
  } catch { /* تجاهل */ }
  return empty()
}

let state = load()
const subs = new Set<() => void>()

function set(p: Progress) {
  state = p
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* تجاهل */ }
  subs.forEach((f) => f())
}

export const useProgress = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => state)

export function finishLesson(id: string, stars: number) {
  const old = state.lessons[id]?.stars ?? 0
  set({ ...state, lessons: { ...state.lessons, [id]: { stars: Math.max(old, stars), at: Date.now() } } })
}

export function logMistake(lesson: string, q: string, chosen: string) {
  set({ ...state, mistakes: [...state.mistakes, { lesson, q, chosen, at: Date.now() }].slice(-300) })
}

export function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `math-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/** دمج: نحتفظ بأعلى نجوم لكل درس، ونضم سجل الأخطاء */
export async function importProgress(file: File) {
  const p = JSON.parse(await file.text())
  if (!p || typeof p.lessons !== 'object') throw new Error('ملف غير صالح')
  const merged = { ...state.lessons }
  for (const [k, v] of Object.entries(p.lessons) as [string, { stars: number; at: number }][]) {
    if (!merged[k] || merged[k].stars < v.stars) merged[k] = v
  }
  const m = [...state.mistakes, ...(Array.isArray(p.mistakes) ? p.mistakes : [])]
  const ex = { ...state.exams }
  for (const [k, v] of Object.entries(p.exams ?? {}) as [string, ExamRecord][]) {
    const o = ex[k]
    if (!o) { ex[k] = v; continue }
    const passed = o.passed || v.passed
    ex[k] = {
      best: Math.max(o.best, v.best),
      attempts: Math.max(o.attempts, v.attempts),
      passed,
      lastAt: Math.max(o.lastAt, v.lastAt),
      lockedUntil: passed ? 0 : Math.max(o.lockedUntil, v.lockedUntil),
      weak: v.lastAt > o.lastAt ? v.weak : o.weak,
    }
  }
  set({ lessons: merged, mistakes: m.sort((a, b) => a.at - b.at).slice(-300), exams: ex })
}


export type ExamRecord = {
  best: number; attempts: number; passed: boolean
  lastAt: number; lockedUntil: number; weak: string[]
}


export function recordExam(id: string, pct: number, passed: boolean, weak: string[], lockHours: number) {
  const o = state.exams[id]
  const everPassed = passed || !!o?.passed
  const rec: ExamRecord = {
    best: Math.max(o?.best ?? 0, pct),
    attempts: (o?.attempts ?? 0) + 1,
    passed: everPassed,
    lastAt: Date.now(),
    // القفل بعد الرسوب فقط، وبعد النجاح لا قفل
    lockedUntil: everPassed || lockHours <= 0 ? 0 : Date.now() + lockHours * 3600_000,
    weak,
  }
  set({ ...state, exams: { ...state.exams, [id]: rec } })
}