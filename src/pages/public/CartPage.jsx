// CartPage.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useAuthStore, useCartStore } from '../../store'

const css = `
  .cart-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  @media (min-width: 1024px) { .cart-grid { grid-template-columns: 1fr 1fr 1fr; } }
  .cart-items { grid-column: span 1; }
  @media (min-width: 1024px) { .cart-items { grid-column: span 2; } }
  .cart-item { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .cart-item-img { width: 80px; height: 80px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
  @media (max-width: 480px) {
    .cart-item-img { width: 60px; height: 60px; }
    .cart-item { gap: 10px; }
    .cart-title { font-size: 13px !important; }
    .cart-qty { gap: 6px !important; }
  }
  .cart-summary { position: static; }
  @media (min-width: 1024px) { .cart-summary { position: sticky; top: 96px; } }
`

export function CartPage() {
  const { items, removeItem, updateQty, clear } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryFee = items.length ? 15 : 0
  const total = subtotal + deliveryFee

  const handleCheckout = () => {
    if (!user) { toast.error('Connectez-vous pour commander'); navigate('/login'); return }
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen">
      <style>{css}</style>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
        <h1 className="font-display" style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 700, marginBottom: 32 }}>Mon Panier</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px' }}>
            <p className="font-display" style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, marginBottom: 8 }}>Votre panier est vide</p>
            <p className="text-text-light font-body" style={{ marginBottom: 32 }}>Découvrez nos délicieux plats</p>
            <Link to="/menu" className="btn-primary">Découvrir le menu</Link>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Items */}
            <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-border shadow-card"
                    style={{ borderRadius: 16, padding: '12px 16px' }}>
                    <div className="cart-item">
                      <img src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200'} alt={item.name} className="cart-item-img" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="font-display cart-title" style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</h3>
                        <p className="text-primary font-bold font-body" style={{ fontSize: 14 }}>{item.price.toFixed(2)} MAD</p>
                      </div>
                      <div className="cart-qty" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateQty(item._id, item.quantity - 1)}
                          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}>
                          <Minus size={13} />
                        </button>
                        <span className="font-semibold font-body" style={{ width: 28, textAlign: 'center', fontSize: 14 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, item.quantity + 1)}
                          style={{ width: 32, height: 32, borderRadius: '50%', background: '#C4531A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                          <Plus size={13} color="#fff" />
                        </button>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 70 }}>
                        <p className="font-display font-bold" style={{ fontSize: 15 }}>{(item.price * item.quantity).toFixed(2)} MAD</p>
                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', marginTop: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Link to="/menu" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', marginTop: 4 }}>
                <ArrowLeft size={14} /> Continuer les achats
              </Link>
            </div>

            {/* Summary */}
            <div className="cart-summary bg-white border border-border shadow-card" style={{ borderRadius: 20, padding: '24px 20px', height: 'fit-content' }}>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Récapitulatif</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Sous-total</span>
                  <span>{subtotal.toFixed(2)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Livraison</span>
                  <span>{deliveryFee.toFixed(2)} MAD</span>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span>
                  <span className="font-display text-primary" style={{ fontSize: 20, color: '#C4531A' }}>{total.toFixed(2)} MAD</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="btn-primary"
                style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ShoppingBag size={16} /> Passer la commande
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default CartPage



