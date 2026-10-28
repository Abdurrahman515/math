import type { PoolItem } from '../lib/exam'
import {
  pctReasonQ, above100EstQ, estWordQ, savingQ, percentGuessQ,
  findWholeWordQ, amountQ, multiplierQ,
} from './gen-5'

/** مولّدات إضافية لاختبار الفصل ٥ (تُضاف إلى مولّدات كتل practice في الدروس) */
export const bank5: PoolItem[] = [
  { lesson: '5-1', gen: pctReasonQ },
  { lesson: '5-2', gen: above100EstQ },
  { lesson: '5-2', gen: estWordQ },
  { lesson: '5-3', gen: savingQ },
  { lesson: '5-3', gen: percentGuessQ },
  { lesson: '5-4', gen: findWholeWordQ },
  { lesson: '5-5', gen: amountQ },
  { lesson: '5-5', gen: multiplierQ },
]