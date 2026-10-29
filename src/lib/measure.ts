import { toArabicDigits as ad } from './arabicDigits'

/** تقريب لأقرب عُشر */
export const r1 = (x: number) => Math.round(x * 10) / 10
/** n × ٣٫١٤ بحساب صحيح دون أخطاء فاصلة عائمة */
export const pi314 = (n: number) => (n * 314) / 100
/** عدد بأرقام الكتاب وفاصلة عربية (لأقرب عُشر) */
export const f1 = (x: number) => ad(String(r1(x))).replace('.', '٫')