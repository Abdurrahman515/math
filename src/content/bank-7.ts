import type { PoolItem } from '../lib/exam'
import { sureQ, complementDecQ, coinsQ, twoDiceQ, twoBagsQ, codeQ } from './gen-7'

/** مولّدات إضافية لاختبار الفصل ٧ (تُضاف إلى مولّدات كتل practice في الدروس) */
export const bank7: PoolItem[] = [
  { lesson: '7-1', gen: sureQ },
  { lesson: '7-1', gen: complementDecQ },
  { lesson: '7-2', gen: coinsQ },
  { lesson: '7-3', gen: twoDiceQ },
  { lesson: '7-3', gen: twoBagsQ },
  { lesson: '7-4', gen: codeQ },
]