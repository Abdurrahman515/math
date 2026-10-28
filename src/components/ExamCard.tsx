import { chapters } from '../content'
import type { ExamDef } from '../lib/exam'
import { useProgress } from '../lib/store'
import { toArabicDigits } from '../lib/arabicDigits'

const ar = (n: number | string) => toArabicDigits(String(n))

export function ExamCard({ e }: { e: ExamDef }) {
  const p = useProgress()
  const rec = p.exams[e.id]
  const lessons = chapters.filter((c) => e.scope.includes(c.id)).flatMap((c) => c.lessons)
  const done = lessons.filter((l) => p.lessons[l.id]).length
  const left = rec && !rec.passed ? rec.lockedUntil - Date.now() : 0

  const status = rec?.passed
    ? `نجحتي ✅ أفضل نتيجة ${ar(rec.best)}٪`
    : left > 0
      ? `🔒 الإعادة بعد ${ar(Math.ceil(left / 3600000))} ساعة تقريباً`
      : rec
        ? `أفضل نتيجة ${ar(rec.best)}٪ — جرّبي مرة تانية 💪`
        : `دروس مخلّصة: ${ar(done)} من ${ar(lessons.length)}`

  return (
    <a className={'lesson exam' + (rec?.passed ? ' pass' : '')} href={`#/exam/${e.id}`}>
      <span className="em">{e.emoji}</span>
      <span className="lt"><small>{status}</small>{e.title}</span>
    </a>
  )
}