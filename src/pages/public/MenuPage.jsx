import { motion } from 'framer-motion'
import { Clock, Search, ShoppingCart, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useCartStore } from '../../store'

const CATEGORIES = [
  { key: '', label: 'Tous' },
  { key: 'entrees', label: 'Entrées' },
  { key: 'plats_principaux', label: 'Plats Principaux' },
  { key: 'grillades', label: 'Grillades' },
  { key: 'accompagnements', label: 'Accompagnements' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'boissons', label: 'Boissons' },
  { key: 'autres', label: 'Autres' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="h-48 bg-cream-warm" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-cream-warm rounded w-3/4" />
        <div className="h-3 bg-cream-warm rounded w-full" />
        <div className="h-3 bg-cream-warm rounded w-2/3" />
        <div className="h-8 bg-cream-warm rounded" />
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    setLoading(true)
    api.get(`/menu?${params}`).then(({ data }) => {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }).finally(() => setLoading(false))
  }, [category, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleAdd = (item) => {
    if (!item.isAvailable) return
    addItem(item)
    toast.success(`${item.name} ajouté au panier !`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-primary py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">Notre Menu</h1>
          <p className="text-white/70 font-body text-sm sm:text-base">Découvrez nos {total} plats préparés avec passion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un plat..." className="input pl-9 w-full" />
          </form>

          {/* Categories — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${category === cat.key ? 'bg-primary text-white border-primary' : 'border-border text-text-medium hover:border-primary'}`}>
                {cat.label}
              </button>
            ))}
            {(category || search) && (
              <button onClick={() => { setCategory(''); setSearch(''); setSearchInput('') }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-light hover:text-primary transition-colors whitespace-nowrap flex-shrink-0">
                <X size={13} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />) : (
            items.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="font-display text-xl text-text-dark mb-2">Aucun plat trouvé</p>
                <p className="text-text-light text-sm font-body">Essayez d'autres filtres</p>
              </div>
            ) : (
              items.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }} className={`bg-white rounded-2xl overflow-hidden shadow-card border border-border ${!item.isAvailable ? 'opacity-60' : ''}`}>
                  <div className="h-44 sm:h-48 relative overflow-hidden">
                    <img src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'} alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2.5 py-1 rounded-full font-body font-semibold">
                      {item.category.replace('_', ' ')}
                    </span>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-text-dark text-xs font-bold px-3 py-1 rounded-full">Non disponible</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-display font-semibold text-text-dark text-base mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-text-light text-xs font-body mb-3 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-3 mb-3 text-xs text-text-light">
                      <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{item.rating} ({item.reviewCount})</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{item.preparationTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-primary text-lg">{item.price} MAD</span>
                      <button onClick={() => handleAdd(item)} disabled={!item.isAvailable}
                        className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-lg font-body font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <ShoppingCart size={12} />Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
