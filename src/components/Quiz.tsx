import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Question } from '../types'
import { pick, shuffle } from '../lib/rng'
import { logMistake } from '../lib/store'
import { Rich } from './Rich'
import { toArabicDigits } from '../lib/arabicDigits'

const PRAISE = ['برافو عليكِ! 🎉', 'صح عليكِ! ⭐', 'ممتاز! 👏', 'شاطرة! 💪', 'هيك بدّها! 🔥']
const norm = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('−', '-').replace(',', '.').trim()

export function Quiz({ q, lessonId, onSolved }: { q: Question; lessonId: string; onSolved: (firstTry: boolean) => void }) {
  const opts = useMemo(() => (q.kind === 'choice' ? shuffle(q.options) : []), [q])
  const praise = useMemo(() => pick(PRAISE), [])
  const [tried, setTried] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [solved, setSolved] = useState(false)
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null)
  const [val, setVal] = useState('')
  const [peek, setPeek] = useState(false)

  const win = (text: string) => { setSolved(true); setFb({ ok: true, text }); onSolved(mistakes === 0) }
  const miss = (text: string, chosen: string) => {
    setMistakes((m) => m + 1)
    setFb({ ok: false, text })
    logMistake(lessonId, q.prompt, chosen)
  }

  const pickChoice = (i: number) => {
    if (solved || tried.includes(i)) return
    const o = opts[i]
    if (o.correct) win(o.why)
    else { setTried((t) => [...t, i]); miss(o.why, o.text) }
  }

  const submit = () => {
    if (q.kind !== 'numeric' || solved) return
    const s = norm(val)
    const n = Number(s)
    if (s === '' || Number.isNaN(n)) return
    if (n === q.answer) win(q.why)
    else miss(q.wrong?.find((w) => w.value === n)?.why ?? q.fallback ?? 'مو هيك، جرّبي مرة تانية 🙂', val)
  }

  return (
    <div className="card">
      <div className="q-prompt"><Rich t={q.prompt} /></div>

      {q.kind === 'choice' ? (
        <div className="opts">
          {opts.map((o, i) => (
            <motion.button
              key={i}
              className={'opt' + (tried.includes(i) ? ' bad' : '') + (solved && o.correct ? ' good' : '')}
              whileTap={{ scale: 0.97 }}
              animate={tried.includes(i) ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              disabled={solved && !o.correct}
              onClick={() => pickChoice(i)}
            >
              <Rich t={o.text} />
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="numrow">
          <input
            className="num" dir="ltr" inputMode="decimal" placeholder="جوابك هون"
            value={val} disabled={solved}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {!solved && <button className="btn" onClick={submit}>تحقّقي ✔️</button>}
        </div>
      )}

      <AnimatePresence mode="wait">
        {fb && (
          <motion.div
            key={fb.text + mistakes}
            className={'fb ' + (fb.ok ? 'ok' : 'no')}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            {fb.ok ? praise + '\n' : '🤔 '}<Rich t={fb.text} />
          </motion.div>
        )}
      </AnimatePresence>

      {q.kind === 'numeric' && !solved && mistakes >= 2 &&
        (peek ? (
          <div className="fb tip">
            الحل: <Rich t={q.why} />
            {'\n'}الجواب: <b>{toArabicDigits(q.answer)}</b>
          </div>
        ) : (
          <button className="link" onClick={() => setPeek(true)}>🔎 وضّحي لي الحل</button>
        ))}
    </div>
  )
}