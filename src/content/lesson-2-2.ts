import type { Lesson, Question } from '../types'
import { rand } from '../lib/rng'
import { sg } from '../lib/int'

const cmpQ = (): Question => {
  const bothNeg = rand(0, 2) > 0
  let a: number, b: number
  do {
    a = bothNeg ? -rand(1, 15) : rand(-15, 15)
    b = bothNeg ? -rand(1, 15) : rand(-15, 15)
  } while (a === b)
  const lt = a < b
  const expl =
    `على خط الأعداد، $${sg(a)}$ يقع ${lt ? 'على **يسار**' : 'على **يمين**'} $${sg(b)}$، فهو ${lt ? 'أقل' : 'أكبر'} منه: $${sg(a)} ${lt ? '<' : '>'} ${sg(b)}$` +
    (bothNeg ? '\n(بين السالبات: الأبعد عن الصفر هو الأصغر)' : '')
  return {
    kind: 'choice',
    prompt: `ضعي إشارة < أو > ليصبح صحيحاً:\n$${sg(a)} ● ${sg(b)}$`,
    options: [
      { text: '$<$', correct: lt, why: expl },
      { text: '$>$', correct: !lt, why: expl },
    ],
  }
}

const orderQ = (): Question => {
  const asc = rand(0, 1) === 1
  const set = new Set<number>()
  while (set.size < 4) set.add(rand(-15, 15))
  const nums = [...set]
  const cmp = (a: number, b: number) => (asc ? a - b : b - a)
  const sorted = [...nums].sort(cmp)
  const rev = [...sorted].reverse()
  const byAbs = [...nums].sort((a, b) => (asc ? Math.abs(a) - Math.abs(b) : Math.abs(b) - Math.abs(a)))
  const swap = [...sorted]
  ;[swap[1], swap[2]] = [swap[2], swap[1]]
  const fmt = (xs: number[]) => `$${xs.map(sg).join('، ')}$`

  const cand = [
    { list: sorted, ok: true, why: 'صح! رتّبتيهم حسب موقعهم على خط الأعداد.' },
    { list: rev, ok: false, why: `عكستي الترتيب! المطلوب من ${asc ? 'الأصغر إلى الأكبر' : 'الأكبر إلى الأصغر'}.` },
    { list: byAbs, ok: false, why: 'رتّبتيهم حسب **البعد عن الصفر** (القيمة المطلقة). بس الترتيب بيكون حسب موقعهم على الخط: كل ما رحنا يمين العدد بيكبر.' },
    { list: swap, ok: false, why: 'بدّلتي مكان عددين قريبين من بعض. حطّيهم على الخط وتأكدي مين على اليمين.' },
  ]
  const seen = new Set<string>()
  const options = cand
    .filter((c) => (seen.has(c.list.join()) ? false : (seen.add(c.list.join()), true)))
    .map((c) => ({ text: fmt(c.list), correct: c.ok, why: c.why }))

  return {
    kind: 'choice',
    prompt: `رتّبي الأعداد التالية من ${asc ? 'الأصغر إلى الأكبر' : 'الأكبر إلى الأصغر'}:\n${fmt(nums)}`,
    options,
  }
}

export const lesson22: Lesson = {
  id: '2-2',
  title: 'مقارنة الأعداد الصحيحة وترتيبها',
  emoji: '⚖️',
  blocks: [
    {
      t: 'say', emoji: '🥶',
      text: 'بيوم شتوي: درجة الحرارة بعمّان $−6$ وببيروت $−12$.\n\nأي مدينة **أبرد**؟ فكّري شوي 👇',
    },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'عمّان $−6$ أم بيروت $−12$ ؟ أيهما أبرد؟',
        options: [
          { text: 'بيروت (−12)', correct: true, why: 'صح! $−12$ أبعد عن الصفر باتجاه "تحت"، يعني أبرد. فـ $−12$ **أقل** من $−6$.' },
          { text: 'عمّان (−6)', why: 'كتير ناس بيفكروا هيك لأنو ٦ أقل من ١٢! بس مع السالب بيصير العكس: $−6$ أقرب للصفر، يعني أدفأ.' },
          { text: 'نفس الدرجة', why: 'مو نفسها: $−12$ و $−6$ عددين مختلفين.' },
        ],
      },
    },
    { t: 'say', emoji: '🔍', text: 'الجواب مو دايماً بديهي، عشان هيك منستعين بـ **خط الأعداد**.\n\nاضغطي على عددين، وشوفي مين على اليمين 👇' },
    { t: 'widget', id: 'compareLine' },
    {
      t: 'reveal', title: '🗝️ قواعد المقارنة',
      items: [
        { emoji: '👉', title: 'اليمين أكبر', detail: 'العدد اللي **على يمين** عدد تاني على خط الأعداد هو الأكبر.\n\nيعني $−2$ أكبر من $−4$ لأنو على يمينه.' },
        { emoji: '❄️', title: 'بين السالبات', detail: 'كل ما كان الرقم (بدون إشارة) **أكبر**، كل ما صار العدد **أصغر**، لأنو بيبعد أكتر عن الصفر باتجاه "تحت".\n\n$−8 < −3$' },
        { emoji: '🐊', title: 'الرمزين < >', detail: 'منقرأ **<** "أقل من" و **>** "أكبر من".\n\nفتحة الرمز (التمساح 🐊) دايماً باتجاه **العدد الأكبر**.\n\n$−4 < −2$ و $−2 > −4$' },
        { emoji: '🟢', title: 'موجب وسالب', detail: 'أي عدد **موجب** أكبر من أي عدد **سالب**.\n\nوالصفر أكبر من كل السالبة وأقل من كل الموجبة.' },
      ],
    },
    { t: 'practice', gen: cmpQ, count: 4, title: 'قارني' },
    { t: 'say', emoji: '🔢', text: 'هلأ منرتّب عدة أعداد. **طريقة سهلة:** تخيّليهم على خط الأعداد، وسمّيهم من اليسار لليمين من الأصغر للأكبر.\n\nجرّبي بالضغط 👇' },
    { t: 'widget', id: 'orderTask', props: { dir: 'asc', sets: [[3, -2, 0], [-5, 4, -1, -8]] } },
    { t: 'say', emoji: '🔄', text: 'وإذا طلبوا من **الأكبر إلى الأصغر**؟ منبلّش من اليمين 👉' },
    { t: 'widget', id: 'orderTask', props: { dir: 'desc', sets: [[-7, 2, -3, 6]] } },
    { t: 'practice', gen: orderQ, count: 3, title: 'رتّبي' },
    {
      t: 'say', tone: 'tip', emoji: '💡',
      text: 'نصيحة للاختبارات: إذا عرفتي إنو عدد أصغر من عدد تاني، **احذفي** الخيارات اللي بتعاكس هالشي، وبتقل الاختيارات 😉',
    },
    {
      t: 'say', emoji: '🏁',
      text: 'خلصنا! تذكري:\n\n👉 **الأيمن دايماً أكبر**\n\n❄️ بين السالبات، الأبعد عن الصفر هو **الأصغر**\n\n🟢 كل موجب أكبر من كل سالب',
    },
  ],
}