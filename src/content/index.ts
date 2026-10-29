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
import { lesson51 } from './lesson-5-1'
import { lesson52 } from './lesson-5-2'
import { lesson53 } from './lesson-5-3'
import { lesson54 } from './lesson-5-4'
import { lesson55 } from './lesson-5-5'
import { bank5 } from './bank-5'
import { lesson61 } from './lesson-6-1'
import { lesson62 } from './lesson-6-2'
import { lesson63 } from './lesson-6-3'
import { lesson64 } from './lesson-6-4'
import { lesson65 } from './lesson-6-5'
import { bank6 } from './bank-6'
import { lesson71 } from './lesson-7-1'
import { lesson72 } from './lesson-7-2'
import { lesson73 } from './lesson-7-3'
import { lesson74 } from './lesson-7-4'
import { bank7 } from './bank-7'
import { lesson81 } from './lesson-8-1'
import { lesson82 } from './lesson-8-2'
import { lesson83 } from './lesson-8-3'
import { lesson84 } from './lesson-8-4'
import { lesson85 } from './lesson-8-5'
import { lesson86 } from './lesson-8-6'
import { lesson87 } from './lesson-8-7'
import { lesson88 } from './lesson-8-8'
import { bank8 } from './bank-8'
import { lesson91 } from './lesson-9-1'
import { lesson92 } from './lesson-9-2'
import { lesson93 } from './lesson-9-3'
import { lesson94 } from './lesson-9-4'
import { lesson95 } from './lesson-9-5'
import { lesson96 } from './lesson-9-6'
import { lesson97 } from './lesson-9-7'
import { lesson98 } from './lesson-9-8'
import { lesson99 } from './lesson-9-9'
import { bank9 } from './bank-9'


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
  {
    id: '5',
    title: 'تطبيقات النسبة المئوية',
    emoji: '💯',
    lessons: [lesson51, lesson52, lesson53, lesson54, lesson55],
  },
  {
    id: '6',
    title: 'الإحصاء',
    emoji: '📊',
    lessons: [lesson61, lesson62, lesson63, lesson64, lesson65],
  },
  {
    id: '7',
    title: 'الاحتمال',
    emoji: '🎲',
    lessons: [lesson71, lesson72, lesson73, lesson74],
  },
  {
    id: '8',
    title: 'الهندسة: المضلّعات',
    emoji: '🔷',
    lessons: [lesson81, lesson82, lesson83, lesson84, lesson85, lesson86, lesson87, lesson88],
  },
  {
    id: '9',
    title: 'القياس: الأشكال الثنائية والثلاثية الأبعاد',
    emoji: '📏',
    lessons: [lesson91, lesson92, lesson93, lesson94, lesson95, lesson96, lesson97, lesson98, lesson99],
  },
]
export const allLessons = chapters.flatMap((c) => c.lessons);


export type Semester = { id: string; title: string; emoji: string; chapterIds: string[] }

export const semesters: Semester[] = [
  { id: 's1', title: 'الفصل الدراسي الأول', emoji: '🌱', chapterIds: ['1', '2', '3', '4'] },
  { id: 's2', title: 'الفصل الدراسي الثاني', emoji: '🌿', chapterIds: ['5', '6', '7', '8', '9'] },
]


export const banks: Record<string, PoolItem[]> = { '1': bank1, '2': bank2, '3': bank3, '4': bank4, '5': bank5, '6': bank6, '7': bank7, '8': bank8, '9': bank9 }

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
  { 
    id: 'ex-5', 
    title: 'اختبار مراجعة: تطبيقات النسبة المئوية', 
    emoji: '📝', 
    afterChapter: '5',
    scope: ['5'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  { 
    id: 'ex-6', 
    title: 'اختبار مراجعة: الإحصاء', 
    emoji: '📝', 
    afterChapter: '6',
    scope: ['6'], 
    count: 16, 
    passPct: 70, 
    strict: false, 
    lockHours: 0 
  },
  {
    id: 'ex-7',
    title: 'اختبار مراجعة: الاحتمال',
    emoji: '📝',
    afterChapter: '7',
    scope: ['7'],
    count: 16,
    passPct: 70,
    strict: false,
    lockHours: 0
  },
  {
    id: 'mid2',
    title: 'اختبار منتصف الفصل الدراسي الثاني',
    emoji: '🎓',
    afterChapter: '7',
    scope: ['5', '6', '7'],
    count: 30,
    passPct: 60,
    strict: true,
    lockHours: 24
  },
  {
    id: 'ex-8',
    title: 'اختبار مراجعة: الهندسة (المضلّعات)',
    emoji: '📝',
    afterChapter: '8',
    scope: ['8'],
    count: 16,
    passPct: 70,
    strict: false,
    lockHours: 0
  },
  {
    id: 'ex-9',
    title: 'اختبار مراجعة: القياس',
    emoji: '📝',
    afterChapter: '9',
    scope: ['9'],
    count: 16,
    passPct: 70,
    strict: false,
    lockHours: 0
  },
  {
    id: 'year',
    title: 'اختبار نهاية العام (الفصل الدراسي الثاني)',
    emoji: '🏆',
    afterChapter: '9',
    scope: ['5', '6', '7', '8', '9'],
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