import { toArabicDigits as ad } from './arabicDigits'

export const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
export const one = <T,>(xs: T[]): T => xs[ri(0, xs.length - 1)]
export const rad = (d: number) => (d * Math.PI) / 180

export type AngleKind = 'acute' | 'right' | 'obtuse' | 'straight'
export const kindOf = (m: number): AngleKind => (m < 90 ? 'acute' : m === 90 ? 'right' : m < 180 ? 'obtuse' : 'straight')
export const kindAr: Record<AngleKind, string> = { acute: 'حادة', right: 'قائمة', obtuse: 'منفرجة', straight: 'مستقيمة' }

export type TriAngle = 'acute' | 'right' | 'obtuse'
export type TriSide = 'scalene' | 'isosceles' | 'equilateral'
export const triAngleKind = (a: number, b: number, c: number): TriAngle =>
  Math.max(a, b, c) > 90 ? 'obtuse' : [a, b, c].includes(90) ? 'right' : 'acute'
export const triSideKind = (a: number, b: number, c: number): TriSide =>
  a === b && b === c ? 'equilateral' : a === b || b === c || a === c ? 'isosceles' : 'scalene'
export const triAngAr: Record<TriAngle, string> = { acute: 'حاد الزوايا', right: 'قائم الزاوية', obtuse: 'منفرج الزاوية' }
export const triSideAr: Record<TriSide, string> = { scalene: 'مختلف الأضلاع', isosceles: 'متطابق الضلعين', equilateral: 'متطابق الأضلاع' }
export const polyAr: Record<number, string> = { 3: 'مثلث', 4: 'رباعي', 5: 'خماسي', 6: 'سداسي', 7: 'سباعي', 8: 'ثماني', 9: 'تساعي', 10: 'عشاري' }

/** عدد بأرقام الكتاب وفاصلة عشرية عربية (تقريب لمنزلتين) */
export const f2 = (x: number) => ad(String(Math.round(x * 100) / 100)).replace('.', '٫')

/** يقرأ رقماً مكتوباً بأرقام شرقية أو غربية وفاصلة عربية؛ NaN إن كان فارغاً */
export const toNum = (s: string): number => {
  const t = s
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[٫,،]/g, '.')
    .trim()
  return t ? Number(t) : NaN
}

/** رؤوس مثلث زاويتاه أ وب (درجات) مضبوطة داخل مساحة w×h */
export function triPoints(a: number, b: number, w: number, h: number, pad = 18): [number, number][] {
  const c = 180 - a - b
  const raw: [number, number][] = [
    [0, 0],
    [Math.sin(rad(c)), 0],
    [Math.sin(rad(b)) * Math.cos(rad(a)), Math.sin(rad(b)) * Math.sin(rad(a))],
  ]
  const xs = raw.map((p) => p[0]), ys = raw.map((p) => p[1])
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys)
  const s = Math.min((w - 2 * pad) / (maxx - minx), (h - 2 * pad) / (maxy - miny))
  return raw.map(([x, y]) => [pad + (x - minx) * s, h - pad - (y - miny) * s])
}