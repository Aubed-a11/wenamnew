import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, Check, Clock, MapPin, Loader2, UtensilsCrossed, Users, Drama, PartyPopper, ChefHat, Music, HeartHandshake, Landmark, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useT } from '../../i18n'
import { MZ_ASSETS, MZ_TICKET_PERKS } from '../../data/miawezon'
import { fmtFcfa, fmtShortDate, pad2, useCountdown } from './utils'

// Icones utilisables dans src/data/miawezon.js (ajoutez-les ici si besoin)
const ICONS = { UtensilsCrossed, Users, Drama, PartyPopper, ChefHat, Music, HeartHandshake, Landmark, Sparkles }

export function MzIcon({ name, ...props }) {
  const C = ICONS[name] || Sparkles
  return <C {...props} />
}

// Bande decorative a motif (rappel des tissus, comme sur les maquettes)
export function PatternBand({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`h-3 w-full ${className}`}
      style={{
        backgroundColor: '#C4531A',
        backgroundImage:
          'linear-gradient(135deg, #D9A441 25%, transparent 25%), linear-gradient(225deg, #D9A441 25%, transparent 25%), linear-gradient(45deg, #8B3A0F 25%, transparent 25%), linear-gradient(315deg, #8B3A0F 25%, transparent 25%)',
        backgroundSize: '16px 12px',
        backgroundPosition: '8px 0, 8px 0, 0 0, 0 0',
      }}
    />
  )
}

export function MzLogo({ size = 64, className = '' }) {
  return (
    <img
      src={MZ_ASSETS.logo}
      alt="MIAWÉZON"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
    />
  )
}

export function MzTitle({ size = 'lg', className = '' }) {
  const { t } = useT()
  const cls = size === 'xl' ? 'text-4xl md:text-6xl' : size === 'lg' ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'
  return (
    <div className={className}>
      <p className={`font-display font-bold text-mz-gold leading-none tracking-wide ${cls}`}>MIAWÉZON</p>
      <p className="font-display text-mz-gold-light/90 text-sm md:text-base mt-1.5">{t('mz.tagline')}</p>
    </div>
  )
}

// Ligne Date / Lieu / Heure
export function InfoRow({ info, dark = true, className = '' }) {
  const { t } = useT()
  const items = [
    [CalendarDays, t('mz.date'), info.date],
    [MapPin, t('mz.venue'), info.venue],
    [Clock, t('mz.time'), info.time],
  ]
  return (
    <div className={`flex flex-wrap gap-y-3 ${className}`}>
      {items.map(([Icon, label, value], i) => (
        <div key={label} className={`flex items-center gap-3 pr-5 mr-5 ${i < 2 ? (dark ? 'sm:border-r sm:border-mz-gold/40' : 'sm:border-r sm:border-border') : ''}`}>
          <Icon size={22} className={dark ? 'text-mz-gold' : 'text-primary'} />
          <div className="leading-tight">
            <p className={`text-xs font-bold ${dark ? 'text-mz-gold' : 'text-text-dark'}`}>{label}</p>
            <p className={`text-sm ${dark ? 'text-white/90' : 'text-text-medium'}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PhaseChips({ event, dark = true }) {
  const { t, lang } = useT()
  const phase = event?.phase || 1
  const chips = [
    [1, t('mz.phase1'), fmtShortDate(event?.phase1At, lang)],
    [2, t('mz.phase2'), fmtShortDate(event?.salesOpenAt, lang)],
  ]
  return (
    <div className={`inline-flex rounded-full p-1 ${dark ? 'bg-white/10 border border-white/15' : 'bg-white border border-border'}`}>
      {chips.map(([n, label, date]) => {
        const active = n === phase
        return (
          <span
            key={n}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${active ? 'bg-primary text-white' : dark ? 'text-white/70' : 'text-text-light'}`}
          >
            {label}{date ? ` (${date})` : ''}
          </span>
        )
      })}
    </div>
  )
}

export function CountdownBoxes({ target, offset, dark = false, className = '' }) {
  const { t } = useT()
  const c = useCountdown(target, offset)
  const boxes = [[c.days, t('mz.days')], [pad2(c.hours), t('mz.hours')], [pad2(c.minutes), t('mz.minutes')], [pad2(c.seconds), t('mz.seconds')]]
  return (
    <div className={`flex gap-2 ${className}`} role="timer" aria-live="off">
      {boxes.map(([v, l]) => (
        <div key={l} className={`w-16 md:w-[72px] rounded-xl py-2 text-center shadow-card ${dark ? 'bg-white/10 border border-white/15' : 'bg-white border border-border'}`}>
          <p className={`font-display text-2xl font-bold leading-none ${dark ? 'text-white' : 'text-primary'}`}>{v}</p>
          <p className={`text-[11px] mt-1 ${dark ? 'text-white/60' : 'text-text-light'}`}>{l}</p>
        </div>
      ))}
    </div>
  )
}

export function NotifyForm({ dark = true, compact = false }) {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast.error(t('booking.invalidEmail'))
      return
    }
    setBusy(true)
    try {
      await api.post('/miawezon/waitlist', { email: email.trim(), lang })
      setDone(true)
    } catch {
      toast.error(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <p className={`flex items-center gap-2 text-sm ${dark ? 'text-mz-gold-light' : 'text-secondary'}`}>
        <Check size={16} /> {t('mz.notifyOk')}
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${dark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-primary text-white hover:bg-primary-dark'}`}
      >
        <Bell size={15} /> {t('mz.notifyMe')}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 w-full max-w-md`}>
      <label className="sr-only" htmlFor="mz-notify">{t('mz.notifyTitle')}</label>
      <input
        id="mz-notify"
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('mz.notifyPlaceholder')}
        className="flex-1 rounded-full px-4 py-2.5 text-sm text-text-dark bg-white border border-border focus:outline-none focus:ring-2 focus:ring-mz-gold"
      />
      <button disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 inline-flex items-center justify-center gap-2">
        {busy && <Loader2 size={14} className="animate-spin" />} {t('mz.notifySend')}
      </button>
    </form>
  )
}

// Carte d'une categorie de billet (vitrine et billetterie)
export function TicketCategoryCard({ cat, state }) {
  const { t, pick } = useT()
  const perks = MZ_TICKET_PERKS[cat.code] || []
  const open = state === 'open'
  const soldOut = open && cat.available === 0
  const pct = cat.capacity ? Math.round((cat.available / cat.capacity) * 100) : 0
  const low = open && !soldOut && cat.available <= Math.max(5, Math.ceil(cat.capacity * 0.15))

  let badge = null
  if (state === 'upcoming') badge = t('mz.limited')
  else if (soldOut) badge = t('mz.soldOut')
  else if (low) badge = t('mz.onlyLeft', { n: cat.available })

  return (
    <div className="relative overflow-hidden rounded-2xl bg-mz-ivory border border-mz-gold/40 shadow-card p-5 md:p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-text-dark tracking-wide">{cat.name}</h3>
          <p className="text-sm text-text-light">{pick(cat.label)}</p>
        </div>
        {badge && (
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${soldOut ? 'bg-red-100 text-red-700' : 'bg-cream-warm text-text-medium'}`}>{badge}</span>
        )}
      </div>

      <p className="font-display text-3xl font-bold text-text-dark mt-4">{fmtFcfa(cat.price)}</p>

      {perks.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {perks.map((p) => (
            <li key={p.fr} className="flex items-center gap-2 text-sm text-text-medium">
              <Check size={15} className="text-primary shrink-0" /> {pick(p)}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="mt-5">
          <div className="flex justify-between text-xs text-text-light mb-1">
            <span>{t('mz.seatsLeft')}</span>
            <span className="font-bold text-text-dark">{cat.available} / {cat.capacity}</span>
          </div>
          <div className="h-1.5 rounded-full bg-cream-warm overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="pt-5 mt-auto">
        {state === 'upcoming' && (
          <button disabled className="w-full rounded-xl bg-stone-300/70 text-stone-600 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-not-allowed">
            <CalendarDays size={16} /> {t('mz.openingSoon')}
          </button>
        )}
        {open && !soldOut && (
          <Link to={`/miawezon/reserver?c=${cat.code}`} className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold text-center block hover:bg-primary-dark transition shadow-btn">
            {t('mz.book')}
          </Link>
        )}
        {soldOut && (
          <button disabled className="w-full rounded-xl bg-stone-300/70 text-stone-600 py-3 text-sm font-semibold cursor-not-allowed">{t('mz.soldOut')}</button>
        )}
        {state === 'closed' && (
          <button disabled className="w-full rounded-xl bg-stone-300/70 text-stone-600 py-3 text-sm font-semibold cursor-not-allowed">{t('mz.closed')}</button>
        )}
      </div>
    </div>
  )
}

export function PreviewNotice({ data }) {
  const { t } = useT()
  if (!data?.preview) return null
  return (
    <div className="bg-amber-100 text-amber-900 text-xs md:text-sm text-center px-4 py-2 border-b border-amber-200">
      {t('mz.previewNote')}
    </div>
  )
}
