import type { Question } from '../types'
import { pick, rand } from '../lib/rng'
import { dec, r2 } from '../lib/dec'
import { sum, sortAsc, rangeOf, medianOf, tenth } from '../lib/stats'

const m = (x: number) => `$${dec(x)}$`
const L = (a: number[]) => a.map(m).join('، ')
const shuf = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5)
const rnd = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => rand(lo, hi))
const uniq = (n: number, lo: number, hi: number, not: number[] = []) => {
  const s = new Set<number>()
  while (s.size < n) {
    const x = rand(lo, hi)
    if (!not.includes(x)) s.add(x)
  }
  return [...s]
}
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => w.value > 0 && !seen.has(w.value) && (seen.add(w.value), true))
}

/* ═════════ ٦-١ التمثيل بالنقاط ═════════ */

export const rangeQ = (): Question => {
  const lo = pick([5, 10, 20, 30])
  let d: number[]
  do { d = rnd(rand(6, 9), lo, lo + rand(12, 40)) } while (rangeOf(d) < 6)
  const mx = Math.max(...d), mn = Math.min(...d), ans = mx - mn
  const ctx = pick([
    'أعمار لاعبات في فريق (بالسنة): ',
    'عدد الصفحات التي قرأتها سارة في أيام مختلفة: ',
    'أسعار كتب في مكتبة (بالريال): ',
  ])
  return {
    kind: 'numeric',
    prompt: `${ctx}${L(d)}. ما مدى هذه البيانات؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: mx, why: 'هاد أكبر قيمة بس! 🔍 المدى هو **الفرق** بين الأكبر والأصغر.' },
      { value: mx + mn, why: 'جمعتي بدل ما تطرحي! 😅 المدى = الأكبر − الأصغر.' },
      { value: mn, why: 'هاد أصغر قيمة! 🔄 لازم نطرحها من الأكبر.' },
    ]),
    why: `المدى = أكبر قيمة − أصغر قيمة\n\n$${mx} − ${mn} = ${ans}$ ✔️`,
  }
}

export const newRangeQ = (): Question => {
  const lo = rand(10, 30)
  let d: number[]
  do { d = rnd(7, lo, lo + rand(10, 25)) } while (rangeOf(d) < 6)
  const mx = Math.max(...d), mn = Math.min(...d), old = mx - mn
  const kind = pick(['up', 'down', 'in'] as const)
  const x = kind === 'up' ? mx + rand(4, 20) : kind === 'down' ? mn - rand(2, Math.min(8, mn - 1)) : rand(mn + 1, mx - 1)
  const ans = rangeOf([...d, x])
  return {
    kind: 'numeric',
    prompt: `البيانات: ${L(d)}. أُضيفت إليها القيمة ${m(x)}. ما المدى الجديد؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: old, why: 'هاد المدى القديم! 🔍 القيمة الجديدة ممكن تصير الأكبر أو الأصغر وتغيّر المدى.' },
      { value: Math.abs(x - mn), why: 'طرحتي من الأصغر القديمة بس! 🔄 لازم تحدّدي الأكبر والأصغر الجديدين.' },
      { value: Math.abs(mx - x), why: 'طرحتي من الأكبر القديمة بس! 🔄 لازم تحدّدي الأكبر والأصغر الجديدين.' },
    ]),
    why: `بعد الإضافة: الأكبر $${Math.max(...d, x)}$ والأصغر $${Math.min(...d, x)}$\n\n$${Math.max(...d, x)} − ${Math.min(...d, x)} = ${ans}$ ✔️`,
  }
}

export const gapQ = (): Question => {
  const a = rand(10, 20)
  const b = a + 5 + rand(9, 14)
  const c1 = [a, a + 5, ...rnd(3, a, a + 5)]
  const c2 = [b, b + 4, ...rnd(2, b, b + 4)]
  const data = shuf([...c1, ...c2])
  const O = (x: number, y: number) => `بين ${m(x)} و${m(y)}`
  return {
    kind: 'choice',
    prompt: `البيانات: ${L(data)}. لو مثّلناها بالنقاط، بين أيّ قيمتين تقع الفجوة (الفترة الفاضية)؟`,
    options: [
      { text: O(a + 5, b), correct: true, why: `برافو! 🎉 آخر قيمة بالتجمّع الأول ${a + 5} وأول قيمة بالتاني ${b}، وبينهم ما في ولا نقطة ✔️` },
      { text: O(a, a + 5), why: `هاد التجمّع نفسه مو الفجوة! 🔍 بين ${a} و${a + 5} في نقاط كتيرة.` },
      { text: O(a, b), why: 'هاي بتبدأ من أول قيمة بالتجمّع الأول! 🔍 الفجوة بتبدأ من **آخر** قيمة قبل الفاضي.' },
      { text: O(a + 5, b + 4), why: 'هاي بتنتهي بآخر قيمة بالتجمّع التاني! 🔍 الفجوة بتنتهي عند **أول** نقطة بعد الفاضي.' },
    ],
  }
}

export const outlierQ = (): Question => {
  const c = rand(10, 30)
  const o = c + 6 + rand(18, 30)
  const data = shuf([c, c + 3, c + 6, ...rnd(4, c, c + 6), o])
  return {
    kind: 'choice',
    prompt: `البيانات: ${L(data)}. أيّ قيمة منها قيمة متطرفة؟`,
    options: [
      { text: m(o), correct: true, why: `برافو! 🎉 ${o} بعيدة كتير عن باقي القيم (كلها بين ${c} و${c + 6}) ✔️` },
      { text: m(c + 6), why: 'هاي أكبر قيمة ضمن التجمّع لكنها قريبة من الباقي، فمو متطرفة. 🔍' },
      { text: m(c), why: 'هاي أصغر قيمة بس مو بعيدة عن الباقي. القيمة المتطرفة لازم تكون **منفصلة**. 🔍' },
      { text: m(c + 3), why: 'هاي بنص التجمّع تماماً! 😅' },
    ],
  }
}

export const rangeChangeQ = (): Question => {
  const lo = rand(15, 30)
  let d: number[]
  do { d = rnd(7, lo, lo + rand(8, 25)) } while (rangeOf(d) < 5)
  const mx = Math.max(...d), mn = Math.min(...d)
  const kind = pick(['up', 'down', 'in'] as const)
  const x = kind === 'up' ? mx + rand(3, 15) : kind === 'down' ? mn - rand(3, Math.min(10, mn - 1)) : rand(mn + 1, mx - 1)
  //const ans = kind === 'in' ? 1 : kind === 'up' ? 0 : 2
  const ex = kind === 'up'
    ? `${x} أكبر من أكبر قيمة (${mx})، فصارت هي الأكبر والمدى زاد.`
    : kind === 'down'
      ? `${x} أصغر من أصغر قيمة (${mn})، فصارت هي الأصغر والمدى زاد.`
      : `${x} بين أصغر قيمة (${mn}) وأكبر قيمة (${mx})، فما غيّرت الأكبر ولا الأصغر.`
  //const T = ['يزداد', 'لا يتغيّر', 'يزداد'] as const
  return {
    kind: 'choice',
    prompt: `البيانات: ${L(d)}. ماذا يحدث للمدى إذا أضفنا القيمة ${m(x)}؟`,
    options: [
      { text: 'المدى يزداد', correct: kind !== 'in', why: kind !== 'in' ? `برافو! 🎉 ${ex} ✔️` : `قريبة! 🔍 ${ex}` },
      { text: 'المدى لا يتغيّر', correct: kind === 'in', why: kind === 'in' ? `برافو! 🎉 ${ex} ✔️` : `ما بيضل نفسه هون. 🔍 ${ex}` },
      { text: 'المدى ينقص', why: 'المدى ما بينقص أبداً لما نضيف قيمة! 🔍 أسوأ حالة بيضل نفسه.' },
    ],
  }
}

export const countFreqQ = (): Question => {
  const v = rand(3, 9)
  const k = rand(2, 4)
  const others = rnd(rand(6, 8), 2, 10).filter((x) => x !== v)
  const d = shuf([...Array(k).fill(v), ...others])
  return {
    kind: 'numeric',
    prompt: `عدد الأكواب التي شربتها صديقات ريم: ${L(d)}. كم صديقة شربت ${m(v)} أكواب؟ (يعني كم نقطة فوق ${m(v)} بالتمثيل بالنقاط)`,
    answer: k,
    wrong: wr(k, [
      { value: v, why: 'هاد الرقم نفسه مو عدد مرات تكراره! 🔍' },
      { value: d.length, why: 'هاد عدد كل القيم! 😅 المطلوب القيمة المحددة بس.' },
      { value: k + 1, why: 'عدّيتي زيادة! 🔍 عدّي بهدوء واشطبي كل رقم لما تعدّيه.' },
      { value: k - 1, why: 'فاتتك وحدة! 🔍 عدّي مرة تانية.' },
    ]),
    why: `بنعدّ كم مرة ظهرت ${v} بالقائمة: ظهرت $${k}$ مرات، يعني فوقها $${k}$ نقاط ✔️`,
  }
}

/* ═════════ ٦-٢ مقاييس النزعة المركزية والمدى ═════════ */

export const meanQ = (): Question => {
  const n = rand(4, 6)
  const mean = rand(8, 45)
  const S = mean * n
  let d: number[]
  for (;;) {
    const part = rnd(n - 1, Math.max(1, mean - 8), mean + 8)
    const last = S - sum(part)
    if (last >= 1 && last <= mean + 15) { d = shuf([...part, last]); break }
  }
  const text = pick([
    `درجات سلمى في ${n} اختبارات: ${L(d)}. ما متوسط درجاتها؟`,
    `أسعار ${n} كتب (بالريال): ${L(d)}. ما متوسط سعر الكتاب؟`,
    `عدد الدقائق التي تمرّنت فيها ليلى في ${n} أيام: ${L(d)}. ما متوسط مدة التمرين في اليوم؟`,
  ])
  return {
    kind: 'numeric',
    prompt: text,
    answer: mean,
    wrong: wr(mean, [
      { value: S, why: 'هاد المجموع بس! 😅 لازم نقسمه على عدد القيم.' },
      { value: r2(S / (n - 1)), why: `قسمتي على ${n - 1}! 🔍 عدد القيم ${n}.` },
      { value: medianOf(d), why: 'هاد الوسيط مو المتوسط! 🔄' },
    ]),
    why: `المتوسط = المجموع ÷ عدد القيم\n\n$${S} ÷ ${n} = ${mean}$ ✔️`,
  }
}

export const meanRoundQ = (): Question => {
  const n = rand(5, 8)
  let d: number[]
  do { d = rnd(n, 10, 60) } while (sum(d) % n === 0)
  const S = sum(d)
  const ans = tenth(S / n)
  return {
    kind: 'numeric',
    prompt: `القيم: ${L(d)}. أوجدي المتوسط وقرّبيه لأقرب عُشر (منزلة وحدة بعد الفاصلة).`,
    answer: ans,
    wrong: wr(ans, [
      { value: Math.floor((S / n) * 10) / 10, why: 'قطعتي الرقم بدل ما تقرّبي! 🔍 إذا المنزلة اللي بعدها ٥ أو أكتر بنرفع.' },
      { value: Math.round(S / n), why: 'قرّبتي لأقرب عدد صحيح! السؤال طلب لأقرب **عُشر**.' },
      { value: medianOf(d), why: 'هاد الوسيط مو المتوسط! 🔄' },
      { value: S, why: 'هاد المجموع! لازم نقسم على عدد القيم.' },
    ]),
    why: `$${S} ÷ ${n} ≈ ${dec(ans)}$ ✔️`,
  }
}

export const medianQ = (): Question => {
  const n = pick([5, 7, 9])
  const d = shuf(uniq(n, 5, 60))
  const s = sortAsc(d)
  const ans = s[(n - 1) / 2]
  return {
    kind: 'numeric',
    prompt: `القيم: ${L(d)}. ما الوسيط؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: d[(n - 1) / 2], why: 'أخدتي اللي بالنص من القائمة الأصلية! 🔍 لازم **ترتّبي** البيانات أول.' },
      { value: tenth(sum(d) / n), why: 'هاد المتوسط مو الوسيط! 🔄' },
      { value: s[(n + 1) / 2], why: 'قريبة! 🔍 بس هاي اللي بعد النص، عدّي من الطرفين بالتساوي.' },
    ]),
    why: `بعد الترتيب: ${L(s)}\n\nالقيمة اللي بالنص هي $${ans}$ ✔️`,
  }
}

export const medianEvenQ = (): Question => {
  const n = pick([4, 6, 8])
  let d: number[]
  let s: number[]
  do { d = shuf(uniq(n, 10, 60)); s = sortAsc(d) } while (s[n / 2 - 1] === s[n / 2])
  const lo = s[n / 2 - 1], hi = s[n / 2]
  const ans = (lo + hi) / 2
  return {
    kind: 'numeric',
    prompt: `القيم: ${L(d)}. ما الوسيط؟ (عددها زوجي)`,
    answer: ans,
    wrong: wr(ans, [
      { value: lo, why: 'أخدتي واحدة من القيمتين اللي بالنص! 🔍 لما العدد زوجي بناخد **متوسطهم**.' },
      { value: hi, why: 'أخدتي واحدة من القيمتين اللي بالنص! 🔍 لما العدد زوجي بناخد **متوسطهم**.' },
      { value: tenth(sum(d) / n), why: 'هاد متوسط كل القيم مو الوسيط! 🔄' },
    ]),
    why: `بعد الترتيب: ${L(s)}\n\nاللي بالنص: $${lo}$ و$${hi}$\n\n$(${lo} + ${hi}) ÷ 2 = ${dec(ans)}$ ✔️`,
  }
}

export const modeQ = (): Question => {
  const v = rand(10, 40)
  const r = rand(2, 3)
  const others = uniq(rand(4, 6), 10, 40, [v])
  const d = shuf([...Array(r).fill(v), ...others])
  return {
    kind: 'numeric',
    prompt: `القيم: ${L(d)}. ما المنوال؟`,
    answer: v,
    wrong: wr(v, [
      { value: r, why: 'هاد عدد مرات التكرار! 🔍 المنوال هو **القيمة** نفسها اللي تكررت.' },
      { value: medianOf(d), why: 'هاد الوسيط مو المنوال! 🔄' },
      { value: Math.max(...d), why: 'هاد أكبر قيمة! 😅 المنوال هو الأكتر تكراراً.' },
    ]),
    why: `القيمة $${v}$ ظهرت ${r} مرات، وباقي القيم ظهرت مرة وحدة، فالمنوال $${v}$ ✔️`,
  }
}

export const effectQ = (): Question => {
  const base = rand(20, 40)
  const md = base + 3
  const d = shuf([md, md, base, base + 1, base + 5, base + 8])
  const up = rand(0, 1) === 1
  const x = up ? base + 8 + rand(15, 40) : rand(2, base - 5)
  const big = up ? 'أكبر' : 'أصغر'
  return {
    kind: 'choice',
    prompt: `القيم: ${L(d)}. أُضيفت القيمة ${m(x)} وهي ${big} من كل القيم الحالية. أيّ العبارات صحيحة؟`,
    options: [
      { text: up ? 'المتوسط يزداد' : 'المتوسط ينقص', correct: true, why: `برافو! 🎉 القيمة الجديدة ${big} من كل القيم فبتسحب المتوسط ${up ? 'لفوق' : 'لتحت'} ✔️` },
      { text: up ? 'المتوسط ينقص' : 'المتوسط يزداد', why: `عكس الصح! 🔍 قيمة ${big} من الكل بتسحب المتوسط ${up ? 'لفوق' : 'لتحت'}.` },
      { text: 'المتوسط لا يتغيّر', why: 'المتوسط بيتأثر بكل قيمة جديدة! 🔍' },
      { text: 'المنوال يتغيّر', why: `المنوال هو ${md} لأنو متكرر، والقيمة الجديدة ظهرت مرة وحدة، فبيضل ${md}. 🔍` },
    ],
  }
}

type Meas = 'mean' | 'median' | 'mode' | 'range'
const MN: Record<Meas, string> = { mean: 'المتوسط الحسابي', median: 'الوسيط', mode: 'المنوال', range: 'المدى' }
const BASE_WHY: Record<Meas, string> = {
  mean: 'المتوسط ما بيناسب هالحالة. 🔍',
  median: 'الوسيط ما بيجاوب عن المطلوب هون. 🔍',
  mode: 'المنوال بيعطي القيمة الأكتر تكراراً بس، وما بيناسب هالحالة. 🔍',
  range: 'المدى بيوصف الانتشار بس، مو القيمة المعتادة. 🔍',
}

export const bestMeasureQ = (): Question => {
  const t = Array.from({ length: 6 }, () => rand(24, 30))
  const b = pick([3000, 3500, 4000])
  const sal = [b, b + 200, b + 500, b + 800, rand(25, 40) * 1000]
  const house = [rand(4, 6) * 100, rand(6, 7) * 100, rand(7, 8) * 100, rand(8, 9) * 100, rand(30, 50) * 100]
  const sc: { t: string; a: Meas; ok: string; w?: Partial<Record<Meas, string>> }[] = [
    {
      t: `درجات الحرارة (°س) في ٦ أيام: ${L(t)}. كلها متقاربة ولا توجد قيمة شاذة. أيّ مقياس يمثّل الحرارة المعتادة أفضل؟`,
      a: 'mean', ok: 'برافو! 🎉 ما في قيم متطرفة، فالمتوسط بيمثّل الكل ✔️',
      w: { median: 'ممكن، بس لما ما في قيم متطرفة المتوسط هو الأنسب لأنو بيستعمل كل القيم. 🔍' },
    },
    {
      t: `رواتب ٥ موظفين (بالريال): ${L(sal)}. أيّ مقياس يعطي صورة أصدق عن الراتب المعتاد؟`,
      a: 'median', ok: 'برافو! 🎉 الراتب الكبير قيمة متطرفة، والوسيط ما بيتأثر فيها ✔️',
      w: { mean: 'المتوسط بينسحب لفوق بسبب الراتب الكبير، فبيعطي صورة مضلّلة! 🔍' },
    },
    {
      t: `باع محل أحذية المقاسات: ${L([36, 37, 37, 37, 38, 39, 37, 36, 40, 37])}. أيّ مقياس بيساعد صاحب المحل يعرف أكتر مقاس مطلوب؟`,
      a: 'mode', ok: 'برافو! 🎉 المنوال هو القيمة الأكتر تكراراً، يعني المقاس الأكتر مبيعاً ✔️',
      w: { mean: 'المتوسط ممكن يطلع مقاس ما وجد أصلاً! 🔍' },
    },
    {
      t: 'بدك تعرفي شو الفرق بين أعلى وأقل درجة بالصف، يعني شو قد الدرجات منتشرة. أيّ مقياس بتستعملي؟',
      a: 'range', ok: 'برافو! 🎉 المدى هو الفرق بين الأكبر والأصغر، وبيوصف الانتشار ✔️',
    },
    {
      t: `أسعار ٥ بيوت في حيّ (بآلاف الريالات): ${L(house)}. أيّ مقياس يمثّل سعر البيت المعتاد أفضل؟`,
      a: 'median', ok: 'برافو! 🎉 فيلا سعرها عالي كتير قيمة متطرفة، والوسيط ما بيتأثر فيها ✔️',
      w: { mean: 'المتوسط بينسحب لفوق بسبب الفيلا! 🔍' },
    },
    {
      t: 'سألنا ٢٠ طالبة عن لونهن المفضّل. أيّ مقياس بيعرّفنا أكتر لون محبوب؟',
      a: 'mode', ok: 'برافو! 🎉 المنوال هو الوحيد اللي بيشتغل مع الأشياء اللي مو أرقام (ألوان) ✔️',
      w: { mean: 'ما فينا نجمع ألوان ونقسم! 😅', median: 'ما فينا نرتّب ألوان من الأصغر للأكبر! 😅' },
    },
  ]
  const s = pick(sc)
  return {
    kind: 'choice',
    prompt: s.t,
    options: (['mean', 'median', 'mode', 'range'] as Meas[]).map((k) =>
      k === s.a ? { text: MN[k], correct: true, why: s.ok } : { text: MN[k], why: s.w?.[k] ?? BASE_WHY[k] },
    ),
  }
}

export const targetMeanQ = (): Question => {
  const k = rand(3, 5)
  for (;;) {
    const d = rnd(k, 60, 92)
    const S = sum(d)
    const M = Math.round(S / k) + rand(2, 6)
    const need = M * (k + 1) - S
    if (need >= 50 && need <= 100) {
      return {
        kind: 'numeric',
        prompt: `حصلت لمى في ${k} اختبارات على: ${L(d)}. كم لازم تحصل في الاختبار التالي (من ١٠٠) ليصير متوسط درجاتها ${m(M)}؟`,
        answer: need,
        wrong: wr(need, [
          { value: M, why: 'هاد المتوسط المطلوب نفسه! 🔍 لازم نشوف المجموع المطلوب أول.' },
          { value: M * k - S, why: `حسبتي على ${k} اختبارات بس! 🔍 بعد الاختبار الجديد صاروا ${k + 1}.` },
          { value: M * (k + 1), why: 'هاد المجموع المطلوب كله! 🔍 لازم نطرح منه درجاتها السابقة.' },
        ]),
        why: `المجموع المطلوب لـ${k + 1} اختبارات: $${M} × ${k + 1} = ${M * (k + 1)}$\n\nمجموع درجاتها السابقة: $${S}$\n\nالدرجة اللازمة: $${M * (k + 1)} − ${S} = ${need}$ ✔️`,
      }
    }
  }
}

export const totalFromMeanQ = (): Question => {
  const mean = rand(8, 60)
  const n = rand(4, 9)
  return {
    kind: 'numeric',
    prompt: `متوسط ما تدّخره هدى في الأسبوع ${m(mean)} ريالاً. كم ادّخرت في ${m(n)} أسابيع بالمجموع؟`,
    answer: mean * n,
    wrong: wr(mean * n, [
      { value: mean + n, why: 'جمعتي بدل ما تضربي! 😅' },
      { value: r2(mean / n), why: 'قسمتي! 🔍 المتوسط = المجموع ÷ العدد، فالمجموع = المتوسط × العدد.' },
      { value: mean * (n - 1), why: `ضربتي بـ${n - 1}! 🔍 عدد الأسابيع ${n}.` },
    ]),
    why: `المجموع = المتوسط × العدد\n\n$${mean} × ${n} = ${mean * n}$ ريال ✔️`,
  }
}

/* ═════════ ٦-٣ الأعمدة والمدرجات التكرارية ═════════ */

export const barReadQ = (): Question => {
  const [x, y, u] = pick([
    ['سلمى', 'ريم', 'كتاباً'],
    ['الفصل أ', 'الفصل ب', 'عملاً فنياً'],
    ['متجر الشرق', 'متجر الغرب', 'قطعة'],
  ])
  const b = 5 * rand(2, 10)
  const a = b + 5 * rand(1, 8)
  return {
    kind: 'numeric',
    prompt: `في تمثيل بالأعمدة، وصل عمود «${x}» إلى ${m(a)} ${u} وعمود «${y}» إلى ${m(b)}. بكم يزيد عمود «${x}» عن عمود «${y}»؟`,
    answer: a - b,
    wrong: wr(a - b, [
      { value: a + b, why: 'جمعتي! 😅 «بكم يزيد» يعني **الفرق**.' },
      { value: a, why: 'هاد ارتفاع العمود الأول بس! 🔍 المطلوب الفرق.' },
      { value: b, why: 'هاد ارتفاع العمود التاني بس! 🔍 المطلوب الفرق.' },
    ]),
    why: `الفرق: $${a} − ${b} = ${a - b}$ ✔️`,
  }
}

export const freqTotalQ = (): Question => {
  const s = pick([1, 11, 21])
  const f = rnd(5, 1, 9)
  const rows = f.map((v, j) => `من ${m(s + 10 * j)} إلى ${m(s + 10 * j + 9)} (${m(v)})`).join('، ')
  const T = sum(f)
  return {
    kind: 'numeric',
    prompt: `مدرج تكراري لدرجات مجموعة من الطالبات، والرقم بين القوسين هو التكرار: ${rows}. كم طالبة في المجموعة كلها؟`,
    answer: T,
    wrong: wr(T, [
      { value: Math.max(...f), why: 'هاد أطول عمود بس! 🔍 لازم نجمع كل الأعمدة.' },
      { value: f.length, why: 'هاد عدد الأعمدة! 😅 المطلوب عدد الطالبات.' },
      { value: T + 1, why: 'عدّي مرة تانية! 🔍 جمعي ارتفاعات الأعمدة بهدوء.' },
    ]),
    why: `نجمع أطوال الأعمدة: $${f.join(' + ')} = ${T}$ طالبة ✔️`,
  }
}

export const freqAssignQ = (): Question => {
  const s = pick([11, 21, 31])
  const n = rand(12, 15)
  const cnt = (d: number[], lo: number) => d.filter((v) => v >= lo && v <= lo + 9).length
  for (;;) {
    const d = rnd(n, s, s + 39)
    const j = rand(0, 3)
    const lo = s + 10 * j
    const c = cnt(d, lo)
    if (c >= 2) {
      const nb = j < 3 ? cnt(d, lo + 10) : cnt(d, lo - 10)
      return {
        kind: 'numeric',
        prompt: `الدرجات: ${L(d)}. كم قيمة تقع في الفئة من ${m(lo)} إلى ${m(lo + 9)}؟ (هذا هو تكرار الفئة)`,
        answer: c,
        wrong: wr(c, [
          { value: nb, why: 'هاد تكرار فئة تانية! 🔍 انتبهي لحدود الفئة.' },
          { value: c + 1, why: 'عدّيتي قيمة من خارج الفئة! 🔍' },
          { value: c - 1, why: 'فاتتك قيمة! 🔍 عدّي مرة تانية.' },
          { value: n, why: 'هاد عدد كل القيم! 😅' },
        ]),
        why: `بنعدّ القيم اللي بين $${lo}$ و$${lo + 9}$ (والحدّان داخلان): $${c}$ قيمة ✔️`,
      }
    }
  }
}

export const histPctQ = (): Question => {
  const T = pick([20, 25, 50])
  const s = pick([11, 21, 31])
  const f = [1, 1, 1, 1, 1]
  for (let r = T - 5; r > 0; r--) f[rand(0, 4)]++
  const k = rand(2, 3)
  const above = f.slice(5 - k).reduce((a, b) => a + b, 0)
  const p = (above * 100) / T
  const from = s + 10 * (5 - k)
  const rows = f.map((v, j) => `من ${m(s + 10 * j)} إلى ${m(s + 10 * j + 9)} (${m(v)})`).join('، ')
  return {
    kind: 'numeric',
    prompt: `مدرج تكراري لدرجات ${m(T)} طالبة، والرقم بين القوسين هو التكرار: ${rows}. ما النسبة المئوية للطالبات اللواتي درجاتهن ${m(from)} فما فوق؟ (اكتبي العدد بدون الرمز)`,
    answer: p,
    wrong: wr(p, [
      { value: above, why: 'هاد عدد الطالبات مو النسبة! 🔍 لازم نقسم على الكل ونحوّل لنسبة.' },
      { value: r2(above / T), why: 'هاد الكسر العشري! 🔍 لازم نحوّله لنسبة (× ١٠٠).' },
      { value: 100 - p, why: 'هاد نسبة اللواتي درجاتهن أقل! 🔄' },
    ]),
    why: `عدد الطالبات من ${from} فما فوق: $${above}$\n\nالكل: $${T}$\n\n$${above} ÷ ${T} = ${dec(above / T)} = ${dec(p)}٪$ ✔️`,
  }
}

type Ch = 'dot' | 'bar' | 'hist'
const CN: Record<Ch, string> = { dot: 'التمثيل بالنقاط', bar: 'التمثيل بالأعمدة', hist: 'المدرج التكراري' }
const CW: Record<Ch, string> = {
  dot: 'التمثيل بالنقاط بيحط نقطة لكل قيمة على خط الأعداد، وبيناسب بيانات قليلة من غير فئات. 🔍',
  bar: 'التمثيل بالأعمدة بيقارن بين أشياء منفصلة (فئات)، مو بيانات عددية مقسّمة لمجالات. 🔍',
  hist: 'المدرج التكراري بيرتّب بيانات عددية كتيرة في فئات متساوية الطول. 🔍',
}

export const chartChoiceQ = (): Question => {
  const sc: { t: string; a: Ch; ok: string }[] = [
    { t: 'بدك تقارني مبيعات ٤ متاجر مختلفة (رقم واحد لكل متجر).', a: 'bar', ok: 'برافو! 🎉 كل متجر عمود، والمقارنة بالارتفاع ✔️' },
    { t: 'عندك أعمار ٣٠ طالبة، وبدك تعرفي كم طالبة بكل فئة عمرية (٦–٧، ٨–٩، ١٠–١١ ...).', a: 'hist', ok: 'برافو! 🎉 بيانات عددية منظّمة بفئات متساوية = مدرج تكراري ✔️' },
    { t: 'عندك عدد أكواب الماء لـ ١٢ طالبة (قيم بين ٠ و٨)، وبدك تشوفي كم مرة تكرر كل رقم والقيم الشاذة.', a: 'dot', ok: 'برافو! 🎉 قيم قليلة على خط الأعداد، والنقاط بتبيّن التكرار والتطرف ✔️' },
    { t: 'درجات ٦٠ طالبة مجمّعة في فئات (٥١–٦٠، ٦١–٧٠، ٧١–٨٠ ...)، وبدك ترسميها.', a: 'hist', ok: 'برافو! 🎉 فئات متساوية الطول + تكرار = مدرج تكراري ✔️' },
    { t: 'بدك تقارني عدد زوار ٥ متاحف مختلفة.', a: 'bar', ok: 'برافو! 🎉 كل متحف عمود منفصل ✔️' },
    { t: 'عندك ١٠ قيم فقط وبدك تشوفي الفجوات والتجمّعات على خط الأعداد.', a: 'dot', ok: 'برافو! 🎉 التمثيل بالنقاط بيبيّن الفجوات والتجمّعات بوضوح ✔️' },
  ]
  const s = pick(sc)
  return {
    kind: 'choice',
    prompt: `${s.t} أيّ تمثيل أنسب؟`,
    options: (['dot', 'bar', 'hist'] as Ch[]).map((k) => (k === s.a ? { text: CN[k], correct: true, why: s.ok } : { text: CN[k], why: CW[k] })),
  }
}

/* ═════════ ٦-٤ التمثيلات البيانية للتنبؤ ═════════ */

export const lineRateQ = (): Question => {
  const s = 10 * rand(1, 5)
  const d = 5 * rand(2, 6)
  const y = (x: number) => s + d * x
  const t = rand(7, 9)
  return {
    kind: 'numeric',
    prompt: `يبيّن تمثيل بالخطوط ادّخار رهف (بالريال): بعد أسبوع ${m(y(1))}، بعد أسبوعين ${m(y(2))}، بعد ٣ أسابيع ${m(y(3))}، بعد ٤ أسابيع ${m(y(4))}. لو استمر النمط نفسه، كم ستدّخر بعد ${m(t)} أسابيع؟`,
    answer: y(t),
    wrong: wr(y(t), [
      { value: y(4) + d, why: 'مشيتي خطوة وحدة بس! 🔍 لازم نكمّل لحد الأسبوع المطلوب.' },
      { value: d * t, why: 'ضربتي الزيادة بالأسابيع ونسيتي المبلغ اللي بالبداية! 🔍' },
      { value: y(t - 1), why: 'مشيتي خطوة أقل! 🔍 عدّي الأسابيع مرة تانية.' },
    ]),
    why: `كل أسبوع بتزيد $${d}$ ريال (من الأرقام: ${y(2)} − ${y(1)} = ${d})\n\nبعد ${t} أسابيع: $${s} + ${d} × ${t} = ${y(t)}$ ريال ✔️`,
  }
}

type Rel = 'pos' | 'neg' | 'none'
const RN: Record<Rel, string> = { pos: 'علاقة طردية', neg: 'علاقة عكسية', none: 'لا توجد علاقة' }
const RD: Record<Rel, string> = {
  pos: 'لما تزيد س بتزيد ص',
  neg: 'لما تزيد س بتنقص ص',
  none: 'النقاط مشتتة وما في اتجاه واضح',
}

export const trendQ = (): Question => {
  const sc: { t: string; a: Rel; ok: string }[] = [
    { t: 'عدد ساعات المذاكرة ودرجة الاختبار', a: 'pos', ok: 'غالباً كل ما زادت المذاكرة زادت الدرجة 📈' },
    { t: 'طول الشخص وطول ظلّه', a: 'pos', ok: 'الأطول ظلّه أطول 📈' },
    { t: 'درجة حرارة الجو وعدد المشروبات الباردة المباعة', a: 'pos', ok: 'كل ما سخن الجو زادت المبيعات 📈' },
    { t: 'عمر السيارة وسعرها', a: 'neg', ok: 'كل ما كبرت السيارة بالعمر نقص سعرها 📉' },
    { t: 'عدد ساعات لعب الجوال والنسبة المتبقية من بطاريته', a: 'neg', ok: 'كل ما لعبتي أكتر نقصت البطارية 📉' },
    { t: 'كمية الوقود بالخزان وعدد الكيلومترات التي قطعتها السيارة', a: 'neg', ok: 'كل ما قطعتي مسافة أكتر نقص الوقود 📉' },
    { t: 'طول الطالبة وعدد إخوتها', a: 'none', ok: 'ما في أي رابط بين الاثنين 🔀' },
    { t: 'عدد حروف اسم الطالبة ودرجتها بالرياضيات', a: 'none', ok: 'ما في أي رابط بين الاثنين 🔀' },
  ]
  const s = pick(sc)
  return {
    kind: 'choice',
    prompt: `لو مثّلنا «${s.t}» بشكل انتشار، أيّ نمط بنتوقع؟`,
    options: (['pos', 'neg', 'none'] as Rel[]).map((k) =>
      k === s.a ? { text: RN[k], correct: true, why: `برافو! 🎉 ${s.ok} ✔️` } : { text: RN[k], why: `${RN[k]} معناها: ${RD[k]}، وهاد مو اللي بيصير هون. 🔍` },
    ),
  }
}

type Gr = 'line' | 'bar' | 'scatter'
const GN: Record<Gr, string> = { line: 'التمثيل بالخطوط', bar: 'التمثيل بالأعمدة', scatter: 'شكل الانتشار' }
const GW: Record<Gr, string> = {
  line: 'التمثيل بالخطوط بيبيّن كيف شي بيتغيّر مع الزمن. 🔍',
  bar: 'التمثيل بالأعمدة بيقارن بين فئات منفصلة. 🔍',
  scatter: 'شكل الانتشار بيبيّن العلاقة بين مجموعتين من البيانات (كل نقطة زوج). 🔍',
}

export const graphChooseQ = (): Question => {
  const sc: { t: string; a: Gr; ok: string }[] = [
    { t: 'بدك تتابعي نمو نبتة كل أسبوع وتتنبّأي بطولها بعد شهر.', a: 'line', ok: 'تغيّر عبر الزمن + تنبؤ = خطوط ✔️' },
    { t: 'بدك تعرفي إذا في علاقة بين ساعات النوم ودرجات الاختبار.', a: 'scatter', ok: 'مجموعتين من البيانات والعلاقة بينهم = شكل انتشار ✔️' },
    { t: 'بدك تقارني عدد الطلاب في ٤ أنشطة مدرسية.', a: 'bar', ok: 'مقارنة بين فئات منفصلة = أعمدة ✔️' },
    { t: 'بدك تتنبّأي بدرجة الحرارة بعد ساعتين من الآن اعتماداً على قراءات كل ساعة.', a: 'line', ok: 'قراءات عبر الزمن = خطوط ✔️' },
    { t: 'عندك ساعات تمرين ووزن عدد من الأشخاص وبدك تشوفي إن كان في ارتباط.', a: 'scatter', ok: 'زوج لكل شخص = شكل انتشار ✔️' },
  ]
  const s = pick(sc)
  return {
    kind: 'choice',
    prompt: `${s.t} أيّ تمثيل أنسب؟`,
    options: (['line', 'bar', 'scatter'] as Gr[]).map((k) => (k === s.a ? { text: GN[k], correct: true, why: `برافو! 🎉 ${s.ok}` } : { text: GN[k], why: GW[k] })),
  }
}

/* ═════════ ٦-٥ استراتيجية: استعمال التمثيل البياني ═════════ */

export const studyPredictQ = (): Question => {
  const a = pick([35, 40, 45])
  const s20 = pick([8, 10])
  const y = (k: number) => a + s20 * k
  const xs = [20, 40, 60, 80]
  const rows = xs.map((x, k) => `${m(x)} دقيقة ← ${m(y(k + 1))}`).join('، ')
  return {
    kind: 'numeric',
    prompt: `درست ٤ طالبات مدداً مختلفة، والدرجات (من ١٠٠): ${rows}. مثّلي النقاط وارسمي خطاً يلائمها، ثم تنبّأي بدرجة طالبة درست ${m(100)} دقيقة.`,
    answer: y(5),
    wrong: wr(y(5), [
      { value: y(4), why: 'هاد آخر قيمة بالجدول! 🔍 لازم نكمّل الخط خطوة كمان.' },
      { value: y(4) + 2 * s20, why: 'مشيتي خطوتين! 🔍 من ٨٠ لـ١٠٠ خطوة وحدة (٢٠ دقيقة).' },
      { value: y(4) + 20, why: 'جمعتي الدقائق على الدرجة! 😅 الدقائق مو درجات.' },
    ]),
    why: `كل ٢٠ دقيقة بتزيد الدرجة $${s20}$ (من الجدول)\n\nمن ٨٠ لـ١٠٠ خطوة وحدة: $${y(4)} + ${s20} = ${y(5)}$ ✔️\n\nتحقّق: النقطة جاية على امتداد الخط، فالتنبؤ معقول ✅`,
  }
}

export const trendPredictQ = (): Question => {
  const a = pick([20, 30, 40])
  const st = pick([10, 15, 20])
  const y = (x: number) => a + st * x
  const rows = [1, 2, 3, 4, 5].map((x) => `بعد ${m(x)} ← ${m(y(x))}`).join('، ')
  const T = y(7)
  const list = [
    { text: m(T), correct: true, why: `برافو! 🎉 كل خطوة بتزيد ${st}، ومن الخطوة ٥ لـ٧ زيادتين: ${y(5)} + ${2 * st} = ${T} ✔️` },
    { text: m(y(5)), why: 'هاد آخر قيمة معروفة! 🔍 الاتجاه بيكمّل بزيادة.' },
    { text: m(y(5) - st), why: 'هاد عكس اتجاه النقاط! 🔍 النقاط عم تصعد.' },
    { text: m(2 * y(5)), why: 'كبير كتير! 😅 النمط زيادة ثابتة مو ضعف.' },
  ]
  const seen = new Set<string>()
  return {
    kind: 'choice',
    prompt: `النقاط بتزيد بانتظام: ${rows}. أيّ قيمة هي التنبؤ المعقول للخطوة ${m(7)}؟`,
    options: list.filter((o) => (seen.has(o.text) ? false : (seen.add(o.text), true))),
  }
}