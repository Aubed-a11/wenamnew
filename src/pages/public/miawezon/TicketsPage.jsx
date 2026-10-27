import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock, Download, Loader2, MapPin, MessageCircle, Ticket } from 'lucide-react'
import api from '../../../api/axios'
import Navbar from '../../../components/common/Navbar'
import Footer from '../../../components/common/Footer'
import { useT } from '../../../i18n'
import { useMiawezon } from '../../../store/miawezon'
import { MzLogo, PatternBand } from '../../../components/miawezon/ui'
import { eventInfo } from '../../../components/miawezon/utils'
import { pdfUrl, ticketsUrl, whatsappUrl } from './BookingPage'

function TicketVisual({ ticket, info }) {
  const { t } = useT()
  const inactive = ticket.status !== 'valid'
  return (
    <article className="relative rounded-2xl bg-mz-night text-white overflow-hidden border-2 border-mz-gold/70 shadow-hover">
      <div className="absolute inset-2 rounded-xl border border-mz-gold/30 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-center gap-3">
          <MzLogo size={52} />
          <div>
            <p className="font-display text-2xl font-bold text-mz-gold leading-none">MIAWÉZON</p>
            <p className="text-[11px] text-mz-gold-light/80 mt-1">{t('mz.tagline')}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-mz-ivory text-text-dark p-4 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-2.5 min-w-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-light">{t('tickets.ticketNo')}</p>
              <p className="font-display font-bold text-base break-all">{ticket.number}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-light">{t('tickets.name')}</p>
              <p className="font-bold text-sm">{ticket.holderName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-light">{t('tickets.category')}</p>
              <p className="font-bold text-sm">{ticket.categoryName}{ticket.categoryCode === 'AGBADJA' ? ' (VIP)' : ''}</p>
            </div>
          </div>
          <div className="relative">
            {ticket.qr ? (
              <img src={ticket.qr} alt={`QR ${ticket.number}`} className={`w-32 h-32 md:w-36 md:h-36 rounded-lg bg-white p-1 ${inactive ? 'opacity-25' : ''}`} />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-stone-200" />
            )}
            {inactive && (
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold uppercase ${ticket.status === 'used' ? 'text-amber-700' : 'text-red-700'}`}>
                {ticket.status === 'used' ? t('tickets.used') : t('tickets.cancelled')}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/85">
          <p className="flex items-start gap-1.5"><CalendarDays size={13} className="text-mz-gold shrink-0 mt-px" /> {info.date}</p>
          <p className="flex items-start gap-1.5"><MapPin size={13} className="text-mz-gold shrink-0 mt-px" /> {info.venue}</p>
          <p className="flex items-start gap-1.5"><Clock size={13} className="text-mz-gold shrink-0 mt-px" /> {info.time}</p>
        </div>
      </div>
    </article>
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

  const info = eventInfo(data?.event?.published || data?.preview ? data.event : null, { t, pick, lang })

  return (
    <div className="min-h-screen bg-mz-ivory font-body flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-text-dark flex items-center gap-3"><Ticket className="text-primary" /> {t('tickets.title')}</h1>

        {state === 'loading' && <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-primary" size={30} /></div>}
        {state === 'notFound' && <p className="mt-8 rounded-xl bg-white border border-border p-6 text-text-medium">{t('tickets.notFound')}</p>}
        {state === 'pending' && <p className="mt-8 rounded-xl bg-white border border-border p-6 text-text-medium">{t('tickets.pending')}</p>}

        {state === 'ok' && order && (
          <>
            <p className="text-sm text-text-light mt-1">{t('tickets.order')} #{order.orderNumber} · {order.buyer.name}</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
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
            <p className="text-xs text-text-light mt-3">{t('tickets.showAtEntrance')}</p>
            <div className="mt-6 space-y-5">
              {order.tickets.map((tk) => <TicketVisual key={tk._id} ticket={tk} info={info} />)}
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <Link to="/miawezon" className="text-sm text-text-light hover:text-primary">{t('mz.backEvent')}</Link>
        </div>
      </main>
      <PatternBand />
      <Footer />
    </div>
  )
}
