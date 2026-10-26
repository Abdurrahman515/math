import { useSyncExternalStore } from 'react'

export type Progress = {
  lessons: Record<string, { stars: number; at: number }>
  mistakes: { lesson: string; q: string; chosen: string; at: number }[]
}

const KEY = 'math-app:v1'
const empty = (): Progress => ({ lessons: {}, mistakes: [] })

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p.lessons === 'object') return { lessons: p.lessons, mistakes: Array.isArray(p.mistakes) ? p.mistakes : [] }
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
  set({ lessons: merged, mistakes: m.sort((a, b) => a.at - b.at).slice(-300) })
}