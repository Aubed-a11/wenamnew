import { Link } from 'react-router-dom'
import { CalendarDays, Check, MapPin, User } from 'lucide-react'
import { useT } from '../../i18n'
import { MZ_TICKET_PERKS, MZ_TICKET_STYLE } from '../../data/miawezon'
import { MzLogo } from './ui'
import { fmtPrice } from './utils'

// Palettes des billets, tirees de la charte Wenam
const THEMES = {
  standard: {
    left: '#8B3A0F', leftText: '#FAF3E8', leftMuted: 'rgba(250,243,232,0.75)',
    body: '#FAF3E8', stub: '#F5ECD7', perf: '#D4B896',
    title: '#8B3A0F', text: '#1A0F00', muted: '#8B6B3D', icon: '#C4531A',
    badgeBg: '#8B3A0F', badgeText: '#FAF3E8', priceBg: '#8B3A0F', priceText: '#FAF3E8',
    border: '#D4B896',
  },
  vip: {
    left: '#1A0F00', leftText: '#FAF3E8', leftMuted: 'rgba(250,243,232,0.7)',
    body: '#1A0F00', stub: '#2B1A0C', perf: 'rgba(212,184,150,0.45)',
    title: '#E8763A', text: '#FAF3E8', muted: '#D4B896', icon: '#E8763A',
    badgeBg: '#E8763A', badgeText: '#1A0F00', priceBg: '#E8763A', priceText: '#1A0F00',
    border: '#8B3A0F',
  },
}

const css = `
  .mzt { position: relative; display: grid; grid-template-columns: 1fr; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 24px rgba(139,58,15,0.18); }
  .mzt-left { padding: 16px 18px; display: flex; align-items: center; gap: 12px; }
  .mzt-left-img { display: none; }
  .mzt-body { padding: 18px 20px; min-width: 0; }
  .mzt-stub { position: relative; padding: 18px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; }
  .mzt-notch { position: absolute; width: 24px; height: 24px; border-radius: 50%; z-index: 2; }
  .mzt-n1 { left: -12px; top: -12px; }
  .mzt-n2 { right: -12px; top: -12px; }
  @media (min-width: 768px) {
    .mzt { grid-template-columns: 30% 1fr 25%; }
    .mzt-left { flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; padding: 20px 14px 0; }
    .mzt-left-img { display: block; align-self: flex-start; margin-top: auto; margin-left: -14px; max-width: none; width: calc(100% + 28px); height: 96px; object-fit: cover; }
    .mzt-stub { padding: 18px 14px; }
    .mzt-n2 { right: auto; left: -12px; top: auto; bottom: -12px; }
  }
`

function Frame({ theme, notch, left, body, stub, label }) {
  const th = THEMES[theme]
  return (
    <article className="mzt font-body" style={{ background: th.body, border: `1px solid ${th.border}` }} aria-label={label}>
      <style>{css}</style>
      <div className="mzt-left" style={{ background: th.left, color: th.leftText }}>{left}</div>
      <div className="mzt-body" style={{ background: th.body, color: th.text }}>{body}</div>
      <div className="mzt-stub" style={{ background: th.stub, color: th.text }}>
        <span className="mzt-notch mzt-n1" style={{ background: notch }} />
        <span className="mzt-notch mzt-n2" style={{ background: notch }} />
        <span aria-hidden="true" className="absolute inset-0 pointer-events-none mzt-perf" style={{ borderColor: th.perf }} />
        {stub}
      </div>
      <style>{`.mzt-perf{border-top:2px dashed}@media(min-width:768px){.mzt-perf{border-top:0;border-left:2px dashed}}`}</style>
    </article>
  )
}

function LeftPanel({ code, th }) {
  const { pick } = useT()
  const img = MZ_TICKET_STYLE.image?.[code]
  return (
    <>
      <MzLogo size={52} />
      <div className="min-w-0">
        <p className="font-display font-bold text-xl md:text-2xl leading-none tracking-wide">MIAWÉZON</p>
        <p className="text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: th.leftMuted }}>{pick(MZ_TICKET_STYLE.subtitle)}</p>
        <p className="font-script text-lg md:text-xl mt-2 md:mt-4" style={{ color: th.leftText }}>{pick(MZ_TICKET_STYLE.slogan)}</p>
      </div>
      {img && <img src={img} alt="" className="mzt-left-img" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
    </>
  )
}

function Head({ code, name, label, th }) {
  const { t, pick } = useT()
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: th.muted }}>{t('mz.ticketWord')}</p>
        <p className="font-display text-3xl md:text-4xl font-bold leading-none tracking-wide mt-1" style={{ color: th.title }}>{name}</p>
        {label && <p className="text-sm font-semibold mt-1" style={{ color: th.muted }}>{label}</p>}
      </div>
      <span className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: th.badgeBg, color: th.badgeText }}>
        {pick(MZ_TICKET_STYLE.access?.[code]) || t('mz.ticketWord')}
      </span>
    </div>
  )
}

function InfoLine({ icon: Icon, children, th }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-snug">
      <Icon size={16} className="shrink-0 mt-0.5" style={{ color: th.icon }} />
      <span className="min-w-0">{children}</span>
    </p>
  )
}

const themeFor = (code) => (MZ_TICKET_STYLE.dark?.includes(code) ? 'vip' : 'standard')

// ─── Billet en vitrine (billetterie) ────────────────────────────────────────
export function TicketOffer({ cat, state, info, notch = '#8B3A0F' }) {
  const { t, pick } = useT()
  const theme = themeFor(cat.code)
  const th = THEMES[theme]
  const perks = MZ_TICKET_PERKS[cat.code] || []
  const open = state === 'open'
  const soldOut = open && cat.available === 0
  const pct = cat.capacity ? Math.round((cat.available / cat.capacity) * 100) : 0

  const btnBase = 'w-full rounded-xl py-2.5 text-sm font-semibold block text-center'
  let action
  if (state === 'upcoming') {
    action = <span className={`${btnBase} cursor-not-allowed`} style={{ background: th.perf, color: th.text, opacity: 0.8 }}>{t('mz.openingSoon')}</span>
  } else if (soldOut) {
    action = <span className={`${btnBase} cursor-not-allowed`} style={{ background: th.perf, color: th.text }}>{t('mz.soldOut')}</span>
  } else if (state === 'closed') {
    action = <span className={`${btnBase} cursor-not-allowed`} style={{ background: th.perf, color: th.text }}>{t('mz.closed')}</span>
  } else {
    action = (
      <Link to={`/miawezon/reserver?c=${cat.code}`} className={`${btnBase} shadow-btn hover:opacity-90 transition`} style={{ background: th.priceBg, color: th.priceText }}>
        {t('mz.book')}
      </Link>
    )
  }

  return (
    <Frame
      theme={theme}
      notch={notch}
      label={`${t('mz.ticketWord')} ${cat.name}`}
      left={<LeftPanel code={cat.code} th={th} />}
      body={(
        <div className="flex flex-col gap-3 h-full">
          <Head code={cat.code} name={cat.name} label={pick(cat.label)} th={th} />
          <div className="space-y-1.5">
            <InfoLine icon={CalendarDays} th={th}>{info.date}{info.time !== t('common.tbc') ? ` · ${info.time}` : ''}</InfoLine>
            <InfoLine icon={MapPin} th={th}>{info.venue}</InfoLine>
          </div>
          {perks.length > 0 && (
            <div className="pt-3 border-t" style={{ borderColor: th.perf }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: th.title }}>{theme === 'vip' ? t('mz.vipPerks') : t('mz.included')}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {perks.map((p) => (
                  <li key={p.fr} className="flex items-center gap-1.5 text-[13px]"><Check size={13} className="shrink-0" style={{ color: th.icon }} /> {pick(p)}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-auto self-start rounded-lg px-4 py-1.5 font-display text-xl font-bold" style={{ background: th.priceBg, color: th.priceText }}>{fmtPrice(cat.price)}</p>
        </div>
      )}
      stub={(
        <>
          {open ? (
            <div className="w-full">
              <p className="text-[11px] uppercase tracking-wider" style={{ color: th.muted }}>{t('mz.seatsLeft')}</p>
              <p className="font-display text-2xl font-bold" style={{ color: th.title }}>{cat.available}<span className="text-sm font-body" style={{ color: th.muted }}> / {cat.capacity}</span></p>
              <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: th.perf }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: th.icon }} />
              </div>
            </div>
          ) : (
            <div>
              <CalendarDays size={26} className="mx-auto" style={{ color: th.icon }} />
              <p className="text-xs mt-2" style={{ color: th.muted }}>{state === 'upcoming' ? t('mz.limited') : t('mz.closed')}</p>
            </div>
          )}
          {action}
        </>
      )}
    />
  )
}

// ─── Billet emis (numerique) ────────────────────────────────────────────────
export function TicketIssued({ ticket, info, price, notch = '#FAF3E8' }) {
  const { t, pick } = useT()
  const theme = themeFor(ticket.categoryCode)
  const th = THEMES[theme]
  const inactive = ticket.status !== 'valid'
  return (
    <Frame
      theme={theme}
      notch={notch}
      label={`${t('mz.ticketWord')} ${ticket.number}`}
      left={<LeftPanel code={ticket.categoryCode} th={th} />}
      body={(
        <div className="flex flex-col gap-3 h-full">
          <Head code={ticket.categoryCode} name={ticket.categoryName} label={ticket.categoryLabel ? pick(ticket.categoryLabel) : ''} th={th} />
          <div className="space-y-1.5">
            <InfoLine icon={CalendarDays} th={th}>{info.date}{info.time !== t('common.tbc') ? ` · ${info.time}` : ''}</InfoLine>
            <InfoLine icon={MapPin} th={th}>{info.venue}</InfoLine>
            <InfoLine icon={User} th={th}>
              <span style={{ color: th.muted }}>{t('tickets.name')} : </span><strong>{ticket.holderName}</strong>
              <br /><span style={{ color: th.muted }}>{t('tickets.ticketNo')} : </span>{ticket.number}
            </InfoLine>
          </div>
          {price != null && (
            <p className="mt-auto self-start rounded-lg px-4 py-1.5 font-display text-xl font-bold" style={{ background: th.priceBg, color: th.priceText }}>{fmtPrice(price)}</p>
          )}
        </div>
      )}
      stub={(
        <>
          <div className="relative">
            {ticket.qr ? (
              <img src={ticket.qr} alt={`QR ${ticket.number}`} className={`w-32 h-32 rounded-lg bg-white p-1.5 ${inactive ? 'opacity-25' : ''}`} />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-white/60" />
            )}
            {inactive && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase" style={{ color: ticket.status === 'used' ? '#B45309' : '#B91C1C' }}>
                {ticket.status === 'used' ? t('tickets.used') : t('tickets.cancelled')}
              </span>
            )}
          </div>
          <p className="font-bold text-sm tracking-wide">{ticket.number}</p>
          <p className="text-[11px] leading-snug" style={{ color: th.muted }}>{t('mz.scanAtEntry')}</p>
        </>
      )}
    />
  )
}
