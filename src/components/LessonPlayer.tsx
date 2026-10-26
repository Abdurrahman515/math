import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import type { Block, Lesson, Question } from '../types'
import { finishLesson } from '../lib/store'
import { widgets } from '../widgets'
import { Quiz } from './Quiz'
import { Reveal } from './Reveal'
import { Rich } from './Rich'
import { toArabicDigits } from '../lib/arabicDigits'

function Say({ b }: { b: Extract<Block, { t: 'say' }> }) {
  return (
    <div className={'say ' + (b.tone ?? 'info')}>
      {b.emoji && <span className="em">{b.emoji}</span>}
      <p><Rich t={b.text} /></p>
    </div>
  )
}

function Practice(p: {
  gen: () => Question; count: number; title?: string; lessonId: string
  onScore: (first: boolean) => void; onDone: () => void
}) {
  const [k, setK] = useState(0)
  const [solved, setSolved] = useState(false)
  const [q, setQ] = useState<Question>(() => p.gen())

  return (
    <div>
      <div className="ptitle">
        🏋️ {p.title ?? 'تمرين'} — {toArabicDigits(k + 1)}/{toArabicDigits(p.count)}
      </div>
      <Quiz
        key={k} q={q} lessonId={p.lessonId}
        onSolved={(f) => { p.onScore(f); setSolved(true); if (k + 1 >= p.count) p.onDone() }}
      />
      {solved && k + 1 < p.count && (
        <button className="btn" style={{ marginTop: 10 }} onClick={() => { setK(k + 1); setQ(p.gen()); setSolved(false) }}>
          سؤال تاني ▶️
        </button>
      )}
    </div>
  )
}

export function LessonPlayer({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const [pos, setPos] = useState(1)
  const [round, setRound] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [score, setScore] = useState({ first: 0, total: 0 })
  const endRef = useRef<HTMLDivElement>(null)

  const n = lesson.blocks.length
  const cur = lesson.blocks[pos - 1]
  const canNext = cur?.t === 'say' || done.has(pos - 1)
  const finished = pos > n
  const ratio = score.total ? score.first / score.total : 1
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1

  const mark = (i: number) => setDone((d) => (d.has(i) ? d : new Set(d).add(i)))
  const addScore = (first: boolean) => setScore((s) => ({ first: s.first + (first ? 1 : 0), total: s.total + 1 }))
  const restart = () => { setPos(1); setDone(new Set()); setScore({ first: 0, total: 0 }); setRound((r) => r + 1); window.scrollTo(0, 0) }

  useEffect(() => { if (finished) finishLesson(lesson.id, stars) }, [finished, lesson.id, stars])
  useEffect(() => { if (pos > 1) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [pos])

  return (
    <div className="app">
      <div className="top">
        <button className="iconbtn" onClick={onExit} aria-label="رجوع"><ArrowRight size={22} /></button>
        <div className="bar"><div style={{ width: `${(Math.min(pos, n) / n) * 100}%` }} /></div>
        <span className="mut">
          {lesson.emoji} {toArabicDigits(lesson.id)}
        </span>
      </div>

      <h1 className="title">{lesson.title}</h1>

      {lesson.blocks.slice(0, pos).map((b, i) => (
        <motion.div key={`${round}-${i}`} className="block" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {b.t === 'say' && <Say b={b} />}
          {b.t === 'reveal' && <Reveal title={b.title} items={b.items} onDone={() => mark(i)} />}
          {b.t === 'widget' && (() => {
            const W = widgets[b.id]
            return W ? <W props={b.props} onDone={() => mark(i)} /> : <div className="card">⚠️ أداة غير مسجّلة: {b.id}</div>
          })()}
          {b.t === 'quiz' && <Quiz q={b.q} lessonId={lesson.id} onSolved={(f) => { addScore(f); mark(i) }} />}
          {b.t === 'practice' && (
            <Practice gen={b.gen} count={b.count} title={b.title} lessonId={lesson.id} onScore={addScore} onDone={() => mark(i)} />
          )}
        </motion.div>
      ))}

      {finished ? (
        <motion.div className="card center finish" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="confetti">🎉🎊✨</div>
          <h2>خلصتي الدرس!</h2>
          <div className="stars">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.25, type: 'spring' }}>
                <Star size={44} fill={i < stars ? '#f59e0b' : 'none'} color={i < stars ? '#f59e0b' : '#cbd5e1'} />
              </motion.span>
            ))}
          </div>
          <div className="mut">
            أجبتي صح من أول مرة على {toArabicDigits(score.first)} من {toArabicDigits(score.total)}
          </div>
          <div className="row">
            <button className="btn" onClick={onExit}>🏠 للرئيسية</button>
            <button className="link" onClick={restart}>🔁 أعيدي الدرس</button>
          </div>
        </motion.div>
      ) : (
        <div className="nextrow">
          <button className="btn big" disabled={!canNext} onClick={() => setPos((p) => p + 1)}>
            {pos === n ? 'خلصنا 🎉' : 'كمّلي ▶️'}
          </button>
          {!canNext && <div className="mut">خلّصي هالجزء وبنكمل 😉</div>}
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}