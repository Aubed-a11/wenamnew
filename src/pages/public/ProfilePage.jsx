import { Edit2, LogOut, Package, Save, Star, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useAuthStore } from '../../store'

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', preparing:'En préparation', out_for_delivery:'En route', delivered:'Livré', cancelled:'Annulée' }
const STATUS_COLORS = { pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700', preparing:'bg-orange-100 text-orange-700', out_for_delivery:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' }

const css = `
  /* Desktop layout */
  .profile-layout { display: flex; gap: 24px; }
  .profile-sidebar { width: 220px; flex-shrink: 0; }
  .mobile-header { display: none; }

  /* Mobile layout */
  @media (max-width: 639px) {
    .profile-layout { display: block; }
    .profile-sidebar { display: none; }
    .mobile-header { display: block; margin-bottom: 16px; }
    .mobile-tabs { display: flex; gap: 0; background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 16px; }
    .mobile-tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 12px 4px; border: none; cursor: pointer; font-size: 10px; font-weight: 600; font-family: Lato, sans-serif; border-right: 1px solid #f0e8dd; }
    .mobile-tab-btn:last-child { border-right: none; }
  }

  /* Orders */
  .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid #e5e7eb; gap: 8px; flex-wrap: wrap; }
  .order-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 480px) { .order-meta { gap: 8px; } .order-track { font-size: 11px !important; } }

  .profile-card { background: #fff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding: 20px; }
  @media (min-width: 640px) { .profile-card { padding: 24px; } }
`

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(false)
  const { user, logout, updateProfile } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', street: user?.address?.street||'', city: user?.address?.city||'' })
  const navigate = useNavigate()

  const [myReviews, setMyReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [hoverStar, setHoverStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (tab === 'orders') api.get('/orders/my').then(({data})=>setOrders(data.orders||[]))
    if (tab === 'reviews') api.get('/reviews/my').then(({data})=>setMyReviews(data.reviews||[])).catch(()=>{})
  }, [tab])

  const submitReview = async () => {
    if (reviewForm.rating === 0) { toast.error('Choisissez une note'); return }
    if (!reviewForm.comment.trim()) { toast.error('Écrivez un commentaire'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews', reviewForm)
      toast.success('Avis envoyé ! Il sera visible après validation.')
      setReviewForm({ rating: 0, comment: '' })
      api.get('/reviews/my').then(({data})=>setMyReviews(data.reviews||[])).catch(()=>{})
    } catch { toast.error('Erreur lors de l\'envoi') }
    finally { setSubmitting(false) }
  }

  const handleSave = async () => {
    try {
      await updateProfile({ name: form.name, phone: form.phone, address: { street: form.street, city: form.city } })
      toast.success('Profil mis à jour !'); setEditing(false)
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const TABS = [['profile','Mon profil',User],['orders','Mes commandes',Package],['reviews','Mes avis',Star]]

  return (
    <div className="min-h-screen bg-cream">
      <style>{css}</style>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header mobile : nom + déconnexion */}
        <div className="mobile-header">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(196,83,26,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4531A', fontWeight:700, fontSize:16 }}>{user?.name?.[0]}</div>
              <div>
                <p style={{ fontWeight:700, fontSize:13, margin:0, color:'#1A0F00' }}>{user?.name}</p>
                <p style={{ fontSize:11, color:'#8B6B3D', margin:0 }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid #fca5a5', borderRadius:8, padding:'6px 12px', color:'#ef4444', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <LogOut size={13} />Déconnexion
            </button>
          </div>

          {/* Onglets mobiles */}
          <div className="mobile-tabs">
            {TABS.map(([key,label,Icon])=>(
              <button key={key} onClick={()=>setTab(key)} className="mobile-tab-btn"
                style={{ background: tab===key ? '#C4531A' : '#fff', color: tab===key ? '#fff' : '#5C3D11' }}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-layout">

          {/* Sidebar desktop */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(196,83,26,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C4531A', fontWeight:700, fontSize:18, flexShrink:0 }}>{user?.name?.[0]}</div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                  <p style={{ fontSize:11, color:'#8B6B3D', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {TABS.map(([key,label,Icon])=>(
                  <button key={key} onClick={()=>setTab(key)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s', background: tab===key ? '#C4531A' : 'transparent', color: tab===key ? '#fff' : '#5C3D11', width:'100%', textAlign:'left' }}>
                    <Icon size={15} />{label}
                  </button>
                ))}
                <button onClick={handleLogout}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'transparent', color:'#ef4444', marginTop:4, width:'100%', textAlign:'left' }}>
                  <LogOut size={15} />Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="profile-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:8 }}>
                  <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, margin:0 }}>Mon profil</h2>
                  {!editing ? (
                    <button onClick={()=>setEditing(true)} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#C4531A', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      <Edit2 size={13} />Modifier
                    </button>
                  ) : (
                    <button onClick={handleSave} className="btn-primary" style={{ padding:'6px 16px', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                      <Save size={13} />Sauvegarder
                    </button>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[['Nom complet','name','text','Sophie Martel'],['Téléphone','phone','tel','+212 6 ...'],['Rue','street','text','123 Rue ...'],['Ville','city','text','Rabat']].map(([label,field,type,ph])=>(
                    <div key={field}>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#8B6B3D', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                      {editing ? (
                        <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={ph} className="input" style={{ width:'100%', boxSizing:'border-box' }} />
                      ) : (
                        <p style={{ fontSize:14, color:'#1A0F00', background:'#FAF3E8', borderRadius:10, padding:'10px 14px', margin:0 }}>
                          {form[field] || <span style={{ color:'#8B6B3D', fontStyle:'italic' }}>Non renseigné</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div className="profile-card">
                <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:24 }}>Mes commandes</h2>
                {orders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 16px' }}>
                    <p className="font-display" style={{ fontSize:18, marginBottom:16 }}>Aucune commande</p>
                    <Link to="/menu" className="btn-primary">Commander maintenant</Link>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {orders.map((order)=>(
                      <div key={order._id} className="order-row">
                        <div>
                          <p style={{ fontWeight:600, fontSize:14, margin:0 }}>{order.orderNumber}</p>
                          <p style={{ fontSize:11, color:'#8B6B3D', margin:'2px 0 0' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.items.length} article(s)</p>
                        </div>
                        <div className="order-meta">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full font-body ${STATUS_COLORS[order.status]||'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[order.status]||order.status}
                          </span>
                          <p className="font-display" style={{ fontWeight:700, color:'#C4531A', fontSize:14, margin:0 }}>{order.total} MAD</p>
                          <Link to={`/orders/${order._id}/track`} className="order-track" style={{ fontSize:12, color:'#C4531A', fontWeight:600, textDecoration:'none' }}>Suivre</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {tab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Formulaire nouvel avis */}
                <div className="profile-card">
                  <h2 className="font-display" style={{ fontSize:'clamp(17px,4vw,20px)', fontWeight:600, marginBottom:20 }}>Laisser un avis</h2>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Note</label>
                    <div style={{ display:'flex', gap:6 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n}
                          onClick={() => setReviewForm(f => ({...f, rating: n}))}
                          onMouseEnter={() => setHoverStar(n)}
                          onMouseLeave={() => setHoverStar(0)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:30, padding:'0 2px', lineHeight:1, color: n <= (hoverStar || reviewForm.rating) ? '#F59E0B' : '#D4B896', transition:'color 0.15s' }}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Commentaire</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
                      rows={4}
                      placeholder="Partagez votre expérience avec Wênam..."
                      style={{ width:'100%', padding:'10px 12px', border:'1px solid #D4B896', borderRadius:10, fontSize:13, resize:'vertical', boxSizing:'border-box', outline:'none', fontFamily:'Lato,sans-serif', lineHeight:1.6 }}
                    />
                  </div>
                  <button onClick={submitReview} disabled={submitting}
                    style={{ background: submitting ? '#D4B896' : '#C4531A', color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontSize:13, fontWeight:700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? 'Envoi...' : 'Envoyer mon avis'}
                  </button>
                </div>

                {/* Avis déjà soumis */}
                {myReviews.length > 0 && (
                  <div className="profile-card">
                    <h3 className="font-display" style={{ fontSize:16, fontWeight:600, marginBottom:16, color:'#1A0F00' }}>Mes avis précédents</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {myReviews.map(r => (
                        <div key={r._id} style={{ background:'#FAF3E8', borderRadius:12, padding:'12px 14px', border:'1px solid #EDE0C4' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                            <span style={{ color:'#F59E0B', fontSize:16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:12, background: r.isApproved ? '#F0FDF4' : '#FEFCE8', color: r.isApproved ? '#166534' : '#B7791F' }}>
                              {r.isApproved ? 'Publié' : 'En attente de validation'}
                            </span>
                            <span style={{ fontSize:11, color:'#8B6B3D', marginLeft:'auto' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <p style={{ fontSize:13, color:'#5C3D11', margin:0, lineHeight:1.5 }}>{r.comment}</p>
                          {r.adminResponse && (
                            <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid #D4B896' }}>
                              <p style={{ fontSize:11, fontWeight:700, color:'#C4531A', margin:'0 0 3px' }}>Réponse Wênam :</p>
                              <p style={{ fontSize:12, color:'#5C3D11', fontStyle:'italic', margin:0 }}>{r.adminResponse}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}


