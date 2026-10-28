import type { Question } from '../types'
import type { PoolItem } from '../lib/exam'
import { pick, rand, shuffle } from '../lib/rng'
import { fr } from '../lib/dec'


const LET = ['س', 'ص', 'ن', 'ع', 'ك', 'م']
const wr = (answer: number, list: { value: number; why: string }[]) => {
  const seen = new Set([answer])
  return list.filter((w) => (seen.has(w.value) ? false : (seen.add(w.value), true)))
}
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const r3 = (x: number) => Math.round(x * 1000) / 1000
/** عدد عشري بالفاصلة العربية (الأرقام تتحول في Rich) */
const dec = (x: number) => String(r3(x)).replace('.', '٫')

/* ───────────── ٤-١ النسبة ───────────── */

const SCENES: [string, string, string][] = [
  ['حقيبة سلمى', 'الأقلام الزرقاء', 'الأقلام الحمراء'],
  ['مكتبة المدرسة', 'الكتب العلمية', 'الكتب الأدبية'],
  ['صندوق الفواكه', 'حبات التفاح', 'حبات البرتقال'],
  ['حديقة البيت', 'الورود البيضاء', 'الورود الحمراء'],
]

const ratioSimplifyQ = (): Question => {
  let a: number, b: number
  do {
    a = rand(1, 8); b = rand(1, 8)
  } while (a === b || gcd(a, b) !== 1)
  const k = rand(2, 6), x = a * k, y = b * k
  const [place, A, B] = pick(SCENES)
  return {
    kind: 'choice',
    prompt: `في ${place} $${x}$ من ${A} و$${y}$ من ${B}. ما نسبة ${A} إلى ${B} في أبسط صورة؟`,
    options: [
      { text: `$${a} : ${b}$`, correct: true,
        why: `صح! قسمنا الطرفين على القاسم المشترك الأكبر $${k}$: $${x} : ${y} = ${a} : ${b}$ ✔️` },
      { text: `$${b} : ${a}$`, why: 'قلبتي النسبة! الترتيب مهم: الكمية الأولى بالسؤال بتكون أول رقم.' },
      { text: `$${a} : ${a + b}$`, why: 'هاد **جزء إلى كل**! السؤال بيقارن جزء بجزء، مو بالمجموع.' },
      { text: `$${x} : ${y}$`, why: 'صحيحة، بس مو **بأبسط صورة**! لازم نقسم الطرفين على قاسمهم المشترك الأكبر.' },
    ],
  }
}

const equivRatioQ = (): Question => {
  let a: number, b: number
  do {
    a = rand(2, 9); b = rand(2, 9)
  } while (a === b)
  const k = rand(2, 6), v = pick(LET), d = b * k, ans = a * k
  return {
    kind: 'numeric',
    prompt: `النسبتان $${a} : ${b}$ و$${v} : ${d}$ متكافئتان. ما قيمة $${v}$؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: a + d - b, why: `جمعتي نفس العدد على الحدّين! النسب المتكافئة بنطلع منها **بالضرب**: $${b} × ${k} = ${d}$ فنضرب $${a}$ بـ$${k}$ كمان.` },
      { value: d, why: 'هاد الحد الثاني نفسه! لازم نلاقي الحد الأول.' },
      { value: a * d, why: 'ضربتي الأول بالرقم الكبير! عامل الضرب هو $' + k + '$ بس.' },
    ]),
    why: `نبحث عن العامل اللي بيربط $${b}$ بـ$${d}$: $${b} × ${k} = ${d}$.\n\nنضرب الحد الأول بنفس العامل: $${a} × ${k} = ${ans}$.\n\nتحقق: $${a} : ${b}$ و$${ans} : ${d}$ لهم نفس القيمة ✔️`,
  }
}

/* ───────────── ٤-٢ المعدل ───────────── */

const UR: [string, string][] = [
  ['كيلوجرامات من العنب', 'الكيلوجرام'],
  ['أقلام', 'القلم'],
  ['دفاتر', 'الدفتر'],
  ['علب من العصير', 'العلبة'],
]

const unitRateQ = (): Question => {
  const r = rand(4, 40) / 2, n = rand(2, 9), T = r * n
  const [noun, single] = pick(UR)
  return {
    kind: 'numeric',
    prompt: `اشترى خالد $${n}$ ${noun} بمبلغ $${dec(T)}$ ريالاً. ما ثمن ${single} الواحد بالريال؟`,
    answer: r,
    wrong: wr(r, [
      { value: r3(T * n), why: 'ضربتي! معدل الوحدة بنطلع **بالقسمة**: المبلغ ÷ العدد.' },
      { value: r3(T - n), why: 'هاد طرح! المعدل نسبة بين كميتين، ونطلعه بالقسمة.' },
      { value: r3(n / T), why: 'قلبتي القسمة! نقسم المبلغ على العدد، مو العدد على المبلغ.' },
    ]),
    why: `المعدل: $${dec(T)}$ ريالاً لكل $${n}$.\n\nنبسّط ليصير المقام ١: $${dec(T)} ÷ ${n} = ${dec(r)}$ ريالاً لكل واحدة.`,
  }
}

const bestBuyQ = (): Question => {
  const sizes = shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 3)
  const units = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)
  const best = Math.min(...units)
  return {
    kind: 'choice',
    prompt: `يعرض متجر ثلاث عبوات من العصير. أي العبوات سعر اللتر الواحد فيها **أقل ما يمكن**؟`,
    options: sizes.map((s, i) => {
      const P = s * units[i]
      const ok = units[i] === best
      return {
        text: `عبوة سعتها $${s}$ لترات بسعر $${P}$ ريالاً`,
        correct: ok,
        why: ok
          ? `صح! سعر اللتر $${P} ÷ ${s} = ${units[i]}$ ريالات، وهو الأقل ✔️`
          : `سعر اللتر $${P} ÷ ${s} = ${units[i]}$ ريالات، وهو **أعلى** من الأقل. نقارن سعر الوحدة، مو سعر العبوة كلها.`,
      }
    }),
  }
}

/* ───────────── ٤-٣ الوحدات الإنجليزية ───────────── */

const CONV = [
  { big: 'ياردات', small: 'أقدام', f: 3, max: 20 },
  { big: 'أقدام', small: 'بوصات', f: 12, max: 15 },
  { big: 'أرطال', small: 'أوقية', f: 16, max: 12 },
  { big: 'أطنان', small: 'أرطال', f: 2000, max: 9 },
  { big: 'أميال', small: 'أقدام', f: 5280, max: 4 },
]
const FACTORS = [3, 12, 16, 2000, 5280]

const convertSmallQ = (): Question => {
  const u = pick(CONV), n = rand(2, u.max), ans = n * u.f
  const g = pick(FACTORS.filter((f) => f !== u.f))
  return {
    kind: 'numeric',
    prompt: `حوّلي $${n}$ ${u.big} إلى ${u.small}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: n + u.f, why: 'هاد جمع! نحوّل بالضرب بمعدل الوحدة.' },
      { value: n * g, why: `استعملتي علاقة وحدة ثانية! هون كل واحدة بالوحدة الأكبر = $${u.f}$ من الأصغر.` },
    ]),
    why: `من الأكبر للأصغر نضرب بمعدل الوحدة: كل واحدة = $${u.f}$.\n\n$${n} × ${u.f} = ${ans}$ ${u.small}.`,
  }
}

const convertLargeQ = (): Question => {
  const u = pick(CONV), k = rand(2, Math.min(u.max, 12)), given = k * u.f
  return {
    kind: 'numeric',
    prompt: `حوّلي $${given}$ ${u.small} إلى ${u.big}.`,
    answer: k,
    wrong: wr(k, [
      { value: given * u.f, why: 'ضربتي! للتحويل من وحدة أصغر لأكبر **نقسم**، لأن العدد بيصير أقل.' },
      { value: given - u.f, why: 'هاد طرح! التحويل بين الوحدات بالضرب أو القسمة.' },
    ]),
    why: `الوحدة الأكبر أكبر بـ$${u.f}$ مرة، فنقسم: $${given} ÷ ${u.f} = ${k}$ ${u.big}.`,
  }
}

/* ───────────── ٤-٤ الوحدات المترية ───────────── */

const MET = [
  { big: 'كيلومترات', small: 'أمتار', f: 1000 },
  { big: 'أمتار', small: 'سنتمترات', f: 100 },
  { big: 'أمتار', small: 'ملمترات', f: 1000 },
  { big: 'لترات', small: 'مللترات', f: 1000 },
  { big: 'كيلوجرامات', small: 'جرامات', f: 1000 },
  { big: 'سنتمترات', small: 'ملمترات', f: 10 },
]

const metricSmallQ = (): Question => {
  const u = pick(MET), t = rand(11, 99), n = t / 10, ans = (t * u.f) / 10
  return {
    kind: 'numeric',
    prompt: `حوّلي $${dec(n)}$ ${u.big} إلى ${u.small}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: r3(ans * 10), why: `زدتي صفراً زيادة! الضرب بـ$${u.f}$ يعني نحرّك الفاصلة بعدد أصفار $${u.f}$ بالضبط.` },
      { value: r3(ans / 10), why: `حرّكتي الفاصلة منزلة قليلة! لازم نحرّكها بعدد أصفار $${u.f}$.` },
    ]),
    why: `من الأكبر للأصغر نضرب بقوة العدد ١٠ المناسبة: $${u.f}$.\n\n$${dec(n)} × ${u.f} = ${dec(ans)}$ ${u.small}.`,
  }
}

const metricLargeQ = (): Question => {
  const u = pick(MET), t = rand(11, 99), x = (t * u.f) / 10, ans = t / 10
  return {
    kind: 'numeric',
    prompt: `حوّلي $${x}$ ${u.small} إلى ${u.big}.`,
    answer: ans,
    wrong: wr(ans, [
      { value: r3(ans * 10), why: 'حرّكتي الفاصلة منزلة قليلة! نقسم على الرقم كامل.' },
      { value: r3(ans / 10), why: 'حرّكتي الفاصلة منزلة زيادة! عدّي أصفار العدد بدقة.' },
      { value: x * u.f, why: 'ضربتي! من الأصغر للأكبر **نقسم**.' },
    ]),
    why: `من الأصغر للأكبر نقسم على $${u.f}$.\n\n$${x} ÷ ${u.f} = ${dec(ans)}$ ${u.big}.`,
  }
}

/* ───────────── ٤-٥ حل التناسبات ───────────── */

const solveProportionQ = (): Question => {
  let a: number, b: number
  do {
    a = rand(2, 9); b = rand(2, 9)
  } while (a === b)
  const k = rand(2, 9), v = pick(LET)
  if (rand(0, 1)) {
    const d = b * k, ans = a * k
    return {
      kind: 'numeric',
      prompt: `حلّي التناسب: $${a} : ${b} = ${v} : ${d}$ ثم اكتبي قيمة $${v}$.`,
      answer: ans,
      wrong: wr(ans, [
        { value: a + d - b, why: 'جمعتي بدل ما تضربي! الضرب التبادلي أو عامل الضرب هو الحل.' },
        { value: a * d, why: 'نسيتي تقسمي على $' + b + '$ بعد الضرب التبادلي!' },
      ]),
      why: `الضرب التبادلي: $${a} × ${d} = ${b} × ${v}$ ، يعني $${a * d} = ${b}${v}$.\n\nنقسم على $${b}$: $${v} = ${ans}$.\n\nتحقق: $${a} : ${b}$ و$${ans} : ${d}$ ✔️`,
    }
  }
  const c = a * k, ans = b * k
  return {
    kind: 'numeric',
    prompt: `حلّي التناسب: $${a} : ${b} = ${c} : ${v}$ ثم اكتبي قيمة $${v}$.`,
    answer: ans,
    wrong: wr(ans, [
      { value: b + c - a, why: 'جمعتي بدل ما تضربي! الضرب التبادلي أو عامل الضرب هو الحل.' },
      { value: b * c, why: 'نسيتي تقسمي على $' + a + '$ بعد الضرب التبادلي!' },
    ]),
    why: `الضرب التبادلي: $${a} × ${v} = ${b} × ${c}$ ، يعني $${a}${v} = ${b * c}$.\n\nنقسم على $${a}$: $${v} = ${ans}$.\n\nتحقق: $${a} : ${b}$ و$${c} : ${ans}$ ✔️`,
  }
}

const wordProportionQ = (): Question => {
  const r = rand(2, 9), t1 = rand(2, 6), t2 = t1 + rand(2, 6)
  const d1 = r * t1, d2 = r * t2
  const text = pick([
    `يركض سالم $${d1}$ متراً في $${t1}$ ثوانٍ بسرعة ثابتة. كم ثانية يحتاج ليركض $${d2}$ متراً؟`,
    `تطبع طابعة $${d1}$ صفحة في $${t1}$ دقائق بمعدل ثابت. كم دقيقة تحتاج لتطبع $${d2}$ صفحة؟`,
    `تملأ حنفية $${d1}$ لتراً في $${t1}$ دقائق بمعدل ثابت. كم دقيقة تحتاج لتملأ $${d2}$ لتراً؟`,
  ])
  return {
    kind: 'numeric',
    prompt: text,
    answer: t2,
    wrong: wr(t2, [
      { value: t1 + d2 - d1, why: 'جمعتي الفرق على الزمن! الكميات هون **متناسبة**، فنحلها بالضرب التبادلي.' },
      { value: r * d2, why: 'ضربتي بدل ما تقسمي! الزمن = الكمية ÷ المعدل.' },
    ]),
    why: `نكتب التناسب: $${d1} : ${t1} = ${d2} : ن$.\n\nالضرب التبادلي: $${d1} × ن = ${t1} × ${d2} = ${t1 * d2}$.\n\nنقسم على $${d1}$: $ن = ${t2}$.\n\n(المعدل $${r}$ لكل وحدة زمن، و$${d2} ÷ ${r} = ${t2}$ ✔️)`,
  }
}

/* ───────────── ٤-٦ استراتيجية الرسم ───────────── */

const bounceQ = (): Question => {
  const n = rand(3, 4), m = rand(1, 5), H = m * 2 ** n
  return {
    kind: 'numeric',
    prompt: `سقطت كرة من ارتفاع $${H}$ م، وكانت ترتدّ كل مرة إلى نصف الارتفاع الذي سقطت منه. ارسمي الارتدادات: ما الارتفاع الذي تصله في الارتداد رقم $${n}$؟`,
    answer: m,
    wrong: wr(m, [
      { value: H / 2, why: 'هاد الارتداد الأول بس! كمّلي الرسم لحد الارتداد المطلوب.' },
      { value: 2 * m, why: 'وقفتي قبل ارتداد! عدّي الارتدادات من الرسم.' },
      { value: m / 2, why: 'زدتي ارتداداً زيادة! الارتداد رقم $' + n + '$ هو الأخير.' },
    ]),
    why: `نرسم كل ارتداد ونقسم الارتفاع السابق على ٢:\n\n${Array.from({ length: n }, (_, i) => `الارتداد ${i + 1}: $${H / 2 ** (i + 1)}$ م`).join('\n\n')}\n\nإذن بعد الارتداد $${n}$: $${m}$ م ✔️`,
  }
}

const fractionLeftQ = (): Question => {
  const [p, q] = pick([[2, 3], [3, 5], [2, 5], [3, 4], [4, 5], [1, 3], [3, 8]])
  const u = rand(5, 20), d = p * u
  return {
    kind: 'numeric',
    prompt: `قطع عدنان $${d}$ م، وهي تمثّل $${fr(p, q)}$ الطريق إلى منزل شقيقه. ارسمي الطريق: كم متراً بقي عليه؟`,
    answer: (q - p) * u,
    wrong: wr((q - p) * u, [
      { value: q * u, why: 'هاد طول الطريق كله! السؤال عن المتبقي.' },
      { value: u, why: `هاد جزء واحد بس! المتبقي $${q - p}$ من الأجزاء.` },
      { value: d, why: 'هاد اللي قطعه عدنان! نبحث عن اللي بقي.' },
    ]),
    why: `نقسم الطريق إلى $${q}$ أجزاء متساوية، وكل جزء $${d} ÷ ${p} = ${u}$ م.\n\nالمتبقي $${q} − ${p} = ${q - p}$ من الأجزاء: $${q - p} × ${u} = ${(q - p) * u}$ م.`,
  }
}

/* ───────────── ٤-٧ مقياس الرسم ───────────── */

const mapScaleQ = (): Question => {
  const k = pick([5, 10, 20, 25, 40, 50, 100]), d = rand(4, 32) / 2
  const ans = d * k
  return {
    kind: 'numeric',
    prompt: `على خريطة، مقياس الرسم $1$ سم = $${k}$ كلم. المسافة بين مدينتين على الخريطة $${dec(d)}$ سم. ما المسافة الفعلية بينهما بالكيلومتر؟`,
    answer: ans,
    wrong: wr(ans, [
      { value: d + k, why: 'هاد جمع! نكتب تناسباً: كل ١ سم يمثل $' + k + '$ كلم، فنضرب.' },
      { value: k, why: 'هاد مسافة ١ سم بس! المسافة على الخريطة $' + dec(d) + '$ سم.' },
      { value: r3(k / d), why: 'قلبتي القسمة! نكتب تناسباً بالضرب التبادلي.' },
    ]),
    why: `التناسب: $1 : ${k} = ${dec(d)} : ف$.\n\nالضرب التبادلي: $ف = ${dec(d)} × ${k} = ${dec(ans)}$ كلم.`,
  }
}

const scaleFactorQ = (): Question => {
  const m = rand(2, 9)
  return {
    kind: 'choice',
    prompt: `ما عامل المقياس في نموذج طائرة إذا كان مقياس الرسم $1$ سم = $${m}$ أمتار؟`,
    options: [
      { text: `$1 : ${100 * m}$`, correct: true,
        why: `صح! حوّلنا $${m}$ م إلى $${100 * m}$ سم لتصير الوحدتان متشابهتين، فاختصرتا ✔️` },
      { text: `$1 : ${m}$`, why: 'نسيتي تحوّلي الأمتار لسنتمترات! عامل المقياس بيكون بدون وحدات.' },
      { text: `$${100 * m} : 1$`, why: 'قلبتي النسبة! الرسم بيكون بالبسط والحقيقي بالمقام.' },
      { text: `$1 : ${10 * m}$`, why: 'المتر = ١٠٠ سنتمتر مو ١٠! عدّي الأصفار.' },
    ],
  }
}

/* ───────────── ٤-٨ الكسور والنسب المئوية ───────────── */

const percentToFractionQ = (): Question => {
  const p = pick([12, 15, 16, 24, 25, 35, 36, 40, 45, 60, 64, 75, 80, 85])
  const g = gcd(p, 100), n = p / g, d = 100 / g
  return {
    kind: 'choice',
    prompt: `اكتبي $${p}\u066A$ على صورة كسر اعتيادي في أبسط صورة.`,
    options: [
        { text: `$${fr(n, d)}$`, correct: true,
            why: `صح! $${p}\u066A = ${fr(p, 100)}$ ثم قسمنا البسط والمقام على $${g}$ فصار $${fr(n, d)}$ ✔️🎉` },
        { text: `$${fr(p, 100)}$`, why: 'صحيحة، بس مو **بأبسط صورة**! لازم نقسم البسط والمقام على قاسمهم المشترك الأكبر 💡' },
        { text: `$${fr(d, n)}$`, why: 'قلبتي الكسر! 🔄 النسبة المئوية بتكون جزء من ١٠٠.' },
        { text: `$${fr(n, 100)}$`, why: 'قسمتي البسط بس! 😅 لازم نقسم البسط **والمقام** على نفس العدد.' },
    ],
  }
}

const fractionToPercentQ = (): Question => {
  const den = pick([2, 4, 5, 10, 20, 25, 50]), num = rand(1, den - 1)
  const ans = (num * 100) / den
  return {
    kind: 'numeric',
    prompt: `اكتبي $${fr(num, den)}$ على صورة نسبة مئوية (اكتبي العدد بدون الرمز).`,
    answer: ans,
    wrong: wr(ans, [
      { value: r3(num / den), why: 'هاد الكسر العشري! لازم نضربه بـ١٠٠ لنحصل على النسبة المئوية.' },
      { value: 100 / den, why: 'نسيتي تضربي بالبسط! هاد قيمة جزء واحد بس.' },
      { value: num * den, why: 'ضربتي البسط بالمقام! نريد مقاماً ١٠٠.' },
    ]),
    why: `نضرب البسط والمقام بعدد يخلي المقام ١٠٠: $${den} × ${100 / den} = 100$.\n\nالبسط: $${num} × ${100 / den} = ${ans}$.\n\nإذن $${fr(num, den)} = ${ans}\u066A$ ✔️`,
  }
}

const percentWordQ = (): Question => {
  const T = pick([4, 5, 10, 20, 25, 50]), part = rand(1, T - 1)
  const ans = (part * 100) / T
  return {
    kind: 'numeric',
    prompt: `أجابت مها عن $${part}$ سؤالاً صحيحاً من أصل $${T}$ سؤالاً. ما النسبة المئوية للأسئلة التي أجابت عنها صحيحاً؟ (اكتبي العدد بدون الرمز)`,
    answer: ans,
    wrong: wr(ans, [
      { value: 100 - ans, why: 'هاد نسبة الأسئلة **غير** المجابة! السؤال عن الصحيحة.' },
      { value: r3(part / T), why: 'هاد الكسر العشري! نضربه بـ١٠٠.' },
      { value: part * T, why: 'ضربتي العددين! النسبة بتكون جزء ÷ كل ثم × ١٠٠.' },
    ]),
    why: `الكسر: $${fr(part, T)}$.\n\nنكتبه بمقام ١٠٠: $${fr(part, T)} = ${fr(ans, 100)}$.\n\nإذن النسبة $${ans}\u066A$ ✔️`,
  }
}

export const bank4: PoolItem[] = [
  { lesson: '4-1', gen: ratioSimplifyQ },
  { lesson: '4-1', gen: equivRatioQ },
  { lesson: '4-2', gen: unitRateQ },
  { lesson: '4-2', gen: bestBuyQ },
  { lesson: '4-3', gen: convertSmallQ },
  { lesson: '4-3', gen: convertLargeQ },
  { lesson: '4-4', gen: metricSmallQ },
  { lesson: '4-4', gen: metricLargeQ },
  { lesson: '4-5', gen: solveProportionQ },
  { lesson: '4-5', gen: wordProportionQ },
  { lesson: '4-6', gen: bounceQ },
  { lesson: '4-6', gen: fractionLeftQ },
  { lesson: '4-7', gen: mapScaleQ },
  { lesson: '4-7', gen: scaleFactorQ },
  { lesson: '4-8', gen: percentToFractionQ },
  { lesson: '4-8', gen: fractionToPercentQ },
  { lesson: '4-8', gen: percentWordQ },
]