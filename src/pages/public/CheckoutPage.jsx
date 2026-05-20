import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Building2, CheckCircle, ChevronRight, CreditCard, Copy, Download, Lock, MapPin, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import { useAuthStore, useCartStore } from '../../store'

const css = `
  .checkout-wrap { max-width: 640px; margin: 0 auto; padding: 40px 16px; }
  .steps { display: flex; align-items: center; gap: 8px; margin-bottom: 40px; flex-wrap: nowrap; }
  .step-label { display: none; }
  @media (min-width: 480px) { .step-label { display: block; } }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 480px) { .form-grid-2 { grid-template-columns: 1fr; gap: 12px; } }
  .confirm-btns { display: flex; gap: 12px; }
  @media (max-width: 480px) { .confirm-btns { flex-direction: column; } }
  .checkout-card { background: #fff; border-radius: 20px; padding: 24px; border: 1px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  @media (max-width: 480px) { .checkout-card { padding: 16px; border-radius: 16px; } }
  .confirm-title { font-size: clamp(20px, 5vw, 28px); }
  .confirm-order-num { font-size: clamp(18px, 4vw, 24px); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .card-input {
    width: 100%; box-sizing: border-box;
    padding: 11px 14px; border-radius: 10px;
    border: 1.5px solid #e5e7eb; font-size: 15px;
    font-family: 'Georgia', serif; color: #1A0F00;
    background: #fff; outline: none; transition: border-color 0.2s;
  }
  .card-input:focus { border-color: #C4531A; }
  .card-input::placeholder { color: #b0a090; }
`

// ── Luhn check ────────────────────────────────────────────────────────────────
function luhn(num) {
  const digits = num.replace(/\D/g, '')
  let sum = 0
  let odd = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10)
    if (odd) { d *= 2; if (d > 9) d -= 9 }
    sum += d
    odd = !odd
  }
  return sum % 10 === 0
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const v = val.replace(/\D/g, '').substring(0, 4)
  return v.length >= 3 ? v.substring(0, 2) + ' / ' + v.substring(2) : v
}

function detectNetwork(num) {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return null
}

// ── Bank accounts ─────────────────────────────────────────────────────────────
const BANK_ACCOUNTS = [
  {
    id: 'cih',
    name: 'CIH Bank',
    accentColor: '#185FA5',
    badge: 'Recommandé',
    holder: 'MLE AHOUEFA SAMUELLE RONALDA K',
    rib: '230 810 4551229211008100 71',
    iban: 'MA64 2308 1045 5122 9211 0081 0071',
    bic: 'CIHMMAMC',
  },
  {
    id: 'bmce',
    name: 'BMCE Bank (Bank of Africa)',
    accentColor: '#3B6D11',
    badge: null,
    holder: 'MLE AHOUEFA SAMUELLE RONALDA K',
    rib: '011 810 0000182000005961 27',
    iban: 'MA64 0118 1000 0018 2000 0059 6127',
    bic: 'BMCEMAMC',
  },
]

// ── Transfer info sub-component ───────────────────────────────────────────────
function TransferInfo() {
  const [copied, setCopied] = useState(null)

  function handleCopy(bankId, value) {
    navigator.clipboard?.writeText(value.replace(/\s/g, ''))
    setCopied(bankId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BANK_ACCOUNTS.map(bank => (
          <div key={bank.id} style={{
            background: '#FAF3E8',
            borderLeft: `3px solid ${bank.accentColor}`,
            borderRadius: '0 10px 10px 0',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A0F00' }}>{bank.name}</span>
              {bank.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 99 }}>{bank.badge}</span>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              {[
                ['Titulaire', bank.holder, false],
                ['RIB',       bank.rib,    true],
                ['IBAN',      bank.iban,   true],
                ['BIC/SWIFT', bank.bic,    true],
              ].map(([label, value, mono]) => (
                <tr key={label}>
                  <td style={{ color: '#8B6B3D', padding: '3px 0', width: '30%', verticalAlign: 'top' }}>{label}</td>
                  <td style={{ color: '#1A0F00', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all', padding: '3px 0' }}>{value}</td>
                </tr>
              ))}
            </table>
            <button
              onClick={() => handleCopy(bank.id, bank.rib)}
              style={{
                marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', fontSize: 12, background: 'transparent',
                border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer',
                color: copied === bank.id ? '#16a34a' : '#1A0F00', fontWeight: 500,
                transition: 'color 0.2s',
              }}
            >
              <Copy size={12} />
              {copied === bank.id ? 'Copié !' : 'Copier le RIB'}
            </button>
          </div>
        ))}
        <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400e' }}>
          Indiquez votre référence commande dans le motif du virement. Traitement sous 1–2 jours ouvrés.
        </div>
      </div>
    </motion.div>
  )
}

// ── Card form sub-component ───────────────────────────────────────────────────
function CardForm({ cardData, setCardData, errors }) {
  const network = detectNetwork(cardData.number)
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        marginTop: 12, background: '#FAF3E8', borderRadius: 14,
        padding: 16, border: '1px solid #EDE0C4',
        display: 'flex', flexDirection: 'column', gap: 14
      }}>
        {/* Numéro de carte */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Numéro de carte *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="card-input"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={e => setCardData(d => ({ ...d, number: formatCardNumber(e.target.value) }))}
              inputMode="numeric"
              style={{ paddingRight: 70 }}
            />
            {network && (
              <span style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 11, fontWeight: 700, color: '#C4531A', background: '#fff',
                padding: '2px 8px', borderRadius: 6, border: '1px solid #EDE0C4'
              }}>{network}</span>
            )}
          </div>
          {errors.number && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.number}</p>}
        </div>

        {/* Titulaire */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nom sur la carte *
          </label>
          <input
            className="card-input"
            placeholder="PRÉNOM NOM"
            value={cardData.holder}
            onChange={e => setCardData(d => ({ ...d, holder: e.target.value.toUpperCase() }))}
          />
          {errors.holder && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.holder}</p>}
        </div>

        {/* Expiration + CVV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Expiration *
            </label>
            <input
              className="card-input"
              placeholder="MM / AA"
              value={cardData.expiry}
              onChange={e => setCardData(d => ({ ...d, expiry: formatExpiry(e.target.value) }))}
              inputMode="numeric"
            />
            {errors.expiry && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.expiry}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CVV *
            </label>
            <input
              className="card-input"
              placeholder="•••"
              value={cardData.cvv}
              onChange={e => setCardData(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
              inputMode="numeric"
              type="password"
            />
            {errors.cvv && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.cvv}</p>}
          </div>
        </div>

        {/* Sécurité */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8B6B3D' }}>
          <Lock size={12} color="#C4531A" />
          Paiement sécurisé — vos données sont chiffrées
        </div>
      </div>
    </motion.div>
  )
}

// ── PDF Generator ─────────────────────────────────────────────────────────────
function generateOrderPDF(order, user) {
  const items = order.items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #EDE0C4;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #EDE0C4;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #EDE0C4;text-align:right;">${(i.price * i.quantity).toFixed(2)} MAD</td>
    </tr>`
  ).join('')

  const logoUrl = `${window.location.origin}/images/wenam-logo.png`

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Georgia',serif;color:#1A0F00;margin:0;padding:40px;background:#fff;}
  .header{text-align:center;border-bottom:3px solid #C4531A;padding-bottom:24px;margin-bottom:32px;}
  .logo-img{width:110px;height:auto;margin:20px auto 4px;display:block;mix-blend-mode:multiply;}
  .brand{font-size:36px;font-weight:700;color:#C4531A;margin:0;font-family:'Georgia',serif;}
  .sub{font-size:13px;color:#8B6B3D;letter-spacing:3px;text-transform:uppercase;margin-top:4px;}
  .order-num{font-size:22px;font-weight:700;color:#8B3A0F;margin:16px 0 4px;}
  .date{font-size:13px;color:#8B6B3D;}
  .section{margin-bottom:24px;}
  .section-title{font-size:14px;font-weight:700;color:#C4531A;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;border-bottom:1px solid #EDE0C4;padding-bottom:6px;}
  table{width:100%;border-collapse:collapse;font-size:14px;}
  th{background:#FAF3E8;padding:10px 12px;text-align:left;font-size:12px;color:#8B6B3D;text-transform:uppercase;letter-spacing:1px;}
  .total-row{background:#FAF3E8;}
  .total-row td{padding:12px;font-weight:700;font-size:16px;}
  .grand-total td{background:#C4531A;color:#fff;padding:14px 12px;font-size:18px;}
  .footer{margin-top:40px;text-align:center;border-top:2px solid #EDE0C4;padding-top:20px;font-size:12px;color:#8B6B3D;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .info-box{background:#FAF3E8;border-radius:8px;padding:14px;}
  .info-label{font-size:11px;color:#8B6B3D;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
  .info-value{font-size:14px;color:#1A0F00;font-weight:600;}
  .badge{display:inline-block;background:#EAF3DE;color:#27500A;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;}
</style></head><body>
  <div class="header">
    <img src="${logoUrl}" alt="Wênam" class="logo-img" onerror="this.style.display='none'" />
    <p class="brand">Wênam</p>
    <p class="sub">Avenue Al Majd 2, Rabat · +212 643 389 585</p>
    <p class="order-num">${order.orderNumber}</p>
    <p class="date">Commande du ${new Date(order.createdAt || Date.now()).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
  </div>
  <div class="section"><div class="section-title">Client</div>
    <div class="info-grid">
      <div class="info-box"><div class="info-label">Nom</div><div class="info-value">${user?.name || '—'}</div></div>
      <div class="info-box"><div class="info-label">Téléphone</div><div class="info-value">${user?.phone || '—'}</div></div>
    </div>
  </div>
  <div class="section"><div class="section-title">Adresse de livraison</div>
    <div class="info-box"><div class="info-value">${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}</div>
      ${order.deliveryAddress?.instructions ? `<div style="font-size:13px;color:#8B6B3D;margin-top:4px;">Note: ${order.deliveryAddress.instructions}</div>` : ''}
    </div>
  </div>
  <div class="section"><div class="section-title">Détail de la commande</div>
    <table><thead><tr><th>Plat</th><th style="text-align:center;">Qté</th><th style="text-align:right;">Montant</th></tr></thead>
      <tbody>${items}</tbody>
      <tr class="total-row"><td colspan="2" style="padding:10px 12px;font-weight:600;font-size:13px;">Sous-total</td><td style="padding:10px 12px;text-align:right;font-size:13px;">${Number(order.subtotal).toFixed(2)} MAD</td></tr>
      <tr class="total-row"><td colspan="2" style="padding:10px 12px;font-weight:600;font-size:13px;">Livraison</td><td style="padding:10px 12px;text-align:right;font-size:13px;">${Number(order.deliveryFee).toFixed(2)} MAD</td></tr>
      <tr class="grand-total"><td colspan="2" style="padding:14px 12px;">TOTAL</td><td style="padding:14px 12px;text-align:right;">${Number(order.total).toFixed(2)} MAD</td></tr>
    </table>
  </div>
  <div class="section"><div class="info-grid">
    <div class="info-box"><div class="info-label">Mode de paiement</div><div class="info-value">${order.paymentMethod === 'card' ? 'Carte bancaire' : 'Espèces à la livraison'}</div></div>
    <div class="info-box"><div class="info-label">Statut</div><div><span class="badge">✓ Commande reçue</span></div></div>
  </div></div>
  <div class="footer">
    <p>Merci pour votre commande ! · Wênam, Avenue Al Majd 2, Rabat</p>
    <p>Instagram: @itsWênam · Tél: +212 643 389 585</p>
    <p style="margin-top:8px;font-size:11px;color:#C4531A;">Wênam — Délicieuse Cuisine en Ligne</p>
  </div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Commande-Wenam-${order.orderNumber?.replace('#', '')}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
function sendWhatsApp(order, user) {
  const items = order.items.map(i => `  • ${i.name} x${i.quantity} — ${(i.price * i.quantity).toFixed(2)} MAD`).join('\n')
  const msg = `*Nouvelle commande Wênam* ${order.orderNumber}

*Client:* ${user?.name}
*Tél:* ${user?.phone || 'Non renseigné'}
*Adresse:* ${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}

*Commande:*
${items}

*Sous-total:* ${Number(order.subtotal).toFixed(2)} MAD
*Livraison:* ${Number(order.deliveryFee).toFixed(2)} MAD
*TOTAL: ${Number(order.total).toFixed(2)} MAD*

*Paiement:* ${order.paymentMethod === 'card' ? 'Carte bancaire' : 'Espèces à la livraison'}
${order.notes ? `*Note:* ${order.notes}` : ''}

_Commande passée le ${new Date().toLocaleString('fr-FR')}_`

  window.open(`https://wa.me/212643389585?text=${encodeURIComponent(msg)}`, '_blank')
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, clear } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || 'Rabat',
    zipCode: user?.address?.zipCode || '',
    instructions: '',
    paymentMethod: 'cash',
    notes: '',
  })

  // Card state
  const [cardData, setCardData] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState({})

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal + 15
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ── Validate card fields ──────────────────────────────────────────────────
  function validateCard() {
    const errs = {}
    const num = cardData.number.replace(/\D/g, '')
    if (num.length < 16) errs.number = 'Numéro invalide (16 chiffres requis)'
    else if (!luhn(num)) errs.number = 'Numéro de carte invalide'
    if (!cardData.holder.trim()) errs.holder = 'Nom requis'
    const [mm, yy] = cardData.expiry.replace(/\s/g, '').split('/')
    const now = new Date()
    const expMonth = parseInt(mm, 10)
    const expYear = 2000 + parseInt(yy, 10)
    if (!mm || !yy || expMonth < 1 || expMonth > 12) errs.expiry = 'Date invalide'
    else if (new Date(expYear, expMonth - 1) < new Date(now.getFullYear(), now.getMonth())) errs.expiry = 'Carte expirée'
    if (!cardData.cvv || cardData.cvv.length < 3) errs.cvv = 'CVV invalide'
    setCardErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.street || !form.city) { toast.error('Adresse de livraison requise'); return }
    if (form.paymentMethod === 'card' && !validateCard()) {
      toast.error('Veuillez corriger les informations de carte')
      return
    }
    setLoading(true)
    try {
      const payload = {
        items: items.map((i) => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        deliveryAddress: { street: form.street, city: form.city, zipCode: form.zipCode, instructions: form.instructions },
        paymentMethod: form.paymentMethod === 'card' ? 'card' : 'cash',
        notes: form.notes,
      }

      if (form.paymentMethod === 'card') {
        payload.cardData = {
          number: cardData.number.replace(/\D/g, ''),
          holder: cardData.holder,
          expiry: cardData.expiry.replace(/\s/g, ''),
          cvv: cardData.cvv,
          amount: total,
        }
      }

      const { data } = await api.post('/orders', payload)
      setOrder(data.order)
      clear()
      setStep(3)
      // Incrémenter le compteur de plats servis
      api.post('/settings/public/increment-orders').catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream">
      <style>{css}</style>
      <Navbar />
      <div className="checkout-wrap">

        {/* Steps */}
        <div className="steps">
          {[['1','Livraison'],['2','Paiement'],['3','Confirmation']].map(([n, label], i) => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
                background: step >= Number(n) ? '#C4531A' : '#F5ECD7',
                color: step >= Number(n) ? '#fff' : '#8B6B3D',
                transition: 'background 0.3s'
              }}>{n}</div>
              <span className="step-label" style={{ fontSize: 12, fontWeight: step >= Number(n) ? 600 : 400, color: step >= Number(n) ? '#C4531A' : '#8B6B3D' }}>{label}</span>
              {i < 2 && <div style={{ height: 2, flex: 1, marginLeft: 4, background: step > Number(n) ? '#C4531A' : '#e5e7eb', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 — Livraison */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
              className="checkout-card">
              <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:24, display:'flex', alignItems:'center', gap:8 }}>
                <MapPin size={18} color="#C4531A" /> Adresse de livraison
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Rue *</label>
                  <input name="street" value={form.street} onChange={handleChange} placeholder="123 Avenue Al Majd" className="input" style={{ width:'100%', boxSizing:'border-box' }} />
                </div>
                <div className="form-grid-2">
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Ville *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Rabat" className="input" style={{ width:'100%', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Code postal</label>
                    <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="10000" className="input" style={{ width:'100%', boxSizing:'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Instructions</label>
                  <textarea name="instructions" value={form.instructions} onChange={handleChange} placeholder="Sonnette 2ème étage..." rows={2} className="input resize-none" style={{ width:'100%', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Note pour le restaurant</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Pas trop épicé, allergie aux noix..." rows={2} className="input resize-none" style={{ width:'100%', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid #e5e7eb' }}>
                <p style={{ fontSize:12, color:'#8B6B3D', marginBottom:12 }}>{items.length} article(s) · Total: <strong style={{ color:'#C4531A' }}>{total.toFixed(2)} MAD</strong></p>
                <button onClick={() => setStep(2)} className="btn-primary" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  Continuer <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Paiement */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
              className="checkout-card">
              <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:24, display:'flex', alignItems:'center', gap:8 }}>
                <CreditCard size={18} color="#C4531A" /> Mode de paiement
              </h2>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                {[
                  { key:'cash',     icon:Banknote,   label:'Paiement à la livraison', desc:'Payez en espèces à la réception' },
                  { key:'card',     icon:CreditCard, label:'Carte bancaire',           desc:'Visa, Mastercard — paiement immédiat' },
                  { key:'transfer', icon:Building2,  label:'Virement bancaire',        desc:'CIH Bank · BMCE Bank' },
                ].map(({ key, icon:Icon, label, desc }) => (
                  <div key={key}>
                    <label style={{
                      display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:12,
                      border: `2px solid ${form.paymentMethod === key ? '#C4531A' : '#e5e7eb'}`,
                      background: form.paymentMethod === key ? 'rgba(196,83,26,0.04)' : '#fff',
                      cursor:'pointer', transition:'all 0.2s'
                    }}>
                      <input type="radio" name="paymentMethod" value={key} checked={form.paymentMethod === key} onChange={handleChange} style={{ accentColor:'#C4531A' }} />
                      <Icon size={18} color={form.paymentMethod === key ? '#C4531A' : '#9ca3af'} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight:600, fontSize:14, margin:0 }}>{label}</p>
                        <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{desc}</p>
                      </div>
                      {key === 'card' && form.paymentMethod === 'card' && (
                        <div style={{ display:'flex', gap:4 }}>
                          {['Visa','MC'].map(n => (
                            <span key={n} style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'#fff', border:'1px solid #EDE0C4', color:'#8B6B3D' }}>{n}</span>
                          ))}
                        </div>
                      )}
                    </label>

                    {/* Formulaire carte */}
                    <AnimatePresence>
                      {key === 'card' && form.paymentMethod === 'card' && (
                        <CardForm cardData={cardData} setCardData={setCardData} errors={cardErrors} />
                      )}
                    </AnimatePresence>

                    {/* Coordonnées virement */}
                    <AnimatePresence>
                      {key === 'transfer' && form.paymentMethod === 'transfer' && (
                        <TransferInfo />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Récapitulatif montant */}
              <div style={{ background:'#FAF3E8', borderRadius:12, padding:16, marginBottom:20 }}>
                {[['Sous-total', `${subtotal.toFixed(2)} MAD`], ['Livraison', '15.00 MAD']].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'#8B6B3D', marginBottom:8 }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, paddingTop:10, borderTop:'1px solid #e5e7eb' }}>
                  <span>Total</span><span style={{ color:'#C4531A', fontSize:18 }}>{total.toFixed(2)} MAD</span>
                </div>
              </div>

              <div className="confirm-btns">
                <button onClick={() => setStep(1)} className="btn-outline" style={{ flex:1 }}>Retour</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {loading && <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />}
                  {loading ? 'Traitement...' : form.paymentMethod === 'card' ? `Payer ${total.toFixed(2)} MAD` : 'Confirmer la commande'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Confirmation */}
          {step === 3 && order && (
            <motion.div key="s3" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              className="checkout-card" style={{ textAlign:'center' }}>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.2 }}
                style={{ width:72, height:72, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <CheckCircle size={36} color="#16a34a" />
              </motion.div>

              <img src="/images/wenam-logo.png" alt="Wenam" style={{ width:80, margin:'20px auto 4px', display:'block', mixBlendMode:'multiply' }} />

              <h2 className="font-display confirm-title" style={{ fontWeight:700, marginBottom:8 }}>Commande confirmée !</h2>
              <p className="font-display confirm-order-num" style={{ color:'#C4531A', fontWeight:700, marginBottom:6 }}>{order.orderNumber}</p>
              <p style={{ fontSize:13, color:'#8B6B3D', marginBottom:4 }}>Livraison estimée: <strong style={{ color:'#1A0F00' }}>45–60 minutes</strong></p>
              <p style={{ fontSize:12, color:'#8B6B3D', marginBottom:4 }}>Wênam · Avenue Al Majd 2, Rabat</p>
              {form.paymentMethod === 'card' && (
                <p style={{ fontSize:12, color:'#16a34a', marginBottom:20, fontWeight:600 }}>✓ Paiement par carte accepté</p>
              )}
              {form.paymentMethod === 'transfer' && (
                <p style={{ fontSize:12, color:'#d97706', marginBottom:20, fontWeight:600 }}>⏳ Pensez à effectuer votre virement bancaire</p>
              )}
              {form.paymentMethod === 'cash' && (
                <p style={{ fontSize:12, color:'#8B6B3D', marginBottom:28 }}>Paiement en espèces à la livraison</p>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                <button onClick={() => navigate(`/orders/${order._id}/track`)} className="btn-primary" style={{ width:'100%' }}>
                  Suivre ma commande en temps réel
                </button>
                <button onClick={() => { generateOrderPDF(order, user); toast.success('Récapitulatif téléchargé !') }}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#FAF3E8', border:'1px solid #e5e7eb', color:'#1A0F00', fontWeight:600, fontSize:13, padding:'12px 20px', borderRadius:10, cursor:'pointer' }}>
                  <Download size={15} color="#C4531A" /> Télécharger le récapitulatif PDF
                </button>
                <button onClick={() => { sendWhatsApp(order, user); toast.success('Message WhatsApp ouvert !') }}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#22c55e', color:'#fff', fontWeight:600, fontSize:13, padding:'12px 20px', borderRadius:10, border:'none', cursor:'pointer' }}>
                  <MessageCircle size={15} /> Envoyer via WhatsApp
                </button>
                <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'#8B6B3D', fontSize:13, cursor:'pointer', padding:'8px' }}>
                  Retour à l'accueil
                </button>
              </div>

              <div style={{ background:'#FAF3E8', borderRadius:14, padding:16, textAlign:'left' }}>
                <p style={{ fontSize:11, color:'#8B6B3D', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Récapitulatif</p>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#5C3D11', padding:'4px 0' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontWeight:600 }}>{(item.price * item.quantity).toFixed(2)} MAD</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15, paddingTop:10, borderTop:'1px solid #e5e7eb', marginTop:6 }}>
                  <span>Total</span><span style={{ color:'#C4531A' }}>{order.total} MAD</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
