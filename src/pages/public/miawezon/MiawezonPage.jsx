import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Loader2 } from 'lucide-react'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { MZ_ASSETS, MZ_AUDIENCE, MZ_CONCEPT, MZ_EXPERIENCE, MZ_GALLERY, MZ_SIGNATURE, MZ_STORY, MZ_VALUES, MZ_WHY } from '../../../data/miawezon'
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
      <section className="max-w-[1280px] mx-auto px-5 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <SectionTitle>{t('mz.conceptTitle')}</SectionTitle>
          <p className="mt-5 font-display italic text-2xl md:text-3xl leading-snug text-primary-dark">« {pick(MZ_SIGNATURE)} »</p>
          <p className="mt-5 text-text-medium leading-relaxed max-w-xl">{pick(MZ_CONCEPT)}</p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 max-w-xl">
            {MZ_VALUES.map((v) => (
              <div key={v.label.fr} className="flex items-start gap-3">
                <MzIcon name={v.icon} size={22} strokeWidth={1.75} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm font-semibold text-text-dark leading-snug">{pick(v.label)}</span>
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

      {/* CE QUI VOUS ATTEND */}
      <section className="bg-cream-dark/60 border-y border-border">
        <div className="max-w-[1280px] mx-auto px-5 py-14 md:py-16">
          <SectionTitle>{t('mz.experienceTitle')}</SectionTitle>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MZ_EXPERIENCE.map((x, i) => (
              <motion.div key={x.title.fr} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-white border border-border p-5 md:p-6">
                <MzIcon name={x.icon} size={26} strokeWidth={1.6} className="text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-bold text-text-dark">{pick(x.title)}</h3>
                <p className="mt-1.5 text-sm text-text-medium leading-relaxed">{pick(x.text)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-14" />
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

      {/* POUR QUI */}
      <section className="max-w-[1280px] mx-auto px-5 pb-14">
        <div className="rounded-2xl bg-mz-night text-white px-6 py-8 md:px-10 md:py-10 grid lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-10 items-center">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-mz-gold">{t('mz.audienceTitle')}</h2>
            <p className="mt-3 text-white/80 text-sm md:text-base leading-relaxed">{t('mz.audienceSub')}</p>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {MZ_AUDIENCE.map((x) => (
              <li key={x.fr} className="rounded-full border border-mz-gold/50 px-4 py-2 text-sm text-mz-gold-light">{pick(x)}</li>
            ))}
          </ul>
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
            {data.categories.map((c) => <TicketOffer key={c._id} cat={c} state={state} info={info} notch="#3B2410" />)}
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

      {/* POURQUOI MIAWEZON */}
      <section className="max-w-[1280px] mx-auto px-5 py-14 md:py-16">
        <SectionTitle>{t('mz.whyTitle')}</SectionTitle>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MZ_WHY.map((w) => (
            <div key={w.label.fr} className="border-t-2 border-primary pt-4">
              <MzIcon name={w.icon} size={26} strokeWidth={1.6} className="text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold text-text-dark leading-snug">{pick(w.label)}</h3>
              {w.text && <p className="mt-1.5 text-sm text-text-medium leading-relaxed">{pick(w.text)}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* PORTE PAR WENAM */}
      <section className="bg-cream-dark/60 border-t border-border">
        <div className="max-w-[1280px] mx-auto px-5 py-14 md:py-16 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <SectionTitle>{t('mz.storyTitle')}</SectionTitle>
            <p className="mt-5 text-text-medium leading-relaxed max-w-2xl">{pick(MZ_STORY.text)}</p>
            <p className="mt-6 font-script text-3xl md:text-4xl text-primary leading-snug">{pick(MZ_STORY.closing)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {MZ_STORY.facts.map((f) => (
              <div key={f.value + f.label.fr} className="rounded-2xl bg-white border border-border p-5">
                <dt className="sr-only">{pick(f.label)}</dt>
                <dd className="font-display text-3xl md:text-4xl font-bold text-primary-dark">{f.value}</dd>
                <dd className="mt-1 text-sm text-text-medium leading-snug">{pick(f.label)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  )
}
