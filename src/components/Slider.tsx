import { toArabicDigits as ad } from '../lib/arabicDigits'

export function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <label style={{ display: 'block', margin: '6px 0' }}>
      {label}: <b>{ad(String(value))}</b>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </label>
  )
}