import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

const COUNTRIES = [
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: '+240', flag: '🇬🇶', name: 'Guinée Équatoriale' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+20',  flag: '🇪🇬', name: 'Égypte' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+235', flag: '🇹🇩', name: 'Tchad' },
  { code: '+236', flag: '🇨🇫', name: 'Centrafrique' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie' },
  { code: '+249', flag: '🇸🇩', name: 'Soudan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzanie' },
  { code: '+256', flag: '🇺🇬', name: 'Ouganda' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+27',  flag: '🇿🇦', name: 'Afrique du Sud' },
  { code: '+251', flag: '🇪🇹', name: 'Éthiopie' },
  { code: '+252', flag: '🇸🇴', name: 'Somalie' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+260', flag: '🇿🇲', name: 'Zambie' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: '+49',  flag: '🇩🇪', name: 'Allemagne' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne' },
  { code: '+39',  flag: '🇮🇹', name: 'Italie' },
  { code: '+31',  flag: '🇳🇱', name: 'Pays-Bas' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+966', flag: '🇸🇦', name: 'Arabie Saoudite' },
  { code: '+971', flag: '🇦🇪', name: 'Émirats Arabes Unis' },
  { code: '+86',  flag: '🇨🇳', name: 'Chine' },
  { code: '+91',  flag: '🇮🇳', name: 'Inde' },
  { code: '+55',  flag: '🇧🇷', name: 'Brésil' },
]

function PhoneInput({ onChange }) {
  const [dialCode, setDialCode] = useState('+212')
  const [number, setNumber] = useState('')

  const handleNumber = (e) => {
    const val = e.target.value
    setNumber(val)
    onChange(`${dialCode}${val}`)
  }

  const handleDial = (e) => {
    const code = e.target.value
    setDialCode(code)
    onChange(`${code}${number}`)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <select
          value={dialCode}
          onChange={handleDial}
          style={{
            height: '100%', padding: '0 28px 0 10px',
            border: '1px solid #D4B896', borderRadius: 8, fontSize: 13,
            fontFamily: 'Lato,sans-serif', background: '#FAF3E8', color: '#1A0F00',
            cursor: 'pointer', appearance: 'none', outline: 'none', minWidth: 95,
          }}
        >
          {COUNTRIES.map((c, i) => (
            <option key={i} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: '#8B6B3D' }}>▼</span>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
        <input
          type="text"
          inputMode="numeric"
          value={number}
          onChange={handleNumber}
          placeholder="612345678"
          className="input"
          style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort'][pwStrength]
  const strengthColor = ['', '#f87171', '#fbbf24', '#22c55e'][pwStrength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Mot de passe trop court (min. 6 caractères)'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Compte créé ! Bienvenue chez Wênam')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* Left panel desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-dark relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800"
          alt="Cuisine"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex flex-col justify-center items-center px-16 text-center">
          <img
            src="/images/wenam-logo.png" alt="Wenam" style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 24, display: 'block', margin: '0 auto 24px', mixBlendMode: 'screen' }}
          />
          <h1 className="font-display text-5xl font-bold text-white mb-4">Wênam</h1>
          <p className="font-display text-xl italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Cuisine africaine façon Bénin : du cœur à l'assiette
          </p>
        </div>
      </div>

      {/* Right panel form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo mobile */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/images/wenam-logo.png" alt="Wenam" style={{ width: 90, height: 90, objectFit: 'contain', display: 'block', margin: '0 auto 12px', mixBlendMode: 'multiply' }}
            />
            <h2 className="font-display lg:hidden" style={{ fontSize: 22, fontWeight: 700, color: '#C4531A', marginBottom: 4 }}>
              Wênam
            </h2>
            <p style={{ fontSize: 11, color: '#C4531A', fontStyle: 'italic' }}>Cuisine africaine façon Bénin</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, marginBottom: 6 }}>
              Créer un compte
            </h1>
            <p style={{ fontSize: 13, color: '#8B6B3D' }}>Rejoignez la famille Wênam</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nom */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nom complet
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Sophie Martel"
                  required
                  className="input"
                  style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                  className="input"
                  style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Téléphone
              </label>
              <PhoneInput onChange={phone => setForm({ ...form, phone })} />
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 caractères"
                  required
                  className="input"
                  style={{ paddingLeft: 36, paddingRight: 40, width: '100%', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D', padding: 0 }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: '#F5ECD7', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: strengthColor, width: `${(pwStrength / 3) * 100}%`, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#8B6B3D' }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', marginTop: 4 }}
            >
              {loading && (
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8B6B3D' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#C4531A', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
