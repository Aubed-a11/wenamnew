import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useT } from '../../i18n'
import LAYOUT from '../../data/ticketLayout.json'
import { fmtPrice } from './utils'

// Billets generes a partir des modeles fournis (public/images/miawezon/ticket-*.jpg).
// Les positions des champs sont dans src/data/ticketLayout.json, identiques au PDF du serveur.

const IMG = '/images/miawezon'
const TEMPLATE = { AGBADJA: `${IMG}/ticket-agbadja.jpg`, ZINLI: `${IMG}/ticket-zinli.jpg` }
// Logo MIAWEZON (version doree) dans la case logo du talon
const LOGO = `${IMG}/logo-gold.png`
// Largeur de la partie principale (sans le talon), en pixels du modele
const MAIN_W = 1122
const PAPER = '#F0E4D2'

const layoutFor = (code) => LAYOUT[code] || LAYOUT.ZINLI
const pct = (v, total) => `${(v / total) * 100}%`
const cqw = (v, total) => `${(v / total) * 100}cqw`

// Texte qui se reduit pour tenir dans sa zone (comme sur le PDF)
function FitText({ f, W, H, children }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const fit = () => {
      // Mesure a la taille de base, puis applique la reduction necessaire
      el.style.fontSize = cqw(f.size, W)
      const ratio = el.scrollWidth > el.clientWidth + 1 ? el.clientWidth / el.scrollWidth : 1
      const next = Math.max(0.55, Math.min(1, ratio))
      el.style.fontSize = `calc(${cqw(f.size, W)} * ${next})`
      setScale(next)
    }
    fit()
    document.fonts?.ready?.then(fit).catch(() => {})
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, f.size, W])

  const style = {
    position: 'absolute',
    left: pct(f.x, W),
    top: pct(f.cy, H),
    width: pct(f.w, W),
    transform: 'translateY(-50%)',
    fontFamily: "'Montserrat', 'Lato', sans-serif",
    fontWeight: f.weight || 700,
    fontSize: `calc(${cqw(f.size, W)} * ${scale})`,
    letterSpacing: f.spacing ? cqw(f.spacing, W) : undefined,
    textAlign: f.align || 'left',
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: f.color,
  }
  if (f.gradient) {
    Object.assign(style, {
      backgroundImage: `linear-gradient(180deg, ${f.gradient[0]}, ${f.gradient[1]})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    })
  }
  return <span ref={ref} style={style}>{children}</span>
}

/**
 * Billet dessine sur le modele.
 * values : { price, stubPrice, date, venue, number, holder, purchase } (les champs absents restent vides)
 * main   : n'affiche que la partie principale (sans talon)
 */
export function TemplateTicket({ code, values = {}, qr, main = false, stamp, label }) {
  const L = layoutFor(code)
  const W = L.width
  const H = L.height
  const visibleW = main ? MAIN_W : W
  const keys = main ? ['price', 'date', 'venue'] : Object.keys(L.fields)
  const g = L.logo

  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: `${visibleW} / ${H}`, maxWidth: '100%' }} role="img" aria-label={label}>
      <div className="absolute top-0 left-0 h-full" style={{ width: `${(W / visibleW) * 100}%`, containerType: 'inline-size' }}>
        <img src={TEMPLATE[code] || TEMPLATE.ZINLI} alt="" className="absolute inset-0 w-full h-full select-none" draggable="false" style={{ maxWidth: 'none' }} />
        {keys.map((k) => (values[k] ? <FitText key={k} f={L.fields[k]} W={W} H={H}>{values[k]}</FitText> : null))}
        {!main && qr && (
          <div
            className="absolute"
            style={{ left: pct(L.qr.x, W), top: pct(L.qr.y, H), width: pct(L.qr.size, W), aspectRatio: '1 / 1', background: L.qr.bg || '#FFFFFF', borderRadius: cqw(L.qr.radius || 0, W), padding: cqw(L.qr.pad || 0, W) }}
          >
            <img src={qr} alt="" className="block w-full h-full" style={{ maxWidth: 'none' }} />
          </div>
        )}
        {!main && (
          <div
            className="absolute flex items-center justify-center"
            style={{ left: pct(g.x, W), top: pct(g.y, H), width: pct(g.w, W), height: pct(g.h, H), background: g.bg, borderRadius: cqw(g.radius || 0, W), padding: cqw(g.pad || 0, W) }}
          >
            <img src={LOGO} alt="MIAWÉZON" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        {stamp && (
          <span
            className="absolute left-1/2 top-1/2 font-bold uppercase tracking-widest rounded-lg border-4 px-[2cqw] py-[0.5cqw]"
            style={{ transform: 'translate(-50%, -50%) rotate(-10deg)', fontSize: '5cqw', color: stamp.color, borderColor: stamp.color, background: 'rgba(255,255,255,0.75)', fontFamily: "'Montserrat', sans-serif" }}
          >
            {stamp.text}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Billet en vitrine (billetterie) ────────────────────────────────────────
export function TicketOffer({ cat, state, info }) {
  const { t } = useT()
  const open = state === 'open'
  const soldOut = open && cat.available === 0
  const ratio = cat.capacity ? Math.round((cat.available / cat.capacity) * 100) : 0
  const values = {
    price: fmtPrice(cat.price),
    date: info.time && info.time !== t('common.tbc') && info.dateShort !== t('common.tbc') ? `${info.dateShort} · ${info.time}` : info.dateShort,
    venue: info.venue,
  }

  const btn = 'shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-center'
  let action
  if (state === 'upcoming') action = <span className={`${btn} bg-stone-300 text-stone-600 cursor-not-allowed inline-flex items-center gap-2`}><CalendarDays size={16} /> {t('mz.openingSoon')}</span>
  else if (soldOut) action = <span className={`${btn} bg-stone-300 text-stone-600 cursor-not-allowed`}>{t('mz.soldOut')}</span>
  else if (state === 'closed') action = <span className={`${btn} bg-stone-300 text-stone-600 cursor-not-allowed`}>{t('mz.closed')}</span>
  else action = <Link to={`/miawezon/reserver?c=${cat.code}`} className={`${btn} bg-primary text-white hover:bg-primary-dark shadow-btn`}>{t('mz.book')} · {fmtPrice(cat.price)}</Link>

  return (
    <article className="rounded-2xl overflow-hidden shadow-hover" style={{ background: PAPER }} aria-label={`${t('mz.ticketWord')} ${cat.name}`}>
      <TemplateTicket code={cat.code} values={values} main label={`${t('mz.ticketWord')} ${cat.name}, ${fmtPrice(cat.price)}`} />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 md:px-5">
        <div className="flex-1 min-w-0">
          {open ? (
            <>
              <div className="flex justify-between text-xs text-text-medium mb-1">
                <span>{t('mz.seatsLeft')}</span>
                <span className="font-bold text-text-dark">{cat.available} / {cat.capacity}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${ratio}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-text-medium">{state === 'upcoming' ? t('mz.limited') : t('mz.closedText')}</p>
          )}
        </div>
        {action}
      </div>
    </article>
  )
}

// ─── Billet emis ────────────────────────────────────────────────────────────
export function TicketIssued({ ticket }) {
  const { t } = useT()
  const stamp = ticket.status === 'used'
    ? { text: t('tickets.used'), color: '#B45309' }
    : ticket.status === 'cancelled' ? { text: t('tickets.cancelled'), color: '#B91C1C' } : null

  // Le QR du modele est petit a l'ecran : on le repete en grand dessous pour le scan a l'entree
  const [big, setBig] = useState(false)
  useEffect(() => { setBig(false) }, [ticket._id])

  return (
    <article className="rounded-2xl overflow-hidden shadow-hover" style={{ background: PAPER }}>
      <TemplateTicket code={ticket.categoryCode} values={ticket.fields || {}} qr={ticket.status !== 'cancelled' ? ticket.qr : null} stamp={stamp} label={`${t('mz.ticketWord')} ${ticket.number}`} />
      <div className="flex items-center gap-4 px-4 py-4 md:px-5">
        {ticket.qr && ticket.status !== 'cancelled' && (
          <button type="button" onClick={() => setBig((v) => !v)} className="shrink-0 rounded-xl bg-white p-2 shadow-card" aria-label={t('mz.scanAtEntry')}>
            <img src={ticket.qr} alt={`QR ${ticket.number}`} className={big ? 'w-56 h-56' : 'w-28 h-28 md:w-32 md:h-32'} />
          </button>
        )}
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-text-dark break-all">{ticket.number}</p>
          <p className="text-sm text-text-medium">{ticket.holderName} · {ticket.categoryName}</p>
          <p className="text-xs text-text-light mt-1">{t('mz.scanAtEntry')}</p>
        </div>
      </div>
    </article>
  )
}
