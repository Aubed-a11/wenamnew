import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Bienvenue !')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E8', display: 'flex', flexDirection: 'column' }}
      className="lg:flex-row">

      {/* Panel ardoise — bannière mobile, colonne desktop */}
      <div style={{
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #222 100%)',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
        }}
        className="w-full h-56 lg:h-auto lg:w-1/2 lg:min-h-screen">
        {/* Texture ardoise */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23ffffff\' fill-opacity=\'0.03\'/%3E%3C/svg%3E")', opacity: 0.6 }} />
        {/* Cadre bois */}
        <div style={{ position: 'absolute', inset: 10, border: '6px solid #5C3A1E', borderRadius: 8, boxShadow: '0 0 0 2px #3B2410, inset 0 0 0 1px rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '28px 40px' }}>
          <img
            src="/images/wenam-logo.png" alt="Wenam"
            style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 14, filter: 'brightness(0) invert(1)', opacity: 0.95 }}
            className="lg:w-40 lg:h-40 lg:mb-6"
          />
          <h1 className="font-display" style={{ fontSize: 'clamp(26px,6vw,44px)', fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '0.02em' }}>wênam</h1>
          <p className="font-display" style={{ fontSize: 'clamp(11px,1.8vw,16px)', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.05em' }}>
            Better Food, Better Mood
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 420 }}
        >

          <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 8 }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, marginBottom: 6 }}>
              Bon retour !
            </h1>
            <p style={{ fontSize: 13, color: '#8B6B3D' }}>Connectez-vous pour commander</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

            {/* Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8B6B3D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mot de passe
                </label>
                <Link to="/forgot-password" style={{ fontSize: 11, color: '#C4531A', fontWeight: 600, textDecoration: 'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8B6B3D' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#C4531A', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
