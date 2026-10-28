export const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
export const sortAsc = (a: number[]) => [...a].sort((x, y) => x - y)
export const rangeOf = (a: number[]) => Math.max(...a) - Math.min(...a)
export const meanOf = (a: number[]) => sum(a) / a.length
export const medianOf = (a: number[]) => {
  const s = sortAsc(a)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
/** المنوال: القيم الأكثر تكراراً (مصفوفة فارغة إن لم يتكرر شيء) */
export const modesOf = (a: number[]) => {
  const c = new Map<number, number>()
  a.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1))
  const mx = Math.max(...c.values())
  return mx < 2 ? [] : [...c].filter(([, k]) => k === mx).map(([v]) => v).sort((x, y) => x - y)
}
/** تقريب لأقرب عُشر */
export const tenth = (x: number) => Math.round(x * 10 + 1e-9) / 10