import { useState } from 'react'
import { downloadCertificate, getSavedName, saveName } from '../lib/certificate'

export function CertificateBox({ title }: { title: string }) {
  const [name, setName] = useState(getSavedName())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const ok = name.trim().length > 0

  const go = async () => {
    if (!ok || busy) return
    setBusy(true); setErr('')
    try {
      saveName(name.trim())
      await downloadCertificate(name, title)
    } catch {
      setErr('ما قدرنا نجهّز الشهادة، جرّبي مرة تانية.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card center" style={{ marginTop: 14 }}>
      <div style={{ fontSize: '2.2rem' }}>🎓🌸</div>
      <h3 className="h3">شهادتك جاهزة!</h3>
      <p className="mut">اكتبي اسمك وبتنزل الشهادة ملف PDF.</p>
      <input
        className="num" style={{ width: '100%' }} maxLength={40}
        placeholder="اكتبي اسمك هون" value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
      />
      <div className="nextrow">
        <button className="btn big" disabled={!ok || busy} onClick={go}>
          {busy ? 'لحظة...' : 'تحميل الشهادة 📄'}
        </button>
      </div>
      {err && <div className="fb no">{err}</div>}
    </div>
  )
}