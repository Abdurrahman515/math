import type { PoolItem } from '../lib/exam'
import { pieMissQ, triImpossibleQ, quadUnknownQ, shadowQ, polyNameQ, vertAdjQ } from './gen-8'

/** مولّدات إضافية لاختبار الفصل ٨ (تُضاف إلى مولّدات كتل practice في الدروس) */
export const bank8: PoolItem[] = [
  { lesson: '8-1', gen: vertAdjQ },
  { lesson: '8-3', gen: pieMissQ },
  { lesson: '8-4', gen: triImpossibleQ },
  { lesson: '8-6', gen: quadUnknownQ },
  { lesson: '8-7', gen: shadowQ },
  { lesson: '8-8', gen: polyNameQ },
]