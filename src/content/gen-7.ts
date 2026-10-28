import type { ChoiceOption, Question } from '../types'
import { pick, rand, shuffle } from '../lib/rng'
import { dec, fr, gcd, r2 } from '../lib/dec'

const m = (x: number | string) => `$${x}$`
const sumOf = (a: number[]) => a.reduce((s, x) => s + x, 0)
const prod = (a: number[]) => a.reduce((s, x) => s * x, 1)
const joinAnd = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join('، ')} و${a[a.length - 1]}`)
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => w.value > 0 && !seen.has(w.value) && (seen.add(w.value), true))
}

/* ── كسور مبسّطة وخيارات الاختيار ── */
type F = [number, number]
const sf = (n: number, d: number): F => {
  const g = gcd(n, d)
  return [n / g, d / g]
}
const fs = (f: F) => (f[1] === 1 ? `$${f[0]}$` : `$${fr(f[0], f[1])}$`)
const same = (a: F, b: F) => a[0] === b[0] && a[1] === b[1]
type W = { f: F; why: string }
function fracOpts(ok: F, okWhy: string, wrongs: W[]): ChoiceOption[] | null {
  const seen: F[] = [ok]
  const bad: ChoiceOption[] = []
  for (const w of wrongs) {
    if (w.f[1] === 0 || w.f[0] > w.f[1]) continue
    if (seen.some((s) => same(s, w.f))) continue
    seen.push(w.f)
    bad.push({ text: fs(w.f), why: w.why })
  }
  if (bad.length < 2) return null
  return [{ text: fs(ok), correct: true, why: okWhy }, ...bad.slice(0, 3)]
}

const COLORS = ['حمراء', 'زرقاء', 'خضراء', 'صفراء', 'بيضاء']
const heads = (mask: number, n: number) => {
  let h = 0
  for (let b = 0; b < n; b++) if (mask & (1 << b)) h++
  return h
}
const countCoins = (n: number, pred: (h: number) => boolean) => {
  let c = 0
  for (let mk = 0; mk < 1 << n; mk++) if (pred(heads(mk, n))) c++
  return c
}

/* ═════════ ٧-١ الحوادث والاحتمالات ═════════ */

export const probFracQ = (): Question => {
  for (;;) {
    const k = rand(2, 4)
    const cs = shuffle(COLORS).slice(0, k)
    const cnt = cs.map(() => rand(1, 7))
    const T = sumOf(cnt)
    const a = cnt[0]
    const ok = sf(a, T)
    const opts = fracOpts(ok, `برافو! 🎉 عدد النواتج في الحادثة ${a}، والعدد الكلي للنواتج ${T}. ح(${cs[0]}) = ${fs(ok)} ✔️`, [
      { f: sf(a, T - a), why: `قارنتي الكرات ال${cs[0]} مع **الباقي** بس! 🔍 المقام لازم يكون **كل** الكرات (${T}).` },
      { f: sf(T - a, T), why: `هاد احتمال إنها **مو** ${cs[0]}! 🔄 عدّيتي الباقي بدل المطلوب.` },
      { f: sf(1, k), why: `اعتبرتي كل لون إلو نفس الفرصة (١ من ${k})! 🔍 بس عدد الكرات مو متساوي، والفرصة بتعتمد على العدد.` },
    ])
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `كيس فيه كرات متماثلة: ${cs.map((c, i) => `${m(cnt[i])} ${c}`).join('، ')}. سُحبت كرة عشوائياً. ما ح(${cs[0]})؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

const CUBE = [
  { t: 'عدد فردي', s: [1, 3, 5] },
  { t: 'عدد زوجي', s: [2, 4, 6] },
  { t: 'عدد أولي', s: [2, 3, 5] },
  { t: 'عدد أكبر من ٤', s: [5, 6] },
  { t: 'عدد أصغر من ٣', s: [1, 2] },
  { t: 'مضاعف للعدد ٣', s: [3, 6] },
  { t: 'عامل للعدد ٦', s: [1, 2, 3, 6] },
  { t: 'عدد ليس أولياً', s: [1, 4, 6] },
  { t: '٢ أو ٣ أو ٤', s: [2, 3, 4] },
  { t: 'عدد أكبر من ١', s: [2, 3, 4, 5, 6] },
]

export const probCubeQ = (): Question => {
  for (;;) {
    const e = pick(CUBE)
    const k = e.s.length
    const ok = sf(k, 6)
    const list = e.s.join('، ')
    const opts = fracOpts(ok, `برافو! 🎉 النواتج اللي بتحقّق الشرط: ${list}، يعني ${k} نواتج من ٦. ح = ${fs(ok)} ✔️`, [
      { f: sf(k, 6 - k), why: 'قارنتي المطلوب مع **الباقي** بس! 🔍 المقام لازم يكون **كل** النواتج (٦).' },
      { f: sf(6 - k, 6), why: 'هاد احتمال العكس! 🔄 عدّيتي النواتج اللي **ما** بتحقّق الشرط.' },
      { f: sf(k + 1, 6), why: `عدّيتي ناتج زيادة ما بيحقّق الشرط! 🔍 النواتج المطلوبة هي: ${list}.` },
      { f: sf(k - 1, 6), why: `فاتك ناتج! 🔍 النواتج المطلوبة هي: ${list}.` },
    ])
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `رُمي مكعب أرقام (١ إلى ٦) مرة واحدة. ما ح(${e.t})؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

export const probPctQ = (): Question => {
  const T = pick([4, 5, 10, 20, 25, 50])
  const a = rand(1, T - 1)
  const p = (a * 100) / T
  const prompt = pick([
    `في صندوق ${m(T)} بطاقة متماثلة، منها ${m(a)} بطاقة حمراء. سُحبت بطاقة عشوائياً. ما احتمال أن تكون حمراء؟`,
    `في صف ${m(T)} طالبة، منهن ${m(a)} يرتدين نظارات. اخترنا طالبة عشوائياً. ما احتمال أن تكون ترتدي نظارة؟`,
    `قرص دوّار مقسّم إلى ${m(T)} قسماً متساوياً، منها ${m(a)} قسماً أزرق. ما احتمال أن يستقر المؤشر على قسم أزرق؟`,
  ])
  return {
    kind: 'numeric',
    prompt: `${prompt} (اكتبيه كنسبة مئوية، العدد بدون الرمز)`,
    answer: p,
    wrong: wr(p, [
      { value: a, why: `هاد عدد النواتج المطلوبة مو الاحتمال! 🔍 لازم نقسم على الكل (${T}) وبعدين نحوّل لنسبة.` },
      { value: r2(a / T), why: 'هاد الاحتمال ككسر عشري! 🔍 المطلوب نسبة مئوية: اضربي بـ١٠٠.' },
      { value: 100 - p, why: 'هاد احتمال العكس! 🔄' },
    ]),
    why: `ح = ${m(a)} ÷ ${m(T)} = ${m(dec(a / T))} = ${m(dec(p))}٪ ✔️`,
  }
}

type Z = 'imp' | 'less' | 'half' | 'more' | 'sure'
const ZN: Record<Z, string> = {
  imp: 'مستحيل',
  less: 'أقل احتمالاً',
  half: 'احتمال متساوٍ (كاحتمال عدم الوقوع)',
  more: 'أكثر احتمالاً',
  sure: 'أكيد',
}
const zoneOf = (f: F): Z =>
  f[0] === 0 ? 'imp' : f[0] === f[1] ? 'sure' : 2 * f[0] < f[1] ? 'less' : 2 * f[0] === f[1] ? 'half' : 'more'
const zwhy = (opt: Z, act: Z): string => {
  if (opt === 'imp') return 'المستحيل احتماله **صفر بالضبط**، وهاد أكبر من صفر. 🔍'
  if (opt === 'sure') return 'الأكيد احتماله **١ بالضبط**، وهاد أقل من ١. 🔍'
  if (opt === 'half') return 'الاحتمال المتساوي هو **النص** بالضبط (٠٫٥ أو ٥٠٪)، وهاد مو هيك. 🔍'
  if (opt === 'less') return act === 'imp' ? 'الصفر مو «أقل احتمالاً»، هو مستحيل تماماً. 🔍' : 'أقل احتمالاً معناها أقل من النص (بين ٠ والنص)، وهاد مو هيك. 🔍'
  return act === 'sure' ? 'الأكيد أقوى من «أكثر احتمالاً»: احتماله ١ بالضبط. 🔍' : 'أكثر احتمالاً معناها أكبر من النص (بين النص و١)، وهاد مو هيك. 🔍'
}
const VALS: F[] = [[0, 1], [1, 10], [1, 5], [1, 4], [2, 5], [1, 2], [3, 5], [3, 4], [4, 5], [9, 10], [1, 1]]

export const likelyQ = (): Question => {
  const f = pick(VALS)
  const kind = pick(['f', 'd', 'p'] as const)
  const repr = kind === 'f' ? fs(f) : kind === 'd' ? m(dec(f[0] / f[1])) : `${m(dec((f[0] * 100) / f[1]))}٪`
  const act = zoneOf(f)
  const okWhy: Record<Z, string> = {
    imp: 'برافو! 🎉 الاحتمال صفر يعني الحادثة مستحيلة، ما بتصير أبداً ✔️',
    sure: 'برافو! 🎉 الاحتمال ١ يعني الحادثة أكيدة، لازم تصير ✔️',
    half: `برافو! 🎉 ${repr} يساوي النص بالضبط، يعني فرصة الوقوع كفرصة عدم الوقوع ✔️`,
    less: `برافو! 🎉 ${repr} أكبر من صفر وأقل من النص، فالحادثة أقل احتمالاً ✔️`,
    more: `برافو! 🎉 ${repr} أكبر من النص وأقل من ١، فالحادثة أكثر احتمالاً ✔️`,
  }
  return {
    kind: 'choice',
    prompt: `احتمال حادثة ما هو ${repr}. كيف نصف هذه الحادثة؟`,
    options: (Object.keys(ZN) as Z[]).map((z) =>
      z === act ? { text: ZN[z], correct: true, why: okWhy[z] } : { text: ZN[z], why: zwhy(z, act) },
    ),
  }
}

export const sureQ = (): Question => {
  const c = pick(COLORS)
  const o = pick(COLORS.filter((x) => x !== c))
  const n = rand(3, 9)
  const imp = rand(0, 1) === 0
  const ask = imp ? o : c
  return {
    kind: 'choice',
    prompt: `كيس فيه ${m(n)} كرات كلها ${c}. سُحبت كرة عشوائياً. ما احتمال أن تكون الكرة ${ask}؟`,
    options: [
      {
        text: m(0), correct: imp,
        why: imp
          ? `برافو! 🎉 كل الكرات ${c}، وما في ولا كرة ${o}. عدد النواتج المطلوبة ٠، فالحادثة مستحيلة واحتمالها ٠ ✔️`
          : `الصفر للحادثة المستحيلة! 🔍 هون كل الكرات ${c}، فالحادثة أكيدة.`,
      },
      {
        text: m(1), correct: !imp,
        why: imp
          ? `الواحد للحادثة الأكيدة! 🔍 هون ما في ولا كرة ${o}.`
          : `برافو! 🎉 كل الكرات ${c}، يعني كل النواتج (${n} من ${n}) بتحقّق الحادثة. احتمالها ١ (حادثة أكيدة) ✔️`,
      },
      { text: fs([1, 2]), why: 'النص بيكون لما نص النواتج بس بتحقّق الحادثة. 🔍' },
      { text: fs(sf(1, n)), why: `هاد احتمال سحب كرة **معيّنة** من ${n}! 🔍 هون ${imp ? 'ولا كرة' : 'كل الكرات'} بتحقّق الحادثة.` },
    ],
  }
}

export const complementPctQ = (): Question => {
  const p = pick([5, 10, 15, 20, 25, 30, 35, 37, 40, 45, 60, 65, 70, 72, 75, 80, 85, 90, 95])
  const prompt = pick([
    `احتمال تساقط الأمطار غداً ${m(p)}٪. ما احتمال ألا تتساقط الأمطار؟`,
    `احتمال أن يفوز فريق المدرسة بالمباراة ${m(p)}٪. ما احتمال ألا يفوز؟`,
    `احتمال أن تنجح التجربة العلمية في الصف ${m(p)}٪. ما احتمال ألا تنجح؟`,
  ])
  return {
    kind: 'numeric',
    prompt: `${prompt} (اكتبي العدد بدون الرمز)`,
    answer: 100 - p,
    wrong: wr(100 - p, [
      { value: p, why: 'هاد احتمال الحادثة نفسها! 🔄 المطلوب احتمال **عكسها**.' },
      { value: 100 + p, why: 'جمعتي! 🔍 مجموع احتمال الحادثة ومتممتها ١٠٠٪، فنطرح من ١٠٠.' },
    ]),
    why: `ح(ليس أ) = ١٠٠٪ − ح(أ)\n\n$100 − ${p} = ${100 - p}$٪ ✔️`,
  }
}

export const complementDecQ = (): Question => {
  const k = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 85, 90, 95])
  const ans = (100 - k) / 100
  return {
    kind: 'numeric',
    prompt: `إذا كان ح(أ) = ${m(dec(k / 100))}، فما ح(ليس أ)؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: k / 100, why: 'هاد ح(أ) نفسها! 🔄 المطلوب المتممة.' },
      { value: (100 + k) / 100, why: 'جمعتي! 🔍 الاحتمال عمره ما بيزيد عن ١، والمتممة = ١ − ح(أ).' },
      { value: 100 - k, why: 'طرحتي من ١٠٠ مو من ١! 🔍 هون الاحتمال عشري، فنطرح من ١.' },
    ]),
    why: `ح(ليس أ) = ١ − ح(أ)\n\n$1 − ${dec(k / 100)} = ${dec(ans)}$ ✔️`,
  }
}

export const notEventQ = (): Question => {
  for (;;) {
    const k = rand(2, 4)
    const cs = shuffle(COLORS).slice(0, k)
    const cnt = cs.map(() => rand(1, 7))
    const T = sumOf(cnt)
    const a = cnt[0]
    const ok = sf(T - a, T)
    const opts = fracOpts(
      ok,
      `برافو! 🎉 الكرات اللي مو ${cs[0]}: ${T} − ${a} = ${T - a} من ${T}، يعني ${fs(ok)}. أو بالمتممة: ١ − ${fs(sf(a, T))} ✔️`,
      [
        { f: sf(a, T), why: `هاد ح(${cs[0]}) نفسها! 🔄 المطلوب احتمال العكس.` },
        { f: sf(a, T - a), why: 'قارنتي مع الباقي بس وقلبتي المطلوب! 🔍' },
        { f: sf(1, k), why: `اعتبرتي كل لون إلو نفس الفرصة (١ من ${k})! 🔍 بس عدد الكرات مو متساوي.` },
      ],
    )
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `كيس فيه كرات متماثلة: ${cs.map((c, i) => `${m(cnt[i])} ${c}`).join('، ')}. سُحبت كرة عشوائياً. ما ح(ليست ${cs[0]})؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

/* ═════════ ٧-٢ استراتيجية: إنشاء قائمة منظمة ═════════ */

type Tpl = { intro: string; parts: string[] }
const T3: Tpl[] = [
  { intro: 'مقصف مدرسي يقدّم وجبة فيها شطيرة وعصير وفاكهة', parts: ['أنواع الشطائر', 'أنواع العصائر', 'أنواع الفاكهة'] },
  { intro: 'تريد سمية تنسيق ملابسها من سترة وقميص وحذاء', parts: ['ألوان السترات', 'أنواع القمصان', 'أنواع الأحذية'] },
  { intro: 'مطعم يقدّم وجبة فيها مقبلات وطبق رئيسي وحلوى', parts: ['خيارات المقبلات', 'خيارات الأطباق الرئيسية', 'خيارات الحلويات'] },
  { intro: 'يريد سعد تجهيز هاتفه بغطاء وواقٍ للشاشة وسماعة', parts: ['أنواع الأغطية', 'أنواع واقيات الشاشة', 'أنواع السماعات'] },
]
const T2: Tpl[] = [
  { intro: 'محل يبيع حقائب', parts: ['ألوان الحقائب', 'أحجام الحقائب'] },
  { intro: 'مدرسة تختار زياً رياضياً من قميص وبنطال', parts: ['ألوان القمصان', 'ألوان البناطيل'] },
  { intro: 'نادٍ يقدّم دورة تتكوّن من مادة ووقت', parts: ['المواد المتاحة', 'الأوقات المتاحة'] },
  { intro: 'وجبة تتكوّن من مشروب وحلوى', parts: ['أنواع المشروبات', 'أنواع الحلويات'] },
]
const desc = (t: Tpl, n: number[]) => joinAnd(t.parts.map((p, i) => `عدد ${p} ${m(n[i])}`))

export const listCountQ = (): Question => {
  const three = rand(0, 1) === 1
  const t = pick(three ? T3 : T2)
  const n = t.parts.map(() => rand(2, 4))
  const ans = prod(n)
  return {
    kind: 'numeric',
    prompt: `${t.intro}: ${desc(t, n)}. نكتب قائمة منظمة لكل التركيبات الممكنة (خيار واحد من كل مجموعة). كم ناتجاً في القائمة؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: sumOf(n), why: 'جمعتي الخيارات! 😅 بالقائمة المنظمة كل خيار من الأول بيتزاوج مع **كل** خيار من التاني، فبنضرب.' },
      ...(three ? [{ value: n[0] * n[1], why: 'نسيتي المجموعة الأخيرة! 🔍 كل ناتج لازم فيه اختيار من كل مجموعة.' }] : []),
      { value: ans + 1, why: 'ناتج زيادة! 🔍 غالباً كرّرتي ناتج بالقائمة. تأكدي إن كل ناتج مكتوب مرة وحدة.' },
      { value: ans - 1, why: 'ناتج ناقص! 🔍 غالباً فاتك واحد. نظّمي قائمتك: ثبّتي الأول وبدّلي الباقي.' },
    ]),
    why: `نثبّت أول خيار ونبدّل الباقي بالترتيب، فكل خيار بيتزاوج مع كل خيارات المجموعات التانية:\n\n${m(n.join(' × '))} = ${m(ans)} ✔️`,
  }
}

export const listRepeatQ = (): Question => {
  const t = pick(T3)
  const n = t.parts.map(() => rand(2, 4))
  const total = prod(n)
  const g = rand(0, 2)
  const others = n.filter((_, j) => j !== g)
  const ans = prod(others)
  return {
    kind: 'numeric',
    prompt: `${t.intro}: ${desc(t, n)}. كتبنا قائمة منظمة بكل التركيبات (${m(total)} تركيبة). كم مرة يظهر الخيار الواحد من «${t.parts[g]}» في القائمة كاملة؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: total, why: 'هاد عدد كل النواتج! 🔍 المطلوب كم مرة بيظهر خيار **واحد** بس.' },
      { value: n[g], why: 'هاد عدد الخيارات نفسه مو عدد تكرارها! 🔍' },
      { value: sumOf(others), why: 'جمعتي! 😅 الخيار الواحد بيتزاوج مع **كل** خيارات المجموعتين التانيتين، فبنضرب.' },
    ]),
    why: `الخيار الواحد بيتزاوج مع كل خيارات المجموعتين التانيتين:\n\n${m(others.join(' × '))} = ${m(ans)} مرة ✔️`,
  }
}

const LP: { a: string[]; b: string[] }[] = [
  { a: ['أحمر', 'أزرق'], b: ['صغير', 'كبير'] },
  { a: ['شاي', 'قهوة'], b: ['بسكر', 'بدون سكر'] },
  { a: ['جبن', 'زعتر'], b: ['عصير', 'حليب', 'ماء'] },
  { a: ['حافلة', 'قطار'], b: ['صباحاً', 'مساءً'] },
  { a: ['رياضي', 'رسمي'], b: ['أسود', 'بني', 'رمادي'] },
]

export const listPickQ = (): Question => {
  const e = pick(LP)
  const all = e.a.flatMap((x) => e.b.map((y) => `(${x}، ${y})`))
  const n = all.length
  const missIdx = rand(0, n - 1)
  let dupIdx = rand(0, n - 1)
  while (dupIdx === missIdx) dupIdx = rand(0, n - 1)
  const missing = all.filter((_, j) => j !== missIdx)
  const dup = all.map((c, j) => (j === missIdx ? all[dupIdx] : c))
  const half = e.b.map((y) => `(${e.a[0]}، ${y})`)
  const J = (l: string[]) => l.join(' — ')
  return {
    kind: 'choice',
    prompt: `نريد قائمة منظمة لاختيار واحد من (${e.a.join('، ')}) وواحد من (${e.b.join('، ')}). أيّ قائمة فيها كل النواتج الممكنة بدون نقص وبدون تكرار؟`,
    options: [
      { text: J(all), correct: true, why: `برافو! 🎉 ${n} نواتج (${e.a.length} × ${e.b.length})، كل ناتج مرة وحدة، ومرتّبة بنظام ✔️` },
      { text: J(missing), why: `ناقصة! 🔍 المفروض ${n} نواتج (${e.a.length} × ${e.b.length}) وهاي فيها ${n - 1} بس.` },
      { text: J(dup), why: `فيها ناتج مكرر وناتج ناقص! 🔍 عددها ${n} بس مو كل النواتج موجودة: ${all[missIdx]} مفقود.` },
      { text: J(half), why: `ركّزتي على «${e.a[0]}» بس! 🔍 كل خيار من الأول بدو يتزاوج مع كل خيارات التاني.` },
    ],
  }
}

export const coinsQ = (): Question => {
  const n = rand(2, 4)
  const ans = 2 ** n
  return {
    kind: 'numeric',
    prompt: `رُميت ${m(n)} قطع نقد معاً. كم ناتجاً ممكناً في القائمة المنظمة؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: 2 * n, why: 'جمعتي! 😅 كل قطعة إلها ناتجين، وكل قطعة جديدة **بتضاعف** العدد.' },
      { value: n * n, why: 'ضربتي عدد القطع بنفسه! 🔍 المطلوب ٢ مضروبة بنفسها بعدد القطع.' },
      { value: ans - 1, why: 'فاتك ناتج! 🔍 نظّمي القائمة وتأكدي إنك ما نسيتي واحد.' },
      { value: ans + 2, why: 'عدّيتي نواتج زيادة! 🔍 ما في تكرار بالقائمة المنظمة.' },
    ]),
    why: `كل قطعة إلها ناتجين، وكل قطعة جديدة بتضاعف العدد:\n\n${m(Array(n).fill(2).join(' × '))} = ${m(ans)} ✔️`,
  }
}

/* ═════════ ٧-٣ عدّ النواتج ═════════ */

const SS = [
  { t: 'رمي قطعة نقد ثم مكعب أرقام (١ إلى ٦)', n: [2, 6] },
  { t: 'رمي قطعتي نقد ثم مكعب أرقام', n: [2, 2, 6] },
  { t: 'اختيار حرف من كلمة «جبل» ثم رقم من ١ إلى ٥', n: [3, 5] },
  { t: 'اختيار لون من ٤ ألوان ثم مقاس من ٣ مقاسات', n: [4, 3] },
  { t: 'رمي مكعب أرقام مرتين', n: [6, 6] },
  { t: 'اختيار عدد من ١ إلى ٥ ثم لون من ٣ ألوان', n: [5, 3] },
  { t: 'اختيار حرف علة من كلمة «وكيل» ثم حرف من كلمة «جبل»', n: [2, 3] },
]

export const spaceSizeQ = (): Question => {
  const e = pick(SS)
  const ans = prod(e.n)
  return {
    kind: 'numeric',
    prompt: `كم ناتجاً في فضاء العينة عند: ${e.t}؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: sumOf(e.n), why: 'جمعتي! 😅 كل ناتج من الأولى بيتزاوج مع **كل** ناتج من التانية (الجدول أو الرسم الشجري بيبيّنوا هالشي).' },
      ...(e.n.length === 3 ? [{ value: e.n[0] * e.n[1], why: 'نسيتي المرحلة الأخيرة! 🔍 كل فرع بيتفرّع كمان.' }] : []),
      { value: ans - 1, why: 'ناتج ناقص! 🔍 ارسمي الشجرة وعدّي الأوراق.' },
    ]),
    why: `نرسم شجرة (أو جدول) ونعدّ الأوراق: ${m(e.n.join(' × '))} = ${m(ans)} ناتجاً ✔️`,
  }
}

export const treeCountQ = (): Question => {
  const three = rand(0, 3) === 0
  const a = rand(2, 5)
  const b = rand(2, 4)
  const c = rand(2, 3)
  const n = three ? [a, b, c] : [a, b]
  const ans = prod(n)
  return {
    kind: 'numeric',
    prompt: three
        ? `رسم شجري يبدأ بـ${m(a)} فروع، وكل فرع ينقسم إلى ${m(b)} فروع، وكل فرع من هدول ينقسم إلى ${m(c)} فروع. كم ناتجاً في آخر الشجرة؟`
      : `رسم شجري يبدأ بـ${m(a)} فروع، وكل فرع ينقسم إلى ${m(b)} فروع. كم ناتجاً (ورقة) في آخر الشجرة؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: sumOf(n), why: 'جمعتي! 😅 كل فرع بيتفرّع لعدد فروع، فبنضرب.' },
      { value: a, why: 'عدّيتي فروع أول مستوى بس! 🔍 الأوراق هي آخر الفروع.' },
      { value: a * b, why: 'وقفتي قبل آخر مستوى! 🔍 كمّلي للأوراق الأخيرة.' },
    ]),
    why: `الأوراق = ${m(n.join(' × '))} = ${m(ans)} ✔️`,
  }
}

type CE = { n: number; t: string; p: (h: number) => boolean }
const CE_LIST: CE[] = [
  { n: 2, t: 'ظهور الشعار مرة واحدة بالضبط', p: (h) => h === 1 },
  { n: 2, t: 'ظهور الشعار مرتين', p: (h) => h === 2 },
  { n: 2, t: 'ظهور الشعار مرة واحدة على الأقل', p: (h) => h >= 1 },
  { n: 3, t: 'ظهور الشعار مرتين بالضبط', p: (h) => h === 2 },
  { n: 3, t: 'ظهور الشعار مرتين على الأقل', p: (h) => h >= 2 },
  { n: 3, t: 'ظهور الكتابة على القطع الثلاث', p: (h) => h === 0 },
  { n: 3, t: 'ظهور الشعار مرة واحدة بالضبط', p: (h) => h === 1 },
  { n: 3, t: 'ظهور الوجه نفسه على القطع الثلاث', p: (h) => h === 0 || h === 3 },
]

export const coinProbQ = (): Question => {
  for (;;) {
    const e = pick(CE_LIST)
    const T = 2 ** e.n
    const c = countCoins(e.n, e.p)
    let cat = 0
    for (let h = 0; h <= e.n; h++) if (e.p(h)) cat++
    const ok = sf(c, T)
    const opts = fracOpts(ok, `برافو! 🎉 فضاء العينة فيه ${T} نواتج متساوية الفرصة، والنواتج المطلوبة ${c}. الاحتمال ${fs(ok)} ✔️`, [
      { f: sf(cat, e.n + 1), why: `عدّيتي «عدد مرات الشعار» (٠، ١، ٢ ...) كأنها نواتج متساوية الفرصة! 🔍 بس (شعار، كتابة) غير (كتابة، شعار)، فلازم نكتب فضاء العينة كامل: ${T} ناتج.` },
      { f: sf(c, T - c), why: `قارنتي مع الباقي بس! 🔍 المقام لازم يكون **كل** النواتج (${T}).` },
      { f: sf(T - c, T), why: 'هاد احتمال العكس! 🔄' },
    ])
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `${e.n === 2 ? 'رُميت قطعتا نقد معاً' : 'رُميت ثلاث قطع نقد معاً'} (لكل وجه نفس الفرصة). ما احتمال ${e.t}؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

const DICE_EV: { t: string; sumEv?: boolean; p: (a: number, b: number) => boolean }[] = [
  { t: 'أن يكون العددان متساويين', p: (a, b) => a === b },
  { t: 'أن يكون مجموع العددين ٧', sumEv: true, p: (a, b) => a + b === 7 },
  { t: 'أن يكون مجموع العددين ٢', sumEv: true, p: (a, b) => a + b === 2 },
  { t: 'أن يكون مجموع العددين ١٢', sumEv: true, p: (a, b) => a + b === 12 },
  { t: 'أن يكون مجموع العددين ٥', sumEv: true, p: (a, b) => a + b === 5 },
  { t: 'أن يكون مجموع العددين أقل من ٥', sumEv: true, p: (a, b) => a + b < 5 },
  { t: 'أن يظهر العدد ٦ مرة واحدة على الأقل', p: (a, b) => a === 6 || b === 6 },
  { t: 'أن يكون العدد الأول أكبر من الثاني', p: (a, b) => a > b },
]

export const twoDiceQ = (): Question => {
  for (;;) {
    const e = pick(DICE_EV)
    let c = 0
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (e.p(a, b)) c++
    const ok = sf(c, 36)
    const opts = fracOpts(ok, `برافو! 🎉 فضاء العينة فيه ٦ × ٦ = ٣٦ ناتجاً متساوي الفرصة، والنواتج المطلوبة ${c}. ح = ${fs(ok)} ✔️`, [
      { f: sf(c, 6), why: 'قسمتي على ٦ بس (مكعب واحد)! 🔍 رمي المكعب مرتين فضاء عينته ٣٦.' },
      { f: sf(c, 12), why: 'جمعتي ٦ + ٦! 😅 فضاء العينة ٦ × ٦ = ٣٦.' },
      ...(e.sumEv ? [{ f: sf(1, 11), why: 'عدّيتي المجاميع الممكنة (٢ لـ١٢) كأنها نواتج متساوية! 🔍 بس بعض المجاميع أكتر احتمالاً من غيرها، فلازم نعدّ كل الأزواج.' }] : []),
      { f: sf(c, 36 - c), why: 'قارنتي مع الباقي بس! 🔍 المقام لازم يكون ٣٦.' },
    ])
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `رُمي مكعب أرقام (١ إلى ٦) مرتين. ما احتمال ${e.t}؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

const GE_LIST: CE[] = [
  { n: 2, t: 'ظهر الوجه نفسه على القطعتين', p: (h) => h === 0 || h === 2 },
  { n: 2, t: 'ظهر شعاران', p: (h) => h === 2 },
  { n: 2, t: 'ظهر شعار واحد على الأقل', p: (h) => h >= 1 },
  { n: 3, t: 'ظهرت كتابتان على الأقل', p: (h) => h <= 1 },
  { n: 3, t: 'ظهر الوجه نفسه على القطع الثلاث', p: (h) => h === 0 || h === 3 },
  { n: 3, t: 'ظهر شعار واحد على الأقل', p: (h) => h >= 1 },
]

export const fairGameQ = (): Question => {
  const e = pick(GE_LIST)
  const T = 2 ** e.n
  const c = countCoins(e.n, e.p)
  const pL = sf(c, T)
  const pS = sf(T - c, T)
  const v: 'fair' | 'L' | 'S' = c * 2 === T ? 'fair' : c * 2 > T ? 'L' : 'S'
  const cmp = `احتمال فوز ليلى ${fs(pL)} واحتمال فوز سلمى ${fs(pS)}`
  return {
    kind: 'choice',
    prompt: `ترمي ليلى ${e.n === 2 ? 'قطعتي نقد' : 'ثلاث قطع نقد'} معاً مرة واحدة. تربح ليلى إذا ${e.t}، وإلا تربح سلمى. أيّ عبارة صحيحة؟`,
    options: [
      {
        text: 'اللعبة عادلة', correct: v === 'fair',
        why: v === 'fair' ? `برافو! 🎉 ${cmp}، وهما متساويان، فاللعبة عادلة ✔️` : `اللعبة العادلة لازم احتمال فوز كل لاعبة يكون نفس التانية. هون ${cmp}. 🔍`,
      },
      {
        text: 'غير عادلة: ليلى أوفر حظاً', correct: v === 'L',
        why: v === 'L' ? `برافو! 🎉 ${cmp}، وفرصة ليلى أكبر ✔️` : v === 'fair' ? `الاحتمالان متساويان (${cmp})، فما في حدا أوفر حظاً. 🔍` : `قارني: ${cmp}. الفرصة الأكبر لسلمى مو ليلى. 🔍`,
      },
      {
        text: 'غير عادلة: سلمى أوفر حظاً', correct: v === 'S',
        why: v === 'S' ? `برافو! 🎉 ${cmp}، وفرصة سلمى أكبر ✔️` : v === 'fair' ? `الاحتمالان متساويان (${cmp})، فما في حدا أوفر حظاً. 🔍` : `قارني: ${cmp}. الفرصة الأكبر لليلى مو سلمى. 🔍`,
      },
    ],
  }
}

export const twoBagsQ = (): Question => {
  for (;;) {
    const a = rand(1, 2), b = rand(1, 2), c = rand(1, 2), d = rand(1, 2)
    const T = (a + b) * (c + d)
    const same = a * c + b * d
    const ok = sf(same, T)
    const opts = fracOpts(
      ok,
      `برافو! 🎉 كل كرة من الكيس الأول بتتزاوج مع كل كرة من التاني: ${a + b} × ${c + d} = ${T} ناتج متساوي الفرصة. (خضراء، خضراء): ${a} × ${c} = ${a * c}، و(حمراء، حمراء): ${b} × ${d} = ${b * d}. الاحتمال ${fs(ok)} ✔️`,
      [
        { f: sf(1, 2), why: 'عدّيتي ٤ نواتج بس (لون الكيس الأول مع لون التاني) كأنها متساوية الفرصة! 🔍 بس الكرات مو بنفس العدد، فلازم نعدّ كل كرة لحالها.' },
        { f: sf(a * c, T), why: 'حسبتي (خضراء، خضراء) بس! 🔍 (حمراء، حمراء) كمان لونهم نفسه.' },
        { f: sf(T - same, T), why: 'هاد احتمال إنهم **مختلفين**! 🔄' },
      ],
    )
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `في الكيس الأول: خضراء ${m(a)} وحمراء ${m(b)}. وفي الكيس الثاني: خضراء ${m(c)} وحمراء ${m(d)}. سُحبت كرة عشوائياً من كل كيس. ما احتمال أن تكون الكرتان من اللون نفسه؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

/* ═════════ ٧-٤ مبدأ العد الأساسي ═════════ */

const FC = [
  { t: 'اختيار شهر من أشهر السنة (١٢ شهراً) ثم يوم من أيام الأسبوع', n: [12, 7] },
  { t: 'رمي مكعب أرقام (١ إلى ٦) ثم رمي قطعتي نقد', n: [6, 2, 2] },
  { t: 'اختيار فريق من ١٠ فرق ثم لاعب من ١١ لاعباً', n: [10, 11] },
  { t: 'اختيار عدد من ١ إلى ٢٠ ثم لون من ٧ ألوان', n: [20, 7] },
  { t: 'شراء كوب شاي بأربع نكهات، مع سكر أو بدونه، في كوب زجاجي أو ورقي', n: [4, 2, 2] },
  { t: 'رمي قطعة نقد أربع مرات', n: [2, 2, 2, 2] },
  { t: 'اختيار شطيرة من ٤ أنواع وكوب عصير من ٣ أنواع', n: [4, 3] },
  { t: 'تنسيق قميص من ٥ ألوان وبنطال من ٤ ألوان وحذاء من ٣ أنواع', n: [5, 4, 3] },
]

export const fundCountQ = (): Question => {
  const e = pick(FC)
  const ans = prod(e.n)
  return {
    kind: 'numeric',
    prompt: `استعملي مبدأ العد الأساسي: كم ناتجاً ممكناً عند ${e.t}؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: sumOf(e.n), why: 'جمعتي! 😅 مبدأ العد الأساسي بيضرب عدد الخيارات.' },
      { value: Math.max(...e.n), why: 'هاد أكبر عدد خيارات بس! 🔍 لازم نضرب كل الأعداد.' },
      ...(e.n.length > 2 ? [{ value: e.n[0] * e.n[1], why: 'نسيتي المرحلة الأخيرة! 🔍 اضربي كل الأعداد.' }] : []),
    ]),
    why: `نضرب عدد الخيارات في كل مرحلة:\n\n${m(e.n.join(' × '))} = ${m(ans)} ✔️`,
  }
}

export const fundProbQ = (): Question => {
  for (;;) {
    const three = rand(0, 1) === 1
    const t = pick(three ? T3 : T2)
    const n = t.parts.map(() => rand(2, 4))
    const N = prod(n)
    const ok = sf(1, N)
    const opts = fracOpts(ok, `برافو! 🎉 عدد النواتج الممكنة ${m(n.join(' × '))} = ${m(N)}، وناتج واحد بس بيحقّق الشرط. ح = ${fs(ok)} ✔️`, [
      { f: sf(1, sumOf(n)), why: 'جمعتي عدد الخيارات! 😅 عدد النواتج بنحسبه بالضرب.' },
      { f: sf(1, three ? n[0] * n[1] : n[0]), why: 'نسيتي مجموعة من الحساب! 🔍 عدد النواتج الكلي بيضرب كل الأعداد.' },
      { f: sf(1, n[0]), why: 'عدّيتي المجموعة الأولى بس! 🔍 الاحتمال بيعتمد على كل النواتج الممكنة.' },
    ])
    if (!opts) continue
    return {
      kind: 'choice',
      prompt: `${t.intro}: ${desc(t, n)}. اختيرت تركيبة واحدة عشوائياً (خيار من كل مجموعة). ما احتمال أن تكون هي التركيبة المحدّدة اللي اختارتها سلمى مسبقاً؟ اكتبيه بأبسط صورة.`,
      options: opts,
    }
  }
}

export const fundMissingQ = (): Question => {
  const t = pick(T3)
  const a = rand(2, 4), b = rand(2, 4), c = rand(2, 6)
  const total = a * b * c
  return {
    kind: 'numeric',
    prompt: `${t.intro}: عدد ${t.parts[0]} ${m(a)}، وعدد ${t.parts[1]} ${m(b)}، وعدد النواتج الممكنة كلها ${m(total)}. كم عدد ${t.parts[2]}؟`,
    answer: c,
    wrong: wr(c, [
      { value: a * b, why: 'هاد حاصل ضرب العددين المعطيين بس! 🔍 لازم نقسم المجموع الكلي عليه.' },
      { value: total / a, why: `قسمتي على ${a} بس! 🔍 لازم نقسم على ${a} × ${b}.` },
      { value: total / b, why: `قسمتي على ${b} بس! 🔍 لازم نقسم على ${a} × ${b}.` },
    ]),
    why: `${m(a)} × ${m(b)} × ؟ = ${m(total)}\n\n${m(a)} × ${m(b)} = ${m(a * b)}، فنقسم: ${m(total)} ÷ ${m(a * b)} = ${m(c)} ✔️`,
  }
}

export const addOptionQ = (): Question => {
  const t = pick(T2)
  const a = rand(2, 5), b = rand(2, 5)
  const old = a * b
  const ans = (a + 1) * b
  return {
    kind: 'numeric',
    prompt: `${t.intro}: عدد ${t.parts[0]} ${m(a)}، وعدد ${t.parts[1]} ${m(b)}. أُضيف خيار واحد جديد إلى مجموعة «${t.parts[0]}». كم صار عدد النواتج الممكنة؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: old, why: 'هاد العدد قبل الإضافة! 🔍 الخيار الجديد بيزيد النواتج.' },
      { value: old + 1, why: 'زدتي ناتج واحد بس! 🔍 الخيار الجديد بيتزاوج مع **كل** خيارات المجموعة التانية.' },
      { value: a + 1 + b, why: 'جمعتي! 😅 بنضرب.' },
    ]),
    why: `${m(a)} + ١ = ${m(a + 1)} خياراً، فنضرب: ${m(a + 1)} × ${m(b)} = ${m(ans)}\n\n(كل خيار جديد بيجيب معه ${b} نواتج جديدة) ✔️`,
  }
}

export const codeQ = (): Question => {
  const n = rand(2, 4)
  const set = pick([{ s: 10, t: 'من ٠ إلى ٩' }, { s: 5, t: 'من ١ إلى ٥' }, { s: 6, t: 'من ١ إلى ٦' }])
  const ans = set.s ** n
  return {
    kind: 'numeric',
    prompt: `رقم سري مكوّن من ${m(n)} منازل، وكل منزل رقم ${set.t} (يُسمح بتكرار الرقم). كم رقماً سرياً ممكناً؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: set.s * n, why: 'ضربتي عدد الخيارات بعدد المنازل! 🔍 كل منزل إلو ' + set.s + ' خيارات، فنضرب ' + set.s + ' بنفسه.' },
      { value: set.s ** (n - 1), why: 'نسيتي منزل! 🔍 عدد المنازل ' + n + '.' },
      { value: set.s + n, why: 'جمعتي! 😅 مبدأ العد بيضرب.' },
    ]),
    why: `كل منزل إلو ${set.s} خيارات، فنضرب:\n\n${m(Array(n).fill(set.s).join(' × '))} = ${m(ans)} ✔️`,
  }
}