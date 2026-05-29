import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (sessionStorage.getItem('pwa-dismissed')) return

    if (isIOS()) {
      setIos(true)
      setTimeout(() => setVisible(true), 2000)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setVisible(false))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setVisible(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 12, right: 12, zIndex: 9999,
      background: '#fff', borderRadius: 18,
      boxShadow: '0 8px 32px rgba(26,15,0,0.2)',
      border: '1.5px solid #EDE0C4',
      animation: 'slideUp 0.35s ease',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px 10px' }}>
        <img src="/images/wenam-logo.png" alt="Wenam"
          style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply', borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A0F00', fontFamily: "'Playfair Display',serif" }}>Wênam</p>
          <p style={{ margin: 0, fontSize: 12, color: '#8B6B3D' }}>Ajouter à l'écran d'accueil</p>
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={18} color="#8B6B3D" />
        </button>
      </div>

      {ios ? (
        /* Instructions iOS */
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ background: '#FAF3E8', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#5C3D11' }}>
              Pour ajouter sur iPhone :
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>1️⃣</span>
              <p style={{ margin: 0, fontSize: 13, color: '#5C3D11' }}>
                Appuie sur <strong>Partager</strong>
                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </span>
                {' '}en bas de Safari
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>2️⃣</span>
              <p style={{ margin: 0, fontSize: 13, color: '#5C3D11' }}>
                Choisis <strong>« Sur l'écran d'accueil »</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Bouton Android/Chrome */
        <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
          <button onClick={handleInstall} style={{
            flex: 1, background: '#C4531A', color: '#fff', border: 'none',
            borderRadius: 12, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            Installer l'application
          </button>
        </div>
      )}
    </div>
  )
}
