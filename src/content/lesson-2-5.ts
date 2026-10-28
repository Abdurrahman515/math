import type { Lesson, Question } from '../types'
import { pick, rand } from '../lib/rng'
import { sg } from '../lib/int'

const nz = () => rand(1, 15) * (rand(0, 1) ? 1 : -1)
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

const subQ = (): Question => {
  const a = nz(), b = nz()
  const ans = a - b
  return {
    kind: 'numeric',
    prompt: `أوجدي ناتج $${sg(a)} − ${term(b)}$`,
    answer: ans,
    wrong: wr(ans, [
      { value: a + b, why: 'ما عكستي إشارة المطروح! الطرح معناه نجمع **معكوس** العدد التاني.' },
      { value: b - a, why: 'قلبتي الترتيب! منبلّش من العدد الأول (المطروح منه) وبنطرح منو التاني.' },
    ]),
    why: `نحوّل الطرح لجمع المعكوس: $${sg(a)} + ${term(-b)} = ${sg(ans)}$`,
  }
}

const rewriteQ = (): Question => {
  const a = nz(), b = nz()
  const cand = [
    { t: `${sg(a)} + ${term(-b)}`, ok: true, why: 'صح! الطرح = جمع **معكوس** العدد التاني.' },
    { t: `${sg(a)} + ${term(b)}`, ok: false, why: 'نسيتي تعكسي إشارة العدد التاني! لازم نجمع **معكوسو** مو نفسو.' },
    { t: `${sg(-a)} + ${term(b)}`, ok: false, why: 'عكستي إشارة العدد **الأول**! المعكوس بيكون للعدد اللي بعد إشارة الطرح.' },
    { t: `${sg(-a)} + ${term(-b)}`, ok: false, why: 'عكستي الاتنين! بس العدد التاني (المطروح) هو اللي بنعكسو.' },
  ]
  const seen = new Set<string>()
  return {
    kind: 'choice',
    prompt: `أي جملة جمع **تكافئ** $${sg(a)} − ${term(b)}$ ؟`,
    options: cand
      .filter((c) => (seen.has(c.t) ? false : (seen.add(c.t), true)))
      .map((c) => ({ text: `$${c.t}$`, correct: c.ok, why: c.why })),
  }
}

const PAIRS = [['س', 'ص'], ['ك', 'ل'], ['أ', 'ب'], ['ف', 'ق']]
const algSubQ = (): Question => {
  const [u, v] = pick(PAIRS)
  const x = nz(), y = nz()
  const ans = x - y
  return {
    kind: 'numeric',
    prompt: `احسبي قيمة $${u} − ${v}$ إذا كانت $${u} = ${sg(x)}$ و $${v} = ${sg(y)}$`,
    answer: ans,
    wrong: wr(ans, [
      { value: x + y, why: 'ما عكستي إشارة المطروح! بعد التعويض بيصير الطرح جمع المعكوس.' },
      { value: y - x, why: `قلبتي الترتيب! الجملة هي $${u} − ${v}$ يعني $${sg(x)} − ${term(y)}$.` },
    ]),
    why: `نعوّض: $${sg(x)} − ${term(y)} = ${sg(x)} + ${term(-y)} = ${sg(ans)}$`,
  }
}

const verticalQ = (): Question => {
  const h = rand(2, 9) * 50, d = rand(2, 9) * 50
  return {
    kind: 'numeric',
    prompt: `طائرة على ارتفاع $${h}$ متراً **فوق** سطح البحر، وغوّاصة على عمق $${d}$ متراً **تحت** سطح البحر. أوجدي البعد الرأسي بينهما.`,
    answer: h + d,
    wrong: wr(h + d, [
      { value: h - d, why: `العمق **تحت** الصفر، يعني $−${d}$. نطرح: $${h} − (−${d})$ وهاد بيصير جمع.` },
      { value: d - h, why: 'الفرق بين الأعلى والأدنى: نطرح الأدنى من الأعلى، مو العكس.' },
    ]),
    why: `الأعلى $${h}$ والأدنى $−${d}$: $${h} − (−${d}) = ${h} + ${d} = ${h + d}$`,
  }
}

export const lesson25: Lesson = {
  id: '2-5',
  title: 'طرح الأعداد الصحيحة',
  emoji: '➖',
  blocks: [
    { t: 'say', emoji: '🤔', text: 'تذكّري: الطرح معناه **الحذف**.\n\nبس شو بيصير لما بدنا نحذف شي مو موجود؟ مثلاً $6 − 7$ ؟ خلينا نكتشف 👇' },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'خمّني: كم يساوي $6 − 7$ ؟',
        options: [
          { text: '$−1$', correct: true, why: 'صح! منبلّش من ٦ وبنرجع ٧ خطوات للخلف، فبنعدّي الصفر ونوصل لـ $−1$.' },
          { text: '$1$', why: 'قلبتي الترتيب! $7 − 6 = 1$ بس إحنا عم نطرح ٧ من ٦.' },
          { text: '$13$', why: 'هاد جمع مو طرح!' },
        ],
      },
    },
    { t: 'say', emoji: '🧹', text: 'رجعنا لقطع العد: **➕ = ١** و **➖ = −١**.\n\nالطرح = **نشيل** قطع. وإذا ما في قطع كافية؟ منضيف **أزواج صفرية** (➕➖) لأنها ما بتغيّر القيمة 🪄\n\nجرّبي هالأربع حالات 👇' },
    { t: 'widget', id: 'chipsSub', props: { tasks: [[5, 2], [4, -3], [-6, -3], [-5, 1]] } },
    {
      t: 'say', emoji: '😮',
      text: 'لاحظتي شي غريب؟\n\n$4 − (−3)$ طلع **٧**، ونفسها $4 + 3$ !\n\n$−5 − 1$ طلع **−٦**، ونفسها $−5 + (−1)$ !\n\nما هي صدفة، هاي قاعدة 👇',
    },
    {
      t: 'reveal', title: '🗝️ قاعدة الطرح',
      items: [
        { emoji: '🔄', title: 'الطرح = جمع المعكوس', detail: 'لطرح عدد صحيح من آخر، **نضيف معكوس** العدد التاني للأول.\n\n$a − b = a + (−b)$\n\n$9 − 4 = 9 + (−4) = 5$\n\n$5 − (−9) = 5 + 9 = 14$' },
        { emoji: '🏷️', title: 'أسماء الأعداد', detail: 'في $−5 − 1 = −6$ :\n\n**المطروح منه** هو $−5$ (الأول)\n\n**المطروح** هو $1$ (اللي بعد إشارة الطرح)\n\n**الفرق** هو $−6$ (النتيجة)' },
        { emoji: '⚠️', title: 'انتبهي!', detail: 'بنعكس إشارة **التاني** بس (المطروح)، مو الأول.\n\n$−10 − (−7) = −10 + 7 = −3$\n\n$−10 − 7 = −10 + (−7) = −17$' },
      ],
    },
    { t: 'say', emoji: '↔️', text: 'وعلى خط الأعداد؟ السهم التاني بيمشي **بعكس** اتجاه المطروح. جرّبي 👇' },
    { t: 'widget', id: 'subLine' },
    { t: 'practice', gen: rewriteQ, count: 2, title: 'حوّلي الطرح لجمع' },
    { t: 'practice', gen: subQ, count: 5, title: 'اطرحي' },
    {
      t: 'say', emoji: '🔤',
      text: 'ممكن نطرح بالمتغيرات كمان: منعوّض القيم أول، وبعدين منطرح.\n\nمثلاً إذا كانت $س = −6$ و $ص = −5$ :\n\n$س − ص = −6 − (−5) = −6 + 5 = −1$',
    },
    { t: 'practice', gen: algSubQ, count: 3, title: 'عوّضي واطرحي' },
    {
      t: 'say', emoji: '🌡️',
      text: 'من الحياة: درجة حرارة القمر بتتراوح بين $−173$ و $127$ درجة سيلزيوس.\n\nالفرق بين العظمى والصغرى: $127 − (−173) = 127 + 173 = 300$ درجة 😮\n\n**الفرق بين الأعلى والأدنى = الأعلى − الأدنى.**',
    },
    { t: 'practice', gen: verticalQ, count: 2, title: 'البعد بين مستويين' },
    {
      t: 'say', emoji: '🏁',
      text: 'خلصنا الطرح! الخلاصة:\n\n🔄 $a − b = a + (−b)$ ← **ننقل للجمع بالمعكوس**\n\n⚠️ بنعكس **التاني** بس\n\n📏 الفرق بين الأعلى والأدنى: **الأعلى − الأدنى**',
    },
  ],
}