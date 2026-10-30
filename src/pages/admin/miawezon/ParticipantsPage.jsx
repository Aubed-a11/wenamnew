import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, Download, Loader2, Printer, RefreshCw, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../api/axios'

const fmt = (d) => (d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Liste des participants : recherche, impression (secours si le scan ne marche pas) et export CSV
export default function ParticipantsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('ALL')
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/miawezon/admin/participants')
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Impossible de charger la liste'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const tickets = data?.tickets || []
  const cats = useMemo(() => [...new Set(tickets.map((t) => t.categoryCode))].sort(), [tickets])
  const shown = useMemo(() => {
    const n = norm(q)
    return tickets.filter((t) => (cat === 'ALL' || t.categoryCode === cat)
      && (!n || [t.holderName, t.number, t.orderNumber, t.buyerName, t.buyerPhone].some((v) => norm(v).includes(n))))
  }, [tickets, q, cat])
  const used = tickets.filter((t) => t.status === 'used').length
  const byCat = cats.map((c) => ({ c, n: tickets.filter((t) => t.categoryCode === c).length }))

  const exportCsv = async () => {
    setBusy(true)
    try {
      const { data: blob } = await api.get('/miawezon/admin/participants.csv', { responseType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'MIAWEZON-participants.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch {
      toast.error('Export impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="font-body mz-participants">
      <style>{`
        @media print {
          .admin-sidebar, .admin-topbar, .no-print { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-content { padding: 0 !important; max-width: none !important; }
          .mz-participants table { font-size: 11px; }
          .mz-participants tr { break-inside: avoid; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between gap-3 mb-4 flex-wrap">
        <Link to="/admin/miawezon" className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary"><ChevronLeft size={16} /> MIAWÉZON</Link>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-text-dark hover:border-primary"><RefreshCw size={15} /> Actualiser</button>
          <button onClick={exportCsv} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-text-dark hover:border-primary disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Exporter (CSV)</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark"><Printer size={15} /> Imprimer</button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-dark">Liste des participants</h2>
          <p className="text-sm text-text-light mt-1">
            {tickets.length} billet(s) payé(s){byCat.length ? ` · ${byCat.map((x) => `${x.c} ${x.n}`).join(' · ')}` : ''} · {used} entrée(s)
            {data?.generatedAt ? <span className="hidden print:inline"> · liste du {fmt(data.generatedAt)}</span> : null}
          </p>
        </div>
      </div>

      <div className="no-print flex gap-2 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, n° de billet, commande, téléphone" className="input !pl-9" />
        </div>
        {['ALL', ...cats].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${cat === c ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-medium hover:border-primary'}`}>
            {c === 'ALL' ? 'Toutes' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : shown.length === 0 ? (
        <p className="text-center text-text-light py-16">{tickets.length ? 'Aucun résultat.' : 'Aucun billet payé pour le moment.'}</p>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-warm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-light border-b border-cream-warm">
                <th className="px-3 py-2.5 w-8">#</th>
                <th className="px-3 py-2.5">Nom sur le billet</th>
                <th className="px-3 py-2.5">Billet</th>
                <th className="px-3 py-2.5">Formule</th>
                <th className="px-3 py-2.5">Commande</th>
                <th className="px-3 py-2.5">Téléphone</th>
                <th className="px-3 py-2.5">Entrée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-warm">
              {shown.map((t, i) => (
                <tr key={t.number} className={t.status === 'used' ? 'bg-green-50/60' : ''}>
                  <td className="px-3 py-2 text-text-light">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-text-dark">{t.holderName}{t.buyerName && t.buyerName !== t.holderName ? <span className="block text-xs font-normal text-text-light">Acheteur : {t.buyerName}</span> : null}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.number}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.categoryCode === 'AGBADJA' ? 'bg-mz-night text-mz-gold' : 'bg-cream text-text-dark border border-border'}`}>{t.categoryCode}</span></td>
                  <td className="px-3 py-2 font-mono text-xs">{t.orderNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.buyerPhone}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {t.status === 'used'
                      ? <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle2 size={14} /> {fmt(t.checkedInAt)}</span>
                      : <span className="inline-block w-5 h-5 rounded border border-text-light align-middle" aria-label="À cocher" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
