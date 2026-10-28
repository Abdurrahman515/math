import { useEffect, useState } from 'react'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { allLessons } from './content'
import { ExamPlayer } from './components/ExamPlayer'
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
  const m = /^#\/lesson\/(.+)$/.exec(h)
  const lesson = m ? allLessons.find((l) => l.id === m[1]) : undefined

  const em = /^#\/exam\/(.+)$/.exec(h)
  const exam = em ? exams.find((x) => x.id === em[1]) : undefined
  if (exam) return <ExamPlayer key={exam.id} def={exam} onExit={() => { window.location.hash = '#/' }} />

  return lesson ? (
    <LessonPlayer key={lesson.id} lesson={lesson} onExit={() => { window.location.hash = '#/' }} />
  ) : (
    <Home />
  )
}