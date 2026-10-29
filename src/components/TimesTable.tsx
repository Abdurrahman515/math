import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { pick } from '../lib/rng'
import { recordTimes, useProgress } from '../lib/store'
import { toArabicDigits } from '../lib/arabicDigits'
import { SECONDS, SESSION_SIZE, buildSession, type TimesQ } from '../lib/timesTable'

const ar = (n: number | string) => toArabicDigits(String(n))
const PRAISE = ['برافو عليكِ! 🎉', 'صح عليكِ! ⭐', 'ممتاز! 👏', 'شاطرة! 💪', 'هيك بدّها! 🔥', 'سريعة وصح! ⚡']
const MISS = ['ولا يهمك، تذكّري الجواب وكمّلي 💪', 'قريبة! الجواب بيثبت بالتكرار 🌱', 'لا تستسلمي، الجاي أحسن ✨']
const norm = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).trim()

type Status = 'asking' | 'right' | 'wrong' | 'timeout'

function verdict(c: number) {
  if (c >= 27) return 'خارقة! جدول الضرب صار عندك متل الماء 🏆'
  if (c >= 20) return 'ممتاز! شوي كمان وبتوصلي للكمال 🌟'
  if (c >= 12) return 'حلو كتير، كل جلسة بتقوّيكِ أكتر 💪'
  return 'البداية دايماً أصعب شي، كرّري وراح تتحسني 🌱'
}

export function TimesTable({ onExit }: { onExit: () => void }) {
  const p = useProgress()
  const [qs, setQs] = useState<TimesQ[]>(buildSession)
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro')
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<Status>('asking')
  const [left, setLeft] = useState(SECONDS)
  const [val, setVal] = useState('')
  const [msg, setMsg] = useState('')
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState<TimesQ[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const q = qs[idx]

  const settle = (s: Exclude<Status, 'asking'>) => {
    setStatus(s)
    if (s === 'right') {
      setCorrect((c) => c + 1)
      setMsg(pick(PRAISE))
    } else {
      setMissed((m) => [...m, q])
      setMsg(s === 'timeout' ? 'انتهى الوقت ⏰' : pick(MISS))
    }
  }

  // المؤقت: ٧ ثوانٍ لكل سؤال
  useEffect(() => {
    if (phase !== 'run' || status !== 'asking') return
    const end = Date.now() + SECONDS * 1000
    setLeft(SECONDS) // eslint-disable-line
    const t = setInterval(() => {
      const r = end - Date.now()
      if (r <= 0) {
        clearInterval(t)
        setLeft(0)
        settle('timeout')
      } else setLeft(r / 1000)
    }, 100)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, status, qs])

  useEffect(() => {
    if (phase === 'run' && status === 'asking') inputRef.current?.focus()
  }, [phase, idx, status])

  const submit = () => {
    if (status !== 'asking') return
    const s = norm(val)
    if (!/^\d+$/.test(s)) return
    settle(Number(s) === q.answer ? 'right' : 'wrong')
  }

  const next = () => {
    if (idx + 1 >= qs.length) {
      recordTimes(correct)
      setPhase('done')
      return
    }
    setIdx((i) => i + 1)
    setStatus('asking')
    setVal('')
    setMsg('')
  }

  const start = () => {
    setQs(buildSession())
    setIdx(0); setStatus('asking'); setVal(''); setMsg('')
    setCorrect(0); setMissed([])
    setPhase('run')
  }

  const eq = (t: TimesQ) => `${ar(t.a)} × ${ar(t.b)} = ${ar(t.answer)}`

  if (phase === 'intro')
    return (
      <div className="app">
        <div className="top">
          <button className="iconbtn" onClick={onExit} aria-label="رجوع">✕</button>
        </div>
        <div className="card center">
          <div className="em">✖️</div>
          <h2 className="title">تدريب جدول الضرب</h2>
          <p>
            {ar(SESSION_SIZE)} سؤالاً من جدول الواحد إلى العشرة، وبكل سؤال معك {ar(SECONDS)} ثوانٍ بس.
            {'\n'}اكتبي الجواب واضغطي Enter أو «تحقّقي». وإذا خلص الوقت منكشف لك الجواب.
          </p>
          {p.times.sessions > 0 && (
            <div className="mut">
              أفضل نتيجة: {ar(p.times.best)} من {ar(SESSION_SIZE)} • عدد الجلسات: {ar(p.times.sessions)}
            </div>
          )}
          <div className="nextrow">
            <button className="btn big" onClick={start}>يلا نبدأ 🚀</button>
          </div>
        </div>
      </div>
    )

  if (phase === 'done')
    return (
      <div className="app">
        <div className="top">
          <button className="iconbtn" onClick={onExit} aria-label="رجوع">✕</button>
        </div>
        <div className="card center finish">
          <div className="confetti">{correct >= 20 ? '🎉' : '💪'}</div>
          <div className={'score ' + (correct >= 20 ? 'pass' : '')}>
            {ar(correct)} / {ar(SESSION_SIZE)}
          </div>
          <p>{verdict(correct)}</p>
          {correct >= p.times.best && correct > 0 && <div className="fb ok">هاي أفضل نتيجة إلك لحد هلأ! 🏅</div>}
          {missed.length > 0 && (
            <>
              <h3 className="h3">راجعي هدول:</h3>
              <div className="chips">
                {missed.map((m) => (
                  <span key={`${m.a}x${m.b}`} className="tt-miss">{eq(m)}</span>
                ))}
              </div>
            </>
          )}
          <div className="row">
            <button className="btn" onClick={start}>جلسة جديدة 🔁</button>
            <button className="btn alt" onClick={onExit}>الرئيسية</button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="app">
      <div className="top">
        <button className="iconbtn" onClick={onExit} aria-label="خروج">✕</button>
        <div className="bar"><div style={{ width: `${(idx / qs.length) * 100}%` }} /></div>
        <span className="mut">{ar(idx + 1)}/{ar(qs.length)}</span>
      </div>

      <motion.div key={idx} className="card center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tt-timer" aria-hidden="true">
          <div
            className={'tt-fill' + (left <= 2 ? ' low' : '')}
            style={{ width: status === 'asking' ? `${(left / SECONDS) * 100}%` : '0%' }}
          />
        </div>
        <div className="mut">{status === 'asking' ? `⏳ ${ar(Math.ceil(left))}` : '\u00a0'}</div>

        <div className="tt-q"><span className="m">{ar(q.a)} × {ar(q.b)} = ؟</span></div>

        <div className="numrow">
          <input
            ref={inputRef}
            className="num"
            inputMode="numeric"
            placeholder="جوابك هون"
            value={val}
            disabled={status !== 'asking'}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {status === 'asking' && <button className="btn" onClick={submit}>تحقّقي ✔️</button>}
        </div>

        {status !== 'asking' && (
          <>
            <div className={'fb ' + (status === 'right' ? 'ok' : 'no')}>
              {msg}
              {status !== 'right' && `\nالجواب: ${eq(q)}`}
            </div>
            <div className="nextrow">
              <button className="btn big" autoFocus onClick={next}>
                {idx + 1 >= qs.length ? 'شوفي النتيجة 🏁' : 'التالي ⬅️'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}