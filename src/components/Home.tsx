import { useRef, useState } from 'react'
import { Download, Star, Upload } from 'lucide-react'
import { chapters } from '../content'
import { exportProgress, importProgress, useProgress } from '../lib/store'
import { ExamCard } from './ExamCard'
import { exams } from '../content'


export function Stars({ n }: { n: number }) {
  return (
    <span className="stars-s">
      {[0, 1, 2].map((i) => (
        <Star key={i} size={18} fill={i < n ? '#f59e0b' : 'none'} color={i < n ? '#f59e0b' : '#cbd5e1'} />
      ))}
    </span>
  )
}

export function Home() {
  const p = useProgress()
  const file = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const total = Object.values(p.lessons).reduce((s, l) => s + l.stars, 0)

  const onFile = async (f?: File) => {
    if (!f) return
    try { await importProgress(f); setNote('تم استرجاع التقدم ✅') } catch { setNote('الملف مو صالح ❌') }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="em">🧮</div>
        <h1>رياضيات أول متوسط</h1>
        <div className="mut">أهلاً يا بطلة! نجومك: <b>{total}</b> ⭐</div>
      </header>

      {chapters.map((c) => (
        <section key={c.id}>
          <h2 className="chapter">{c.emoji} الفصل {c.id}: {c.title}</h2>
          {c.lessons.map((l) => (
            <a key={l.id} className="lesson" href={`#/lesson/${l.id}`}>
              <span className="em">{l.emoji}</span>
              <span className="lt"><small>الدرس {l.id}</small>{l.title}</span>
              <Stars n={p.lessons[l.id]?.stars ?? 0} />
            </a>
          ))}
          {exams.filter((e) => e.afterChapter === c.id).map((e) => <ExamCard key={e.id} e={e} />)}
        </section>
      ))}

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