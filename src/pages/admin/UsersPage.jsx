import { useEffect, useState } from 'react'
import { Search, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const css = `
  .users-search { width: 100%; max-width: 320px; }
  @media (max-width: 480px) { .users-search { max-width: 100%; } }
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
`

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsers = () => {
    setLoading(true)
    api.get('/users')
      .then(({ data }) => {
        setUsers(data.users || [])
      })
      .catch((err) => {
        toast.error('Erreur chargement utilisateurs')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  const toggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`)
      toast.success('Statut mis à jour')
      loadUsers()
    } catch {
      toast.error('Erreur')
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px,4vw,22px)', fontWeight: 700, color: '#1A0F00', margin: 0 }}>
          Utilisateurs
        </h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FAF3E8', border: '1px solid #D4B896', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700, color: '#C4531A' }}>
          <Users size={14} /> {loading ? '...' : users.length} client{users.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="users-search" style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8B6B3D' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, téléphone..."
          style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #D4B896', borderRadius: 10, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #D4B896', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: '#FAF3E8', borderBottom: '1px solid #D4B896' }}>
                {['Avatar', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Action'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: '#8B6B3D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F5ECD7' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: '12px 14px' }}>
                          <div style={{ height: 14, background: '#F5ECD7', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #F5ECD7' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(196,83,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C4531A' }}>
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#1A0F00', whiteSpace: 'nowrap' }}>{u.name}</td>
                      <td style={{ padding: '11px 14px', color: '#5C3D11', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                      <td style={{ padding: '11px 14px', color: '#8B6B3D', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12, background: u.role === 'admin' ? '#F5F3FF' : '#EFF6FF', color: u.role === 'admin' ? '#7C3AED' : '#2563EB' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12, background: u.isActive ? '#F0FDF4' : '#FEF2F2', color: u.isActive ? '#166534' : '#DC2626' }}>
                          {u.isActive ? 'Actif' : 'Bloqué'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => toggle(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                          {u.isActive ? <ToggleRight size={24} color="#16a34a" /> : <ToggleLeft size={24} color="#9ca3af" />}
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8B6B3D', fontSize: 14 }}>
              {users.length === 0 ? 'Aucun utilisateur enregistré' : 'Aucun résultat pour cette recherche'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
