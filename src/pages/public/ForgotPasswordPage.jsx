import { motion } from 'framer-motion'
import { ArrowLeft, Mail } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Code envoyé ! Vérifiez votre boîte mail.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur, réessayez')
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
            Mot de passe oublié
          </h1>
          <p style={{ fontSize: 13, color: '#8B6B3D', margin: 0 }}>
            {sent ? 'Vérifiez votre boîte mail' : 'Entrez votre email pour recevoir un code'}
          </p>
        </div>

        {!sent ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D4B896', padding: '28px 24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Adresse email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    style={inp}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? '#D4B896' : '#C4531A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
              >
                {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #D4B896', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, background: 'rgba(196,83,26,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={26} color="#C4531A" />
            </div>
            <p style={{ fontSize: 15, color: '#1A0F00', fontWeight: 600, margin: '0 0 8px' }}>Code envoyé à</p>
            <p style={{ fontSize: 14, color: '#C4531A', fontWeight: 700, margin: '0 0 20px' }}>{email}</p>
            <p style={{ fontSize: 13, color: '#8B6B3D', margin: '0 0 24px' }}>
              Vérifiez votre boîte mail (et vos spams). Le code expire dans <strong>1 heure</strong>.
            </p>
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              style={{ width: '100%', padding: '12px', background: '#C4531A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Entrer mon code
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8B6B3D' }}>
          <Link to="/login" style={{ color: '#C4531A', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> Retour à la connexion
          </Link>
        </p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
