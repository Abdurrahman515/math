import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { sg } from '../lib/int'
import { toArabicDigits } from '../lib/arabicDigits'
import { ChipView } from './ChipsAdd'
import type { Chip } from './ChipsAdd'

const ar = (n: number) => toArabicDigits(String(n))
const term = (n: number) => (n < 0 ? `(${sg(n)})` : String(n))

function Task({ a, b, onFinished }: { a: number; b: number; onFinished: () => void }) {
  const need = Math.abs(b)
  const sign: 1 | -1 = b > 0 ? 1 : -1
  const nextId = useRef(Math.abs(a))
  const reported = useRef(false)
  const [chips, setChips] = useState<Chip[]>(() =>
    Array.from({ length: Math.abs(a) }, (_, i) => ({ id: i, s: a > 0 ? 1 : -1, g: 0, gone: false })),
  )
  const [removed, setRemoved] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  const live = chips.filter((c) => !c.gone)
  const avail = live.filter((c) => c.s === sign).length
  const left = need - removed
  const finished = removed >= need
  const short = !finished && avail < left
  const r = a - b

  useEffect(() => {
    if (finished && !reported.current) { reported.current = true; onFinished() }
  }) 

  const tap = (c: Chip) => {
    if (finished || c.gone) return
    if (c.s !== sign) {
      setMsg(`لازم نشيل قطع ${sign > 0 ? '➕' : '➖'} بس، لأنو عم نطرح $${sg(b)}$ 🙂`)
      return
    }
    setChips((cs) => cs.map((x) => (x.id === c.id ? { ...x, gone: true } : x)))
    setRemoved((n) => n + 1)
    setMsg(removed + 1 >= need ? 'خلصنا الشيل! 👏' : null)
  }

  const addPair = () => {
    if (!short) { setMsg('عندك قطع كافية، ما في داعي لأزواج جديدة 😉'); return }
    const i = nextId.current
    nextId.current += 2
    setChips((cs) => [...cs, { id: i, s: 1, g: 0, gone: false }, { id: i + 1, s: -1, g: 0, gone: false }])
    setMsg('أضفنا زوج صفري ➕➖ (قيمته 0)، فما تغيّرت قيمة العدد ✨')
  }

  return (
    <div>
      <div className="bigline"><Rich t={`$${sg(a)} − ${term(b)}$`} /></div>
      {!finished && (
        <div>اشيلي <b>{ar(left)}</b> قطع {sign > 0 ? '➕ موجبة' : '➖ سالبة'} (لأنو بنطرح {sg(b) === String(b) ? 'عدد موجب' : 'عدد سالب'})</div>
      )}

      <div className="cbox" style={{ width: '100%', marginTop: 8 }}>
        <AnimatePresence>
          {live.map((c) => <ChipView key={c.id} c={c} sel={false} onTap={() => tap(c)} />)}
        </AnimatePresence>
        {live.length === 0 && <span className="mut">ما باقي شي ← 0</span>}
      </div>

      {short && <div className="fb no">🤔 ما في قطع {sign > 0 ? '➕' : '➖'} كفاية لنشيلها! أضيفي **أزواج صفرية** لحد ما تكفي.</div>}
      {!finished && (
        <button className={short ? 'btn' : 'btn alt'} style={{ marginTop: 10 }} onClick={addPair}>🪄 أضيفي زوج صفري ➕➖</button>
      )}
      {msg && <div className="fb tip"><Rich t={msg} /></div>}
      {finished && (
        <div className="fb ok">
          ✅ <Rich t={`$${sg(a)} − ${term(b)} = ${sg(r)}$`} />{'\n'}
          لاحظي: نفس <Rich t={`$${sg(a)} + ${term(-b)} = ${sg(r)}$`} /> 😮
        </div>
      )}
    </div>
  )
}

/** props: tasks: [a, b][]  (القيمة المطلقة لكل عدد ≤ ٩) */
export default function ChipsSub({ props, onDone }: WidgetProps) {
  const tasks = (props?.tasks as [number, number][] | undefined) ?? [[5, 2]]
  const [i, setI] = useState(0)
  const [fin, setFin] = useState(false)
  const last = i + 1 >= tasks.length

  return (
    <div className="card center">
      <h3 className="h3">🧹 الطرح بالقطع ({ar(i + 1)}/{ar(tasks.length)})</h3>
      <div className="mut">الطرح معناه <b>الحذف</b>: اضغطي على القطع اللي بدك تشيليها</div>
      <Task key={i} a={tasks[i][0]} b={tasks[i][1]} onFinished={() => { setFin(true); if (last) onDone() }} />
      {fin && !last && (
        <button className="btn" style={{ marginTop: 10 }} onClick={() => { setI(i + 1); setFin(false) }}>التالي ▶️</button>
      )}
    </div>
  )
}