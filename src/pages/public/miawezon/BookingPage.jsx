import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, Check, CheckCircle2, ChevronLeft, CreditCard, Download, Hourglass, Loader2, Lock, Mail, MessageCircle,
  Minus, Plus, RefreshCw, ShieldCheck, Smartphone, Ticket, Timer, XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../api/axios'
import Navbar from '../../../components/common/Navbar'
import { useT } from '../../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../../store/miawezon'
import { useAuthStore } from '../../../store'
import { MZ_PAYMENT_METHODS } from '../../../data/miawezon'
import { MzLogo, PreviewNotice } from '../../../components/miawezon/ui'
import { apiError, fmtFcfa, pad2, useCountdown } from '../../../components/miawezon/utils'
import { openKkiapay } from '../../../components/miawezon/kkiapay'
import { MzLoading, MzUnavailable } from './MiawezonPage'

const SESSION_KEY = 'mz-booking'
const readSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null } }
const writeSession = (v) => { try { v ? sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)) : sessionStorage.removeItem(SESSION_KEY) } catch { /* navigation privee */ } }

export const pdfUrl = (orderId, token) => `${api.defaults.baseURL}/miawezon/orders/${orderId}/tickets.pdf?t=${token}`
export const ticketsUrl = (orderId, token) => `${window.location.origin}/miawezon/billets/${orderId}?t=${token}`
export const whatsappUrl = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{8,20}$/

function Stepper({ step }) {
  const { t } = useT()
  const labels = t('booking.steps')
  return (
    <ol className="flex items-center justify-between gap-1 mb-6" aria-label={t('booking.title')}>
      {labels.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <li key={label} className="flex-1 flex items-center gap-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-[56px]">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${done ? 'bg-primary border-primary text-white' : active ? 'bg-primary border-primary text-white shadow-btn' : 'bg-white border-border text-text-light'}`}>
                {done ? <Check size={15} /> : n}
              </span>
              <span className={`text-[11px] ${active ? 'text-primary font-bold' : 'text-text-light'}`}>{label}</span>
            </div>
            {n < labels.length && <span className={`flex-1 h-0.5 -mt-5 ${n < step ? 'bg-primary' : 'bg-border'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

function Field({ label, hint, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-text-dark mb-1">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : hint ? <p className="text-xs text-text-light mt-1">{hint}</p> : null}
    </div>
  )
}

function StateCard({ tone, icon: Icon, title, text, children }) {
  const tones = {
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-sky-50 border-sky-200 text-sky-700',
  }
  return (
    <div className="text-center py-6">
      <span className={`mx-auto w-16 h-16 rounded-full border-2 flex items-center justify-center ${tones[tone]}`}>
        <Icon size={30} />
      </span>
      <h2 className="font-display text-2xl font-bold text-text-dark mt-4">{title}</h2>
      <p className="text-sm text-text-medium mt-2 max-w-sm mx-auto leading-relaxed">{text}</p>
      <div className="mt-6 flex flex-col gap-2 max-w-xs mx-auto">{children}</div>
    </div>
  )
}

function HoldTimer({ expiresAt, offset, onExpire }) {
  const { t } = useT()
  const c = useCountdown(expiresAt, offset)
  const fired = useRef(false)
  useEffect(() => {
    if (c.done && expiresAt && !fired.current) { fired.current = true; onExpire() }
  }, [c.done, expiresAt, onExpire])
  const mins = Math.floor(c.total / 60000)
  return (
    <p className={`flex items-center justify-center gap-2 text-xs rounded-lg py-2 ${mins < 3 ? 'bg-red-50 text-red-700' : 'bg-cream-dark text-text-medium'}`}>
      <Timer size={14} /> {t('booking.holdTimer', { time: `${pad2(mins)}:${pad2(c.seconds)}` })}
    </p>
  )
}

export default function BookingPage() {
  const { t, lang, pick } = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data, load, offset } = useMiawezon()
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState(1)
  const [problem, setProblem] = useState(null)
  const [qty, setQty] = useState({})
  const [buyer, setBuyer] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' })
  const [holders, setHolders] = useState([])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [order, setOrder] = useState(null)
  const [token, setToken] = useState(null)
  const [payment, setPayment] = useState(null)
  const [restoring, setRestoring] = useState(true)
  const initialized = useRef(false)

  useEffect(() => { load(true) }, [load])

  const cats = data?.categories || []
  const ev = data?.event
  const max = ev?.maxTicketsPerOrder || 10

  // Preselection depuis ?c=ZINLI
  useEffect(() => {
    if (!cats.length || initialized.current) return
    initialized.current = true
    const code = (params.get('c') || '').toUpperCase()
    const pre = cats.find((c) => c.code === code && c.available > 0)
    if (pre) setQty({ [pre._id]: 1 })
  }, [cats, params])

  // Reprise d'une commande en cours (rechargement de page pendant le paiement)
  useEffect(() => {
    const s = readSession()
    if (!s?.orderId || !s?.token) { setRestoring(false); return }
    api.get(`/miawezon/orders/${s.orderId}`, { params: { t: s.token } })
      .then(({ data: d }) => {
        const o = d.order
        setOrder(o); setToken(s.token); setPayment(s.payment || null)
        setBuyer(o.buyer)
        if (o.status === 'paid') setStep(4)
        else if (o.status === 'pending') setStep(3)
        else if (o.status === 'refund_needed') setProblem('refund')
        else { writeSession(null); setOrder(null); setToken(null); if (o.status === 'expired') setProblem('expired') }
      })
      .catch(() => writeSession(null))
      .finally(() => setRestoring(false))
  }, [])

  // Liste des billets (une ligne par billet) pour les noms
  const lines = useMemo(() => {
    const out = []
    for (const c of cats) for (let i = 0; i < (qty[c._id] || 0); i++) out.push(c)
    return out
  }, [cats, qty])

  const count = lines.length
  const total = lines.reduce((s, c) => s + c.price, 0)

  useEffect(() => {
    setHolders((h) => lines.map((_, i) => h[i] ?? ''))
  }, [lines])

  const changeQty = (c, delta) => {
    setQty((q) => {
      const cur = q[c._id] || 0
      const next = Math.max(0, Math.min(cur + delta, c.available))
      const others = count - cur
      if (others + next > max) {
        toast.error(t('booking.maxPerOrder', { n: max }))
        return q
      }
      return { ...q, [c._id]: next }
    })
  }

  const validateBuyer = () => {
    const e = {}
    if (buyer.name.trim().length < 2) e.name = t('booking.invalidName')
    if (!PHONE_RE.test(buyer.phone.trim())) e.phone = t('booking.invalidPhone')
    if (!EMAIL_RE.test(buyer.email.trim())) e.email = t('booking.invalidEmail')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleApiProblem = (err) => {
    const e = apiError(err)
    if (e.code === 'SOLD_OUT') { setProblem('soldOut'); load(true); return }
    if (e.code === 'SALES_CLOSED' || e.code === 'NOT_PUBLISHED') { setProblem('closed'); return }
    if (e.code === 'PAYMENT_NOT_READY') { setProblem('notReady'); return }
    if (e.code === 'INVALID_PHONE') { setErrors({ phone: t('booking.invalidPhone') }); return }
    if (e.code === 'INVALID_EMAIL') { setErrors({ email: t('booking.invalidEmail') }); return }
    if (e.code === 'TOO_MANY') { toast.error(t('booking.maxPerOrder', { n: max })); return }
    toast.error(e.message || t('common.error'))
  }

  const createOrder = async () => {
    if (!validateBuyer()) return
    setBusy(true)
    try {
      const { data: d } = await api.post('/miawezon/orders', {
        items: cats.filter((c) => qty[c._id] > 0).map((c) => ({ category: c._id, quantity: qty[c._id] })),
        buyer: { name: buyer.name.trim(), phone: buyer.phone.trim(), email: buyer.email.trim() },
        holders: holders.map((h) => h.trim()),
        lang,
      })
      setOrder(d.order); setToken(d.token); setPayment(d.payment)
      writeSession({ orderId: d.order._id, token: d.token, payment: d.payment })
      setStep(3)
    } catch (err) {
      handleApiProblem(err)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (transactionId) => {
    setBusy('verify')
    try {
      const { data: d } = await api.post(`/miawezon/orders/${order._id}/confirm`, { token, transactionId })
      setOrder(d.order)
      setStep(4)
      setProblem(null)
      load(true)
    } catch (err) {
      const e = apiError(err)
      if (e.code === 'PAYMENT_FAILED' || e.code === 'AMOUNT_MISMATCH') setProblem('payFailed')
      else if (e.code === 'SOLD_OUT_AFTER_PAYMENT') setProblem('refund')
      else if (e.code === 'ORDER_CLOSED') { writeSession(null); setProblem('expired') }
      else setProblem('payLater')
    } finally {
      setBusy(false)
    }
  }

  const pay = async () => {
    if (!order) return
    if (payment?.mock) { confirm(`MOCK-${Date.now()}`); return }
    setBusy('widget')
    try {
      await openKkiapay({
        amount: order.total,
        publicKey: payment?.publicKey,
        sandbox: payment?.sandbox,
        name: order.buyer.name,
        email: order.buyer.email,
        phone: order.buyer.phone,
        orderId: order._id,
        onSuccess: (tx) => confirm(tx),
        onFailed: () => { setBusy(false); setProblem('payFailed') },
      })
      // Le widget est ouvert : on libere le bouton (le client peut fermer la fenetre)
      setTimeout(() => setBusy((b) => (b === 'widget' ? false : b)), 1500)
    } catch {
      setBusy(false)
      toast.error(t('common.error'))
    }
  }

  const releaseAndEdit = async () => {
    if (order && token && order.status === 'pending') {
      api.post(`/miawezon/orders/${order._id}/cancel`, { token }).catch(() => {})
    }
    writeSession(null)
    setOrder(null); setToken(null); setProblem(null)
    setStep(1)
    load(true)
  }

  const restart = () => {
    writeSession(null)
    setOrder(null); setToken(null); setProblem(null); setQty({}); setStep(1)
    initialized.current = false
    load(true)
  }

  const onExpire = () => { writeSession(null); setProblem('expired') }

  if (!data || restoring) return <MzLoading />
  if (!isMiawezonVisible(data)) return <MzUnavailable />

  const salesOpen = ev.salesState === 'open'
  const effectiveProblem = problem || (!salesOpen && step < 3 ? 'closed' : null)

  return (
    <div className="min-h-screen bg-mz-ivory font-body">
      <Navbar />
      <PreviewNotice data={data} />

      <div className="max-w-xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-5">
          <Link to="/miawezon#billetterie" className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary">
            <ChevronLeft size={16} /> {t('mz.backEvent')}
          </Link>
          <div className="flex items-center gap-2">
            <MzLogo size={28} />
            <span className="font-display font-bold text-primary-dark">MIAWÉZON</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-card p-5 md:p-7">
          {!effectiveProblem && <Stepper step={step} />}

          <AnimatePresence mode="wait">
            <motion.div key={effectiveProblem || step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>

              {/* ── ETATS D'ERREUR ── */}
              {effectiveProblem === 'payFailed' && (
                <StateCard tone="red" icon={XCircle} title={t('booking.payFailedT')} text={t('booking.payFailedD')}>
                  <button onClick={() => { setProblem(null); setStep(3) }} className="btn-primary normal-case tracking-normal">{t('booking.retry')}</button>
                  <button onClick={releaseAndEdit} className="text-sm text-text-light hover:text-primary py-2">{t('booking.modify')}</button>
                </StateCard>
              )}
              {effectiveProblem === 'soldOut' && (
                <StateCard tone="amber" icon={Ticket} title={t('booking.soldOutT')} text={t('booking.soldOutD')}>
                  <button onClick={() => { setProblem(null); setStep(1) }} className="btn-outline normal-case tracking-normal">{t('booking.backTickets')}</button>
                </StateCard>
              )}
              {effectiveProblem === 'expired' && (
                <StateCard tone="blue" icon={Hourglass} title={t('booking.expiredT')} text={t('booking.expiredD')}>
                  <button onClick={restart} className="btn-outline normal-case tracking-normal">{t('booking.restart')}</button>
                </StateCard>
              )}
              {effectiveProblem === 'closed' && (
                <StateCard tone="amber" icon={Lock} title={t('booking.closedT')} text={t('booking.closedD')}>
                  <button onClick={() => navigate('/miawezon#billetterie')} className="btn-outline normal-case tracking-normal">{t('booking.backTickets')}</button>
                </StateCard>
              )}
              {effectiveProblem === 'notReady' && (
                <StateCard tone="amber" icon={AlertTriangle} title={t('booking.notReadyT')} text={t('booking.notReadyD')}>
                  <button onClick={() => navigate('/miawezon')} className="btn-outline normal-case tracking-normal">{t('mz.backEvent')}</button>
                </StateCard>
              )}
              {effectiveProblem === 'refund' && (
                <StateCard tone="amber" icon={AlertTriangle} title={t('booking.refundT')} text={t('booking.refundD')}>
                  {order && <p className="text-sm font-bold text-text-dark">{t('booking.orderNumber')} : {order.orderNumber}</p>}
                </StateCard>
              )}
              {effectiveProblem === 'payLater' && (
                <StateCard tone="blue" icon={RefreshCw} title={t('booking.payLater')} text={t('booking.payLaterD')}>
                  <button onClick={() => window.location.reload()} className="btn-outline normal-case tracking-normal">{t('booking.reload')}</button>
                </StateCard>
              )}

              {/* ── ETAPE 1 : CATEGORIE ── */}
              {!effectiveProblem && step === 1 && (
                <div>
                  <h1 className="font-display text-xl font-bold text-text-dark mb-4">{t('booking.chooseTitle')}</h1>
                  <div className="space-y-3">
                    {cats.map((c) => {
                      const n = qty[c._id] || 0
                      const soldOut = c.available === 0
                      return (
                        <div key={c._id} className={`rounded-xl border p-4 flex items-center gap-3 ${n > 0 ? 'border-primary bg-primary/5' : 'border-border'} ${soldOut ? 'opacity-60' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-text-dark">{c.name} <span className="font-body font-normal text-xs text-text-light">· {pick(c.label)}</span></p>
                            <p className="text-sm text-primary font-bold">{fmtFcfa(c.price)} <span className="text-xs font-normal text-text-light">{t('booking.perTicket')}</span></p>
                            <p className="text-[11px] text-text-light mt-0.5">{soldOut ? t('mz.soldOut') : t('booking.left', { n: c.available })}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" aria-label="-" onClick={() => changeQty(c, -1)} disabled={n === 0} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-dark disabled:opacity-40 hover:border-primary">
                              <Minus size={16} />
                            </button>
                            <span className="w-6 text-center font-bold text-text-dark" aria-live="polite">{n}</span>
                            <button type="button" aria-label="+" onClick={() => changeQty(c, 1)} disabled={soldOut || n >= c.available} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <span className="text-sm text-text-medium">{t('booking.total')}</span>
                    <span className="font-display text-xl font-bold text-text-dark">{fmtFcfa(total)}</span>
                  </div>
                  <button
                    onClick={() => (count ? setStep(2) : toast.error(t('booking.chooseOne')))}
                    className="w-full mt-5 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-dark shadow-btn disabled:opacity-50"
                    disabled={count === 0}
                  >
                    {t('booking.next')}
                  </button>
                </div>
              )}

              {/* ── ETAPE 2 : PARTICIPANT ── */}
              {!effectiveProblem && step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); createOrder() }} noValidate>
                  <h1 className="font-display text-xl font-bold text-text-dark mb-4">{t('booking.infoTitle')}</h1>
                  <div className="space-y-4">
                    <Field id="b-name" label={t('booking.fullName')} error={errors.name}>
                      <input id="b-name" className="input" autoComplete="name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
                    </Field>
                    <Field id="b-phone" label={t('booking.phone')} hint={t('booking.phoneHint')} error={errors.phone}>
                      <input id="b-phone" className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="+229 97 00 00 00" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} />
                    </Field>
                    <Field id="b-email" label={t('booking.email')} hint={t('booking.emailHint')} error={errors.email}>
                      <input id="b-email" className="input" type="email" autoComplete="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} />
                    </Field>

                    <div className="pt-2">
                      <p className="text-sm font-semibold text-text-dark">{t('booking.holdersTitle')}</p>
                      <p className="text-xs text-text-light mb-3">{t('booking.holdersHint')}</p>
                      <div className="space-y-2">
                        {lines.map((c, i) => (
                          <div key={i}>
                            <label htmlFor={`h-${i}`} className="block text-[11px] font-bold uppercase tracking-wide text-text-light mb-1">{t('booking.ticketN', { n: i + 1, cat: c.name })}</label>
                            <input
                              id={`h-${i}`}
                              className="input"
                              placeholder={buyer.name || t('booking.fullName')}
                              value={holders[i] || ''}
                              onChange={(e) => setHolders((h) => h.map((v, k) => (k === i ? e.target.value : v)))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <span className="text-sm text-text-medium">{t('booking.total')} · {count} x</span>
                    <span className="font-display text-xl font-bold text-text-dark">{fmtFcfa(total)}</span>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button type="button" onClick={() => setStep(1)} className="px-5 rounded-xl border border-border text-text-medium font-semibold hover:border-primary">{t('booking.back')}</button>
                    <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-dark shadow-btn disabled:opacity-60 inline-flex items-center justify-center gap-2">
                      {busy && <Loader2 size={16} className="animate-spin" />} {t('booking.next')}
                    </button>
                  </div>
                </form>
              )}

              {/* ── ETAPE 3 : PAIEMENT ── */}
              {!effectiveProblem && step === 3 && order && (
                <div>
                  <h1 className="font-display text-xl font-bold text-text-dark mb-4">{t('booking.payTitle')}</h1>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-text-dark"><Smartphone size={16} className="text-primary" /> {t('booking.mobileMoney')}</p>
                      <p className="text-[11px] text-text-light mt-1 leading-snug">{MZ_PAYMENT_METHODS.mobileMoney.join(' · ')}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-text-dark"><CreditCard size={16} className="text-primary" /> {t('booking.card')}</p>
                      <p className="text-[11px] text-text-light mt-1 leading-snug">{MZ_PAYMENT_METHODS.card.join(' · ')}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-cream p-4 space-y-2 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-light">{order.orderNumber}</p>
                    {order.items.map((i) => (
                      <div key={i.code} className="flex justify-between text-text-medium">
                        <span>{i.name} x {i.quantity}</span><span>{fmtFcfa(i.unitPrice * i.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-text-medium"><span>{t('booking.fees')}</span><span>{t('booking.free')}</span></div>
                    <div className="flex justify-between pt-2 border-t border-border font-bold text-text-dark">
                      <span>{t('booking.totalToPay')}</span><span className="text-primary">{fmtFcfa(order.total)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <HoldTimer expiresAt={order.expiresAt} offset={offset} onExpire={onExpire} />
                  </div>

                  <button onClick={pay} disabled={Boolean(busy)} className="w-full mt-4 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-dark shadow-btn disabled:opacity-60 inline-flex items-center justify-center gap-2">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    {busy === 'verify' ? t('booking.verifying') : payment?.mock ? t('booking.mockBtn') : t('booking.payBtn')}
                  </button>
                  {payment?.mock && <p className="text-[11px] text-amber-700 text-center mt-2">{t('booking.mockNote')}</p>}
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-text-light mt-3"><ShieldCheck size={13} /> {t('booking.payVia')}</p>
                  <button onClick={releaseAndEdit} disabled={Boolean(busy)} className="w-full text-sm text-text-light hover:text-primary mt-3 py-1">{t('booking.modify')}</button>
                </div>
              )}

              {/* ── ETAPE 4 : CONFIRMATION ── */}
              {!effectiveProblem && step === 4 && order && (
                <div className="text-center py-2">
                  <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <CheckCircle2 size={34} />
                  </motion.span>
                  <h1 className="font-display text-2xl font-bold text-text-dark mt-4">{t('booking.confirmTitle')}</h1>
                  <p className="text-sm text-text-medium mt-1">{t('booking.confirmText')}</p>
                  <div className="mt-5 rounded-xl bg-cream py-3">
                    <p className="text-xs text-text-light">{t('booking.orderNumber')}</p>
                    <p className="font-display text-xl font-bold text-text-dark">#{order.orderNumber}</p>
                  </div>
                  <div className="mt-5 flex flex-col gap-2">
                    <a href={pdfUrl(order._id, token)} className="rounded-xl border border-border py-3 text-sm font-semibold text-text-dark hover:border-primary inline-flex items-center justify-center gap-2">
                      <Download size={16} className="text-primary" /> {order.quantity > 1 ? t('booking.downloadMany') : t('booking.download')}
                    </a>
                    <p className="rounded-xl border border-border py-3 text-sm text-text-medium inline-flex items-center justify-center gap-2">
                      <Mail size={16} className="text-primary" /> {t('booking.emailSent', { email: order.buyer.email })}
                    </p>
                    <a
                      href={whatsappUrl(t('tickets.waMsg', { name: order.buyer.name, url: ticketsUrl(order._id, token) }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border py-3 text-sm font-semibold text-text-dark hover:border-green-600 inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} className="text-green-600" /> {t('booking.whatsapp')}
                    </a>
                    <Link to={`/miawezon/billets/${order._id}?t=${token}`} className="mt-2 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-dark shadow-btn">
                      {t('booking.viewTickets')}
                    </Link>
                    <button onClick={restart} className="text-sm text-text-light hover:text-primary py-2">{t('booking.another')}</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
