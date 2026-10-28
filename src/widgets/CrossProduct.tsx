import { useState } from 'react'
import type { WidgetProps } from '../types'
import { Frac } from '../components/Rich'
import { toArabicDigits } from '../lib/arabicDigits'

type P = { a: number; b: number; c: number; d: number; label?: string }
const DEF: P[] = [{ a: 4, b: 64, c: 5, d: 76, label: 'دورات وثواني' }]

export default function CrossProduct({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  const [res, setRes] = useState<'ok' | 'no' | null>(null)
  const p = problems[i]
  const same = p.a * p.d === p.b * p.c
  const last = i === problems.length - 1

  const answer = (yes: boolean) => setRes(yes === same ? 'ok' : 'no')
  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setShown(false); setRes(null) }
  }

  return (
    <div className="card">
      <div className="q-prompt">هل النسبتان تشكّلان تناسباً؟ 🤔 {p.label ? `(${p.label})` : ''}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '12px 0', fontSize: 22 }}>
        <Frac n={String(p.a)} d={String(p.b)} />
        <span>؟ =</span>
        <Frac n={String(p.c)} d={String(p.d)} />
      </div>
      {!shown ? (
        <button className="btn" onClick={() => setShown(true)}>احسبي الضرب التبادلي ✖️</button>
      ) : (
        <>
          <div className="fb tip">
            {toArabicDigits(p.a)} × {toArabicDigits(p.d)} = <b>{toArabicDigits(p.a * p.d)}</b>
            {'\n'}
            {toArabicDigits(p.b)} × {toArabicDigits(p.c)} = <b>{toArabicDigits(p.b * p.c)}</b>
          </div>
          {res !== 'ok' && (
            <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
              <button className="btn" onClick={() => answer(true)}>متناسبتان ✅</button>
              <button className="btn" onClick={() => answer(false)}>غير متناسبتين ❌</button>
            </div>
          )}
          {res === 'no' && <div className="fb no">قريبة! 💪 قارني الناتجين مرة تانية: هل هنّي متساويين؟ 🔍</div>}
          {res === 'ok' && (
            <>
              <div className="fb ok">
                برافو عليكِ! 🎉 الناتجان {same ? 'متساويان، فهي تناسب ✔️' : 'مختلفان، فهي ليست تناسباً ✔️'}
              </div>
              <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
            </>
          )}
        </>
      )}
    </div>
  )
}