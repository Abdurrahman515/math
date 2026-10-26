export type Op = '+' | '−' | '×' | '÷' | '^'
export type Tok = { k: 'n'; v: number } | { k: 'o'; v: Op } | { k: '(' } | { k: ')' }

export function tokenize(s: string): Tok[] {
  const src = s.replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷')
  const out: Tok[] = []
  for (let i = 0; i < src.length; ) {
    const c = src[i]
    if (c === ' ') { i++; continue }
    if (/[0-9]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9]/.test(src[j])) j++
      out.push({ k: 'n', v: Number(src.slice(i, j)) })
      i = j
      continue
    }
    if (c === '(') out.push({ k: '(' })
    else if (c === ')') out.push({ k: ')' })
    else if ('+−×÷^'.includes(c)) out.push({ k: 'o', v: c as Op })
    else throw new Error('رمز غير معروف: ' + c)
    i++
  }
  return out
}

export const show = (t: Tok[]) =>
  t.map((x) => (x.k === 'n' ? String(x.v) : x.k === 'o' ? (x.v === '^' ? '^' : ` ${x.v} `) : x.k)).join('')

const level = (o: Op) => (o === '^' ? 0 : o === '×' || o === '÷' ? 1 : 2)
const opAt = (t: Tok[], i: number): Op => {
  const x = t[i]
  if (x.k !== 'o') throw new Error('ليست عملية')
  return x.v
}

/** المناطق التي يجوز العمل فيها الآن: أعمق أقواس، أو التعبير كله */
function regions(t: Tok[]): [number, number][] {
  const groups: [number, number][] = []
  const stack: number[] = []
  t.forEach((x, i) => {
    if (x.k === '(') stack.push(i)
    else if (x.k === ')') {
      const s = stack.pop()
      if (s !== undefined) groups.push([s, i])
    }
  })
  const inner = groups.filter(([a, b]) => !groups.some(([c, d]) => c > a && d < b))
  return inner.length ? inner.map(([a, b]) => [a + 1, b - 1] as [number, number]) : [[0, t.length - 1]]
}

/** مواضع العمليات التي يجوز تنفيذها الآن */
export function allowed(t: Tok[]): number[] {
  const res: number[] = []
  for (const [a, b] of regions(t)) {
    const ops: number[] = []
    for (let i = a; i <= b; i++) if (t[i].k === 'o') ops.push(i)
    if (!ops.length) continue
    const min = Math.min(...ops.map((i) => level(opAt(t, i))))
    const same = ops.filter((i) => level(opAt(t, i)) === min)
    res.push(...(min === 0 ? same : [same[0]]))
  }
  return res
}

export function apply(t: Tok[], i: number): Tok[] {
  const a = t[i - 1], b = t[i + 1], o = opAt(t, i)
  if (a.k !== 'n' || b.k !== 'n') throw new Error('عملية غير صالحة')
  const v = o === '+' ? a.v + b.v : o === '−' ? a.v - b.v : o === '×' ? a.v * b.v : o === '÷' ? a.v / b.v : a.v ** b.v
  const out: Tok[] = [...t.slice(0, i - 1), { k: 'n', v }, ...t.slice(i + 2)]
  for (let j = 0; j < out.length - 2; j++) {
    if (out[j].k === '(' && out[j + 1].k === 'n' && out[j + 2].k === ')') {
      out.splice(j, 3, out[j + 1])
      j = -1
    }
  }
  return out
}

/** لماذا اختيارك خطأ؟ */
export function whyWrong(t: Tok[], i: number): string {
  const reg = regions(t).find(([a, b]) => i >= a && i <= b)
  if (!reg) return 'لسا في أقواس ما خلصنا منها 👀 ابدئي بالعملية اللي جوّا الأقواس (ومن الأعمق إذا في أقواس جوّا أقواس).'
  const ops: number[] = []
  for (let k = reg[0]; k <= reg[1]; k++) if (t[k].k === 'o') ops.push(k)
  const min = Math.min(...ops.map((k) => level(opAt(t, k))))
  if (level(opAt(t, i)) > min)
    return min === 0
      ? 'في قوى (أسس) هون، والقوى بتيجي قبل الضرب والجمع ⚡'
      : 'في ضرب أو قسمة هون، وهدول بيسبقوا الجمع والطرح 🏃'
  return 'هاتين العمليتين بنفس المرتبة، فنمشي من اليسار لليمين: ابدئي بالأقرب لليسار 👈'
}

export function evaluate(s: string): number {
  let t = tokenize(s)
  while (t.length > 1) {
    const [i] = allowed(t)
    if (i === undefined) throw new Error('علقنا عند: ' + show(t))
    t = apply(t, i)
  }
  const r = t[0]
  if (r.k !== 'n') throw new Error('تعبير غير صالح')
  return r.v
}

/** خطوات الحل كنصوص، لاستعمالها في التفسير */
export function trace(s: string): string[] {
  let t = tokenize(s)
  const out = [show(t)]
  while (t.length > 1) {
    const [i] = allowed(t)
    t = apply(t, i)
    out.push(show(t))
  }
  return out
}