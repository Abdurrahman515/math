import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { Expr } from '../components/Rich'

export default function Doubling({ onDone }: WidgetProps) {
  const [n, setN] = useState(0)
  const people = 2 ** n

  const next = () => {
    const m = Math.min(n + 1, 6)
    setN(m)
    if (m >= 4) onDone()
  }

  return (
    <div className="card center">
      <h3 className="h3">📱 رسالة بتتضاعف</h3>
      <div className="mut">بعد {n} دقيقة: عدد الناس اللي وصلتلهم الرسالة</div>
      <div className="dots">
        {Array.from({ length: people }, (_, i) => (
          <motion.span
            key={i} className="dot"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: Math.max(0, i - people / 2) * 0.012, type: 'spring' }}
          />
        ))}
      </div>
      <div className="bigline">
        <Expr s={n === 0 ? '1' : `${Array(n).fill(2).join(' × ')} = ${people}`} />
      </div>
      {n > 0 && (
        <div>
          اختصرناها: <Expr s={`2^${n}`} /> = <Expr s={String(people)} />
        </div>
      )}
      {n >= 4 && <div className="fb tip">شفتي؟ الضرب المتكرر صار طويل 😅 لازم نختصره!</div>}
      <div className="row">
        <button className="btn" disabled={n >= 6} onClick={next}>⏱️ دقيقة جديدة</button>
        <button className="link" onClick={() => setN(0)}>↩️ من البداية</button>
      </div>
    </div>
  )
}