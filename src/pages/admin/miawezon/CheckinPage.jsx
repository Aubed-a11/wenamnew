import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Camera, CameraOff, CheckCircle2, ChevronLeft, CloudOff, Download, Keyboard, Loader2, RefreshCw, Wifi, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../api/axios'

const RESULT = {
  valid: { label: 'Valide', sub: 'Entrée autorisée', cls: 'bg-green-600', icon: CheckCircle2 },
  already_used: { label: 'Déjà utilisé', sub: 'Ce billet a déjà été scanné', cls: 'bg-amber-500', icon: AlertTriangle },
  cancelled: { label: 'Billet annulé', sub: 'Entrée refusée', cls: 'bg-red-600', icon: XCircle },
  invalid: { label: 'Billet invalide', sub: 'QR code inconnu', cls: 'bg-red-600', icon: XCircle },
  error: { label: 'Erreur', sub: 'Vérifiez la connexion internet', cls: 'bg-stone-600', icon: AlertTriangle },
}

// ─── Mode hors ligne ─────────────────────────────────────────────────────────
// La liste des billets payes est gardee sur l'appareil. Si le reseau tombe, le controle
// se fait sur cette liste et les entrees sont envoyees au serveur des que le reseau revient.
const LIST_KEY = 'mz-offline-tickets'
const QUEUE_KEY = 'mz-offline-queue'
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* stockage plein ou bloque */ } }
// Code d'un QR scanne : lien /mz/CODE, ancien lien /miawezon/billet/CODE, MIAWEZON:CODE ou n° de billet
const parseCode = (v) => {
  let raw = String(v || '').trim()
  const m = raw.match(/\/(?:miawezon\/billet|mz)\/([A-Za-z0-9_-]+)/)
  if (m) raw = m[1]
  else if (raw.toUpperCase().startsWith('MIAWEZON:')) raw = raw.slice(9)
  return raw.trim().toUpperCase()
}
const isNetworkError = (e) => !e?.response

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
  const [offline, setOffline] = useState(() => read(LIST_KEY, null))
  const [queue, setQueue] = useState(() => read(QUEUE_KEY, []))
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [syncing, setSyncing] = useState(false)

  // Telecharge la liste des billets pour le mode hors ligne (en conservant les entrees deja faites ici)
  const downloadList = useCallback(async (silent = true) => {
    try {
      const { data } = await api.get('/miawezon/admin/participants', { params: { codes: 1 }, timeout: 15000 })
      const pending = new Set(read(QUEUE_KEY, []).map((q) => q.code))
      const tickets = data.tickets.map((t) => (pending.has(t.code) ? { ...t, status: 'used' } : t))
      const next = { tickets, at: new Date().toISOString() }
      write(LIST_KEY, next)
      setOffline(next)
      if (!silent) toast.success(`Liste hors ligne à jour : ${tickets.length} billet(s)`)
    } catch {
      if (!silent) toast.error('Téléchargement impossible, vérifiez la connexion')
    }
  }, [])

  // Envoie au serveur les entrees enregistrees hors ligne
  const sync = useCallback(async () => {
    const items = read(QUEUE_KEY, [])
    if (!items.length) return
    setSyncing(true)
    let conflicts = 0
    const left = []
    for (const it of items) {
      try {
        const { data } = await api.post('/miawezon/admin/checkin', { code: it.code, offlineAt: it.at }, { timeout: 10000 })
        if (data.result === 'already_used') conflicts += 1
        setCounts({ total: data.total, checkedIn: data.checkedIn })
      } catch (e) {
        if (isNetworkError(e)) left.push(it)
      }
    }
    write(QUEUE_KEY, left)
    setQueue(left)
    setSyncing(false)
    if (items.length > left.length) toast.success(`${items.length - left.length} entrée(s) hors ligne envoyée(s)`)
    if (conflicts) toast.error(`${conflicts} billet(s) avaient déjà été scannés sur un autre appareil`, { duration: 8000 })
  }, [])

  useEffect(() => {
    api.get('/miawezon/admin/checkin').then(({ data }) => setCounts(data)).catch(() => {})
    downloadList()
    sync()
    const up = () => { setOnline(true); sync(); downloadList() }
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    const timer = setInterval(() => { if (navigator.onLine) { sync(); downloadList() } }, 120000)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); clearInterval(timer) }
  }, [downloadList, sync])

  // Controle sur la liste locale quand le serveur est injoignable
  const checkOffline = (text) => {
    const list = read(LIST_KEY, null)
    if (!list) return { result: 'error', ticket: null, offline: true }
    const code = parseCode(text)
    const t = list.tickets.find((x) => x.code === code || x.number === code)
    if (!t) return { result: 'invalid', ticket: null, offline: true }
    const ticket = { number: t.number, holderName: t.holderName, categoryCode: t.categoryCode, categoryName: t.categoryName, checkedInAt: t.checkedInAt }
    if (t.status === 'used') return { result: 'already_used', ticket, offline: true }
    const at = new Date().toISOString()
    t.status = 'used'
    t.checkedInAt = at
    write(LIST_KEY, list)
    setOffline({ ...list })
    const q = [...read(QUEUE_KEY, []), { code: t.code, at }]
    write(QUEUE_KEY, q)
    setQueue(q)
    return { result: 'valid', ticket: { ...ticket, checkedInAt: at }, offline: true }
  }

  const check = useCallback(async (code) => {
    if (processing.current) return
    processing.current = true
    setBusy(true)
    try {
      let data
      try {
        const res = await api.post('/miawezon/admin/checkin', { code }, { timeout: 6000 })
        data = res.data
        setCounts({ total: data.total, checkedIn: data.checkedIn })
        setOnline(true)
        // garde la liste locale a jour
        const list = read(LIST_KEY, null)
        const t = list?.tickets.find((x) => x.number === data.ticket?.number)
        if (t && data.result === 'valid') { t.status = 'used'; t.checkedInAt = new Date().toISOString(); write(LIST_KEY, list) }
      } catch (e) {
        if (!isNetworkError(e)) throw e
        setOnline(false)
        data = checkOffline(code)
      }
      setResult(data)
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

      {/* Etat du mode hors ligne */}
      <div className={`mb-3 rounded-xl border px-3 py-2.5 text-xs flex items-center gap-2 ${online ? 'bg-white border-cream-warm text-text-medium' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
        {online ? <Wifi size={15} className="shrink-0 text-green-600" /> : <CloudOff size={15} className="shrink-0" />}
        <span className="flex-1 min-w-0">
          {online ? 'En ligne' : 'Hors ligne : contrôle sur la liste enregistrée'}
          {offline ? ` · liste de ${offline.tickets.length} billet(s), mise à jour à ${fmtTime(offline.at)}` : ' · liste hors ligne non téléchargée'}
          {queue.length > 0 && <strong> · {queue.length} entrée(s) à envoyer</strong>}
        </span>
        {queue.length > 0 && online && (
          <button onClick={sync} disabled={syncing} className="shrink-0 inline-flex items-center gap-1 font-semibold text-primary disabled:opacity-60">{syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Envoyer</button>
        )}
        <button onClick={() => downloadList(false)} className="shrink-0 inline-flex items-center gap-1 font-semibold text-primary" aria-label="Mettre à jour la liste hors ligne"><Download size={13} /> Liste</button>
      </div>

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
                {result.offline && <p className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1 inline-flex items-center gap-1"><CloudOff size={12} /> Contrôle hors ligne</p>}
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
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Saisir le n° de billet (ex. ZN-000123)" className="input !pl-9" autoCapitalize="characters" />
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
