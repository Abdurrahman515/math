import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'
import { kindOf, kindAr, rad } from '../lib/geo'
import type { AngleKind } from '../lib/geo'

const CX = 150, CY = 150, R = 120
const xy = (deg: number, r: number): [number, number] => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))]
const P = (deg: number, r: number) => xy(deg, r).join(',')
const arc = (a: number, b: number, r: number) => `M${P(a, r)} A${r},${r} 0 0 0 ${P(b, r)}`
const mid = (a: number, b: number, r: number) => xy((a + b) / 2, r)
const snap = (v: number) => (Math.abs(v - 90) <= 2 ? 90 : v >= 178 ? 180 : v)
const n = (x: number) => ad(String(x))
const Ray = ({ a, c }: { a: number; c: string }) => {
  const [x, y] = xy(a, R)
  return <line x1={CX} y1={CY} x2={x} y2={y} stroke={c} strokeWidth={3} strokeLinecap="round" />
}

export default function AngleLab({ onDone, props }: WidgetProps) {
  const sum = props?.mode === 'sum'
  const total = (props?.total as number | undefined) ?? 90
  const tasks = (props?.tasks as AngleKind[] | undefined) ?? ['acute', 'obtuse', 'right', 'straight']
  const [m, setM] = useState(sum ? Math.round(total / 3) : 35)
  const [seen, setSeen] = useState<number[]>([])
  const [i, setI] = useState(0)
  const [ok, setOk] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')

  const move = (raw: number) => {
    const v = sum ? raw : snap(raw)
    setM(v); setOk(null); setMsg('')
    if (sum && !seen.includes(v)) setSeen([...seen, v])
  }
  const target = tasks[i]
  const last = i === tasks.length - 1
  const check = () => {
    if (kindOf(m) === target) { setOk(true); setMsg(`برافو! 🎉 ${n(m)}° زاوية ${kindAr[target]}.`) }
    else { setOk(false); setMsg(`قياسها ${n(m)}°، يعني هي ${kindAr[kindOf(m)]} 🔍 حرّكي الشريط لتصير ${kindAr[target]}.`) }
  }
  const next = () => { if (last) onDone(); else { setI(i + 1); setOk(null); setMsg('') } }

  const b = total - m
  return (
    <div className="card">
      {sum ? (
        <div className="q-prompt">حرّكي الشريط ولاحظي مجموع الزاويتين 👀</div>
      ) : (
        <div className="q-prompt">اجعلي الزاوية <b>{kindAr[target]}</b> 🎯 ({n(i + 1)} من {n(tasks.length)})</div>
      )}
      <svg viewBox="0 0 300 165" style={{ width: '100%' }}>
        <Ray a={0} c="#64748b" />
        {sum ? (
          <>
            <Ray a={m} c="#7c3aed" />
            <Ray a={total} c="#64748b" />
            <path d={arc(0, m, 55)} fill="none" stroke="#0ea5e9" strokeWidth={3} />
            <path d={arc(m, total, 75)} fill="none" stroke="#f59e0b" strokeWidth={3} />
            <text x={mid(0, m, 38)[0]} y={mid(0, m, 38)[1]} fontSize={13} textAnchor="middle" fill="#0369a1">{n(m)}°</text>
            <text x={mid(m, total, 95)[0]} y={mid(m, total, 95)[1]} fontSize={13} textAnchor="middle" fill="#b45309">{n(b)}°</text>
            {total === 90 && <polyline points={`${CX + 14},${CY} ${CX + 14},${CY - 14} ${CX},${CY - 14}`} fill="none" stroke="#475569" strokeWidth={2} />}
          </>
        ) : (
          <>
            <Ray a={m} c="#7c3aed" />
            <path d={arc(0, m, 45)} fill="none" stroke="#0ea5e9" strokeWidth={3} />
            <text x={mid(0, m, 70)[0]} y={mid(0, m, 70)[1]} fontSize={13} textAnchor="middle" fill="#0369a1">{n(m)}°</text>
            {m === 90 && <polyline points={`${CX + 14},${CY} ${CX + 14},${CY - 14} ${CX},${CY - 14}`} fill="none" stroke="#475569" strokeWidth={2} />}
          </>
        )}
        <circle cx={CX} cy={CY} r={4} fill="#1e293b" />
      </svg>
      <input
        type="range" min={5} max={sum ? total - 5 : 180} step={1} value={m}
        onChange={(e) => move(Number(e.target.value))} style={{ width: '100%' }}
      />
      {sum ? (
        <>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            {n(m)}° + {n(b)}° = <b>{n(total)}°</b> → زاويتان <b>{total === 90 ? 'متتامتان' : 'متكاملتان'}</b>
          </div>
          {seen.length < 4 ? (
            <div style={{ textAlign: 'center' }}>جرّبي ٤ قياسات مختلفة 🎚️ ({n(Math.min(seen.length, 4))} من ٤)</div>
          ) : (
            <>
              <div className="fb ok">لاحظتِ؟ مهما حرّكتِ، المجموع ثابت: {n(total)}° ✨</div>
              <button className="btn" onClick={onDone}>تمام ✅</button>
            </>
          )}
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            القياس الآن: <b>{n(m)}°</b> ← {kindAr[kindOf(m)]}
          </div>
          {msg && <div className={ok ? 'fb ok' : 'fb no'}>{msg}</div>}
          {ok ? <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'التالي ➡️'}</button> : <button className="btn" onClick={check}>تحقّقي ✔️</button>}
        </>
      )}
    </div>
  )
}