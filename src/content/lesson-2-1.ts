import type { Lesson, Question } from '../types'
import { pick, rand } from '../lib/rng'
import { sg, sgp } from '../lib/int'

const absQ = (): Question => {
  const m = rand(1, 15)
  const n = rand(0, 1) ? m : -m
  return {
    kind: 'numeric',
    prompt: `أوجدي قيمة $|${sg(n)}|$`,
    answer: m,
    wrong: [{ value: -m, why: 'القيمة المطلقة هي **مسافة** عن الصفر، والمسافة عمرها ما تكون سالبة. بعد العدد عن الصفر هو ' + m + '.' }],
    why: `$${sg(n)}$ بعيد $${m}$ وحدة عن الصفر، فـ $|${sg(n)}| = ${m}$`,
  }
}

const absExprQ = (): Question => {
  const a = rand(1, 12) * (rand(0, 1) ? 1 : -1)
  const b = rand(1, 12) * (rand(0, 1) ? 1 : -1)
  const plus = rand(0, 1) === 1
  const A = Math.abs(a), B = Math.abs(b)
  const ans = plus ? A + B : A - B
  const op = plus ? '+' : '−'
  const raw = plus ? a + b : a - b
  const outer = Math.abs(raw)
  const wrong: { value: number; why: string }[] = []
  if (raw !== ans) wrong.push({ value: raw, why: `ما طبّقتي القيمة المطلقة أول! $|${sg(a)}| = ${A}$ و $|${sg(b)}| = ${B}$، وبعدين منحسب.` })
  if (outer !== ans && outer !== raw) wrong.push({ value: outer, why: 'القيمة المطلقة بتنحسب لكل عدد **لحاله** قبل الجمع أو الطرح (مثل الأقواس).' })
  return {
    kind: 'numeric',
    prompt: `أوجدي قيمة $|${sg(a)}| ${op} |${sg(b)}|$`,
    answer: ans,
    wrong,
    why: `$${A} ${op} ${B} = ${ans}$`,
  }
}

const SIT = [
  { s: (k: number) => `درجة الحرارة ${k} درجات **أقل** من الطبيعي`, pos: false },
  { s: (k: number) => `درجة الحرارة ${k} درجات **أعلى** من الطبيعي`, pos: true },
  { s: (k: number) => `غوّاص نزل ${k} أمتار **تحت** سطح البحر`, pos: false },
  { s: (k: number) => `طائرة ارتفعت ${k} مئات متر **فوق** مستواها`, pos: true },
  { s: (k: number) => `سحب أحمد ${k} ريالات من حسابه`, pos: false },
  { s: (k: number) => `أودع أحمد ${k} ريالات في حسابه`, pos: true },
]

const sitQ = (): Question => {
  const k = rand(2, 20), t = pick(SIT)
  const good = t.pos ? k : -k
  return {
    kind: 'choice',
    prompt: `أي عدد صحيح بيعبّر عن: ${t.s(k)} ؟`,
    options: [
      { text: `$${sgp(good)}$`, correct: true, why: t.pos ? 'زيادة أو فوق ← عدد موجب 🟢' : 'نقصان أو تحت ← عدد سالب 🔴' },
      { text: `$${sgp(-good)}$`, why: t.pos ? 'هاد الاتجاه المعاكس! الكلام عن زيادة أو "فوق"، والموجب بيعبّر عنها.' : 'هاد الاتجاه المعاكس! الكلام عن نقصان أو "تحت"، والسالب بيعبّر عنه.' },
      { text: '$0$', why: `الصفر معناه ما صار شي، وهون في تغيير بمقدار ${k}.` },
    ],
  }
}

const classifyQ = (): Question => {
  const a = rand(1, 20), b = rand(1, 20)
  const items = [
    { v: a, k: 'pos', why: 'عدد موجب (فوق الصفر)' },
    { v: -b, k: 'neg', why: 'عدد سالب (تحت الصفر)' },
    { v: 0, k: 'zero', why: 'الصفر: لا موجب ولا سالب' },
  ]
  const names: Record<string, string> = { pos: 'عدد صحيح **موجب**', neg: 'عدد صحيح **سالب**', zero: '**لا موجب ولا سالب**' }
  const want = pick(['pos', 'neg', 'zero'])
  return {
    kind: 'choice',
    prompt: `أي عدد من التالية هو ${names[want]} ؟`,
    options: items.map((it) => ({
      text: `$${sg(it.v)}$`,
      correct: it.k === want,
      why: it.k === want ? `صح! ${it.why}.` : `هاد ${it.why}، مو المطلوب.`,
    })),
  }
}

export const lesson21: Lesson = {
  id: '2-1',
  title: 'الأعداد الصحيحة والقيمة المطلقة',
  emoji: '🌡️',
  blocks: [
    {
      t: 'say', emoji: '🏗️',
      text: 'تخيّلي عمّال عم يبنوا بناية، وحفروا الأساس **٥ أمتار تحت مستوى الشارع**.\n\nكيف منكتب هالمكان برقم؟ 🤔\n\nمنستعمل رقم **سالب**: $−5$ يعني خمسة أمتار **تحت** الصفر (مستوى الشارع).',
    },
    {
      t: 'say', emoji: '♾️',
      text: 'الأعداد الصحيحة هي:\n\n$…, −3, −2, −1, 0, 1, 2, 3, …$\n\nالنقط (…) معناها إنو الأعداد بتكمّل بلا نهاية، يمين ويسار 😉',
    },
    { t: 'say', emoji: '👇', text: 'جرّبي بنفسك! اضغطي على أرقام مختلفة بالخط، واتفرجي شو بيصير:' },
    { t: 'widget', id: 'intExplorer', props: { mode: 'sign' } },
    {
      t: 'reveal', title: '🗂️ أنواع الأعداد الصحيحة',
      items: [
        { emoji: '🟢', title: 'موجبة', detail: 'أعداد **أكبر من الصفر**، على يمين الصفر.\n\nبتنكتب بإشارة (+) أو بدونها: $+3$ أو $3$' },
        { emoji: '🔴', title: 'سالبة', detail: 'أعداد **أقل من الصفر**، على يسار الصفر.\n\nلازم إشارة (−) قدّامها: $−3$' },
        { emoji: '⚪', title: 'الصفر', detail: 'مو موجب ولا سالب 😄\n\nهو الحدّ الفاصل بينهم.' },
      ],
    },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'الصفر هو عدد:',
        options: [
          { text: 'موجب', why: 'لأ! الموجبة هي اللي أكبر من الصفر، والصفر مو أكبر من نفسه.' },
          { text: 'سالب', why: 'لأ! السالبة هي اللي أقل من الصفر، والصفر مو أقل من نفسه.' },
          { text: 'لا موجب ولا سالب', correct: true, why: 'بالضبط! الصفر هو الحد الفاصل بين الموجبة والسالبة.' },
        ],
      },
    },
    {
      t: 'say', emoji: '🌍',
      text: 'الأعداد الصحيحة موجودة بحياتنا:\n\n🔼 **فوق، زيادة، ربح، إيداع** ← موجب\n\n🔽 **تحت، نقصان، خسارة، سحب** ← سالب',
    },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'معدّل درجة الحرارة هالأسبوع **٥ درجات أقل** من الطبيعي. أي عدد صحيح بيعبّر عنها؟',
        options: [
          { text: '$−5$', correct: true, why: '"أقل" يعني نقصان ← عدد سالب.' },
          { text: '$+5$', why: '$+5$ معناها ٥ درجات **أعلى** من الطبيعي، وهاد عكس المطلوب.' },
          { text: '$0$', why: 'الصفر يعني نفس الطبيعي، وهون في فرق ٥ درجات.' },
        ],
      },
    },
    { t: 'practice', gen: sitQ, count: 3, title: 'عبّري بعدد صحيح' },
    { t: 'practice', gen: classifyQ, count: 2, title: 'موجب أم سالب' },
    { t: 'say', emoji: '📍', text: 'منقدر نمثّل العدد الصحيح على **خط الأعداد** بنقطة بالمكان المناسب.\n\nجرّبي: حطّي النقطة بالمكان الصح 👇' },
    { t: 'widget', id: 'plotTask', props: { targets: [4, -6, -2, 7] } },
    {
      t: 'say', emoji: '📏',
      text: 'لاحظتي إنو $−5$ و $5$ بعيدين عن الصفر **نفس المسافة** (٥ وحدات)، بس باتجاهين مختلفين؟\n\nهالمسافة عن الصفر اسمها **القيمة المطلقة**. شوفي:',
    },
    { t: 'widget', id: 'intExplorer', props: { mode: 'abs' } },
    {
      t: 'say', tone: 'warn', emoji: '⚠️',
      text: 'منكتبها بخطين: $|−5| = 5$\n\nوبنقراها: القيمة المطلقة لـ سالب خمسة تساوي خمسة.\n\n**القيمة المطلقة هي مسافة، فعمرها ما تكون سالبة!**',
    },
    { t: 'practice', gen: absQ, count: 3, title: 'القيمة المطلقة' },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'أي عددين لهم **نفس القيمة المطلقة**؟',
        options: [
          { text: '$7$ و $−7$', correct: true, why: 'كل واحد بعيد ٧ وحدات عن الصفر، بس باتجاه مختلف.' },
          { text: '$7$ و $0$', why: 'الصفر بعيد ٠ عن الصفر، و٧ بعيد ٧.' },
          { text: '$−7$ و $−8$', why: '$|−7| = 7$ و $|−8| = 8$، مو نفس المسافة.' },
        ],
      },
    },
    {
      t: 'say', tone: 'tip', emoji: '💡',
      text: 'القيمة المطلقة مثل **الأقواس**: احسبيها أول، وبعدين كمّلي ترتيب العمليات.\n\n$|−5| − |2| = 5 − 2 = 3$',
    },
    { t: 'practice', gen: absExprQ, count: 3, title: 'عبارات فيها قيمة مطلقة' },
    {
      t: 'say', emoji: '🏁',
      text: 'خلصنا الدرس الأول من الأعداد الصحيحة! تذكري:\n\n🟢 موجب فوق الصفر، 🔴 سالب تحته، ⚪ والصفر بالنص.\n\n📏 القيمة المطلقة = **المسافة عن الصفر**، دايماً موجبة أو صفر.',
    },
  ],
}