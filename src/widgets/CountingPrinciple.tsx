import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type Gp = { name: string; items: string[] }
type P = { title: string; groups: Gp[] }
const DEF: P[] = [{
  title: 'محل أحذية',
  groups: [{ name: 'الألوان', items: ['أسود', 'بني', 'أزرق'] }, { name: 'المقاسات', items: ['٤٠', '٤١'] }],
}]

export default function CountingPrinciple({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [tapped, setTapped] = useState<number[]>([])
  const [third, setThird] = useState(false)
  const p = problems[i]
  const last = i === problems.length - 1
  const [g0, g1, g2] = p.groups
  const n1 = g0.items.length
  const n2 = g1.items.length
  const n3 = g2?.items.length ?? 1
  const pair = n1 * n2
  const total = pair * n3
  const all = tapped.length === n1
  const finished = all && (!g2 || third)
  const factors = p.groups.map((g) => ad(g.items.length)).join(' × ')

  const next = () => {
    if (last) onDone()
    else { setI(i + 1); setTapped([]); setThird(false) }
  }

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      <div style={{ textAlign: 'center', margin: '6px 0' }}>
        {p.groups.map((g) => `${g.name}: ${ad(g.items.length)}`).join(' ، ')}
      </div>
      {!all && (
        <div style={{ textAlign: 'center', margin: '6px 0' }}>
          اضغطي على كل خيار من «{g0.name}» وشوفي كم ناتج بيجيب معه 👇
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', margin: '10px 0' }}>
        {g0.items.map((it, j) => {
          const on = tapped.includes(j)
          return (
            <div key={j} style={{ textAlign: 'center', minWidth: 72 }}>
              <button
                onClick={() => !on && setTapped([...tapped, j])}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: '2px solid #7c3aed', fontSize: 15,
                  cursor: on ? 'default' : 'pointer', background: on ? '#7c3aed' : 'transparent', color: on ? '#fff' : 'inherit',
                }}
              >
                {ad(it)}
              </button>
              {on && (
                <div style={{ marginTop: 4 }}>
                  <div>
                    {Array.from({ length: n2 }, (_, d) => (
                      <span key={d} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', margin: 2 }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>+ {ad(n2)} {g1.name}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {tapped.length > 0 && (
        <div style={{ textAlign: 'center', fontSize: 17, margin: '8px 0' }}>
          {tapped.map(() => ad(n2)).join(' + ')} = <b>{ad(tapped.length * n2)}</b>
        </div>
      )}
      {all && (
        <div className="fb tip">
          جمع متكرر: {ad(n1)} مرة {ad(n2)} يعني {ad(n1)} × {ad(n2)} = <b>{ad(pair)}</b> 💡 الضرب هو اختصار للجمع المتكرر.
        </div>
      )}
      {all && g2 && !third && (
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <button className="btn" onClick={() => setThird(true)}>
            كل ناتج من هدول الـ{ad(pair)} إله {ad(n3)} خيار من «{g2.name}» 🔽
          </button>
        </div>
      )}
      {all && g2 && third && (
        <div className="fb tip">{ad(pair)} × {ad(n3)} = <b>{ad(total)}</b></div>
      )}
      {finished && (
        <>
          <div className="fb ok">
            برافو! 🎉 عدد النواتج الكلي = {factors} = <b>{ad(total)}</b> ✔️
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}