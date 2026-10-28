import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Loader2 } from 'lucide-react'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { MZ_ASSETS, MZ_CONCEPT, MZ_GALLERY, MZ_VALUES, MZ_WHY } from '../../../data/miawezon'
import {
  CountdownBoxes, InfoRow, MzIcon, MzLogo, MzTitle, NotifyForm, PreviewNotice,
} from '../../../components/miawezon/ui'
import { eventInfo, useCountdown } from '../../../components/miawezon/utils'
import { TicketOffer } from '../../../components/miawezon/TicketArt'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

export function SectionTitle({ children, light = false, className = '' }) {
  return (
    <div className={className}>
      <h2 className={`font-display text-2xl md:text-3xl font-bold ${light ? 'text-mz-gold' : 'text-text-dark'}`}>{children}</h2>
    </div>
  )
}

export function MzUnavailable() {
  const { t } = useT()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-5">
        <MzLogo height={72} variant="dark" />
        <p className="text-text-medium max-w-md">{t('mz.unavailable')}</p>
        <Link to="/" className="btn-primary">{t('nav.home')}</Link>
      </div>
      <Footer />
    </div>
  )
}

export function MzLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-32"><Loader2 className="animate-spin text-primary" size={32} /></div>
    </div>
  )
}

function OpeningWatcher({ target, offset }) {
  const load = useMiawezon((s) => s.load)
  const c = useCountdown(target, offset)
  const fired = useRef(false)
  useEffect(() => {
    if (c.done && !fired.current) { fired.current = true; load(true) }
  }, [c.done, load])
  return null
}

export default function MiawezonPage() {
  const { t, pick, lang } = useT()
  const { data, loading, load, offset } = useMiawezon()
  const location = useLocation()

  useEffect(() => { load() }, [load])

  // Defilement vers #billetterie (liens depuis le menu ou la reservation)
  const ready = Boolean(data)
  useEffect(() => {
    if (!ready || !location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }, [ready, location.hash])

  if (!data && loading) return <MzLoading />
  if (!data) return <MzLoading />
  if (!isMiawezonVisible(data)) return <MzUnavailable />

  const ev = data.event
  const info = eventInfo(ev, { t, pick, lang })
  const state = ev.salesState

  return (
    <div className="min-h-screen bg-mz-ivory font-body">
      <Navbar />
      <PreviewNotice data={data} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-mz-night">
        <img src={MZ_ASSETS.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-mz-night via-mz-night/85 to-mz-night/20" />
        <div className="relative max-w-[1280px] mx-auto px-5 py-14 md:py-20">
          <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }} className="max-w-2xl">
            <MzTitle height="clamp(72px, 9vw, 120px)" variant="gold" />
            <p className="font-script text-mz-gold-light text-2xl md:text-[34px] leading-snug mt-6 md:mt-8 max-w-xl">{t('mz.punch')}</p>
            <InfoRow info={info} className="mt-8" />
          </motion.div>
        </div>
      </section>

      {/* CONCEPT */}
      <section className="max-w-[1280px] mx-auto px-5 py-14 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <SectionTitle>{t('mz.conceptTitle')}</SectionTitle>
          <p className="mt-5 text-text-medium leading-relaxed max-w-xl">{pick(MZ_CONCEPT)}</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MZ_VALUES.map((v) => (
              <div key={v.label.fr} className="flex flex-col items-start gap-2">
                <MzIcon name={v.icon} size={24} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
                <span className="text-xs text-text-medium leading-snug">{pick(v.label)}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow-hover aspect-[16/10] bg-mz-night">
          {MZ_ASSETS.conceptVideo ? (
            <video src={MZ_ASSETS.conceptVideo} poster={MZ_ASSETS.concept} controls playsInline preload="none" className="w-full h-full object-cover" />
          ) : (
            <img src={MZ_ASSETS.concept} alt="" className="w-full h-full object-cover" />
          )}
        </motion.div>
      </section>

      {/* GALERIE */}
      <section className="max-w-[1280px] mx-auto px-5 pb-12">
        <SectionTitle>{t('mz.galleryTitle')}</SectionTitle>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {MZ_GALLERY.map((g, i) => (
            <motion.div
              key={g.src}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl overflow-hidden aspect-[4/3] bg-cream-warm ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <img src={g.src} alt={pick(g.alt)} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* INFOS + MENU */}
      <section className="max-w-[1280px] mx-auto px-5 pb-14">
        <div className="rounded-2xl bg-cream-dark border border-border px-5 py-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <InfoRow info={info} dark={false} />
          <Link to="/miawezon/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-7 py-3 text-sm font-semibold hover:bg-primary-dark transition shadow-btn">
            {t('mz.seeMenu')} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* BILLETTERIE */}
      <section id="billetterie" className="relative bg-mz-night scroll-mt-20">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #D9A441 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative max-w-[1280px] mx-auto px-5 py-14">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-mz-gold">{t('mz.ticketing')}</h2>
          </div>
          <p className="mt-3 text-white/75 text-sm md:text-base max-w-2xl">
            {state === 'closed' ? t('mz.closedText') : t('mz.ticketingSub')}
          </p>

          <div className="mt-8 grid xl:grid-cols-2 gap-6">
            {data.categories.map((c) => <TicketOffer key={c._id} cat={c} state={state} info={info} notch="#8B3A0F" />)}
          </div>

          {state === 'upcoming' && (
            <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-center gap-5">
              <OpeningWatcher target={ev.salesOpenAt} offset={offset} />
              <p className="text-white/85 text-sm font-semibold text-center">{t('mz.openingIn')}</p>
              <CountdownBoxes target={ev.salesOpenAt} offset={offset} className="justify-center" />
              <div className="flex justify-center"><NotifyForm /></div>
            </div>
          )}
        </div>
      </section>

      {/* POURQUOI PARTICIPER */}
      <section className="max-w-[1280px] mx-auto px-5 py-14">
        <SectionTitle>{t('mz.whyTitle')}</SectionTitle>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {MZ_WHY.map((w) => (
            <div key={w.label.fr} className="flex flex-col items-center text-center gap-3">
              <MzIcon name={w.icon} size={30} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold text-text-medium">{pick(w.label)}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
