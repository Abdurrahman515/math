import type { Chapter } from '../types'
import { lesson11 } from './lesson-1-1'
import { lesson12 } from './lesson-1-2'
import { lesson13 } from './lesson-1-3'
import { lesson14 } from './lesson-1-4'
import { lesson15 } from './lesson-1-5'
import { lesson16 } from './lesson-1-6'
import { lesson17 } from './lesson-1-7'
import { lesson18 } from './lesson-1-8'

export const chapters: Chapter[] = [
  { 
    id: '1', 
    title: 'الجبر والدوال', 
    emoji: '🧮', 
    lessons: [lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18] 
  },
]
export const allLessons = chapters.flatMap((c) => c.lessons)