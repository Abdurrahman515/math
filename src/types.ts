export type ChoiceOption = { text: string; correct?: boolean; why: string }
export type ChoiceQ = { kind: 'choice'; prompt: string; options: ChoiceOption[] }
export type NumericQ = {
  kind: 'numeric'
  prompt: string
  answer: number
  /** أخطاء شائعة: لكل قيمة خاطئة تفسيرها الخاص */
  wrong?: { value: number; why: string }[]
  /** شرح الحل (يظهر عند الإجابة الصحيحة أو عند طلب المساعدة) */
  why: string
  fallback?: string
}
export type Question = ChoiceQ | NumericQ

export type RevealItem = { emoji: string; title: string; detail: string }

export type Block =
  | { t: 'say'; text: string; emoji?: string; tone?: 'info' | 'tip' | 'warn' }
  | { t: 'reveal'; title?: string; items: RevealItem[] }
  | { t: 'widget'; id: string; props?: Record<string, unknown> }
  | { t: 'quiz'; q: Question }
  | { t: 'practice'; gen: () => Question; count: number; title?: string }

export type Lesson = { id: string; title: string; emoji: string; blocks: Block[] }
export type Chapter = { id: string; title: string; emoji: string; lessons: Lesson[] }

export type WidgetProps = { onDone: () => void; props?: Record<string, unknown> }