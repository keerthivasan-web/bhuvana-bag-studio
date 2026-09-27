import { Product, LookbookPairing } from '../types';

export const PRODUCTS: Product[] = [
  // CURVED ELEPHANT BAGS
  {
    id: 'elephant-cognac',
    name: 'Curved Elephant Top-Handle Bag',
    categoryTag: 'SCULPTURAL ELEPHANT',
    category: 'elephant-bags',
    subtitle: 'Cognac tan leather, brass trunk zip & structured top handle',
    price: 2490,
    originalPrice: 3490,
    discountBadge: '28% off',
    microBadge: 'Weekend Favourite',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    description: 'An architectural curved silhouette inspired by origami geometry. Hand-stitched with signature trunk zipper contour and luxury gold-tone brass accents.',
    details: ['Artisan grain pebble finish', 'Fits large smartphones & daily essentials', 'Includes detachable crossbody strap'],
    availability: true,
    tags: ['elephant', 'curved', 'cognac', 'tan', 'sculptural', 'handbag', 'top handle']
  },
  {
    id: 'elephant-mini-caramel',
    name: 'Mini Curved Elephant Bag',
    categoryTag: 'SCULPTURAL MINI',
    category: 'elephant-bags',
    subtitle: 'Caramel matte leather edition with playful elephant key charm',
    price: 2250,
    originalPrice: 2990,
    discountBadge: '25% off',
    microBadge: 'Limited Pieces',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    description: 'Compact proportion of our signature curved elephant silhouette. Sits comfortably in palm or on shoulder for weekend gallery visits.',
    details: ['Signature curved elephant silhouette', 'Includes leather bag charm', 'Gold hardware accents'],
    availability: true,
    tags: ['elephant', 'mini', 'caramel', 'crossbody', 'curved']
  },
  {
    id: 'elephant-noir-black',
    name: 'Noir Black Curved Elephant Bag',
    categoryTag: 'SCULPTURAL ELEPHANT',
    category: 'elephant-bags',
    subtitle: 'Jet black pebble grain leather with polished antique gold hardware',
    price: 2590,
    originalPrice: 3590,
    discountBadge: '28% off',
    microBadge: 'Pop-up Edit',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    description: 'Sleek jet black rendering of the curved elephant handbag. Statement architectural lines that instantly elevate daily outfits and evening wear.',
    details: ['Water-resistant treated pebble leather', 'Dual top handles + shoulder strap', 'Reinforced base studs'],
    availability: true,
    tags: ['elephant', 'black', 'noir', 'curved', 'handbag', 'top handle']
  },

  // KOREAN MOBILE POUCHES
  {
    id: 'korean-pouch-sage',
    name: 'Quilted Korean Mobile Pouch',
    categoryTag: 'KOREAN MOBILE EDIT',
    category: 'korean-pouches',
    subtitle: 'Soft sage green, dainty gold chain & dual card slots',
    price: 790,
    originalPrice: 1190,
    discountBadge: '33% off',
    microBadge: 'Picked This Week',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=800&auto=format&fit=crop',
    description: 'Effortless hands-free everyday companion. Fits iPhone Pro Max and Samsung Ultra series with dedicated outer card pockets.',
    details: ['High-density quilted padding', 'Weightless 140g feel', 'Magnetic snap closure'],
    availability: true,
    tags: ['korean', 'pouch', 'mobile', 'sage', 'green', 'quilted', 'crossbody']
  },
  {
    id: 'korean-pearl-pouch',
    name: 'Korean Micro Pouch with Pearl Handle',
    categoryTag: 'KOREAN MICRO',
    category: 'korean-pouches',
    subtitle: 'Dual compartment blush pink pouch with pearl loop & chain',
    price: 850,
    originalPrice: 1250,
    discountBadge: '32% off',
    microBadge: 'Party Edit',
    image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    description: 'Playful yet delicate micro pouch crafted with miniature faux-pearl hand strap and slim crossbody chain. Perfect for festive evenings.',
    details: ['Dual zipper compartments', 'Detachable pearl wrist strap', 'Satin lining interior'],
    availability: true,
    tags: ['korean', 'pearl', 'pouch', 'blush', 'pink', 'micro']
  },
  {
    id: 'korean-pouch-tan',
    name: 'Korean Leather Phone & Card Crossbody',
    categoryTag: 'KOREAN MOBILE EDIT',
    category: 'korean-pouches',
    subtitle: 'Warm tan minimalist pouch with rear passport pocket',
    price: 890,
    originalPrice: 1290,
    discountBadge: '31% off',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    description: 'Minimalist Korean leather pouch designed for light travel, coffee runs, and weekend errands.',
    details: ['Slim 2cm profile', 'Rear quick-access card slots', 'Adjustable leather strap'],
    availability: true,
    tags: ['korean', 'pouch', 'tan', 'mobile', 'cardholder']
  },

  // TOTE BAGS (ALDO & STUDIO TOTES)
  {
    id: 'aldo-inspired-structured-tote',
    name: 'ALDO-Style Structured Monogram Tote',
    categoryTag: 'ALDO TOTE EDIT',
    category: 'totes',
    subtitle: 'Signature dual-tone monogram tote with gold hardware scarf charm',
    price: 2690,
    originalPrice: 3690,
    discountBadge: '27% off',
    microBadge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    description: 'ALDO-inspired structured office & weekend tote bag featuring dual top handles, detachable shoulder strap, and printed silk scarf accent.',
    details: ['Fits up to 14" laptop & iPad', 'Triple compartment interior', 'Protective metal base feet'],
    availability: true,
    tags: ['aldo', 'tote', 'monogram', 'structured', 'work', 'office', 'laptop']
  },
  {
    id: 'structured-canvas-tote',
    name: 'Structured Canvas & Leather Studio Tote',
    categoryTag: 'STUDIO TOTE',
    category: 'totes',
    subtitle: 'Two-tone ivory & warm tan trim, laptop friendly everyday tote',
    price: 2190,
    originalPrice: 2890,
    discountBadge: '24% off',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    description: 'Clean architectural proportions tailored for work desks and relaxed weekend cafe tables alike. Reinforced base prevents sagging.',
    details: ['Heavyweight woven cotton canvas', 'Fits up to 14" laptop', 'Interior slip and zip compartments'],
    availability: true,
    tags: ['tote', 'canvas', 'leather', 'tan', 'laptop', 'studio']
  },
  {
    id: 'aldo-nude-chain-tote',
    name: 'ALDO-Style Quilted Chain Tote Bag',
    categoryTag: 'ALDO TOTE EDIT',
    category: 'totes',
    subtitle: 'Nude beige quilted tote with interwoven gold chain handles',
    price: 2790,
    originalPrice: 3890,
    discountBadge: '28% off',
    microBadge: 'Boutique Exclusive',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    description: 'Spacious quilted tote inspired by ALDO luxury silhouettes. Gold chain shoulder straps provide a sophisticated aesthetic.',
    details: ['High-density chevron quilting', 'Central zipped partition', 'Fits tablets, makeup pouches & water bottle'],
    availability: true,
    tags: ['aldo', 'tote', 'quilted', 'chain', 'nude', 'beige']
  },

  // SLING BAGS
  {
    id: 'sienna-bucket-sling',
    name: 'Sienna Handcrafted Bucket Sling',
    categoryTag: 'BUCKET SLING',
    category: 'slings',
    subtitle: 'Warm tan artisan pebble leather with cinch strap',
    price: 1450,
    originalPrice: 2100,
    discountBadge: '30% off',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=800&auto=format&fit=crop',
    description: 'A relaxed everyday companion with rounded structured base and generous volume. Slips easily across outfits, linens, and dresses.',
    details: ['Soft pebble grain vegan leather', 'Brass hardware eyelets', 'Secure drawstring cinch closure'],
    availability: true,
    tags: ['sling', 'bucket', 'tan', 'crossbody', 'casual']
  },
  {
    id: 'box-crossbody-sling',
    name: 'Structured Box Sling Bag',
    categoryTag: 'BOX SLING',
    category: 'slings',
    subtitle: 'Minimalist olive green box bag with gold turn-lock clasp',
    price: 1390,
    originalPrice: 1890,
    discountBadge: '26% off',
    microBadge: 'New In',
    image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    description: 'Crisp geometric box sling bag with turn-lock lock and dual strap options (thick webbing strap + slim leather strap).',
    details: ['Includes 2 interchangeable straps', 'Scratch-resistant texture', 'Fits large phone & wallet'],
    availability: true,
    tags: ['sling', 'box', 'olive', 'green', 'crossbody']
  },

  // MOON BAGS
  {
    id: 'crescent-moon-wine',
    name: 'Crescent Moon Shoulder Bag',
    categoryTag: 'MOON BAG',
    category: 'moon-bags',
    subtitle: 'Deep wine burgundy smooth calf leather with buckle strap',
    price: 1850,
    originalPrice: 2490,
    discountBadge: '25% off',
    microBadge: 'New In',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    description: 'An ergonomic curved silhouette designed to tuck closely under the arm. Rich wine undertone adds subtle warmth to any neutral ensemble.',
    details: ['Smooth semi-matte calf finish', 'Adjustable 3-tier shoulder drop', 'Smooth glide antique zipper'],
    availability: true,
    tags: ['moon', 'crescent', 'wine', 'burgundy', 'shoulder bag']
  },
  {
    id: 'crescent-moon-cream',
    name: 'Minimalist Ivory Moon Bag',
    categoryTag: 'MOON BAG',
    category: 'moon-bags',
    subtitle: 'Creamy ivory hobo moon bag with rounded wide strap',
    price: 1790,
    originalPrice: 2390,
    discountBadge: '25% off',
    microBadge: 'Trending',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    secondImage: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop',
    description: 'Clean curved moon silhouette in supple ivory leather. Designed to sit comfortably underarm for an effortless minimalist aesthetic.',
    details: ['Soft supple leather feel', 'Interior zipped security pocket', 'Lightweight 260g construction'],
    availability: true,
    tags: ['moon', 'ivory', 'cream', 'crescent', 'shoulder bag']
  }
];

export const LOOKBOOK_PAIRINGS: LookbookPairing[] = [
  {
    id: 'pairing-01',
    title: 'Minimalist City Commute',
    tagline: 'Quilted Korean Mobile Pouch paired with Dainty Chain & Card Sleeve.',
    totalPrice: 1590,
    label: '01 · Micro Utility',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop',
    items: [
      'Quilted Korean Mobile Pouch in Sage (₹790)',
      'Gold Dainty Crossbody Chain (₹350)',
      'Matching Leather Card Sleeve (₹450)'
    ]
  },
  {
    id: 'pairing-02',
    title: 'Sculptural Statement Edit',
    tagline: 'Cognac Curved Elephant Bag paired with Solid Brass Leather Charm.',
    totalPrice: 3190,
    label: '02 · Architectural',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    items: [
      'Curved Elephant Top-Handle Bag (₹2,490)',
      'Solid Brass Elephant Bag Charm (₹350)',
      'Cotton Studio Dust Bag & Leather Care (₹350)'
    ]
  },
  {
    id: 'pairing-03',
    title: 'Workday to Weekend Bundle',
    tagline: 'Spacious ALDO-inspired Tote paired with Crescent Moon Shoulder Bag.',
    totalPrice: 4340,
    label: '03 · Commuter Duo',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    items: [
      'ALDO-Style Structured Monogram Tote (₹2,690)',
      'Crescent Moon Wine Shoulder Bag (₹1,850)',
      'Bundle Savings: Flat ₹200 OFF applied'
    ]
  }
];

export const POPUP_INFO = {
  name: 'Bhuvana · The Bag Studio',
  city: 'Anna Nagar, Chennai',
  landmark: 'Opp. LKS Jewellery, 2nd Avenue',
  days: 'Every Friday, Saturday & Sunday',
  timing: '5:00 PM – 11:00 PM IST',
  phone: '+91 9585318015',
  whatsappNumber: '919585318015',
  shippingPolicy: 'Pan-India shipping dispatched across India (Courier ₹70 · Free over ₹2,499)',
  paymentPolicy: '100% Online Payment (UPI, GPay, PhonePe, Cards) · Strictly No COD ❌'
};
