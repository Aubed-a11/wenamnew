import { useEffect, useState } from 'react'
import { CheckCircle, Trash2, MessageSquare, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const css = `
  .review-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .review-card { background: #fff; borderRadius: 14px; border: 1px solid #D4B896; padding: 14px; display: flex; gap: 12px; align-items: flex-start; }
  .review-actions { display: flex; gap: 6px; flex-shrink: 0; }
  @media (max-width: 480px) {
    .review-card-inner { flex-wrap: wrap; }
    .review-actions { width: 100%; justify-content: flex-end; margin-top: 8px; }
  }
`

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [tab, setTab] = useState('pending')
  const [responding, setResponding] = useState(null)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    const q = tab === 'all' ? '' : `?approved=${tab === 'approved'}`
    api.get('/reviews/admin' + q).then(({ data }) => setReviews(data.reviews || [])).finally(() => setLoading(false))
  }
  useEffect(fetch, [tab])

  const approve = async (id) => { await api.patch(`/reviews/${id}/approve`); toast.success('Approuvé'); fetch() }
  const remove = async (id) => { if (!confirm('Supprimer ?')) return; await api.delete(`/reviews/${id}`); toast.success('Supprimé'); fetch() }
  const sendResponse = async () => { await api.put(`/reviews/${responding}/respond`, { response }); toast.success('Réponse envoyée'); setResponding(null); setResponse(''); fetch() }

  const tabStyle = (t) => ({
    padding: '7px 16px', border: `1px solid ${tab === t ? '#C4531A' : '#D4B896'}`, borderRadius: 20,
    background: tab === t ? '#C4531A' : '#fff', color: tab === t ? '#fff' : '#5C3D11',
    cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap'
  })

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>
      <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(18px,4vw,22px)', fontWeight: 700, color: '#1A0F00', margin: '0 0 20px' }}>Avis Clients</h1>

      <div className="review-tabs">
        {[['pending', 'En attente'], ['approved', 'Approuvés'], ['all', 'Tous']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={tabStyle(k)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8B6B3D' }}>Chargement...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8B6B3D' }}>
          <p>Aucun avis dans cette catégorie</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r._id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #D4B896', padding: '14px 16px' }}>
              <div className="review-card-inner" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(196,83,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4531A', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{r.user?.name?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1A0F00' }}>{r.user?.name}</span>
                    <span style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(r.rating)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: r.isApproved ? '#F0FDF4' : '#FEFCE8', color: r.isApproved ? '#166534' : '#B7791F' }}>
                      {r.isApproved ? 'Approuvé' : 'En attente'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#5C3D11', margin: '0 0 4px', lineHeight: 1.5 }}>{r.comment}</p>
                  {r.adminResponse && <p style={{ fontSize: 12, color: '#8B6B3D', fontStyle: 'italic', margin: 0 }}>Réponse: {r.adminResponse}</p>}
                  <p style={{ fontSize: 11, color: '#8B6B3D', margin: '6px 0 0' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="review-actions">
                  {!r.isApproved && <button onClick={() => approve(r._id)} style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 7, cursor: 'pointer', padding: '6px 8px', display: 'flex' }}><CheckCircle size={15} color="#166534" /></button>}
                  <button onClick={() => { setResponding(r._id); setResponse('') }} style={{ background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: 7, cursor: 'pointer', padding: '6px 8px', display: 'flex' }}><MessageSquare size={15} color="#2563EB" /></button>
                  <button onClick={() => remove(r._id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, cursor: 'pointer', padding: '6px 8px', display: 'flex' }}><Trash2 size={15} color="#DC2626" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {responding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1A0F00', margin: 0 }}>Répondre à l'avis</h2>
              <button onClick={() => setResponding(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4} placeholder="Votre réponse..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D4B896', borderRadius: 8, fontSize: 13, resize: 'none', boxSizing: 'border-box', marginBottom: 12, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setResponding(null)} style={{ flex: 1, padding: 10, border: '1px solid #D4B896', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Annuler</button>
              <button onClick={sendResponse} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, background: '#C4531A', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


