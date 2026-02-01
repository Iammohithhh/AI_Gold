import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { 
  Menu, X, ShoppingBag, MessageCircle, Phone, Mail, MapPin, 
  ChevronRight, Star, Shield, Award, Gem, Info, Wrench, ShieldCheck,
  Send, ArrowRight, Filter, Search, Plus, Minus, Trash2, Clock
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ==================== CONTEXT ====================
const CartContext = React.createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  
  const addToCart = (item, estimate) => {
    const exists = cart.find(c => c.item_id === item.item_id);
    if (exists) {
      toast.info('Item already in your selection');
      return;
    }
    setCart([...cart, { ...item, estimate }]);
    toast.success('Added to your selection');
  };
  
  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.item_id !== itemId));
    toast.success('Removed from selection');
  };
  
  const clearCart = () => setCart([]);
  
  const totalEstimate = cart.reduce((sum, item) => sum + (item.estimate || 0), 0);
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalEstimate }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => React.useContext(CartContext);

// ==================== NAVBAR ====================
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/catalogue' },
    { name: 'About', path: '/about' },
    { name: 'Know Your Gold', path: '/education' },
    { name: 'Contact', path: '/contact' }
  ];
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-transparent'}`} data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2" data-testid="logo">
            <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
              <Gem className="w-5 h-5 text-emerald-900" />
            </div>
            <span className="font-display text-xl font-semibold text-emerald-900">Heritage Gold</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-emerald-700 ${location.pathname === link.path ? 'text-emerald-900' : 'text-gray-600'}`}
                data-testid={`nav-${link.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2" data-testid="cart-icon">
              <ShoppingBag className="w-5 h-5 text-emerald-900" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-emerald-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} data-testid="mobile-menu-toggle">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 glass rounded-b-lg">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path}
                className="block py-3 px-4 text-gray-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                onClick={() => setIsOpen(false)}
                data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// ==================== PRICE TICKER ====================
const PriceTicker = () => {
  const [prices, setPrices] = useState(null);
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/gold-price`);
        setPrices(res.data);
      } catch (err) {
        console.error('Failed to fetch prices');
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);
  
  if (!prices) return null;
  
  return (
    <div className="bg-emerald-900 text-white py-2 overflow-hidden" data-testid="price-ticker">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-4">
            <span className="flex items-center gap-2">
              <span className="text-gold">●</span>
              <span className="text-sm">24K Gold: ₹{prices.gold_24k?.toLocaleString()}/g</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">●</span>
              <span className="text-sm">22K Gold: ₹{prices.gold_22k?.toLocaleString()}/g</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">●</span>
              <span className="text-sm">18K Gold: ₹{prices.gold_18k?.toLocaleString()}/g</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gray-300">●</span>
              <span className="text-sm">Silver: ₹{prices.silver?.toLocaleString()}/g</span>
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {prices.source === 'live' ? 'Live' : 'Updated'}: {new Date(prices.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== HOME PAGE ====================
const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jewelleryRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/jewellery?featured=true`),
          axios.get(`${API_URL}/api/goldsmith`)
        ]);
        setFeatured(jewelleryRes.data.items || []);
        setProfile(profileRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);
  
  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558882268-15aa056d885f?w=1920&q=80" 
            alt="Elegant jewellery" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-32">
          <div className="max-w-2xl stagger-children">
            <p className="font-accent italic text-gold-dark text-lg mb-4">Since 1990</p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-emerald-900 leading-tight mb-6">
              Crafted with <br />
              <span className="italic">Heritage</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Three generations of master goldsmiths bringing you timeless pieces. 
              Experience transparent pricing and AI-assisted discovery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalogue" className="btn-primary flex items-center gap-2" data-testid="explore-collection-btn">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-secondary" data-testid="our-story-btn">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Indicators */}
      <section className="py-16 bg-white" data-testid="trust-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'BIS Certified', value: '100% Hallmarked' },
              { icon: Award, label: 'Experience', value: '35+ Years' },
              { icon: Star, label: 'Happy Customers', value: '10,000+' },
              { icon: Gem, label: 'Designs', value: '500+ Unique' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-emerald-900" />
                </div>
                <p className="text-2xl font-display font-semibold text-emerald-900">{item.value}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Collection */}
      <section className="py-20 bg-gray-50" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="font-accent italic text-gold-dark mb-2">Curated Selection</p>
              <h2 className="font-display text-4xl font-bold text-emerald-900">Featured Pieces</h2>
            </div>
            <Link to="/catalogue" className="btn-ghost flex items-center gap-2" data-testid="view-all-btn">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.slice(0, 6).map((item, i) => (
              <ProductCard key={item.item_id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      
      {/* About Preview */}
      {profile && (
        <section className="py-20 bg-white" data-testid="about-preview">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1659682699444-9ebad278fbd3?w=800&q=80" 
                  alt="Goldsmith at work" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-8 -right-8 bg-emerald-900 text-white p-8">
                  <p className="font-display text-4xl font-bold">{profile.years_of_experience}+</p>
                  <p className="text-sm text-gray-300">Years of Excellence</p>
                </div>
              </div>
              
              <div>
                <p className="font-accent italic text-gold-dark mb-4">The Artisan</p>
                <h2 className="font-display text-4xl font-bold text-emerald-900 mb-6">{profile.name}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{profile.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.specializations?.map((spec, i) => (
                    <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-900 text-sm rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
                
                <Link to="/about" className="btn-secondary" data-testid="learn-more-btn">
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-20 bg-emerald-900 text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold mb-6">Have Something Special in Mind?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Our AI assistant can help you discover the perfect piece based on your occasion, budget, and preferences.
          </p>
          <button 
            onClick={() => document.querySelector('[data-testid="chat-toggle"]')?.click()}
            className="bg-gold text-emerald-900 hover:bg-gold-light rounded-full px-8 py-3 font-medium transition-all inline-flex items-center gap-2"
            data-testid="talk-to-ai-btn"
          >
            <MessageCircle className="w-5 h-5" /> Talk to Our AI Assistant
          </button>
        </div>
      </section>
    </div>
  );
};

// ==================== PRODUCT CARD ====================
const ProductCard = ({ item, index }) => {
  const { addToCart } = useCart();
  const [prices, setPrices] = useState(null);
  
  useEffect(() => {
    axios.get(`${API_URL}/api/gold-price`).then(res => setPrices(res.data));
  }, []);
  
  const getEstimate = () => {
    if (!prices) return 0;
    const purityMap = { '24K': prices.gold_24k, '22K': prices.gold_22k, '18K': prices.gold_18k };
    const goldRate = purityMap[item.purity] || prices.gold_22k;
    const avgWeight = (item.weight_min + item.weight_max) / 2;
    const goldValue = goldRate * avgWeight;
    const labour = item.labour_cost_per_gram * avgWeight;
    const subtotal = goldValue + labour;
    const gst = subtotal * 0.03;
    return Math.round(subtotal + gst);
  };
  
  return (
    <div 
      className="card group"
      style={{ animationDelay: `${index * 0.1}s` }}
      data-testid={`product-card-${item.item_id}`}
    >
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={item.images?.[0] || 'https://via.placeholder.com/400'} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-emerald-900 rounded-full">
            {item.purity}
          </span>
          {item.is_featured && (
            <span className="px-3 py-1 bg-gold text-xs font-medium text-emerald-900 rounded-full">
              Featured
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{item.type} • {item.occasion}</p>
        <h3 className="font-display text-xl font-semibold text-emerald-900 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Estimate from</p>
            <p className="font-display text-xl font-semibold text-emerald-900">₹{getEstimate().toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to={`/product/${item.item_id}`}
              className="p-3 border border-emerald-900 text-emerald-900 hover:bg-emerald-50 rounded-full transition-colors"
              data-testid={`view-product-${item.item_id}`}
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => addToCart(item, getEstimate())}
              className="p-3 bg-emerald-900 text-white hover:bg-emerald-800 rounded-full transition-colors"
              data-testid={`add-to-cart-${item.item_id}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== CATALOGUE PAGE ====================
const CataloguePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '', occasion: '', gender: '', purity: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchItems();
  }, [filters]);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const res = await axios.get(`${API_URL}/api/jewellery?${params}`);
      setItems(res.data.items || []);
    } catch (err) {
      toast.error('Failed to load catalogue');
    }
    setLoading(false);
  };
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filterOptions = {
    type: ['necklace', 'bangles', 'ring', 'chain', 'earrings'],
    occasion: ['wedding', 'daily', 'festival'],
    gender: ['male', 'female', 'unisex'],
    purity: ['24K', '22K', '18K']
  };
  
  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="catalogue-page">
      <PriceTicker />
      
      {/* Header */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-display text-4xl font-bold text-emerald-900 mb-4">Our Collection</h1>
          <p className="text-gray-600">Discover handcrafted pieces for every occasion</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-6">Filters</h3>
              
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key} className="mb-6">
                  <label className="text-sm font-medium text-gray-700 capitalize mb-2 block">{key}</label>
                  <select 
                    value={filters[key]}
                    onChange={(e) => setFilters({...filters, [key]: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    data-testid={`filter-${key}`}
                  >
                    <option value="">All {key}s</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              <button 
                onClick={() => setFilters({ type: '', occasion: '', gender: '', purity: '' })}
                className="btn-ghost text-sm w-full text-left"
                data-testid="clear-filters"
              >
                Clear all filters
              </button>
            </div>
          </aside>
          
          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search jewellery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:border-emerald-900 focus:outline-none"
                  data-testid="search-input"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-secondary flex items-center gap-2"
                data-testid="toggle-filters"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Gem className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items found matching your criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, i) => (
                  <ProductCard key={item.item_id} item={item} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// ==================== PRODUCT DETAIL PAGE ====================
const ProductDetailPage = () => {
  const { addToCart } = useCart();
  const [item, setItem] = useState(null);
  const [prices, setPrices] = useState(null);
  const [weight, setWeight] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const itemId = window.location.pathname.split('/').pop();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, pricesRes] = await Promise.all([
          axios.get(`${API_URL}/api/jewellery/${itemId}`),
          axios.get(`${API_URL}/api/gold-price`)
        ]);
        setItem(itemRes.data);
        setPrices(pricesRes.data);
        setWeight((itemRes.data.weight_min + itemRes.data.weight_max) / 2);
      } catch (err) {
        toast.error('Failed to load product');
      }
    };
    fetchData();
  }, [itemId]);
  
  useEffect(() => {
    if (item && weight) {
      calculatePrice();
    }
  }, [weight, item]);
  
  const calculatePrice = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/calculate-price?weight=${weight}&purity=${item.purity}&labour_per_gram=${item.labour_cost_per_gram}`
      );
      setPriceBreakdown(res.data);
    } catch (err) {
      console.error('Failed to calculate price');
    }
  };
  
  if (!item) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="pt-20 min-h-screen bg-white" data-testid="product-detail-page">
      <PriceTicker />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img 
                src={item.images?.[0] || 'https://via.placeholder.com/800'} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {item.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={img} alt={`${item.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full">{item.type}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{item.occasion}</span>
              <span className="px-3 py-1 bg-gold/20 text-gold-dark text-sm rounded-full">{item.purity}</span>
            </div>
            
            <h1 className="font-display text-4xl font-bold text-emerald-900 mb-4">{item.name}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{item.description}</p>
            
            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-sm">
              <div>
                <p className="text-sm text-gray-500">Weight Range</p>
                <p className="font-semibold">{item.weight_min}g - {item.weight_max}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purity</p>
                <p className="font-semibold">{item.purity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Making Charges</p>
                <p className="font-semibold">₹{item.labour_cost_per_gram}/g</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Complexity</p>
                <p className="font-semibold capitalize">{item.making_complexity}</p>
              </div>
            </div>
            
            {/* Price Calculator */}
            <div className="bg-emerald-50 p-6 rounded-sm mb-8" data-testid="price-calculator">
              <h3 className="font-display text-xl font-semibold text-emerald-900 mb-4">Price Estimator</h3>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Adjust Weight (grams)</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setWeight(Math.max(item.weight_min, weight - 1))}
                    className="p-2 border border-emerald-900 rounded-full hover:bg-emerald-100"
                    data-testid="decrease-weight"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(item.weight_min, Math.min(item.weight_max, Number(e.target.value))))}
                    className="w-24 text-center font-semibold text-lg bg-white border border-gray-200 rounded-lg py-2"
                    data-testid="weight-input"
                  />
                  <button 
                    onClick={() => setWeight(Math.min(item.weight_max, weight + 1))}
                    className="p-2 border border-emerald-900 rounded-full hover:bg-emerald-100"
                    data-testid="increase-weight"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <input 
                  type="range"
                  min={item.weight_min}
                  max={item.weight_max}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full mt-4 accent-emerald-900"
                />
              </div>
              
              {priceBreakdown && (
                <div className="bg-white p-4 rounded-sm" data-testid="price-breakdown">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gold ({priceBreakdown.breakdown.purity} @ ₹{priceBreakdown.breakdown.gold_rate_per_gram}/g)</span>
                      <span>₹{priceBreakdown.breakdown.gold_value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Making Charges ({weight}g × ₹{item.labour_cost_per_gram})</span>
                      <span>₹{priceBreakdown.breakdown.labour_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (3%)</span>
                      <span>₹{priceBreakdown.breakdown.gst_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-lg">
                      <span>Estimated Total</span>
                      <span className="text-emerald-900">₹{priceBreakdown.breakdown.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    *Final price may vary based on exact weight and current gold rates at time of purchase
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => addToCart(item, priceBreakdown?.breakdown.total || 0)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                data-testid="add-to-selection-btn"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Selection
              </button>
              <Link to="/contact" className="btn-secondary flex items-center gap-2" data-testid="inquire-btn">
                <MessageCircle className="w-5 h-5" /> Inquire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== CART PAGE ====================
const CartPage = () => {
  const { cart, removeFromCart, clearCart, totalEstimate } = useCart();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    occasion: '',
    timeline: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Please add items to your selection first');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: cart.map(item => ({ name: item.name, item_id: item.item_id, estimate: item.estimate })),
        total_estimate: totalEstimate
      };
      const res = await axios.post(`${API_URL}/api/order-intent`, payload);
      toast.success(res.data.message);
      clearCart();
      setFormData({ customer_name: '', customer_email: '', customer_phone: '', occasion: '', timeline: '', message: '' });
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };
  
  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="cart-page">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <h1 className="font-display text-4xl font-bold text-emerald-900 mb-2">Your Selection</h1>
        <p className="text-gray-600 mb-8">Review your chosen pieces and submit your order intent</p>
        
        {cart.length === 0 ? (
          <div className="bg-white p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Your selection is empty</p>
            <Link to="/catalogue" className="btn-primary inline-block">
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white mb-8">
              {cart.map((item, i) => (
                <div key={item.item_id} className={`flex gap-4 p-6 ${i > 0 ? 'border-t border-gray-100' : ''}`} data-testid={`cart-item-${item.item_id}`}>
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/100'} 
                    alt={item.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-emerald-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.type} • {item.purity}</p>
                    <p className="text-lg font-semibold mt-2">₹{item.estimate?.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.item_id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    data-testid={`remove-item-${item.item_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <div className="p-6 bg-emerald-50 flex justify-between items-center">
                <span className="font-display text-lg">Total Estimate</span>
                <span className="font-display text-2xl font-bold text-emerald-900">₹{totalEstimate.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-white p-8">
              <h2 className="font-display text-2xl font-semibold text-emerald-900 mb-6">Complete Your Order Intent</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</label>
                    <input 
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      className="input-field border border-gray-200 rounded-lg px-4"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email *</label>
                    <input 
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                      className="input-field border border-gray-200 rounded-lg px-4"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Phone *</label>
                    <input 
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                      className="input-field border border-gray-200 rounded-lg px-4"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Occasion *</label>
                    <select 
                      required
                      value={formData.occasion}
                      onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                      className="input-field border border-gray-200 rounded-lg px-4"
                      data-testid="input-occasion"
                    >
                      <option value="">Select occasion</option>
                      <option value="wedding">Wedding</option>
                      <option value="engagement">Engagement</option>
                      <option value="festival">Festival</option>
                      <option value="gift">Gift</option>
                      <option value="personal">Personal Use</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Timeline *</label>
                    <select 
                      required
                      value={formData.timeline}
                      onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                      className="input-field border border-gray-200 rounded-lg px-4"
                      data-testid="input-timeline"
                    >
                      <option value="">When do you need it?</option>
                      <option value="immediate">Within 1 week</option>
                      <option value="2-weeks">Within 2 weeks</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="2-months">Within 2 months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Special Requests (Optional)</label>
                  <textarea 
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    placeholder="Any customization requests, specific weight preferences, etc."
                    data-testid="input-message"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  data-testid="submit-order-intent"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Submit Order Intent
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  By submitting, you're expressing interest. We'll contact you to finalize design, confirm pricing, and arrange a consultation.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== ABOUT PAGE ====================
const AboutPage = () => {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    axios.get(`${API_URL}/api/goldsmith`).then(res => setProfile(res.data)).catch(() => {});
  }, []);
  
  if (!profile) return <div className="pt-20 min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div></div>;
  
  return (
    <div className="pt-20 min-h-screen" data-testid="about-page">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1659682699444-9ebad278fbd3?w=1920&q=80" 
            alt="Goldsmith workshop" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-900/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-white">
          <p className="font-accent italic text-gold text-lg mb-4">Our Legacy</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">{profile.name}</h1>
          <p className="text-xl text-gray-200 max-w-2xl">{profile.years_of_experience}+ years of crafting timeless jewellery</p>
        </div>
      </section>
      
      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-accent italic text-gold-dark mb-4">Our Story</p>
              <h2 className="font-display text-4xl font-bold text-emerald-900 mb-6">Three Generations of Excellence</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{profile.description}</p>
              <p className="text-gray-600 leading-relaxed">
                Every piece that leaves our workshop carries the weight of tradition and the precision of modern craftsmanship. 
                We believe in complete transparency – from gold sourcing to final pricing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {profile.gallery_images?.slice(0, 4).map((img, i) => (
                <div key={i} className={`${i === 0 ? 'col-span-2' : ''} overflow-hidden`}>
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Specializations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="font-accent italic text-gold-dark mb-4 text-center">What We Do Best</p>
          <h2 className="font-display text-4xl font-bold text-emerald-900 mb-12 text-center">Our Specializations</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profile.specializations?.map((spec, i) => (
              <div key={i} className="bg-white p-8 border-l-2 border-emerald-900 hover:shadow-hover transition-all">
                <Gem className="w-8 h-8 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold text-emerald-900">{spec}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-accent italic text-gold-dark mb-4">Trust & Quality</p>
              <h2 className="font-display text-4xl font-bold text-emerald-900 mb-6">Certifications & Awards</h2>
              <div className="space-y-4">
                {profile.certifications?.map((cert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-sm">
                    <ShieldCheck className="w-6 h-6 text-emerald-900" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-900 text-white p-12">
              <h3 className="font-display text-2xl font-bold mb-6">Visit Our Workshop</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gold mt-1" />
                  <p>{profile.location}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-gold" />
                  <p>{profile.contact_phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gold" />
                  <p>{profile.contact_email}</p>
                </div>
              </div>
              <Link to="/contact" className="mt-8 inline-block bg-gold text-emerald-900 hover:bg-gold-light rounded-full px-8 py-3 font-medium transition-all">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==================== EDUCATION PAGE ====================
const EducationPage = () => {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    axios.get(`${API_URL}/api/education`).then(res => setArticles(res.data.articles || [])).catch(() => {});
  }, []);
  
  const iconMap = { gem: Gem, 'shield-check': ShieldCheck, wrench: Wrench, info: Info };
  
  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="education-page">
      {/* Hero */}
      <section className="bg-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="font-accent italic text-gold mb-4">Knowledge Center</p>
          <h1 className="font-display text-5xl font-bold mb-4">Know Your Gold</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Understanding gold purity, hallmarks, and pricing helps you make informed decisions. We believe in educated customers.
          </p>
        </div>
      </section>
      
      {/* Articles */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            {articles.map((article, i) => {
              const IconComponent = iconMap[article.icon] || Info;
              return (
                <div key={article.id || i} className="bg-white p-8 hover:shadow-hover transition-shadow" data-testid={`article-${article.id}`}>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-emerald-900" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-emerald-900 mb-4">{article.title}</h2>
                  <div 
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-emerald-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-8">Our AI assistant can answer any questions about gold, pricing, or help you find the perfect piece.</p>
          <button 
            onClick={() => document.querySelector('[data-testid="chat-toggle"]')?.click()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> Ask Our AI
          </button>
        </div>
      </section>
    </div>
  );
};

// ==================== CONTACT PAGE ====================
const ContactPage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    axios.get(`${API_URL}/api/goldsmith`).then(res => setProfile(res.data)).catch(() => {});
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      toast.success(res.data.message);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };
  
  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="contact-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <p className="font-accent italic text-gold-dark mb-4">Get in Touch</p>
            <h1 className="font-display text-5xl font-bold text-emerald-900 mb-6">Contact Us</h1>
            <p className="text-gray-600 mb-12 leading-relaxed">
              Whether you have a question about our pieces, need guidance on choosing the right jewellery, 
              or want to discuss a custom order – we're here to help.
            </p>
            
            {profile && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white">
                  <MapPin className="w-6 h-6 text-emerald-900 mt-1" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Visit Our Workshop</h3>
                    <p className="text-gray-600">{profile.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-white">
                  <Phone className="w-6 h-6 text-emerald-900 mt-1" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Call Us</h3>
                    <p className="text-gray-600">{profile.contact_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-white">
                  <Mail className="w-6 h-6 text-emerald-900 mt-1" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Email Us</h3>
                    <p className="text-gray-600">{profile.contact_email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-8 lg:p-12">
            <h2 className="font-display text-2xl font-semibold text-emerald-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email *</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    data-testid="contact-email"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone *</label>
                  <input 
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    data-testid="contact-phone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Subject *</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-field border border-gray-200 rounded-lg px-4"
                    data-testid="contact-subject"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="custom">Custom Order</option>
                    <option value="pricing">Pricing Question</option>
                    <option value="visit">Schedule Visit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message *</label>
                <textarea 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="input-field border border-gray-200 rounded-lg px-4"
                  placeholder="Tell us what you're looking for..."
                  data-testid="contact-message"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
                data-testid="contact-submit"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== AI CHAT WIDGET ====================
const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = React.useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        session_id: sessionId
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting. Please try again or contact us directly." 
      }]);
    }
    setLoading(false);
  };
  
  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isOpen ? 'bg-gray-800 rotate-0' : 'bg-emerald-900 hover:bg-emerald-800'
        }`}
        data-testid="chat-toggle"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] glass rounded-lg shadow-glass flex flex-col overflow-hidden" data-testid="chat-window">
          {/* Header */}
          <div className="bg-emerald-900 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
                <Gem className="w-5 h-5 text-emerald-900" />
              </div>
              <div>
                <h3 className="font-semibold">Jewellery Assistant</h3>
                <p className="text-xs text-gray-300">AI-powered recommendations</p>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Gem className="w-12 h-12 mx-auto mb-4 text-gold" />
                <p className="font-medium">Welcome!</p>
                <p className="text-sm">Ask me about jewellery, pricing, or recommendations.</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-emerald-900 text-white' 
                    : 'bg-white border border-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about jewellery..."
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-emerald-900"
                data-testid="chat-input"
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 bg-emerald-900 text-white rounded-full hover:bg-emerald-800 transition-colors disabled:opacity-50"
                data-testid="chat-send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== FOOTER ====================
const Footer = () => {
  return (
    <footer className="bg-emerald-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
                <Gem className="w-5 h-5 text-emerald-900" />
              </div>
              <span className="font-display text-xl font-semibold">Heritage Gold</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Three generations of master goldsmiths crafting timeless pieces with transparency and trust.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'twitter'].map(social => (
                <a key={social} href="#" className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                  <span className="sr-only">{social}</span>
                  <Gem className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Collection', path: '/catalogue' },
                { name: 'About Us', path: '/about' },
                { name: 'Know Your Gold', path: '/education' },
                { name: 'Contact', path: '/contact' }
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5" />
                <span>Jewellery Lane, T. Nagar, Chennai - 600017</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold" />
                <span>contact@heritagegold.in</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Heritage Gold Artisans. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Powered by AI • Prices are estimates only
          </p>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN APP ====================
function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen">
          <Toaster position="top-right" richColors />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Footer />
          <AIChatWidget />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
