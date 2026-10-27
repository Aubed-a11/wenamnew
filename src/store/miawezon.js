import { create } from 'zustand'
import api from '../api/axios'

// Donnees publiques de l'evenement MIAWÉZON (configuration, categories, paiement).
// `offset` corrige l'horloge locale avec l'heure du serveur pour les comptes a rebours.
export const useMiawezon = create((set, get) => ({
  data: null,
  loading: false,
  error: null,
  fetchedAt: 0,
  offset: 0,

  load: async (force = false) => {
    const { data, fetchedAt, loading } = get()
    if (!force && data && Date.now() - fetchedAt < 60_000) return data
    if (loading && !force) return data
    set({ loading: true })
    try {
      const res = await api.get('/miawezon/event')
      const serverTime = new Date(res.data.serverTime).getTime()
      set({ data: res.data, fetchedAt: Date.now(), offset: Number.isFinite(serverTime) ? serverTime - Date.now() : 0, error: null })
      return res.data
    } catch (err) {
      set({ error: err })
      return null
    } finally {
      set({ loading: false })
    }
  },
}))

// La rubrique est visible (publiee, ou apercu admin)
export const isMiawezonVisible = (data) => Boolean(data?.event?.published || data?.preview)
