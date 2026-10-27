import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Camera, CameraOff, CheckCircle2, ChevronLeft, Keyboard, Loader2, XCircle } from 'lucide-react'
import api from '../../../api/axios'

const RESULT = {
  valid: { label: 'Valide', sub: 'Entrée autorisée', cls: 'bg-green-600', icon: CheckCircle2 },
  already_used: { label: 'Déjà utilisé', sub: 'Ce billet a déjà été scanné', cls: 'bg-amber-500', icon: AlertTriangle },
  cancelled: { label: 'Billet annulé', sub: 'Entrée refusée', cls: 'bg-red-600', icon: XCircle },
  invalid: { label: 'Billet invalide', sub: 'QR code inconnu', cls: 'bg-red-600', icon: XCircle },
  error: { label: 'Erreur', sub: 'Vérifiez la connexion internet', cls: 'bg-stone-600', icon: AlertTriangle },
}

const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '')

export default function CheckinPage() {
  const [counts, setCounts] = useState({ total: 0, checkedIn: 0 })
  const [result, setResult] = useState(null)
  const [camera, setCamera] = useState('off') // off | starting | on | error
  const [camError, setCamError] = useState('')
  const [manual, setManual] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState([])
  const scanner = useRef(null)
  const lastScan = useRef({ code: '', at: 0 })
  const processing = useRef(false)

  useEffect(() => {
    api.get('/miawezon/admin/checkin').then(({ data }) => setCounts(data)).catch(() => {})
  }, [])

  const check = useCallback(async (code) => {
    if (processing.current) return
    processing.current = true
    setBusy(true)
    try {
      const { data } = await api.post('/miawezon/admin/checkin', { code })
      setResult(data)
      setCounts({ total: data.total, checkedIn: data.checkedIn })
      setHistory((h) => [{ at: new Date(), ...data }, ...h].slice(0, 8))
      try { navigator.vibrate?.(data.result === 'valid' ? 120 : [80, 60, 80]) } catch { /* non supporte */ }
    } catch (e) {
      setResult({ result: e?.response?.data?.result || 'error', ticket: null })
    } finally {
      setBusy(false)
      setTimeout(() => { processing.current = false }, 1200)
    }
  }, [])

  const stopCamera = useCallback(async () => {
    const s = scanner.current
    scanner.current = null
    if (s) { try { await s.stop(); s.clear() } catch { /* deja arrete */ } }
    setCamera('off')
  }, [])

  const startCamera = async () => {
    setCamera('starting')
    setCamError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const s = new Html5Qrcode('mz-reader', { verbose: false })
      scanner.current = s
      await s.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: (w, h) => { const m = Math.floor(Math.min(w, h) * 0.7); return { width: m, height: m } } },
        (text) => {
          const now = Date.now()
          if (text === lastScan.current.code && now - lastScan.current.at < 4000) return
          lastScan.current = { code: text, at: now }
          check(text)
        },
        () => {}
      )
      setCamera('on')
    } catch (e) {
      scanner.current = null
      setCamera('error')
      setCamError(String(e?.message || e).includes('Permission') ? 'Autorisez l\'accès à la caméra dans votre navigateur.' : 'Caméra indisponible sur cet appareil. Utilisez la saisie manuelle.')
    }
  }

  useEffect(() => () => { stopCamera() }, [stopCamera])

  const R = result ? RESULT[result.result] || RESULT.error : null
  const Icon = R?.icon

  return (
    <div className="font-body max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/admin/miawezon" className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary"><ChevronLeft size={16} /> MIAWÉZON</Link>
        <div className="rounded-xl bg-mz-night text-white px-4 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wider text-mz-gold-light/70">Compteur d'entrées</p>
          <p className="font-display text-xl font-bold text-mz-gold leading-tight">{counts.checkedIn} / {counts.total}</p>
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-text-dark mb-3">Contrôle du jour J</h2>

      <div className="relative rounded-2xl overflow-hidden bg-mz-night aspect-square">
        <div id="mz-reader" className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />
        {camera !== 'on' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            {camera === 'starting' ? <Loader2 className="animate-spin text-mz-gold" size={32} /> : <Camera className="text-mz-gold" size={40} />}
            {camError && <p className="text-sm text-white/80 max-w-xs">{camError}</p>}
            {camera !== 'starting' && (
              <button onClick={startCamera} className="rounded-xl bg-primary text-white px-5 py-3 font-semibold">Activer la caméra</button>
            )}
          </div>
        )}

        {R && (
          <button
            type="button"
            onClick={() => setResult(null)}
            className={`absolute inset-x-3 bottom-3 rounded-2xl ${R.cls} text-white p-4 text-left shadow-hover`}
            aria-live="assertive"
          >
            <div className="flex items-center gap-3">
              <Icon size={38} className="shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold leading-none">{R.label}</p>
                <p className="text-sm text-white/90 mt-1">{R.sub}{result.result === 'already_used' && result.ticket?.checkedInAt ? ` à ${fmtTime(result.ticket.checkedInAt)}` : ''}</p>
                {result.ticket && (
                  <p className="text-sm font-bold mt-1 truncate">{result.ticket.holderName} · {result.ticket.categoryName}{result.ticket.categoryCode === 'AGBADJA' ? ' (VIP)' : ''}</p>
                )}
              </div>
            </div>
          </button>
        )}
        {busy && <div className="absolute top-3 right-3"><Loader2 className="animate-spin text-white" /></div>}
      </div>

      {camera === 'on' && (
        <button onClick={stopCamera} className="mt-3 w-full rounded-xl border border-border bg-white py-2.5 text-sm font-semibold text-text-medium inline-flex items-center justify-center gap-2"><CameraOff size={16} /> Arrêter la caméra</button>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (manual.trim()) { check(manual.trim()); setManual('') } }} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Keyboard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Saisir le n° de billet (MZW-2027-0001-1)" className="input !pl-9" autoCapitalize="characters" />
        </div>
        <button disabled={busy || !manual.trim()} className="rounded-xl bg-primary text-white px-5 font-semibold disabled:opacity-50">Vérifier</button>
      </form>

      {history.length > 0 && (
        <div className="mt-5 bg-white rounded-2xl border border-cream-warm">
          <p className="px-4 pt-3 pb-2 text-xs font-bold uppercase tracking-wider text-text-light">Derniers contrôles</p>
          <ul className="divide-y divide-cream-warm text-sm">
            {history.map((h, i) => {
              const r = RESULT[h.result] || RESULT.error
              return (
                <li key={i} className="px-4 py-2 flex items-center justify-between gap-2">
                  <span className="truncate text-text-dark">{h.ticket?.holderName || 'Inconnu'} <span className="text-text-light text-xs">{h.ticket?.number}</span></span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${r.cls}`}>{r.label} · {fmtTime(h.at)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
