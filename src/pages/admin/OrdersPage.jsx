import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Eye } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['pending','confirmed','preparing','out_for_delivery','delivered']
const S_LABEL = { pending:'En attente', confirmed:'Confirmée', preparing:'Préparation', out_for_delivery:'En route', delivered:'Livré', cancelled:'Annulée' }
const S_COLOR = { pending:'#B7791F', confirmed:'#2563EB', preparing:'#C4531A', out_for_delivery:'#7C3AED', delivered:'#166534', cancelled:'#991B1B' }
const S_BG    = { pending:'#FEFCE8', confirmed:'#EFF6FF', preparing:'#FFF7ED', out_for_delivery:'#F5F3FF', delivered:'#F0FDF4', cancelled:'#FEF2F2' }

const css = `
  .orders-filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .orders-search { flex: 1; min-width: 180px; }
  .drawer { width: 420px; }
  @media (max-width: 480px) { .drawer { width: 100vw; } }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
`

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (statusFilter) p.set('status', statusFilter)
    api.get('/orders?' + p).then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false))
  }
  useEffect(fetchOrders, [statusFilter])

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status)
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return
    const next = STATUS_FLOW[idx + 1]
    try {
      await api.put(`/orders/${order._id}/status`, { status: next })
      toast.success(`→ ${S_LABEL[next]}`)
      if (selected?._id === order._id) setSelected({ ...selected, status: next })
      fetchOrders()
    } catch { toast.error('Erreur mise à jour') }
  }

  const filtered = orders.filter(o =>
    !search || o.orderNumber?.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const nextStatus = (o) => {
    const idx = STATUS_FLOW.indexOf(o.status)
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  return (
    <div style={{ fontFamily:'Lato,sans-serif' }}>
      <style>{css}</style>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(18px,4vw,24px)', fontWeight:700, color:'#1A0F00', margin:'0 0 20px' }}>Gestion des Commandes</h1>

      <div className="orders-filters">
        <div className="orders-search" style={{ position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#8B6B3D' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher commande, client..."
            style={{ width:'100%', padding:'9px 12px 9px 34px', border:'1px solid #D4B896', borderRadius:10, fontSize:13, boxSizing:'border-box', outline:'none', background:'#fff' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding:'9px 12px', border:'1px solid #D4B896', borderRadius:10, fontSize:13, background:'#fff', outline:'none' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(S_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#8B6B3D', display:'flex', alignItems:'center', gap:4, fontSize:13 }}>
            <X size={14}/>Reset
          </button>
        )}
      </div>

      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #D4B896', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:600 }}>
            <thead>
              <tr style={{ background:'#FAF3E8', borderBottom:'1px solid #D4B896' }}>
                {['Commande','Client','Date','Articles','Total','Statut','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, color:'#8B6B3D', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i} style={{ borderBottom:'1px solid #F5ECD7' }}>
                  {Array.from({length:7}).map((_,j) => <td key={j} style={{ padding:'14px' }}><div style={{ height:14, background:'#F5ECD7', borderRadius:4, width:'80%', animation:'pulse 1.5s infinite' }} /></td>)}
                </tr>
              )) : filtered.map(o => (
                <tr key={o._id} style={{ borderBottom:'1px solid #F5ECD7', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#FAF3E8'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <td style={{ padding:'13px 14px', fontWeight:700, color:'#1A0F00', whiteSpace:'nowrap' }}>{o.orderNumber}</td>
                  <td style={{ padding:'13px 14px', color:'#5C3D11', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.user?.name||'—'}</td>
                  <td style={{ padding:'13px 14px', color:'#8B6B3D', whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding:'13px 14px', textAlign:'center', color:'#5C3D11' }}>{o.items?.length||0}</td>
                  <td style={{ padding:'13px 14px', fontWeight:700, color:'#C4531A', fontFamily:"'Playfair Display',serif", whiteSpace:'nowrap' }}>{o.total} MAD</td>
                  <td style={{ padding:'13px 14px' }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:S_BG[o.status]||'#f5f5f5', color:S_COLOR[o.status]||'#333', whiteSpace:'nowrap' }}>
                      {S_LABEL[o.status]||o.status}
                    </span>
                  </td>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'nowrap' }}>
                      <button onClick={() => setSelected(o)} style={{ background:'none', border:'1px solid #D4B896', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#C4531A', display:'flex' }}><Eye size={13}/></button>
                      {nextStatus(o) && (
                        <button onClick={() => advanceStatus(o)} style={{ background:'#C4531A', border:'none', borderRadius:6, cursor:'pointer', padding:'5px 8px', color:'#fff', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                          → {S_LABEL[nextStatus(o)]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length===0 && <div style={{ textAlign:'center', padding:'48px', color:'#8B6B3D' }}>Aucune commande trouvée</div>}
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:9999, display:'flex', justifyContent:'flex-end' }}
            onClick={() => setSelected(null)}>
            <motion.div className="drawer" initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring', damping:25 }}
              style={{ background:'#fff', height:'100%', overflowY:'auto', boxShadow:'-4px 0 20px rgba(0,0,0,0.15)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ position:'sticky', top:0, background:'#fff', borderBottom:'1px solid #EDE0C4', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#C4531A', margin:0 }}>{selected.orderNumber}</p>
                  <p style={{ fontSize:12, color:'#8B6B3D', margin:0 }}>{new Date(selected.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#8B6B3D' }}><X size={20}/></button>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ background:'#FAF3E8', borderRadius:12, padding:14, marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#8B6B3D', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px' }}>Client</p>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1A0F00', margin:'0 0 2px' }}>{selected.user?.name}</p>
                  <p style={{ fontSize:13, color:'#5C3D11', margin:'0 0 2px' }}>{selected.user?.email}</p>
                  <p style={{ fontSize:13, color:'#5C3D11', margin:0 }}>{selected.user?.phone}</p>
                </div>
                <div style={{ background:'#FAF3E8', borderRadius:12, padding:14, marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#8B6B3D', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 6px' }}>Adresse</p>
                  <p style={{ fontSize:13, color:'#1A0F00', margin:0 }}>{selected.deliveryAddress?.street}, {selected.deliveryAddress?.city}</p>
                  {selected.deliveryAddress?.instructions && <p style={{ fontSize:12, color:'#8B6B3D', fontStyle:'italic', marginTop:4 }}>"{selected.deliveryAddress.instructions}"</p>}
                </div>
                <p style={{ fontSize:11, fontWeight:700, color:'#8B6B3D', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 10px' }}>Articles</p>
                <div style={{ marginBottom:16 }}>
                  {selected.items?.map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <img src={item.image||'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80'} alt={item.name} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#1A0F00', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize:12, color:'#8B6B3D', margin:0 }}>x{item.quantity}</p>
                      </div>
                      <p style={{ fontWeight:700, color:'#C4531A', fontSize:13, margin:0, flexShrink:0 }}>{item.price*item.quantity} MAD</p>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px solid #EDE0C4', paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
                    <span>Total</span><span style={{ color:'#C4531A' }}>{selected.total} MAD</span>
                  </div>
                </div>
                {nextStatus(selected) && (
                  <button onClick={() => advanceStatus(selected)} style={{ width:'100%', padding:'13px', background:'#C4531A', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    Passer à : {S_LABEL[nextStatus(selected)]}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


