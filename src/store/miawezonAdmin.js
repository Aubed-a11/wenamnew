import { create } from 'zustand'
import api from '../api/axios'

// Reçus de virement en attente de validation (badge et alertes de l'admin)
export const useMzPending = create((set) => ({
  pending: 0,
  oldestAt: null,
  refresh: async () => {
    try {
      const { data } = await api.get('/miawezon/admin/pending')
      set({ pending: data.awaiting || 0, oldestAt: data.oldestAt || null })
    } catch { /* hors ligne ou non admin */ }
  },
}))
