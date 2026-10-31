import { useEffect, useState } from 'react'
import { connectSocket } from '../../utils/socket'
import toast from 'react-hot-toast'
import { useMzPending } from '../../store/miawezonAdmin'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList,
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Image,
  Star, Users, Settings, LogOut, Menu, X, ChevronRight, ExternalLink, Ticket, ScanLine
} from 'lucide-react'
import { useAuthStore } from '../../store'

const NAV = [
  { to: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/orders',   label: 'Commandes',   icon: ShoppingBag },
  { to: '/admin/menu',     label: 'Menu',         icon: UtensilsCrossed },
  { to: '/admin/gallery',  label: 'Galerie',      icon: Image },
  { to: '/admin/reviews',  label: 'Avis',         icon: Star },
  { to: '/admin/users',    label: 'Utilisateurs', icon: Users },
  { to: '/admin/settings', label: 'Paramètres',   icon: Settings },
  { to: '/admin/miawezon', label: 'MIAWÉZON',     icon: Ticket, exact: true },
  { to: '/admin/miawezon/controle', label: 'Contrôle billets', icon: ScanLine },
  { to: '/admin/miawezon/participants', label: 'Participants', icon: ClipboardList },
]

const css = `
  * { box-sizing: border-box; }
  .admin-layout { display: flex; min-height: 100vh; background: #FAF3E8; font-family: 'Lato', sans-serif; }
  .admin-sidebar {
    width: 240px; flex-shrink: 0; background: #1A0F00;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    transition: transform 0.3s ease;
  }
  .admin-sidebar.closed { transform: translateX(-100%); }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
  .sidebar-overlay.show { display: block; }
  .admin-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }
  .admin-topbar {
    height: 56px; background: #fff; border-bottom: 1px solid #EDE0C4;
    display: flex; align-items: center; padding: 0 20px; gap: 12px;
    position: sticky; top: 0; z-index: 50;
  }
  .menu-toggle { display: none; background: none; border: none; cursor: pointer; color: #1A0F00; padding: 4px; }
  .admin-content { flex: 1; padding: 28px 24px; max-width: 1400px; width: 100%; }
  @media (max-width: 768px) {
    .admin-sidebar { transform: translateX(-100%); }
    .admin-sidebar.open { transform: translateX(0); }
    .admin-main { margin-left: 0; }
    .menu-toggle { display: flex; align-items: center; justify-content: center; }
    .admin-content { padding: 20px 16px; }
  }
`

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const { pending, refresh } = useMzPending()

  // Reçus de virement MIAWEZON : badge (toutes les minutes) et alerte en temps reel
  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 60000)
    const socket = connectSocket((s, token) => s.emit('join_admin', token))
    socket.on('miawezon:proof', (d) => {
      refresh()
      toast((tt) => (
        <span className="text-sm">
          <strong>Nouveau reçu de virement</strong><br />
          {d.orderNumber} · {Number(d.total || 0).toLocaleString('fr-FR')} DH{' '}
          <button className="underline text-primary font-semibold" onClick={() => { toast.dismiss(tt.id); navigate(`/admin/miawezon?commande=${d._id}`) }}>Voir</button>
        </span>
      ), { duration: 10000 })
    })
    return () => { clearInterval(timer); socket.disconnect() }
  }, [refresh])

  const isMzAdmin = location.pathname.startsWith('/admin/miawezon')
  const isActive = (to) => {
    if (to === '/admin') return location.pathname === '/admin'
    if (NAV.find((n) => n.to === to)?.exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }
  const handleLogout = async () => { await logout(); navigate('/admin/login') }
  const currentPage = NAV.find(n => isActive(n.to))?.label || 'Dashboard'

  return (
    <>
      <style>{css}</style>
      <div className="admin-layout">

        {/* Overlay mobile */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>

          {/* Logo : MIAWEZON sur les pages admin MIAWEZON, Wenam ailleurs */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {isMzAdmin ? (
              <div>
                <img src="/images/miawezon/logo-gold.png" alt="MIAWÉZON by Wênam" style={{ height: 44, width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin MIAWÉZON</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/images/wenam-logo.png"
                    alt="Wênam"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Wênam</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</p>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = isActive(to)
              return (
                <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                    marginBottom: 2, textDecoration: 'none', transition: 'all 0.15s',
                    background: active ? 'rgba(196,83,26,0.2)' : 'transparent',
                    color: active ? '#E8763A' : 'rgba(255,255,255,0.6)',
                  }}>
                  <Icon size={16} />
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{label}</span>
                  {to === '/admin/miawezon' && pending > 0 && (
                    <span title="Reçus de virement à valider" style={{ marginLeft: 'auto', background: '#EA580C', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '2px 7px', lineHeight: 1.4 }}>{pending}</span>
                  )}
                  {active && <ChevronRight size={13} style={{ marginLeft: to === '/admin/miawezon' && pending > 0 ? 6 : 'auto' }} />}
                </Link>
              )
            })}
          </nav>

          {/* User + logout */}
          <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(196,83,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8763A', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {user?.name?.[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Administrateur</p>
              </div>
            </div>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'left' }}>
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="admin-main">
          <div className="admin-topbar">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#1A0F00', margin: 0, flex: 1 }}>{currentPage}</h1>
            <a href="/" target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, background:'#C4531A', color:'#fff', padding:'7px 14px', borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:12, fontFamily:'Lato,sans-serif', flexShrink:0 }}>
              <ExternalLink size={13} />
              Voir le site
            </a>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(196,83,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4531A', fontWeight: 700, fontSize: 13, flexShrink:0 }}>
              {user?.name?.[0]}
            </div>
          </div>
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
