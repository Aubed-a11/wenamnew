import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, MapPin, Ticket } from 'lucide-react'
import { useT } from '../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../store/miawezon'
import { MZ_ASSETS } from '../../data/miawezon'
import { MzLogo, MzTitle } from './ui'
import { eventInfo } from './utils'

// Banniere MIAWÉZON affichee sur la page d'accueil
export default function MiawezonBanner() {
  const { t, pick, lang } = useT()
  const { data, load } = useMiawezon()

  useEffect(() => { load() }, [load])

  if (!isMiawezonVisible(data)) return null
  const ev = data.event
  const info = eventInfo(ev, { t, pick, lang })
  const open = ev.salesState === 'open'

  return (
    <section className="px-4 md:px-5 -mt-6 md:-mt-10 relative z-10 mb-4" aria-label="MIAWÉZON">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-[1280px] mx-auto rounded-2xl overflow-hidden bg-mz-night border-2 border-mz-gold/60 shadow-hover grid md:grid-cols-[1.1fr_1.2fr_1fr]"
      >
        <div className="flex items-center gap-4 p-5 md:p-7">
          <MzTitle height={60} variant="gold" />
        </div>

        <div className="px-5 pb-5 md:py-7 md:px-2 flex flex-col justify-center gap-3">
          <p className="text-white/90 text-sm md:text-base leading-snug">{t('mz.punch')}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mz-gold-light/80">
            <span className="inline-flex items-center gap-1.5">
              {open ? <Ticket size={14} className="text-mz-gold" /> : <CalendarDays size={14} className="text-mz-gold" />}
              {open ? t('mz.bannerOpen') : (info.date !== t('common.tbc') ? info.date : t('mz.soon'))}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-mz-gold" />
              {info.venue === t('common.tbc') ? `${t('mz.venue')} ${t('common.tbc').toLowerCase()}` : info.venue}
            </span>
          </div>
          <Link
            to="/miawezon"
            className="self-start inline-flex items-center gap-2 rounded-full border border-mz-gold text-mz-gold px-5 py-2 text-sm font-semibold hover:bg-mz-gold hover:text-mz-night transition"
          >
            {open ? t('mz.book') : t('mz.bannerCta')} <ChevronRight size={16} />
          </Link>
        </div>

        <div className="relative hidden md:block min-h-[180px]">
          <img src={MZ_ASSETS.homeBanner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-mz-night via-mz-night/30 to-transparent" />
        </div>
      </motion.div>
    </section>
  )
}
