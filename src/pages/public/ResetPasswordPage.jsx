import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const emailFromUrl = params.get('email') || ''

  const [form, setForm] = useState({ email: emailFromUrl, code: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email: form.email,
        code: form.code,
        password: form.password,
      })
      setDone(true)
      toast.success('Mot de passe modifié !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '11px 12px 11px 38px', border: '1px solid #D4B896',
    borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Lato, sans-serif', background: '#fff', color: '#1A0F00',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF3E8', padding: '24px 16px', fontFamily: 'Lato, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/images/wenam-logo.png" alt="Wenam"
            style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 12px', mixBlendMode: 'multiply' }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A0F00', margin: '0 0 6px' }}>
            Nouveau mot de passe
          </h1>
          <p style={{ fontSize: 13, color: '#8B6B3D', margin: 0 }}>
            {done ? 'Votre mot de passe a été modifié' : 'Entrez le code reçu par email'}
          </p>
        </div>

        {!done ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D4B896', padding: '28px 24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Email (pré-rempli) */}
              {!emailFromUrl && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                    style={{ ...inp, paddingLeft: 12 }}
                  />
                </div>
              )}

              {/* Code */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Code reçu par email
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="123456"
                    required
                    style={{ ...inp, letterSpacing: 6, fontSize: 20, textAlign: 'center', paddingLeft: 38 }}
                  />
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ ...inp, paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D', padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirmer */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    required
                    style={inp}
                  />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? '#D4B896' : '#C4531A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
              >
                {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
                {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D4B896', padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(22,101,52,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: 30 }}>✓</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>Mot de passe modifié !</p>
            <p style={{ fontSize: 13, color: '#8B6B3D', margin: '0 0 24px' }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '12px', background: '#C4531A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Se connecter
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8B6B3D' }}>
          <Link to="/forgot-password" style={{ color: '#C4531A', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> Renvoyer un code
          </Link>
        </p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
