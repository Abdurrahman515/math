import type { Question } from '../types'
import type { PoolItem } from '../lib/exam'
import { pick, rand } from '../lib/rng'

const VARS = ['س', 'ص', 'ن', 'ع', 'ك']

/** يحذف الجواب الصحيح والمكرر من قائمة الأخطاء */
function wr(answer: number, list: { value: number; why: string }[]) {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}

// ١-٤ التخمين والتحقق
const guessCheck = (): Question => {
  const a = rand(4, 15), b = rand(2, a - 1)
  return {
    kind: 'numeric',
    prompt: `عددان مجموعهما $${a + b}$ وحاصل ضربهما $${a * b}$. ما العدد الأكبر؟`,
    answer: a,
    wrong: wr(a, [
      { value: b, why: 'هاد العدد الأصغر! المطلوب الأكبر.' },
      { value: Math.floor((a + b) / 2), why: 'نصف المجموع بيطلع بس لما العددين يتساووا، وهون ضربهم مختلف. خمّني وتحقّقي: مجموع وضرب مع بعض.' },
    ]),
    why: `خمّنّا $${a}$ و $${b}$: مجموعهما $${a + b}$ وضربهما $${a * b}$ ✓ فالأكبر $${a}$`,
    fallback: 'خمّني عددين، وتحقّقي من المجموع والضرب سوا. إذا ما زبطت عدّلي التخمين.',
  }
}

// ١-٥ قيمة عبارة جبرية
const evalExpr = (): Question => {
  const v = pick(VARS), c = rand(2, 9), x = rand(2, 9)
  const sub = rand(0, 1) === 1
  const m = rand(1, Math.min(9, c * x - 1))
  const s = sub ? -m : m
  const ans = c * x + s
  const op = sub ? '−' : '+'
  return {
    kind: 'numeric',
    prompt: `احسبي قيمة $${c}${v} ${op} ${m}$ إذا كانت $${v} = ${x}$`,
    answer: ans,
    wrong: wr(ans, [
      { value: c + x + s, why: `جمعتي المعامل مع قيمة المتغير. $${c}${v}$ يعني $${c} × ${v}$ مو $${c} + ${v}$.` },
      { value: Number(`${c}${x}`) + s, why: `ما منكتب الرقمين جنب بعض! $${c}${v}$ يعني $${c} × ${x} = ${c * x}$ مو $${c}${x}$.` },
    ]),
    why: `نعوّض: $${c} × ${x} ${op} ${m} = ${c * x} ${op} ${m} = ${ans}$`,
  }
}

// ١-٥ من الكلام إلى عبارة جبرية
const toAlg = (): Question => {
  const v = pick(VARS), k = rand(2, 9)
  const T = [
    { phrase: `مجموع العدد $${v}$ والعدد $${k}$`, ok: `${v} + ${k}`,
      bad: [[`${v} − ${k}`, 'هاد طرح. "مجموع" يعني جمع.'], [`${k}${v}`, 'هاد ضرب. "مجموع" يعني جمع.']] },
    { phrase: `$${k}$ أقل من العدد $${v}$`, ok: `${v} − ${k}`,
      bad: [[`${k} − ${v}`, `عكستي الترتيب. "${k} أقل من ${v}" يعني ناخد ${v} وننقص منها ${k}.`], [`${v} + ${k}`, 'هاد جمع. "أقل من" يعني طرح.']] },
    { phrase: `$${k}$ أمثال العدد $${v}$`, ok: `${k}${v}`,
      bad: [[`${k} + ${v}`, 'هاد جمع. "أمثال" يعني ضرب.'], [`${v} ÷ ${k}`, 'هاد قسمة. "أمثال" يعني ضرب.']] },
  ]
  const t = pick(T)
  return {
    kind: 'choice',
    prompt: `أي عبارة جبرية تعبّر عن: ${t.phrase} ؟`,
    options: [
      { text: `$${t.ok}$`, correct: true, why: 'صح عليكِ! ترجمتي الكلام لرموز 🎉' },
      ...t.bad.map(([e, why]) => ({ text: `$${e}$`, why })),
    ],
  }
}

// ١-٦ حل معادلة ذهنياً
const solveEq = (): Question => {
  const v = pick(VARS), a = rand(2, 9), r = rand(2, 12)
  const T = [
    { eq: `${v} + ${a} = ${r + a}`, ans: r, bad: [[r + 2 * a, 'جمعتي بدل ما تطرحي. اسألي: أي عدد مع ' + a + ' بيعطي ' + (r + a) + '؟']] },
    { eq: `${v} − ${a} = ${r}`, ans: r + a, bad: [[r - a, 'طرحتي بدل ما تجمعي. اسألي: أي عدد إذا نقصنا منه ' + a + ' بيطلع ' + r + '؟']] },
    { eq: `${a}${v} = ${a * r}`, ans: r, bad: [[a * r - a, 'طرحتي! ' + a + v + ' يعني ' + a + ' × ' + v + '، فنقسم.'], [a * a * r, 'ضربتي بدل ما تقسمي.']] },
    { eq: `${v} ÷ ${a} = ${r}`, ans: r * a, bad: [[r + a, 'جمعتي! القسمة عكسها الضرب.']] },
  ]
  const t = pick(T)
  return {
    kind: 'numeric',
    prompt: `حلّي المعادلة ذهنياً: $${t.eq}$`,
    answer: t.ans,
    wrong: wr(t.ans, (t.bad as [number, string][]).map(([value, why]) => ({ value, why }))),
    why: `$${v} = ${t.ans}$ ✓ (عوّضي وتحقّقي)`,
    fallback: 'عوّضي جوابك بالمعادلة. إذا ما صار الطرفين متساويين، جرّبي عدد تاني.',
  }
}

// ١-٦ هل القيمة حلّ للمعادلة؟
const isSolution = (): Question => {
  const v = pick(VARS), a = rand(2, 9), x = rand(2, 9)
  const mul = rand(0, 1) === 1
  const good = rand(0, 1) === 1
  const b = mul ? a * x : x + a
  const test = good ? x : x + rand(1, 3)
  const lhs = mul ? a * test : test + a
  const eq = mul ? `${a}${v} = ${b}` : `${v} + ${a} = ${b}`
  const sub = mul ? `${a} × ${test}` : `${test} + ${a}`
  const expl = good
    ? `نعوّض: $${sub} = ${lhs}$ وهي تساوي $${b}$ ✓ فهي حلّ.`
    : `نعوّض: $${sub} = ${lhs}$ بس المطلوب $${b}$ ✗ فمو حلّ.`
  return {
    kind: 'choice',
    prompt: `هل $${v} = ${test}$ حلّ للمعادلة $${eq}$ ؟`,
    options: [
      { text: 'نعم، حلّ', correct: good, why: expl },
      { text: 'لا، مو حلّ', correct: !good, why: expl },
    ],
  }
}

// ١-٧ تحديد الخاصية
const PROPS = [
  { key: 'comm', name: 'خاصية الإبدال', desc: 'منبدّل مكان العددين والناتج ما بيتغير' },
  { key: 'assoc', name: 'خاصية التجميع', desc: 'منغيّر مين بيتجمّع مع مين (الأقواس) والناتج ما بيتغير' },
  { key: 'dist', name: 'خاصية التوزيع', desc: 'ضرب عدد بمجموع = ضربه بكل حدّ من المجموع' },
  { key: 'ident', name: 'خاصية العنصر المحايد', desc: 'جمع صفر أو ضرب بـ ١ ما بيغيّر العدد' },
]
const propId = (): Question => {
  const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9)
  const o = pick(['+', '×'])
  const target = pick(PROPS)
  const expr: Record<string, string> = {
    comm: `${a} ${o} ${b} = ${b} ${o} ${a}`,
    assoc: `(${a} ${o} ${b}) ${o} ${c} = ${a} ${o} (${b} ${o} ${c})`,
    dist: `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}`,
    ident: o === '+' ? `${a} + 0 = ${a}` : `${a} × 1 = ${a}`,
  }
  return {
    kind: 'choice',
    prompt: `أي خاصية استُعملت في: $${expr[target.key]}$ ؟`,
    options: PROPS.map((p) =>
      p.key === target.key
        ? { text: p.name, correct: true, why: `صح! ${p.name}: ${p.desc}.` }
        : { text: p.name, why: `${p.name}: ${p.desc}. بس هاي مو اللي استُعملت هون.` },
    ),
  }
}

// ١-٧ التوزيع
const distrib = (): Question => {
  const a = rand(3, 9), b = rand(2, 9) * 10, c = rand(2, 9)
  const ans = a * b + a * c
  return {
    kind: 'numeric',
    prompt: `استعملي خاصية التوزيع لحساب $${a} × (${b} + ${c})$ ذهنياً.`,
    answer: ans,
    wrong: wr(ans, [
      { value: a * b + c, why: `ضربتي العدد $${a}$ بالأول بس! لازم نضربه بكل حدّ جوّا القوس.` },
      { value: a + b * c, why: 'ما بتحافظي على ترتيب العمليات. العدد اللي برّا القوس بيضرب كل اللي جوّاه.' },
    ]),
    why: `$${a} × ${b} + ${a} × ${c} = ${a * b} + ${a * c} = ${ans}$`,
  }
}

// ١-٧ حساب ذهني بالتجميع
const mental = (): Question => {
  const a = rand(3, 9), p = pick([[4, 25], [5, 20], [2, 50], [8, 125]])
  const ans = a * p[0] * p[1]
  return {
    kind: 'numeric',
    prompt: `احسبي ذهنياً: $${a} × ${p[0]} × ${p[1]}$`,
    answer: ans,
    why: `نجمّع: $${a} × (${p[0]} × ${p[1]}) = ${a} × ${p[0] * p[1]} = ${ans}$`,
    fallback: 'جرّبي تجمّعي العددين اللي ضربهم بيعطي رقم مدوّر (مئة مثلاً).',
  }
}

// ١-٨ قيمة المخرجات
const funcVal = (): Question => {
  const k = rand(2, 9), x = rand(2, 9)
  const mul = rand(0, 1) === 1
  const ans = mul ? k * x : x + k
  return {
    kind: 'numeric',
    prompt: `قاعدة الدالة: $ص = ${mul ? `${k}س` : `س + ${k}`}$ . إذا كانت $س = ${x}$ فما قيمة $ص$ ؟`,
    answer: ans,
    wrong: wr(ans, [
      mul
        ? { value: k + x, why: `جمعتي! $${k}س$ يعني $${k} × س$.` }
        : { value: k * x, why: 'ضربتي! القاعدة فيها جمع: س + ' + k },
    ]),
    why: mul ? `$ص = ${k} × ${x} = ${ans}$` : `$ص = ${x} + ${k} = ${ans}$`,
  }
}

// ١-٨ استنتاج القاعدة من الجدول
const ruleFromTable = (): Question => {
  const k = rand(2, 9)
  const outs = [1, 2, 3, 4].map((i) => i * k).join('، ')
  return {
    kind: 'choice',
    prompt: `المدخلات (س): $1، 2، 3، 4$\nالمخرجات (ص): $${outs}$\nما قاعدة الدالة؟`,
    options: [
      { text: `$ص = ${k}س$`, correct: true, why: `صح! كل مخرج = المدخل × ${k}.` },
      { text: `$ص = س + ${k - 1}$`, why: `جرّبي المدخل 2: $2 + ${k - 1} = ${k + 1}$ بس المخرج $${2 * k}$.` },
      { text: `$ص = س + ${k}$`, why: `جرّبي المدخل 1: $1 + ${k} = ${k + 1}$ بس المخرج $${k}$.` },
    ],
  }
}

// ١-٨ المدى
const setOf = (xs: number[]) => `{${xs.join('، ')}}`
const rangeQ = (): Question => {
  const k = rand(2, 9)
  return {
    kind: 'choice',
    prompt: `مجال الدالة $ص = ${k}س$ هو $${setOf([1, 2, 3])}$ . ما مداها؟`,
    options: [
      { text: `$${setOf([k, 2 * k, 3 * k])}$`, correct: true, why: `صح! عوّضنا كل مدخل: $${k}×1$ و $${k}×2$ و $${k}×3$.` },
      { text: `$${setOf([1, 2, 3])}$`, why: 'هدول المدخلات (المجال). المدى هو المخرجات بعد ما نطبّق القاعدة.' },
      { text: `$${setOf([k + 1, k + 2, k + 3])}$`, why: `جمعتي ${k} بدل ما تضربي.` },
    ],
  }
}

export const bank1: PoolItem[] = [
  { lesson: '1-4', gen: guessCheck },
  { lesson: '1-5', gen: evalExpr },
  { lesson: '1-5', gen: toAlg },
  { lesson: '1-6', gen: solveEq },
  { lesson: '1-6', gen: isSolution },
  { lesson: '1-7', gen: propId },
  { lesson: '1-7', gen: distrib },
  { lesson: '1-7', gen: mental },
  { lesson: '1-8', gen: funcVal },
  { lesson: '1-8', gen: ruleFromTable },
  { lesson: '1-8', gen: rangeQ },
]