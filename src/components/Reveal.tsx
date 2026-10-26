import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { RevealItem } from '../types'
import { Rich } from './Rich'

export function Reveal({ title, items, onDone }: { title?: string; items: RevealItem[]; onDone: () => void }) {
  const [seen, setSeen] = useState<number[]>([])
  const [cur, setCur] = useState<number | null>(null)

  const open = (i: number) => {
    setCur(i)
    if (seen.includes(i)) return
    const s = [...seen, i]
    setSeen(s)
    if (s.length === items.length) onDone()
  }

  return (
    <div className="card">
      {title && <h3 className="h3">{title}</h3>}
      <div className="rv-grid">
        {items.map((it, i) => (
          <motion.button
            key={i} whileTap={{ scale: 0.95 }}
            className={'rv' + (seen.includes(i) ? ' seen' : '') + (cur === i ? ' cur' : '')}
            onClick={() => open(i)}
          >
            <span className="rv-em">{it.emoji}</span>
            <span>{it.title}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {cur !== null ? (
          <motion.div key={cur} className="rv-detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Rich t={items[cur].detail} />
          </motion.div>
        ) : (
          <div className="mut">👆 اضغطي على كل بطاقة لتشوفي شو فيها ({items.length - seen.length} باقية)</div>
        )}
      </AnimatePresence>
    </div>
  )
}