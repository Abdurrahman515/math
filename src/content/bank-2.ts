import type { Question } from '../types'
import type { PoolItem } from '../lib/exam'
import { rand } from '../lib/rng'
import { sg } from '../lib/int'

const nz = (m = 9) => rand(2, m) * (rand(0, 1) ? 1 : -1)
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

// عبارة جمع تمثّل رصيداً (إيداع موجب، سحب سالب)
const balanceQ = (): Question => {
  const open = rand(2, 9) * 500, dep = rand(1, 5) * 500, wd = rand(1, 4) * 250
  const cand = [
    { t: `${open} + ${dep} + (−${wd})`, ok: true, why: 'صح! الإيداع **موجب** والسحب **سالب**.' },
    { t: `${open} + ${dep} + ${wd}`, ok: false, why: 'السحب **بينقص** من الحساب، فهو عدد سالب.' },
    { t: `${open} + (−${dep}) + ${wd}`, ok: false, why: 'عكستي الإشارات! الإيداع موجب (بيزيد) والسحب هو السالب.' },
    { t: `${open} + (−${dep}) + (−${wd})`, ok: false, why: 'الإيداع الثاني **بيزيد** الرصيد، فهو موجب.' },
  ]
  return {
    kind: 'choice',
    prompt: `فتحت سعاد حساباً بنكياً وأودعت فيه $${open}$ ريال، ثم أودعت $${dep}$ ريال، وسحبت $${wd}$ ريال. ما العبارة التي تمثّل المبلغ الموجود في حسابها الآن؟`,
    options: cand.map((c) => ({ text: `$${c.t}$`, correct: c.ok, why: c.why })),
  }
}

// ترتيب العمليات مع الأعداد الصحيحة (يجمع ١-٣ و٢-٦)
const mixedQ = (): Question => {
  const a = nz(9), b = nz(5), c = nz(5)
  const ans = a + b * c
  return {
    kind: 'numeric',
    prompt: `احسبي: $${sg(a)} + ${term(b)} × ${term(c)}$`,
    answer: ans,
    wrong: wr(ans, [
      { value: (a + b) * c, why: 'نسيتي **ترتيب العمليات**: الضرب قبل الجمع.' },
      { value: a + b + c, why: 'هاد جمع! الإشارة بين الاتنين الأخيرين ضرب.' },
    ]),
    why: `الضرب أول: $${term(b)} × ${term(c)} = ${sg(b * c)}$ ثم $${sg(a)} + ${term(b * c)} = ${sg(ans)}$`,
  }
}

export const bank2: PoolItem[] = [
  { lesson: '2-4', gen: balanceQ },
  { lesson: '2-6', gen: mixedQ },
]