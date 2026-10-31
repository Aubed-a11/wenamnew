import { useState, useEffect } from 'react'
import { Save, Percent, Clock, Phone, MapPin, Instagram, ToggleLeft, ToggleRight } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const css = `
  .settings-wrap { max-width: 720px; display: flex; flex-direction: column; gap: 24px; }
  .promo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .info-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) {
    .promo-grid { grid-template-columns: 1fr; gap: 14px; }
    .info-grid-2 { grid-template-columns: 1fr; gap: 14px; }
  }
  .promo-preview { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
`

export default function SettingsPage() {
  const [promo, setPromo] = useState({ active: false, percent: 20, label: 'Ce Weekend', description: '' })
  const [info, setInfo] = useState({ phone: '+212 643 389 585', address: 'Avenue Al Majd 2, Rabat', instagram: 'https://www.instagram.com/itswenam?igsh=cjNsN294M2RzNHBl&utm_source=qr', openTime: '09:00', deliveryStop: '20:00', advanceHours: 24 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/settings').then(({ data }) => {
      if (data.promo) setPromo(data.promo)
      if (data.info) setInfo(prev => ({ ...prev, ...data.info }))
    }).finally(() => setLoading(false))
  }, [])

  const savePromo = async () => {
    setSaving(true)
    try {
      await api.post('/settings', { key: 'promo', value: promo })
      toast.success(promo.active ? `Promo ${promo.percent}% activée !` : 'Promo désactivée.')
    } catch { toast.error('Erreur de sauvegarde') }
    finally { setSaving(false) }
  }

  const saveInfo = async () => {
    setSaving(true)
    try {
      await api.post('/settings', { key: 'info', value: info })
      toast.success('Informations sauvegardées !')
    } catch { toast.error('Erreur de sauvegarde') }
    finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #D4B896', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'Lato, sans-serif', background: '#fff' }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><span style={{ width:32, height:32, border:'4px solid rgba(196,83,26,0.2)', borderTopColor:'#C4531A', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>
      <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(18px,4vw,22px)', fontWeight:700, color:'#1A0F00', margin:'0 0 24px' }}>Paramètres</h1>

      <div className="settings-wrap">

        {/* Promo */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ background:'#fff', borderRadius:20, border:'1px solid #D4B896', overflow:'hidden' }}>
          <div style={{ background:'rgba(196,83,26,0.05)', borderBottom:'1px solid #EDE0C4', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(196,83,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Percent size={18} color="#C4531A" />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:'#1A0F00', margin:0 }}>Offre Spéciale</h2>
              <p style={{ fontSize:12, color:'#8B6B3D', margin:0 }}>Gérez la promotion affichée sur le site</p>
            </div>
            <button onClick={() => setPromo({ ...promo, active: !promo.active })} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color: promo.active ? '#16a34a' : '#8B6B3D' }}>
              {promo.active ? <ToggleRight size={26} color="#16a34a" /> : <ToggleLeft size={26} color="#9ca3af" />}
              {promo.active ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div style={{ padding:'20px' }}>
            {promo.active && (
              <div style={{ background:'#C4531A', borderRadius:12, padding:'16px 20px', marginBottom:20 }}>
                <div className="promo-preview">
                  <div>
                    <p style={{ color:'rgba(255,255,255,0.6)', fontSize:11, margin:'0 0 4px' }}>Aperçu sur le site</p>
                    <p style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:700, color:'#fff', margin:0 }}>{promo.percent}% OFF</p>
                    <p style={{ fontFamily:"'Playfair Display', serif", fontStyle:'italic', color:'rgba(255,255,255,0.8)', margin:0 }}>{promo.label}</p>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:11, background:'rgba(255,255,255,0.2)', borderRadius:8, padding:'8px 12px', color:'#fff', whiteSpace:'nowrap' }}>✓ Visible sur la homepage</div>
                </div>
              </div>
            )}

            <div className="promo-grid" style={{ marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Pourcentage</label>
                <div style={{ position:'relative' }}>
                  <input type="number" min="1" max="99" value={promo.percent} onChange={e => setPromo({ ...promo, percent: Number(e.target.value) })} style={{ ...inputStyle, paddingRight:28 }} />
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'#8B6B3D', fontWeight:700 }}>%</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Label</label>
                <input value={promo.label} onChange={e => setPromo({ ...promo, label: e.target.value })} placeholder="Ce Weekend" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Description (optionnelle)</label>
              <textarea value={promo.description} onChange={e => setPromo({ ...promo, description: e.target.value })} rows={2} style={{ ...inputStyle, resize:'none' }} />
            </div>

            <button onClick={savePromo} disabled={saving} style={{ display:'flex', alignItems:'center', gap:8, background:'#C4531A', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              {saving && <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />}
              <Save size={14} /> {saving ? 'Sauvegarde...' : promo.active ? 'Activer et sauvegarder' : 'Sauvegarder'}
            </button>
          </div>
        </motion.div>

        {/* Info restaurant */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} style={{ background:'#fff', borderRadius:20, border:'1px solid #D4B896', padding:'20px' }}>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:'#1A0F00', margin:'0 0 20px' }}>Informations du restaurant</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="info-grid-2">
              <div>
                <label style={labelStyle}><Clock size={11}/>Heure d'ouverture</label>
                <input type="time" value={info.openTime} onChange={e => setInfo({ ...info, openTime: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><Clock size={11}/>Arrêt livraisons</label>
                <input type="time" value={info.deliveryStop} onChange={e => setInfo({ ...info, deliveryStop: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}><Phone size={11}/>Téléphone</label>
              <input value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} placeholder="+212 643 389 585" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><MapPin size={11}/>Adresse</label>
              <input value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Instagram size={11}/>Lien Instagram</label>
              <input value={info.instagram} onChange={e => setInfo({ ...info, instagram: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Délai commande à l'avance (heures)</label>
              <input type="number" value={info.advanceHours} onChange={e => setInfo({ ...info, advanceHours: Number(e.target.value) })} style={{ ...inputStyle, maxWidth:140 }} />
            </div>
            <button onClick={saveInfo} disabled={saving} style={{ display:'flex', alignItems:'center', gap:8, background:'#C4531A', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', width:'fit-content' }}>
              <Save size={14} />Sauvegarder
            </button>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}


