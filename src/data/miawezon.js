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

// Textes repris du dossier de presentation MIAWÉZON (Wênam, 2026)
export const MZ_SIGNATURE = {
  fr: 'Faire découvrir le Bénin autour d\'une table.',
  en: 'Discovering Benin around a table.',
}

export const MZ_CONCEPT = {
  fr: 'MIAWÉZON est un événement gastronomique et culturel dédié à la découverte du Bénin à travers sa cuisine. Autour d\'un buffet 100\u00a0% béninois, chaque plat raconte une histoire, une tradition, une manière de recevoir. On y vient pour manger, mais surtout pour découvrir et rencontrer le Bénin, dans un cadre convivial et chaleureux.',
  en: 'MIAWÉZON is a food and cultural event dedicated to discovering Benin through its cuisine. Around a 100% Beninese buffet, every dish tells a story, a tradition, a way of welcoming. You come to eat, but above all to discover and meet Benin, in a warm and friendly setting.',
}

// icon : nom d'une icone lucide-react declaree dans src/components/miawezon/ui.jsx (ICONS)
export const MZ_VALUES = [
  { icon: 'UtensilsCrossed', label: { fr: 'Buffet 100\u00a0% béninois', en: '100% Beninese buffet' } },
  { icon: 'BookOpen', label: { fr: 'L\'histoire de chaque plat', en: 'The story of each dish' } },
  { icon: 'HeartHandshake', label: { fr: 'Un pont Bénin et Maroc', en: 'A bridge between Benin and Morocco' } },
  { icon: 'Music', label: { fr: 'Ambiance culturelle', en: 'Cultural atmosphere' } },
]

// Ce qui attend les invites
export const MZ_EXPERIENCE = [
  { icon: 'ChefHat', title: { fr: 'Les spécialités du Bénin', en: 'Beninese specialities' }, text: { fr: 'Un buffet exclusivement béninois pour découvrir, ou redécouvrir, la diversité de la cuisine du pays.', en: 'An exclusively Beninese buffet to discover, or rediscover, the diversity of the country\'s cuisine.' } },
  { icon: 'BookOpen', title: { fr: 'Des plats qui se racontent', en: 'Dishes with a story' }, text: { fr: 'La présentation des plats, leur origine et leur place dans la culture béninoise.', en: 'Each dish presented with its origin and its place in Beninese culture.' } },
  { icon: 'Store', title: { fr: 'Produits et savoir-faire', en: 'Products and know-how' }, text: { fr: 'La mise en valeur de produits et de savoir-faire béninois.', en: 'Beninese products and know-how in the spotlight.' } },
  { icon: 'Music', title: { fr: 'Musique et culture', en: 'Music and culture' }, text: { fr: 'Une ambiance musicale et une décoration inspirées du Bénin.', en: 'Music and decor inspired by Benin.' } },
  { icon: 'Mic', title: { fr: 'Prises de parole', en: 'Talks' }, text: { fr: 'Des interventions pour mieux comprendre la culture béninoise.', en: 'Talks to better understand Beninese culture.' } },
  { icon: 'Users', title: { fr: 'Échanges et networking', en: 'Meeting and networking' }, text: { fr: 'Des espaces pour rencontrer, partager et créer des liens.', en: 'Spaces to meet, share and build connections.' } },
]

// Public invite
export const MZ_AUDIENCE = [
  { fr: 'La communauté béninoise du Maroc', en: 'The Beninese community in Morocco' },
  { fr: 'Le public marocain', en: 'The Moroccan public' },
  { fr: 'Étudiants et jeunes professionnels', en: 'Students and young professionals' },
  { fr: 'Entrepreneurs et associations', en: 'Entrepreneurs and associations' },
  { fr: 'Acteurs culturels et institutionnels', en: 'Cultural and institutional actors' },
  { fr: 'Les autres communautés africaines', en: 'Other African communities' },
  { fr: 'Les amoureux de la gastronomie', en: 'Food lovers' },
]

// Pourquoi MIAWÉZON (ambitions du projet)
export const MZ_WHY = [
  { icon: 'Compass', label: { fr: 'Découvrir le Bénin autrement', en: 'Discover Benin differently' }, text: { fr: 'Une immersion dans l\'univers culinaire béninois, même pour ceux qui connaissent peu le pays.', en: 'An immersion in Beninese cuisine, even for those who know little about the country.' } },
  { icon: 'HeartHandshake', label: { fr: 'Un pont entre le Bénin et le Maroc', en: 'A bridge between Benin and Morocco' }, text: { fr: 'Un espace de rencontre entre deux cultures, ouvert à tous les publics.', en: 'A meeting place between two cultures, open to everyone.' } },
  { icon: 'Globe', label: { fr: 'Le rayonnement du Bénin', en: 'Sharing Benin with the world' }, text: { fr: 'Montrer un Bénin vivant, créatif, accueillant et riche de son patrimoine.', en: 'Showing a lively, creative and welcoming Benin, rich in heritage.' } },
  { icon: 'Sparkles', label: { fr: 'Une expérience unique', en: 'A unique experience' }, text: { fr: 'Plus qu\'un buffet : la table devient le point de départ d\'une découverte.', en: 'More than a buffet: the table becomes the starting point of a discovery.' } },
]

// Wênam, a l'origine du projet
export const MZ_STORY = {
  text: {
    fr: 'MIAWÉZON est porté par Wênam, fondée le 18 mai 2024 par Ahouéfa Samuelle KAKPO pour faire connaître et aimer la cuisine béninoise à Rabat. Après plus de 150 plats servis, trois années de stand au Festi AECAM et des prestations traiteur pour des associations, Wênam franchit une nouvelle étape : créer son propre événement, entièrement pensé autour du Bénin.',
    en: 'MIAWÉZON is brought to you by Wênam, founded on 18 May 2024 by Ahouéfa Samuelle KAKPO to share Beninese cuisine in Rabat. After more than 150 dishes served, three years with a stand at Festi AECAM and catering for associations, Wênam is taking a new step: creating its own event, entirely devoted to Benin.',
  },
  facts: [
    { value: '2024', label: { fr: 'Création de Wênam', en: 'Wênam founded' } },
    { value: '150+', label: { fr: 'Plats réalisés', en: 'Dishes served' } },
    { value: '3', label: { fr: 'Éditions du Festi AECAM', en: 'Festi AECAM editions' } },
    { value: '2026', label: { fr: 'Traiteur du Triduum culturel ASEBEM', en: 'ASEBEM Cultural Triduum caterer' } },
  ],
  closing: {
    fr: 'Porter le Bénin au-delà des frontières, une table à la fois.',
    en: 'Taking Benin beyond its borders, one table at a time.',
  },
}

export const MZ_GALLERY = [
  { src: `${IMG}/galerie-1.jpg`, alt: { fr: 'Akassa, sauce et poisson', en: 'Akassa with sauce and fish' } },
  { src: `${IMG}/galerie-2.jpg`, alt: { fr: 'Poulet braisé', en: 'Grilled chicken' } },
  { src: `${IMG}/galerie-3.jpg`, alt: { fr: 'Beignets', en: 'Doughnuts' } },
  { src: `${IMG}/galerie-4.jpg`, alt: { fr: 'Riz gras', en: 'Jollof rice' } },
  { src: `${IMG}/galerie-5.jpg`, alt: { fr: 'Bissap et boissons maison', en: 'Hibiscus and homemade drinks' } },
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
