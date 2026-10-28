import type { Lesson, Question } from '../types'
import { pick, rand } from '../lib/rng'
import { sg } from '../lib/int'

const nz = (m = 12) => rand(1, m) * (rand(0, 1) ? 1 : -1)
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

const mulQ = (): Question => {
  const a = nz(), b = nz()
  const ans = a * b
  const same = a * b > 0
  return {
    kind: 'numeric',
    prompt: `أوجدي ناتج $${sg(a)} × ${term(b)}$`,
    answer: ans,
    wrong: wr(ans, [
      { value: -ans, why: same ? 'الإشارتين **نفسها** ← الناتج **موجب**.' : 'الإشارتين **مختلفة** ← الناتج **سالب**.' },
      { value: a + b, why: 'هاد جمع! هون عم نضرب.' },
    ]),
    why: `${same ? 'نفس الإشارة ← موجب' : 'إشارتين مختلفتين ← سالب'}: $${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ans)}$ ← $${sg(ans)}$`,
  }
}

const chainQ = (): Question => {
  const n = rand(3, 4)
  const f = Array.from({ length: n }, () => nz(5))
  const ans = f.reduce((p, v) => p * v, 1)
  const negs = f.filter((v) => v < 0).length
  let run = f[0]
  const steps = [`$${sg(f[0])}$`]
  f.slice(1).forEach((v) => { run *= v; steps.push(`× ${term(v)} = $${sg(run)}$`) })
  return {
    kind: 'numeric',
    prompt: `أوجدي ناتج $${f.map((v, i) => (i ? term(v) : sg(v))).join(' × ')}$`,
    answer: ans,
    wrong: wr(ans, [{ value: -ans, why: `عدد العوامل السالبة هون **${negs}**. كل زوج منها بيعطي موجب، فالناتج ${negs % 2 === 0 ? 'موجب' : 'سالب'}.` }]),
    why: 'بنضرب خطوة خطوة من اليمين لليسار حسب الكتابة: ' + steps.join(' '),
  }
}

const powNegQ = (): Question => {
  const k = rand(2, 5), e = rand(2, 3)
  const ans = (-k) ** e
  return {
    kind: 'numeric',
    prompt: `أوجدي قيمة $(${sg(-k)})^${e}$`,
    answer: ans,
    wrong: wr(ans, [
      e === 2
        ? { value: -(k * k), why: `الأس ٢ يعني نضرب العدد بنفسه: $(${sg(-k)}) × (${sg(-k)})$ وسالب × سالب = **موجب**.` }
        : { value: k ** 3, why: `ثلاث عوامل سالبة: أول اتنين بيعطوا موجب $${k * k}$، وبعدين × $(${sg(-k)})$ = **سالب**.` },
      { value: -k * e, why: 'الأس مو ضرب! هو عدد مرات تكرار العدد كعامل.' },
    ]),
    why: e === 2
      ? `$(${sg(-k)}) × (${sg(-k)}) = ${k * k}$`
      : `$(${sg(-k)}) × (${sg(-k)}) = ${k * k}$ ثم $${k * k} × (${sg(-k)}) = ${sg(ans)}$`,
  }
}

const algMulQ = (): Question => {
  const three = rand(0, 1) === 1
  const vars = three ? ['س', 'ص', 'ع'] : pick([['س', 'ص'], ['أ', 'ب'], ['ك', 'ل']])
  const vals = vars.map(() => nz(6))
  const ans = vals.reduce((p, v) => p * v, 1)
  const negs = vals.filter((v) => v < 0).length
  return {
    kind: 'numeric',
    prompt: `احسبي قيمة $${vars.join(' ')}$ إذا كانت ${vars.map((v, i) => `$${v} = ${sg(vals[i])}$`).join('، ')}`,
    answer: ans,
    wrong: wr(ans, [
      { value: -ans, why: `بعد التعويض عندك **${negs}** عوامل سالبة، فالناتج ${negs % 2 === 0 ? 'موجب' : 'سالب'}.` },
      { value: vals.reduce((s, v) => s + v, 0), why: 'هاد جمع! الحروف المتجاورة معناها **ضرب**.' },
    ]),
    why: `نعوّض: $${vals.map((v, i) => (i ? term(v) : sg(v))).join(' × ')} = ${sg(ans)}$`,
  }
}

const applyQ = (): Question => {
  if (rand(0, 1) === 1) {
    const k = rand(2, 9), t = rand(2, 9)
    return {
      kind: 'numeric',
      prompt: `تبدأ غوّاصة الغطس من سطح الماء بسرعة $${k}$ أمتار في الدقيقة. اكتبي عمقها كعدد صحيح بعد $${t}$ دقائق.`,
      answer: -k * t,
      wrong: wr(-k * t, [{ value: k * t, why: 'العمق **تحت** سطح الماء ← عدد **سالب**.' }]),
      why: `$${t} × (−${k}) = −${k * t}$`,
    }
  }
  const n = rand(10, 50), d = rand(2, 9)
  return {
    kind: 'numeric',
    prompt: `لدى خالد $${n}$ سهماً، وانخفض سعر السهم $${d}$ ريالات. ما العدد الصحيح الذي يعبّر عن الانخفاض الكلي في قيمة أسهمه؟`,
    answer: -n * d,
    wrong: wr(-n * d, [{ value: n * d, why: 'انخفاض ← عدد **سالب**.' }]),
    why: `$${n} × (−${d}) = −${n * d}$`,
  }
}

export const lesson26: Lesson = {
  id: '2-6',
  title: 'ضرب الأعداد الصحيحة',
  emoji: '✖️',
  blocks: [
    {
      t: 'say', emoji: '📦',
      text: 'تذكّري: الضرب هو **جمع متكرر**.\n\n$4 × 3 = 3 + 3 + 3 + 3 = 12$\n\nيعني لو العدد سالب؟ $4 × (−3) = (−3) + (−3) + (−3) + (−3) = −12$\n\nجرّبي بالقطع 👇',
    },
    { t: 'widget', id: 'groupsMul' },
    {
      t: 'say', emoji: '🔴',
      text: 'شفتي؟ لما جمعنا قطع **سالبة** كتير، طلع الناتج **سالب**.\n\nوبما إنو الإبدال شغّال بالضرب: $(−3) × 4 = 4 × (−3) = −12$',
    },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'كم يساوي $3 × (−5)$ ؟',
        options: [
          { text: '$−15$', correct: true, why: '$(−5) + (−5) + (−5) = −15$ ✓' },
          { text: '$15$', why: 'جمعنا ٣ مرات العدد **السالب** $−5$، فمستحيل يطلع موجب.' },
          { text: '$−2$', why: 'هاد $3 + (−5)$ يعني جمع! بس هون ضرب.' },
        ],
      },
    },
    {
      t: 'say', emoji: '🤔',
      text: 'طيب شو بيصير لما نضرب **سالب × سالب**؟ ما منقدر نكرر الجمع "عدد سالب من المرات"!\n\nمنستعين بـ **النمط**. كمّلي الجدول 👇',
    },
    { t: 'widget', id: 'mulPattern', props: { base: -3 } },
    {
      t: 'reveal', title: '🗝️ قواعد إشارة الضرب',
      items: [
        { emoji: '🔴', title: 'إشارتين مختلفتين', detail: 'ناتج ضرب عددين **مختلفين بالإشارة** هو عدد **سالب**.\n\n$5 × (−7) = −35$\n\n$(−6) × 4 = −24$' },
        { emoji: '🟡', title: 'نفس الإشارة', detail: 'ناتج ضرب عددين **لهما نفس الإشارة** هو عدد **موجب**.\n\n$6 × 2 = 12$\n\n$(−10) × (−6) = 60$' },
        { emoji: '0️⃣', title: 'الضرب بالصفر', detail: 'ضرب أي عدد بالصفر = **صفر**.\n\n$(−7) × 0 = 0$' },
      ],
    },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'كم يساوي $(−7) × 0$ ؟',
        options: [
          { text: '$0$', correct: true, why: 'ضرب أي عدد بالصفر بيعطي صفر.' },
          { text: '$−7$', why: 'هاد $(−7) × 1$. الضرب بالصفر بيلغي كل شي.' },
          { text: '$7$', why: 'مستحيل! ما في سبب يطلع موجب.' },
        ],
      },
    },
    { t: 'practice', gen: mulQ, count: 5, title: 'اضربي' },
    {
      t: 'say', emoji: '⚡',
      text: 'القوى مع العدد السالب: الأس بيقلّك كم مرة منضرب العدد بنفسه.\n\n$(−4)^2 = (−4) × (−4) = 16$ ← موجب\n\n$(−2)^3 = (−2) × (−2) × (−2) = 4 × (−2) = −8$ ← سالب',
    },
    { t: 'practice', gen: powNegQ, count: 2, title: 'قوى سالبة' },
    {
      t: 'say', emoji: '🔗',
      text: 'وإذا كان عندنا **أكتر من عاملين**؟ منضرب خطوة خطوة.\n\n$(−3) × (−4) × (−2) = 12 × (−2) = −24$\n\n💡 حيلة: كل **زوج** من العوامل السالبة بيعطي موجب، فعدّي السالبات: زوجي ← موجب، فردي ← سالب.',
    },
    { t: 'practice', gen: chainQ, count: 3, title: 'عوامل متعددة' },
    {
      t: 'say', emoji: '🔤',
      text: 'والمتغيرات؟ الحروف المتجاورة معناها **ضرب**: $س ص$ يعني $س × ص$.\n\nنعوّض ونضرب 👇',
    },
    { t: 'practice', gen: algMulQ, count: 3, title: 'عوّضي واضربي' },
    { t: 'practice', gen: applyQ, count: 2, title: 'من الحياة' },
    {
      t: 'say', emoji: '🏁',
      text: 'ممتاز! تذكّري:\n\n🟡 نفس الإشارة ← **موجب**\n\n🔴 إشارتين مختلفتين ← **سالب**\n\n0️⃣ أي عدد × صفر = **صفر**',
    },
  ],
}