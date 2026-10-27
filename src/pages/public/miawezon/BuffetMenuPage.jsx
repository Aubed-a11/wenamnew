import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { MZ_MENU_TIERS, menuFor } from '../../../data/miawezon'
import { PreviewNotice } from '../../../components/miawezon/ui'
import { fmtPrice } from '../../../components/miawezon/utils'
import { MzLoading, MzUnavailable } from './MiawezonPage'

// Carte de menu d'une categorie de billet (ZINLI ou AGBADJA)
function MenuCard({ tier, cat, open }) {
  const { t, pick } = useT()
  const sections = menuFor(tier)
  return (
    <article className="rounded-2xl bg-white border border-border shadow-card overflow-hidden flex flex-col">
      <header className="bg-primary-dark text-cream px-6 py-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-cream/70">{t('menu.menuOf')}</p>
        <h2 className="font-display text-3xl font-bold tracking-wide mt-1">{tier}</h2>
        {cat && <p className="text-sm text-cream/80 mt-1">{pick(cat.label)} · {fmtPrice(cat.price)}</p>}
      </header>

      <div className="px-6 py-6 flex-1 space-y-6">
        {sections.map((s) => (
          <section key={s.key} aria-labelledby={`mz-${tier}-${s.key}`}>
            <h3 id={`mz-${tier}-${s.key}`} className="text-center text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              {t(`menu.${s.key}`)}
            </h3>
            <ul className="space-y-3 text-center">
              {s.items.map((it) => (
                <li key={it.name.fr}>
                  <p className="font-display font-semibold text-text-dark leading-snug">
                    {pick(it.name)}
                    {it.only && <span className="ml-2 align-middle rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">{t('menu.extra')}</span>}
                  </p>
                  {pick(it.desc) && <p className="text-sm text-text-light">{pick(it.desc)}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {cat && (
        <div className="px-6 pb-6">
          {open && cat.available > 0 ? (
            <Link to={`/miawezon/reserver?c=${tier}`} className="block text-center rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark shadow-btn">
              {t('mz.book')} {tier}
            </Link>
          ) : (
            <Link to="/miawezon#billetterie" className="block text-center rounded-xl border border-border py-3 text-sm font-semibold text-text-medium hover:border-primary">
              {t('menu.ctaSoon')}
            </Link>
          )}
        </div>
      )}
    </article>
  )
}

export default function BuffetMenuPage() {
  const { t } = useT()
  const { data, load } = useMiawezon()
  useEffect(() => { load() }, [load])

  if (!data) return <MzLoading />
  if (!isMiawezonVisible(data)) return <MzUnavailable />
  const ev = data.event
  const open = ev.salesState === 'open'
  const byCode = Object.fromEntries(data.categories.map((c) => [c.code, c]))

  return (
    <div className="min-h-screen bg-cream font-body">
      <Navbar />
      <PreviewNotice data={data} />

      <div className="max-w-[1100px] mx-auto px-5 pt-10 pb-16">
        <Link to="/miawezon" className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary mb-6">
          <ChevronLeft size={16} /> {t('mz.backEvent')}
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-dark">{t('menu.title')}</h1>
        <p className="mt-2 text-text-medium max-w-2xl">{t('menu.subtitle')}</p>
        {!ev.menuFinal && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream-warm text-text-medium px-4 py-2 text-sm font-semibold">
            <Clock size={15} className="text-primary" /> {t('menu.soon')}
          </span>
        )}

        <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
          {MZ_MENU_TIERS.map((tier) => <MenuCard key={tier} tier={tier} cat={byCode[tier]} open={open} />)}
        </div>

        <div className="mt-12 text-center">
          <Link to="/miawezon#billetterie" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3 text-sm font-semibold hover:bg-primary-dark shadow-btn">
            {open ? t('menu.cta') : t('menu.ctaSoon')} <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
