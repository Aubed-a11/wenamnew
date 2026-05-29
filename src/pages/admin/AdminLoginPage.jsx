import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { adminLogin } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await adminLogin(form.email, form.password)
      if (user.role !== 'admin') {
        toast.error('Accès réservé aux administrateurs')
        return
      }
      toast.success(`Bienvenue, ${user.name} !`)
      navigate('/admin', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Lato, sans-serif' }}>

      {/* Left panel */}
      <div
        style={{ width: '45%', background: '#8B3A0F', display: 'none', alignItems: 'center', padding: '0 64px', position: 'relative', overflow: 'hidden' }}
        className="admin-left-panel"
      >
        <style>{`@media(min-width:768px){.admin-left-panel{display:flex!important}}`}</style>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img
            src="/images/wenam-logo.png" alt="Wenam" style={{ width: 110, height: 110, objectFit: 'contain', display: 'block', margin: '0 auto 16px', mixBlendMode: 'screen' }}
          />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Wênam</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>
            Cuisine africaine façon Bénin :
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', margin: '0 0 36px' }}>
            du coeur à l'assiette
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', margin: '0 0 32px' }}>
            Espace Administrateur
          </p>
          {[
            'Gestion des commandes en temps réel',
            'Tableau de bord analytique',
            'Contrôle du menu et des plats',
            'Notifications client automatiques',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8763A', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF3E8', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img
              src="/images/wenam-logo.png" alt="Wenam" style={{ width: 120, height: 120, objectFit: 'contain', display: 'block', margin: '0 auto 16px', mixBlendMode: 'multiply' }}
            />
            <div style={{ width: 60, height: 60, background: 'rgba(196,83,26,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={28} color="#C4531A" />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A0F00', margin: '0 0 6px' }}>
              Connexion Admin
            </h1>
            <p style={{ color: '#8B6B3D', fontSize: 14, margin: 0 }}>Accès réservé au personnel autorisé</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Email administrateur
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@wenam.ma"
                  required
                  autoComplete="email"
                  style={{ width: '100%', padding: '11px 12px 11px 38px', border: '1px solid #D4B896', borderRadius: 10, fontSize: 14, background: '#fff', color: '#1A0F00', outline: 'none', boxSizing: 'border-box', fontFamily: 'Lato, sans-serif' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '11px 40px 11px 38px', border: '1px solid #D4B896', borderRadius: 10, fontSize: 14, background: '#fff', color: '#1A0F00', outline: 'none', boxSizing: 'border-box', fontFamily: 'Lato, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#D4B896' : '#C4531A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Lato, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'background 0.2s' }}
            >
              {loading && (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              )}
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      </div>
    </div>
  )
}
