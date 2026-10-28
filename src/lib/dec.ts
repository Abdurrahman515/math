export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
export const r3 = (x: number) => Math.round(x * 1000) / 1000
export const r2 = (x: number) => Math.round(x * 100) / 100
/** عدد عشري بالفاصلة العربية؛ الأرقام تتحول للشرقية في Rich */
export const dec = (x: number) => String(r3(x)).replace('.', '٫')
export const dec2 = (x: number) => String(r2(x)).replace('.', '٫')
/** كسر لـRich: fr(3, 4) → '{3/4}' */
export const fr = (n: number | string, d: number | string) => `{${n}/${d}}`