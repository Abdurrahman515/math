import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'

type Attempt = { small: number; large: number; amount: number }

function numberProp(props: Record<string, unknown> | undefined, key: string, fallback: number) {
  const value = props?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export default function GuessCheck({ props, onDone }: WidgetProps) {
  const totalCars = Math.max(2, Math.floor(numberProp(props, 'totalCars', 10)))
  const smallPrice = numberProp(props, 'smallPrice', 10)
  const largePrice = numberProp(props, 'largePrice', 20)
  const target = numberProp(props, 'target', 140)

  const [small, setSmall] = useState(Math.floor(totalCars / 2))
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [feedback, setFeedback] = useState<Attempt | null>(null)
  const [doneSent, setDoneSent] = useState(false)

  const large = totalCars - small
  const amount = small * smallPrice + large * largePrice
  const solved = feedback?.amount === target

  const changeGuess = (next: number) => {
    setSmall(Math.max(0, Math.min(totalCars, next)))
    setFeedback(null)
  }

  const checkGuess = () => {
    const current = { small, large, amount }
    setAttempts((old) => [...old, current])
    setFeedback(current)
    if (current.amount === target && !doneSent) {
      setDoneSent(true)
      onDone()
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🧪 مختبر التخمين والتحقّق</h3>
      <p className="mut">غيّري عدد السيارات الصغيرة، وستكون بقية السيارات كبيرة. لازم يبقى المجموع {totalCars} سيارات.</p>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, margin: '16px 0', fontSize: '1.65rem' }} aria-label="عدد السيارات حسب النوع">
        {Array.from({ length: totalCars }, (_, i) => (
          <motion.span
            key={`${i}-${i < small ? 'small' : 'large'}`}
            initial={{ scale: 0.75, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            title={i < small ? 'سيارة صغيرة' : 'سيارة كبيرة'}
          >
            {i < small ? '🚗' : '🚙'}
          </motion.span>
        ))}
      </div>

      <div className="row">
        <div className="stepper">
          <button className="iconbtn" onClick={() => changeGuess(small - 1)} disabled={small <= 0} aria-label="تقليل السيارات الصغيرة">−</button>
          <span>🚗 صغيرة: <b>{small}</b></span>
          <button className="iconbtn" onClick={() => changeGuess(small + 1)} disabled={small >= totalCars} aria-label="زيادة السيارات الصغيرة">+</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, background: '#f7f7ff', boxShadow: 'none' }}>
        <div>🚗 {small} صغيرة × {smallPrice} = <b>{small * smallPrice}</b> ريال</div>
        <div>🚙 {large} كبيرة × {largePrice} = <b>{large * largePrice}</b> ريال</div>
        <div style={{ marginTop: 8, fontSize: '1.25rem' }}>المجموع: <b>{amount}</b> ريال</div>
        <div className="mut">المطلوب الوصول إليه: {target} ريال</div>
      </div>

      <div className="row">
        <button className="btn" onClick={checkGuess}>اختبري تخميني 🔎</button>
      </div>

      {feedback && (
        <motion.div key={`${feedback.small}-${feedback.large}-${attempts.length}`} className={`fb ${solved ? 'ok' : 'no'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {solved ? (
            <>🎉 ممتاز! المبلغ يساوي {target} ريالاً، وعدد السيارات {feedback.small + feedback.large} تماماً. تخمينك صحيح!</>
          ) : feedback.amount > target ? (
            <>المبلغ أعلى من المطلوب بـ {feedback.amount - target} ريالاً. جرّبي استبدال سيارة كبيرة بسيارة صغيرة؛ سيقل المبلغ بمقدار {largePrice - smallPrice} ريالاً.</>
          ) : (
            <>المبلغ أقل من المطلوب بـ {target - feedback.amount} ريالاً. جرّبي استبدال سيارة صغيرة بسيارة كبيرة؛ سيزيد المبلغ بمقدار {largePrice - smallPrice} ريالاً.</>
          )}
        </motion.div>
      )}

      {attempts.length > 0 && (
        <div style={{ marginTop: 14, textAlign: 'start' }}>
          <b>🗒️ سجل المحاولات</b>
          {attempts.map((a, i) => (
            <div key={`${i}-${a.small}-${a.large}`} className="hist" style={{ padding: '5px 0' }}>
              {i + 1}. {a.small} صغيرة + {a.large} كبيرة = {a.amount} ريال {a.amount === target ? '✅' : a.amount > target ? '⬆️ أعلى من المطلوب' : '⬇️ أقل من المطلوب'}
            </div>
          ))}
        </div>
      )}

      {solved && (
        <button className="link" onClick={() => { setSmall(Math.floor(totalCars / 2)); setAttempts([]); setFeedback(null); setDoneSent(false) }}>
          ↩️ أعيدي التجربة
        </button>
      )}
    </div>
  )
}
