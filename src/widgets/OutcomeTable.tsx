import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type G = { n: string; s: string }
type P = { title: string; names: string[]; groups: G[][] }
const DEF: P[] = [{
  title: 'قميص وبنطال', names: ['قميص', 'بنطال'],
  groups: [[{ n: 'أبيض', s: 'أبيض' }, { n: 'أزرق', s: 'أزرق' }], [{ n: 'أسود', s: 'أسود' }, { n: 'رمادي', s: 'رمادي' }]],
}]

const optBtn = (on: boolean) => ({
  padding: '6px 12px', borderRadius: 10, border: '2px solid #7c3aed', fontSize: 15, cursor: 'pointer',
  background: on ? '#7c3aed' : 'transparent', color: on ? '#fff' : 'inherit',
}) as const
const chip = {
  display: 'inline-block', padding: '4px 10px', margin: 3, borderRadius: 999, fontSize: 14,
  background: '#ede9fe', color: '#1e293b',
} as const

export default function OutcomeTable({ onDone, props }: WidgetProps) {
  const problems = (props?.problems as P[] | undefined) ?? DEF
  const [i, setI] = useState(0)
  const [pk, setPk] = useState<(number | null)[]>(() => problems[0].groups.map(() => null))
  const [found, setFound] = useState<string[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [dups, setDups] = useState(0)
  const p = problems[i]
  const last = i === problems.length - 1
  const total = p.groups.reduce((a, g) => a * g.length, 1)
  const done = found.length === total
  const text = (key: string) => key.split('.').map((x, gi) => ad(p.groups[gi][Number(x)].s)).join('، ')

  const add = () => {
    if (pk.some((x) => x === null)) { setMsg('اختاري خيار من كل مجموعة أول 😉'); return }
    const key = pk.join('.')
    if (found.includes(key)) {
      const d = dups + 1
      setDups(d)
      setMsg(d >= 2 ? 'مكرر مرة تانية 😅 نظّمي: ثبّتي الخيار الأول وبدّلي اللي بعده بالترتيب.' : 'هاد الناتج مكتوب بالقائمة 😅 دوّري على ناتج جديد.')
      return
    }
    setFound([...found, key])
    setMsg(null)
  }
  const check = () => setMsg(done ? null : `لسا ناقص ${ad(total - found.length)} ناتج 🔍 كمّلي بنظام.`)
  const next = () => {
    if (last) onDone()
    else {
      const np = problems[i + 1]
      setI(i + 1); setPk(np.groups.map(() => null)); setFound([]); setMsg(null); setDups(0)
    }
  }
  const sorted = [...found].sort((a, b) => {
    const x = a.split('.').map(Number)
    const y = b.split('.').map(Number)
    for (let t = 0; t < x.length; t++) if (x[t] !== y[t]) return x[t] - y[t]
    return 0
  })

  return (
    <div className="card">
      <div className="q-prompt">{p.title}</div>
      {!done && (
        <>
          {p.groups.map((g, gi) => (
            <div key={gi} style={{ margin: '8px 0' }}>
              <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 4 }}>{p.names[gi]}:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {g.map((o, oi) => (
                  <button
                    key={oi}
                    style={optBtn(pk[gi] === oi)}
                    onClick={() => { setPk(pk.map((x, xi) => (xi === gi ? oi : x))); setMsg(null) }}
                  >
                    {o.n}{o.s !== o.n ? ` (${o.s})` : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
            <button className="btn" onClick={add}>➕ سجّلي الناتج</button>
            {found.length > 0 && <button className="btn" onClick={() => setFound(found.slice(0, -1))}>↩️ شطب آخر ناتج</button>}
            {found.length > 0 && <button className="btn" onClick={check}>هل خلّصت؟</button>}
          </div>
          {msg && <div className="fb no">{msg}</div>}
          <div style={{ margin: '6px 0' }}>
            قائمتك ({ad(found.length)}):
            <div>{found.map((k) => <span key={k} style={chip}>{text(k)}</span>)}</div>
          </div>
        </>
      )}
      {done && (
        <>
          <div className="fb ok">
            برافو! 🎉 كتبتي كل النواتج. شوفي كيف بتبان القائمة المنظمة (مرتّبة حسب الخيار الأول):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '10px 0' }}>
            {p.groups[0].map((g, gi) => (
              <div key={gi} style={{ minWidth: 100 }}>
                <b>{g.n}</b>
                <div>
                  {sorted.filter((k) => k.startsWith(`${gi}.`)).map((k) => (
                    <div key={k} style={chip}>{text(k)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="fb tip">
            عدد النواتج = {p.groups.map((g) => ad(g.length)).join(' × ')} = <b>{ad(total)}</b> 💡 (كل خيار بيتزاوج مع كل خيارات المجموعات التانية)
          </div>
          <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'مثال تاني ➡️'}</button>
        </>
      )}
    </div>
  )
}