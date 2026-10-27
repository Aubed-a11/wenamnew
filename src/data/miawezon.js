// Contenu statique de la rubrique MIAWÉZON.
// Pour mettre a jour les textes, le menu du buffet ou les photos, modifiez ce fichier.
// Les dates, le lieu, les prix et le nombre de places se reglent dans
// l'admin (Admin > MIAWÉZON > Réglages) car ils sont controles par le serveur.
//
// Images : remplacez les fichiers de public/images/miawezon/ en gardant les memes noms.

const IMG = '/images/miawezon'

export const MZ_ASSETS = {
  logo: `${IMG}/logo.png`,
  hero: `${IMG}/hero.jpg`,
  homeBanner: `${IMG}/banniere-accueil.jpg`,
  concept: `${IMG}/concept.jpg`,
  // Video de presentation (optionnelle). Exemple : '/videos/miawezon.mp4'
  conceptVideo: null,
}

export const MZ_CONCEPT = {
  fr: 'MIAWÉZON, c\'est bien plus qu\'un buffet. C\'est une invitation au voyage des saveurs, une célébration de notre culture, une rencontre autour de plats authentiques, dans une ambiance chaleureuse et festive.',
  en: 'MIAWÉZON is much more than a buffet. It is an invitation to a journey of flavours, a celebration of our culture, a gathering around authentic dishes in a warm and festive atmosphere.',
}

// icon : nom d'une icone lucide-react declaree dans src/components/miawezon/ui.jsx (ICONS)
export const MZ_VALUES = [
  { icon: 'UtensilsCrossed', label: { fr: 'Cuisine authentique', en: 'Authentic cuisine' } },
  { icon: 'Users', label: { fr: 'Partage et convivialité', en: 'Sharing and friendship' } },
  { icon: 'Drama', label: { fr: 'Culture et tradition', en: 'Culture and tradition' } },
  { icon: 'PartyPopper', label: { fr: 'Ambiance festive', en: 'Festive atmosphere' } },
]

export const MZ_WHY = [
  { icon: 'ChefHat', label: { fr: 'Saveurs authentiques', en: 'Authentic flavours' } },
  { icon: 'Music', label: { fr: 'Ambiance festive', en: 'Festive atmosphere' } },
  { icon: 'HeartHandshake', label: { fr: 'Réseautage', en: 'Networking' } },
  { icon: 'Landmark', label: { fr: 'Culture et partage', en: 'Culture and sharing' } },
]

export const MZ_GALLERY = [
  { src: `${IMG}/galerie-1.jpg`, alt: { fr: 'Plats du buffet', en: 'Buffet dishes' } },
  { src: `${IMG}/galerie-2.jpg`, alt: { fr: 'La salle', en: 'The venue' } },
  { src: `${IMG}/galerie-3.jpg`, alt: { fr: 'Entrées', en: 'Starters' } },
  { src: `${IMG}/galerie-4.jpg`, alt: { fr: 'Décoration', en: 'Decoration' } },
  { src: `${IMG}/galerie-5.jpg`, alt: { fr: 'Le buffet', en: 'The buffet' } },
]

// Prestations affichees sur chaque billet (cle = code de la categorie dans l'admin)
export const MZ_TICKET_PERKS = {
  ZINLI: [
    { fr: 'Accès au buffet', en: 'Buffet access' },
    { fr: 'Animation culturelle', en: 'Cultural entertainment' },
    { fr: 'Espace détente', en: 'Lounge area' },
  ],
  AGBADJA: [
    { fr: 'Accès prioritaire', en: 'Priority access' },
    { fr: 'Buffet premium', en: 'Premium buffet' },
    { fr: 'Boisson incluse', en: 'Drink included' },
    { fr: 'Espace VIP', en: 'VIP area' },
  ],
}

// Menu du buffet (apercu tant que "Menu définitif" n'est pas coche dans l'admin)
const m = (slug, fr, en, dfr, den) => ({ img: `${IMG}/menu/${slug}.jpg`, name: { fr, en }, desc: { fr: dfr, en: den } })

export const MZ_MENU = [
  {
    key: 'entrees',
    kind: 'dishes',
    items: [
      m('samoussa', 'Samoussa au bœuf', 'Beef samosa', 'Croustillant et savoureux', 'Crispy and tasty'),
      m('accras', 'Accras de morue', 'Cod fritters', 'Recette traditionnelle', 'Traditional recipe'),
      m('salade', 'Salade exotique', 'Exotic salad', 'Fraîche et colorée', 'Fresh and colourful'),
    ],
  },
  {
    key: 'plats',
    kind: 'dishes',
    items: [
      m('poulet-braise', 'Poulet braisé', 'Grilled chicken', 'À la sauce épicée', 'With spicy sauce'),
      m('poisson-braise', 'Poisson braisé', 'Grilled fish', 'Aux épices douces', 'With mild spices'),
      m('riz-gras', 'Riz gras', 'Jollof rice', 'Saveurs authentiques', 'Authentic flavours'),
    ],
  },
  {
    key: 'desserts',
    kind: 'dishes',
    items: [
      m('tarte-mangue', 'Tarte à la mangue', 'Mango tart', 'Fruitée et gourmande', 'Fruity and indulgent'),
      m('beignets', 'Beignets sucrés', 'Sweet doughnuts', 'Douceur africaine', 'African sweetness'),
      m('banane-caramel', 'Banane plantain', 'Plantain', 'Caramélisée', 'Caramelised'),
    ],
  },
  {
    key: 'boissons',
    kind: 'drinks',
    items: [
      m('bissap', 'Jus de bissap', 'Hibiscus juice', 'Naturel', 'Natural'),
      m('gingembre', 'Jus de gingembre', 'Ginger juice', 'Rafraîchissant', 'Refreshing'),
      m('eau', 'Eau minérale', 'Mineral water', 'Fraîche et pure', 'Fresh and pure'),
    ],
  },
]

// Moyens de paiement affiches (le choix reel se fait dans la fenetre KKiaPay)
export const MZ_PAYMENT_METHODS = {
  mobileMoney: ['MTN MoMo', 'Moov Money', 'Celtiis Cash'],
  card: ['Visa', 'Mastercard'],
}
