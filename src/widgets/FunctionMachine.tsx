import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WidgetProps } from '../types'

type FunctionMachineProps = WidgetProps & {
  props?: {
    coefficient?: number
    inputLabel?: string
    outputLabel?: string
    ruleText?: string
    inputName?: string
    outputName?: string
  }
}

export default function FunctionMachine({ props, onDone }: FunctionMachineProps) {
  const rawCoefficient = props?.coefficient
  const coefficient = typeof rawCoefficient === 'number' && Number.isFinite(rawCoefficient)
    ? Math.max(1, Math.min(100, rawCoefficient))
    : 20
  const inputLabel = props?.inputLabel ?? 'عدد الأشهر'
  const outputLabel = props?.outputLabel ?? 'الريالات المدّخرة'
  const inputName = props?.inputName ?? 'x'
  const outputName = props?.outputName ?? 'y'
  const ruleText = props?.ruleText ?? `اضربي ${inputLabel} في ${coefficient}`
  const [selected, setSelected] = useState(1)
  const [seen, setSeen] = useState<number[]>([1])
  const [complete, setComplete] = useState(false)
  const values = [1, 2, 3, 4]
  const output = (x: number) => coefficient * x

  const choose = (x: number) => {
    setSelected(x)
    setSeen((old) => old.includes(x) ? old : [...old, x])
  }

  const finish = () => {
    setComplete(true)
    onDone()
  }

  const reset = () => {
    setSelected(1)
    setSeen([1])
    setComplete(false)
  }

  return (
    <div className="card center">
      <h3 className="h3">⚙️ آلة الدالة</h3>
      <div className="mut">غيّري قيمة الإدخال وشوفي كيف تنتج الآلة قيمة المخرج حسب القاعدة.</div>

      <div className="say info" style={{ marginTop: 12 }}>
        <strong>قاعدة الدالة:</strong> {ruleText}
        <div className="expr" dir="ltr" style={{ marginTop: 8 }}>{outputName} = {coefficient}{inputName}</div>
      </div>

      <div className="mut" style={{ marginTop: 12 }}>{inputLabel}: اختاري قيمة من الجدول</div>
      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        {values.map((x) => (
          <button key={x} className={selected === x ? 'btn' : 'btn alt'} onClick={() => choose(x)} aria-pressed={selected === x}>
            {x}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!complete && (
          <motion.div key={selected} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ marginTop: 14 }}>
            <div className="mut">أدخلنا {selected}، فنضربه في {coefficient}…</div>
            <div className="expr" dir="ltr">{coefficient} × {selected} = {output(selected)}</div>
            <div className="fb ok">المخرج = {output(selected)} {outputLabel}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="table" style={{ marginTop: 16 }}>
        <div className="trow">
          <span className="th">الإدخال ({inputName})</span>
          {values.map((x) => <button key={x} className={'td' + (selected === x ? ' on' : '')} onClick={() => choose(x)}>{x}</button>)}
        </div>
        <div className="trow">
          <span className="th">المخرج ({outputName})</span>
          {values.map((x) => <span key={x} className={'td' + (selected === x ? ' on' : '')}>{output(x)}</span>)}
        </div>
      </div>

      <div className="say tip" style={{ marginTop: 12, textAlign: 'right' }}>
        <div><strong>المجال</strong> = مجموعة قيم الإدخال: {'{'}1، 2، 3، 4{'}'}</div>
        <div><strong>المدى</strong> = مجموعة قيم المخرج المقابلة: {'{'}{values.map(output).join('، ')}{'}'}</div>
      </div>
      <div className="mut" style={{ marginTop: 8 }}>جرّبتِ {seen.length} من 4 قيم مختلفة.</div>
      {!complete ? (
        <button className="btn" style={{ marginTop: 12 }} disabled={seen.length < 4} onClick={finish}>
          أنهي تجربة الدالة 🎉
        </button>
      ) : (
        <div className="fb ok" style={{ marginTop: 12 }}>
          أحسنتِ! لكل إدخال قيمة مخرج واحدة حسب القاعدة. صار بإمكانك تحديد المجال والمدى من الجدول.
          <div><button className="link" onClick={reset}>إعادة التجربة ↩️</button></div>
        </div>
      )}
    </div>
  )
}
