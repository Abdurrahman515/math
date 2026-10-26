import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WidgetProps } from '../types'

type PropertyExample = { name: string; emoji: string; left: string; right: string; leftValue: number; rightValue: number; note: string }

const examples: PropertyExample[] = [
  { name: 'الإبدال في الجمع', emoji: '🔀', left: '7 + 4', right: '4 + 7', leftValue: 11, rightValue: 11, note: 'بدّلنا ترتيب العددين فقط، فبقي الناتج 11.' },
  { name: 'الإبدال في الضرب', emoji: '✖️', left: '3 × 6', right: '6 × 3', leftValue: 18, rightValue: 18, note: 'تبديل ترتيب العوامل لا يغيّر حاصل الضرب.' },
  { name: 'التجميع', emoji: '🧩', left: '(2 + 5) + 3', right: '2 + (5 + 3)', leftValue: 10, rightValue: 10, note: 'تغيّر مكان الأقواس، لكن الأعداد بقيت بالترتيب نفسه.' },
  { name: 'العنصر المحايد', emoji: '🟰', left: '9 + 0', right: '9 × 1', leftValue: 9, rightValue: 9, note: 'الصفر هو المحايد في الجمع، والواحد هو المحايد في الضرب. كلاهما يترك العدد 9 كما هو.' },
  { name: 'التوزيع', emoji: '🎁', left: '4 × (12 + 8)', right: '4 × 12 + 4 × 8', leftValue: 80, rightValue: 80, note: 'وزّعنا الضرب على العددين داخل القوس: 48 + 32 = 80.' },
]

export default function PropertyExplorer({ onDone }: WidgetProps) {
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState<number[]>([0])
  const [complete, setComplete] = useState(false)
  const current = examples[index]

  const next = () => {
    if (index + 1 >= examples.length) {
      setComplete(true)
      onDone()
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    setSeen((old) => old.includes(nextIndex) ? old : [...old, nextIndex])
  }

  const restart = () => {
    setIndex(0)
    setSeen([0])
    setComplete(false)
  }

  return (
    <div className="card center">
      <h3 className="h3">🪄 مختبر الخصائص</h3>
      <div className="mut">اختاري مثالاً، وشوفي كيف تتغيّر الكتابة ويبقى الناتج نفسه.</div>
      <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        {examples.map((item, i) => (
          <button key={item.name} className={i === index ? 'btn' : 'btn alt'} onClick={() => { setIndex(i); setSeen((old) => old.includes(i) ? old : [...old, i]) }}>
            {item.emoji} {item.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!complete && (
          <motion.div key={index} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -9 }} style={{ width: '100%', marginTop: 18 }}>
            <div className="h3">{current.emoji} {current.name}</div>
            <div className="mut">الطريقة الأولى</div>
            <div className="expr" dir="ltr">{current.left} = {current.leftValue}</div>
            <div className="mut">الطريقة الثانية</div>
            <div className="expr" dir="ltr">{current.right} = {current.rightValue}</div>
            <motion.div className="fb ok" key={`${index}-result`} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              ✅ الناتجان متساويان: {current.leftValue}
            </motion.div>
            <div className="say info" style={{ marginTop: 10 }}>{current.note}</div>
            <div className="mut" style={{ marginTop: 8 }}>شاهدتِ {seen.length} من {examples.length} أمثلة.</div>
            <button className="btn" style={{ marginTop: 10 }} onClick={next}>{index + 1 === examples.length ? 'أنهي المختبر 🎉' : 'الخاصية التالية ▶️'}</button>
          </motion.div>
        )}
      </AnimatePresence>

      {complete && (
        <div className="fb ok" style={{ marginTop: 16 }}>
          🎉 ممتاز! استعرضتِ الخصائص الخمس وأصبح بإمكانك التمييز بين الإبدال والتجميع والعنصر المحايد والتوزيع.
          <div><button className="link" onClick={restart}>إعادة المختبر ↩️</button></div>
        </div>
      )}
    </div>
  )
}
