import { useSyncExternalStore } from 'react'

/** حالة الطيّ فقط (مفتوح/مطوي). مفتاح مستقل عن التقدم حتى لا يدخل في التصدير والاستيراد */
const KEY = 'math-app:ui:v1'
type Folds = Record<string, boolean>

function load(): Folds {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p === 'object' && !Array.isArray(p)) return p
    }
  } catch { /* تجاهل */ }
  return {}
}

let state: Folds = load()
const subs = new Set<() => void>()

export const useFolds = () =>
  useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, () => state)

export function setFold(id: string, open: boolean) {
  state = { ...state, [id]: open }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* تجاهل */ }
  subs.forEach((f) => f())
}