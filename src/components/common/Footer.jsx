import { Calendar, Clock, Instagram, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const INSTAGRAM = 'https://www.instagram.com/itswenam?igsh=cjNsN294M2RzNHBl&utm_source=qr'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-cream pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/wenam-logo.png" alt="Wênam" style={{ width: 36, height: 36, objectFit: 'contain', mixBlendMode: 'screen' }} />
            <h3 className="font-display text-2xl text-white">Wênam</h3>
          </div>
          <p className="text-cream/50 text-xs font-body tracking-widest uppercase mb-3">Avenue Al Majd 2, Rabat</p>
          <p className="text-cream/70 text-sm leading-relaxed mb-4">Cuisine africaine façon Bénin : du cœur à l’assiette</p>
          <div className="flex gap-3">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Instagram size={16} className="text-white" />
            </a>
            <a href="https://wa.me/212643389585" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors">
              <Phone size={16} className="text-white" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Navigation</h4>
          <ul className="space-y-2">
            {[['Accueil', '/'], ['Menu', '/menu'], ['Mon panier', '/cart'], ['Mon profil', '/profile']].map(([label, to]) => (
              <li key={to}><Link to={to} className="text-cream/70 text-sm hover:text-white transition-colors font-body">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Horaires</h4>
          <ul className="space-y-3 text-sm text-cream/70 font-body">
            <li className="flex items-center gap-2"><Clock size={13} className="text-primary-light shrink-0"/>Ouverture: <strong className="text-white">09h00</strong></li>
            <li className="flex items-center gap-2"><Clock size={13} className="text-primary-light shrink-0"/>Arrêt livraisons: <strong className="text-white">20h00</strong></li>
            <li className="flex items-center gap-2"><Calendar size={13} className="text-primary-light shrink-0"/>Commandes <strong className="text-white">24h à l'avance</strong></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-cream/70 font-body">
            <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 text-primary-light shrink-0"/>Avenue Al Majd 2<br/>Rabat, Maroc</li>
            <li className="flex items-center gap-2"><Phone size={13} className="text-primary-light"/>
              <a href="tel:+212643389585" className="hover:text-white transition-colors">+212 643 389 585</a>
            </li>
            <li className="flex items-center gap-2"><Instagram size={13} className="text-primary-light"/>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@itswenam</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
        <p className="text-cream/40 text-xs font-body">© 2025 Wênam. Tous droits réservés.</p>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-cream/50 hover:text-white text-xs font-body transition-colors">
          <Instagram size={12}/>Suivre @itswenam
        </a>
      </div>
    </footer>
  )
}
