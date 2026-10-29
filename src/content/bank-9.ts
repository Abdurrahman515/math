import type { PoolItem } from '../lib/exam'
import {
  triHeightQ, trapHeightQ, circDiamQ, areaScaleQ, sectorQ, twoRectQ, shadedQ, surfaceQ,
  faceCountQ, cubesTotalQ, volHeightQ, cylSolveHQ, cylScaleQ, circArea22Q,
} from './gen-9'

/** مولّدات إضافية لاختبار الفصل ٩ (تُضاف إلى مولّدات كتل practice في الدروس) */
export const bank9: PoolItem[] = [
  { lesson: '9-1', gen: triHeightQ },
  { lesson: '9-1', gen: trapHeightQ },
  { lesson: '9-2', gen: circDiamQ },
  { lesson: '9-3', gen: areaScaleQ },
  { lesson: '9-3', gen: circArea22Q },
  { lesson: '9-3', gen: sectorQ },
  { lesson: '9-4', gen: twoRectQ },
  { lesson: '9-5', gen: shadedQ },
  { lesson: '9-5', gen: surfaceQ },
  { lesson: '9-6', gen: faceCountQ },
  { lesson: '9-7', gen: cubesTotalQ },
  { lesson: '9-8', gen: volHeightQ },
  { lesson: '9-9', gen: cylSolveHQ },
  { lesson: '9-9', gen: cylScaleQ },
]