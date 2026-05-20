import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, ShoppingBag, Package, Star, Eye, Bell, X, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { io } from 'socket.io-client'
import api from '../../api/axios'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const S_LABEL = { pending:'En attente', confirmed:'Confirmée', preparing:'Préparation', out_for_delivery:'En route', delivered:'Livré', cancelled:'Annulée' }
const S_COLOR = { pending:'#B7791F', confirmed:'#2563EB', preparing:'#C4531A', out_for_delivery:'#7C3AED', delivered:'#166534', cancelled:'#991B1B' }
const S_BG    = { pending:'#FEFCE8', confirmed:'#EFF6FF', preparing:'#FFF7ED', out_for_delivery:'#F5F3FF', delivered:'#F0FDF4', cancelled:'#FEF2F2' }

const css = `
  .dash-mid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; margin-bottom: 24px; }
  @media (max-width: 1024px) { .dash-mid { grid-template-columns: 1fr; } }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 900px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .stat-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }
  .stat-val { font-size: 36px; }
  @media (max-width: 480px) { .stat-val { font-size: 26px; } }
  .new-order-banner { width: 300px; }
  @media (max-width: 480px) { .new-order-banner { width: calc(100vw - 32px); right: 16px !important; } }

`

function StatCard({ label, value, icon: Icon, bg, i }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
      style={{ background: bg, borderRadius: 16, padding: '18px 16px', color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.75)', margin:0, fontFamily:'Lato,sans-serif', lineHeight:1.3 }}>{label}</p>
        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={16} />
        </div>
      </div>
      <p className="stat-val" style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, margin:0 }}>
        {value != null ? Number(value).toLocaleString() : '—'}
      </p>
    </motion.div>
  )
}

function NewOrderBanner({ order, onValidate, onDismiss }) {
  return (
    <motion.div className="new-order-banner" initial={{ x:400, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:400, opacity:0 }}
      style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:'#fff', borderRadius:16, boxShadow:'0 8px 32px rgba(139,58,15,0.25)', border:'1px solid #D4B896', overflow:'hidden' }}>
      <div style={{ background:'#C4531A', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Bell size={15} color="#fff" />
          <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>Nouvelle commande !</span>
        </div>
        <button onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)' }}><X size={15}/></button>
      </div>
      <div style={{ padding:16 }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#C4531A', margin:'0 0 2px' }}>{order.orderNumber}</p>
        <p style={{ fontSize:13, color:'#5C3D11', margin:'0 0 2px' }}>{order.user?.name}</p>
        <p style={{ fontSize:12, color:'#8B6B3D', margin:'0 0 14px' }}>{order.items?.length} article(s) · {order.total} MAD</p>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onDismiss} style={{ flex:1, padding:'8px', border:'1px solid #D4B896', borderRadius:8, background:'none', cursor:'pointer', fontSize:12, color:'#5C3D11' }}>Ignorer</button>
          <button onClick={() => onValidate(order)} style={{ flex:1, padding:'8px', border:'none', borderRadius:8, background:'#C4531A', cursor:'pointer', fontSize:12, color:'#fff', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <CheckCircle size={13}/> Valider
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [sales, setSales] = useState([])
  const [newOrder, setNewOrder] = useState(null)

  const fetchOrders = () => api.get('/orders?limit=8').then(({ data }) => setOrders(data.orders || [])).catch(() => {})

  useEffect(() => {
    api.get('/analytics/summary').then(({ data }) => setStats(data)).catch(() => {})
    fetchOrders()
    api.get('/reviews/admin?limit=3').then(({ data }) => setReviews(data.reviews || [])).catch(() => {})
    api.get('/analytics/weekly-sales').then(({ data }) => {
      setSales((data.data || []).map((d, i) => ({ day: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i], total: d.total })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://api.wenamfood.com', { withCredentials: true })
    socket.emit('join_admin')
    socket.on('order:new', ({ order }) => { setNewOrder(order); fetchOrders() })
    return () => socket.disconnect()
  }, [user])

  const handleValidate = async (order) => {
    try {
      await api.put(`/orders/${order._id}/status`, { status: 'confirmed', note: 'Validée par admin' })
      toast.success(`Commande ${order.orderNumber} confirmée !`)
      setNewOrder(null); fetchOrders()
    } catch { toast.error('Erreur validation') }
  }

  const STATS = [
    { label: 'Ventes Totales (MAD)', value: stats?.totalSales,      icon: TrendingUp, bg: '#2C4A35' },
    { label: 'Nouvelles Commandes',  value: stats?.newOrders,        icon: ShoppingBag, bg: '#C4531A' },
    { label: 'Produits en Ligne',    value: stats?.onlineProducts,   icon: Package,    bg: '#E8763A' },
    { label: 'Nouveaux Avis',        value: stats?.newReviews,       icon: Star,       bg: '#8B6B3D' },
  ]

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(20px,4vw,28px)', fontWeight:700, color:'#1A0F00', margin:'0 0 4px' }}>
          Bienvenue, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color:'#8B6B3D', fontSize:14, margin:0 }}>Activité récente · Avenue Al Majd 2, Rabat</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} i={i} />)}
      </div>

      {/* Orders + Reviews */}
      <div className="dash-mid">
        {/* Orders table */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #D4B896', padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, color:'#1A0F00', margin:0 }}>Commandes Récentes</h2>
            <Link to="/admin/orders" style={{ fontSize:12, color:'#C4531A', textDecoration:'none', fontWeight:600 }}>Voir tout →</Link>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #EDE0C4' }}>
                  {['Commande','Client','Total','Statut',''].map(h => (
                    <th key={h} style={{ padding:'8px 10px 10px', textAlign:'left', fontSize:11, color:'#8B6B3D', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ borderBottom:'1px solid #F5ECD7' }}>
                    <td style={{ padding:'10px', fontWeight:700, color:'#1A0F00', whiteSpace:'nowrap' }}>{o.orderNumber}</td>
                    <td style={{ padding:'10px', color:'#5C3D11', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.user?.name || '—'}</td>
                    <td style={{ padding:'10px', fontWeight:700, color:'#C4531A', fontFamily:"'Playfair Display',serif", whiteSpace:'nowrap' }}>{o.total} MAD</td>
                    <td style={{ padding:'10px' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background: S_BG[o.status]||'#f5f5f5', color: S_COLOR[o.status]||'#333', whiteSpace:'nowrap' }}>
                        {S_LABEL[o.status]||o.status}
                      </span>
                    </td>
                    <td style={{ padding:'10px' }}>
                      <Link to="/admin/orders" style={{ color:'#C4531A' }}><Eye size={15}/></Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'#8B6B3D', fontSize:13 }}>Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #D4B896', padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, color:'#1A0F00', margin:0 }}>Avis Récents</h2>
            <Link to="/admin/reviews" style={{ fontSize:12, color:'#C4531A', textDecoration:'none', fontWeight:600 }}>Voir tout →</Link>
          </div>
          <div>
            {reviews.map(r => (
              <div key={r._id} style={{ display:'flex', gap:12, paddingBottom:14, marginBottom:14, borderBottom:'1px solid #F5ECD7' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(196,83,26,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4531A', fontWeight:700, fontSize:14, flexShrink:0 }}>{r.user?.name?.[0]}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:13, color:'#1A0F00' }}>{r.user?.name}</span>
                    <span style={{ color:'#F59E0B', fontSize:12 }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p style={{ fontSize:12, color:'#8B6B3D', margin:0, lineHeight:1.5 }}>{r.comment}</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p style={{ textAlign:'center', color:'#8B6B3D', fontSize:13, padding:'24px 0' }}>Aucun avis</p>}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #D4B896', padding:20 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, color:'#1A0F00', margin:'0 0 20px' }}>Ventes Hebdomadaires</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={sales} margin={{ top:5, right:10, bottom:5, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" />
            <XAxis dataKey="day" tick={{ fontSize:11, fontFamily:'Lato', fill:'#8B6B3D' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fontFamily:'Lato', fill:'#8B6B3D' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #D4B896', fontFamily:'Lato', fontSize:13 }} formatter={v => [`${v} MAD`, 'Ventes']} />
            <Line type="monotone" dataKey="total" stroke="#E8763A" strokeWidth={3} dot={{ fill:'#C4531A', r:5, strokeWidth:0 }} activeDot={{ r:7, fill:'#C4531A' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AnimatePresence>
        {newOrder && <NewOrderBanner order={newOrder} onValidate={handleValidate} onDismiss={() => setNewOrder(null)} />}
      </AnimatePresence>
    </div>
  )
}
