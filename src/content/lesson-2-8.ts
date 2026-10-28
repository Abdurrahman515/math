import type { Lesson, Question } from '../types'
import { pick, rand } from '../lib/rng'
import { sg } from '../lib/int'

const nz = (m = 9) => rand(2, m) * (rand(0, 1) ? 1 : -1)
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

const divQ = (): Question => {
  const d = nz(), q = nz(), D = d * q
  const same = d * q > 0
  return {
    kind: 'numeric',
    prompt: `أوجدي ناتج $${sg(D)} ÷ ${term(d)}$`,
    answer: q,
    wrong: wr(q, [
      { value: -q, why: same ? 'الإشارتين **نفسها** ← ناتج القسمة **موجب**.' : 'الإشارتين **مختلفة** ← ناتج القسمة **سالب**.' },
      { value: D * d, why: 'هاد ضرب! هون عم نقسم.' },
    ]),
    why: `${same ? 'نفس الإشارة ← موجب' : 'إشارتين مختلفتين ← سالب'}: $${Math.abs(D)} ÷ ${Math.abs(d)} = ${Math.abs(q)}$ ← $${sg(q)}$\nتحقّقي بالضرب: $${term(q)} × ${term(d)} = ${sg(D)}$ ✓`,
  }
}

const relQ = (): Question => {
  const d = rand(2, 9) * (rand(0, 1) ? 1 : -1)
  const q = rand(2, 9) * (rand(0, 1) ? 1 : -1)
  const D = d * q
  const cand = [
    { t: `${term(d)} × ${term(q)} = ${sg(D)}`, ok: true, why: 'صح! ضرب المقسوم عليه بالناتج بيرجّعنا للمقسوم.' },
    { t: `${term(d)} × ${term(-q)} = ${sg(D)}`, ok: false, why: `هاد الضرب بيعطي $${sg(-D)}$ مو $${sg(D)}$، لأنو الإشارة معكوسة.` },
    { t: `${term(D)} × ${term(d)} = ${sg(q)}`, ok: false, why: 'الناتج بالقسمة هو أحد **عاملي** الضرب، مو ناتج الضرب نفسو.' },
    { t: `${term(q)} + ${term(d)} = ${sg(D)}`, ok: false, why: 'هاد جمع! القسمة مرتبطة بالضرب.' },
  ]
  const seen = new Set<string>()
  return {
    kind: 'choice',
    prompt: `أي جملة ضرب مرتبطة بـ $${sg(D)} ÷ ${term(d)} = ${sg(q)}$ ؟`,
    options: cand
      .filter((c) => (seen.has(c.t) ? false : (seen.add(c.t), true)))
      .map((c) => ({ text: `$${c.t}$`, correct: c.ok, why: c.why })),
  }
}

const algDivQ = (): Question => {
  const d = nz(), q = nz(), D = d * q
  if (rand(0, 1) === 1) {
    const v = pick(['س', 'ص', 'ب', 'ك'])
    return {
      kind: 'numeric',
      prompt: `احسبي قيمة $${sg(D)} ÷ ${v}$ إذا كانت $${v} = ${sg(d)}$`,
      answer: q,
      wrong: wr(q, [{ value: -q, why: `بعد التعويض: $${sg(D)} ÷ ${term(d)}$ ← ${d * q > 0 ? 'نفس الإشارة ← موجب' : 'إشارتين مختلفتين ← سالب'}.` }]),
      why: `نعوّض: $${sg(D)} ÷ ${term(d)} = ${sg(q)}$`,
    }
  }
  return {
    kind: 'numeric',
    prompt: `احسبي قيمة $أ ÷ ب$ إذا كانت $أ = ${sg(D)}$ و $ب = ${sg(d)}$`,
    answer: q,
    wrong: wr(q, [
      { value: -q, why: `بعد التعويض: $${sg(D)} ÷ ${term(d)}$ ← ${d * q > 0 ? 'نفس الإشارة ← موجب' : 'إشارتين مختلفتين ← سالب'}.` },
      { value: d / (D || 1) === q ? 0 : Math.round((d / D) * 100) / 100, why: 'قلبتي الترتيب! $أ$ هي المقسوم و $ب$ المقسوم عليه.' },
    ]),
    why: `نعوّض: $${sg(D)} ÷ ${term(d)} = ${sg(q)}$`,
  }
}

const applyQ = (): Question => {
  const t = rand(2, 9), m = rand(2, 9)
  const total = t * m
  return {
    kind: 'numeric',
    prompt: `نزلت غوّاصة إلى عمق $${total}$ متراً **تحت** سطح الماء خلال $${t}$ دقائق بمعدل ثابت. ما العدد الصحيح الذي يعبّر عن تغيّر عمقها في الدقيقة الواحدة؟`,
    answer: -m,
    wrong: wr(-m, [{ value: m, why: 'نزول ← عدد **سالب**.' }]),
    why: `$−${total} ÷ ${t} = −${m}$`,
  }
}

export const lesson28: Lesson = {
  id: '2-8',
  title: 'قسمة الأعداد الصحيحة',
  emoji: '➗',
  blocks: [
    {
      t: 'say', emoji: '🍰',
      text: 'القسمة = **توزيع بالتساوي**.\n\nعندنا ٨ قطع سالبة ➖ ووزّعناها على مجموعتين متساويتين؟ كل مجموعة صارت ٤ قطع سالبة، يعني $−8 ÷ 2 = −4$.\n\nجرّبي بنفسك 👇',
    },
    { t: 'widget', id: 'chipsDiv' },
    {
      t: 'say', emoji: '🔗',
      text: 'القسمة والضرب **أصحاب**! كل جملة قسمة بتقابلها جملة ضرب:\n\n$2 × 6 = 12$ ← $12 ÷ 2 = 6$ و $12 ÷ 6 = 2$\n\nيعني: لما نسأل $−12 ÷ 3$ نقصد: **أي عدد × ٣ = −١٢؟** الجواب $−4$.',
    },
    {
      t: 'reveal', title: '🗝️ قواعد إشارة القسمة',
      items: [
        { emoji: '🔴', title: 'إشارتين مختلفتين', detail: 'ناتج قسمة عددين **مختلفين بالإشارة** هو عدد **سالب**.\n\n$−64 ÷ 8 = −8$\n\n$33 ÷ (−11) = −3$' },
        { emoji: '🟡', title: 'نفس الإشارة', detail: 'ناتج قسمة عددين **لهما نفس الإشارة** هو عدد **موجب**.\n\n$15 ÷ 5 = 3$\n\n$−64 ÷ (−8) = 8$' },
        { emoji: '➗', title: 'القسمة ككسر', detail: 'الخط الأفقي بين عددين معناه **قسمة**: ${a/b}$ يعني $a ÷ b$.\n\nفإذا شفتي $−55$ فوق $11$ فهي $−55 ÷ 11 = −5$.' },
      ],
    },
    { t: 'practice', gen: relQ, count: 2, title: 'ربط القسمة بالضرب' },
    { t: 'practice', gen: divQ, count: 5, title: 'اقسمي' },
    {
      t: 'say', tone: 'tip', emoji: '💡',
      text: 'عندك شك بجوابك؟ **تحقّقي بالضرب**: الناتج × المقسوم عليه لازم يرجّع المقسوم.\n\n$−18 ÷ 3 = −6$ ← تحقّق: $(−6) × 3 = −18$ ✓',
    },
    {
      t: 'say', emoji: '🔤',
      text: 'والمتغيرات: نعوّض القيم أول، وبعدين نقسم.\n\nمثلاً $−16 ÷ س$ إذا كانت $س = −4$ :\n\n$−16 ÷ (−4) = 4$',
    },
    { t: 'practice', gen: algDivQ, count: 3, title: 'عوّضي واقسمي' },
    { t: 'practice', gen: applyQ, count: 2, title: 'من الحياة' },
    {
      t: 'say', emoji: '🏁',
      text: 'ختمنا عمليات الأعداد الصحيحة! الخلاصة:\n\n🟡 **نفس الإشارة** ← موجب (ضرب وقسمة)\n\n🔴 **إشارتين مختلفتين** ← سالب (ضرب وقسمة)\n\n🔗 القسمة تُتحقّق بالضرب 😉',
    },
  ],
}