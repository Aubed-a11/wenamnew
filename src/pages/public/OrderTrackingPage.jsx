import { motion } from 'framer-motion'
import { ArrowLeft, Bike, CheckCircle, ChefHat, Clock, Package, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../../api/axios'
import Navbar from '../../components/common/Navbar'
import { useAuthStore } from '../../store'

const STEPS = [
  { key: 'pending', label: 'Commande reçue', icon: Package, desc: 'Votre commande a été reçue.' },
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle, desc: 'Le restaurant a confirmé votre commande.' },
  { key: 'preparing', label: 'En préparation', icon: ChefHat, desc: 'Votre plat est en cours de préparation.' },
  { key: 'out_for_delivery', label: 'En route', icon: Bike, desc: 'Votre livreur est en chemin !' },
  { key: 'delivered', label: 'Livré', icon: CheckCircle, desc: 'Commande livrée. Bon appétit !' },
]

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/' + id).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://api.wenamfood.com', { withCredentials: true })
    socket.emit('join_room', user._id)
    socket.on('order:status_updated', (payload) => {
      if (String(payload.orderId) === String(id)) {
        setOrder((prev) => prev ? { ...prev, status: payload.status } : prev)
      }
    })
    return () => socket.disconnect()
  }, [id, user])

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center h-96">
        <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  )
  if (!order) return (
    <div className="min-h-screen"><Navbar />
      <div className="text-center py-24 font-display text-xl px-4">Commande introuvable</div>
    </div>
  )

  const currentIdx = STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 48px' }}>

        <Link to="/profile" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#8B6B3D', textDecoration:'none', marginBottom:24 }}>
          <ArrowLeft size={14} /> Mes commandes
        </Link>

        {/* Order header */}
        <div style={{ background:'#fff', borderRadius:20, padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 className="font-display" style={{ fontSize:'clamp(18px,5vw,24px)', fontWeight:700, margin:0 }}>{order.orderNumber}</h1>
              <p style={{ fontSize:12, color:'#8B6B3D', marginTop:4 }}>
                {new Date(order.createdAt).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p className="font-display" style={{ fontSize:'clamp(18px,5vw,24px)', fontWeight:700, color:'#C4531A', margin:0 }}>{order.total} MAD</p>
              {order.estimatedDelivery && !isDelivered && !isCancelled && (
                <p style={{ fontSize:11, color:'#8B6B3D', display:'flex', alignItems:'center', gap:4, marginTop:4, justifyContent:'flex-end' }}>
                  <Clock size={11} /> Estimée: {new Date(order.estimatedDelivery).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tracking */}
        <div style={{ background:'#fff', borderRadius:20, padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <h2 className="font-display" style={{ fontSize:17, fontWeight:600, marginBottom:24 }}>Suivi en temps réel</h2>
          {isCancelled ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#fef2f2', borderRadius:12, border:'1px solid #fecaca' }}>
              <XCircle color="#ef4444" size={22} />
              <p style={{ fontWeight:600, color:'#b91c1c', fontSize:14, margin:0 }}>Commande annulée</p>
            </div>
          ) : (
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:20, top:20, bottom:20, width:2, background:'#e5e7eb' }} />
              <div style={{ position:'absolute', left:20, top:20, width:2, background:'#C4531A', transition:'height 0.7s', height:`${Math.max(0, Math.min(currentIdx/(STEPS.length-1), 1))*100}%` }} />
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {STEPS.map((step, idx) => {
                  const done = idx < currentIdx
                  const active = idx === currentIdx
                  const Icon = step.icon
                  return (
                    <motion.div key={step.key} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.1}}
                      style={{ display:'flex', gap:14, position:'relative' }}>
                      <div style={{
                        position:'relative', zIndex:1, width:40, height:40, borderRadius:'50%', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background: done||active ? '#C4531A' : '#F5ECD7',
                        color: done||active ? '#fff' : '#8B6B3D',
                        boxShadow: active ? '0 0 0 6px rgba(196,83,26,0.15)' : 'none',
                        transition: 'all 0.4s'
                      }}>
                        {active && <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(196,83,26,0.3)', animation:'ping 1.2s infinite' }} />}
                        <Icon size={15} />
                      </div>
                      <div style={{ paddingTop:8 }}>
                        <p style={{ fontWeight:600, fontSize:13, margin:0, color: done||active ? '#1A0F00' : '#8B6B3D' }}>{step.label}</p>
                        {active && <p style={{ fontSize:12, color:'#C4531A', margin:'3px 0 0' }}>{step.desc}</p>}
                        {done && <p style={{ fontSize:11, color:'#8B6B3D', margin:'3px 0 0' }}>✓ Complété</p>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ background:'#fff', borderRadius:20, padding:'20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <h2 className="font-display" style={{ fontSize:17, fontWeight:600, marginBottom:16 }}>Articles</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <img src={item.image||'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100'} alt={item.name}
                  style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize:11, color:'#8B6B3D', margin:'2px 0 0' }}>x{item.quantity}</p>
                </div>
                <p className="font-display" style={{ fontWeight:700, color:'#C4531A', fontSize:13, flexShrink:0 }}>{item.price*item.quantity} MAD</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:15 }}>
            <span>Total</span><span style={{ color:'#C4531A' }}>{order.total} MAD</span>
          </div>
        </div>

        {/* Review CTA */}
        {isDelivered && (
          <div style={{ background:'#fff', borderRadius:20, padding:'24px 20px', border:'1px solid #e5e7eb', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', textAlign:'center' }}>
            <p className="font-display" style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Vous avez apprécié votre repas ?</p>
            <Link to="/profile" className="btn-primary">Laisser un avis</Link>
          </div>
        )}
      </div>
    </div>
  )
}


