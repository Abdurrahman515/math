import { useMemo, useState } from 'react'
import type { WidgetProps } from '../types'
import { shuffle } from '../lib/rng'
import { Solid, type SolidKind } from '../components/Solid'

const INFO: Record<SolidKind, { name: string; props: string }> = {
  cube: { name: 'مكعب (منشور مربع)', props: 'ستة أوجه كلها مربعات، وقاعدتاه مربعتان' },
  rectPrism: { name: 'منشور مستطيلي (متوازي مستطيلات)', props: 'قاعدتان مستطيلتان متطابقتان ومتوازيتان وأربعة أوجه جانبية مستطيلة' },
  triPrism: { name: 'منشور ثلاثي', props: 'قاعدتان مثلثتان متطابقتان ومتوازيتان وثلاثة أوجه جانبية متوازيات أضلاع' },
  sqPyramid: { name: 'هرم رباعي', props: 'قاعدة واحدة مربعة وأربعة أوجه جانبية مثلثة تلتقي في رأس' },
  triPyramid: { name: 'هرم ثلاثي', props: 'قاعدة واحدة مثلثة وثلاثة أوجه جانبية مثلثة تلتقي في رأس' },
  cylinder: { name: 'أسطوانة', props: 'قاعدتان دائريتان متطابقتان ومتوازيتان وسطح جانبي منحنٍ، بلا رؤوس ولا أحرف' },
  cone: { name: 'مخروط', props: 'قاعدة دائرية واحدة ورأس واحد وسطح جانبي منحنٍ' },
  sphere: { name: 'كرة', props: 'سطح منحنٍ كله، كل نقطة عليه بنفس البعد عن المركز، بلا أوجه ولا أحرف ولا رؤوس' },
}
const KINDS = Object.keys(INFO) as SolidKind[]

export default function SolidSorter({ onDone, props }: WidgetProps) {
  const count = (props?.count as number | undefined) ?? 6
  const [order] = useState(() => shuffle(KINDS).slice(0, count))
  const [i, setI] = useState(0)
  const [tried, setTried] = useState<SolidKind[]>([])
  const [solved, setSolved] = useState(false)
  const [firsts, setFirsts] = useState(0)
  const cur = order[i], last = i === order.length - 1
  const opts = useMemo(() => shuffle([cur, ...shuffle(KINDS.filter((k) => k !== cur)).slice(0, 3)]), [cur])

  const pick = (k: SolidKind) => {
    if (solved || tried.includes(k)) return
    if (k === cur) { setSolved(true); if (!tried.length) setFirsts((f) => f + 1) }
    else setTried([...tried, k])
  }
  const next = () => { if (last) onDone(); else { setI(i + 1); setTried([]); setSolved(false) } }
  const wrong = tried[tried.length - 1]

  return (
    <div className="card">
      <div className="q-prompt">شو اسم هالمجسّم؟ ({i + 1} من {order.length})</div>
      <div style={{ textAlign: 'center' }}><Solid kind={cur} size={130} /></div>
      <div className="opts">
        {opts.map((k) => (
          <button key={k} className={'opt' + (tried.includes(k) ? ' bad' : '') + (solved && k === cur ? ' good' : '')}
            disabled={solved && k !== cur} onClick={() => pick(k)}>{INFO[k].name}</button>
        ))}
      </div>
      {!solved && wrong && <div className="fb no">«{INFO[wrong].name}»: {INFO[wrong].props} 🔍 قارني مع الرسمة، شو الفرق؟</div>}
      {solved && (<>
        <div className="fb ok">برافو! 🎉 {INFO[cur].name}: {INFO[cur].props} ✔️</div>
        <button className="btn" onClick={next}>{last ? `تمام ✅ (${firsts} من أول محاولة)` : 'التالي ➡️'}</button>
      </>)}
    </div>
  )
}