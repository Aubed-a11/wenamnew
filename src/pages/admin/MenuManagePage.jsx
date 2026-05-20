// ── MenuManagePage.jsx ────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion'
import { Edit2, Plus, Save, Search, ToggleLeft, ToggleRight, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const CATS = [
  { key:'', label:'Tous' },
  { key:'entrees', label:'Entrées' },
  { key:'plats_principaux', label:'Plats' },
  { key:'grillades', label:'Grillades' },
  { key:'accompagnements', label:'Accompagnements' },
  { key:'desserts', label:'Desserts' },
  { key:'boissons', label:'À boire' },
  { key:'autres', label:'Autres' },
]

const EMPTY = {
  name:'', description:'', price:'', category:'plats_principaux',
  preparationTime:20, isAvailable:true, featured:false,
  image:'', tags:'',
  accompagnements:'',
}

const css = `
  /* ── Layout ── */
  .menu-wrap { padding: 12px; }
  @media (min-width: 640px) { .menu-wrap { padding: 20px; } }

  .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
  .menu-header h1 { font-size: clamp(16px, 4vw, 24px); }

  /* ── Filters ── */
  .menu-filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; align-items: center; -webkit-overflow-scrolling: touch; }
  .menu-filters::-webkit-scrollbar { display: none; }
  .filter-btn { flex-shrink: 0; font-size: 11px !important; padding: 5px 11px !important; white-space: nowrap; }
  .search-wrap { flex-shrink: 0; margin-left: auto; }
  .search-wrap input { width: 130px !important; font-size: 12px; }
  @media (min-width: 480px) { .search-wrap input { width: 160px !important; } }

  /* ── Grid ── */
  .menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (min-width: 480px) { .menu-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
  @media (min-width: 640px) { .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
  @media (min-width: 900px) { .menu-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
  @media (min-width: 1200px) { .menu-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; } }

  /* ── Card ── */
  .menu-card-img { height: 110px; }
  @media (min-width: 480px) { .menu-card-img { height: 130px; } }
  @media (min-width: 640px) { .menu-card-img { height: 140px; } }
  .menu-card-title { font-size: 12px !important; }
  .menu-card-desc { font-size: 10px !important; }
  .menu-card-price { font-size: 13px !important; }
  @media (min-width: 480px) { .menu-card-title { font-size: 13px !important; } .menu-card-price { font-size: 15px !important; } }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: flex-end; justify-content: center; padding: 0; }
  @media (min-width: 640px) { .modal-overlay { align-items: center; padding: 16px; } }
  .modal-inner-wrap { background: #fff; width: 100%; max-width: 520px; border-radius: 20px 20px 0 0; max-height: 92vh; overflow-y: auto; }
  @media (min-width: 640px) { .modal-inner-wrap { border-radius: 20px; max-height: 88vh; } }
  .modal-inner { padding: 14px !important; }
  @media (min-width: 480px) { .modal-inner { padding: 20px !important; } }
  .modal-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 400px) { .modal-grid-2 { grid-template-columns: 1fr; } }

  /* ── Upload zone ── */
  .upload-zone { border: 2px dashed #D4B896; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FAF3E8; }
  .upload-zone:hover { border-color: #C4531A; background: rgba(196,83,26,0.04); }
  .upload-zone.dragover { border-color: #C4531A; background: rgba(196,83,26,0.08); }

  /* ── Tags ── */
  .accomp-tag { display:inline-block; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; border-radius:20px; font-size:10px; font-weight:600; padding:2px 8px; margin:2px 2px 0 0; }
  .accomp-section { margin-top:6px; }
  .accomp-label { font-size:10px; font-weight:700; color:#8B6B3D; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px; }

  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
`

const btn = (bg, color, extra={}) => ({
  border:'none', borderRadius:8, cursor:'pointer', fontFamily:'Lato,sans-serif', fontWeight:700,
  fontSize:12, padding:'7px 14px', background:bg, color, ...extra
})

const UPLOAD_URL = 'https://api.wenamfood.com/api/upload'
const IMG_BASE = 'https://api.wenamfood.com'

export default function MenuManagePage() {
  const [items, setItems] = useState([])
  const [cat, setCat] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  const fetchItems = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (cat) p.set('category', cat)
    if (search) p.set('search', search)
    api.get(`/menu?limit=100&${p}`).then(({ data }) => setItems(data.items || [])).finally(() => setLoading(false))
  }
  useEffect(fetchItems, [cat, search])

  const openAdd = () => { setForm(EMPTY); setPreview(''); setModal('add') }
  const openEdit = (item) => {
    setForm({
      ...item,
      price: String(item.price),
      tags: (item.tags||[]).join(', '),
      accompagnements: (item.accompagnements||[]).join(', '),
    })
    setPreview(item.image || '')
    setModal('edit')
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    // Accepter tous types image y compris HEIC/HEIF (photos iPhone)
    const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|heic|heif|gif|bmp)$/i)
    if (!isImage) { toast.error('Fichier image requis'); return }
    if (file.size > 15 * 1024 * 1024) { toast.error('Image trop lourde (max 15MB)'); return }

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Erreur ${res.status}`)
      }
      const data = await res.json()
      const fullUrl = data.url.startsWith('http') ? data.url : `${IMG_BASE}${data.url}`
      setForm(prev => ({ ...prev, image: fullUrl }))
      toast.success('Image uploadée !')
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Erreur upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nom et prix requis'); return }
    setSaving(true)
    try {
      const splitCSV = (str) => str ? str.split(',').map(t => t.trim()).filter(Boolean) : []
      const body = {
        ...form,
        price: Number(form.price),
        tags: splitCSV(form.tags),
        accompagnements: splitCSV(form.accompagnements),
      }
      if (modal === 'edit') await api.put(`/menu/${form._id}`, body)
      else await api.post('/menu', body)
      toast.success(modal === 'edit' ? 'Plat modifié !' : 'Plat ajouté !')
      setModal(null); fetchItems()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => { if (!confirm('Supprimer ce plat ?')) return; await api.delete(`/menu/${id}`); toast.success('Plat supprimé'); fetchItems() }
  const handleToggle = async (id) => { await api.patch(`/menu/${id}/availability`); fetchItems() }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #D4B896', borderRadius:8, fontSize:13, fontFamily:'Lato,sans-serif', boxSizing:'border-box', outline:'none' }

  return (
    <div className="menu-wrap" style={{ fontFamily:'Lato,sans-serif' }}>
      <style>{css}</style>

      <div className="menu-header">
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(18px,4vw,24px)', fontWeight:700, color:'#1A0F00', margin:0 }}>Gestion du Menu</h1>
        <button onClick={openAdd} style={{ ...btn('#C4531A','#fff'), padding:'10px 18px', fontSize:13, display:'flex', alignItems:'center', gap:8, borderRadius:10 }}>
          <Plus size={15}/> Ajouter un plat
        </button>
      </div>

      <div className="menu-filters">
        {CATS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} className="filter-btn" style={{ ...btn(cat===c.key?'#C4531A':'#fff', cat===c.key?'#fff':'#5C3D11'), border:`1px solid ${cat===c.key?'#C4531A':'#D4B896'}`, borderRadius:20, padding:'6px 14px', flexShrink:0 }}>
            {c.label}
          </button>
        ))}
        <div className="search-wrap" style={{ position:'relative', marginLeft:'auto', flexShrink:0 }}>
          <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#8B6B3D' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ padding:'7px 12px 7px 30px', border:'1px solid #D4B896', borderRadius:10, fontSize:13, outline:'none', width:160 }} />
        </div>
      </div>

      {loading ? (
        <div className="menu-grid">
          {Array.from({length:8}).map((_,i) => <div key={i} style={{ height:240, background:'#F5ECD7', borderRadius:16, animation:'pulse 1.5s infinite' }} />)}
        </div>
      ) : (
        <div className="menu-grid">
          {items.map(item => (
            <motion.div key={item._id} layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
              style={{ background:'#fff', borderRadius:16, border:'1px solid #D4B896', overflow:'hidden', opacity: item.isAvailable ? 1 : 0.65 }}>
              <div className="menu-card-img" style={{ position:'relative' }}>
                <img src={item.image||'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300'} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', top:6, right:6, display:'flex', gap:4 }}>
                  {item.featured && <span style={{ background:'#F59E0B', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:10 }}>TOP</span>}
                  <button onClick={() => handleToggle(item._id)} style={{ background: item.isAvailable?'#166534':'#6B7280', border:'none', borderRadius:6, cursor:'pointer', padding:4, display:'flex' }}>
                    {item.isAvailable ? <ToggleRight size={13} color="#fff"/> : <ToggleLeft size={13} color="#fff"/>}
                  </button>
                </div>
                <span style={{ position:'absolute', bottom:6, left:6, background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {CATS.find(c => c.key === item.category)?.label || item.category}
                </span>
              </div>
              <div style={{ padding:'10px 12px' }}>
                <p className="menu-card-title" style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:13, color:'#1A0F00', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                <p className="menu-card-desc" style={{ fontSize:11, color:'#8B6B3D', margin:'0 0 6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</p>
                {item.accompagnements?.length > 0 && (
                  <div className="accomp-section">
                    <p className="accomp-label">Accompagnements</p>
                    <div>{item.accompagnements.map((a, i) => <span key={i} className="accomp-tag">{a}</span>)}</div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                  <span className="menu-card-price" style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, color:'#C4531A', fontSize:15 }}>{item.price} MAD</span>
                  <div style={{ display:'flex', gap:5 }}>
                    <button onClick={() => openEdit(item)} style={{ ...btn('#FAF3E8','#C4531A'), padding:'4px 7px', border:'1px solid #D4B896' }}><Edit2 size={12}/></button>
                    <button onClick={() => handleDelete(item._id)} style={{ ...btn('#FEF2F2','#991B1B'), padding:'4px 7px', border:'1px solid #FECACA' }}><Trash2 size={12}/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {items.length === 0 && !loading && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px', color:'#8B6B3D' }}>
              <p>Aucun plat trouvé</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="modal-overlay"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
              className="modal-inner-wrap"
              style={{ boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ position:'sticky', top:0, background:'#fff', borderBottom:'1px solid #EDE0C4', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:1 }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:600, color:'#1A0F00', margin:0 }}>
                  {modal === 'edit' ? 'Modifier le plat' : 'Nouveau plat'}
                </h2>
                <button onClick={() => setModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#8B6B3D' }}><X size={18}/></button>
              </div>

              <div className="modal-inner" style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Nom du plat *</label>
                  <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} style={inputStyle} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Image du plat</label>
                  <div className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}>
                    {uploading ? (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <span style={{ width:24, height:24, border:'3px solid #D4B896', borderTopColor:'#C4531A', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                        <p style={{ fontSize:13, color:'#8B6B3D', margin:0 }}>Upload en cours...</p>
                      </div>
                    ) : preview ? (
                      <div style={{ position:'relative' }}>
                        <img src={preview} alt="preview" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:8 }} />
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                              style={{ padding:'7px 14px', background:'#fff', color:'#1A0F00', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              Fichier
                            </button>
                            <button type="button" onClick={e => { e.stopPropagation(); cameraInputRef.current?.click() }}
                              style={{ padding:'7px 14px', background:'#C4531A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'8px 0' }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(196,83,26,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Upload size={20} color="#C4531A" />
                        </div>
                        <p style={{ fontSize:13, color:'#5C3D11', fontWeight:600, margin:0 }}>Choisir une image</p>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            style={{ padding:'8px 16px', background:'#C4531A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Lato,sans-serif' }}>
                            Fichier
                          </button>
                          <button type="button" onClick={() => cameraInputRef.current?.click()}
                            style={{ padding:'8px 16px', background:'#1A0F00', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Lato,sans-serif' }}>
                            Photo / Galerie
                          </button>
                        </div>
                        <p style={{ fontSize:11, color:'#8B6B3D', margin:0 }}>JPG, PNG, HEIC · max 15MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files[0])} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files[0])} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} style={{ ...inputStyle, resize:'vertical' }} />
                </div>

                <div className="modal-grid-2">
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Prix (MAD) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form,price:e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Temps (min)</label>
                    <input type="number" value={form.preparationTime} onChange={e => setForm({...form,preparationTime:Number(e.target.value)})} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Catégorie</label>
                  <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} style={{ ...inputStyle, background:'#fff' }}>
                    {CATS.slice(1).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <div style={{ background:'#FFFBF0', border:'1px solid #FDE68A', borderRadius:10, padding:'12px 14px' }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
                    Accompagnements (séparés par virgule)
                  </label>
                  <p style={{ fontSize:11, color:'#B45309', margin:'0 0 8px' }}>Ex : riz, frites, salade verte, pain</p>
                  <input value={form.accompagnements} onChange={e => setForm({...form, accompagnements:e.target.value})} placeholder="riz, frites, salade..." style={{ ...inputStyle, background:'#fff', borderColor:'#FDE68A' }} />
                  {form.accompagnements && (
                    <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:4 }}>
                      {form.accompagnements.split(',').map(a => a.trim()).filter(Boolean).map((a, i) => <span key={i} className="accomp-tag">{a}</span>)}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#5C3D11', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Tags (séparés par virgule)</label>
                  <input value={form.tags} onChange={e => setForm({...form,tags:e.target.value})} placeholder="épicé, végétarien..." style={inputStyle} />
                </div>

                <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                  {[['isAvailable','Disponible'],['featured','Mis en avant']].map(([field,label]) => (
                    <label key={field} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, color:'#1A0F00' }}>
                      <input type="checkbox" checked={form[field]} onChange={e => setForm({...form,[field]:e.target.checked})} style={{ width:16, height:16, accentColor:'#C4531A' }} />
                      {label}
                    </label>
                  ))}
                </div>

                <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                  <button onClick={() => setModal(null)} style={{ ...btn('#FAF3E8','#5C3D11'), flex:1, padding:11, border:'1px solid #D4B896', borderRadius:10, fontSize:14 }}>Annuler</button>
                  <button onClick={handleSave} disabled={saving || uploading} style={{ ...btn('#C4531A','#fff'), flex:1, padding:11, borderRadius:10, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: (saving||uploading)?0.7:1 }}>
                    {saving && <span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />}
                    <Save size={14}/>{saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}