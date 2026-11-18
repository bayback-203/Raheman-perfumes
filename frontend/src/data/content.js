/** Static site content: navigation, footer, trust copy, FAQs and social. */

export const ANNOUNCEMENTS = [
  { id: 'shipping', text: 'Free shipping on orders over ₹999', icon: 'truck' },
  { id: 'authentic', text: '100% Authentic Originals', icon: 'shield' },
  { id: 'oils', text: '30%+ French Oil Strength', icon: 'sparkle' },
  { id: 'secure', text: 'Secure Encrypted Payment', icon: 'lock' },
]

export const MAIN_NAV = [
  { id: 'home', label: 'Home', to: '/' },
  {
    id: 'shop',
    label: 'Shop',
    to: '/shop',
    children: [
      { id: 'original', label: 'Original', description: 'Authentic branded perfumes', to: '/shop/originals' },
      { id: 'attars', label: 'Pure Attars', description: 'Alcohol-free pure oils', to: '/shop/attars' },
      { id: 'combos', label: 'Combos', description: 'Curated sets & pairings', to: '/combos' },
      { id: 'bakhoor', label: 'Bakhoor', description: 'Aromatic oud incense', to: '/shop/bakhoor' },
    ],
  },
  { id: 'offers', label: 'Offers', to: '/offers', accent: 'red' },
]

export const MOBILE_NAV = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'shop', label: 'Shop', to: '/shop' },
  { id: 'original', label: 'Original', to: '/shop/originals' },
  { id: 'attars', label: 'Pure Attars', to: '/shop/attars' },
  { id: 'combos', label: 'Combos', to: '/combos' },
  { id: 'bakhoor', label: 'Bakhoor', to: '/shop/bakhoor' },
  { id: 'offers', label: 'Offers', to: '/offers', accent: 'red' },
  { id: 'track', label: 'Track Order', to: '/track-order' },
  { id: 'wishlist', label: 'Wishlist', to: '/wishlist' },
  { id: 'account', label: 'My Account', to: '/account' },
]

export const FOOTER_COLUMNS = [
  {
    id: 'shop',
    title: 'Shop Collections',
    links: [
      { label: "Men's Perfumes", to: '/shop/men' },
      { label: "Women's Perfumes", to: '/shop/women' },
      { label: 'Unisex Signature', to: '/shop/unisex' },
      { label: 'Original Branded', to: '/shop/originals' },
      { label: 'Inspired Blends', to: '/shop/inspired' },
      { label: 'Pure Attars', to: '/shop/attars' },
      { label: 'Combo Sets', to: '/combos' },
      { label: 'Bakhoor', to: '/shop/bakhoor' },
    ],
  },
  {
    id: 'care',
    title: 'Customer Care',
    links: [
      { label: 'Track Order', to: '/track-order' },
      { label: 'Shipping Policy', to: '/pages/shipping-policy' },
      { label: 'No Return Policy', to: '/pages/return-refund' },
      { label: 'Fragrance FAQs', to: '/pages/faqs' },
      { label: 'Bottle Size Guide', to: '/pages/size-guide' },
      { label: 'Contact Us', to: '/pages/contact' },
    ],
  },
  {
    id: 'house',
    title: 'Our Shop',
    links: [
      { label: 'About Raheman Perfumes', to: '/pages/about' },
      { label: 'Our Perfume Makers', to: '/pages/perfumers' },
      { label: 'Perfume Guides', to: '/pages/journal' },
      { label: 'Privacy Policy', to: '/pages/privacy' },
      { label: 'Terms of Service', to: '/pages/terms' },
      { label: 'Offers & Deals', to: '/offers' },
    ],
  },
]

export const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', handle: '@rahemanperfumes', icon: 'instagram', href: 'https://instagram.com' },
  { id: 'whatsapp', label: 'WhatsApp', handle: 'Chat with a perfumer', icon: 'whatsapp', href: 'https://wa.me/919820112345' },
  { id: 'facebook', label: 'Facebook', handle: 'Raheman Perfumes', icon: 'facebook', href: 'https://facebook.com' },
]

export const PAYMENT_BADGES = ['UPI', 'VISA', 'Mastercard', 'RuPay', 'Net Banking', 'COD']

/**
 * The four homepage shopping pillars. `tier` drives the flacon tint.
 *
 * A pillar may carry a `photo` instead of a flacon: the picture becomes the
 * card's ground and the card drops both the ghosted bottle and the dot grid, so
 * the two ways of dressing a pillar card are never mixed on one card.
 */
export const PILLARS = [
  {
    id: 'perfumes',
    title: 'Perfumes',
    to: '/shop',
    photo: '/pillar-originals.jpg?v=3',
  },
  {
    id: 'attars',
    title: 'Attars',
    to: '/shop/attars',
    photo: '/pillar-attars.jpg?v=3',
  },
  {
    id: 'combos',
    title: 'Combos',
    to: '/combos',
    photo: '/pillar-combos.jpg?v=3',
  },
  {
    id: 'bakhoor',
    title: 'Bakhoor',
    to: '/shop/bakhoor',
    photo: '/pillar-bakhoor.jpg?v=2',
  },
]

export const WHY_SHOP = [
  {
    id: 'authentic',
    title: '100% Authentic',
    description: 'Original branded products guaranteed',
    icon: 'shield',
    image: '/promise-authentic.jpg',
  },
  {
    id: 'quality',
    title: 'Premium Quality',
    description: 'Long lasting fragrances with French oils',
    icon: 'sparkle',
    image: '/promise-quality.jpg',
  },
  {
    id: 'hand-blended',
    title: 'Hand-Blended Oils',
    description: 'Expertly crafted with pure oils to last longer',
    icon: 'award',
    image: '/promise-custom.jpg',
  },
  {
    id: 'secure',
    title: 'Safe & Secure Payment',
    description: 'Multiple payment options & UPI enabled',
    icon: 'lock',
    image: '/promise-payment.jpg',
  },
  {
    id: 'delivery',
    title: 'Fast & Reliable Delivery',
    description: 'Delivered across all pin codes in India',
    icon: 'truck',
    image: '/promise-delivery.jpg',
  },
  {
    id: 'tamper-proof',
    title: 'Tamper-Proof Packing',
    description: 'Sealed & heat-protected transit packaging',
    icon: 'shield',
    image: '/promise-authentic.jpg',
  },
]

export const INSTAGRAM_POSTS = [
  { id: 'ig-1', caption: '#UnboxingRaheman', handle: '@rahemanperfumes', likes: 1240 },
  { id: 'ig-2', caption: '#SignatureScent', handle: '@rahemanperfumes', likes: 892 },
  { id: 'ig-3', caption: '#FrenchOils', handle: '@rahemanperfumes', likes: 1567 },
  { id: 'ig-4', caption: '#ScentOfTheDay', handle: '@rahemanperfumes', likes: 2103 },
  { id: 'ig-5', caption: '#LuxuryBottle', handle: '@rahemanperfumes', likes: 1108 },
  { id: 'ig-6', caption: '#OudCollection', handle: '@rahemanperfumes', likes: 1732 },
]

/** Delivery methods offered at checkout. */
export const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Courier Delivery',
    description: 'Free safe delivery with bubble wrap packing.',
    carrier: 'Delhivery / Bluedart Surface',
    price: 0,
    eta: '4–6 working days',
    tag: 'FREE',
  },
  {
    id: 'express',
    name: 'Fast Air Delivery',
    description: 'Fast 1–2 day air delivery with extra safe packing.',
    carrier: 'Bluedart Apex Express',
    price: 99,
    eta: '1–2 working days',
    tag: 'Priority',
  },
]

/** Payment methods offered at checkout. */
export const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Online Payment (Razorpay)', note: 'UPI / Cards / Net Banking / Wallets', badge: 'Instant', fee: 0 },
  { id: 'cod', label: 'Cash on Delivery', note: 'Pay at doorstep', badge: '₹49 handling', fee: 49 },
]

/** Homepage FAQ teasers. */
export const HOME_FAQ = [
  {
    id: 'authentic',
    question: 'How do I know the original perfumes are genuine?',
    answer:
      'We buy directly from official distributors \u2014 never from resellers \u2014 and each order ships with a Raheman Perfumes authenticity seal.',
  },
  {
    id: 'inspired',
    question: 'What exactly is an "inspired" fragrance?',
    answer:
      'An inspired fragrance is our perfumers\u2019 own version of a famous scent, made from pure French oils at 30%+ strength. It is not a copy or a refill of the original \u2014 it is a new blend that smells very close to the one you already love, at a much lower price.',
  },
  {
    id: 'longevity',
    question: 'How long do the fragrances last?',
    answer:
      'Our inspired and mixing perfumes are blended at 30%+ oil and last 10–12 hours on skin, longer on clothes. Original branded perfumes last as long as the brand says — we list the details on each product page.',
  },
  {
    id: 'shipping',
    question: 'Do you deliver across India?',
    answer:
      'Yes \u2014 we deliver to every working pin code in India. Free shipping above \u20b9999, and express delivery at checkout. Perfumes travel safely in sealed bubble packaging by road or air.',
  },
  {
    id: 'return-policy',
    question: 'What is your return and exchange policy?',
    answer:
      'All sales are strictly final. We follow a firm No Return, No Exchange, and No Replacement Policy once an order is packed or delivered.',
  },
]

export const NEWSLETTER = {
  title: 'Join Our Email List',
  description:
    'Get early access to new perfumes, exclusive offers, and fragrance notes from our team.',
  placeholder: 'Enter your email address',
  cta: 'Subscribe',
}

export const HOUSE_BLURB =
  'Hand-blending fine perfumes from rare oils and traditional Indian methods.'

export const COPYRIGHT = '© 2026 RAHEMAN PERFUMES. All rights reserved. Registered trademark.'
export const TAGLINE = 'Hand-blended with \u2665 for perfume lovers across India.'

export default MAIN_NAV
