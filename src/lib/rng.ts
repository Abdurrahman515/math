export const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
export const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)]
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}