import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Download, Info, Loader2, Mail, MessageCircle, Phone, QrCode, ShieldCheck, Ticket } from 'lucide-react'
import api from '../../../api/axios'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon } from '../../../store/miawezon'
import { MZ_TICKET_CONDITIONS, MZ_TICKET_STYLE } from '../../../data/miawezon'
import { MzLogo } from '../../../components/miawezon/ui'
import { eventInfo } from '../../../components/miawezon/utils'
import { TicketIssued } from '../../../components/miawezon/TicketArt'
import { pdfUrl, ticketsUrl, whatsappUrl } from './BookingPage'

const CONDITION_ICONS = [QrCode, ShieldCheck, Info, Ticket]

// Verso du billet : remerciements, conditions, contact
function TicketBack({ event }) {
  const { t, pick } = useT()
  return (
    <section className="rounded-[18px] overflow-hidden border border-border bg-cream grid md:grid-cols-[30%_1fr] shadow-card">
      <div className="bg-primary-dark text-cream p-5 flex md:flex-col items-center md:items-start gap-3">
        <div>
          <MzLogo height={46} variant="light" />
          <p className="font-script text-lg mt-3">{t('mz.thanks')}</p>
          <p className="text-xs text-cream/80 mt-1 leading-relaxed hidden md:block">{t('mz.thanksText')}</p>
        </div>
      </div>
      <div className="p-5 grid sm:grid-cols-[1fr_auto] gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">{t('mz.conditionsTitle')}</p>
          <ul className="space-y-1.5">
            {MZ_TICKET_CONDITIONS.map((c, i) => {
              const Icon = CONDITION_ICONS[i % CONDITION_ICONS.length]
              return <li key={c.fr} className="flex items-start gap-2 text-sm text-text-medium"><Icon size={15} className="text-primary shrink-0 mt-0.5" /> {pick(c)}</li>
            })}
          </ul>
        </div>
        {(event?.contactPhone || event?.contactEmail) && (
          <div className="text-sm text-text-medium space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{t('mz.contact')}</p>
            {event.contactPhone && <p className="flex items-center gap-2 select-all"><Phone size={14} className="text-primary" /> {event.contactPhone}</p>}
            {event.contactEmail && <p className="flex items-center gap-2 select-all break-all"><Mail size={14} className="text-primary" /> {event.contactEmail}</p>}
          </div>
        )}
      </div>
      <p className="md:col-span-2 text-center font-script text-primary-dark text-lg pb-3">{pick(MZ_TICKET_STYLE.slogan)}</p>
    </section>
  )
}

export default function TicketsPage() {
  const { t, pick, lang } = useT()
  const { id } = useParams()
  const [params] = useSearchParams()
  const token = params.get('t') || ''
  const { data, load } = useMiawezon()
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get(`/miawezon/orders/${id}`, { params: { t: token } })
      .then(({ data: d }) => { setOrder(d.order); setState(d.order.status === 'paid' ? 'ok' : 'pending') })
      .catch(() => setState('notFound'))
  }, [id, token])

  const visible = data?.event?.published || data?.preview
  const info = eventInfo(visible ? data.event : null, { t, pick, lang })
  const labels = Object.fromEntries((data?.categories || []).map((c) => [c.code, c.label]))
  const prices = Object.fromEntries((order?.items || []).map((i) => [i.code, i.unitPrice]))

  return (
    <div className="min-h-screen bg-cream font-body flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-text-dark flex items-center gap-3"><Ticket className="text-primary" /> {t('tickets.title')}</h1>

        {state === 'loading' && <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary" size={30} /></div>}
        {state === 'notFound' && <p className="mt-8 rounded-xl bg-white border border-border p-6 text-text-medium">{t('tickets.notFound')}</p>}
        {state === 'pending' && <p className="mt-8 rounded-xl bg-white border border-border p-6 text-text-medium">{t('tickets.pending')}</p>}

        {state === 'ok' && order && (
          <>
            <p className="text-sm text-text-light mt-1">{t('tickets.order')} #{order.orderNumber} · {order.buyer.name}</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
              <a href={pdfUrl(order._id, token)} className="flex-1 rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark shadow-btn inline-flex items-center justify-center gap-2">
                <Download size={16} /> {t('tickets.downloadPdf')}
              </a>
              <a
                href={whatsappUrl(t('tickets.waMsg', { name: order.buyer.name, url: ticketsUrl(order._id, token) }))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-border bg-white py-3 text-sm font-semibold text-text-dark hover:border-green-600 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} className="text-green-600" /> {t('tickets.whatsapp')}
              </a>
            </div>
            <div className="mt-6 space-y-6">
              {order.tickets.map((tk) => (
                <TicketIssued key={tk._id} ticket={tk} />
              ))}
              <TicketBack event={visible ? data.event : null} />
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <Link to="/miawezon" className="text-sm text-text-light hover:text-primary">{t('mz.backEvent')}</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
