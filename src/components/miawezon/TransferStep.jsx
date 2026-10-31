import { useRef, useState } from 'react'
import { Check, Clock, Copy, FileText, Landmark, Loader2, Lock, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useT, locale } from '../../i18n'
import { apiError, fmtPrice } from './utils'

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*'
const MAX = 10 * 1024 * 1024

// RIB affiche par groupes pour la lecture
const groupRib = (v) => String(v || '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim()

async function copy(text, done) {
  try {
    await navigator.clipboard.writeText(text)
    done()
  } catch {
    toast.error(text)
  }
}

function CopyButton({ value, label }) {
  const { t } = useT()
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={() => copy(value.replace(/\s+/g, ''), () => { setOk(true); setTimeout(() => setOk(false), 1800) })}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${ok ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-border text-text-dark hover:border-primary'}`}
      aria-label={`${t('transfer.copy')} ${label}`}
    >
      {ok ? <Check size={13} /> : <Copy size={13} />} {ok ? t('transfer.copied') : t('transfer.copy')}
    </button>
  )
}

function Account({ acc }) {
  const { t } = useT()
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Landmark size={16} className="text-primary" />
        <p className="font-semibold text-text-dark">{acc.bank || t('transfer.account')}</p>
      </div>
      {acc.holder && <p className="text-xs text-text-light mb-2">{t('transfer.holder')} : <span className="text-text-dark font-semibold">{acc.holder}</span></p>}
      {acc.rib && (
        <div className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-light">RIB</p>
            <p className="font-mono text-sm font-bold text-text-dark break-all select-all">{groupRib(acc.rib)}</p>
          </div>
          <CopyButton value={acc.rib} label="RIB" />
        </div>
      )}
      {acc.iban && (
        <div className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2 mt-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-light">IBAN</p>
            <p className="font-mono text-sm font-bold text-text-dark break-all select-all">{groupRib(acc.iban)}</p>
          </div>
          <CopyButton value={acc.iban} label="IBAN" />
        </div>
      )}
      {acc.swift && <p className="text-xs text-text-light mt-2">SWIFT : <span className="font-mono text-text-dark select-all">{acc.swift}</span></p>}
    </div>
  )
}

/**
 * Etape 3 en mode virement : RIB, montant, motif, puis depot du reçu.
 */
export default function TransferStep({ order, token, event, timer, onSubmitted, onExpired, onEdit }) {
  const { t, lang } = useT()
  const input = useRef(null)
  const [file, setFile] = useState(null)
  const [reference, setReference] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const accounts = event?.bankAccounts || []
  const deadline = new Date(order.expiresAt).toLocaleString(locale(lang), { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

  const pick = (f) => {
    if (!f) return
    if (f.size > MAX) { toast.error(t('transfer.tooBig')); return }
    if (!/^(application\/pdf|image\/)/.test(f.type) && !/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(f.name)) { toast.error(t('transfer.badType')); return }
    setFile(f)
  }

  const submit = async () => {
    if (!file || !confirmed) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('token', token)
      fd.append('confirm', 'true')
      fd.append('reference', reference.trim())
      fd.append('receipt', file)
      const { data } = await api.post(`/miawezon/orders/${order._id}/proof`, fd)
      onSubmitted(data.order)
    } catch (err) {
      const e = apiError(err)
      if (e.code === 'ORDER_CLOSED') onExpired()
      else toast.error(e.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-text-dark mb-1">{t('transfer.title')}</h1>
      <p className="text-sm text-text-medium mb-4">{t('transfer.intro')}</p>

      {/* Montant et motif */}
      <div className="rounded-xl bg-primary-dark text-cream p-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-cream/70">{t('transfer.amount')}</p>
          <p className="font-display text-2xl font-bold">{fmtPrice(order.total)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-cream/70">{t('transfer.motive')}</p>
          <div className="flex items-center gap-2">
            <p className="font-mono font-bold break-all">{order.orderNumber}</p>
            <button type="button" onClick={() => copy(order.orderNumber, () => toast.success(t('transfer.copied')))} className="shrink-0 p-1 rounded text-cream/80 hover:text-white" aria-label={t('transfer.copy')}>
              <Copy size={14} />
            </button>
          </div>
        </div>
        <ul className="col-span-2 text-xs text-cream/80 space-y-0.5 pt-2 border-t border-white/15">
          {order.items.map((i) => <li key={i.code}>{i.name} x {i.quantity} · {fmtPrice(i.unitPrice * i.quantity)}</li>)}
        </ul>
      </div>

      {/* Etapes */}
      <ol className="mt-4 space-y-1.5 text-sm text-text-medium">
        {t('transfer.steps', { hours: event?.validationHours || 24 }).map((s, i) => (
          <li key={i} className="flex gap-2"><span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span><span>{s}</span></li>
        ))}
      </ol>

      {/* RIB */}
      <p className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-text-light">{t('transfer.accounts')}</p>
      <div className="space-y-3">
        {accounts.map((a, i) => <Account key={i} acc={a} />)}
      </div>

      <div className="mt-4">{timer}</div>
      <p className="flex items-start gap-2 text-xs text-text-light mt-2"><Clock size={13} className="shrink-0 mt-0.5" /> {t('transfer.deadline', { date: deadline })}</p>

      {/* Reçu */}
      <p className="mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-text-light">{t('transfer.receipt')}</p>
      {!file ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}
          className={`w-full rounded-xl border-2 border-dashed p-6 text-center transition ${drag ? 'border-primary bg-primary/5' : 'border-border bg-cream hover:border-primary'}`}
        >
          <Upload size={26} className="mx-auto text-primary" />
          <p className="font-semibold text-text-dark mt-2">{t('transfer.add')}</p>
          <p className="text-xs text-text-light mt-1">{t('transfer.formats')}</p>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
          {file.type.startsWith('image/') ? (
            <img src={URL.createObjectURL(file)} alt="" className="w-14 h-14 rounded-lg object-cover bg-cream" />
          ) : (
            <span className="w-14 h-14 rounded-lg bg-cream flex items-center justify-center"><FileText size={24} className="text-primary" /></span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-dark truncate">{file.name}</p>
            <p className="text-xs text-text-light">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
          </div>
          <button type="button" onClick={() => setFile(null)} className="p-2 rounded-lg text-text-light hover:text-red-600" aria-label={t('transfer.remove')}><X size={18} /></button>
        </div>
      )}
      <input ref={input} id="mz-receipt" type="file" accept={ACCEPT} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />

      <label htmlFor="mz-ref" className="block text-sm font-semibold text-text-dark mt-4 mb-1">{t('transfer.reference')}</label>
      <input id="mz-ref" className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={t('transfer.referenceHint')} maxLength={80} />

      <label className="flex items-start gap-3 mt-4 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-4 h-4 accent-[#C4531A]" />
        <span className="text-sm text-text-medium">{t('transfer.confirm', { amount: fmtPrice(order.total) })}</span>
      </label>

      <button onClick={submit} disabled={!file || !confirmed || busy} className="w-full mt-5 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-dark shadow-btn disabled:opacity-50 inline-flex items-center justify-center gap-2">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} {t('transfer.submit')}
      </button>
      <p className="text-[11px] text-text-light text-center mt-2">{t('transfer.emailNote', { email: order.buyer.email })}</p>
      <button onClick={onEdit} disabled={busy} className="w-full text-sm text-text-light hover:text-primary mt-3 py-1">{t('booking.modify')}</button>
    </div>
  )
}
