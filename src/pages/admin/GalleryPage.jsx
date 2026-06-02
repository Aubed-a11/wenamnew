import { useEffect, useRef, useState } from 'react'
import { Image, Plus, Trash2, Upload, X } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATS = ['entrees', 'plats_principaux', 'desserts', 'boissons', 'ambiance', 'aecam']

const CAT_LABELS = {
  entrees: 'Entrées',
  plats_principaux: 'Plats Principaux',
  desserts: 'Desserts',
  boissons: 'Boissons',
  ambiance: 'Ambiance',
  aecam: '🎉 Festi AECAM 2026',
}

const css = `
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  @media (max-width: 480px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .tab-btn { padding: 7px 14px; border-radius: 20px; border: 1px solid #D4B896; background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: #8B6B3D; transition: all 0.2s; white-space: nowrap; }
  .tab-btn.active { background: #C4531A; color: #fff; border-color: #C4531A; }
  .tab-btn:hover:not(.active) { background: #F5ECD7; }
  .upload-zone { border: 2px dashed #D4B896; border-radius: 12px; padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.2s; background: #FDF8F2; }
  .upload-zone:hover, .upload-zone.drag { border-color: #C4531A; background: rgba(196,83,26,0.04); }
  .method-tab { flex: 1; padding: 9px; border: 1px solid #D4B896; background: none; cursor: pointer; font-size: 12px; font-weight: 700; color: #8B6B3D; transition: all 0.2s; }
  .method-tab:first-child { border-radius: 8px 0 0 8px; border-right: none; }
  .method-tab:last-child { border-radius: 0 8px 8px 0; }
  .method-tab.active { background: #C4531A; color: #fff; border-color: #C4531A; }
`

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [filterCat, setFilterCat] = useState('all')
  const [modal, setModal] = useState(false)
  const [method, setMethod] = useState('url') // 'url' | 'file'
  const [form, setForm] = useState({ title: '', image: '', category: 'aecam' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [drag, setDrag] = useState(false)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    api.get('/gallery').then(({ data }) => setItems(data.items || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)

  const resetModal = () => {
    setModal(false)
    setForm({ title: '', image: '', category: 'aecam' })
    setFile(null)
    setPreview(null)
    setMethod('url')
  }

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const add = async () => {
    if (!form.title) { toast.error('Le titre est requis'); return }

    setUploading(true)
    try {
      if (method === 'file') {
        if (!file) { toast.error('Sélectionne une image'); setUploading(false); return }
        // Upload via FormData
        const fd = new FormData()
        fd.append('image', file)
        fd.append('title', form.title)
        fd.append('category', form.category)
        await api.post('/gallery/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        if (!form.image) { toast.error("L'URL de l'image est requise"); setUploading(false); return }
        await api.post('/gallery', form)
      }
      toast.success('Photo ajoutée !')
      resetModal()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout')
    } finally {
      setUploading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette photo ?')) return
    await api.delete(`/gallery/${id}`)
    toast.success('Photo supprimée')
    load()
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #D4B896', borderRadius: 8, fontSize: 13, fontFamily: 'sans-serif', boxSizing: 'border-box', outline: 'none' }

  const catCounts = items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc }, {})

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px,4vw,22px)', fontWeight: 700, color: '#1A0F00', margin: '0 0 2px' }}>Galerie Photos</h1>
          <p style={{ fontSize: 12, color: '#8B6B3D', margin: 0 }}>{items.length} photo{items.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#C4531A', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          <Plus size={15} /> Ajouter une photo
        </button>
      </div>

      {/* Filtres par catégorie */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className={`tab-btn ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>
          Toutes ({items.length})
        </button>
        {CATS.filter(c => catCounts[c]).map(c => (
          <button key={c} className={`tab-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>
            {CAT_LABELS[c]} ({catCounts[c] || 0})
          </button>
        ))}
      </div>

      {/* Badge AECAM si des photos existent */}
      {(catCounts['aecam'] || 0) > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#0D0700,#2A1200)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ color: '#E8763A', fontSize: 12, fontWeight: 700, margin: '0 0 2px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Section Festi AECAM 2026</p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0 }}>
              {catCounts['aecam']} photo{catCounts['aecam'] !== 1 ? 's' : ''} — Ces photos apparaissent dans la section "2 ans de Wênam" sur la page d'accueil
            </p>
          </div>
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <div className="gallery-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', background: '#F5ECD7', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8B6B3D' }}>
          <Image size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 15, margin: '0 0 16px' }}>
            {filterCat === 'aecam' ? 'Aucune photo AECAM — ajoute des photos pour alimenter la section homepage' : 'Aucune photo dans cette catégorie'}
          </p>
          <button onClick={() => { setForm(f => ({ ...f, category: filterCat === 'all' ? 'aecam' : filterCat })); setModal(true) }}
            style={{ background: '#C4531A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            Ajouter une photo
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map(item => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: item.category === 'aecam' ? '2px solid rgba(196,83,26,0.5)' : '1px solid #D4B896' }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300'} />
              {item.category === 'aecam' && (
                <span style={{ position: 'absolute', top: 6, right: 6, background: '#C4531A', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: '0.08em' }}>AECAM</span>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 8, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, margin: '0 0 5px', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <button onClick={() => remove(item._id)} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, width: 'fit-content' }}>
                  <Trash2 size={10} /> Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1A0F00', margin: 0 }}>Nouvelle photo</h2>
              <button onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B6B3D' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Titre */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Titre *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nom de la photo" style={inputStyle} />
              </div>

              {/* Catégorie */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Catégorie *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                  {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
                {form.category === 'aecam' && (
                  <p style={{ fontSize: 11, color: '#C4531A', marginTop: 5, fontWeight: 600 }}>
                    ✓ Cette photo apparaîtra dans "2 ans de Wênam & Festi AECAM 2026" sur la page d'accueil
                  </p>
                )}
              </div>

              {/* Méthode d'upload */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Méthode d'ajout</label>
                <div style={{ display: 'flex' }}>
                  <button className={`method-tab ${method === 'url' ? 'active' : ''}`} onClick={() => setMethod('url')}>
                    🔗 Par URL
                  </button>
                  <button className={`method-tab ${method === 'file' ? 'active' : ''}`} onClick={() => setMethod('file')}>
                    <Upload size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Par fichier
                  </button>
                </div>
              </div>

              {/* Contenu selon méthode */}
              {method === 'url' ? (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>URL de l'image *</label>
                  <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://exemple.com/photo.jpg" style={inputStyle} />
                  {form.image && (
                    <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', height: 140, background: '#F5ECD7' }}>
                      <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C3D11', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Fichier image *</label>
                  <div
                    className={`upload-zone ${drag ? 'drag' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true) }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}>
                    {preview ? (
                      <div style={{ position: 'relative' }}>
                        <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                        <p style={{ fontSize: 11, color: '#8B6B3D', marginTop: 8, margin: '8px 0 0' }}>{file?.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} style={{ color: '#C4531A', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, color: '#5C3D11', fontWeight: 600, margin: '0 0 4px' }}>Clique ou glisse une image ici</p>
                        <p style={{ fontSize: 11, color: '#8B6B3D', margin: 0 }}>JPG, PNG, WEBP — max 5 Mo</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={resetModal} disabled={uploading}
                  style={{ flex: 1, padding: 10, border: '1px solid #D4B896', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5C3D11' }}>
                  Annuler
                </button>
                <button onClick={add} disabled={uploading}
                  style={{ flex: 2, padding: 10, border: 'none', borderRadius: 8, background: uploading ? '#E8A882' : '#C4531A', color: '#fff', cursor: uploading ? 'default' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? (
                    <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Ajout en cours...</>
                  ) : (
                    <><Plus size={14} /> Ajouter la photo</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
