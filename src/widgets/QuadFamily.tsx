import { useState } from 'react'
import type { WidgetProps } from '../types'
import { toArabicDigits as ad } from '../lib/arabicDigits'

type F = { P: boolean; T: boolean; E: boolean; R: boolean }
const nameOf = (f: F) => (f.R && f.E ? 'مربع' : f.R ? 'مستطيل' : f.E ? 'معين' : f.P ? 'متوازي أضلاع' : f.T ? 'شبه منحرف' : 'شكل رباعي')
const SHAPES: Record<string, string> = {
  'مربع': '70,20 130,20 130,80 70,80',
  'مستطيل': '40,30 160,30 160,80 40,80',
  'معين': '100,8 150,50 100,92 50,50',
  'متوازي أضلاع': '60,30 170,30 140,80 30,80',
  'شبه منحرف': '70,30 130,30 170,80 30,80',
  'شكل رباعي': '40,80 70,20 160,35 150,85',
}
const WHY: Record<string, string> = {
  'مربع': 'كل ضلعين متقابلين متوازيين + الأضلاع الأربعة متطابقة + الزوايا الأربع قائمة',
  'مستطيل': 'متوازي أضلاع + زواياه الأربع قائمة',
  'معين': 'متوازي أضلاع + أضلاعه الأربعة متطابقة',
  'متوازي أضلاع': 'كل ضلعين متقابلين متوازيان ومتطابقان',
  'شبه منحرف': 'فيه ضلعان متوازيان فقط',
  'شكل رباعي': 'أربعة أضلاع بلا أي خاصية خاصة',
}
const LABELS: [keyof F, string][] = [
  ['T', 'ضلعان متقابلان متوازيان فقط'],
  ['P', 'كل ضلعين متقابلين متوازيين'],
  ['E', 'الأضلاع الأربعة متطابقة'],
  ['R', 'الزوايا الأربع قائمة'],
]

export default function QuadFamily({ onDone, props }: WidgetProps) {
  const tasks = (props?.tasks as string[] | undefined) ?? ['مربع', 'شبه منحرف', 'معين', 'مستطيل', 'متوازي أضلاع']
  const [s, setS] = useState<F>({ P: false, T: false, E: false, R: false })
  const [i, setI] = useState(0)
  const [ok, setOk] = useState<boolean | null>(null)
  const [msg, setMsg] = useState('')
  const cur = nameOf(s)
  const target = tasks[i]
  const last = i === tasks.length - 1

  const toggle = (k: keyof F) => {
    const f = { ...s }
    if (k === 'P') { f.P = !f.P; if (f.P) f.T = false; else { f.E = false; f.R = false } }
    else if (k === 'T') { f.T = !f.T; if (f.T) { f.P = false; f.E = false; f.R = false } }
    else { f[k] = !f[k]; if (f[k]) { f.P = true; f.T = false } }
    setS(f); setOk(null); setMsg('')
  }
  const check = () => {
    if (cur === target) { setOk(true); setMsg(`برافو! 🎉 ${target}: ${WHY[target]} ✔️`) }
    else { setOk(false); setMsg(`اسم شكلك الآن «${cur}» والمطلوب «${target}» 🔍 ${target}: ${WHY[target]}.`) }
  }
  const next = () => { if (last) onDone(); else { setI(i + 1); setOk(null); setMsg('') } }

  return (
    <div className="card">
      <div className="q-prompt">فعّلي الخصائص لتبني شكلاً اسمه الأدق: <b>{target}</b> 🧱 ({ad(String(i + 1))} من {ad(String(tasks.length))})</div>
      <svg viewBox="0 0 200 100" style={{ width: '70%', display: 'block', margin: '0 auto' }}>
        <polygon points={SHAPES[cur]} fill="#ede9fe" stroke="#7c3aed" strokeWidth={2.5} />
      </svg>
      <div style={{ textAlign: 'center', margin: '6px 0' }}>اسمه الأدق الآن: <b>{cur}</b></div>
      <div>
        {LABELS.map(([k, t]) => (
          <button key={k} className="btn" onClick={() => toggle(k)} style={{ margin: 3, outline: s[k] ? '3px solid #7c3aed' : 'none' }}>
            {s[k] ? '✅' : '⬜'} {t}
          </button>
        ))}
      </div>
      <div style={{ margin: '6px 0', fontSize: 14 }}>
        💡 أي شكل أضلاعه الأربعة متطابقة، أو زواياه الأربع قائمة، لازم يكون «كل ضلعين متقابلين متوازيين» كمان، فبتتفعّل لحالها.
      </div>
      {msg && <div className={ok ? 'fb ok' : 'fb no'}>{msg}</div>}
      {ok ? <button className="btn" onClick={next}>{last ? 'تمام ✅' : 'التالي ➡️'}</button> : <button className="btn" onClick={check}>تحقّقي ✔️</button>}
    </div>
  )
}