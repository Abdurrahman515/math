import type { Question } from '../types'
import { pick, rand } from '../lib/rng'
import { dec, fr, r2, gcd } from '../lib/dec'

const P = '\u066A'
/** عدد / نسبة داخل صيغة Rich */
const m = (x: number) => `$${dec(x)}$`
const pc = (x: number) => `$${dec(x)}${P}$`
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}
/** تقريب a/b لأقرب عُشر بالتقريب إلى الأعلى عند المنتصف (دون أخطاء الفاصلة العائمة) */
const rt = (a: number, b: number) => Math.round((a * 10) / b) / 10
const opts = (
  correct: number,
  list: { v: number; why: string }[],
  okWhy: string,
  fmt: (v: number) => string = (v) => `$${dec(v)}$`,
) => {
  const seen = new Set([correct])
  return [
    { text: fmt(correct), correct: true, why: okWhy },
    ...list.filter((w) => (seen.has(w.v) ? false : (seen.add(w.v), true))).map((w) => ({ text: fmt(w.v), why: w.why })),
  ]
}

const FRIENDLY = [10, 20, 25, 50, 60, 75, 80]
const nearest = (p: number) => {
  const d = [...FRIENDLY].sort((a, b) => Math.abs(a - p) - Math.abs(b - p))
  return Math.abs(d[0] - p) === Math.abs(d[1] - p) ? null : d[0]
}
const friendlyPct = () => {
  for (;;) {
    const p = pick(FRIENDLY) + pick([-3, -2, -1, 1, 2, 3])
    const f = nearest(p)
    if (f !== null && Math.abs(f - p) <= 3) return { p, f }
  }
}
const frOf = (f: number) => { const g = gcd(f, 100); return fr(f / g, 100 / g) }

/* ═════════ ٥-١ النسبة المئوية من عدد ═════════ */

export const pctOfQ = (): Question => {
  const p = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90])
  const n = 20 * rand(2, 20)
  const ans = r2((p * n) / 100)
  const story = rand(0, 1) === 1
  return {
    kind: 'numeric',
    prompt: story
      ? `سعر حقيبة ${m(n)} ريالاً وعليها تخفيض ${pc(p)}. كم ريالاً توفّرين (مقدار التخفيض)؟`
      : `ما ${pc(p)} من ${m(n)}؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: p * n, why: `نسيتي تقسمي على ١٠٠! 😅 ${pc(p)} معناها $${fr(p, 100)}$ من العدد، مو ${p} مرة.` },
      { value: r2((p * n) / 10), why: 'قسمتي على ١٠ بدل ١٠٠! 🔍 الفاصلة لازم تتحرك منزلتين.' },
      { value: r2(n - ans), why: 'هاد الباقي بعد ما شلنا الجزء! السؤال عن الجزء نفسه.' },
    ]),
    why: `${pc(p)} = $${fr(p, 100)} = ${dec(p / 100)}$\n\n$${dec(p / 100)} × ${n} = ${dec(ans)}$ ✔️`,
  }
}

export const pctOverQ = (): Question => {
  const p = pick([110, 120, 125, 130, 150, 175, 200, 250])
  const n = 20 * rand(2, 15)
  const ans = r2((p * n) / 100)
  return {
    kind: 'numeric',
    prompt: `ما ${pc(p)} من ${m(n)}؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: r2((n * (p - 100)) / 100), why: `هاد الزيادة فوق ال١٠٠٪ بس! 🔍 ${pc(p)} = ١٠٠٪ + ${p - 100}٪، يعني لازم نحسب العدد كله وزيادة.` },
      { value: r2((p * n) / 10), why: 'قسمتي على ١٠ بدل ١٠٠! 😅 الفاصلة تتحرك منزلتين.' },
      { value: n, why: 'هاد ١٠٠٪ بس! النسبة أكبر من ١٠٠٪.' },
    ]),
    why: `${pc(p)} = $${fr(p, 100)} = ${dec(p / 100)}$\n\n$${dec(p / 100)} × ${n} = ${dec(ans)}$\n\nالجواب أكبر من $${n}$ لأن النسبة أكبر من ١٠٠٪ ✔️`,
  }
}

export const pctWordQ = (): Question => {
  const p = pick([10, 20, 25, 30, 40, 50, 75])
  const n = 20 * rand(2, 15)
  const ans = r2((p * n) / 100)
  return {
    kind: 'numeric',
    prompt: pick([
      `في مدرسة ${m(n)} طالباً، ${pc(p)} منهم يشاركون في النشاط الكشفي. كم طالباً يشارك؟`,
      `ادّخرت لينا ${pc(p)} من مصروفها البالغ ${m(n)} ريالاً. كم ريالاً ادّخرت؟`,
      `في كيس ${m(n)} كرة، ${pc(p)} منها حمراء. كم كرة حمراء في الكيس؟`,
      `قطع سائق ${pc(p)} من رحلة طولها ${m(n)} كلم. كم كلم قطع؟`,
    ]),
    answer: ans,
    wrong: wr(ans, [
      { value: p * n, why: 'نسيتي تقسمي على ١٠٠! 😅' },
      { value: r2(n - ans), why: 'هاد الباقي مو الجزء المطلوب! 🔍' },
      { value: r2(n / p), why: 'قسمتي العدد على النسبة! النسبة بتتحول لكسر وبنضرب فيها.' },
    ]),
    why: `${pc(p)} = $${dec(p / 100)}$\n\n$${dec(p / 100)} × ${n} = ${dec(ans)}$ ✔️`,
  }
}

export const pctRoundQ = (): Question => {
  const p = pick([12, 17, 23, 35, 43, 62, 67, 78])
  let n: number
  do { n = rand(51, 500) } while ((p * n) % 10 === 0)
  const exact = (p * n) / 100
  const ans = rt(p * n, 100)
  return {
    kind: 'numeric',
    prompt: `أوجدي ${pc(p)} من ${m(n)}، وقرّبي الناتج لأقرب عُشر (منزلة واحدة بعد الفاصلة).`,
    answer: ans,
    wrong: wr(ans, [
      { value: Math.floor((p * n * 10) / 100) / 10, why: 'قطعتي الرقم بدل ما تقرّبي! 🔍 إذا الرقم بعد المنزلة ٥ أو أكثر بنرفع المنزلة.' },
      { value: Math.round(exact), why: 'قرّبتي لأقرب عدد صحيح! السؤال طلب لأقرب **عُشر**: منزلة وحدة بعد الفاصلة.' },
      { value: rt(p * n, 10), why: 'حرّكتي الفاصلة منزلة وحدة بس! لازم منزلتين.' },
    ]),
    why: `$${dec(p / 100)} × ${n} = ${dec(exact)}$\n\nنقرّب لأقرب عُشر: ننظر للمنزلة اللي بعد العُشر، فيصير الناتج $${dec(ans)}$ ✔️`,
  }
}

export const pctReasonQ = (): Question => {
  const p = pick([40, 60, 75, 120, 150, 200])
  const n = 20 * rand(2, 10)
  const ans = r2((p * n) / 100)
  const over = p > 100
  const list = over
    ? [
        { v: r2((n * (p - 100)) / 100), why: `هاد أقل من ${n}! ${pc(p)} أكبر من ١٠٠٪، فالجواب لازم يكون **أكبر** من ${n}.` },
        { v: r2(ans * 10), why: 'كبير كتير! 😅 النسبة بنقسمها على ١٠٠ مو على ١٠.' },
        { v: r2(ans / 10), why: 'صغير كتير! 🔍 ما بيعقل يكون أقل من العدد الأصلي لأن النسبة أكبر من ١٠٠٪.' },
      ]
    : [
        { v: r2(n + ans), why: `هاد أكبر من ${n}! ${pc(p)} أقل من ١٠٠٪، فالجواب لازم يكون **أقل** من ${n}.` },
        { v: r2(ans * 10), why: 'كبير كتير! 😅 بيطلع أكبر من العدد الأصلي.' },
        { v: r2(ans / 10), why: 'صغير كتير! 🔍 حرّكتي الفاصلة منزلة زيادة.' },
      ]
  return {
    kind: 'choice',
    prompt: `من غير ما تحسبي بدقة: أيّ هذه النواتج هو الجواب الصحيح لـ ${pc(p)} من ${m(n)}؟ (فكّري: الجواب أكبر أو أقل من ${n}؟)`,
    options: opts(ans, list, `برافو! 🎉 ${pc(p)} ${over ? 'أكبر' : 'أقل'} من ١٠٠٪ والجواب ${over ? 'أكبر' : 'أقل'} من ${n} ✔️ ($${dec(p / 100)} × ${n} = ${dec(ans)}$)`),
  }
}

/* ═════════ ٥-٢ تقدير النسبة المئوية ═════════ */

export const estBestQ = (): Question => {
  const { p, f } = friendlyPct()
  const base = 20 * rand(5, 30)
  const n = base + pick([-4, -3, -2, 2, 3, 4])
  const est = r2((f * base) / 100)
  return {
    kind: 'choice',
    prompt: `أيّ هذه أفضل تقدير لـ ${pc(p)} من ${m(n)}؟`,
    options: opts(
      est,
      [
        { v: r2((f * base) / 10), why: 'كبير كتير! 😅 النسبة الصديقة لازم نقسمها على ١٠٠ مو ١٠.' },
        { v: r2((f * base) / 1000), why: 'صغير كتير! 🔍 حرّكتي الفاصلة ثلاث منازل بدل اثنتين.' },
        { v: r2(base - est), why: 'هاد الباقي مو الجزء! 🔄 السؤال بيطلب النسبة نفسها من العدد.' },
      ],
      `برافو! 🎉 ${pc(p)} ≈ ${pc(f)} = $${frOf(f)}$ و$${n} ≈ ${base}$\n\n$${base} × ${frOf(f)} = ${dec(est)}$ ✔️`,
      (v) => `حوالي $${dec(v)}$`,
    ),
  }
}

export const tenPctQ = (): Question => {
  const n = 10 * rand(5, 60)
  const k = rand(2, 9)
  const t = n / 10
  const ans = k * t
  return {
    kind: 'numeric',
    prompt: `${pc(10)} من ${m(n)} تساوي ${m(t)}. استعملي ذلك لإيجاد ${pc(k * 10)} من ${m(n)}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: t, why: `هاد ١٠٪ نفسها! 🔍 ${pc(k * 10)} يعني ${k} مرات ١٠٪، فنضرب بـ${k}.` },
      { value: k * n, why: `ضربتي بالعدد كله! 😅 نضرب ١٠٪ (يعني ${t}) بـ${k} بس.` },
      { value: r2((k * n) / 100), why: 'صغير كتير! حرّكتي الفاصلة زيادة.' },
    ]),
    why: `${pc(k * 10)} = ${k} × ${pc(10)}\n\n$${k} × ${t} = ${ans}$ ✔️`,
  }
}

export const smallPctQ = (): Question => {
  const half = rand(0, 1) === 1
  const p = half ? 0.5 : 0.25
  const n = half ? 200 * rand(3, 30) : 400 * rand(2, 20)
  const ans = half ? n / 200 : n / 400
  const one = n / 100
  return {
    kind: 'numeric',
    prompt: `ما ${pc(p)} من ${m(n)}؟ (تلميح: ${pc(p)} هي ${half ? 'نصف' : 'ربع'} ١٪)`,
    answer: ans,
    wrong: wr(ans, [
      { value: one, why: `هاد ١٪ كاملة! 🔍 ${pc(p)} هي ${half ? 'نصفها' : 'ربعها'} بس.` },
      { value: r2(ans * 10), why: `هاد ${pc(p * 10)}! 😅 حرّكتي الفاصلة منزلة قليلة.` },
      { value: r2(n * p), why: 'نسيتي تقسمي على ١٠٠! 🔄' },
    ]),
    why: `١٪ من $${n}$ = $${dec(one)}$\n\n${half ? 'نصفها' : 'ربعها'}: $${dec(one)} ÷ ${half ? 2 : 4} = ${dec(ans)}$ ✔️`,
  }
}

export const above100EstQ = (): Question => {
  const d = pick([10, 20, 30, 50])
  const p = 100 + d + pick([-2, -1, 1, 2])
  const n = 10 * rand(3, 30)
  const ans = r2(((100 + d) * n) / 100)
  return {
    kind: 'numeric',
    prompt: `قرّبي ${pc(p)} إلى ${pc(100 + d)} ثم احسبي ${pc(100 + d)} من ${m(n)}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: r2((d * n) / 100), why: `هاد الزيادة بس! 🔍 ${pc(100 + d)} = ١٠٠٪ + ${d}٪ فلازم نضيف العدد كله.` },
      { value: n, why: 'هاد ١٠٠٪ بس! النسبة أكبر من ١٠٠٪.' },
      { value: r2(((100 + d) * n) / 10), why: 'قسمتي على ١٠ بدل ١٠٠! 😅' },
    ]),
    why: `${pc(100 + d)} = ١٠٠٪ + ${pc(d)}\n\n$${n} + ${dec((d * n) / 100)} = ${dec(ans)}$ ✔️`,
  }
}

export const estWordQ = (): Question => {
  const { p, f } = friendlyPct()
  const n = 20 * rand(5, 30)
  const ans = r2((f * n) / 100)
  const exact = r2((p * n) / 100)
  const text = pick([
    `سجّل لاعب ${pc(p)} من ${m(n)} رمية أهدافاً. قرّبي ${pc(p)} إلى ${pc(f)} ثم قدّري عدد الأهداف.`,
    `في مزرعة ${m(n)} شجرة، ${pc(p)} منها زيتون. قرّبي ${pc(p)} إلى ${pc(f)} ثم قدّري عدد أشجار الزيتون.`,
  ])
  return {
    kind: 'numeric',
    prompt: text,
    answer: ans,
    wrong: wr(ans, [
      { value: exact, why: `حسبتي بالنسبة الأصلية! 🔍 السؤال طلب نقرّب إلى ${pc(f)} الأول عشان الحساب يصير سهل.` },
      { value: f * n, why: 'نسيتي تقسمي على ١٠٠! 😅' },
    ]),
    why: `${pc(f)} = $${frOf(f)}$\n\n$${n} × ${frOf(f)} = ${dec(ans)}$ ✔️ (والدقيق $${dec(exact)}$، قريب جداً 👌)`,
  }
}

/* ═════════ ٥-٣ استراتيجية: تحديد معقولية الإجابة ═════════ */

export const reasonableYesNoQ = (): Question => {
  const p = pick([10, 20, 25, 50])
  const t = 5 * rand(2, 8)
  const total = (t * 100) / p
  const yes = rand(0, 1) === 1
  const claim = yes ? total : total * pick([2, 3])
  const parts = 100 / p
  const exp = `${pc(p)} = $${fr(1, parts)}$ يعني الشغل كله ${parts} أجزاء متساوية، كل جزء ${t} دقيقة.\n\n$${parts} × ${t} = ${total}$ دقيقة تقريباً.`
  return {
    kind: 'choice',
    prompt: `أنجز عامل ${pc(p)} من طلاء جدار خلال ${m(t)} دقيقة، وقال: «سأنهي الجدار كله بعد ${m(claim)} دقيقة تقريباً». هل كلامه معقول؟`,
    options: [
      { text: 'نعم، معقول', correct: yes, why: yes ? `برافو! 🎉 ${exp} ✔️` : `قريبة! 🔍 ${exp}\n\nيعني ${claim} دقيقة أكبر بكتير من المتوقع.` },
      { text: 'لا، غير معقول', correct: !yes, why: !yes ? `ممتاز! ⭐ ${exp}\n\nوهو قال ${claim}، يعني غير معقول ✔️` : `قريبة! 🔍 ${exp}\n\nيعني كلامه معقول.` },
    ],
  }
}

export const reasonableAmountQ = (): Question => {
  const n = 20 * rand(2, 10)
  const d = pick([10, 20, 25, 50])
  const now = r2((n * (100 - d)) / 100)
  return {
    kind: 'choice',
    prompt: `قميص سعره ${m(n)} ريالاً وعليه خصم ${pc(d)}. أيّ هذه الأسعار هو الجواب المعقول لسعره بعد الخصم؟`,
    options: opts(
      now,
      [
        { v: r2((n * (100 + d)) / 100), why: 'أكبر من السعر الأصلي! 🔍 بعد الخصم لازم السعر **ينقص**.' },
        { v: r2((n * d) / 100), why: 'هاد مقدار الخصم نفسه، مو السعر بعد الخصم! 🔄' },
        { v: r2(n - d), why: 'طرحتي النسبة من السعر مباشرة! 😅 لازم نحسب ' + d + '٪ **من السعر** أول.' },
      ],
      `برافو! 🎉 بعد الخصم السعر أقل من ${n}، و${pc(100 - d)} من ${n} = ${now} ✔️`,
    ),
  }
}

export const savingQ = (): Question => {
  const x = rand(9, 19)
  const r10 = (v: number) => Math.round(v / 10) * 10
  return {
    kind: 'choice',
    prompt: `يوفّر خالد ${m(x)} ريالاً كل شهر. أيّ تقدير معقول لما سيوفّره بعد سنة (١٢ شهراً)؟`,
    options: opts(
      r10(12 * x),
      [
        { v: r10(6 * x), why: 'هاد نصف سنة بس! 🔍 السنة ١٢ شهر.' },
        { v: r10(20 * x), why: 'كبير كتير! 😅 مو معقول لأنه أكتر من ١٢ شهر.' },
        { v: r10(2 * x), why: 'صغير كتير! 🔍 هاد توفير شهرين فقط.' },
      ],
      `برافو! 🎉 $${x} ≈ ${Math.round(x / 5) * 5}$ ... والأهم: ١٢ مرة ${x} ≈ ${r10(12 * x)} ✔️`,
      (v) => `حوالي $${v}$ ريالاً`,
    ),
  }
}

export const percentGuessQ = (): Question => {
  const f = pick([25, 50, 75])
  const p = f + pick([-3, -2, 2, 3])
  const base = 100 * rand(3, 9)
  const n = base + pick([-30, -20, 20, 30])
  const est = (f * base) / 100
  return {
    kind: 'choice',
    prompt: `يمارس ${pc(p)} من ${m(n)} طالباً الرياضة أسبوعياً. أيّ عدد هو أفضل تقدير لعدد الممارسين؟`,
    options: opts(
      est,
      [
        { v: est * 2, why: 'ضعف التقدير! 🔍 يمكن استعملتي نسبة أكبر من المقصود.' },
        { v: Math.round(est / 2), why: 'نصف التقدير! 😅 النسبة أكبر من هيك.' },
        { v: base - est, why: 'هاد عدد اللي ما بيمارسوا الرياضة تقريباً! 🔄' },
      ],
      `برافو! 🎉 ${pc(p)} ≈ ${pc(f)} = $${frOf(f)}$ و$${n} ≈ ${base}$، يعني $${base} × ${frOf(f)} = ${est}$ ✔️`,
      (v) => `حوالي $${v}$ طالباً`,
    ),
  }
}

/* ═════════ ٥-٤ التناسب المئوي ═════════ */

export const findPctQ = (): Question => {
  const p = pick([5, 10, 12.5, 20, 25, 30, 40, 50, 60, 75, 80])
  const whole = 40 * rand(1, 8)
  const part = r2((p * whole) / 100)
  return {
    kind: 'numeric',
    prompt: pick([
      `أجابت سلمى عن ${m(part)} سؤالاً صحيحاً من أصل ${m(whole)} سؤالاً. ما نسبتها المئوية؟ (اكتبي العدد بدون الرمز)`,
      `ما النسبة المئوية للعدد ${m(part)} من ${m(whole)}؟ (اكتبي العدد بدون الرمز)`,
    ]),
    answer: p,
    wrong: wr(p, [
      { value: r2(part / whole), why: 'هاد الكسر العشري! 🔍 لازم نكمل: النسبة = جزء ÷ كل × ١٠٠.' },
      { value: r2((whole * 100) / part), why: 'قلبتي القسمة! 🔄 الجزء على الكل، مو الكل على الجزء.' },
      { value: r2(100 - p), why: 'هاد نسبة الباقي! 😅 السؤال عن الجزء نفسه.' },
    ]),
    why: `$${fr(part, whole)} = ${fr('ن', 100)}$\n\nالضرب التبادلي: $${part * 100} = ${whole} ن$\n\n$ن = ${part * 100} ÷ ${whole} = ${dec(p)}$ ✔️`,
  }
}

export const findPartQ = (): Question => {
  const p = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90])
  const n = 20 * rand(2, 15)
  const ans = r2((p * n) / 100)
  return {
    kind: 'numeric',
    prompt: `ما العدد الذي يساوي ${pc(p)} من ${m(n)}؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: p * n, why: 'نسيتي تقسمي على ١٠٠ بعد الضرب التبادلي! 😅' },
      { value: r2((n * 100) / p), why: `استعملتي تناسب «الكل» بدل «الجزء»! 🔍 هون ${n} هو الكل (بعد كلمة «من»).` },
      { value: r2(n - ans), why: 'هاد الباقي مو الجزء! 🔄' },
    ]),
    why: `$${fr('ج', n)} = ${fr(p, 100)}$\n\nالضرب التبادلي: $100 ج = ${p * n}$\n\n$ج = ${p * n} ÷ 100 = ${dec(ans)}$ ✔️`,
  }
}

export const findWholeQ = (): Question => {
  const p = pick([10, 12.5, 20, 25, 40, 50, 60, 75, 80])
  const whole = 40 * rand(1, 10)
  const part = r2((p * whole) / 100)
  return {
    kind: 'numeric',
    prompt: `ما العدد الذي ${pc(p)} منه تساوي ${m(part)}؟`,
    answer: whole,
    wrong: wr(whole, [
      { value: r2((part * p) / 100), why: `حسبتي ${pc(p)} من ${part}! 🔍 بس ${part} هو **الجزء** مو الكل.` },
      { value: part * 100, why: `نسيتي تقسمي على ${dec(p)}! 😅` },
      { value: part, why: 'هاد الجزء نفسه! لازم نلاقي الكل.' },
    ]),
    why: `$${fr(part, 'ك')} = ${fr(p, 100)}$\n\nالضرب التبادلي: $${part * 100} = ${dec(p)} ك$\n\n$ك = ${part * 100} ÷ ${dec(p)} = ${whole}$ ✔️`,
  }
}

export const findWholeWordQ = (): Question => {
  const p = pick([5, 10, 20, 25, 40, 50])
  const whole = 20 * rand(2, 20)
  const part = r2((p * whole) / 100)
  return {
    kind: 'numeric',
    prompt: pick([
      `يوجد في حقيبة رامي ${m(part)} قلم حبر، وهي تشكّل ${pc(p)} من أقلامه. كم قلماً عنده؟`,
      `لم يشارك ${m(part)} طلاب في الرحلة، وهم ${pc(p)} من طلاب الصف. كم طالباً في الصف؟`,
      `دفعت منى ${m(part)} ريالاً مقدّماً، وهو ${pc(p)} من الثمن. ما الثمن الكلي؟`,
    ]),
    answer: whole,
    wrong: wr(whole, [
      { value: r2((part * p) / 100), why: `ضربتي الجزء بالنسبة! 🔍 ${part} هو **الجزء**، ونبحث عن الكل.` },
      { value: part * 100, why: `نسيتي تقسمي على ${p}! 😅` },
      { value: r2(whole - part), why: 'هاد الباقي بعد ما شلنا الجزء! 🔄' },
    ]),
    why: `$${fr(part, 'ك')} = ${fr(p, 100)}$\n\n$${part * 100} = ${p} ك$\n\n$ك = ${part * 100} ÷ ${p} = ${whole}$ ✔️`,
  }
}

export const setupProportionQ = (): Question => {
  const kind = pick(['pct', 'part', 'whole'] as const)
  const p = pick([15, 20, 25, 30, 40, 60, 75])
  const whole = 20 * rand(2, 15)
  const part = (p * whole) / 100
  const a: number | string = kind === 'part' ? 'ج' : part
  const b: number | string = kind === 'whole' ? 'ك' : whole
  const c: number | string = kind === 'pct' ? 'ن' : p
  const s =
    kind === 'pct' ? `ما النسبة المئوية للعدد ${m(part)} من ${m(whole)}؟`
    : kind === 'part' ? `ما العدد الذي يساوي ${pc(p)} من ${m(whole)}؟`
    : `ما العدد الذي ${pc(p)} منه تساوي ${m(part)}؟`
  const L = kind === 'pct' ? 'ن' : kind === 'part' ? 'ج' : 'ك'
  return {
    kind: 'choice',
    prompt: `${s} أيّ تناسب يصلح لحلّها؟ (${L} ترمز للمجهول)`,
    options: [
      { text: `$${fr(a, b)} = ${fr(c, 100)}$`, correct: true, why: `برافو! 🎉 جزء ÷ كل = نسبة ÷ ١٠٠، والمجهول ${L} ✔️` },
      { text: `$${fr(b, a)} = ${fr(c, 100)}$`, why: 'قلبتي النسبة الأولى! 🔄 الجزء بالبسط والكل بالمقام.' },
      { text: `$${fr(a, c)} = ${fr(b, 100)}$`, why: 'بدّلتي مكان الكل والنسبة! 😅 النسبة لازم تكون فوق ١٠٠.' },
      { text: `$${fr(a, 100)} = ${fr(c, b)}$`, why: 'حطيتي ١٠٠ مكان الكل! 🔍 ١٠٠ بتكون تحت النسبة المئوية بس.' },
    ],
  }
}

export const roundedPctQ = (): Question => {
  const whole = rand(11, 40)
  const part = rand(3, whole - 2)
  const ans = rt(part * 100, whole)
  return {
    kind: 'numeric',
    prompt: `ما النسبة المئوية للعدد ${m(part)} من ${m(whole)}؟ قرّبي لأقرب عُشر (اكتبي العدد بدون الرمز).`,
    answer: ans,
    wrong: wr(ans, [
      { value: Math.round((part * 100) / whole), why: 'قرّبتي لأقرب عدد صحيح! 🔍 السؤال طلب لأقرب **عُشر**: منزلة وحدة بعد الفاصلة.' },
      { value: Math.floor((part * 1000) / whole) / 10, why: 'قطعتي الرقم بدل ما تقرّبي! 😅' },
      { value: rt(whole * 100, part), why: 'قلبتي القسمة! 🔄 الجزء على الكل.' },
    ]),
    why: `$${fr(part, whole)} = ${fr('ن', 100)}$\n\n$${part * 100} = ${whole} ن$ ثم $ن = ${part * 100} ÷ ${whole} ≈ ${dec(ans)}$ ✔️`,
  }
}

/* ═════════ ٥-٥ تطبيقات على النسبة المئوية ═════════ */

const priceSetup = () => {
  const up = rand(0, 1) === 1
  const price = 5 * rand(8, 80)
  const p = pick([10, 20, 25, 30, 40, 50])
  const amt = r2((price * p) / 100)
  return { up, price, p, amt, now: r2(up ? price + amt : price - amt) }
}

export const newPriceQ = (): Question => {
  const { up, price, p, amt, now } = priceSetup()
  const k = up ? 100 + p : 100 - p
  return {
    kind: 'numeric',
    prompt: up
      ? pick([`سعر جهاز ${m(price)} ريالاً، وارتفع سعره بنسبة ${pc(p)}. كم سعره الجديد؟`, `ثمن حقيبة ${m(price)} ريالاً وزاد بنسبة ${pc(p)}. كم صار ثمنها؟`])
      : pick([`فستان سعره ${m(price)} ريالاً عُرض بتخفيض ${pc(p)}. كم سعره بعد التخفيض؟`, `سعر ساعة ${m(price)} ريالاً وعليها خصم ${pc(p)}. كم سعرها الجديد؟`]),
    answer: now,
    wrong: wr(now, [
      { value: amt, why: `هاد مقدار ${up ? 'الزيادة' : 'الخصم'} بس! 🔍 لازم ${up ? 'نجمعه مع' : 'نطرحه من'} السعر الأصلي.` },
      { value: r2(up ? price - amt : price + amt), why: `عكستي العملية! 🔄 ${up ? 'الزيادة بتنضاف' : 'الخصم بينطرح'}.` },
      { value: r2(price * p), why: 'نسيتي تقسمي على ١٠٠! 😅' },
    ]),
    why: `الطريقة ١: ${pc(p)} من $${price}$ = $${dec(amt)}$ ثم $${price} ${up ? '+' : '−'} ${dec(amt)} = ${dec(now)}$\n\nالطريقة ٢: ${pc(k)} = $${dec(k / 100)}$ ثم $${dec(k / 100)} × ${price} = ${dec(now)}$ ✔️`,
  }
}

export const originalQ = (): Question => {
  const up = rand(0, 1) === 1
  const orig = 20 * rand(3, 25)
  const p = pick([10, 20, 25, 30, 40, 50])
  const k = up ? 100 + p : 100 - p
  const now = r2((orig * k) / 100)
  return {
    kind: 'numeric',
    prompt: up
      ? `ارتفع سعر هاتف بنسبة ${pc(p)} فأصبح ${m(now)} ريالاً. كم كان سعره الأصلي؟`
      : `اشترت هدى حقيبة بعد خصم ${pc(p)} بمبلغ ${m(now)} ريالاً. كم كان سعرها الأصلي؟`,
    answer: orig,
    wrong: wr(orig, [
      { value: r2((now * (up ? 100 - p : 100 + p)) / 100), why: `حسبتي ${pc(p)} من السعر **الجديد**! 🔍 لكن ${p}٪ هي من السعر **الأصلي**، فلازم نحل معادلة.` },
      { value: r2(now + p), why: 'جمعتي النسبة على السعر مباشرة! 😅 النسبة مو ريالات.' },
      { value: r2((now * p) / 100), why: 'هاد جزء من السعر الجديد مو السعر الأصلي! 🔄' },
    ]),
    why: `السعر الجديد = ${pc(k)} من الأصلي ك\n\n$${dec(k / 100)} × ك = ${now}$\n\n$ك = ${now} ÷ ${dec(k / 100)} = ${orig}$\n\nتحقق: $${orig} × ${dec(k / 100)} = ${now}$ ✔️`,
  }
}

export const zakatQ = (): Question => {
  const cap = 4000 * rand(2, 25)
  const z = cap / 40
  const v = rand(0, 2)
  if (v === 0) {
    return {
      kind: 'numeric',
      prompt: `رصيد محمد ${m(cap)} ريال، بلغ النصاب وحال عليه الحول. كم تبلغ زكاته (${pc(2.5)} منه)؟`,
      answer: z,
      wrong: wr(z, [
        { value: r2(cap * 0.25), why: 'كتبتي ٢٫٥٪ على صورة ٠٫٢٥! 🔍 الصحيح ٠٫٠٢٥ (منزلتين).' },
        { value: r2(cap * 2.5), why: 'نسيتي تقسمي على ١٠٠! 😅' },
        { value: cap - z, why: 'هاد اللي بيضل بعد الزكاة! 🔄 السؤال عن الزكاة نفسها.' },
      ]),
      why: `${pc(2.5)} = $${dec(0.025)}$\n\n$${dec(0.025)} × ${cap} = ${z}$ ريال ✔️`,
    }
  }
  if (v === 1) {
    return {
      kind: 'numeric',
      prompt: `رصيد ليلى ${m(cap)} ريال، بلغ النصاب وحال عليه الحول. كم يتبقى لديها بعد إخراج الزكاة (${pc(2.5)})؟`,
      answer: cap - z,
      wrong: wr(cap - z, [
        { value: z, why: 'هاد مقدار الزكاة نفسه! 🔍 السؤال عن اللي بيضل.' },
        { value: r2(cap + z), why: 'جمعتي بدل ما تطرحي! 😅 الزكاة بتطلع من المال.' },
        { value: r2(cap - cap * 0.25), why: 'كتبتي ٢٫٥٪ على صورة ٠٫٢٥! الصحيح ٠٫٠٢٥.' },
      ]),
      why: `الزكاة = $${dec(0.025)} × ${cap} = ${z}$\n\nالباقي: $${cap} − ${z} = ${cap - z}$ ريال ✔️\n\n(أو مباشرة: ${pc(97.5)} من المال)`,
    }
  }
  return {
    kind: 'numeric',
    prompt: `دفع خالد زكاة مقدارها ${m(z)} ريال، وهي ${pc(2.5)} من رصيده. كم كان رصيده قبل الزكاة؟`,
    answer: cap,
    wrong: wr(cap, [
      { value: r2(z * 0.025), why: 'ضربتي بدل ما تقسمي! 🔍 الزكاة هي **الجزء** ونبحث عن الكل.' },
      { value: z * 4, why: 'استعملتي ٢٥٪ بدل ٢٫٥٪! 😅' },
      { value: z * 100, why: 'نسيتي تقسمي على ٢٫٥! 🔄' },
    ]),
    why: `$${dec(0.025)} × ك = ${z}$\n\n$ك = ${z} ÷ ${dec(0.025)} = ${cap}$ ريال ✔️`,
  }
}

export const amountQ = (): Question => {
  const { up, price, p, amt, now } = priceSetup()
  return {
    kind: 'numeric',
    prompt: up
      ? `ثمن علبة ${m(price)} ريالاً، وارتفع بنسبة ${pc(p)}. ما مقدار الزيادة بالريال؟`
      : `سعر حذاء ${m(price)} ريالاً وعليه خصم ${pc(p)}. ما مقدار الخصم بالريال؟`,
    answer: amt,
    wrong: wr(amt, [
      { value: now, why: `هاد السعر بعد ${up ? 'الزيادة' : 'الخصم'}! 🔍 السؤال عن المقدار نفسه.` },
      { value: r2(price * p), why: 'نسيتي تقسمي على ١٠٠! 😅' },
    ]),
    why: `${pc(p)} من $${price}$ = $${dec(p / 100)} × ${price} = ${dec(amt)}$ ريال ✔️`,
  }
}

export const multiplierQ = (): Question => {
  const up = rand(0, 1) === 1
  const p = pick([10, 15, 20, 25, 30, 35, 40, 60, 75])
  const k = (up ? 100 + p : 100 - p) / 100
  const other = (up ? 100 - p : 100 + p) / 100
  return {
    kind: 'choice',
    prompt: `سعر سلعة ${up ? 'زاد' : 'نقص'} بنسبة ${pc(p)}. بأيّ عدد نضرب السعر الأصلي لنحصل مباشرة على السعر الجديد؟`,
    options: opts(
      k,
      [
        { v: p / 100, why: `هاد ${pc(p)} نفسها! 🔍 بيعطينا مقدار ${up ? 'الزيادة' : 'الخصم'} بس، مو السعر الجديد.` },
        { v: other, why: `هاد للعملية المعاكسة! 🔄 هون ${up ? 'زيادة (١٠٠٪ + النسبة)' : 'خصم (١٠٠٪ − النسبة)'}.` },
        { v: p / 1000, why: 'حرّكتي الفاصلة منزلة زيادة! 😅' },
      ],
      `برافو! 🎉 ${up ? '١٠٠٪ + ' : '١٠٠٪ − '}${pc(p)} = ${pc(k * 100)} = $${dec(k)}$ ✔️`,
    ),
  }
}