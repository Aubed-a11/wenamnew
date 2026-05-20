import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, ChevronDown, Menu, X, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useCartStore } from '../../store'
import toast from 'react-hot-toast'

const css = `
  .nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .nav-logo-text { display: block; }
  .nav-logo-sub { display: block; }
  .nav-links { display: none; gap: 24px; }
  .nav-desktop-auth { display: none; }
  .nav-mobile-toggle { display: flex; }
  .nav-connexion-btn { display: none; }

  @media (min-width: 768px) {
    .nav-inner { height: 68px; padding: 0 24px; }
    .nav-links { display: flex; }
    .nav-desktop-auth { display: flex; align-items: center; gap: 10px; }
    .nav-mobile-toggle { display: none; }
    .nav-connexion-btn { display: flex; }
  }

  /* Sur mobile, cacher le texte "Better Food..." sous le logo */
  @media (max-width: 480px) {
    .nav-logo-sub { display: none; }
    .nav-logo-text { font-size: 18px !important; }
  }
`

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    setUserOpen(false)
    await logout()
    toast.success('À bientôt !')
    navigate('/')
  }

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FAF3E8', borderBottom: '1px solid #D4B896', boxShadow: '0 1px 6px rgba(139,58,15,0.08)', fontFamily: 'Lato,sans-serif' }}>
      <style>{css}</style>
      <div className="nav-inner">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/images/wenam-logo.png" alt="Wênam" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ lineHeight: 1 }}>
            <p className="nav-logo-text" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#8B3A0F', margin: 0 }}>wênam</p>
            <p className="nav-logo-sub" style={{ fontSize: 7, letterSpacing: '0.18em', color: '#8B6B3D', textTransform: 'uppercase', margin: 0 }}>Better Food, Better Mood</p>
          </div>
        </Link>

        {/* Nav links — desktop uniquement */}
        <div className="nav-links">
          {[['Accueil', '/'], ['Menu', '/menu']].map(([l, t]) => (
            <Link key={t} to={t} style={{ fontSize: 14, fontWeight: 600, color: '#5C3D11', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>

        {/* Actions desktop */}
        <div className="nav-desktop-auth">
          {!isAdmin && (
            <Link to="/cart" style={{ position: 'relative', padding: 8, display: 'flex', borderRadius: 8, color: '#1A0F00', textDecoration: 'none' }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#C4531A', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
              )}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#C4531A', color: '#fff', padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          )}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserOpen(!userOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: '#F5ECD7', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(196,83,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C4531A' }}>
                  {user.name?.[0]}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A0F00' }}>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} color="#8B6B3D" />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setUserOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, background: '#fff', borderRadius: 12, border: '1px solid #D4B896', boxShadow: '0 8px 24px rgba(139,58,15,0.15)', zIndex: 50, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: '#FAF3E8', borderBottom: '1px solid #EDE0C4' }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#1A0F00', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: '#8B6B3D', margin: 0 }}>{isAdmin ? 'Administrateur' : user.email}</p>
                      </div>
                      {isAdmin ? (
                        <Link to="/admin" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#1A0F00', textDecoration: 'none' }}>
                          <LayoutDashboard size={14} color="#C4531A" /> Tableau de bord
                        </Link>
                      ) : (
                        <Link to="/profile" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#1A0F00', textDecoration: 'none' }}>
                          <User size={14} color="#C4531A" /> Mon profil
                        </Link>
                      )}
                      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#DC2626', background: 'none', border: 'none', borderTop: '1px solid #EDE0C4', cursor: 'pointer', fontFamily: 'Lato,sans-serif' }}>
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="nav-connexion-btn" style={{ background: '#C4531A', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Connexion</Link>
          )}
        </div>

        {/* Mobile — panier + hamburger seulement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-mobile-toggle">
          {!isAdmin && (
            <Link to="/cart" style={{ position: 'relative', padding: 8, display: 'flex', borderRadius: 8, color: '#1A0F00', textDecoration: 'none' }}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#C4531A', color: '#fff', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
              )}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex' }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #D4B896', background: '#FAF3E8' }}>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['Accueil', '/'], ['Menu', '/menu']].map(([l, t]) => (
                <Link key={t} to={t} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4' }}>{l}</Link>
              ))}
              {!isAdmin && (
                <Link to="/cart" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} /> Panier {count > 0 && `(${count})`}
                </Link>
              )}
              {user && !isAdmin && (
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} /> Mon profil
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#C4531A', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayoutDashboard size={16} /> Dashboard Admin
                </Link>
              )}
              {user ? (
                <button onClick={() => { setMenuOpen(false); handleLogout() }}
                  style={{ fontSize: 15, fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', padding: '10px 0', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogOut size={16} /> Déconnexion
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 700, color: '#fff', background: '#C4531A', textDecoration: 'none', padding: '12px 20px', borderRadius: 10, textAlign: 'center', marginTop: 8 }}>
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
