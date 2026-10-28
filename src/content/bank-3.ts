import type { Question } from '../types'
import type { PoolItem } from '../lib/exam'
import { pick, rand } from '../lib/rng'
import { sg } from '../lib/int'

const LET = ['س', 'ص', 'ن', 'ع', 'ك', 'م']
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}
const nzv = (m: number) => rand(2, m) * (rand(0, 1) ? 1 : -1)
const rule = (m: number, b: number) =>
  `${m === 1 ? '' : m === -1 ? '−' : sg(m)}س${b > 0 ? ` + ${b}` : b < 0 ? ` − ${-b}` : ''}`

/* ───────────── ٣-٢ ───────────── */

// مجموع زوايا المثلث
const triangleQ = (): Question => {
  const a = rand(30, 80), b = rand(25, 70)
  const ans = 180 - a - b
  return {
    kind: 'numeric',
    prompt: `في مثلث، قياس زاويتين فيه $${a}°$ و$${b}°$. اكتبي معادلة تمثّل مجموع الزوايا ($180°$) وحلّيها لتجدي قياس الزاوية الثالثة.`,
    answer: ans,
    wrong: wr(ans, [
      { value: a + b, why: 'هاد مجموع الزاويتين بس! لسا لازم نطرحه من $180$.' },
      { value: 180 - a, why: `طرحتي زاوية وحدة بس! لازم نطرح الزاويتين: $${a}$ و$${b}$.` },
      { value: 180 - b, why: `طرحتي زاوية وحدة بس! لازم نطرح الزاويتين: $${a}$ و$${b}$.` },
    ]),
    why: `المعادلة: $ل + ${a} + ${b} = 180$ ، يعني $ل + ${a + b} = 180$.\n\nنطرح $${a + b}$ من الطرفين: $ل = 180 − ${a + b} = ${ans}$.\n\nتحقق: $${a} + ${b} + ${ans} = 180$ ✔️`,
  }
}

// أي مسألة تمثّلها المعادلة س − ك = ت
const matchSubQ = (): Question => {
  const v = pick(LET), k = rand(3, 12), T = rand(10, 30)
  const target = `${v} − ${k} = ${T}`
  return {
    kind: 'choice',
    prompt: `أي المسائل الآتية يتطلّب حلّها المعادلة $${target}$ ؟`,
    options: [
      { text: `يقلّ عمر سليمان عن عمر أخته جواهر بمقدار $${k}$ سنوات. عمر سليمان $${T}$ سنة، و$${v}$ عمر جواهر.`, correct: true,
        why: `صح! جواهر أكبر، وعمرها منقوص منه $${k}$ يساوي عمر سليمان: $${target}$ ✔️` },
      { text: `عمر سليمان $${T}$ سنة، وهو أكبر من عمر أخته جواهر بـ $${k}$ سنوات. و$${v}$ عمر جواهر.`,
        why: `هون سليمان الأكبر، فعمره = عمر جواهر + $${k}$، يعني $${v} + ${k} = ${T}$ مو طرح.` },
      { text: `عددان مجموعهما $${T}$، أحدهما $${k}$، و$${v}$ العدد الآخر.`,
        why: `هاد **مجموع**: $${v} + ${k} = ${T}$.` },
      { text: `كان مع علاء $${T}$ طابعاً، أعطى أخاه $${k}$ طوابع، و$${v}$ عدد ما بقي معه.`,
        why: `هون س هو **اللي بقي**، فالمعادلة $${T} − ${k} = ${v}$ مو $${target}$.` },
    ],
  }
}

/* ───────────── ٣-٣ ───────────── */

const chooseEqDistQ = (): Question => {
  const r = rand(4, 15), n = rand(3, 8), d = r * n
  return {
    kind: 'choice',
    prompt: `يقطع سهيل $${r}$ كيلومتراً في الساعة بسيارته، فإذا قطع مسافة $${d}$ كيلومتراً في $ن$ ساعة، فأي معادلة تمثّل هذا الموقف؟`,
    options: [
      { text: `$${r}ن = ${d}$`, correct: true, why: 'صح! المسافة = السرعة × الزمن ✔️' },
      { text: `$${r} + ن = ${d}$`, why: 'هاد جمع! السرعة ثابتة بتتكرر كل ساعة: **ضرب**.' },
      { text: `$ن ÷ ${r} = ${d}$`, why: 'هاد قسمة! المسافة هي ناتج **ضرب** السرعة بالزمن.' },
      { text: `$ن − ${r} = ${d}$`, why: 'هاد طرح! ما في شي بينشال، السرعة بتتكرر: **ضرب**.' },
    ],
  }
}

const speedQ = (): Question => {
  const r = rand(4, 20), n = rand(3, 12), d = r * n
  return {
    kind: 'numeric',
    prompt: `قطع عدّاء $${d}$ متراً في $${n}$ ثانية بسرعة ثابتة. كم متراً قطع في الثانية الواحدة؟`,
    answer: r,
    wrong: wr(r, [
      { value: d * n, why: 'ضربتي! المعادلة $ن × ع = د$ وعكس الضرب **قسمة**.' },
      { value: d - n, why: 'هاد طرح! عكس الضرب هو **القسمة**.' },
    ]),
    why: `المعادلة: $${n}ع = ${d}$ ← نقسم على $${n}$: $ع = ${d} ÷ ${n} = ${r}$ متر بالثانية.`,
  }
}

/* ───────────── ٣-٤ ───────────── */

const backNumQ2 = (): Question => {
  let d: number, a: number, k: number, m: number
  do {
    d = rand(2, 5); a = rand(2, 9); k = rand(2, 5); m = rand(2, 9)
  } while (k * m - a <= 0)
  const ans = (k * m - a) * d
  return {
    kind: 'numeric',
    prompt: `عدد إذا قسمته على $${d}$ ثم أضفت إلى الناتج $${a}$ أصبح الناتج $${k}$ أمثال العدد $${m}$. ما هذا العدد؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: k * m - a, why: `نسيتي ترجّعي القسمة على $${d}$! عكسها الضرب في $${d}$.` },
      { value: (k * m + a) * d, why: `الجمع بنرجّعه بالطرح مو بالجمع: $${k * m} − ${a}$.` },
      { value: k * m * d - a, why: 'عكستي الترتيب! آخر عملية كانت الجمع فلازم نرجّعها **أول**.' },
    ]),
    why: `النتيجة النهائية: $${k} × ${m} = ${k * m}$.\n\nنرجّع الجمع بالطرح: $${k * m} − ${a} = ${k * m - a}$.\n\nنرجّع القسمة بالضرب: $${k * m - a} × ${d} = ${ans}$.\n\nتحقق: $${ans} ÷ ${d} + ${a} = ${k * m}$ ✔️`,
  }
}

const backBankQ = (): Question => {
  const a = rand(1, 4) * 100, b = rand(1, 4) * 100, r = rand(2, 8) * 100
  const ans = 2 * r + a + b
  return {
    kind: 'numeric',
    prompt: `سحبت ميساء $${a}$ ريال من رصيدها في البنك، ثم سحبت $${b}$ ريال، ثم سحبت نصف ما تبقّى من رصيدها. إذا بقي في رصيدها $${r}$ ريال، فكم ريالاً كان في رصيدها منذ البداية؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: r + a + b, why: `نسيتي **النصف**! الـ$${r}$ هي نصف ما تبقّى.` },
      { value: 2 * (r + a + b), why: 'ضاعفتي كل شي! النصف بس هو اللي بيتضاعف عند الرجوع.' },
      { value: 2 * r, why: 'وقفتي بنص الطريق! رجّعي كمان السحبتين.' },
    ]),
    why: `بقي $${r}$ وهي نصف الباقي، فقبل السحب الأخير $${r} × 2 = ${2 * r}$.\n\nنرجّع سحب $${b}$: $${2 * r} + ${b} = ${2 * r + b}$.\n\nنرجّع سحب $${a}$: $${2 * r + b} + ${a} = ${ans}$.`,
  }
}

/* ───────────── ٣-٥ ───────────── */

const twoStepNegQ = (): Question => {
  const v = pick(LET)
  const a = -rand(2, 9)
  const b = rand(1, 12) * (rand(0, 1) ? 1 : -1)
  const ans = nzv(8)
  const c = a * ans + b
  const wrong = [
    { value: c - b, why: `وقفتي بنص الطريق! لسا لازم نقسم على $${sg(a)}$.` },
    { value: -ans, why: `الإشارة! ناتج قسمة عددين إشارتيهم **مختلفة** سالب، و**متشابهة** موجب.` },
  ]
  if ((c + b) % a === 0) {
    wrong.push({ value: (c + b) / a, why: `عكستي عملية ${b > 0 ? 'الجمع' : 'الطرح'}! ${b > 0 ? 'نطرح' : 'نضيف'} $${Math.abs(b)}$.` })
  }
  return {
    kind: 'numeric',
    prompt: `حلّي المعادلة $−${-a}${v} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${sg(c)}$ ثم اكتبي قيمة $${v}$.`,
    answer: ans,
    wrong: wr(ans, wrong),
    why: `نتخلّص من ${b > 0 ? 'الجمع' : 'الطرح'}: ${b > 0 ? `نطرح $${b}$` : `نضيف $${-b}$`} فيصير $−${-a}${v} = ${sg(c - b)}$.\n\nنقسم على $${sg(a)}$: $${v} = ${sg(ans)}$.`,
  }
}

const exprBillQ = (): Question => {
  if (rand(0, 1)) {
    const T = rand(5, 20) * 100, u = rand(5, 20) * 10
    return {
      kind: 'choice',
      prompt: `مع وليد $${T}$ ريالاً. إذا بدأ يصرف منها $${u}$ ريالاً أسبوعياً، فأي العبارات الآتية تمثّل المبلغ **المتبقّي** معه بعد $س$ أسبوعاً؟`,
      options: [
        { text: `$${T} − ${u}س$`, correct: true, why: 'صح! الصرف بيتكرر كل أسبوع (ضرب) وبيتنقص من المبلغ الأصلي ✔️' },
        { text: `$${T} + ${u}س$`, why: 'المبلغ **بينقص** لأنو بيصرف، مو بيزيد.' },
        { text: `$${u}س$`, why: 'هاد مجموع اللي **صرفه** بس، مو المتبقّي.' },
        { text: `$(${T} − ${u})س$`, why: 'هيك نقص مرة وحدة وضرب الباقي بـ س! الصرف هو اللي بيتكرر.' },
      ],
    }
  }
  const f = rand(3, 10) * 10, u = rand(2, 9)
  return {
    kind: 'choice',
    prompt: `قدّمت شركة عرضاً: يدفع المشترك $${f}$ ريالاً شهرياً بالإضافة إلى $${u}$ ريالات عن كل جيجابايت إضافي. أي المعادلات تمثّل المبلغ $ص$ الذي يدفعه من استعمل $س$ جيجابايت إضافياً؟`,
    options: [
      { text: `$ص = ${f} + ${u}س$`, correct: true, why: 'صح! الثابت مرة وحدة، والإضافي بيتكرر مع كل جيجابايت ✔️' },
      { text: `$ص = (${f} + ${u})س$`, why: 'هيك الثابت بيتكرر مع كل جيجابايت، وهو شهري ثابت.' },
      { text: `$ص = ${f}س + ${u}$`, why: 'عكستي الأدوار! الثابت $' + f + '$ ما بيتكرر.' },
      { text: `$ص = ${f} − ${u}س$`, why: 'المبلغ **بيزيد** بزيادة الاستهلاك، مو بينقص.' },
    ],
  }
}

/* ───────────── ٣-٦ ───────────── */

// مساحة غير مظللة
const compositeAreaQ = (): Question => {
  let L: number, W: number, s: number
  do {
    L = rand(8, 14); W = rand(5, 10); s = rand(1, 4)
  } while (2 * s > W || 2 * s * s >= L * W)
  const ans = L * W - 2 * s * s
  return {
    kind: 'numeric',
    prompt: `حديقة مستطيلة بعداها $${L}$ م و$${W}$ م، وبداخلها مربعان متطابقان طول ضلع كل منهما $${s}$ م. ما المساحة غير المظلّلة (أي مساحة الحديقة بعد استثناء المربعين) بالمتر المربع؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: L * W - 2 * s, why: `نسيتي تضربي الضلع بنفسه! مساحة المربع الواحد $${s} × ${s} = ${s * s}$.` },
      { value: L * W - s * s, why: 'طرحتي مربع واحد بس! في **مربعين**.' },
      { value: L * W - (2 * s) * (2 * s), why: `ضاعفتي الضلع قبل التربيع! مساحة كل مربع $${s * s}$ ومنطرح مربعين: $2 × ${s * s}$.` },
    ]),
    why: `مساحة الحديقة: $${L} × ${W} = ${L * W}$.\n\nمساحة المربع الواحد: $${s} × ${s} = ${s * s}$ ، وللمربعين: $${2 * s * s}$.\n\nغير المظلّلة: $${L * W} − ${2 * s * s} = ${ans}$ م².`,
  }
}

// أكبر مساحة بمحيط ثابت
const largestAreaQ = (): Question => {
  const k = rand(4, 7), half = 2 * k, P = 2 * half
  const pool = Array.from({ length: k - 1 }, (_, i) => i + 1)
  const others: number[] = []
  while (others.length < 3) {
    const v = pool[rand(0, pool.length - 1)]
    if (!others.includes(v)) others.push(v)
  }
  const sides = [k, ...others]
  return {
    kind: 'choice',
    prompt: `كل المستطيلات الآتية محيطها $${P}$ سم. أيها له **أكبر مساحة**؟`,
    options: sides.map((a) => ({
      text: `الطول $${half - a}$ سم والعرض $${a}$ سم`,
      correct: a === k,
      why: a === k
        ? `صح! هاد **مربع** ($${k} × ${k}$) ومساحته $${k * k}$ سم²، وهي أكبر مساحة ✔️`
        : `مساحته $${a} × ${half - a} = ${a * (half - a)}$ سم²، وهي **أصغر** من مساحة المربع ($${k * k}$). كل ما قرب الطول من العرض زادت المساحة.`,
    })),
  }
}

/* ───────────── ٣-٧ ───────────── */

// ابحثي عن المعادلة من جدول
const tablePatternQ = (): Question => {
  let m: number, b: number
  do {
    m = rand(2, 5); b = rand(1, 8)
  } while (b === m)
  const r1 = m + b, r2 = 2 * m + b, r3 = 3 * m + b
  return {
    kind: 'choice',
    prompt: `الجدول يبيّن قيم $س$ وقيم $ص$ المرتبطة بها: $(1 ، ${r1})$ ، $(2 ، ${r2})$ ، $(3 ، ${r3})$. أي معادلة تمثّل العلاقة بين $س$ و$ص$؟`,
    options: [
      { text: `$ص = ${m}س + ${b}$`, correct: true,
        why: `صح! جرّبنا كل الصفوف: $${m}×1 + ${b} = ${r1}$ و$${m}×2 + ${b} = ${r2}$ و$${m}×3 + ${b} = ${r3}$ ✔️` },
      { text: `$ص = ${m + b}س$`, why: `بتناسب الصف الأول بس! عند $س = 2$ بتعطي $${2 * (m + b)}$ مو $${r2}$. لازم نجرّب **كل** الصفوف.` },
      { text: `$ص = ${b}س + ${m}$`, why: `بتناسب الصف الأول بس (قلبتي المعامل والثابت)! عند $س = 2$ بتعطي $${2 * b + m}$ مو $${r2}$.` },
      { text: `$ص = س + ${m + b - 1}$`, why: `بتناسب الصف الأول بس! عند $س = 2$ بتعطي $${m + b + 1}$ مو $${r2}$.` },
    ],
  }
}

// المعادلة التي يمرّ تمثيلها بنقطة
const lineThroughPointQ = (): Question => {
  const x = rand(1, 4), m = rand(1, 4), b = rand(1, 6), y = m * x + b
  const cands: [number, number][] = [[m, b], [m, b + 1], [m + 1, b], [m, b - 1]]
  return {
    kind: 'choice',
    prompt: `أي المعادلات الآتية يمرّ تمثيلها البياني بالنقطة $(${x} ، ${y})$ ؟`,
    options: cands.map(([cm, cb], k) => {
      const val = cm * x + cb
      return {
        text: `$ص = ${rule(cm, cb)}$`,
        correct: k === 0,
        why: k === 0
          ? `صح! عوّضنا $س = ${x}$: $${m} × ${x} + ${b} = ${y}$ ✔️`
          : `عوّضنا $س = ${x}$ فطلع $ص = ${val}$ مو $${y}$، يعني النقطة **مو** على هالمستقيم.`,
      }
    }),
  }
}

export const bank3: PoolItem[] = [
  { lesson: '3-2', gen: triangleQ },
  { lesson: '3-2', gen: matchSubQ },
  { lesson: '3-3', gen: chooseEqDistQ },
  { lesson: '3-3', gen: speedQ },
  { lesson: '3-4', gen: backNumQ2 },
  { lesson: '3-4', gen: backBankQ },
  { lesson: '3-5', gen: twoStepNegQ },
  { lesson: '3-5', gen: exprBillQ },
  { lesson: '3-6', gen: compositeAreaQ },
  { lesson: '3-6', gen: largestAreaQ },
  { lesson: '3-7', gen: tablePatternQ },
  { lesson: '3-7', gen: lineThroughPointQ },
]