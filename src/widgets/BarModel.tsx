import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { d: number; p: number; q: number; unit: string }
const DEF: P[] = [{ d: 60, p: 2, q: 3, unit: 'م' }]
const clean = (x: number) => Math.round(x * 1e6) / 1e6
const show = (x: number) => toArabicDigits(String(clean(x)).replace('.', '٫'))

export default function BarModel({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [sel, setSel] = useState<number[]>([])
  const p = problems[i]
  const last = i === problems.length - 1
  const done = sel.length === p.p
  const each = p.d / p.p

  const toggle = (k: number) => {
    if (done) return
    setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k])
  }
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setSel([]) }
  }

  return (
    <div className="card">
      <div className="q-prompt">
        قُطع {show(p.d)} {p.unit} وهي تمثّل {toArabicDigits(p.p)} من {toArabicDigits(p.q)} أجزاء متساوية من الطريق 🛣️
        <br />اضغطي على {toArabicDigits(p.p)} أجزاء لتلوّني ما قُطع:
      </div>
      <div style={{ display: 'flex', gap: 4, margin: '12px 0' }}>
        {Array.from({ length: p.q }, (_, k) => (
          <button
            key={k}
            onClick={() => toggle(k)}
            style={{
              flex: 1, height: 44, borderRadius: 8, border: '2px solid #8b5cf6', cursor: 'pointer',
              background: sel.includes(k) ? '#8b5cf6' : 'transparent', color: '#fff',
            }}
          >
            {done && sel.includes(k) ? show(each) : ''}
          </button>
        ))}
      </div>
      {sel.length > p.p && <div className="fb no">كتير! 😅 اختاري {toArabicDigits(p.p)} أجزاء بس.</div>}
      {done && (
        <>
          <div className="fb ok">
            برافو عليكِ! 🎉 كل جزء = {show(p.d)} ÷ {toArabicDigits(p.p)} = <b>{show(each)} {p.unit}</b>
            {'\n'}المتبقي {toArabicDigits(p.q - p.p)} من الأجزاء: {toArabicDigits(p.q - p.p)} × {show(each)} = <b>{show((p.q - p.p) * each)} {p.unit}</b> ✨
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}