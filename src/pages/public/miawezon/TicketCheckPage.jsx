import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Ban, CalendarDays, AlertCircle, Loader2, MapPin, ScanLine, ShieldCheck, Ticket, User } from 'lucide-react'
import api from '../../../api/axios'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT, locale } from '../../../i18n'
import { useAuthStore } from '../../../store'
import { TemplateTicket } from '../../../components/miawezon/TicketArt'

// Page ouverte en scannant le QR code d'un billet avec n'importe quel telephone
const STATUS = {
  valid: { Icon: ShieldCheck, box: 'bg-green-50 border-green-200 text-green-800', icon: 'text-green-600' },
  used: { Icon: AlertCircle, box: 'bg-amber-50 border-amber-200 text-amber-900', icon: 'text-amber-600' },
  cancelled: { Icon: Ban, box: 'bg-red-50 border-red-200 text-red-800', icon: 'text-red-600' },
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon size={18} className="text-primary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-text-light">{label}</p>
        <p className="font-semibold text-text-dark break-words">{value}</p>
      </div>
    </div>
  )
}

export default function TicketCheckPage() {
  const { t, lang } = useT()
  const { code } = useParams()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState(null)
  const [state, setState] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setState('loading')
    api.get(`/miawezon/verify/${encodeURIComponent(code)}`)
      .then(({ data: d }) => { setData(d); setState('ok') })
      .catch(() => setState('notFound'))
  }, [code])

  const checkIn = async () => {
    setBusy(true)
    setMsg('')
    try {
      const { data: r } = await api.post('/miawezon/admin/checkin', { code })
      if (r.result === 'valid') {
        setData((d) => ({ ...d, ticket: { ...d.ticket, status: 'used', checkedInAt: r.ticket?.checkedInAt || new Date().toISOString() } }))
        setMsg(t('verify.checkedNow'))
        try { navigator.vibrate?.(120) } catch { /* non supporte */ }
      } else {
        setMsg(t(`verify.result_${r.result}`))
      }
    } catch {
      setMsg(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const tk = data?.ticket
  const st = STATUS[tk?.status] || STATUS.valid
  const when = (d) => new Date(d).toLocaleString(locale(lang), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  const stamp = tk?.status === 'used'
    ? { text: t('tickets.used'), color: '#B45309' }
    : tk?.status === 'cancelled' ? { text: t('tickets.cancelled'), color: '#B91C1C' } : null

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {state === 'loading' && <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary" size={30} /></div>}

        {state === 'notFound' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <Ban size={36} className="mx-auto text-red-600" />
            <h1 className="font-display text-2xl font-bold text-red-800 mt-3">{t('verify.notFoundTitle')}</h1>
            <p className="text-sm text-red-800/80 mt-2">{t('verify.notFound')}</p>
            <Link to="/miawezon" className="inline-block mt-5 text-sm font-semibold text-primary">{t('mz.backEvent')}</Link>
          </div>
        )}

        {state === 'ok' && tk && (
          <>
            <div className={`rounded-2xl border p-5 flex items-center gap-4 ${st.box}`}>
              <st.Icon size={40} className={`shrink-0 ${st.icon}`} strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold leading-tight">{t(`verify.status_${tk.status}`)}</p>
                <p className="text-sm opacity-80 mt-0.5">
                  {tk.status === 'used' && tk.checkedInAt ? t('verify.usedAt', { date: when(tk.checkedInAt) }) : t(`verify.statusText_${tk.status}`)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl overflow-hidden shadow-hover" style={{ background: '#F0E4D2' }}>
              <TemplateTicket code={tk.categoryCode} values={tk.fields || {}} stamp={stamp} label={`${t('mz.ticketWord')} ${tk.number}`} />
            </div>

            <div className="mt-5 rounded-2xl bg-white border border-border px-5 py-2">
              <Row Icon={User} label={t('tickets.name')} value={tk.holderName} />
              <Row Icon={Ticket} label={t('tickets.category')} value={`${tk.categoryName} · ${tk.number}`} />
              {tk.fields?.date && <Row Icon={CalendarDays} label={t('verify.date')} value={tk.fields.date} />}
              {tk.fields?.venue && <Row Icon={MapPin} label={t('verify.venue')} value={tk.fields.venue} />}
            </div>

            {isAdmin && (
              <div className="mt-5 rounded-2xl bg-white border border-border p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-text-light mb-3">{t('verify.staff')}</p>
                {tk.status === 'valid' ? (
                  <button onClick={checkIn} disabled={busy} className="w-full rounded-xl bg-green-600 text-white py-3.5 font-semibold hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={18} />} {t('verify.checkIn')}
                  </button>
                ) : (
                  <p className="text-sm text-text-medium">{t('verify.noCheckIn')}</p>
                )}
                {msg && <p className="text-sm font-semibold text-text-dark mt-3 text-center">{msg}</p>}
                <Link to="/admin/miawezon/controle" className="block text-center text-sm text-primary font-semibold mt-3">{t('verify.openScanner')}</Link>
              </div>
            )}

            {!isAdmin && tk.status === 'valid' && (
              <p className="text-xs text-text-light text-center mt-5">{t('tickets.showAtEntrance')}</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
