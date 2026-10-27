import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { MZ_MENU } from '../../../data/miawezon'
import { PatternBand, PreviewNotice } from '../../../components/miawezon/ui'
import { MzLoading, MzUnavailable } from './MiawezonPage'

export default function BuffetMenuPage() {
  const { t, pick } = useT()
  const { data, load } = useMiawezon()
  useEffect(() => { load() }, [load])

  if (!data) return <MzLoading />
  if (!isMiawezonVisible(data)) return <MzUnavailable />
  const ev = data.event
  const open = ev.salesState === 'open'

  return (
    <div className="min-h-screen bg-mz-ivory font-body">
      <Navbar />
      <PreviewNotice data={data} />

      <div className="max-w-[1100px] mx-auto px-5 pt-10 pb-14">
        <Link to="/miawezon" className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary mb-6">
          <ChevronLeft size={16} /> {t('mz.backEvent')}
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-dark">{t('menu.title')}</h1>
        <p className="mt-2 text-text-medium">{t('menu.subtitle')}</p>
        {!ev.menuFinal && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream-warm text-text-medium px-4 py-2 text-sm font-semibold">
            <Clock size={15} className="text-primary" /> {t('menu.soon')}
          </span>
        )}

        <div className="mt-10 space-y-10">
          {MZ_MENU.map((section) => (
            <section key={section.key} aria-labelledby={`mz-${section.key}`}>
              <div className="flex items-baseline justify-between border-b border-border pb-2 mb-5">
                <h2 id={`mz-${section.key}`} className="font-display text-2xl font-bold text-text-dark">{t(`menu.${section.key}`)}</h2>
                <span className="text-sm text-text-light">
                  {section.kind === 'drinks' ? t('menu.drinks', { n: section.items.length }) : t('menu.dishes', { n: section.items.length })}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {section.items.map((it, i) => (
                  <motion.article
                    key={it.name.fr}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl overflow-hidden bg-white border border-border shadow-card"
                  >
                    <div className="aspect-[4/3] bg-cream-warm overflow-hidden">
                      <img src={it.img} alt={pick(it.name)} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-semibold text-text-dark text-sm md:text-base leading-snug">{pick(it.name)}</h3>
                      <p className="text-xs md:text-sm text-text-light mt-0.5">{pick(it.desc)}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/miawezon#billetterie" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3 text-sm font-semibold hover:bg-primary-dark shadow-btn">
            {open ? t('menu.cta') : t('menu.ctaSoon')} <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <PatternBand />
      <Footer />
    </div>
  )
}
