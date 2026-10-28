import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown, ArrowUp, Ban, CheckCircle2, Copy, Download, ExternalLink, Eye, FileDown, Loader2, Mail, MessageCircle, RefreshCw, Save, ScanLine,
  Plus, Search, Send, ShieldCheck, Ticket, Trash2, TrendingUp, UserCheck, Users, Wallet, X,
} from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../api/axios'
import { fmtPrice } from '../../../components/miawezon/utils'

const STATUS = {
  paid: ['Payée', 'bg-green-100 text-green-800'],
  pending: ['En attente', 'bg-amber-100 text-amber-800'],
  expired: ['Expirée', 'bg-stone-200 text-stone-700'],
  failed: ['Échouée', 'bg-red-100 text-red-700'],
  cancelled: ['Annulée', 'bg-stone-200 text-stone-700'],
  refund_needed: ['À rembourser', 'bg-red-100 text-red-700'],
}
const SALES = { upcoming: ['Phase 1 : billetterie à venir', 'bg-amber-100 text-amber-800'], open: ['Phase 2 : billetterie ouverte', 'bg-green-100 text-green-800'], closed: ['Billetterie fermée', 'bg-stone-200 text-stone-700'] }

const errMsg = (e) => e?.response?.data?.message || 'Une erreur est survenue'
const fmtDT = (d) => (d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
// Valeur pour <input type="datetime-local"> dans le fuseau du navigateur
const toLocalInput = (d) => {
  if (!d) return ''
  const x = new Date(d)
  const off = x.getTimezoneOffset() * 60000
  return new Date(x.getTime() - off).toISOString().slice(0, 16)
}
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null)

async function downloadAuthed(path, filename) {
  try {
    const res = await api.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  } catch (e) {
    toast.error(errMsg(e))
  }
}

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-cream-warm shadow-card p-5 ${className}`}>{children}</div>
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-text-light">{label}</p>
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={16} /></span>
      </div>
      <p className="font-display text-2xl font-bold text-text-dark mt-1">{value}</p>
      {sub && <p className="text-[11px] text-text-light mt-0.5">{sub}</p>}
    </Card>
  )
}

function Badge({ status }) {
  const [label, cls] = STATUS[status] || [status, 'bg-stone-100 text-stone-700']
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>
}

// ═══ TABLEAU DE BORD ═══════════════════════════════════════════════════════
function DashboardTab({ config }) {
  const [stats, setStats] = useState(null)
  const fetchStats = useCallback(() => api.get('/miawezon/admin/stats').then(({ data }) => setStats(data)).catch((e) => toast.error(errMsg(e))), [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 30000)
    return () => clearInterval(id)
  }, [fetchStats])

  if (!stats) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
  const sales = SALES[stats.salesState]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${sales[1]}`}>{sales[0]}</span>
        {!config.event.published && <span className="rounded-full px-3 py-1 text-xs font-bold bg-stone-200 text-stone-700">Rubrique masquée du public</span>}
        {config.payment.mock && <span className="rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">Paiement en mode test</span>}
        <div className="ml-auto flex gap-2">
          <button onClick={fetchStats} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-medium hover:border-primary"><RefreshCw size={14} /> Actualiser</button>
          <button onClick={() => downloadAuthed('/miawezon/admin/orders.csv', `miawezon-ventes-${new Date().toISOString().slice(0, 10)}.csv`)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-3 py-2 text-xs font-semibold hover:bg-primary-dark"><FileDown size={14} /> Exporter (CSV)</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Wallet} label="Ventes totales" value={fmtPrice(stats.revenue)} sub={`${stats.paidOrders} commande(s) payée(s)`} />
        <Stat icon={Ticket} label="Billets vendus" value={`${stats.ticketsSold} / ${stats.capacity}`} sub={`${Math.max(0, stats.capacity - stats.ticketsSold)} place(s) restante(s)`} />
        <Stat icon={UserCheck} label="Entrées scannées" value={`${stats.checkedIn} / ${stats.ticketsSold}`} />
        <Stat icon={Users} label="Liste d'attente" value={stats.waitlist} sub={stats.statusCounts.refund_needed ? `${stats.statusCounts.refund_needed} à rembourser` : undefined} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {stats.categories.map((c) => {
          const pct = c.capacity ? Math.round((c.sold / c.capacity) * 100) : 0
          return (
            <Card key={c._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-bold text-text-dark">{c.name} <span className="font-body text-xs text-text-light font-normal">{c.label?.fr}</span></p>
                  <p className="text-sm text-primary font-bold">{fmtPrice(c.price)}</p>
                </div>
                <p className="font-display text-2xl font-bold text-text-dark">{c.sold}<span className="text-sm text-text-light font-body"> / {c.capacity}</span></p>
              </div>
              <div className="h-2 rounded-full bg-cream-warm overflow-hidden mt-3">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-text-light mt-2">
                <span>{pct} % vendu</span>
                <span>{c.pending > 0 ? `${c.pending} en cours de paiement · ` : ''}{c.available} disponible(s) · {c.checkedIn} entrée(s)</span>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-3">
        <Card>
          <p className="font-display font-bold text-text-dark mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Ventes des 30 derniers jours</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.series} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(8, 10) + '/' + d.slice(5, 7)} tick={{ fontSize: 11, fill: '#8B6B3D' }} interval={4} />
                <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} tick={{ fontSize: 11, fill: '#8B6B3D' }} width={40} />
                <Tooltip formatter={(v, n) => (n === 'revenue' ? [fmtPrice(v), 'Ventes'] : [v, 'Billets'])} labelFormatter={(d) => new Date(d).toLocaleDateString('fr-FR')} />
                <Line type="monotone" dataKey="revenue" stroke="#C4531A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <p className="font-display font-bold text-text-dark mb-3">Dernières commandes</p>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-text-light py-6 text-center">Aucune vente pour le moment.</p>
          ) : (
            <ul className="divide-y divide-cream-warm">
              {stats.recent.map((o) => (
                <li key={o._id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-text-dark truncate">{o.orderNumber}</p>
                    <p className="text-xs text-text-light truncate">{o.buyer.name} · {o.items.map((i) => `${i.code} x${i.quantity}`).join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-text-dark">{fmtPrice(o.total)}</p>
                    {o.status !== 'paid' ? <Badge status={o.status} /> : <p className="text-[11px] text-text-light">{fmtDT(o.paidAt)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

// ═══ COMMANDES ═════════════════════════════════════════════════════════════
function OrderDrawer({ id, onClose, onChanged }) {
  const [o, setO] = useState(null)
  const [tx, setTx] = useState('')
  const [busy, setBusy] = useState(null)

  const fetchOrder = useCallback(() => api.get(`/miawezon/admin/orders/${id}`).then(({ data }) => setO(data.order)).catch((e) => toast.error(errMsg(e))), [id])
  useEffect(() => { fetchOrder() }, [fetchOrder])

  const act = async (key, fn, ok) => {
    setBusy(key)
    try { const r = await fn(); toast.success(ok || r?.data?.message || 'Fait'); await fetchOrder(); onChanged() } catch (e) { toast.error(errMsg(e)) } finally { setBusy(null) }
  }

  const getLink = async () => (await api.get(`/miawezon/admin/orders/${id}/link`)).data

  return (
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-hover overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-cream-warm px-5 py-4 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-text-dark">{o?.orderNumber || 'Commande'}</p>
          <button onClick={onClose} aria-label="Fermer" className="p-1 text-text-light hover:text-text-dark"><X size={20} /></button>
        </div>
        {!o ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
          <div className="p-5 space-y-5 text-sm">
            <div className="flex items-center justify-between"><Badge status={o.status} /><span className="text-xs text-text-light">{fmtDT(o.createdAt)}</span></div>
            <div className="rounded-xl bg-cream p-4 space-y-1">
              <p className="font-bold text-text-dark">{o.buyer.name}</p>
              <p className="text-text-medium">{o.buyer.phone}</p>
              <p className="text-text-medium break-all">{o.buyer.email}</p>
            </div>
            <div>
              {o.items.map((i) => (
                <div key={i.code} className="flex justify-between py-1"><span>{i.name} x {i.quantity}</span><span>{fmtPrice(i.unitPrice * i.quantity)}</span></div>
              ))}
              <div className="flex justify-between py-1 font-bold border-t border-cream-warm mt-1 pt-2"><span>Total</span><span className="text-primary">{fmtPrice(o.total)}</span></div>
            </div>
            {o.payment?.transactionId && (
              <p className="text-xs text-text-light">Transaction YouCan Pay : <span className="font-mono text-text-dark">{o.payment.transactionId}</span>{o.payment.method ? ` (${o.payment.method})` : ''}</p>
            )}
            {o.paidAt && <p className="text-xs text-text-light">Payée le {fmtDT(o.paidAt)}{o.emailSentAt ? ` · e-mail envoyé le ${fmtDT(o.emailSentAt)}` : ' · e-mail non envoyé'}</p>}

            {o.tickets.length > 0 && (
              <div>
                <p className="font-bold text-text-dark mb-2">Billets</p>
                <ul className="space-y-1.5">
                  {o.tickets.map((t) => (
                    <li key={t._id} className="flex items-center justify-between rounded-lg border border-cream-warm px-3 py-2">
                      <div><p className="font-semibold text-text-dark">{t.holderName}</p><p className="text-[11px] text-text-light">{t.number} · {t.categoryCode}</p></div>
                      <span className={`text-[11px] font-bold ${t.status === 'used' ? 'text-green-700' : t.status === 'cancelled' ? 'text-red-700' : 'text-text-light'}`}>
                        {t.status === 'used' ? `Entré ${fmtDT(t.checkedInAt)}` : t.status === 'cancelled' ? 'Annulé' : 'Valide'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {o.status === 'paid' && (
              <div className="grid grid-cols-1 gap-2">
                <button disabled={!!busy} onClick={() => act('mail', () => api.post(`/miawezon/admin/orders/${id}/resend`), 'Billets renvoyés par e-mail')} className="rounded-lg border border-border py-2.5 font-semibold text-text-dark hover:border-primary inline-flex items-center justify-center gap-2">
                  {busy === 'mail' ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} className="text-primary" />} Renvoyer par e-mail
                </button>
                <button
                  disabled={!!busy}
                  onClick={async () => {
                    try {
                      const l = await getLink()
                      const phone = l.phone.replace(/[^\d]/g, '')
                      const text = `Bonjour ${l.name}, voici vos billets MIAWÉZON (${l.orderNumber}) : ${l.url}`
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
                    } catch (e) { toast.error(errMsg(e)) }
                  }}
                  className="rounded-lg border border-border py-2.5 font-semibold text-text-dark hover:border-green-600 inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} className="text-green-600" /> Envoyer par WhatsApp
                </button>
                <button
                  disabled={!!busy}
                  onClick={async () => {
                    try { const l = await getLink(); await navigator.clipboard.writeText(l.url); toast.success('Lien copié') } catch (e) { toast.error(errMsg(e)) }
                  }}
                  className="rounded-lg border border-border py-2.5 font-semibold text-text-dark hover:border-primary inline-flex items-center justify-center gap-2"
                >
                  <Copy size={15} className="text-primary" /> Copier le lien des billets
                </button>
              </div>
            )}

            {['pending', 'expired', 'failed'].includes(o.status) && (
              <div className="rounded-xl border border-cream-warm p-4">
                <p className="font-bold text-text-dark flex items-center gap-2"><ShieldCheck size={15} className="text-primary" /> Vérifier un paiement</p>
                <p className="text-xs text-text-light mt-1">Si le client a payé mais n'a pas reçu ses billets, saisissez l'identifiant de transaction YouCan Pay (visible dans votre tableau de bord YouCan Pay).</p>
                <div className="flex gap-2 mt-3">
                  <input className="input !py-2" value={tx} onChange={(e) => setTx(e.target.value)} placeholder="Identifiant de transaction" />
                  <button disabled={!tx.trim() || !!busy} onClick={() => act('verify', () => api.post(`/miawezon/admin/orders/${id}/verify`, { transactionId: tx.trim() }), 'Paiement validé, billets émis')} className="rounded-lg bg-primary text-white px-4 font-semibold disabled:opacity-50">
                    {busy === 'verify' ? <Loader2 size={15} className="animate-spin" /> : 'Vérifier'}
                  </button>
                </div>
              </div>
            )}

            {['paid', 'pending', 'refund_needed'].includes(o.status) && (
              <button
                disabled={!!busy}
                onClick={() => {
                  if (!window.confirm(`Annuler la commande ${o.orderNumber} ? Les billets ne seront plus valables et les places seront remises en vente.`)) return
                  act('cancel', () => api.post(`/miawezon/admin/orders/${id}/cancel`))
                }}
                className="w-full rounded-lg py-2.5 font-semibold text-red-700 hover:bg-red-50 inline-flex items-center justify-center gap-2"
              >
                <Ban size={15} /> Annuler la commande
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersTab() {
  const [status, setStatus] = useState('paid')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [res, setRes] = useState(null)
  const [openId, setOpenId] = useState(null)

  const fetchOrders = useCallback(() => {
    api.get('/miawezon/admin/orders', { params: { status, search: q, page, limit: 20 } })
      .then(({ data }) => setRes(data)).catch((e) => toast.error(errMsg(e)))
  }, [status, q, page])
  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {[['paid', 'Payées'], ['pending', 'En attente'], ['refund_needed', 'À rembourser'], ['expired', 'Expirées'], ['cancelled', 'Annulées'], ['all', 'Toutes']].map(([k, l]) => (
            <button key={k} onClick={() => { setStatus(k); setPage(1) }} className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${status === k ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-medium hover:border-primary'}`}>{l}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }} className="md:ml-auto flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N°, nom, e-mail, téléphone" className="input !py-2 !pl-9 md:w-64" />
          </div>
          <button className="rounded-lg border border-border px-3 text-sm font-semibold text-text-medium hover:border-primary">OK</button>
        </form>
        <button onClick={() => downloadAuthed(`/miawezon/admin/orders.csv?status=${status}&search=${encodeURIComponent(q)}`, 'miawezon-commandes.csv')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white px-3 py-2 text-xs font-semibold hover:bg-primary-dark"><Download size={14} /> CSV</button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {!res ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : res.orders.length === 0 ? (
          <p className="py-14 text-center text-sm text-text-light">Aucune commande.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs text-text-light">
                <tr><th className="px-4 py-3">Commande</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Billets</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-cream-warm">
                {res.orders.map((o) => (
                  <tr key={o._id} className="hover:bg-cream/50">
                    <td className="px-4 py-3 font-bold text-text-dark whitespace-nowrap">{o.orderNumber}</td>
                    <td className="px-4 py-3"><p className="text-text-dark">{o.buyer.name}</p><p className="text-xs text-text-light">{o.buyer.phone}</p></td>
                    <td className="px-4 py-3 text-text-medium whitespace-nowrap">{o.items.map((i) => `${i.code} x${i.quantity}`).join(', ')}</td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">{fmtPrice(o.total)}</td>
                    <td className="px-4 py-3"><Badge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-text-light whitespace-nowrap">{fmtDT(o.paidAt || o.createdAt)}</td>
                    <td className="px-4 py-3"><button onClick={() => setOpenId(o._id)} className="inline-flex items-center gap-1 text-primary font-semibold text-xs"><Eye size={14} /> Détails</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {res && res.pages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Précédent</button>
          <span className="text-text-light">Page {res.page} / {res.pages}</span>
          <button disabled={page >= res.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Suivant</button>
        </div>
      )}

      {openId && <OrderDrawer id={openId} onClose={() => setOpenId(null)} onChanged={fetchOrders} />}
    </div>
  )
}

// ═══ REGLAGES ══════════════════════════════════════════════════════════════
function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`mt-0.5 w-11 h-6 rounded-full relative transition shrink-0 ${checked ? 'bg-primary' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      <span><span className="block text-sm font-semibold text-text-dark">{label}</span>{hint && <span className="block text-xs text-text-light">{hint}</span>}</span>
    </label>
  )
}

function L({ label, children, hint }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-text-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-text-light mt-1">{hint}</span>}
    </div>
  )
}

function CategoryEditor({ cat, onSaved }) {
  const [f, setF] = useState({ price: cat.price, capacity: cat.capacity, labelFr: cat.label?.fr || '', labelEn: cat.label?.en || '', active: cat.active })
  const [busy, setBusy] = useState(false)
  const sold = cat.capacity - cat.available
  const save = async () => {
    setBusy(true)
    try {
      await api.put(`/miawezon/admin/categories/${cat._id}`, { price: Number(f.price), capacity: Number(f.capacity), label: { fr: f.labelFr, en: f.labelEn }, active: f.active })
      toast.success(`${cat.name} enregistré`)
      onSaved()
    } catch (e) { toast.error(errMsg(e)) } finally { setBusy(false) }
  }
  return (
    <div className="rounded-xl border border-cream-warm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-text-dark">{cat.name}</p>
        <span className="text-xs text-text-light">{sold} place(s) réservée(s) ou vendue(s)</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <L label="Prix (DH)"><input type="number" min="10" step="10" className="input" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></L>
        <L label="Nombre de places" hint={`Minimum ${sold}`}><input type="number" min={sold} className="input" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} /></L>
        <L label="Libellé (FR)"><input className="input" value={f.labelFr} onChange={(e) => setF({ ...f, labelFr: e.target.value })} /></L>
        <L label="Libellé (EN)"><input className="input" value={f.labelEn} onChange={(e) => setF({ ...f, labelEn: e.target.value })} /></L>
      </div>
      <div className="flex items-center justify-between">
        <Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Catégorie en vente" />
        <button onClick={save} disabled={busy} className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer
        </button>
      </div>
    </div>
  )
}

function SettingsTab({ config, reload }) {
  const ev = config.event
  const [f, setF] = useState(() => ({
    published: ev.published,
    menuFinal: ev.menuFinal,
    salesMode: ev.salesMode,
    phase1At: toLocalInput(ev.phase1At),
    salesOpenAt: toLocalInput(ev.salesOpenAt),
    salesCloseAt: toLocalInput(ev.salesCloseAt),
    eventDate: toLocalInput(ev.eventDate),
    dateFr: ev.eventDateLabel?.fr || '', dateEn: ev.eventDateLabel?.en || '',
    timeFr: ev.eventTimeLabel?.fr || '', timeEn: ev.eventTimeLabel?.en || '',
    venueFr: ev.venue?.fr || '', venueEn: ev.venue?.en || '',
    venueAddress: ev.venueAddress || '',
    maxTicketsPerOrder: ev.maxTicketsPerOrder,
    contactEmail: ev.contactEmail || '', contactPhone: ev.contactPhone || '',
  }))
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = async () => {
    setBusy(true)
    try {
      await api.put('/miawezon/admin/event', {
        published: f.published,
        menuFinal: f.menuFinal,
        salesMode: f.salesMode,
        phase1At: fromLocalInput(f.phase1At),
        salesOpenAt: fromLocalInput(f.salesOpenAt),
        salesCloseAt: fromLocalInput(f.salesCloseAt),
        eventDate: fromLocalInput(f.eventDate),
        eventDateLabel: { fr: f.dateFr, en: f.dateEn },
        eventTimeLabel: { fr: f.timeFr, en: f.timeEn },
        venue: { fr: f.venueFr, en: f.venueEn },
        venueAddress: f.venueAddress,
        maxTicketsPerOrder: Number(f.maxTicketsPerOrder),
        contactEmail: f.contactEmail,
        contactPhone: f.contactPhone,
      })
      toast.success('Réglages enregistrés')
      reload()
    } catch (e) { toast.error(errMsg(e)) } finally { setBusy(false) }
  }

  const p = config.payment
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="space-y-5">
        <p className="font-display text-lg font-bold text-text-dark">Rubrique et billetterie</p>
        <Toggle checked={f.published} onChange={(v) => setF({ ...f, published: v })} label="Rubrique visible sur le site" hint="Mise en ligne de la phase 1. Les administrateurs voient toujours un aperçu." />
        <Toggle checked={f.menuFinal} onChange={(v) => setF({ ...f, menuFinal: v })} label="Menu du buffet définitif" hint="Retire la mention « Menu définitif bientôt disponible ». Les plats se modifient dans l'onglet Menu du buffet." />
        <L label="Ouverture de la billetterie" hint="Auto : selon la date d'ouverture ci-dessous (phase 2).">
          <select className="input" value={f.salesMode} onChange={set('salesMode')}>
            <option value="auto">Automatique (selon les dates)</option>
            <option value="open">Forcer l'ouverture maintenant</option>
            <option value="closed">Fermer la billetterie</option>
          </select>
        </L>
        <div className="grid sm:grid-cols-2 gap-3">
          <L label="Mise en ligne phase 1 (affichage)"><input type="datetime-local" className="input" value={f.phase1At} onChange={set('phase1At')} /></L>
          <L label="Ouverture des ventes (phase 2)"><input type="datetime-local" className="input" value={f.salesOpenAt} onChange={set('salesOpenAt')} /></L>
          <L label="Fermeture des ventes (optionnel)"><input type="datetime-local" className="input" value={f.salesCloseAt} onChange={set('salesCloseAt')} /></L>
          <L label="Billets max par commande"><input type="number" min="1" max="50" className="input" value={f.maxTicketsPerOrder} onChange={set('maxTicketsPerOrder')} /></L>
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-display text-lg font-bold text-text-dark">Informations de l'événement</p>
        <p className="text-xs text-text-light -mt-2">Laissez vide pour afficher « À confirmer ».</p>
        <L label="Date de l'événement" hint="Sert aussi à numéroter les commandes (MZW-année-...)."><input type="datetime-local" className="input" value={f.eventDate} onChange={set('eventDate')} /></L>
        <div className="grid sm:grid-cols-2 gap-3">
          <L label="Date affichée (FR)" hint="Optionnel, sinon la date ci-dessus"><input className="input" value={f.dateFr} onChange={set('dateFr')} placeholder="Samedi 15 mai 2027" /></L>
          <L label="Date affichée (EN)"><input className="input" value={f.dateEn} onChange={set('dateEn')} placeholder="Saturday 15 May 2027" /></L>
          <L label="Heure (FR)"><input className="input" value={f.timeFr} onChange={set('timeFr')} placeholder="19h00 - 23h00" /></L>
          <L label="Heure (EN)"><input className="input" value={f.timeEn} onChange={set('timeEn')} placeholder="7 pm - 11 pm" /></L>
          <L label="Lieu (FR)"><input className="input" value={f.venueFr} onChange={set('venueFr')} /></L>
          <L label="Lieu (EN)"><input className="input" value={f.venueEn} onChange={set('venueEn')} /></L>
        </div>
        <L label="Adresse complète"><input className="input" value={f.venueAddress} onChange={set('venueAddress')} /></L>
        <div className="grid sm:grid-cols-2 gap-3">
          <L label="E-mail de contact"><input className="input" value={f.contactEmail} onChange={set('contactEmail')} /></L>
          <L label="Téléphone de contact"><input className="input" value={f.contactPhone} onChange={set('contactPhone')} /></L>
        </div>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <button onClick={save} disabled={busy} className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 shadow-btn">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer les réglages
        </button>
      </div>

      <Card className="space-y-3 lg:col-span-2">
        <p className="font-display text-lg font-bold text-text-dark">Catégories de billets</p>
        <div className="grid md:grid-cols-2 gap-3">
          {config.categories.map((c) => <CategoryEditor key={c._id + c.capacity + c.price} cat={c} onSaved={reload} />)}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <p className="font-display text-lg font-bold text-text-dark mb-2">Paiement YouCan Pay</p>
        <ul className="text-sm space-y-1 text-text-medium">
          <li className="flex items-center gap-2">{p.configured ? <CheckCircle2 size={15} className="text-green-600" /> : <X size={15} className="text-red-600" />} Clés YouCan Pay {p.configured ? 'configurées' : 'non configurées'} sur le serveur</li>
          <li className="flex items-center gap-2"><ShieldCheck size={15} className="text-primary" /> Environnement : {p.mock ? 'simulation locale (YCP_MOCK)' : p.sandbox ? 'sandbox (test)' : 'production'}</li>
          <li className="text-xs text-text-light">Délai de paiement : {config.holdMinutes} minutes. Les places non payées dans ce délai sont remises en vente automatiquement.</li>
        </ul>
      </Card>
    </div>
  )
}

// ═══ LISTE D'ATTENTE ══════════════════════════════════════════════════════
function WaitlistTab({ config }) {
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const fetchList = useCallback(() => api.get('/miawezon/admin/waitlist').then(({ data }) => setRes(data)).catch((e) => toast.error(errMsg(e))), [])
  useEffect(() => { fetchList() }, [fetchList])
  const open = config.event.salesState === 'open'

  const notify = async () => {
    if (!window.confirm('Envoyer un e-mail d\'ouverture de la billetterie à toutes les personnes pas encore prévenues ?')) return
    setBusy(true)
    try { const { data } = await api.post('/miawezon/admin/waitlist/notify'); toast.success(data.message); fetchList() } catch (e) { toast.error(errMsg(e)) } finally { setBusy(false) }
  }

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-2 border-b border-cream-warm">
        <p className="font-display font-bold text-text-dark">Personnes à prévenir {res && <span className="text-text-light font-body text-sm">({res.total}, dont {res.notified} prévenue(s))</span>}</p>
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadAuthed('/miawezon/admin/waitlist?format=csv', 'miawezon-liste-attente.csv')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-medium hover:border-primary"><Download size={14} /> CSV</button>
          <button onClick={notify} disabled={!open || busy} title={open ? '' : 'Disponible quand la billetterie est ouverte'} className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-3 py-2 text-xs font-semibold disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Prévenir de l'ouverture
          </button>
        </div>
      </div>
      {!res ? <div className="py-14 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : res.entries.length === 0 ? (
        <p className="py-14 text-center text-sm text-text-light">Personne ne s'est encore inscrit avec « Me prévenir ».</p>
      ) : (
        <ul className="divide-y divide-cream-warm text-sm">
          {res.entries.map((e) => (
            <li key={e._id} className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-text-dark break-all">{e.email}</span>
              <span className="text-xs text-text-light whitespace-nowrap">{e.lang.toUpperCase()} · {fmtDT(e.createdAt)}{e.notifiedAt ? ' · prévenu' : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ═══ MENU DU BUFFET ════════════════════════════════════════════════════════
const MENU_SECTIONS = [['entrees', 'Entrées'], ['plats', 'Plats'], ['desserts', 'Desserts'], ['boissons', 'Boissons']]
const emptyDish = (tiers) => ({ name: { fr: '', en: '' }, desc: { fr: '', en: '' }, tiers: [...tiers] })

function MenuTab({ config, reload }) {
  const tiers = config.categories.map((c) => c.code)
  const [menu, setMenu] = useState(() => MENU_SECTIONS.map(([key]) => {
    const s = (config.event.menu || []).find((x) => x.key === key)
    return { key, items: (s?.items || []).map((i) => ({ name: { fr: i.name?.fr || '', en: i.name?.en || '' }, desc: { fr: i.desc?.fr || '', en: i.desc?.en || '' }, tiers: [...(i.tiers || [])] })) }
  }))
  const [menuFinal, setMenuFinal] = useState(config.event.menuFinal)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  const update = (si, fn) => { setDirty(true); setMenu((m) => m.map((s, k) => (k === si ? { ...s, items: fn(s.items) } : s))) }
  const setField = (si, ii, path, value) => update(si, (items) => items.map((it, k) => {
    if (k !== ii) return it
    const [a, b] = path.split('.')
    return b ? { ...it, [a]: { ...it[a], [b]: value } } : { ...it, [a]: value }
  }))
  const toggleTier = (si, ii, code) => update(si, (items) => items.map((it, k) => (k !== ii ? it : { ...it, tiers: it.tiers.includes(code) ? it.tiers.filter((c) => c !== code) : [...it.tiers, code] })))
  const move = (si, ii, dir) => update(si, (items) => {
    const j = ii + dir
    if (j < 0 || j >= items.length) return items
    const copy = [...items];
    [copy[ii], copy[j]] = [copy[j], copy[ii]]
    return copy
  })
  const remove = (si, ii) => update(si, (items) => items.filter((_, k) => k !== ii))
  const add = (si) => update(si, (items) => [...items, emptyDish(tiers)])

  const save = async () => {
    for (const s of menu) {
      for (const it of s.items) {
        if (it.name.fr.trim() && it.tiers.length === 0) { toast.error(`« ${it.name.fr} » doit être servi dans au moins un menu`); return }
      }
    }
    setBusy(true)
    try {
      await api.put('/miawezon/admin/menu', { menu, menuFinal })
      toast.success('Menu enregistré')
      setDirty(false)
      reload()
    } catch (e) { toast.error(errMsg(e)) } finally { setBusy(false) }
  }

  const count = (code) => menu.reduce((n, s) => n + s.items.filter((i) => i.name.fr.trim() && i.tiers.includes(code)).length, 0)

  return (
    <div className="space-y-4">
      <Card className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="font-display text-lg font-bold text-text-dark">Menu du buffet</p>
          <p className="text-xs text-text-light mt-0.5">Cochez dans quel menu chaque plat est servi. Un plat coché dans un seul menu s'affiche comme « Exclusif ».</p>
          <p className="text-xs text-text-medium mt-1">{tiers.map((c) => `${c} : ${count(c)} plat(s)`).join(' · ')}</p>
        </div>
        <Toggle checked={menuFinal} onChange={(v) => { setMenuFinal(v); setDirty(true) }} label="Menu définitif" hint="Retire « Menu définitif bientôt disponible »" />
        <div className="flex gap-2">
          <a href="/miawezon/menu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-medium hover:border-primary"><ExternalLink size={14} /> Aperçu</a>
          <button onClick={save} disabled={busy || !dirty} className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer
          </button>
        </div>
      </Card>

      {menu.map((s, si) => (
        <Card key={s.key}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-lg font-bold text-text-dark">{MENU_SECTIONS[si][1]} <span className="text-xs font-body font-normal text-text-light">({s.items.length})</span></p>
            <button onClick={() => add(si)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary"><Plus size={14} /> Ajouter un plat</button>
          </div>
          {s.items.length === 0 && <p className="text-sm text-text-light py-4 text-center">Aucun plat dans cette rubrique.</p>}
          <ul className="space-y-3">
            {s.items.map((it, ii) => (
              <li key={ii} className="rounded-xl border border-cream-warm p-3">
                <div className="grid md:grid-cols-2 gap-2">
                  <input className="input !py-2" placeholder="Nom du plat (FR)" value={it.name.fr} onChange={(e) => setField(si, ii, 'name.fr', e.target.value)} aria-label="Nom du plat en français" />
                  <input className="input !py-2" placeholder="Nom en anglais (optionnel)" value={it.name.en} onChange={(e) => setField(si, ii, 'name.en', e.target.value)} aria-label="Nom du plat en anglais" />
                  <input className="input !py-2" placeholder="Description (FR)" value={it.desc.fr} onChange={(e) => setField(si, ii, 'desc.fr', e.target.value)} aria-label="Description en français" />
                  <input className="input !py-2" placeholder="Description en anglais (optionnel)" value={it.desc.en} onChange={(e) => setField(si, ii, 'desc.en', e.target.value)} aria-label="Description en anglais" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-text-light">Servi dans :</span>
                  {tiers.map((code) => {
                    const on = it.tiers.includes(code)
                    return (
                      <button key={code} type="button" aria-pressed={on} onClick={() => toggleTier(si, ii, code)}
                        className={`rounded-full px-3 py-1 text-xs font-bold border inline-flex items-center gap-1 ${on ? 'bg-primary text-white border-primary' : 'bg-white text-text-light border-border'}`}>
                        {on && <CheckCircle2 size={12} />} {code}
                      </button>
                    )
                  })}
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" onClick={() => move(si, ii, -1)} disabled={ii === 0} aria-label="Monter" className="p-1.5 rounded-lg text-text-light hover:text-primary disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button type="button" onClick={() => move(si, ii, 1)} disabled={ii === s.items.length - 1} aria-label="Descendre" className="p-1.5 rounded-lg text-text-light hover:text-primary disabled:opacity-30"><ArrowDown size={16} /></button>
                    <button type="button" onClick={() => remove(si, ii)} aria-label="Supprimer" className="p-1.5 rounded-lg text-text-light hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {dirty && (
        <div className="sticky bottom-4 flex justify-end">
          <button onClick={save} disabled={busy} className="rounded-xl bg-primary text-white px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 shadow-hover disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer le menu
          </button>
        </div>
      )}
    </div>
  )
}

// ═══ PAGE ══════════════════════════════════════════════════════════════════
const TABS = [['dashboard', 'Tableau de bord'], ['orders', 'Commandes'], ['menu', 'Menu du buffet'], ['settings', 'Réglages'], ['waitlist', 'Liste d\'attente']]

export default function MiawezonAdminPage() {
  const [tab, setTab] = useState('dashboard')
  const [config, setConfig] = useState(null)
  const reload = useCallback(() => api.get('/miawezon/admin/config').then(({ data }) => setConfig(data)).catch((e) => toast.error(errMsg(e))), [])
  useEffect(() => { reload() }, [reload])

  return (
    <div className="font-body">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h2 className="sr-only">MIAWÉZON</h2>
          <img src="/images/miawezon/logo-dark.png" alt="MIAWÉZON by Wênam" className="h-12 w-auto object-contain" />
          <p className="text-xs text-text-light mt-1">Billetterie et gestion de l'événement</p>
        </div>
        <div className="ml-auto flex gap-2">
          <a href="/miawezon" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-text-medium hover:border-primary"><ExternalLink size={14} /> Voir la page</a>
          <Link to="/admin/miawezon/controle" className="inline-flex items-center gap-1.5 rounded-lg bg-mz-night text-mz-gold px-3 py-2 text-xs font-semibold"><ScanLine size={14} /> Contrôle des billets</Link>
        </div>
      </div>

      <div className="flex gap-1 border-b border-cream-warm mb-5 overflow-x-auto">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${tab === k ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}>{l}</button>
        ))}
      </div>

      {!config ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
        <>
          {tab === 'dashboard' && <DashboardTab config={config} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'settings' && <SettingsTab key={config.event.salesOpenAt + config.event.published} config={config} reload={reload} />}
          {tab === 'menu' && <MenuTab key={JSON.stringify(config.event.menu || [])} config={config} reload={reload} />}
          {tab === 'waitlist' && <WaitlistTab config={config} />}
        </>
      )}
    </div>
  )
}
