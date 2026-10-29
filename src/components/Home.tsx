import { useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Download, Star, Upload } from 'lucide-react'
import { chapters, exams, semesters } from '../content'
import { exportProgress, importProgress, useProgress } from '../lib/store'
import { setFold, useFolds } from '../lib/ui'
import { toArabicDigits } from '../lib/arabicDigits'
import { ExamCard } from './ExamCard'

const ar = (n: number | string) => toArabicDigits(String(n))

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars-s">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={18} fill={i < n ? '#f59e0b' : 'none'} color={i < n ? '#f59e0b' : '#cbd5e1'} />
      ))}
    </span>
  )
}

type FoldProps = {
  level: 2 | 3
  className: string
  open: boolean
  onToggle: () => void
  head: ReactNode
  sub?: ReactNode
  children?: ReactNode
}

/** قسم قابل للطي: زر حقيقي + aria-expanded + حركة خفيفة */
function Fold({ level, className, open, onToggle, head, sub, children }: FoldProps) {
  const id = useId()
  return (
    <>
      <div role="heading" aria-level={level}>
        <button
          type="button"
          className={`fold ${className}${open ? ' open' : ''}`}
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          <span className="ft">
            {head}
            {sub && <small className="fs">{sub}</small>}
          </span>
          <ChevronDown className="chev" size={22} aria-hidden="true" />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            className="fold-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Home() {
  const p = useProgress()
  const folds = useFolds()
  const file = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const total = Object.values(p.lessons).reduce((s, l) => s + l.stars, 0)

  const onFile = async (f?: File) => {
    if (!f) return
    try { await importProgress(f); setNote('تم استرجاع التقدم ✅') } catch { setNote('الملف مو صالح ❌') }
  }

  const isOpen = (key: string, def: boolean) => folds[key] ?? def
  const toggle = (key: string, def: boolean) => setFold(key, !isOpen(key, def))

  // الافتراضي (قبل أن تضغط الطالبة على شيء): يُفتح الفصل الدراسي والفصل اللذان فيهما درس لم يُنجز بعد
  const unfinished = (ids: string[]) =>
    chapters.some((c) => ids.includes(c.id) && c.lessons.some((l) => !p.lessons[l.id]))
  const currentSem = semesters.find((s) => unfinished(s.chapterIds))?.id ?? semesters[0]?.id
  const currentChapter = chapters.find((c) => c.lessons.some((l) => !p.lessons[l.id]))?.id

  return (
    <div className="app">
      <header className="hero">
        <div className="em">🧮</div>
        <h1>رياضيات أول متوسط</h1>
        <div className="mut">أهلاً يا بطلة! نجومك: <b>{total}</b> ⭐</div>
      </header>

      {semesters.map((s) => {
        const chs = chapters.filter((c) => s.chapterIds.includes(c.id))
        const lessons = chs.flatMap((c) => c.lessons)
        const done = lessons.filter((l) => p.lessons[l.id]).length
        const stars = lessons.reduce((n, l) => n + (p.lessons[l.id]?.stars ?? 0), 0)
        const sKey = `sem:${s.id}`
        const sDef = s.id === currentSem

        return (
          <section key={s.id}>
            <Fold
              level={2}
              className="sem"
              open={isOpen(sKey, sDef)}
              onToggle={() => toggle(sKey, sDef)}
              head={<>{s.emoji} {s.title}</>}
              sub={`${ar(chs.length)} فصول • ${ar(done)} من ${ar(lessons.length)} درساً • ⭐ ${ar(stars)}`}
            >
              {chs.map((c) => {
                const cKey = `ch:${c.id}`
                const cDef = c.id === currentChapter
                const cDone = c.lessons.filter((l) => p.lessons[l.id]).length
                return (
                  <div key={c.id}>
                    <Fold
                      level={3}
                      className="chap"
                      open={isOpen(cKey, cDef)}
                      onToggle={() => toggle(cKey, cDef)}
                      head={<>{c.emoji} الفصل {c.id}: {c.title}</>}
                      sub={`${ar(cDone)} من ${ar(c.lessons.length)} دروس`}
                    >
                      {c.lessons.map((l) => (
                        <a key={l.id} className="lesson" href={`#/lesson/${l.id}`}>
                          <span className="em">{l.emoji}</span>
                          <span className="lt"><small>الدرس {l.id}</small>{l.title}</span>
                          <Stars n={p.lessons[l.id]?.stars ?? 0} />
                        </a>
                      ))}
                      {exams
                        .filter((e) => e.afterChapter === c.id && e.scope.length === 1)
                        .map((e) => <ExamCard key={e.id} e={e} />)}
                    </Fold>

                    {/* اختبارات الفصل الدراسي (تشمل عدة فصول): خارج طيّ الفصل، مستقلة */}
                    {exams
                      .filter((e) => e.afterChapter === c.id && e.scope.length > 1)
                      .map((e) => <ExamCard key={e.id} e={e} />)}
                  </div>
                )
              })}
            </Fold>
          </section>
        )
      })}

      <section>
        <a className="lesson times" href="#/times">
          <span className="em">✖️</span>
          <span className="lt">
            تدريب جدول الضرب
            <small>
              {p.times.sessions > 0
                ? `أفضل نتيجة: ${ar(p.times.best)} من ٣٠ • ${ar(p.times.sessions)} جلسات`
                : '٣٠ سؤالاً • ٧ ثوانٍ لكل سؤال'}
            </small>
          </span>
        </a>
      </section>

      <div className="card backup">
        <div className="mut">لنقل تقدمك بين الجهازين:</div>
        <div className="row">
          <button className="btn" onClick={exportProgress}><Download size={18} /> حفظ تقدمي</button>
          <button className="btn alt" onClick={() => file.current?.click()}><Upload size={18} /> استرجاع</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {note && <div>{note}</div>}
      </div>
    </div>
  )
}