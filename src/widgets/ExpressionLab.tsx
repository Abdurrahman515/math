import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

function numberProp(props: Record<string, unknown> | undefined, key: string, fallback: number) {
  const value = props?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function textProp(props: Record<string, unknown> | undefined, key: string, fallback: string) {
  const value = props?.[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export default function ExpressionLab({ props, onDone }: WidgetProps) {
  const coefficient = numberProp(props, 'coefficient', 2)
  const constant = numberProp(props, 'constant', 1)
  const min = Math.floor(numberProp(props, 'min', 1))
  const max = Math.max(min, Math.floor(numberProp(props, 'max', 10)))
  const variable = textProp(props, 'variable', 'ن')
  const inputLabel = textProp(props, 'inputLabel', 'رقم الشكل')
  const outputLabel = textProp(props, 'outputLabel', 'عدد المربعات')

  const [n, setN] = useState(min)
  const [changes, setChanges] = useState(0)
  const result = coefficient * n + constant

  const change = (next: number) => {
    setN(Math.max(min, Math.min(max, next)))
    const count = changes + 1
    setChanges(count)
    if (count >= 3) onDone()
  }

  return (
    <div className="card center">
      <h3 className="h3">🧩 مختبر المتغيّر: غيّري القيمة وشوفي!</h3>
      <p className="mut">{inputLabel} هو العدد الذي نختاره، والعبارة تخبرنا بالناتج.</p>

      <div className="power" dir="ltr" style={{ fontSize: '3.2rem', alignItems: 'center', gap: 8 }}>
        <span>{toArabicDigits(coefficient)}{variable}</span>
        <span>+</span>
        <span>{toArabicDigits(constant)}</span>
      </div>
      <div className="mut">
        العبارة الجبرية: {toArabicDigits(coefficient)}{variable} + {toArabicDigits(constant)}
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        <div className="stepper">
          <button className="iconbtn" onClick={() => change(n - 1)} disabled={n <= min} aria-label="إنقاص قيمة المتغير">−</button>
          <span>{inputLabel}: <b>{toArabicDigits(n)}</b></span>
          <button className="iconbtn" onClick={() => change(n + 1)} disabled={n >= max} aria-label="زيادة قيمة المتغير">+</button>
        </div>
      </div>

      <motion.div key={n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="fb tip" style={{ marginTop: 14 }}>
        نعوّض عن {variable} بـ {toArabicDigits(n)}:
        <b>
          {toArabicDigits(coefficient)} × {toArabicDigits(n)} + {toArabicDigits(constant)} = {toArabicDigits(coefficient * n)} + {toArabicDigits(constant)} = {toArabicDigits(result)}
        </b>
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, margin: '16px 0' }} aria-label={`${outputLabel}: ${result}`}>
        {Array.from({ length: Math.min(result, 30) }, (_, i) => (
          <motion.span
            key={`${n}-${i}`}
            className="chip"
            style={{ display: 'inline-grid', placeItems: 'center', borderRadius: 7, minWidth: 24, minHeight: 24, padding: 0 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.min(i * 0.012, 0.18), type: 'spring', stiffness: 300 }}
          >
            ■
          </motion.span>
        ))}
      </div>
      <div className="bigline">
        {outputLabel}: <b>{toArabicDigits(result)}</b>
      </div>
      {result > 30 && 
        <div className="mut">
          نعرض أول {toArabicDigits(30)} مربعاً فقط حتى تبقى الشاشة مرتبة.
        </div>
      }
      <div className="mut">غيّري القيمة أكثر من مرة ولاحظي كيف يتغيّر الناتج، بينما تبقى القاعدة نفسها.</div>
    </div>
  )
}
