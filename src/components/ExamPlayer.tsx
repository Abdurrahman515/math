import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, RotateCcw } from 'lucide-react'
import type { Question } from '../types'
import { buildExam } from '../lib/exam'
import type { ExamDef, ExamQ } from '../lib/exam'
import { allLessons, poolFor } from '../content'
import { recordExam, useProgress } from '../lib/store'
import { toArabicDigits } from '../lib/arabicDigits'
import { Rich } from './Rich'

const ar = (n: number | string) => toArabicDigits(String(n))

type Ans = { lesson: string; q: Question; ok: boolean; given: string; correct: string; why: string }

const parseNum = (s: string) => {
  const t = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', '.').replace(',', '.').replace('−', '-').trim()
  return t === '' ? NaN : Number(t)
}

function grade(eq: ExamQ, choice: number | null, text: string): Ans | null {
  const q = eq.q
  if (q.kind === 'choice') {
    if (choice === null) return null
    const o = q.options[choice]
    const good = q.options.find((x) => x.correct)!
    return {
      lesson: eq.lesson, q, ok: !!o.correct, given: o.text, correct: good.text,
      why: o.correct ? o.why : `${o.why}\n\n✅ الصح: ${good.why}`,
    }
  }
  const n = parseNum(text)
  if (Number.isNaN(n)) return null
  const ok = Math.abs(n - q.answer) < 1e-9
  const hint = q.wrong?.find((w) => w.value === n)?.why ?? q.fallback ?? ''
  return {
    lesson: eq.lesson, q, ok, given: text.trim(), correct: String(q.answer),
    why: ok ? q.why : `${hint}\n\n✅ الحل: ${q.why}`.trim(),
  }
}

const now = Date.now();

function useNow() {
  const [n, setN] = useState(now);
  useEffect(() => { const t = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(t) }, [])
  return n
}

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  const p = (x: number) => String(x).padStart(2, '0')
  return ar(`${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`)
}

export function ExamPlayer({ def, onExit }: { def: ExamDef; onExit: () => void }) {
  const prog = useProgress()
  const rec = prog.exams[def.id]
  const now = useNow()
  const lockLeft = rec && !rec.passed && rec.lockedUntil > now ? rec.lockedUntil - now : 0

  const [phase, setPhase] = useState<'intro' | 'run' | 'result'>('intro')
  const [qs, setQs] = useState<ExamQ[]>([])
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Ans[]>([])
  const [choice, setChoice] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [shown, setShown] = useState<Ans | null>(null)
  const saved = useRef(false)

  const right = answers.filter((a) => a.ok).length
  const pct = qs.length ? Math.round((right / qs.length) * 100) : 0
  const passed = pct >= def.passPct
  const weak = [...new Set(answers.filter((a) => !a.ok).map((a) => a.lesson))]

  useEffect(() => {
    if (phase === 'result' && !saved.current) {
      saved.current = true
      recordExam(def.id, pct, passed, weak, def.lockHours)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setQs(buildExam(def, poolFor(def.scope)))
    setI(0); setAnswers([]); setChoice(null); setText(''); setShown(null)
    saved.current = false
    setPhase('run')
  }

  const advance = (a: Ans) => {
    setAnswers((x) => [...x, a])
    setShown(null); setChoice(null); setText('')
    if (i + 1 >= qs.length) setPhase('result')
    else setI(i + 1)
  }

  const confirm = () => {
    const a = grade(qs[i], choice, text)
    if (!a) return
    if (def.strict) advance(a)
    else setShown(a)
  }

  const leave = () => {
    if (phase !== 'run' || window.confirm('إذا طلعتي هلأ بتخسري محاولتك الحالية. متأكدة؟')) onExit()
  }

  const titleOf = (id: string) => allLessons.find((l) => l.id === id)?.title ?? ''

  const top = (
    <div className="top">
      <button className="iconbtn" onClick={leave} aria-label="رجوع"><ArrowRight size={22} /></button>
      <div className="bar">
        <div style={{ width: phase === 'run' ? `${(i / Math.max(qs.length, 1)) * 100}%` : phase === 'result' ? '100%' : '0%' }} />
      </div>
      <span className="mut">{def.emoji}</span>
    </div>
  )

  if (phase === 'intro')
    return (
      <div className="app">
        {top}
        <h1 className="title">{def.emoji} {def.title}</h1>
        <div className="card">
          <p>📋 <b>{ar(def.count)}</b> سؤال، وعلامة النجاح <b>{ar(def.passPct)}٪</b></p>
          <p>{def.strict ? '🔒 ما في تصحيح ولا تفسير لحد ما تسلّمي الاختبار كله.' : '💡 بعد كل سؤال بتعرفي صح ولا غلط، وليش.'}</p>
          <p>🎲 كل محاولة بأسئلة وأرقام جديدة.</p>
          {def.lockHours > 0 && <p>⏳ إذا رسبتي، بتقدري تعيدي بعد <b>{ar(def.lockHours)}</b> ساعة.</p>}
          {rec && <p className="mut">محاولاتك: {ar(rec.attempts)} — أفضل نتيجة: {ar(rec.best)}٪ {rec.passed && '✅'}</p>}
        </div>
        {lockLeft > 0 ? (
          <div className="card center" style={{ marginTop: 14 }}>
            <Lock size={30} />
            <div className="lockbox">{fmt(lockLeft)}</div>
            <div className="mut">رسبتي بالمحاولة الأخيرة. استغلّي الوقت بمراجعة هالدروس:</div>
            <div className="chips">
              {rec!.weak.map((id) => <a key={id} href={`#/lesson/${id}`}>{ar(id)} {titleOf(id)}</a>)}
            </div>
          </div>
        ) : (
          <div className="nextrow"><button className="btn big" onClick={start}>ابدئي 🚀</button></div>
        )}
      </div>
    )

  if (phase === 'run' && qs[i]) {
    const q = qs[i].q
    const fb = shown
    return (
      <div className="app">
        {top}
        <div className="mut center">السؤال {ar(i + 1)} من {ar(qs.length)}</div>
        <div className="card" style={{ marginTop: 8 }}>
          <div className="q-prompt"><Rich t={q.prompt} /></div>
          {q.kind === 'choice' ? (
            <div className="opts">
              {q.options.map((o, k) => {
                const cls = fb ? (o.correct ? ' good' : k === choice ? ' bad' : '') : k === choice ? ' sel' : ''
                return (
                  <button key={k} className={'opt' + cls} disabled={!!fb} onClick={() => setChoice(k)}>
                    <Rich t={o.text} />
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              className="num" dir="ltr" inputMode="decimal" placeholder="جوابك هون"
              value={text} disabled={!!fb}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirm()}
            />
          )}
          {fb && (
            <div className={'fb ' + (fb.ok ? 'ok' : 'no')}>
              {fb.ok ? '🎉 صح!\n' : '🤔 '}<Rich t={fb.why} />
            </div>
          )}
        </div>
        <div className="nextrow">
          {fb ? (
            <button className="btn big" onClick={() => advance(fb)}>
              {i + 1 >= qs.length ? 'شوفي النتيجة 🏁' : 'السؤال التالي ▶️'}
            </button>
          ) : (
            <button className="btn big" disabled={q.kind === 'choice' ? choice === null : text.trim() === ''} onClick={confirm}>
              تأكيد الجواب ✔️
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const locked = !passed && !rec?.passed && def.lockHours > 0
    const wrong = answers.filter((a) => !a.ok)
    return (
      <div className="app">
        {top}
        <motion.div className="card center" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ fontSize: '2.6rem' }}>{passed ? '🎉🏆🎉' : '💪'}</div>
          <div className={'score ' + (passed ? 'pass' : 'fail')}>{ar(pct)}٪</div>
          <div>أجبتي صح على <b>{ar(right)}</b> من <b>{ar(qs.length)}</b></div>
          <h3 className="h3">{passed ? 'نجحتي! برافو عليكِ 👏' : `ما وصلتي لـ ${ar(def.passPct)}٪ هالمرة، بس عادي!`}</h3>
          {weak.length > 0 && (
            <>
              <div className="mut">دروس بدها مراجعة:</div>
              <div className="chips">
                {weak.map((id) => <a key={id} href={`#/lesson/${id}`}>{ar(id)} {titleOf(id)}</a>)}
              </div>
            </>
          )}
          {locked && <p>🔒 بتقدري تعيدي بعد <b>{ar(def.lockHours)}</b> ساعة. راجعي الدروس وارجعي أقوى!</p>}
          <div className="row">
            <button className="btn" onClick={onExit}>🏠 للرئيسية</button>
            {!locked && <button className="btn alt" onClick={start}><RotateCcw size={18} /> محاولة جديدة</button>}
          </div>
        </motion.div>

        {wrong.length > 0 && <h3 className="h3" style={{ marginTop: 20 }}>🔍 أخطاؤك وتفسيرها</h3>}
        {wrong.map((a, k) => (
          <div key={k} className="rev">
            <div><b>السؤال:</b> <Rich t={a.q.prompt} /></div>
            <div><b>جوابك:</b> {a.q.kind === 'choice' ? <Rich t={a.given} /> : ar(a.given)}</div>
            <div><b>الصح:</b> {a.q.kind === 'choice' ? <Rich t={a.correct} /> : ar(a.correct)}</div>
            <div style={{ marginTop: 6 }}><Rich t={a.why} /></div>
          </div>
        ))}
      </div>
    )
  }

  return <div className="app"><div className="card">⚠️ ما قدرنا نجهّز أسئلة لهالاختبار.</div></div>
}