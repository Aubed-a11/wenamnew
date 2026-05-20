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

      {/* Panel image — bannière mobile, colonne desktop */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#1A0F00', flexShrink: 0 }}
        className="w-full h-52 lg:h-auto lg:w-1/2 lg:min-h-screen">
        <img
          src="https://images.unsplash.com/photo-1603496987674-79600a000f55?w=800"
          alt="Restaurant"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 32px' }}>
          <img
            src="/images/wenam-logo.png" alt="Wenam"
            style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12, mixBlendMode: 'screen' }}
            className="lg:w-36 lg:h-36 lg:mb-6"
          />
          <h1 className="font-display" style={{ fontSize: 'clamp(26px,6vw,48px)', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Wênam</h1>
          <p className="font-display" style={{ fontSize: 'clamp(12px,2vw,18px)', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Cuisine africaine façon Bénin : du cœur à l'assiette
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
