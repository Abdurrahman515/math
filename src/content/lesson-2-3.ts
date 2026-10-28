import type { Lesson, Question } from '../types'
import { rand } from '../lib/rng'
import { sg } from '../lib/int'

const QN = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع']
const QS: [number, number][] = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
const nz = () => rand(1, 9) * (rand(0, 1) ? 1 : -1)
const pair = (x: number, y: number) => `$(${sg(x)}، ${sg(y)})$`

const signTxt = (sx: number, sy: number) =>
  `س ${sx > 0 ? 'موجب (يمين)' : 'سالب (يسار)'} وص ${sy > 0 ? 'موجب (فوق)' : 'سالب (تحت)'}`

const quadQ = (): Question => {
  const x = nz(), y = nz()
  const right = QS.findIndex(([sx, sy]) => sx === Math.sign(x) && sy === Math.sign(y))
  return {
    kind: 'choice',
    prompt: `في أي ربع تقع النقطة ${pair(x, y)} ؟`,
    options: QN.map((n, k) => ({
      text: n,
      correct: k === right,
      why: k === right
        ? `صح! ${signTxt(QS[k][0], QS[k][1])} ← ${n}.`
        : `${n} للنقاط اللي ${signTxt(QS[k][0], QS[k][1])}، بس نقطتك ${signTxt(Math.sign(x), Math.sign(y))}.`,
    })),
  }
}

const moveQ = (): Question => {
  const a = rand(1, 8), b = rand(1, 8)
  const hs = rand(0, 1) ? 1 : -1, vs = rand(0, 1) ? 1 : -1
  const x = hs * a, y = vs * b
  const raw = [
    { p: [x, y], good: true, why: 'صح! الأول أفقي (س) والتاني عمودي (ص)، مع إشارة الاتجاه.' },
    { p: [y, x], good: false, why: 'قلبتي الترتيب! 🔄 الأول دايماً للحركة الأفقية (س).' },
    { p: [-x, y], good: false, why: 'الإشارة غلط بالأول: يمين = موجب ويسار = سالب.' },
    { p: [x, -y], good: false, why: 'الإشارة غلط بالتاني: فوق = موجب وتحت = سالب.' },
  ]
  const seen = new Set<string>()
  return {
    kind: 'choice',
    prompt: `بلّشنا من نقطة الأصل وتحرّكنا ${a} وحدات ${hs > 0 ? 'لليمين' : 'لليسار'}، ثم ${b} وحدات ${vs > 0 ? 'لفوق' : 'لتحت'}. شو الزوج المرتب للنقطة؟`,
    options: raw
      .filter((o) => (seen.has(o.p.join()) ? false : (seen.add(o.p.join()), true)))
      .map((o) => ({ text: pair(o.p[0], o.p[1]), correct: o.good, why: o.why })),
  }
}

const axisQ = (): Question => {
  const onX = rand(0, 1) === 1
  const v = nz()
  const [x, y] = onX ? [v, 0] : [0, v]
  const names = ['على محور السينات', 'على محور الصادات', 'عند نقطة الأصل', 'داخل أحد الأرباع']
  const right = onX ? 0 : 1
  const why = [
    'لما **ص = 0** النقطة بتكون على محور السينات (الأفقي).',
    'لما **س = 0** النقطة بتكون على محور الصادات (العمودي).',
    'نقطة الأصل هي بس $(0، 0)$ وهون واحد منهم مو صفر.',
    'النقاط اللي على المحاور ما بتنتمي لأي ربع، لأنو أحد إحداثياتها صفر.',
  ]
  return {
    kind: 'choice',
    prompt: `أين تقع النقطة ${pair(x, y)} ؟`,
    options: names.map((n, k) => ({ text: n, correct: k === right, why: k === right ? `صح! ${why[k]}` : why[k] })),
  }
}

export const lesson23: Lesson = {
  id: '2-3',
  title: 'المستوى الإحداثي',
  emoji: '🗺️',
  blocks: [
    {
      t: 'say', emoji: '📍',
      text: 'جهاز الـ GPS بيعرف مكانك بالضبط كيف؟ 🤔\n\nعن طريق **شبكة** من الخطوط: بيقلّك "امشي كذا لليمين وكذا لفوق".\n\nبالرياضيات منستعمل نفس الفكرة، واسمها **المستوى الإحداثي**.',
    },
    {
      t: 'say', emoji: '✚',
      text: 'المستوى الإحداثي هو خطّين أعداد **متعامدين** (واحد أفقي وواحد عمودي) بيتقاطعوا عند الصفر، وبيقسموا المستوى لأربع مناطق اسمها **أرباع**.\n\nجرّبي! اضغطي على نقاط مختلفة 👇',
    },
    { t: 'widget', id: 'planeExplorer' },
    {
      t: 'reveal', title: '🧭 مفاتيح المستوى',
      items: [
        { emoji: '↔️', title: 'المحوران', detail: '**محور السينات (س)**: الخط الأفقي.\n\n**محور الصادات (ص)**: الخط العمودي.\n\nوبيتقاطعوا عند **نقطة الأصل** $(0، 0)$.' },
        { emoji: '🧩', title: 'الزوج المرتب', detail: 'كل نقطة إلها زوج أعداد $(س، ص)$.\n\n**الأول** (الإحداثي السيني): كم نتحرك أفقياً.\n\n**التاني** (الإحداثي الصادي): كم نتحرك عمودياً.\n\n⚠️ الترتيب مهم! $(3، 2)$ غير $(2، 3)$' },
        { emoji: '🍰', title: 'الأرباع الأربعة', detail: '**الأول**: $(+، +)$ فوق يمين\n\n**الثاني**: $(−، +)$ فوق يسار\n\n**الثالث**: $(−، −)$ تحت يسار\n\n**الرابع**: $(+، −)$ تحت يمين' },
        { emoji: '⚓', title: 'على المحاور', detail: 'إذا كان أحد الإحداثيين **صفر** فالنقطة على أحد المحورين، وما بتتبع لأي ربع.\n\n$(4، 0)$ على محور السينات، و $(0، −3)$ على محور الصادات.' },
      ],
    },
    {
      t: 'say', tone: 'tip', emoji: '🚪',
      text: 'حيلة للحفظ: **أول شي ادخلي من الباب** 🚪 (أفقي: س)، **وبعدين اطلعي الدرج** 🪜 (عمودي: ص).\n\nيعني دايماً: يمين/يسار أول، وبعدين فوق/تحت.',
    },
    { t: 'say', emoji: '🔎', text: 'هلأ نقرأ النقاط! شوفي كل نقطة واختاري زوجها المرتب 👇' },
    {
      t: 'widget', id: 'planeRead',
      props: { tasks: [{ x: -4, y: 2, label: 'د' }, { x: 3, y: -2, label: 'هـ' }, { x: 5, y: 3, label: 'و' }] },
    },
    { t: 'say', emoji: '🎯', text: 'والعكس: أعطيناكي زوج مرتب، وعيّني النقطة بنفسك 👇' },
    { t: 'widget', id: 'planePlot', props: { targets: [[2, 3], [-3, 4], [-4, -2], [5, -1], [0, -3]] } },
    { t: 'practice', gen: quadQ, count: 3, title: 'أي ربع؟' },
    { t: 'practice', gen: moveQ, count: 3, title: 'تحرّكي واكتبي الزوج' },
    { t: 'practice', gen: axisQ, count: 2, title: 'على المحاور' },
    {
      t: 'say', emoji: '🏁',
      text: 'خلصنا المستوى الإحداثي! تذكري:\n\n🚪 **أفقي أول (س)**، 🪜 **وعمودي تاني (ص)**\n\n🍰 الأرباع: $(+،+)$ ثم $(−،+)$ ثم $(−،−)$ ثم $(+،−)$\n\n⚓ إذا في صفر، النقطة على محور.',
    },
  ],
}