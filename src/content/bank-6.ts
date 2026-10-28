import type { PoolItem } from '../lib/exam'
import {
  countFreqQ, newRangeQ, totalFromMeanQ, effectQ, bestMeasureQ,
  freqAssignQ, histPctQ, graphChooseQ, trendPredictQ,
} from './gen-6'

/** مولّدات إضافية لاختبار الفصل ٦ (تُضاف إلى مولّدات كتل practice في الدروس) */
export const bank6: PoolItem[] = [
  { lesson: '6-1', gen: countFreqQ },
  { lesson: '6-1', gen: newRangeQ },
  { lesson: '6-2', gen: totalFromMeanQ },
  { lesson: '6-2', gen: effectQ },
  { lesson: '6-2', gen: bestMeasureQ },
  { lesson: '6-3', gen: freqAssignQ },
  { lesson: '6-3', gen: histPctQ },
  { lesson: '6-4', gen: graphChooseQ },
  { lesson: '6-5', gen: trendPredictQ },
]