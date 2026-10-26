import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { allowed, apply, show, tokenize, whyWrong } from '../lib/calc'
import type { Tok } from '../lib/calc'
import { Expr } from '../components/Rich'

export default function Solver({ props, onDone }: WidgetProps) {
  const exprs = (props?.exprs as string[] | undefined) ?? ['1 + 1']
  const [idx, setIdx] = useState(0)
  const [steps, setSteps] = useState<Tok[][]>(() => [tokenize(exprs[0])])
  const [msg, setMsg] = useState<string | null>(null)
  const [shake, setShake] = useState(0)
  const [all, setAll] = useState(false)

  const cur = steps[steps.length - 1]
  const fin = cur.length === 1
  const ok = allowed(cur)
  const isPowExp = (i: number) => {
    const p = cur[i - 1]
    return p?.k === 'o' && p.v === '^'
  }

  const tap = (i: number) => {
    if (fin) return
    if (ok.includes(i)) {
      setSteps((s) => [...s, apply(cur, i)])
      setMsg(null)
    } else {
      setMsg(whyWrong(cur, i))
      setShake((s) => s + 1)
    }
  }

  const next = () => {
    if (idx + 1 >= exprs.length) { setAll(true); onDone(); return }
    setIdx(idx + 1)
    setSteps([tokenize(exprs[idx + 1])])
    setMsg(null)
  }

  const result = cur[0].k === 'n' ? cur[0].v : ''

  return (
    <div className="card center">
      <h3 className="h3">🎮 دوّري واحسبي ({idx + 1}/{exprs.length})</h3>
      <div className="mut">اضغطي على العملية اللي لازم تنحسب <b>أولاً</b></div>

      {steps.slice(0, -1).map((s, k) => (
        <div key={k} className="hist"><Expr s={(k > 0 ? '= ' : '') + show(s)} /></div>
      ))}

      <motion.div key={shake} className="expr" dir="ltr" animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}>
        {cur.map((t, i) => {
          const key = `${steps.length}-${i}`
          if (t.k === 'o') {
            const exp = cur[i + 1]
            return (
              <motion.button
                key={key} className={'tok op' + (t.v === '^' ? ' pow' : '')} whileTap={{ scale: 0.9 }}
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={() => tap(i)}
              >
                {t.v === '^' ? <sup>{exp?.k === 'n' ? exp.v : ''}</sup> : t.v}
              </motion.button>
            )
          }
          if (t.k === 'n' && isPowExp(i)) return null
          return (
            <motion.span
              key={key} className={'tok ' + (t.k === 'n' ? 'num' : 'par')}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              {t.k === 'n' ? t.v : t.k}
            </motion.span>
          )
        })}
      </motion.div>

      {msg && <div className="fb no">🤔 {msg}</div>}
      {fin && (
        <>
          <div className="fb ok">✅ الناتج = <b>{result}</b></div>
          {!all && <button className="btn" onClick={next}>{idx + 1 >= exprs.length ? 'خلصنا 🎉' : 'التالي ▶️'}</button>}
        </>
      )}
      {all && <div className="fb tip">🎉 خلصتي كل التمارين!</div>}
    </div>
  )
}