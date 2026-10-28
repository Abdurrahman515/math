import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from '../types'
import { Rich } from '../components/Rich'
import { shuffle } from '../lib/rng'
import { toArabicDigits } from '../lib/arabicDigits'

type Bin = { id: string; label: string }
type Item = { text: string; bin: string; why: string }
const ar = (n: number) => toArabicDigits(String(n))

/** props: { title?, bins: {id,label}[], items: {text, bin, why}[] } */
export default function Sorter({ props, onDone }: WidgetProps) {
  const title = (props?.title as string | undefined) ?? 'صنّفي'
  const bins = props?.bins as Bin[]
  const items = useMemo(() => shuffle(props?.items as Item[]), [props])
  const [i, setI] = useState(0)
  const [placed, setPlaced] = useState<Record<string, string[]>>({})
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [shake, setShake] = useState(0)
  const done = i >= items.length
  const cur = items[i]

  const pick = (b: string) => {
    if (done) return
    if (b === cur.bin) {
      setPlaced((p) => ({ ...p, [b]: [...(p[b] ?? []), cur.text] }))
      setMsg({ ok: true, t: cur.why })
      const n = i + 1
      setI(n)
      if (n >= items.length) onDone()
    } else {
      setShake((s) => s + 1)
      setMsg({ ok: false, t: `${cur.why}\nمو هون، جرّبي صندوق تاني 🙂` })
    }
  }

  return (
    <div className="card center">
      <h3 className="h3">🗂️ {title} ({ar(Math.min(i + 1, items.length))}/{ar(items.length)})</h3>

      {!done && (
        <motion.div key={shake} className="sort-card" animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}>
          {cur.text}
        </motion.div>
      )}

      <div className="sort-bins">
        {bins.map((b) => (
          <button key={b.id} className="sort-bin" disabled={done} onClick={() => pick(b.id)}>
            <b>{b.label}</b>
            <span className="sort-in">
              {(placed[b.id] ?? []).map((t) => <span key={t} className="sort-chip">{t}</span>)}
            </span>
          </button>
        ))}
      </div>

      {msg && <div className={'fb ' + (msg.ok ? 'ok' : 'no')}><Rich t={msg.t} /></div>}
      {done && <div className="fb tip">🎉 صنّفتي كل الكلمات!</div>}
    </div>
  )
}