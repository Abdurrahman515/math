import '@fontsource/tajawal/arabic-400.css'
import '@fontsource/tajawal/arabic-700.css'
import '@fontsource/tajawal/arabic-800.css'
import { toArabicDigits } from './arabicDigits'

/** الاختبارات التي تُمنح عنها شهادة */
const CERT_IDS = new Set(['mid', 'final', 'mid2', 'year'])
export const hasCertificate = (examId: string) => CERT_IDS.has(examId)

const NAME_KEY = 'math-app:name'
export const getSavedName = () => {
  try { return localStorage.getItem(NAME_KEY) ?? '' } catch { return '' }
}
export const saveName = (n: string) => {
  try { localStorage.setItem(NAME_KEY, n) } catch { /* تجاهل */ }
}

const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
const dateAr = (d: Date) => toArabicDigits(`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}م`)

const PAL = ['#ec4899', '#f9a8d4', '#a78bfa', '#fbbf24', '#34d399', '#60a5fa']
const FONT = (w: number | string, s: number) => `${w} ${s}px Tajawal, "Noto Sans Arabic", Tahoma, sans-serif`

function lcg(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
}

function star(g: CanvasRenderingContext2D, x: number, y: number, R: number, r: number) {
  g.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r : R
    g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a))
  }
  g.closePath()
}

function flower(g: CanvasRenderingContext2D, x: number, y: number, R: number) {
  for (let i = 0; i < 8; i++) {
    g.save()
    g.translate(x, y)
    g.rotate((i * Math.PI) / 4)
    g.fillStyle = i % 2 ? '#f9a8d4' : '#ec4899'
    g.beginPath()
    g.ellipse(0, -R * 0.62, R * 0.28, R * 0.45, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
  g.fillStyle = '#fbbf24'
  g.beginPath(); g.arc(x, y, R * 0.28, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#fff7ed'
  g.beginPath(); g.arc(x, y, R * 0.12, 0, Math.PI * 2); g.fill()
}

function text(g: CanvasRenderingContext2D, t: string, y: number, maxW: number, size: number, weight: number | string, color: string) {
  let s = size
  g.font = FONT(weight, s)
  while (g.measureText(t).width > maxW && s > 28) { s -= 4; g.font = FONT(weight, s) }
  g.fillStyle = color
  g.fillText(t, 1485, y)
}

async function draw(name: string, examTitle: string, date: Date) {
  await Promise.all([400, 700, 800].map((w) => document.fonts.load(FONT(w, 40), 'اختبار الرياضيات')))
  await document.fonts.ready

  const W = 2970, H = 2100
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')!
  g.direction = 'rtl'
  g.textAlign = 'center'
  g.textBaseline = 'middle'

  // الخلفية
  const bg = g.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#fff7fb'); bg.addColorStop(0.5, '#ffeaf4'); bg.addColorStop(1, '#fff1f7')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)

  // قصاصات ملوّنة في الأطراف
  const rnd = lcg(7)
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W, y = rnd() * H
    if (x > 330 && x < W - 330 && y > 330 && y < H - 330) continue
    g.save()
    g.globalAlpha = 0.55
    g.fillStyle = PAL[Math.floor(rnd() * PAL.length)]
    g.translate(x, y)
    g.rotate(rnd() * Math.PI)
    if (rnd() > 0.5) { g.beginPath(); g.arc(0, 0, 8 + rnd() * 14, 0, Math.PI * 2); g.fill() }
    else g.fillRect(-14, -6, 28 + rnd() * 16, 12)
    g.restore()
  }

  // الإطار
  g.lineWidth = 22; g.strokeStyle = '#ec4899'
  g.beginPath(); g.roundRect(60, 60, W - 120, H - 120, 60); g.stroke()
  g.lineWidth = 7; g.strokeStyle = '#f9a8d4'
  g.beginPath(); g.roundRect(115, 115, W - 230, H - 230, 40); g.stroke()
  g.lineWidth = 4; g.strokeStyle = '#a78bfa'; g.setLineDash([4, 22]); g.lineCap = 'round'
  g.beginPath(); g.roundRect(145, 145, W - 290, H - 290, 30); g.stroke()
  g.setLineDash([])

  // زهور الزوايا
  for (const [x, y] of [[200, 200], [W - 200, 200], [200, H - 200], [W - 200, H - 200]]) flower(g, x, y, 105)

  // الميدالية
  const mx = 1485, my = 340
  g.fillStyle = '#f472b6'
  g.beginPath(); g.moveTo(mx - 90, my + 60); g.lineTo(mx - 160, my + 230); g.lineTo(mx - 90, my + 195); g.lineTo(mx - 30, my + 240); g.lineTo(mx - 10, my + 90); g.fill()
  g.fillStyle = '#c084fc'
  g.beginPath(); g.moveTo(mx + 90, my + 60); g.lineTo(mx + 160, my + 230); g.lineTo(mx + 90, my + 195); g.lineTo(mx + 30, my + 240); g.lineTo(mx + 10, my + 90); g.fill()
  const gold = g.createRadialGradient(mx, my - 20, 20, mx, my, 130)
  gold.addColorStop(0, '#fde68a'); gold.addColorStop(1, '#f59e0b')
  g.fillStyle = gold
  g.beginPath(); g.arc(mx, my, 125, 0, Math.PI * 2); g.fill()
  g.lineWidth = 10; g.strokeStyle = '#fff7ed'; g.beginPath(); g.arc(mx, my, 104, 0, Math.PI * 2); g.stroke()
  star(g, mx, my, 70, 30); g.fillStyle = '#ec4899'; g.fill()

  // النصوص
  text(g, 'شهادة شكر وتقدير', 640, 2100, 200, 800, '#be185d')
  text(g, 'تتقدّم أسرة تطبيق رياضيات الصف الأول المتوسط بجزيل الشكر والتقدير إلى الطالبة المتميّزة', 800, 2300, 64, 400, '#6b2146')

  text(g, name, 1010, 2000, 210, 800, '#db2777')
  const ln = g.createLinearGradient(700, 0, 2270, 0)
  ln.addColorStop(0, '#fbcfe8'); ln.addColorStop(0.5, '#ec4899'); ln.addColorStop(1, '#fbcfe8')
  g.strokeStyle = ln; g.lineWidth = 8; g.lineCap = 'round'
  g.beginPath(); g.moveTo(700, 1140); g.lineTo(2270, 1140); g.stroke()

  text(g, 'لاجتيازها بنجاح', 1250, 2300, 64, 400, '#6b2146')
  text(g, examTitle, 1370, 2300, 100, 800, '#7c3aed')
  text(g, 'وذلك لجدّها واجتهادها وحسن أدائها في مادة الرياضيات للصف الأول المتوسط', 1500, 2300, 64, 400, '#6b2146')
  text(g, 'نسأل الله لها دوام التوفيق والنجاح والتميّز', 1610, 2300, 64, 700, '#be185d')

  text(g, `التاريخ: ${dateAr(date)}`, 1830, 1200, 56, 700, '#9d174d')
  return c
}

/** يرسم الشهادة ويحفظها ملف PDF أفقياً بحجم A4 */
export async function downloadCertificate(name: string, examTitle: string) {
  const canvas = await draw(name.trim(), examTitle, new Date())
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 297, 210)
  pdf.save('شهادة-شكر-وتقدير.pdf')
}