import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS, LOOKBOOK_PAIRINGS, POPUP_INFO } from './data/products';
import { Product, CartItem, ProductCategory } from './types';

export default function App() {
  // Navigation / Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low' | 'newest'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bhuvana_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { product: PRODUCTS[0], quantity: 1 },
      { product: PRODUCTS[3], quantity: 1 },
      { product: PRODUCTS[6], quantity: 1 },
    ];
  });

  // Wishlist State (Persisted in localStorage)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bhuvana_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['elephant-cognac', 'korean-pouch-sage', 'crescent-moon-wine'];
  });

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bhuvana_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bhuvana_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle Wishlist
  const toggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to wishlist`);
        return [...prev, product.id];
      }
    });
  };

  // Add to Cart
  const addToCart = (product: Product, qty: number = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    showToast(`Added ${qty} × "${product.name}" to your bag`);
    setIsCartOpen(true);
  };

  // Update Cart Quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Your shopping bag has been cleared');
  };

  // Cart Metrics
  const cartItemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );
  const isFreeDelivery = cartSubtotal >= 2499;
  const shippingFee = cartSubtotal === 0 ? 0 : isFreeDelivery ? 0 : 70;
  const cartGrandTotal = cartSubtotal + shippingFee;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.categoryTag.toLowerCase().includes(query) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'low-to-high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result = [...result].reverse();
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Wishlisted Products list
  const wishlistedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => wishlist.includes(p.id));
  }, [wishlist]);

  // Generate WhatsApp links
  const createWhatsAppProductUrl = (product: Product) => {
    const text = encodeURIComponent(
      `Hi! I'm interested in ${product.name} (₹${product.price.toLocaleString('en-IN')}). Could you please share the details?`
    );
    return `https://wa.me/${POPUP_INFO.whatsappNumber}?text=${text}`;
  };

  const createWhatsAppCartUrl = () => {
    if (cart.length === 0) {
      return `https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
        "Hi Bhuvana! I'd like to ask about your women's handbag collection."
      )}`;
    }

    const lines = cart.map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} × ${item.quantity} - ₹${(
          item.product.price * item.quantity
        ).toLocaleString('en-IN')}`
    );
    const text = encodeURIComponent(
      `Hi! I'd like to order the following items:\n\n${lines.join(
        '\n'
      )}\n\nSubtotal: ₹${cartSubtotal.toLocaleString(
        'en-IN'
      )}\nShipping: ${isFreeDelivery ? 'Free 🇮🇳' : `₹${shippingFee}`}\nTotal: ₹${cartGrandTotal.toLocaleString(
        'en-IN'
      )}\n\nPlease share the payment details.`
    );
    return `https://wa.me/${POPUP_INFO.whatsappNumber}?text=${text}`;
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setDetailQuantity(1);
  };

  // Category copy map
  const categoryHeaders: Record<string, { title: string; subtitle: string }> = {
    'elephant-bags': {
      title: 'CURVED ELEPHANT BAGS',
      subtitle: 'Architectural curved elephant silhouettes with brass trunk zip & top handle.',
    },
    'korean-pouches': {
      title: 'KOREAN MOBILE POUCHES',
      subtitle: 'Hands-free quilted mobile pouches with dainty gold chains & dual card slots.',
    },
    totes: {
      title: 'ALDO & STUDIO TOTES',
      subtitle: 'Spacious ALDO-inspired structured monogram totes & canvas work bags.',
    },
    slings: {
      title: 'SLING & CROSSBODY BAGS',
      subtitle: 'Relaxed bucket slings & geometric box crossbody companions.',
    },
    'moon-bags': {
      title: 'CRESCENT MOON BAGS',
      subtitle: 'Ergonomic curved underarm moon shoulder bags in deep wine & ivory.',
    },
    all: {
      title: 'THE BAG STUDIO COLLECTION',
      subtitle: 'Curated sculptural elephant bags, Korean mobile pouches, ALDO totes & moon bags.',
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#221B1C] font-sans antialiased selection:bg-[#EEDBC5] selection:text-[#370816]">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-[#370816] text-[#FAF7F2] px-5 py-3 rounded shadow-xl text-xs uppercase tracking-wider font-medium flex items-center gap-3 animate-fade-in border border-[#C49A45]/30">
          <span className="material-symbols-outlined text-[18px] text-[#C49A45]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="w-full bg-[#370816] text-[#FAF7F2] overflow-hidden py-2 sm:py-2.5 border-b border-[#C49A45]/20">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <div className="flex items-center space-x-6 sm:space-x-10 px-3 sm:px-4 text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.2em] font-medium text-[#FAF7F2]/90">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49A45] animate-pulse"></span>
              Bhuvana Bag Studio · Weekend Pop · Fri–Sun · 5 PM – 11 PM · Anna Nagar (Opp. LKS Jewellery)
            </span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Pan India Shipping 🇮🇳 · Online Payment Only · Strictly No COD ❌</span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Direct WhatsApp: +91 9585318015</span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Curved Elephant Bags · Korean Mobile Pouches · ALDO Totes · Moon Bags</span>
            <span className="text-[#C49A45]/50">✦</span>
          </div>
          <div aria-hidden="true" className="flex items-center space-x-6 sm:space-x-10 px-3 sm:px-4 text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.2em] font-medium text-[#FAF7F2]/90">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C49A45] animate-pulse"></span>
              Bhuvana Bag Studio · Weekend Pop · Fri–Sun · 5 PM – 11 PM · Anna Nagar (Opp. LKS Jewellery)
            </span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Pan India Shipping 🇮🇳 · Online Payment Only · Strictly No COD ❌</span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Direct WhatsApp: +91 9585318015</span>
            <span className="text-[#C49A45]/50">✦</span>
            <span>Curved Elephant Bags · Korean Mobile Pouches · ALDO Totes · Moon Bags</span>
            <span className="text-[#C49A45]/50">✦</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#370816]/10 transition-all duration-300">
        <div className="max-w-[1360px] mx-auto px-3.5 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Wordmark */}
          <a
            href="#home"
            onClick={() => {
              setSelectedCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-3 group shrink-0"
          >
            <img
              src="/title-logo.png"
              alt="Bhuvana Budget Collection"
              className="h-8 sm:h-12 w-auto object-contain max-w-[145px] sm:max-w-[210px]"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[12px] font-sans font-medium uppercase tracking-[0.14em] text-[#5E5254]">
            <a
              href="#home"
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'all' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              Home
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('all')}
              className="hover:text-[#370816] transition-colors relative py-1"
            >
              New Arrivals
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('elephant-bags')}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'elephant-bags' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              Elephant Bags
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('korean-pouches')}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'korean-pouches' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              Korean Pouches
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('totes')}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'totes' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              ALDO &amp; Totes
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('slings')}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'slings' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              Slings
            </a>
            <a
              href="#collection"
              onClick={() => setSelectedCategory('moon-bags')}
              className={`hover:text-[#370816] transition-colors relative py-1 ${
                selectedCategory === 'moon-bags' ? 'text-[#370816] font-semibold border-b-2 border-[#C49A45]' : ''
              }`}
            >
              Moon Bags
            </a>
            <a
              href="#weekend-pop"
              className="text-[#370816] hover:text-[#8B6D31] transition-colors relative py-1"
            >
              Weekend Pop
            </a>
            <a
              href="#about"
              className="hover:text-[#370816] transition-colors relative py-1"
            >
              About
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Collection"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#5E5254] hover:text-[#370816] hover:bg-[#F4EEE5] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[21px]">search</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              aria-label="Wishlist"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#5E5254] hover:text-[#370816] hover:bg-[#F4EEE5] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[21px]">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D81B60] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded bg-[#F4EEE5] hover:bg-[#EEDBC5] active:scale-95 text-[#370816] transition-all border border-[#370816]/10"
            >
              <span className="material-symbols-outlined text-[19px]">shopping_bag</span>
              <span className="text-xs uppercase tracking-wider font-medium hidden sm:inline">Bag</span>
              <span className="w-5 h-5 rounded-full bg-[#370816] text-[#FAF7F2] text-[11px] font-semibold flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation"
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#5E5254] hover:text-[#370816] hover:bg-[#F4EEE5] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileNavOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Modal */}
        {isMobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-[#26050e]/60 backdrop-blur-sm flex animate-fade-in">
            <div className="w-[85%] max-w-xs bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-up border-r border-[#370816]/15">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#370816]/10">
                  <img src="/title-logo.png" alt="Bhuvana Budget Collection" className="h-8 w-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-label="Close menu"
                    className="w-8 h-8 rounded-full bg-[#F4EEE5] text-[#370816] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B6D31] font-semibold pt-1">
                  Explore Silhouettes
                </div>

                <nav className="flex flex-col space-y-1">
                  <a
                    href="#home"
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsMobileNavOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-semibold text-[#370816] bg-[#F4EEE5]/70"
                  >
                    <span>All Handbags</span>
                    <span className="text-[11px] text-[#8B6D31] font-medium">{PRODUCTS.length}</span>
                  </a>
                  <a
                    href="#collection"
                    onClick={() => {
                      setSelectedCategory('elephant-bags');
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:bg-[#F4EEE5] hover:text-[#370816]"
                  >
                    <span>Elephant Bags</span>
                    <span className="text-[10px] text-[#8B6D31]">Sculptural</span>
                  </a>
                  <a
                    href="#collection"
                    onClick={() => {
                      setSelectedCategory('korean-pouches');
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:bg-[#F4EEE5] hover:text-[#370816]"
                  >
                    <span>Korean Pouches</span>
                    <span className="text-[10px] text-[#8B6D31]">Hands-Free</span>
                  </a>
                  <a
                    href="#collection"
                    onClick={() => {
                      setSelectedCategory('totes');
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:bg-[#F4EEE5] hover:text-[#370816]"
                  >
                    <span>ALDO &amp; Totes</span>
                    <span className="text-[10px] text-[#8B6D31]">Work &amp; Travel</span>
                  </a>
                  <a
                    href="#collection"
                    onClick={() => {
                      setSelectedCategory('slings');
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:bg-[#F4EEE5] hover:text-[#370816]"
                  >
                    <span>Sling Bags</span>
                    <span className="text-[10px] text-[#8B6D31]">Crossbody</span>
                  </a>
                  <a
                    href="#collection"
                    onClick={() => {
                      setSelectedCategory('moon-bags');
                      setIsMobileNavOpen(false);
                    }}
                    className="flex items-center justify-between py-2.5 px-3 rounded text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:bg-[#F4EEE5] hover:text-[#370816]"
                  >
                    <span>Moon Bags</span>
                    <span className="text-[10px] text-[#8B6D31]">Underarm</span>
                  </a>
                </nav>

                <div className="pt-2 border-t border-[#370816]/10 space-y-1">
                  <a
                    href="#weekend-pop"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 px-3 text-xs uppercase tracking-wider font-semibold text-[#8B6D31]"
                  >
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>Weekend Pop (Anna Nagar)</span>
                  </a>
                  <a
                    href="#lookbook"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:text-[#370816]"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Lookbook Bundles</span>
                  </a>
                  <a
                    href="#about"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 text-xs uppercase tracking-wider font-medium text-[#5E5254] hover:text-[#370816]"
                  >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>About Studio</span>
                  </a>
                </div>
              </div>

              {/* Drawer Bottom Quick Action */}
              <div className="p-4 bg-[#F4EEE5] border-t border-[#370816]/10 space-y-2 pb-safe">
                <a
                  href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
                    "Hi Bhuvana! I'm browsing from my mobile and would love to ask about your handbags."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#370816] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#C49A45]">chat</span>
                  <span>WhatsApp +91 9585318015</span>
                </a>
                <p className="text-[10px] text-center text-[#5E5254]">
                  Anna Nagar Pop-up · Fri–Sun · 5–11 PM
                </p>
              </div>
            </div>
            {/* Click backdrop to close */}
            <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
          </div>
        )}
      </header>

      <main id="home">
        {/* HERO SECTION */}
        <section className="relative w-full pt-8 sm:pt-16 lg:pt-20 pb-12 sm:pb-24 lg:pb-32 overflow-hidden bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
            {/* Location & Policies Kicker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-6 sm:mb-12 pb-4 border-b border-[#370816]/10">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#8B6D31] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#C49A45] animate-ping shrink-0"></span>
                <span>📍 Anna Nagar · Opp. LKS Jewellery · Fri–Sun, 5 PM – 11 PM</span>
              </div>
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-[#5E5254] tracking-wide">
                <span>🇮🇳 Ships across India</span>
                <span className="text-[#370816]/20">•</span>
                <span>💳 Online payment only</span>
                <span className="text-[#370816]/20">•</span>
                <span>❌ No COD</span>
              </div>
            </div>

            {/* Asymmetric Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-8">
                <div className="space-y-3.5 sm:space-y-6">
                  {/* Eyebrow */}
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8B6D31] font-semibold flex items-center gap-2">
                    <span>WEEKEND POP · ANNA NAGAR</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-serif text-[32px] sm:text-[50px] md:text-[62px] text-[#370816] font-normal leading-[1.08] sm:leading-[1.06] tracking-tight">
                    Little things.<br />
                    <span className="italic font-normal font-editorial text-[#8B6D31]">Beautifully</span> chosen.
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-lg text-[#5E5254] leading-relaxed max-w-lg font-light">
                    Sarees, jewellery &amp; bags picked for your everyday celebrations. Curved elephant bags, Korean mobile pouches, ALDO totes, sling bags and moon bags.
                  </p>
                </div>

                {/* Buttons & WhatsApp CTA */}
                <div className="space-y-4 sm:space-y-5 pt-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href="#collection"
                      onClick={() => setSelectedCategory('all')}
                      className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-[#370816] hover:bg-[#26050e] active:scale-[0.99] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] font-semibold rounded-sm text-center transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
                    >
                      <span>SHOP COLLECTION</span>
                      <span className="material-symbols-outlined text-[17px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </a>
                    <a
                      href="#weekend-pop"
                      className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-transparent hover:bg-[#F4EEE5] active:scale-[0.99] text-[#370816] border border-[#370816]/30 hover:border-[#370816] text-xs uppercase tracking-[0.18em] font-semibold rounded-sm text-center transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#8B6D31]">location_on</span>
                      <span>VISIT WEEKEND POP</span>
                    </a>
                  </div>

                  {/* WhatsApp Prompt */}
                  <a
                    href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
                      "Hi! I'm browsing the Bhuvana Bag Studio website and would love to ask about your handbags."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-xs text-[#5E5254] hover:text-[#370816] transition-colors py-1"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#EEDBC5] flex items-center justify-center text-[#370816] group-hover:scale-110 transition-transform shrink-0">
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                    </span>
                    <span className="font-medium text-[11px] sm:text-xs">Direct WhatsApp order &amp; inquiry: +91 9585318015 →</span>
                  </a>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-sm overflow-hidden shadow-[0_20px_50px_-20px_rgba(55,8,22,0.22)] aspect-[4/3] sm:aspect-[14/11] group bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop"
                    alt="Bhuvana Bag Studio Handbags"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#26050e]/85 via-transparent to-transparent"></div>

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-5 rounded-sm bg-[#FAF7F2]/95 backdrop-blur-md border border-[#370816]/10 flex items-end justify-between gap-3">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#8B6D31] font-semibold block mb-0.5">
                        Anna Nagar Showcase
                      </span>
                      <h2 className="font-serif text-base sm:text-xl text-[#370816] font-medium leading-tight">
                        Curated Women&apos;s Handbags
                      </h2>
                      <p className="text-[11px] sm:text-xs text-[#5E5254] mt-0.5 hidden sm:block">
                        Curved Elephant Bags, Korean Mobile Pouches &amp; ALDO Totes
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8B6D31] block">Pan-India Courier</span>
                      <span className="text-sm sm:text-lg font-medium text-[#370816]">From ₹790</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROMISE / HIGHLIGHTS STRIP */}
        <section className="w-full bg-[#F4EEE5] py-6 sm:py-8 border-y border-[#370816]/10">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#8B6D31] shrink-0 mt-0.5 sm:mt-0">local_shipping</span>
              <div>
                <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-semibold text-[#370816]">Pan-India Shipping</h3>
                <p className="text-[10px] sm:text-xs text-[#5E5254] mt-0.5">Dispatched across India · Free over ₹2,499</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#8B6D31] shrink-0 mt-0.5 sm:mt-0">credit_card</span>
              <div>
                <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-semibold text-[#370816]">Online Payment Only</h3>
                <p className="text-[10px] sm:text-xs text-[#5E5254] mt-0.5">UPI, GPay, Cards · No COD ❌</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#8B6D31] shrink-0 mt-0.5 sm:mt-0">storefront</span>
              <div>
                <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-semibold text-[#370816]">Weekend Pop-Up</h3>
                <p className="text-[10px] sm:text-xs text-[#5E5254] mt-0.5">Anna Nagar · Fri–Sun · 5 PM – 11 PM</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-[#D81B60] shrink-0 mt-0.5 sm:mt-0">chat</span>
              <div>
                <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-semibold text-[#370816]">WhatsApp Ordering</h3>
                <p className="text-[10px] sm:text-xs text-[#5E5254] mt-0.5">+91 9585318015 for fast chat</p>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY DISCOVERY SECTION */}
        <section className="w-full py-12 sm:py-24 bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8B6D31] font-semibold block">
                  EXPLORE THE STUDIO
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-[46px] text-[#370816] font-normal leading-tight">
                  Handbag Silhouettes
                </h2>
              </div>
              <p className="text-xs sm:text-base text-[#5E5254] max-w-md font-light leading-relaxed">
                Take a look around. Five specialized handbag categories picked for everyday errands, hands-free city strolls, and statement evenings.
              </p>
            </div>

            {/* Category Cards Grid - 2 columns on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
              {/* Category 1: Elephant Bags */}
              <div
                onClick={() => {
                  setSelectedCategory('elephant-bags');
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop"
                    alt="Curved Elephant Bags"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#370816] bg-[#FAF7F2]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm font-semibold">
                    01 · Sculptural
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="font-serif text-sm sm:text-lg text-[#370816] font-medium">Elephant Bags</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#5E5254] leading-relaxed line-clamp-1">
                    Curved trunk zip &amp; top handles.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8B6D31]">From ₹2,250</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-[#370816] group-hover:text-[#8B6D31]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 2: Korean Pouches */}
              <div
                onClick={() => {
                  setSelectedCategory('korean-pouches');
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600&auto=format&fit=crop"
                    alt="Korean Mobile Pouches"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#370816] bg-[#FAF7F2]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm font-semibold">
                    02 · Hands-Free
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="font-serif text-sm sm:text-lg text-[#370816] font-medium">Korean Pouches</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#5E5254] leading-relaxed line-clamp-1">
                    Quilted &amp; dainty gold chains.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8B6D31]">From ₹790</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-[#370816] group-hover:text-[#8B6D31]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 3: ALDO & Totes */}
              <div
                onClick={() => {
                  setSelectedCategory('totes');
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop"
                    alt="ALDO and Studio Totes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#370816] bg-[#FAF7F2]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm font-semibold">
                    03 · Work &amp; Travel
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="font-serif text-sm sm:text-lg text-[#370816] font-medium">ALDO &amp; Totes</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#5E5254] leading-relaxed line-clamp-1">
                    Monogram &amp; canvas totes.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8B6D31]">From ₹2,190</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-[#370816] group-hover:text-[#8B6D31]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 4: Sling Bags */}
              <div
                onClick={() => {
                  setSelectedCategory('slings');
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=600&auto=format&fit=crop"
                    alt="Sling Bags"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#370816] bg-[#FAF7F2]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm font-semibold">
                    04 · Crossbody
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="font-serif text-sm sm:text-lg text-[#370816] font-medium">Sling Bags</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#5E5254] leading-relaxed line-clamp-1">
                    Bucket slings &amp; box bags.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8B6D31]">From ₹1,390</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-[#370816] group-hover:text-[#8B6D31]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 5: Moon Bags */}
              <div
                onClick={() => {
                  setSelectedCategory('moon-bags');
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-lg transition-all col-span-2 sm:col-span-1"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                  <img
                    src="https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop"
                    alt="Moon Bags"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#370816] bg-[#FAF7F2]/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm font-semibold">
                    05 · Crescent
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="font-serif text-sm sm:text-lg text-[#370816] font-medium">Moon Bags</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#5E5254] leading-relaxed line-clamp-1">
                    Underarm crescent silhouettes.
                  </p>
                  <div className="pt-1.5 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8B6D31]">From ₹1,790</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-[#370816] group-hover:text-[#8B6D31]">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WEEKEND POP SECTION */}
        <section id="weekend-pop" className="w-full py-12 sm:py-24 bg-[#F4EEE5] border-y border-[#370816]/10">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Details Block */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#370816] text-[#FAF7F2] text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold rounded-sm">
                  <span>BOUTIQUE POP-UP</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl lg:text-[48px] text-[#370816] font-normal leading-tight">
                  MEET US THIS WEEKEND
                </h2>

                <p className="text-sm sm:text-base text-[#5E5254] font-light leading-relaxed max-w-xl">
                  &ldquo;Come browse, try something, and find your favourite.&rdquo;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 pt-1 sm:pt-2">
                  <div className="p-4 sm:p-5 bg-[#FAF7F2] rounded border border-[#370816]/10 flex items-start gap-3 sm:gap-4">
                    <span className="material-symbols-outlined text-[22px] sm:text-[24px] text-[#8B6D31] shrink-0 mt-0.5">
                      location_on
                    </span>
                    <div>
                      <h4 className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#370816]">Location</h4>
                      <p className="text-xs sm:text-sm font-medium text-[#221B1C] mt-0.5 sm:mt-1">📍 Anna Nagar</p>
                      <p className="text-[11px] sm:text-xs text-[#5E5254]">Opp. LKS Jewellery, 2nd Avenue, Chennai</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#FAF7F2] rounded border border-[#370816]/10 flex items-start gap-3 sm:gap-4">
                    <span className="material-symbols-outlined text-[22px] sm:text-[24px] text-[#8B6D31] shrink-0 mt-0.5">
                      schedule
                    </span>
                    <div>
                      <h4 className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#370816]">Timings</h4>
                      <p className="text-xs sm:text-sm font-medium text-[#221B1C] mt-0.5 sm:mt-1">FRIDAY · SATURDAY · SUNDAY</p>
                      <p className="text-[11px] sm:text-xs text-[#5E5254]">5:00 PM — 11:00 PM IST</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4">
                  <a
                    href="https://maps.google.com/?q=Anna+Nagar+Chennai+Opp+LKS+Jewellery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#370816] hover:bg-[#26050e] active:scale-[0.99] text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    <span>GET DIRECTIONS</span>
                  </a>
                  <a
                    href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
                      'Hi Bhuvana! I would like to check directions or handbag stock for your Anna Nagar weekend pop-up.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-[#FAF7F2] active:scale-[0.99] text-[#370816] border border-[#370816]/30 text-xs uppercase tracking-[0.16em] font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#D81B60]">chat</span>
                    <span>WHATSAPP US</span>
                  </a>
                </div>
              </div>

              {/* Right Visual Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-sm overflow-hidden border border-[#370816]/15 shadow-xl bg-[#FAF7F2] p-5 sm:p-6 text-center space-y-3 sm:space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EEDBC5] text-[#370816] mx-auto flex items-center justify-center font-serif text-2xl font-bold">
                    👜
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#370816]">Anna Nagar Handbag Studio</h3>
                  <p className="text-[11px] sm:text-xs text-[#5E5254] leading-relaxed">
                    Feel the leather grains, test strap lengths, and try on our curved elephant bags and Korean pouches in person every weekend.
                  </p>
                  <div className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#F4EEE5] rounded text-[11px] sm:text-xs text-[#370816] font-medium border border-[#370816]/10 space-y-1">
                    <p>🇮🇳 Pan-India Shipping across India available for non-Chennai orders</p>
                    <p>💳 Online payment only · ❌ No COD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT CATALOGUE & FILTER SECTION */}
        <section id="collection" className="w-full py-12 sm:py-24 bg-[#FAF7F2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
            {/* Dynamic Category Hero Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-8 sm:mb-12">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8B6D31] font-semibold">
                CURATED COLLECTION
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-[44px] text-[#370816]">
                {categoryHeaders[selectedCategory]?.title || 'OUR COLLECTION'}
              </h2>
              <p className="text-xs sm:text-base text-[#5E5254] font-light italic font-editorial">
                &ldquo;{categoryHeaders[selectedCategory]?.subtitle || 'Handbags picked for your everyday celebrations.'}&rdquo;
              </p>
            </div>

            {/* Category Filter Tabs & Sorting Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[#370816]/10 mb-8 sm:mb-10">
              {/* Category Tabs - Horizontal Scroll on Mobile with No Scrollbar */}
              <div className="w-full flex items-center overflow-x-auto touch-scroll no-scrollbar gap-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-start">
                {[
                  { id: 'all', label: 'All Bags' },
                  { id: 'elephant-bags', label: 'Elephant Bags' },
                  { id: 'korean-pouches', label: 'Korean Pouches' },
                  { id: 'totes', label: 'ALDO & Totes' },
                  { id: 'slings', label: 'Sling Bags' },
                  { id: 'moon-bags', label: 'Moon Bags' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-full active:scale-95 transition-all ${
                      selectedCategory === tab.id
                        ? 'bg-[#370816] text-[#FAF7F2] shadow-sm'
                        : 'bg-[#F4EEE5] text-[#5E5254] hover:text-[#370816] hover:bg-[#EEDBC5]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sorting & Item Count */}
              <div className="flex items-center gap-3 text-xs text-[#5E5254] w-full md:w-auto justify-between md:justify-end shrink-0 pt-1 md:pt-0">
                <span className="text-[11px] sm:text-xs">Showing {filteredProducts.length} items</span>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="font-medium uppercase tracking-wider text-[11px] sm:text-xs">
                    Sort:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#FAF7F2] border border-[#370816]/20 rounded px-2.5 py-1.5 text-xs text-[#370816] font-medium focus:outline-none focus:border-[#370816]"
                  >
                    <option value="featured">Featured</option>
                    <option value="low-to-high">Price: Low → High</option>
                    <option value="high-to-low">Price: High → Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Cards Grid (2-column on mobile) */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-[#F4EEE5] rounded border border-[#370816]/10 space-y-3 sm:space-y-4">
                <span className="material-symbols-outlined text-[40px] sm:text-[48px] text-[#8B6D31]">search_off</span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#370816]">Nothing here yet.</h3>
                <p className="text-xs text-[#5E5254] px-4">
                  Try searching for elephant bags, Korean pouches, ALDO totes, sling bags or moon bags.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 bg-[#370816] text-[#FAF7F2] text-xs uppercase tracking-wider rounded font-medium active:scale-95 transition-transform"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => openProductDetail(product)}
                      className="group cursor-pointer flex flex-col bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden hover:shadow-xl active:scale-[0.99] transition-all duration-300"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4EEE5]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        {product.secondImage && (
                          <img
                            src={product.secondImage}
                            alt={`${product.name} alternate view`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start">
                          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.14em] sm:tracking-[0.16em] font-semibold text-[#370816] bg-[#FAF7F2]/95 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-sm">
                            {product.categoryTag}
                          </span>
                          {product.microBadge && (
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-white bg-[#370816] px-1.5 sm:px-2 py-0.5 rounded-sm shadow-sm">
                              {product.microBadge}
                            </span>
                          )}
                        </div>

                        {/* Wishlist Icon */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product, e)}
                          aria-label={`Save ${product.name} to wishlist`}
                          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2]/90 backdrop-blur-sm flex items-center justify-center text-[#370816] hover:bg-white shadow-sm transition-transform active:scale-90"
                        >
                          <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${isWishlisted ? 'text-[#D81B60] fill-current' : 'text-[#5E5254]'}`}>
                            {isWishlisted ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>
                      </div>

                      {/* Content details */}
                      <div className="p-2.5 sm:p-5 flex flex-col justify-between flex-1 space-y-1.5 sm:space-y-2">
                        <div>
                          <h3 className="font-serif text-xs sm:text-base sm:text-lg font-medium text-[#370816] line-clamp-1 group-hover:text-[#8B6D31] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-[#5E5254] line-clamp-1 mt-0.5">
                            {product.subtitle}
                          </p>
                        </div>

                        <div className="pt-1.5 sm:pt-2 flex items-baseline justify-between border-t border-[#370816]/5">
                          <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-base font-semibold text-[#370816]">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-[#5E5254] line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          {product.discountBadge && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#D81B60]">
                              {product.discountBadge}
                            </span>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-1.5 sm:pt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={(e) => addToCart(product, 1, e)}
                            className="py-1.5 sm:py-2 bg-[#F4EEE5] hover:bg-[#EEDBC5] active:scale-95 text-[#370816] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-sm transition-all text-center"
                          >
                            + BAG
                          </button>
                          <a
                            href={createWhatsAppProductUrl(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 sm:py-2 bg-[#370816] hover:bg-[#26050e] active:scale-95 text-[#FAF7F2] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-sm transition-all flex items-center justify-center gap-1 text-center"
                          >
                            <span className="material-symbols-outlined text-[12px] sm:text-[13px] text-[#C49A45]">chat</span>
                            <span>BUY</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* LOOKBOOK PAIRINGS SECTION */}
        <section id="lookbook" className="w-full py-12 sm:py-24 bg-[#F4EEE5] border-y border-[#370816]/10">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#8B6D31] font-semibold block">
                  CURATED STYLING
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#370816]">
                  Lookbook Styling Bundles
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5E5254] max-w-md font-light leading-relaxed">
                Carefully coordinated handbag pairings combining mobile pouches, elephant silhouettes, and spacious work totes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {LOOKBOOK_PAIRINGS.map((pairing) => (
                <div
                  key={pairing.id}
                  className="bg-[#FAF7F2] border border-[#370816]/10 rounded-sm overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={pairing.image}
                      alt={pairing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#370816] text-white text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm font-semibold">
                      {pairing.label}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl text-[#370816] font-medium">{pairing.title}</h3>
                      <p className="text-[11px] sm:text-xs text-[#5E5254] mt-0.5 sm:mt-1 italic">{pairing.tagline}</p>
                      <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-[#370816]/80">
                        {pairing.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-[#8B6D31]">✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-[#370816]/10 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-[#5E5254] block uppercase">Bundle Price</span>
                        <span className="text-base sm:text-lg font-semibold text-[#370816]">
                          ₹{pairing.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
                          `Hi Bhuvana! I would love to order the Lookbook Bundle "${pairing.title}" (₹${pairing.totalPrice}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#370816] text-[#FAF7F2] text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#26050e] active:scale-95 transition-all text-center"
                      >
                        ORDER LOOKBOOK
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BRAND STORY / ABOUT SECTION */}
        <section id="about" className="w-full py-12 sm:py-24 bg-[#FAF7F2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6 flex flex-col items-center">
            <img
              src="/title-logo.png"
              alt="Bhuvana Budget Collection"
              className="h-20 sm:h-32 w-auto object-contain bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-[#370816]/10 mb-1 sm:mb-2"
            />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8B6D31] font-semibold block">
              OUR BRAND STORY
            </span>
            <h2 className="font-serif text-2xl sm:text-5xl text-[#370816] font-normal italic font-editorial">
              &ldquo;Picked with love.&rdquo;
            </h2>
            <p className="text-sm sm:text-lg text-[#5E5254] leading-relaxed font-light max-w-2xl">
              We&apos;re a small fashion pop-up bringing together women&apos;s handbags, curved elephant bags, Korean mobile pouches, ALDO totes and moon bags that feel beautiful, wearable and a little special. Every weekend, we bring our latest finds to Anna Nagar — and we ship our favourites across India.
            </p>
            <div className="pt-3 sm:pt-4 flex flex-wrap justify-center gap-3 sm:gap-8 text-[10px] sm:text-xs uppercase tracking-widest text-[#370816] font-semibold border-t border-[#370816]/10 max-w-md mx-auto">
              <span>🇮🇳 PAN INDIA SHIPPING</span>
              <span>•</span>
              <span>💳 ONLINE PAYMENT ONLY</span>
              <span>•</span>
              <span>❌ NO COD</span>
            </div>
          </div>
        </section>

        {/* POLICIES & SHIPPING SECTION */}
        <section className="w-full py-10 sm:py-16 bg-[#370816] text-[#FAF7F2] border-t border-[#C49A45]/30">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-center md:text-left">
            <div className="space-y-2 p-4 sm:p-6 rounded bg-[#26050e]/60 border border-[#C49A45]/20">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C49A45]/20 text-[#C49A45] flex items-center justify-center font-bold mb-1 sm:mb-2 mx-auto md:mx-0">
                🇮🇳
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#FAF7F2]">Pan India Shipping</h3>
              <p className="text-xs text-[#FAF7F2]/80 leading-relaxed">
                We deliver handbags safely across India. Flat ₹70 courier charge, or free on orders over ₹2,499.
              </p>
            </div>

            <div className="space-y-2 p-4 sm:p-6 rounded bg-[#26050e]/60 border border-[#C49A45]/20">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C49A45]/20 text-[#C49A45] flex items-center justify-center font-bold mb-1 sm:mb-2 mx-auto md:mx-0">
                💳
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#FAF7F2]">Online Payment Only</h3>
              <p className="text-xs text-[#FAF7F2]/80 leading-relaxed">
                We accept UPI payments (GPay, PhonePe, Paytm, BHIM) and online bank transfers. Fast, transparent digital receipt provided on WhatsApp.
              </p>
            </div>

            <div className="space-y-2 p-4 sm:p-6 rounded bg-[#26050e]/60 border border-[#C49A45]/20">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C49A45]/20 text-[#C49A45] flex items-center justify-center font-bold mb-1 sm:mb-2 mx-auto md:mx-0">
                ❌
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#FAF7F2]">Strictly No COD</h3>
              <p className="text-xs text-[#FAF7F2]/80 leading-relaxed">
                As a boutique handbag studio, we do not support Cash on Delivery. All orders are confirmed upon online payment receipt.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - Extra bottom padding on mobile for Mobile Bottom Nav */}
      <footer className="w-full bg-[#26050e] text-[#FAF7F2] py-12 sm:py-16 pb-28 sm:pb-16 border-t border-[#C49A45]/20">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/title-logo.png"
                alt="Bhuvana Budget Collection"
                className="h-10 sm:h-11 w-auto object-contain bg-white rounded-md p-1"
              />
            </div>
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed max-w-sm font-light">
              Women&apos;s handbag studio and weekend pop-up in Anna Nagar, Chennai. Curved elephant bags, Korean mobile pouches, ALDO totes, and crescent moon bags.
            </p>
            <div className="pt-2 text-xs text-[#C49A45] font-medium space-y-1">
              <p>📍 Anna Nagar · Opp. LKS Jewellery, 2nd Avenue</p>
              <p>⏰ Friday, Saturday &amp; Sunday · 5:00 PM – 11:00 PM</p>
              <p>📱 WhatsApp: +91 9585318015</p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C49A45] font-semibold">BAG SILHOUETTES</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li>
                <button onClick={() => setSelectedCategory('elephant-bags')} className="hover:text-[#C49A45] text-left">
                  Curved Elephant Bags
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('korean-pouches')} className="hover:text-[#C49A45] text-left">
                  Korean Mobile Pouches
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('totes')} className="hover:text-[#C49A45] text-left">
                  ALDO &amp; Studio Totes
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('slings')} className="hover:text-[#C49A45] text-left">
                  Sling &amp; Crossbody Bags
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('moon-bags')} className="hover:text-[#C49A45] text-left">
                  Crescent Moon Bags
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Visit & Pop */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C49A45] font-semibold">WEEKEND POP</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li>
                <a href="#weekend-pop" className="hover:text-[#C49A45]">
                  Meet Us in Anna Nagar
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Anna+Nagar+Chennai+Opp+LKS+Jewellery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C49A45]"
                >
                  Get Directions
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#C49A45]">
                  About Our Studio
                </a>
              </li>
              <li>
                <a href="#lookbook" className="hover:text-[#C49A45]">
                  Curated Lookbook
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Shipping Policies */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C49A45] font-semibold">POLICIES</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li>🇮🇳 Pan-India Shipping</li>
              <li>💳 Online Payment Only</li>
              <li>❌ Strictly No COD</li>
              <li>
                <a
                  href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
                    'Hi! I would like to inquire about payment details for my handbag order.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C49A45]"
                >
                  WhatsApp Ordering
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 mt-8 sm:mt-12 pt-6 border-t border-[#FAF7F2]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#FAF7F2]/60 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Bhuvana Bag Studio · Anna Nagar, Chennai. All rights reserved.</p>
          <p>Online Payment Only · Ships Across India 🇮🇳</p>
        </div>
      </footer>

      {/* MOBILE BOTTOM STICKY NAVIGATION BAR (App-like thumb experience) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#370816]/15 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(38,5,14,0.08)] pb-safe">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 px-3 text-[#5E5254] hover:text-[#370816] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 px-3 text-[#5E5254] hover:text-[#370816] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Bags</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-[#5E5254] hover:text-[#370816] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Search</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 text-[#5E5254] hover:text-[#370816] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">Saved</span>
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-[#D81B60] text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 text-[#370816] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Bag</span>
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#370816] text-[#FAF7F2] text-[9px] font-bold flex items-center justify-center leading-none">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* FLOATING WHATSAPP BUTTON - Positioned above mobile bottom bar */}
      <a
        href={`https://wa.me/${POPUP_INFO.whatsappNumber}?text=${encodeURIComponent(
          'Hi! I found your website and would love to ask a quick question about your women\'s handbags.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order via WhatsApp"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] text-white p-3 sm:p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20 group"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">Order on WhatsApp</span>
      </a>

      {/* PRODUCT DETAIL MODAL (Mobile Bottom Sheet & Desktop Modal) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#26050e]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full sm:max-w-4xl bg-[#FAF7F2] rounded-t-2xl sm:rounded-sm shadow-2xl border border-[#370816]/20 overflow-y-auto max-h-[92vh] sm:max-h-[90vh] my-0 sm:my-8 animate-slide-up sm:animate-fade-in flex flex-col">
            {/* Modal Header Bar with Close Button */}
            <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-[#370816]/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B6D31] font-semibold">
                {selectedProduct.categoryTag}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-[#F4EEE5] hover:bg-white text-[#370816] flex items-center justify-center shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 p-4 sm:p-8 flex-1">
              {/* Product Gallery */}
              <div className="md:col-span-6 space-y-3 sm:space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#F4EEE5] border border-[#370816]/10">
                  <img
                    src={
                      selectedImageIndex === 1 && selectedProduct.secondImage
                        ? selectedProduct.secondImage
                        : selectedProduct.image
                    }
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedProduct.microBadge && (
                    <span className="absolute top-2.5 left-2.5 bg-[#370816] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:py-1 rounded-sm">
                      {selectedProduct.microBadge}
                    </span>
                  )}
                </div>

                {selectedProduct.secondImage && (
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(0)}
                      className={`w-14 h-18 sm:w-16 sm:h-20 rounded border overflow-hidden active:scale-95 transition-all ${
                        selectedImageIndex === 0 ? 'border-[#370816] ring-2 ring-[#370816]' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={selectedProduct.image} alt="Main view" className="w-full h-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(1)}
                      className={`w-14 h-18 sm:w-16 sm:h-20 rounded border overflow-hidden active:scale-95 transition-all ${
                        selectedImageIndex === 1 ? 'border-[#370816] ring-2 ring-[#370816]' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={selectedProduct.secondImage} alt="Alternate view" className="w-full h-full object-cover" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info & Actions */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#8B6D31] font-semibold">
                      Anna Nagar Studio
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(selectedProduct, e)}
                      className="text-[#370816] hover:text-[#D81B60] text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {wishlist.includes(selectedProduct.id) ? 'favorite' : 'favorite_border'}
                      </span>
                      <span>{wishlist.includes(selectedProduct.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <h2 className="font-serif text-xl sm:text-3xl text-[#370816] font-medium leading-tight">
                    {selectedProduct.name}
                  </h2>

                  <p className="text-xs text-[#5E5254] italic font-editorial">
                    {selectedProduct.subtitle}
                  </p>

                  <div className="flex items-baseline gap-2.5 pt-1">
                    <span className="text-xl sm:text-2xl font-semibold text-[#370816]">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xs sm:text-sm text-[#5E5254] line-through">
                        ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {selectedProduct.discountBadge && (
                      <span className="text-[11px] sm:text-xs font-bold text-[#D81B60]">
                        {selectedProduct.discountBadge}
                      </span>
                    )}
                  </div>

                  <div className="py-1 px-2.5 bg-[#EEDBC5]/50 border border-[#C49A45]/30 rounded text-[10px] sm:text-[11px] text-[#370816] inline-block font-medium">
                    ✓ In Stock · Ready to dispatch from Anna Nagar
                  </div>

                  <p className="text-xs sm:text-sm text-[#5E5254] leading-relaxed pt-1">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#370816] mb-1.5">
                      Bag Specifications:
                    </h4>
                    <ul className="space-y-1 text-xs text-[#5E5254]">
                      {selectedProduct.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-[#8B6D31]">✦</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sticky Action Footer in Modal on Mobile */}
                <div className="sticky bottom-0 bg-[#FAF7F2]/95 backdrop-blur-md p-3 sm:p-0 border-t sm:border-0 border-[#370816]/10 -mx-4 -mb-4 px-4 sm:mx-0 sm:mb-0 space-y-3 pb-safe z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:shadow-none">
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#370816]">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-[#370816]/20 rounded bg-[#F4EEE5]">
                      <button
                        type="button"
                        onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1 text-sm font-bold text-[#370816] active:scale-90"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-xs font-semibold text-[#370816]">
                        {detailQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailQuantity((q) => q + 1)}
                        className="px-3 py-1 text-sm font-bold text-[#370816] active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(selectedProduct, detailQuantity);
                        setSelectedProduct(null);
                      }}
                      className="py-3 sm:py-3.5 bg-[#F4EEE5] hover:bg-[#EEDBC5] active:scale-95 text-[#370816] text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-sm border border-[#370816]/20 transition-all text-center"
                    >
                      ADD TO BAG
                    </button>
                    <a
                      href={createWhatsAppProductUrl(selectedProduct)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 sm:py-3.5 bg-[#370816] hover:bg-[#26050e] active:scale-95 text-[#FAF7F2] text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-sm text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#C49A45]">chat</span>
                      <span>BUY ON WA</span>
                    </a>
                  </div>

                  {/* Shipping Badges */}
                  <div className="p-2 sm:p-2.5 bg-[#F4EEE5] rounded text-[10px] sm:text-[11px] text-[#5E5254] border border-[#370816]/10">
                    <div className="flex items-center justify-center gap-2 font-medium text-[#370816]">
                      <span>🇮🇳 Pan-India Shipping</span>
                      <span>•</span>
                      <span>💳 Online Payment</span>
                      <span>•</span>
                      <span>❌ No COD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#26050e]/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full sm:max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#370816]/20 animate-slide-up sm:animate-none">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#370816]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#370816]">shopping_bag</span>
                <h3 className="font-serif text-lg sm:text-xl text-[#370816] font-medium">Your Shopping Bag</h3>
                <span className="text-xs bg-[#370816] text-[#FAF7F2] px-2 py-0.5 rounded-full font-semibold">
                  {cartItemCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F4EEE5] text-[#370816] flex items-center justify-center active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Cart Items list */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 divide-y divide-[#370816]/10">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <span className="material-symbols-outlined text-[48px] text-[#8B6D31]">shopping_bag</span>
                  <h4 className="font-serif text-xl sm:text-2xl text-[#370816]">Your bag is waiting.</h4>
                  <p className="text-xs text-[#5E5254] max-w-xs mx-auto">
                    Looks like you haven&apos;t picked anything yet. Explore our curved elephant bags, Korean mobile pouches, ALDO totes and moon bags.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      const el = document.getElementById('collection');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-[#370816] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold rounded active:scale-95 transition-transform"
                  >
                    EXPLORE COLLECTION
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3 sm:gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-18 h-22 sm:w-20 sm:h-24 object-cover rounded bg-[#F4EEE5] border border-[#370816]/10 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm sm:text-base text-[#370816] font-medium leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -item.quantity)}
                            className="text-[#5E5254] hover:text-[#D81B60] p-1 -m-1"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8B6D31]">
                          {item.product.categoryTag}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#370816]/20 rounded bg-[#F4EEE5]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#370816] active:scale-90"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-semibold text-[#370816]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#370816] active:scale-90"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#370816]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#F4EEE5] border-t border-[#370816]/10 space-y-3 sm:space-y-4 pb-safe">
                <div className="space-y-1.5 text-xs text-[#5E5254]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-[#370816]">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (Pan India):</span>
                    <span className="font-medium text-[#370816]">
                      {isFreeDelivery ? 'Free 🇮🇳' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#370816] pt-1.5 border-t border-[#370816]/10">
                    <span>Total:</span>
                    <span>₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-2 bg-[#FAF7F2] rounded text-[10px] text-[#370816] font-medium border border-[#370816]/10 text-center">
                  💳 Online payment only · ❌ Strictly No COD
                </div>

                <div className="space-y-2">
                  <a
                    href={createWhatsAppCartUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 sm:py-4 bg-[#370816] hover:bg-[#26050e] active:scale-95 text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-semibold rounded-sm transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#C49A45]">chat</span>
                    <span>ORDER VIA WHATSAPP</span>
                  </a>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full py-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-[#5E5254] hover:text-[#D81B60] text-center"
                  >
                    Clear shopping bag
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER / MODAL */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 bg-[#26050e]/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full sm:max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#370816]/20 animate-slide-up sm:animate-none">
            <div className="p-4 sm:p-6 border-b border-[#370816]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#D81B60]">favorite</span>
                <h3 className="font-serif text-lg sm:text-xl text-[#370816] font-medium">Saved Handbags</h3>
                <span className="text-xs bg-[#D81B60] text-white px-2 py-0.5 rounded-full font-semibold">
                  {wishlist.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F4EEE5] text-[#370816] flex items-center justify-center active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 divide-y divide-[#370816]/10 pb-safe">
              {wishlistedProducts.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <span className="material-symbols-outlined text-[48px] text-[#8B6D31]">favorite_border</span>
                  <h4 className="font-serif text-xl sm:text-2xl text-[#370816]">No saved items yet.</h4>
                  <p className="text-xs text-[#5E5254] max-w-xs mx-auto">
                    Tap the heart icon on any curved elephant bag, Korean pouch or ALDO tote to save it.
                  </p>
                </div>
              ) : (
                wishlistedProducts.map((product) => (
                  <div key={product.id} className="pt-4 first:pt-0 flex gap-3 sm:gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-18 h-22 sm:w-20 sm:h-24 object-cover rounded bg-[#F4EEE5] border border-[#370816]/10 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif text-sm sm:text-base text-[#370816] font-medium leading-tight">
                            {product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product, e)}
                            className="text-[#5E5254] hover:text-[#D81B60] p-1 -m-1"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8B6D31]">
                          {product.categoryTag}
                        </span>
                        <p className="text-xs font-semibold text-[#370816] mt-0.5">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(product, 1);
                            setIsWishlistOpen(false);
                          }}
                          className="px-3 py-1.5 bg-[#370816] text-white text-[10px] sm:text-[11px] uppercase tracking-wider rounded font-medium active:scale-95"
                        >
                          MOVE TO BAG
                        </button>
                        <a
                          href={createWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#F4EEE5] text-[#370816] text-[10px] sm:text-[11px] uppercase tracking-wider rounded font-medium active:scale-95"
                        >
                          WHATSAPP
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#26050e]/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-8 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#FAF7F2] rounded-sm shadow-2xl border border-[#370816]/20 overflow-hidden mt-6 sm:mt-12 animate-slide-up sm:animate-fade-in">
            <div className="p-3.5 sm:p-6 border-b border-[#370816]/10 flex items-center gap-2.5 sm:gap-3">
              <span className="material-symbols-outlined text-[22px] sm:text-[24px] text-[#8B6D31] shrink-0">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bags, pouches, totes..."
                autoFocus
                className="flex-1 bg-transparent text-base sm:text-lg text-[#370816] focus:outline-none placeholder-[#5E5254]/60 font-sans"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Close search"
                className="w-8 h-8 rounded-full hover:bg-[#F4EEE5] text-[#370816] flex items-center justify-center shrink-0 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="space-y-3 sm:space-y-4 text-center py-4 sm:py-8">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#8B6D31] font-semibold">Popular Searches</p>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {['Elephant Bag', 'Korean Pouch', 'ALDO Tote', 'Sling Bag', 'Moon Bag', 'Cognac', 'Sage Green'].map(
                      (kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => setSearchQuery(kw)}
                          className="px-3 py-1.5 bg-[#F4EEE5] hover:bg-[#EEDBC5] active:scale-95 text-xs text-[#370816] rounded-full font-medium transition-all"
                        >
                          {kw}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 space-y-2 sm:space-y-3">
                  <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-[#8B6D31]">search_off</span>
                  <h4 className="font-serif text-lg sm:text-xl text-[#370816]">Nothing here yet.</h4>
                  <p className="text-xs text-[#5E5254]">
                    Try searching for elephant bags, Korean pouches, ALDO totes, slings or moon bags.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        openProductDetail(product);
                      }}
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded bg-[#FAF7F2] hover:bg-[#F4EEE5] active:scale-[0.99] border border-[#370816]/10 cursor-pointer transition-all"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-13 h-16 sm:w-14 sm:h-16 object-cover rounded bg-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-wider text-[#8B6D31] block">
                          {product.categoryTag}
                        </span>
                        <h4 className="font-serif text-xs sm:text-sm text-[#370816] font-medium leading-tight truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs font-semibold text-[#370816] mt-0.5">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
