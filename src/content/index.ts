import type { Chapter } from '../types'
import { lesson11 } from './lesson-1-1'
import { lesson12 } from './lesson-1-2'
import { lesson13 } from './lesson-1-3'
import { lesson14 } from './lesson-1-4'
import { lesson15 } from './lesson-1-5'
import { lesson16 } from './lesson-1-6'
import { lesson17 } from './lesson-1-7'
import { lesson18 } from './lesson-1-8'
import type { ExamDef, PoolItem } from '../lib/exam'
import { bank1 } from './bank-1'
import { lesson21 } from './lesson-2-1'
import { lesson22 } from './lesson-2-2'
import { lesson23 } from './lesson-2-3'
import { lesson24 } from './lesson-2-4'
import { lesson25 } from './lesson-2-5'
import { lesson26 } from './lesson-2-6'
import { lesson27 } from './lesson-2-7'
import { lesson28 } from './lesson-2-8'
import { bank2 } from './bank-2'
import { lesson31 } from './lesson-3-1'
import { lesson32 } from './lesson-3-2'
import { lesson33 } from './lesson-3-3'
import { lesson34 } from './lesson-3-4'
import { lesson35 } from './lesson-3-5'
import { lesson36 } from './lesson-3-6'
import { lesson37 } from './lesson-3-7'
import { bank3 } from './bank-3'
import { lesson41 } from './lesson-4-1'
import { lesson42 } from './lesson-4-2'
import { lesson43 } from './lesson-4-3'
import { lesson44 } from './lesson-4-4'
import { lesson45 } from './lesson-4-5'
import { lesson46 } from './lesson-4-6'
import { lesson47 } from './lesson-4-7'
import { lesson48 } from './lesson-4-8'
import { bank4 } from './bank-4'


export const chapters: Chapter[] = [
  { 
    id: '1', 
    title: 'الجبر والدوال', 
    emoji: '🧮', 
    lessons: [lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18] 
  },
  { 
    id: '2', 
    title: 'الأعداد الصحيحة', 
    emoji: '🌡️', 
    lessons: [lesson21, lesson22, lesson23, lesson24, lesson25, lesson26, lesson27, lesson28] 
  },
  { 
    id: '3', 
    title: 'الجبر: المعادلات الخطية والدوال', 
    emoji: '⚖️', 
    lessons: [lesson31, lesson32, lesson33, lesson34, lesson35, lesson36, lesson37] 
  },
  {
    id: '4',
    title: 'النسبة والتناسب',
    emoji: '📐',
    lessons: [lesson41, lesson42, lesson43, lesson44, lesson45, lesson46, lesson47, lesson48],
  },
]
export const allLessons = chapters.flatMap((c) => c.lessons);


export const banks: Record<string, PoolItem[]> = { '1': bank1, '2': bank2, '3': bank3, '4': bank4 }

export const exams: ExamDef[] = [
  { 
    id: 'ex-1', 
    title: 'اختبار مراجعة: الجبر والدوال', 
    emoji: '📝', 
    afterChapter: '1',
    scope: ['1'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  { 
    id: 'ex-2', 
    title: 'اختبار مراجعة: الأعداد الصحيحة', 
    emoji: '📝', 
    afterChapter: '2',
    scope: ['2'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  { 
    id: 'mid', 
    title: 'اختبار منتصف الفصل الدراسي الأول', 
    emoji: '🎓', 
    afterChapter: '2',
    scope: ['1', '2'], 
    count: 30, 
    passPct: 60, 
    strict: true, 
    lockHours: 24 
  },
  { 
    id: 'ex-3', 
    title: 'اختبار مراجعة: المعادلات الخطية والدوال', 
    emoji: '📝', 
    afterChapter: '3',
    scope: ['3'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  { 
    id: 'ex-4', 
    title: 'اختبار مراجعة: النسبة والتناسب', 
    emoji: '📝', 
    afterChapter: '4',
    scope: ['4'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  { 
    id: 'final', 
    title: 'اختبار نهاية الفصل الدراسي الأول', 
    emoji: '🏆', 
    afterChapter: '4',
    scope: ['1', '2', '3', '4'], 
    count: 60, 
    passPct: 60, 
    strict: true, 
    lockHours: 24 
  },
]


/** مولّدات الأسئلة لنطاق من الفصول: من كتل practice في الدروس + بنك الفصل */
export function poolFor(scope: string[]): PoolItem[] {
  return scope.flatMap((id) => {
    const ch = chapters.find((c) => c.id === id)
    const fromLessons: PoolItem[] = (ch?.lessons ?? []).flatMap((l) =>
      l.blocks.flatMap((b) => (b.t === 'practice' ? [{ lesson: l.id, gen: b.gen }] : [])),
    )
    return [...fromLessons, ...(banks[id] ?? [])]
  })
}