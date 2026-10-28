import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number) => toArabicDigits(String(n))

export type Chip = { id: number; s: 1 | -1; g: 0 | 1; gone: boolean }

function build(a: number, b: number): Chip[] {
  let id = 0
  const out: Chip[] = []
  ;[a, b].forEach((v, g) => {
    for (let k = 0; k < Math.abs(v); k++) out.push({ id: id++, s: v > 0 ? 1 : -1, g: g as 0 | 1, gone: false })
  })
  return out
}

const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))

export function ChipView({ c, sel, onTap }: { c: Chip; sel: boolean; onTap?: () => void }) {
  return (
    <motion.button
      layout
      className={'chip-c ' + (c.s > 0 ? 'p' : 'n') + (sel ? ' sel' : '')}
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, rotate: 90, opacity: 0 }}
      whileTap={onTap ? { scale: 0.9 } : undefined}
      onClick={onTap}
      aria-label={c.s > 0 ? 'قطعة موجبة' : 'قطعة سالبة'}
    >
      {c.s > 0 ? '+' : '−'}
    </motion.button>
  )
}

function Task({ a, b, onFinished }: { a: number; b: number; onFinished: () => void }) {
  const [chips, setChips] = useState(() => build(a, b))
  const [merged, setMerged] = useState(false)
  const [sel, setSel] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const reported = useRef(false)

  const live = chips.filter((c) => !c.gone)
  const pos = live.filter((c) => c.s === 1).length
  const neg = live.length - pos
  const finished = merged && (pos === 0 || neg === 0)
  const r = a + b

  useEffect(() => {
    if (finished && !reported.current) { reported.current = true; onFinished() }
  })

  const merge = () => {
    setMerged(true)
    setMsg(a * b >= 0 ? 'كلهم من نفس النوع، ما في أزواج صفرية ← منعدّهم كلهم 👇' : 'هلأ شطبي الأزواج الصفرية: اضغطي على ➕ وبعدين على ➖')
  }

  const tap = (c: Chip) => {
    if (!merged || c.gone) return
    if (sel === null) { setSel(c.id); setMsg(null); return }
    if (sel === c.id) { setSel(null); return }
    const first = chips.find((x) => x.id === sel)!
    if (first.s !== c.s) {
      setChips((cs) => cs.map((x) => (x.id === first.id || x.id === c.id ? { ...x, gone: true } : x)))
      setSel(null)
      setMsg('زوج صفري! ➕ و ➖ بيلغوا بعض (مجموعهم 0) ✨')
    } else {
      setSel(c.id)
      setMsg('هدول من نفس النوع وما بيلغوا بعض. اختاري ➕ مع ➖ 🙂')
    }
  }

  const expr = `${sg(a)} + ${term(b)}`

  return (
    <div>
      <div className="bigline"><Rich t={`$${expr}$`} /></div>

      {!merged ? (
        <>
          <div className="groups">
            {[0, 1].map((g) => (
              <div key={g} className="cbox">
                {chips.filter((c) => c.g === g).map((c) => <ChipView key={c.id} c={c} sel={false} />)}
                {(g === 0 ? a : b) === 0 && <span className="mut">لا شي</span>}
              </div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={merge}>ضمّي القطع مع بعض ➕</button>
        </>
      ) : (
        <div className="cbox" style={{ width: '100%' }}>
          <AnimatePresence>
            {chips.filter((c) => !c.gone).map((c) => (
              <ChipView key={c.id} c={c} sel={sel === c.id} onTap={() => tap(c)} />
            ))}
          </AnimatePresence>
          {live.length === 0 && <span className="mut">ما باقي شي ← 0</span>}
        </div>
      )}

      {msg && <div className="fb tip">{msg}</div>}
      {finished && (
        <div className="fb ok">
          ✅ <Rich t={`$${expr} = ${sg(r)}$`} />{'\n'}
          {r === 0 ? 'كلهم لغوا بعض، فالناتج صفر.' : `باقي ${ar(Math.abs(r))} قطعة ${r > 0 ? 'موجبة ➕' : 'سالبة ➖'}.`}
        </div>
      )}
    </div>
  )
}

/** props: tasks: [a, b][]  (القيمة المطلقة لكل عدد ≤ ٩) */
export default function ChipsAdd({ props, onDone }: WidgetProps) {
  const tasks = (props?.tasks as [number, number][] | undefined) ?? [[-3, 2]]
  const [i, setI] = useState(0)
  const [fin, setFin] = useState(false)
  const last = i + 1 >= tasks.length

  return (
    <div className="card center">
      <h3 className="h3">🟡🔴 قطع العد ({ar(i + 1)}/{ar(tasks.length)})</h3>
      <div className="mut">➕ تمثّل ١ ، ➖ تمثّل −١</div>
      <Task
        key={i} a={tasks[i][0]} b={tasks[i][1]}
        onFinished={() => { setFin(true); if (last) onDone() }}
      />
      {fin && !last && (
        <button className="btn" style={{ marginTop: 10 }} onClick={() => { setI(i + 1); setFin(false) }}>التالي ▶️</button>
      )}
    </div>
  )
}