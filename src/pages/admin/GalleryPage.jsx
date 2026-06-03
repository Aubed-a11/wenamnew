import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const CATS = ['entrees','plats_principaux','desserts','boissons','ambiance']

const css = `
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  @media (max-width: 480px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
`

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', image: '', category: 'ambiance' })
  const [loading, setLoading] = useState(true)

  const fetch = () => { setLoading(true); api.get('/gallery').then(({ data }) => setItems(data.items || [])).finally(() => setLoading(false)) }
  useEffect(fetch, [])

  const add = async () => {
  if (!form.image) {
    toast.error("URL de l'image requise")
    return
  }

  await api.post('/gallery', {
    ...form,
    title: form.title || 'Photo'
  })

  toast.success('Photo ajoutée !')
  setModal(false)
  setForm({ title: '', image: '', category: 'ambiance' })
  fetch()
}
  const remove = async (id) => { if (!confirm('Supprimer ?')) return; await api.delete(`/gallery/${id}`); toast.success('Supprimée'); fetch() }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #D4B896', borderRadius:8, fontSize:13, fontFamily:'sans-serif', boxSizing:'border-box', outline:'none' }

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(18px,4vw,22px)', fontWeight: 700, color: '#1A0F00', margin: 0 }}>Galerie Photos</h1>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#C4531A', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', background: '#F5ECD7', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'clamp(32px,8vw,60px) 20px', color: '#8B6B3D' }}>
          <p style={{ fontSize: 15, margin: '0 0 16px' }}>Aucune photo dans la galerie</p>
          <button onClick={() => setModal(true)} style={{ background: '#C4531A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Ajouter une photo</button>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map(item => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid #D4B896' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300'} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 8, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, margin: '0 0 5px', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</p>
                <button onClick={() => remove(item._id)} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, width: 'fit-content' }}>
                  <Trash2 size={10} /> Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, padding: 'clamp(16px,4vw,24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1A0F00', margin: 0 }}>Nouvelle photo</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Titre', 'title', 'text', 'Nom de la photo'], ["URL de l'image", 'image', 'text', 'https://...']].map(([label, field, type, ph]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Catégorie</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, padding: 10, border: '1px solid #D4B896', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5C3D11' }}>Annuler</button>
                <button onClick={add} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, background: '#C4531A', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
