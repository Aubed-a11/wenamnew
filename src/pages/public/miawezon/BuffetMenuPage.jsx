import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { MZ_MENU_TIERS, MZ_TICKET_STYLE, menuFor } from '../../../data/miawezon'
import { MzLogo, PreviewNotice } from '../../../components/miawezon/ui'
import { fmtPrice } from '../../../components/miawezon/utils'
import { MzLoading, MzUnavailable } from './MiawezonPage'

// Deux ambiances de carte, reprises des billets
const THEMES = {
  standard: {
    paper: '#FFFDF8', frame: '#8B3A0F', inner: '#D4B896', title: '#8B3A0F', text: '#1A0F00',
    muted: '#8B6B3D', icon: '#C4531A', iconBg: '#F5ECD7', badgeBg: '#C4531A', badgeText: '#FFFFFF',
  },
  vip: {
    paper: '#1A0F00', frame: '#E8763A', inner: '#5C3D11', title: '#E8763A', text: '#FAF3E8',
    muted: '#D4B896', icon: '#E8763A', iconBg: '#2B1A0C', badgeBg: '#E8763A', badgeText: '#1A0F00',
  },
}
const themeFor = (code) => (MZ_TICKET_STYLE.dark?.includes(code) ? 'vip' : 'standard')

function MenuSheet({ tier, cat, menu }) {
  const { t, pick } = useT()
  const th = THEMES[themeFor(tier)]
  const sections = menuFor(menu, tier)

  return (
    <div className="rounded-[22px] p-2 md:p-3 shadow-hover" style={{ background: th.paper, border: `2px solid ${th.frame}` }}>
      <div className="relative rounded-[16px] px-5 py-8 md:px-12 md:py-12" style={{ border: `1px solid ${th.inner}` }}>

        <header className="text-center">
          <div className="flex justify-center"><MzLogo height={58} variant={themeFor(tier) === 'vip' ? 'gold' : 'dark'} /></div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: th.muted }}>{t('menu.menuOf')}</p>
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-wide leading-none mt-2" style={{ color: th.title }}>{tier}</h2>
          {cat && (
            <p className="mt-3 text-sm md:text-base font-semibold" style={{ color: th.text }}>
              {pick(cat.label)} <span style={{ color: th.muted }}>·</span> {fmtPrice(cat.price)} <span className="font-normal" style={{ color: th.muted }}>{t('mz.perPerson')}</span>
            </p>
          )}
          <p className="font-script text-2xl mt-2" style={{ color: th.icon }}>{pick(MZ_TICKET_STYLE.slogan)}</p>
        </header>

        <div className="mt-10 grid md:grid-cols-2 gap-x-12 gap-y-10">
          {sections.map((s) => {
            return (
              <section key={s.key} aria-labelledby={`mz-${tier}-${s.key}`}>
                <h3 id={`mz-${tier}-${s.key}`} className="font-display text-2xl font-bold text-center mb-5" style={{ color: th.title }}>{t(`menu.${s.key}`)}</h3>
                <ul className="space-y-4">
                  {s.items.map((it, i) => (
                    <li key={`${it.name.fr}-${i}`} className="text-center">
                      <p className="font-display text-lg font-semibold leading-snug" style={{ color: th.text }}>{pick(it.name)}</p>
                      {pick(it.desc) && <p className="text-sm italic mt-0.5" style={{ color: th.muted }}>{pick(it.desc)}</p>}
                      {it.exclusive && (
                        <span className="inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: th.badgeBg, color: th.badgeText }}>
                          {t('menu.exclusiveOf', { tier })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function BuffetMenuPage() {
  const { t, pick } = useT()
  const [params, setParams] = useSearchParams()
  const { data, load } = useMiawezon()
  useEffect(() => { load() }, [load])

  const initial = (params.get('m') || '').toUpperCase()
  const [tier, setTier] = useState(MZ_MENU_TIERS.includes(initial) ? initial : MZ_MENU_TIERS[0])
  const choose = (x) => { setTier(x); setParams({ m: x }, { replace: true }) }

  const menu = data?.event?.menu
  const extras = useMemo(() => {
    // Plats en plus dans les autres menus que celui affiche
    const others = MZ_MENU_TIERS.filter((x) => x !== tier)
    return others.map((o) => {
      const mine = new Set(menuFor(menu, tier).flatMap((s) => s.items.map((i) => i.name.fr)))
      return { tier: o, items: menuFor(menu, o).flatMap((s) => s.items).filter((i) => !mine.has(i.name.fr)) }
    }).filter((x) => x.items.length)
  }, [menu, tier])

  if (!data) return <MzLoading />
  if (!isMiawezonVisible(data)) return <MzUnavailable />
  const ev = data.event
  const open = ev.salesState === 'open'
  const byCode = Object.fromEntries(data.categories.map((c) => [c.code, c]))
  const cat = byCode[tier]

  return (
    <div className="min-h-screen bg-cream font-body">
      <Navbar />
      <PreviewNotice data={data} />

      {/* En-tete */}
      <section className="relative bg-primary-dark text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #FAF3E8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-8 pb-24 md:pb-28 text-center">
          <Link to="/miawezon" className="inline-flex items-center gap-1 text-sm text-cream/75 hover:text-white">
            <ChevronLeft size={16} /> {t('mz.backEvent')}
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-5">{t('menu.title')}</h1>
          <p className="mt-3 text-cream/85 max-w-xl mx-auto">{t('menu.subtitle')}</p>
          {!ev.menuFinal && (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <Clock size={15} /> {t('menu.soon')}
            </span>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-5 -mt-16 md:-mt-20 pb-16 relative">
        {/* Choix du menu */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 rounded-2xl bg-white p-2 shadow-hover border border-border mb-6" role="tablist" aria-label={t('menu.title')}>
          {MZ_MENU_TIERS.map((x) => {
            const active = x === tier
            const c = byCode[x]
            return (
              <button
                key={x}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => choose(x)}
                className={`rounded-xl px-3 py-3 md:py-4 text-center transition ${active ? 'bg-primary text-white shadow-btn' : 'text-text-medium hover:bg-cream'}`}
              >
                <span className="block font-display text-xl md:text-2xl font-bold tracking-wide">{x}</span>
                {c && <span className={`block text-xs md:text-sm ${active ? 'text-white/85' : 'text-text-light'}`}>{pick(c.label)} · {fmtPrice(c.price)}</span>}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tier} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <MenuSheet tier={tier} cat={cat} menu={menu} />
          </motion.div>
        </AnimatePresence>

        {/* Ce que les autres menus ajoutent */}
        {extras.map((x) => (
          <div key={x.tier} className="mt-6 rounded-2xl bg-white border border-border p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg font-bold text-text-dark">{t('menu.moreWith', { tier: x.tier })}</p>
              <p className="text-sm text-text-medium mt-1">{x.items.map((i) => pick(i.name)).join(', ')}</p>
            </div>
            <button type="button" onClick={() => { choose(x.tier); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="shrink-0 rounded-xl border border-primary text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition">
              {t('menu.seeMenu', { tier: x.tier })}
            </button>
          </div>
        ))}

        <div className="mt-8 text-center">
          {open && cat && cat.available > 0 ? (
            <Link to={`/miawezon/reserver?c=${tier}`} className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-8 py-3.5 font-semibold hover:bg-primary-dark shadow-btn">
              {t('mz.book')} {tier} · {fmtPrice(cat.price)} <ChevronRight size={16} />
            </Link>
          ) : (
            <Link to="/miawezon#billetterie" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-8 py-3.5 font-semibold hover:bg-primary-dark shadow-btn">
              {t('menu.ctaSoon')} <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
