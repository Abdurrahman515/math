import type { Lesson } from '../types'
import { fr } from '../lib/dec'
import { findPctQ, findPartQ, findWholeQ, setupProportionQ, roundedPctQ } from './gen-5'

export const lesson54: Lesson = {
  id: '5-4',
  title: 'التناسب المئوي',
  emoji: '⚖️',
  blocks: [
    {
      t: 'say', emoji: '🗝️',
      text: 'كل نسبة مئوية مخبّية وراها **قاعدة وحدة** بس:\n\n$' + fr('الجزء', 'الكل') + ' = ' + fr('النسبة', 100) + '$\n\nمثلاً ٤ من ٥: $' + fr(4, 5) + ' = ' + fr(80, 100) + '$ ← يعني **٨٠٪** ✨\n\nوفي أي نسبة مئوية عندنا ٣ أشياء: **الجزء**، **الكل**، **النسبة**. إذا عرفنا اثنين، منقدر نلاقي التالت بالتناسب! 💪',
    },
    {
      t: 'reveal', title: 'ثلاثة أنواع من الأسئلة 👇',
      items: [
        { emoji: '🔎', title: 'نريد النسبة (ن)', detail: 'مثال: ما النسبة المئوية لـ ٨ ريالات من ١٥ ريالاً؟ الجزء ٨ والكل ١٥.' },
        { emoji: '🧩', title: 'نريد الجزء (ج)', detail: 'مثال: ما العدد الذي يساوي ١٢٪ من ١٢٠؟ الكل ١٢٠ والنسبة ١٢.' },
        { emoji: '🧱', title: 'نريد الكل (ك)', detail: 'مثال: ما العدد الذي ٢٦٪ منه يساوي ١٣؟ الجزء ١٣ والنسبة ٢٦.' },
      ],
    },
    {
      t: 'say', emoji: '💡', tone: 'tip',
      text: 'نصيحة ذهبية 🏆\n\n**الكل** هو العدد اللي **بعد كلمة «من»**.\n\n«١٢٪ **من ١٢٠**» ← الكل = ١٢٠\n\nوإذا قال «٢٦٪ **منه**» ← الضمير «ه» بيشير للكل، يعني الكل هو المجهول.\n\nجرّبي الخطوات مع بعض:',
    },
    {
      t: 'widget', id: 'percentProportion',
      props: {
        problems: [
          { kind: 'pct', part: 7, whole: 12 },
          { kind: 'part', pct: 35, whole: 60 },
          { kind: 'whole', part: 18, pct: 45 },
          { kind: 'pct', part: 9, whole: 40 },
        ],
      },
    },
    { t: 'practice', gen: findPctQ, count: 2, title: 'نريد النسبة 🔎' },
    { t: 'practice', gen: findPartQ, count: 2, title: 'نريد الجزء 🧩' },
    { t: 'practice', gen: findWholeQ, count: 2, title: 'نريد الكل 🧱' },
    {
      t: 'say', emoji: '🎯',
      text: 'ملاحظات مهمة:\n\n🔸 أحياناً القسمة ما بتخلص، فنقرّب لأقرب عُشر. مثال: ٧ من ١٢ = ٥٨٫٣٣٣... ← **٥٨٫٣٪**\n\n🔸 اكتبي رمز **٪** بنهاية الجواب لما نسأل عن النسبة.\n\n🔸 قبل ما تبدئي، **قدّري**: ٧ من ١٢ أكتر من النص بشوي ← حوالي ٦٠٪. معقول! ✅',
    },
    { t: 'practice', gen: setupProportionQ, count: 2, title: 'أيّ تناسب يصلح؟ 🧐' },
    { t: 'practice', gen: roundedPctQ, count: 2, title: 'قرّبي لأقرب عُشر 🎯' },
    {
      t: 'say', emoji: '🏁',
      text: 'الخلاصة:\n\n⚖️ $' + fr('الجزء', 'الكل') + ' = ' + fr('النسبة', 100) + '$\n\n🔍 حدّدي المجهول: نسبة أو جزء أو كل\n\n🧱 الكل = العدد اللي بعد كلمة «من»\n\n✖️ ضرب تبادلي ثم قسمة\n\n🎯 قرّبي لأقرب عُشر عند الحاجة، وتحقّقي من المعقولية',
    },
  ],
}