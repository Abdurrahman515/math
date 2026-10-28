import { toArabicDigits } from './arabicDigits'

/** عرض عدد صحيح بأرقام الكتاب (للـ SVG والنصوص البرمجية).
 *  إن أردتِ تغيير موضع إشارة السالب لتطابق الكتاب فالتعديل هنا فقط. */
export const fmtInt = (n: number, plus = false) =>
  (n < 0 ? '−' : plus && n > 0 ? '+' : '') + toArabicDigits(String(Math.abs(n)))

/** للاستعمال داخل $...$ في محتوى الدروس (لاتيني، يُحوَّل عند العرض) */
export const sg = (n: number) => (n < 0 ? `−${-n}` : String(n))
export const sgp = (n: number) => (n > 0 ? `+${n}` : sg(n))