import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock, Instagram, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useAuthStore } from '../../store'

const OPENING_PHOTOS = [
  '/images/opening1.jpeg',
  '/images/opening2.jpeg',
  '/images/opening3.jpeg',
  '/images/opening4.jpeg',
  '/images/opening5.jpeg',
  '/images/opening6.jpeg',
  '/images/opening7.jpeg',
  '/images/opening8.jpeg',
]

const CATEGORIES = [
  { key: 'entrees', label: 'Entrées', img: '/images/opening1.jpeg' },
  { key: 'plats_principaux', label: 'Plats Principaux', img: '/images/opening3.jpeg' },
  { key: 'desserts', label: 'Desserts', img: '/images/opening2.jpeg' },
  { key: 'boissons', label: 'Boissons', img: '/images/opening5.jpeg' },
]

const REVIEWS = [
  { name: 'Astrid', rating: 5, text: "Cuisine raffinée, service impeccable. Better food, better mood — c'est tellement vrai !", city: 'Rabat' },
  { name: 'Divine', rating: 5, text: 'Les plats sont délicieux et la livraison super rapide. Je recommande vivement !', city: 'Rabat' },
  { name: 'Nelie', rating: 4, text: "Excellente qualité, présentation soignée. Wênam c'est une vraie découverte.", city: 'Rabat' },
]

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }

const css = `
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .hero-h1 { font-size: 52px; }
  .promo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .hero-video-wrap { width: 100%; max-width: 340px; border-radius: 20px; overflow: hidden; border: 4px solid #EDE0C4; box-shadow: 0 8px 32px rgba(139,58,15,0.15); aspect-ratio: 9/16; position: relative; }
  @media (max-width: 768px) {
    .hero-grid { grid-template-columns: 1fr; gap: 28px; }
    .hero-h1 { font-size: clamp(28px, 7vw, 42px); }
    .hero-video-wrap { max-width: 260px; }
    .promo-grid { grid-template-columns: 1fr; gap: 24px; }
    .hero-ctas { flex-direction: column; }
    .hero-stats { gap: 16px !important; }
  }
  @media (max-width: 480px) { .hero-h1 { font-size: 26px; } }
`

export default function HomePage() {
  const { user } = useAuthStore()
  const [featured, setFeatured] = useState([])
  const [promo, setPromo] = useState(null)
  const [openingIdx, setOpeningIdx] = useState(0)
  const [ordersCount, setOrdersCount] = useState(100)

  useEffect(() => {
    api.get('/menu?featured=true&limit=6').then(({ data }) => setFeatured(data.items || [])).catch(() => {})
    api.get('/settings/public/promo').then(({ data }) => setPromo(data.promo)).catch(() => {})
    // Fetch le compteur de plats servis
    api.get('/settings/public/orders-count')
      .then(({ data }) => { if (data.count) setOrdersCount(data.count) })
      .catch(() => {})
    const t = setInterval(() => setOpeningIdx(i => (i + 1) % OPENING_PHOTOS.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Lato, sans-serif' }}>
      <style>{css}</style>
      <Navbar />

      {/* INFO BAR */}
      <div style={{ background: '#8B3A0F', color: '#fff', fontSize: 12, padding: '8px 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px 24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={11} /> Ouvert 09h · Livraisons jusqu'à 20h</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={11} /> Avenue Al Majd 2, Rabat</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={11} /> Commandes 24h à l'avance</span>
          <a href="https://www.instagram.com/itswenam?igsh=cjNsN294M2RzNHBl&utm_source=qr" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff', textDecoration: 'none' }}>
            <Instagram size={11} /> @itswenam
          </a>
        </div>
      </div>

      {/* HERO */}
      <section style={{ background: '#FAF3E8', minHeight: 580, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 40, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(196,83,26,0.05)' }} />
        <div style={{ position: 'absolute', bottom: 40, right: '30%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(196,83,26,0.04)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 20px', width: '100%' }}>
          <div className="hero-grid">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.6 }}>
              <p style={{ color: '#C4531A', fontWeight: 700, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Bienvenue à Wênam</p>
              <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1A0F00', lineHeight: 1.15, margin: '0 0 8px' }}>
                Commandez de la<br />Délicieuse Cuisine
              </h1>
              <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic', color: '#C4531A', lineHeight: 1.15, margin: '0 0 32px' }}>en Ligne</h1>
              <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link to="/menu" style={{ background: '#C4531A', color: '#fff', padding: '13px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Voir le Menu
                </Link>
                {!user && (
                  <Link to="/register" style={{ border: '2px solid #C4531A', color: '#C4531A', padding: '11px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Créer un compte
                  </Link>
                )}
              </div>
              <div className="hero-stats" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  [`+${ordersCount}`, 'Plats servis'],
                  ['4.9 ★', 'Note moyenne'],
                  ['30 min', 'Livraison'],
                ].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#C4531A', margin: 0 }}>{val}</p>
                    <p style={{ fontSize: 12, color: '#8B6B3D', margin: 0 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vidéo hero format portrait */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
              style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="hero-video-wrap">
                <video
                  src="/videos/hero-wenam.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: '#F5ECD7', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 600, color: '#1A0F00', marginBottom: 32 }}>
            Explorez Notre Menu
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.key} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #D4B896', boxShadow: '0 2px 12px rgba(139,58,15,0.1)', cursor: 'pointer' }}>
                <div style={{ height: 140, overflow: 'hidden' }}>
                  <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: '#1A0F00', fontSize: 15, margin: '0 0 8px' }}>{cat.label}</h3>
                  <Link to={`/menu?category=${cat.key}`} style={{ display: 'block', textAlign: 'center', background: '#C4531A', color: '#fff', padding: '7px', borderRadius: 8, textDecoration: 'none', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Voir Menu
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO */}
      {promo?.active && (
        <section style={{ background: '#C4531A', padding: '64px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="promo-grid">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Offre Spéciale</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px,10vw,80px)', fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1 }}>{promo.percent}%</h2>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,5vw,36px)', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', margin: '0 0 8px' }}>OFF</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(16px,3vw,24px)', color: 'rgba(255,255,255,0.7)', margin: '0 0 32px' }}>{promo.label}</p>
                {promo.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 32 }}>{promo.description}</p>}
                <Link to="/menu" style={{ display: 'inline-block', background: '#fff', color: '#C4531A', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Commander Maintenant
                </Link>
              </motion.div>
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: 24, textAlign: 'center' }}>
                  Vidéo promo ici<br /><code style={{ fontSize: 11 }}>public/videos/promo.mp4</code>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED DISHES */}
      {featured.length > 0 && (
        <section style={{ background: '#FAF3E8', padding: '72px 20px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 600, color: '#1A0F00', marginBottom: 32 }}>Nos Spécialités</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {featured.map((item, i) => (
                <motion.div key={item._id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #D4B896', boxShadow: '0 2px 12px rgba(139,58,15,0.1)' }}>
                  <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image || '/images/opening3.jpeg'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 10, left: 10, background: '#C4531A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16, color: '#1A0F00', margin: '0 0 6px' }}>{item.name}</h3>
                    <p style={{ fontSize: 13, color: '#8B6B3D', margin: '0 0 12px', lineHeight: 1.5 }}>{item.description}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#8B6B3D', marginBottom: 14 }}>
                      <span>★ {item.rating}</span>
                      <span>⏱ {item.preparationTime} min</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#C4531A', fontSize: 20 }}>{item.price} MAD</span>
                      <Link to="/menu" style={{ background: '#C4531A', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Commander</Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/menu" style={{ border: '2px solid #C4531A', color: '#C4531A', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Voir tout le menu <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* GALERIE */}
      <section style={{ background: '#1A0F00', padding: '72px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ color: '#E8763A', fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>Inauguration Officielle</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,5vw,36px)', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>18 Mai 2024</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>Le jour où Wênam a ouvert ses portes à Rabat.</p>
          </motion.div>
        </div>
        <div style={{ position: 'relative' }}>
          <motion.div
            style={{ display: 'flex', gap: 16, paddingLeft: 20 }}
            animate={{ x: [`0px`, `-${OPENING_PHOTOS.length * 296}px`] }}
            transition={{ duration: OPENING_PHOTOS.length * 4, repeat: Infinity, ease: 'linear' }}>
            {[...OPENING_PHOTOS, ...OPENING_PHOTOS].map((photo, i) => (
              <div key={i} style={{ width: 260, height: 195, flexShrink: 0, borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)' }}>
                <img src={photo} alt={`Wênam lancement ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </motion.div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 36, padding: '0 20px' }}>
          <a href="https://www.instagram.com/itswenam?igsh=cjNsN294M2RzNHBl&utm_source=qr" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '11px 24px', borderRadius: 999, textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
            <Instagram size={16} /> Suivre @itswenam sur Instagram
          </a>
        </div>
      </section>

      {/* INFOS PRATIQUES */}
      <section style={{ background: '#F5ECD7', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 600, color: '#1A0F00', marginBottom: 32, textAlign: 'center' }}>Infos Pratiques</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { icon: Clock, title: 'Horaires', lines: ['Ouverture: 09h00', 'Arrêt livraisons: 20h00'] },
              { icon: Calendar, title: 'Commandes', lines: ["24h à l'avance", 'Livraison à domicile'] },
              { icon: Phone, title: 'Contact', lines: ['+212 643 389 585', '@itswenam'] },
              { icon: MapPin, title: 'Adresse', lines: ['Avenue Al Majd 2', 'Rabat, Maroc'] },
            ].map(({ icon: Icon, title, lines }) => (
              <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                style={{ background: '#fff', borderRadius: 20, padding: '22px 18px', textAlign: 'center', border: '1px solid #D4B896', boxShadow: '0 2px 12px rgba(139,58,15,0.08)' }}>
                <div style={{ width: 44, height: 44, background: 'rgba(196,83,26,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon size={20} color="#C4531A" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 16, color: '#1A0F00', margin: '0 0 8px' }}>{title}</h3>
                {lines.map((l, i) => <p key={i} style={{ fontSize: 13, color: '#5C3D11', margin: '2px 0' }}>{l}</p>)}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: '#FAF3E8', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 600, color: '#1A0F00', marginBottom: 32 }}>Ce que Disent Nos Clients</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid #D4B896', boxShadow: '0 2px 12px rgba(139,58,15,0.08)' }}>
                <div style={{ color: '#F59E0B', fontSize: 18, marginBottom: 12 }}>{'★'.repeat(r.rating)}</div>
                <p style={{ fontSize: 14, color: '#5C3D11', fontStyle: 'italic', marginBottom: 16, lineHeight: 1.7 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid #EDE0C4' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(196,83,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#C4531A' }}>{r.name[0]}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#1A0F00', margin: 0 }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: '#8B6B3D', margin: 0 }}>{r.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
