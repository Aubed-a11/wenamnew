// Contenu statique de la rubrique MIAWÉZON.
// Pour mettre a jour les textes, le menu du buffet ou les photos, modifiez ce fichier.
// Les dates, le lieu, les prix et le nombre de places se reglent dans
// l'admin (Admin > MIAWÉZON > Réglages) car ils sont controles par le serveur.
//
// Images : remplacez les fichiers de public/images/miawezon/ en gardant les memes noms.

const IMG = '/images/miawezon'

export const MZ_ASSETS = {
  // Logo MIAWEZON : dark = sur fond clair, light = sur fond sombre, gold = version doree
  logo: { dark: `${IMG}/logo-dark.png`, light: `${IMG}/logo-light.png`, gold: `${IMG}/logo-gold.png` },
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
    { fr: 'Espace détente', en: 'Lounge area' },
  ],
  AGBADJA: [
    { fr: 'Accès au buffet premium', en: 'Premium buffet access' },
    { fr: 'Cadeau de bienvenue', en: 'Welcome gift' },
    { fr: 'Espace VIP dédié', en: 'Dedicated VIP area' },
  ],
}

// Menu du buffet : il se modifie dans l'admin (MIAWEZON > Menu du buffet).
// La liste ci-dessous ne sert que si le serveur ne renvoie pas encore de menu.
// tiers : menus ou le plat est servi.
const d = (fr, en, dfr = '', den = '', tiers = ['ZINLI', 'AGBADJA']) => ({ name: { fr, en }, desc: { fr: dfr, en: den }, tiers })

export const MZ_MENU_TIERS = ['ZINLI', 'AGBADJA']
export const MZ_MENU_SECTIONS = ['entrees', 'plats', 'desserts', 'boissons']

export const MZ_MENU = [
  { key: 'entrees', items: [
    d('Samoussa au bœuf', 'Beef samosa', 'Croustillant et savoureux', 'Crispy and tasty'),
    d('Accras de morue', 'Cod fritters', 'Recette traditionnelle', 'Traditional recipe'),
    d('Salade exotique', 'Exotic salad', 'Fraîche et colorée', 'Fresh and colourful'),
    d('Brochettes de gambas', 'Prawn skewers', 'Marinées aux épices douces', 'Marinated in mild spices', ['AGBADJA']),
  ] },
  { key: 'plats', items: [
    d('Poulet braisé', 'Grilled chicken', 'À la sauce épicée', 'With spicy sauce'),
    d('Poisson braisé', 'Grilled fish', 'Aux épices douces', 'With mild spices'),
    d('Riz gras', 'Jollof rice', 'Saveurs authentiques', 'Authentic flavours'),
    d('Agneau mijoté', 'Slow-cooked lamb', 'Sauce arachide', 'Peanut sauce', ['AGBADJA']),
  ] },
  { key: 'desserts', items: [
    d('Tarte à la mangue', 'Mango tart', 'Fruitée et gourmande', 'Fruity and indulgent'),
    d('Beignets sucrés', 'Sweet doughnuts', 'Douceur africaine', 'African sweetness'),
    d('Banane plantain', 'Plantain', 'Caramélisée', 'Caramelised'),
  ] },
  { key: 'boissons', items: [
    d('Jus de bissap', 'Hibiscus juice', 'Naturel', 'Natural'),
    d('Jus de gingembre', 'Ginger juice', 'Rafraîchissant', 'Refreshing'),
    d('Eau minérale', 'Mineral water', 'Fraîche et pure', 'Fresh and pure'),
    d('Cocktail de fruits', 'Fruit cocktail', 'Sans alcool', 'Alcohol free', ['AGBADJA']),
  ] },
]

// Plats d'un menu donne. `exclusive` = plat absent d'au moins un autre menu.
export const menuFor = (menu, tier) =>
  (menu && menu.length ? menu : MZ_MENU)
    .map((s) => ({
      ...s,
      items: (s.items || [])
        .filter((i) => (i.tiers || []).includes(tier))
        .map((i) => ({ ...i, exclusive: MZ_MENU_TIERS.some((x) => !(i.tiers || []).includes(x)) })),
    }))
    .filter((s) => s.items.length)

// Moyens de paiement affiches (le choix se fait sur la page YouCan Pay)
export const MZ_PAYMENT_METHODS = {
  card: ['Visa', 'Mastercard', 'CMI'],
  cash: ['CashPlus'],
}

// Habillage des billets (vitrine, billets numeriques et PDF)
export const MZ_TICKET_STYLE = {
  subtitle: { fr: 'Buffet & Événement', en: 'Buffet & Event' },
  slogan: { fr: 'Le goût du partage !', en: 'A taste of sharing!' },
  // Badge d'acces par categorie
  access: {
    ZINLI: { fr: 'Accès standard', en: 'Standard access' },
    AGBADJA: { fr: 'Accès VIP', en: 'VIP access' },
  },
  // Categories affichees en style sombre (VIP)
  dark: ['AGBADJA'],
}

// Verso du billet : conditions d'utilisation
export const MZ_TICKET_CONDITIONS = [
  { fr: 'Présentez votre billet (QR code) à l\'entrée.', en: 'Show your ticket (QR code) at the entrance.' },
  { fr: 'Ce billet est personnel et non transférable.', en: 'This ticket is personal and non-transferable.' },
  { fr: 'En cas de perte, aucun remplacement ne sera effectué.', en: 'Lost tickets will not be replaced.' },
  { fr: 'L\'accès à l\'espace VIP est réservé aux détenteurs du billet AGBADJA.', en: 'The VIP area is reserved for AGBADJA ticket holders.' },
]
