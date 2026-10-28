import type { Lesson, Question } from '../types'
import { pick, rand } from '../lib/rng'
import { fr } from '../lib/dec'

const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

type U = { big: string; small: string; bigPl: string; smallPl: string; f: number; max: number }
const U: U[] = [
  { big: 'ياردة', small: 'قدم', bigPl: 'ياردات', smallPl: 'أقدام', f: 3, max: 20 },
  { big: 'قدم', small: 'بوصة', bigPl: 'أقدام', smallPl: 'بوصات', f: 12, max: 15 },
  { big: 'رطل', small: 'أوقية', bigPl: 'أرطال', smallPl: 'أوقية', f: 16, max: 12 },
  { big: 'طن', small: 'رطل', bigPl: 'أطنان', smallPl: 'أرطال', f: 2000, max: 9 },
  { big: 'ميل', small: 'قدم', bigPl: 'أميال', smallPl: 'أقدام', f: 5280, max: 4 },
]
const FACTORS = [3, 12, 16, 2000, 5280]

// من وحدة أكبر إلى أصغر
const toSmallQ = (): Question => {
  const u = pick(U), n = rand(2, u.max), ans = n * u.f
  const g = pick(FACTORS.filter((f) => f !== u.f))
  return {
    kind: 'numeric',
    prompt: `حوّلي $${n}$ ${u.bigPl} إلى ${u.smallPl}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: n + u.f, why: 'هاد جمع! 😅 نحوّل بالضرب بمعدل الوحدة.' },
      { value: n * g, why: `استعملتي علاقة وحدة تانية! 🔍 هون ١ ${u.big} = $${u.f}$ ${u.smallPl}.` },
      { value: Math.round((n / u.f) * 1000) / 1000, why: 'قسمتي! 🔄 لما نروح من وحدة **أكبر** لأصغر، العدد **بيكبر** فنضرب.' },
    ]),
    why: `نضرب بمعدل الوحدة $${fr(`${u.f} ${u.small}`, `1 ${u.big}`)}$ فتختفي وحدة ${u.big}:\n\n$${n} × ${u.f} = ${ans}$ ${u.smallPl} ✔️`,
  }
}

// من وحدة أصغر إلى أكبر
const toBigQ = (): Question => {
  const u = pick(U), k = rand(2, Math.min(u.max, 12)), given = k * u.f
  return {
    kind: 'numeric',
    prompt: `حوّلي $${given}$ ${u.smallPl} إلى ${u.bigPl}.`,
    answer: k,
    wrong: wr(k, [
      { value: given * u.f, why: 'ضربتي! 😅 لما نروح من وحدة **أصغر** لأكبر، العدد **بيصغر** فنقسم.' },
      { value: given - u.f, why: 'هاد طرح! التحويل بين الوحدات بالضرب أو بالقسمة 💡' },
    ]),
    why: `نضرب بمقلوب معدل الوحدة $${fr(`1 ${u.big}`, `${u.f} ${u.small}`)}$ فتختفي وحدة ${u.small}، وهاد يعني نقسم:\n\n$${given} ÷ ${u.f} = ${k}$ ${u.bigPl} ✔️`,
  }
}

// أي عامل نضرب فيه؟
const chooseFactorQ = (): Question => {
  const u = pick(U), fromBig = rand(0, 1) === 1
  const n = fromBig ? rand(2, 6) : rand(2, 6) * u.f
  const given = fromBig ? u.bigPl : u.smallPl
  const target = fromBig ? u.smallPl : u.bigPl
  const A = fr(`${u.f} ${u.small}`, `1 ${u.big}`)
  const B = fr(`1 ${u.big}`, `${u.f} ${u.small}`)
  const g = pick(FACTORS.filter((f) => f !== u.f))
  const C = fr(`${g} ${u.small}`, `1 ${u.big}`)
  return {
    kind: 'choice',
    prompt: `لتحويل $${n}$ ${given} إلى ${target}، أي عامل ضرب نستعمله؟`,
    options: [
      { text: `$${fromBig ? A : B}$`, correct: true,
        why: `برافو! 🎉 وحدة ${fromBig ? u.big : u.small} بالمقام، فبتختفي ونضل مع ${fromBig ? u.small : u.big} ✔️` },
      { text: `$${fromBig ? B : A}$`, why: `هاد **مقلوب** العامل الصح! 🔄 لازم وحدة ${fromBig ? u.big : u.small} تكون بالمقام لتختفي.` },
      { text: `$${C}$`, why: `هالعلاقة غلط! ❌ ١ ${u.big} = $${u.f}$ ${u.small}، مو $${g}$.` },
      { text: `$${fr(`1 ${u.small}`, `1 ${u.big}`)}$`, why: 'العلاقة بين الوحدتين مو ١ لـ١! 😊 لازم نستعمل العدد الصح من الجدول.' },
    ],
  }
}

// كسر من الطن
const fracTonQ = (): Question => {
  const [p, q] = pick([[1, 2], [1, 4], [3, 4], [1, 8], [3, 8]])
  const ans = (p * 2000) / q
  return {
    kind: 'numeric',
    prompt: `وزن حوت صغير $${fr(p, q)}$ طن. كم رطلاً يزن (١ طن = ٢٠٠٠ رطل)؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: p * 2000, why: `نسيتي تقسمي على $${q}$! 😅 ضربنا الجزء بس بالبسط.` },
      { value: (2000 / q), why: p === 1 ? 'تمام هاي الجواب!' : `نسيتي تضربي بالبسط $${p}$! 🔍` },
      { value: 2000 + p / q, why: 'هاد جمع! نضرب بمعدل الوحدة 💡' },
    ]),
    why: `نضرب في $${fr('2000 رطل', '1 طن')}$:\n\n$${fr(p, q)} × 2000 = ${fr(p * 2000, q)} = ${ans}$ رطل ✔️`,
  }
}

// معدل السرعة: قدم/ثانية إلى قدم/ساعة
const speedQ = (): Question => {
  const n = rand(2, 9), ans = n * 3600
  return {
    kind: 'numeric',
    prompt: `يمشي فهد بسرعة $${n}$ أقدام في الثانية. كم قدماً يمشي في الساعة؟ (١ ساعة = ٣٦٠٠ ثانية)`,
    answer: ans,
    wrong: wr(ans, [
      { value: n * 60, why: 'حوّلتي لدقائق بس! ⏱️ الساعة فيها $60$ دقيقة، وكل دقيقة $60$ ثانية.' },
      { value: Math.round((n / 3600) * 100000) / 100000, why: 'قسمتي! 🔄 بالساعة بيمشي **أكتر** من بالثانية، فنضرب.' },
      { value: n + 3600, why: 'هاد جمع! نضرب بعدد الثواني بالساعة 💡' },
    ]),
    why: `نضرب في $${fr('3600 ثانية', '1 ساعة')}$ فتختفي الثواني:\n\n$${n} × 3600 = ${ans}$ قدم بالساعة ✔️`,
  }
}

export const lesson43: Lesson = {
  id: '4-3',
  title: 'القياس: التحويل بين الوحدات الإنجليزية',
  emoji: '📏',
  blocks: [
    {
      t: 'say', emoji: '🐘',
      text: 'الفيل الأفريقي كتلته حوالي **٨ أطنان**. 🐘\n\nلو بدنا نعرف كم **رطل** يزن؟ لازم نحوّل من وحدة لوحدة.\n\nالطن الواحد = $2000$ رطل. جدول النسبة بيساعدنا:\n\n١ طن ← ٢٠٠٠ رطل\n\n٤ أطنان ← ٨٠٠٠ رطل\n\n٨ أطنان ← $8 × 2000 = 16000$ رطل 🎯\n\nكل ما ضربنا الطن بعدد، بنضرب الأرطال بنفس العدد: **نسب متكافئة**!',
    },
    {
      t: 'reveal', title: '📋 الوحدات الإنجليزية (حفظيها بالمثال)',
      items: [
        { emoji: '👣', title: 'القدم', detail: '١ قدم = ١٢ بوصة' },
        { emoji: '📏', title: 'الياردة', detail: '١ ياردة = ٣ أقدام' },
        { emoji: '🛣️', title: 'الميل', detail: '١ ميل = ٥٢٨٠ قدماً' },
        { emoji: '⚖️', title: 'الرطل', detail: '١ رطل = ١٦ أوقية' },
        { emoji: '🚛', title: 'الطن', detail: '١ طن = ٢٠٠٠ رطل' },
      ],
    },
    {
      t: 'say', emoji: '💡', tone: 'tip',
      text: 'كل علاقة بنقدر نكتبها كـ**معدل وحدة** (مقامه واحد):\n\n${3 أقدام/1 ياردة}$ و ${2000 رطل/1 طن}$\n\nالبسط والمقام **متكافئان** (نفس الكمية بوحدتين)، يعني قيمة الكسر = **١**.\n\nولأن الضرب في ١ ما بيغيّر القيمة، بنقدر نضرب فيه ونحوّل الوحدة بأمان! ✨',
    },
    {
      t: 'say', emoji: '👣',
      text: 'مثال: حوّلي **٢٠ قدماً** إلى بوصات.\n\nنضرب في ${12 بوصة/1 قدم}$ لأن وحدة **القدم** لازم تكون بالمقام لتختفي:\n\n$20 قدم × {12 بوصة/1 قدم} = 20 × 12 = 240$ بوصة ✅',
    },
    { t: 'widget', id: 'convertSteps', props: { problems: [
      { n: 20, from: 'big', big: 'قدم', small: 'بوصة', f: 12 },
      { n: 5, from: 'big', big: 'ياردة', small: 'قدم', f: 3 },
      { n: 24, from: 'small', big: 'قدم', small: 'بوصة', f: 12 },
      { n: 8000, from: 'small', big: 'طن', small: 'رطل', f: 2000 },
    ] } },
    { t: 'practice', gen: chooseFactorQ, count: 3, title: 'اختاري عامل الضرب 🎯' },
    { t: 'practice', gen: toSmallQ, count: 3, title: 'من وحدة كبيرة إلى صغيرة ⬇️' },
    {
      t: 'say', emoji: '⬆️',
      text: 'وللتحويل من وحدة **أصغر** إلى **أكبر**: نضرب في **مقلوب** معدل الوحدة، وهاد عملياً **قسمة**.\n\nمثال: **٩ أقدام** إلى ياردات:\n\n$9 قدم × {1 ياردة/3 أقدام} = 9 ÷ 3 = 3$ ياردات ✅\n\nقاعدة سهلة: الوحدة اللي **معنا** لازم تكون **بالمقام** حتى تختفي. 🪄',
    },
    { t: 'practice', gen: toBigQ, count: 3, title: 'من وحدة صغيرة إلى كبيرة ⬆️' },
    {
      t: 'say', emoji: '🧵',
      text: 'وإذا كان معنا **كسر**؟ نفس الشي.\n\nتحتاج هيفاء **$4{1/2}$ قدم** من القماش لوشاح. كم **ياردة**؟\n\n١. نكتب العدد الكسري كسراً غير فعلي: $4{1/2} = {9/2}$\n\n٢. نضرب في ${1 ياردة/3 أقدام}$:\n\n${9/2} × {1/3} = {3/2} = 1{1/2}$ ياردة ✅',
    },
    { t: 'practice', gen: fracTonQ, count: 2, title: 'مع الكسور 🍰' },
    {
      t: 'quiz',
      q: {
        kind: 'choice',
        prompt: 'عرض أصغر سيارة كهربائية $35$ بوصة تقريباً. كم قدماً تقريباً (قرّبي لأقرب قدم)؟',
        options: [
          { text: '$3$ أقدام', correct: true, why: 'برافو! 🎉 $35 ÷ 12 ≈ 2٫9$ وبنقرّب لـ$3$ أقدام ✔️' },
          { text: '$420$ قدماً', why: 'ضربتي! 😅 من وحدة **أصغر** (بوصة) لأكبر (قدم) لازم **نقسم**.' },
          { text: '$12$ قدماً', why: 'استعملتي رقم ١٢ بس بدون ما تقسمي 🔍 $35 ÷ 12$ مو $12$.' },
          { text: '$2$ قدمان', why: 'قريبة! ✨ $2٫9$ أقرب لـ$3$ من $2$. بالتقريب بننظر للمنزلة العشرية.' },
        ],
      },
    },
    {
      t: 'say', emoji: '🚁',
      text: 'وحتى **المعدلات** (مثل السرعة) بنحوّلها!\n\nطائرة مروحية سرعتها **$158$ ميل / ساعة**. كم ميل بالثانية؟\n\n${158 ميل/1 ساعة} × {1 ساعة/3600 ثانية}$\n\nوحدة **الساعة** اختفت (بالبسط والمقام) وبقي ميل / ثانية:\n\n$158 ÷ 3600 ≈ 0٫04$ ميل / ثانية ✅',
    },
    { t: 'practice', gen: speedQ, count: 3, title: 'حوّلي السرعة 🏃' },
    {
      t: 'say', emoji: '🏁',
      text: 'الخلاصة:\n\n📏 كل علاقة بين وحدتين = **معدل وحدة** قيمته ١\n\n⬇️ **كبيرة ← صغيرة**: نضرب في المعدل (العدد بيكبر)\n\n⬆️ **صغيرة ← كبيرة**: نضرب بالمقلوب أي نقسم (العدد بيصغر)\n\n🪄 الوحدة اللي **معنا** لازم تكون **بالمقام** لتختفي\n\n🍰 الكسور: نكتبها كسراً غير فعلي ونضرب',
    },
  ],
}