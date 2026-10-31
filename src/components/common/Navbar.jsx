import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, ChevronDown, Menu, X, LayoutDashboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useCartStore } from '../../store'
import toast from 'react-hot-toast'
import { useT } from '../../i18n'
import { useMiawezon, isMiawezonVisible } from '../../store/miawezon'

function NewBadge({ label }) {
  return (
    <span style={{ background: '#946420', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999, letterSpacing: '0.02em', lineHeight: 1.4 }}>{label}</span>
  )
}

function LangSwitch({ lang, setLang }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }} aria-label="Langue / Language">
      {['fr', 'en'].map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && <span style={{ color: '#D4B896' }}>|</span>}
          <button type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: lang === l ? '#946420' : '#8B6B3D', fontWeight: lang === l ? 800 : 600, fontFamily: 'Lato,sans-serif', fontSize: 12 }}>
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}

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
  const { t, lang, setLang } = useT()
  const location = useLocation()
  const mzData = useMiawezon((s) => s.data)
  const loadMz = useMiawezon((s) => s.load)
  useEffect(() => { loadMz() }, [loadMz, user?.role])
  const showMz = isMiawezonVisible(mzData)
  const links = [
    [t('nav.home'), '/'],
    [t('nav.menu'), '/menu'],
    ...(showMz ? [[t('nav.miawezon'), '/miawezon', true]] : []),
  ]
  const isMz = location.pathname.startsWith('/miawezon')
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))

  const handleLogout = async () => {
    setUserOpen(false)
    await logout()
    toast.success(t('nav.bye'))
    navigate('/')
  }

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FAF3E8', borderBottom: '1px solid #D4B896', boxShadow: '0 1px 6px rgba(59,36,16,0.08)', fontFamily: 'Lato,sans-serif' }}>
      <style>{css}</style>
      <div className="nav-inner">

        {/* Logo : MIAWEZON dans sa rubrique, Wenam ailleurs */}
        {isMz ? (
          <Link to="/miawezon" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <img src="/images/miawezon/logo-dark.png" alt="MIAWÉZON by Wênam" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
          </Link>
        ) : (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <img src="/images/wenam-logo.png" alt="Wênam" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ lineHeight: 1 }}>
              <p className="nav-logo-text" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#3B2410', margin: 0 }}>wênam</p>
              <p className="nav-logo-sub" style={{ fontSize: 7, letterSpacing: '0.18em', color: '#8B6B3D', textTransform: 'uppercase', margin: 0 }}>Better Food, Better Mood</p>
            </div>
          </Link>
        )}

        {/* Nav links — desktop uniquement */}
        <div className="nav-links">
          {links.map(([l, to, isNew]) => (
            <Link key={to} to={to} style={{ fontSize: 14, fontWeight: 600, color: isActive(to) ? '#946420' : '#5C3D11', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, borderBottom: isActive(to) ? '2px solid #946420' : '2px solid transparent', paddingBottom: 2 }}>
              {l}{isNew && <NewBadge label={t('nav.new')} />}
            </Link>
          ))}
        </div>

        {/* Actions desktop */}
        <div className="nav-desktop-auth">
          <LangSwitch lang={lang} setLang={setLang} />
          {!isAdmin && (
            <Link to="/cart" style={{ position: 'relative', padding: 8, display: 'flex', borderRadius: 8, color: '#1A0F00', textDecoration: 'none' }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#946420', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
              )}
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#946420', color: '#fff', padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              <LayoutDashboard size={15} /> {t('nav.dashboard')}
            </Link>
          )}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserOpen(!userOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: '#F5ECD7', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(148,100,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#946420' }}>
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
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200, background: '#fff', borderRadius: 12, border: '1px solid #D4B896', boxShadow: '0 8px 24px rgba(59,36,16,0.15)', zIndex: 50, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: '#FAF3E8', borderBottom: '1px solid #EDE0C4' }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#1A0F00', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: '#8B6B3D', margin: 0 }}>{isAdmin ? t('nav.administrator') : user.email}</p>
                      </div>
                      {isAdmin ? (
                        <Link to="/admin" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#1A0F00', textDecoration: 'none' }}>
                          <LayoutDashboard size={14} color="#946420" /> {t('nav.board')}
                        </Link>
                      ) : (
                        <Link to="/profile" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#1A0F00', textDecoration: 'none' }}>
                          <User size={14} color="#946420" /> {t('nav.profile')}
                        </Link>
                      )}
                      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#DC2626', background: 'none', border: 'none', borderTop: '1px solid #EDE0C4', cursor: 'pointer', fontFamily: 'Lato,sans-serif' }}>
                        <LogOut size={14} /> {t('nav.logout')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="nav-connexion-btn" style={{ background: '#946420', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{t('nav.login')}</Link>
          )}
        </div>

        {/* Mobile — panier + hamburger seulement */}
        <div style={{ alignItems: 'center', gap: 4 }} className="nav-mobile-toggle">
          <LangSwitch lang={lang} setLang={setLang} />
          {!isAdmin && (
            <Link to="/cart" style={{ position: 'relative', padding: 8, display: 'flex', borderRadius: 8, color: '#1A0F00', textDecoration: 'none' }}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#946420', color: '#fff', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
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
              {links.map(([l, to, isNew]) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: isActive(to) ? '#946420' : '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {l}{isNew && <NewBadge label={t('nav.new')} />}
                </Link>
              ))}
              {!isAdmin && (
                <Link to="/cart" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={16} /> {t('nav.cart')} {count > 0 && `(${count})`}
                </Link>
              )}
              {user && !isAdmin && (
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1A0F00', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} /> {t('nav.profile')}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 600, color: '#946420', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid #EDE0C4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayoutDashboard size={16} /> {t('nav.adminDashboard')}
                </Link>
              )}
              {user ? (
                <button onClick={() => { setMenuOpen(false); handleLogout() }}
                  style={{ fontSize: 15, fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', padding: '10px 0', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 15, fontWeight: 700, color: '#fff', background: '#946420', textDecoration: 'none', padding: '12px 20px', borderRadius: 10, textAlign: 'center', marginTop: 8 }}>
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
