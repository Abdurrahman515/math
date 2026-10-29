import { useEffect, useState } from 'react'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { allLessons } from './content'
import { ExamPlayer } from './components/ExamPlayer'
import { TimesTable } from './components/TimesTable'
import { exams } from './content'

function useHash() {
  const [h, setH] = useState(window.location.hash)
  useEffect(() => {
    const f = () => setH(window.location.hash)
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

export default function App() {
  const h = useHash()
  const exit = () => { window.location.hash = '#/' }

  if (/^#\/times\/?$/.test(h)) return <TimesTable onExit={exit} />

  const m = /^#\/lesson\/(.+)$/.exec(h)
  const lesson = m ? allLessons.find((l) => l.id === m[1]) : undefined

  const em = /^#\/exam\/(.+)$/.exec(h)
  const exam = em ? exams.find((x) => x.id === em[1]) : undefined
  if (exam) return <ExamPlayer key={exam.id} def={exam} onExit={exit} />

  return (
    <>
      {lesson ? <LessonPlayer key={lesson.id} lesson={lesson} onExit={exit} /> : <Home />}
      <div style={{ textAlign: 'center', padding: '16px 0 calc(24px + env(safe-area-inset-bottom))', fontSize: '1rem', color: '#6b7596' }}>
        <a
          href="https://abdurrahman515.github.io/Portfolio"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          تصميم وتطوير: عبدالرحمن قربان بارودي
        </a>
      </div>
    </>
  )
}