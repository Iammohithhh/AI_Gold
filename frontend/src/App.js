import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
  Menu, X, ShoppingBag, Phone, Mail, MapPin,
  ChevronRight, Star, Shield, Award, Gem, Info, Wrench, ShieldCheck,
  Send, ArrowRight, Filter, Search, Plus, Minus, Trash2,
  Sparkles, Heart, Gift, PartyPopper, User, Scale, AlertCircle,
  CheckCircle2, ChevronLeft, RefreshCw
} from 'lucide-react';
import axios from 'axios';

// API URL - set REACT_APP_BACKEND_URL in Vercel environment variables
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Show warning in development if API URL is not configured
if (!API_URL && process.env.NODE_ENV === 'development') {
  console.warn('REACT_APP_BACKEND_URL is not set. API calls will fail.');
}

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
    { name: 'Find Your Jewellery', path: '/guided-selection' },
    { name: 'Collection', path: '/catalogue' },
    { name: 'Old Gold Exchange', path: '/old-gold-exchange' },
    { name: 'About', path: '/about' },
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
            <span className="font-display text-xl font-semibold text-emerald-900">Hari Jewellery Works</span>
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

// ==================== PRICE TICKER (Currently unused in V1) ====================
// Keeping for potential future use
/*
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
    const interval = setInterval(fetchPrices, 300000);
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
          </div>
        ))}
      </div>
    </div>
  );
};
*/

// ==================== HOME PAGE ====================
const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [profile, setProfile] = useState(null);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jewelleryRes, profileRes, pricesRes] = await Promise.all([
          axios.get(`${API_URL}/api/jewellery?featured=true`),
          axios.get(`${API_URL}/api/goldsmith`),
          axios.get(`${API_URL}/api/gold-price`)
        ]);
        setFeatured(jewelleryRes.data.items || []);
        setProfile(profileRes.data);
        setPrices(pricesRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section - Decision Entry Point */}
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
            <p className="font-accent italic text-gold-dark text-lg mb-4">Crafted with Heritage Since 2000</p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-emerald-900 leading-tight mb-6">
              Find Your <br />
              <span className="italic">Perfect Piece</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Not sure where to start? Let us guide you to the perfect jewellery
              based on your occasion, budget, and style preferences.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/guided-selection" className="btn-primary flex items-center gap-2 text-lg px-8 py-4" data-testid="help-me-choose-btn">
                <Sparkles className="w-5 h-5" /> Help Me Choose Jewellery
              </Link>
              <Link to="/catalogue" className="btn-secondary flex items-center gap-2" data-testid="browse-collection-btn">
                Browse Full Collection <ArrowRight className="w-4 h-4" />
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
              { icon: Award, label: 'Experience', value: '25+ Years' },
              { icon: Star, label: 'Happy Customers', value: '1000+' },
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

      {/* How It Works - Guided Selection Teaser */}
      <section className="py-20 bg-gray-50" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="font-accent italic text-gold-dark mb-2">Simple & Personal</p>
            <h2 className="font-display text-4xl font-bold text-emerald-900 mb-4">How We Help You Choose</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Answer a few simple questions and we'll show you exactly 2-3 perfect pieces for your needs. No overwhelming catalogues.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { step: '1', title: 'Occasion', desc: 'Wedding, Daily, Festival, or Gift?', icon: PartyPopper },
              { step: '2', title: 'Budget', desc: 'Set your comfortable range', icon: Scale },
              { step: '3', title: 'For Whom', desc: 'Self, Wife, Daughter, or Mother?', icon: Heart },
              { step: '4', title: 'Style', desc: 'Light, Medium, or Heavy?', icon: Sparkles }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 mx-auto text-gold mt-4 mb-3" />
                <h3 className="font-display text-lg font-semibold text-emerald-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/guided-selection" className="btn-primary inline-flex items-center gap-2" data-testid="start-guided-btn">
              <Sparkles className="w-5 h-5" /> Start Guided Selection
            </Link>
          </div>
        </div>
      </section>

      {/* Live Gold Price - De-emphasized */}
      {prices && (
        <section className="py-8 bg-white border-y border-gray-100" data-testid="price-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
              <span className="text-gray-500">Today's Gold Rates:</span>
              <span className="flex items-center gap-2">
                <span className="text-gold">●</span>
                <span className="text-gray-700">24K: ₹{prices.gold_24k?.toLocaleString()}/g</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gold">●</span>
                <span className="text-gray-700">22K: ₹{prices.gold_22k?.toLocaleString()}/g</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gold">●</span>
                <span className="text-gray-700">18K: ₹{prices.gold_18k?.toLocaleString()}/g</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section className="py-20 bg-gray-50" data-testid="featured-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="font-accent italic text-gold-dark mb-2">Popular Choices</p>
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

      {/* Old Gold Exchange Teaser */}
      <section className="py-20 bg-emerald-900 text-white" data-testid="old-gold-section">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-6 text-gold" />
          <h2 className="font-display text-4xl font-bold mb-6">Have Old Gold?</h2>
          <p className="text-lg text-gray-300 mb-8">
            See what you can make from your existing gold. Our exchange calculator helps you
            visualize possibilities before visiting the shop.
          </p>
          <Link
            to="/old-gold-exchange"
            className="bg-gold text-emerald-900 hover:bg-gold-light rounded-full px-8 py-3 font-medium transition-all inline-flex items-center gap-2"
            data-testid="old-gold-cta-btn"
          >
            <RefreshCw className="w-5 h-5" /> Try Old Gold Calculator
          </Link>
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

// ==================== GUIDED SELECTION PAGE (CORE V1) ====================
const GuidedSelectionPage = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    occasion: '',
    budget: { min: 50000, max: 200000 },
    recipient: '',
    preference: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/gold-price`).then(res => setPrices(res.data)).catch(() => {});
  }, []);

  const occasions = [
    { id: 'wedding', label: 'Wedding', icon: Heart, desc: 'For the big day or related ceremonies' },
    { id: 'daily', label: 'Daily Wear', icon: Sparkles, desc: 'Elegant pieces for everyday beauty' },
    { id: 'festival', label: 'Festival', icon: PartyPopper, desc: 'Special occasions and celebrations' },
    { id: 'gift', label: 'Gift', icon: Gift, desc: 'A meaningful present for someone special' }
  ];

  const recipients = [
    { id: 'self', label: 'For Myself', icon: User },
    { id: 'wife', label: 'For Wife', icon: Heart },
    { id: 'daughter', label: 'For Daughter', icon: Heart },
    { id: 'mother', label: 'For Mother', icon: Heart }
  ];

  const preferences = [
    { id: 'light', label: 'Light', desc: 'Delicate & subtle', weightRange: '5-15g' },
    { id: 'medium', label: 'Medium', desc: 'Balanced & versatile', weightRange: '15-35g' },
    { id: 'heavy', label: 'Heavy', desc: 'Bold & statement', weightRange: '35g+' }
  ];

  const budgetPresets = [
    { label: 'Under ₹1L', min: 0, max: 100000 },
    { label: '₹1L - ₹2L', min: 100000, max: 200000 },
    { label: '₹2L - ₹5L', min: 200000, max: 500000 },
    { label: '₹5L+', min: 500000, max: 2000000 }
  ];

  const handleSelect = (field, value) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      findMatches();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selections.occasion;
      case 2: return selections.budget.min >= 0;
      case 3: return !!selections.recipient;
      case 4: return !!selections.preference;
      default: return false;
    }
  };

  const getEstimateForItem = (item) => {
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

  const findMatches = async () => {
    setLoading(true);
    try {
      // Build filter params based on selections
      const params = new URLSearchParams();
      if (selections.occasion) params.append('occasion', selections.occasion);

      // Map recipient to gender preference
      if (selections.recipient === 'self') {
        // Don't filter by gender for self
      } else {
        params.append('gender', 'female'); // wife/daughter/mother are all female
      }

      const res = await axios.get(`${API_URL}/api/jewellery?${params}`);
      let items = res.data.items || [];

      // Filter by budget
      items = items.filter(item => {
        const estimate = getEstimateForItem(item);
        return estimate >= selections.budget.min && estimate <= selections.budget.max;
      });

      // Filter by weight preference
      items = items.filter(item => {
        const avgWeight = (item.weight_min + item.weight_max) / 2;
        switch (selections.preference) {
          case 'light': return avgWeight <= 15;
          case 'medium': return avgWeight > 15 && avgWeight <= 35;
          case 'heavy': return avgWeight > 35;
          default: return true;
        }
      });

      // Return only top 3 results
      setResults(items.slice(0, 3));
      setStep(5); // Results step
    } catch (err) {
      toast.error('Failed to find matches. Please try again.');
    }
    setLoading(false);
  };

  const resetSelection = () => {
    setSelections({
      occasion: '',
      budget: { min: 50000, max: 200000 },
      recipient: '',
      preference: ''
    });
    setResults([]);
    setStep(1);
  };

  const progressPercentage = step <= 4 ? (step / 4) * 100 : 100;

  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="guided-selection-page">
      {/* Header */}
      <div className="bg-emerald-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-gold" />
          <h1 className="font-display text-4xl font-bold mb-4">Find Your Perfect Jewellery</h1>
          <p className="text-gray-300">Answer a few questions and we'll show you exactly what fits your needs</p>
        </div>
      </div>

      {/* Progress Bar */}
      {step <= 4 && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Step {step} of 4</span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-900 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Occasion */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="font-display text-3xl font-bold text-emerald-900 mb-2 text-center">What's the occasion?</h2>
            <p className="text-gray-600 mb-8 text-center">This helps us show you the most appropriate designs</p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {occasions.map(occ => (
                <button
                  key={occ.id}
                  onClick={() => handleSelect('occasion', occ.id)}
                  className={`p-6 text-left border-2 rounded-lg transition-all ${
                    selections.occasion === occ.id
                      ? 'border-emerald-900 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selections.occasion === occ.id ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <occ.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-emerald-900">{occ.label}</h3>
                      <p className="text-sm text-gray-600">{occ.desc}</p>
                    </div>
                    {selections.occasion === occ.id && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-900 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="font-display text-3xl font-bold text-emerald-900 mb-2 text-center">What's your budget?</h2>
            <p className="text-gray-600 mb-8 text-center">Select a range that feels comfortable for you</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {budgetPresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleSelect('budget', { min: preset.min, max: preset.max })}
                  className={`p-4 text-center border-2 rounded-lg transition-all ${
                    selections.budget.min === preset.min && selections.budget.max === preset.max
                      ? 'border-emerald-900 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <p className="font-semibold text-emerald-900">{preset.label}</p>
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Or set custom range:</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Min (₹)</label>
                  <input
                    type="number"
                    value={selections.budget.min}
                    onChange={(e) => handleSelect('budget', { ...selections.budget, min: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-900"
                    step={10000}
                  />
                </div>
                <span className="text-gray-400 pt-5">to</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Max (₹)</label>
                  <input
                    type="number"
                    value={selections.budget.max}
                    onChange={(e) => handleSelect('budget', { ...selections.budget, max: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-900"
                    step={10000}
                  />
                </div>
              </div>
              <p className="text-center mt-4 text-lg font-semibold text-emerald-900">
                ₹{selections.budget.min.toLocaleString()} - ₹{selections.budget.max.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Recipient */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="font-display text-3xl font-bold text-emerald-900 mb-2 text-center">Who is it for?</h2>
            <p className="text-gray-600 mb-8 text-center">This helps us suggest the right style and type</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {recipients.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => handleSelect('recipient', rec.id)}
                  className={`p-6 text-center border-2 rounded-lg transition-all ${
                    selections.recipient === rec.id
                      ? 'border-emerald-900 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <rec.icon className={`w-8 h-8 mx-auto mb-3 ${
                    selections.recipient === rec.id ? 'text-emerald-900' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold text-emerald-900">{rec.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preference */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="font-display text-3xl font-bold text-emerald-900 mb-2 text-center">What style do you prefer?</h2>
            <p className="text-gray-600 mb-8 text-center">Choose based on how prominent you want the piece to be</p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {preferences.map(pref => (
                <button
                  key={pref.id}
                  onClick={() => handleSelect('preference', pref.id)}
                  className={`p-6 text-center border-2 rounded-lg transition-all ${
                    selections.preference === pref.id
                      ? 'border-emerald-900 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  {/* Visual weight indicator */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-4 rounded-full transition-all ${
                          (pref.id === 'light' && i <= 1) ||
                          (pref.id === 'medium' && i <= 2) ||
                          (pref.id === 'heavy' && i <= 3)
                            ? 'bg-gold h-8'
                            : 'bg-gray-200 h-8'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-emerald-900 mb-1">{pref.label}</h3>
                  <p className="text-sm text-gray-600 mb-2">{pref.desc}</p>
                  <p className="text-xs text-gray-400">{pref.weightRange}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
              <h2 className="font-display text-3xl font-bold text-emerald-900 mb-2">
                {results.length > 0 ? 'Here Are Your Perfect Matches' : 'No Exact Matches Found'}
              </h2>
              <p className="text-gray-600">
                {results.length > 0
                  ? `Based on your preferences, we found ${results.length} perfect piece${results.length > 1 ? 's' : ''} for you`
                  : 'Try adjusting your budget or preferences, or browse our full collection'}
              </p>
            </div>

            {/* Selection Summary */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8">
              <p className="text-sm text-gray-500 mb-2">Your selections:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full capitalize">{selections.occasion}</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full">₹{(selections.budget.min/1000).toFixed(0)}K - ₹{(selections.budget.max/1000).toFixed(0)}K</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full capitalize">{selections.recipient}</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full capitalize">{selections.preference}</span>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {results.map((item, i) => (
                  <ProductCard key={item.item_id} item={item} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg mb-8">
                <Gem className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No items match your exact criteria</p>
                <Link to="/catalogue" className="btn-primary inline-flex items-center gap-2">
                  Browse Full Collection <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={resetSelection} className="btn-secondary flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
              <Link to="/catalogue" className="btn-ghost flex items-center justify-center gap-2">
                Browse All Designs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step <= 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${
                canProceed()
                  ? 'bg-emerald-900 text-white hover:bg-emerald-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding Matches...
                </>
              ) : step === 4 ? (
                <>
                  <Sparkles className="w-5 h-5" /> Show My Matches
                </>
              ) : (
                <>
                  Continue <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== OLD GOLD EXCHANGE PAGE ====================
const OldGoldExchangePage = () => {
  const [oldGoldWeight, setOldGoldWeight] = useState(10);
  const [jewelleryType, setJewelleryType] = useState('necklace');
  const [prices, setPrices] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/gold-price`).then(res => setPrices(res.data)).catch(() => {});
  }, []);

  const jewelleryTypes = [
    { id: 'necklace', label: 'Necklace', minWeight: 15, typicalWeight: { light: 20, medium: 40, heavy: 70 } },
    { id: 'bangles', label: 'Bangles (pair)', minWeight: 10, typicalWeight: { light: 15, medium: 25, heavy: 40 } },
    { id: 'chain', label: 'Chain', minWeight: 8, typicalWeight: { light: 12, medium: 25, heavy: 40 } },
    { id: 'earrings', label: 'Earrings', minWeight: 3, typicalWeight: { light: 5, medium: 10, heavy: 15 } },
    { id: 'ring', label: 'Ring', minWeight: 2, typicalWeight: { light: 4, medium: 6, heavy: 10 } }
  ];

  const calculateExchange = () => {
    if (!prices || oldGoldWeight <= 0) return;

    const selectedType = jewelleryTypes.find(t => t.id === jewelleryType);
    const goldRate22K = prices.gold_22k;
    const oldGoldValue = oldGoldWeight * goldRate22K * 0.95; // 5% melting loss assumed

    // Calculate what can be made
    const possibilities = {
      light: {
        possible: oldGoldWeight >= selectedType.typicalWeight.light * 0.8,
        extraGoldNeeded: Math.max(0, selectedType.typicalWeight.light - oldGoldWeight),
        estimateMin: (selectedType.typicalWeight.light * goldRate22K * 0.9) + (selectedType.typicalWeight.light * 500),
        estimateMax: (selectedType.typicalWeight.light * goldRate22K * 1.1) + (selectedType.typicalWeight.light * 700)
      },
      medium: {
        possible: oldGoldWeight >= selectedType.typicalWeight.medium * 0.6,
        extraGoldNeeded: Math.max(0, selectedType.typicalWeight.medium - oldGoldWeight),
        estimateMin: (selectedType.typicalWeight.medium * goldRate22K * 0.9) + (selectedType.typicalWeight.medium * 500),
        estimateMax: (selectedType.typicalWeight.medium * goldRate22K * 1.1) + (selectedType.typicalWeight.medium * 700)
      },
      heavy: {
        possible: oldGoldWeight >= selectedType.typicalWeight.heavy * 0.4,
        extraGoldNeeded: Math.max(0, selectedType.typicalWeight.heavy - oldGoldWeight),
        estimateMin: (selectedType.typicalWeight.heavy * goldRate22K * 0.9) + (selectedType.typicalWeight.heavy * 500),
        estimateMax: (selectedType.typicalWeight.heavy * goldRate22K * 1.1) + (selectedType.typicalWeight.heavy * 700)
      }
    };

    setResult({
      oldGoldValue,
      selectedType,
      possibilities
    });
  };

  useEffect(() => {
    calculateExchange();
  }, [oldGoldWeight, jewelleryType, prices]);

  return (
    <div className="pt-20 min-h-screen bg-gray-50" data-testid="old-gold-exchange-page">
      {/* Header */}
      <div className="bg-emerald-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RefreshCw className="w-10 h-10 mx-auto mb-4 text-gold" />
          <h1 className="font-display text-4xl font-bold mb-4">Old Gold to New Look</h1>
          <p className="text-gray-300">See what you can create from your existing gold jewellery</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-800 font-medium">For Planning & Visualization Only</p>
            <p className="text-sm text-amber-700">
              Final design, weight, and price will be confirmed in shop after evaluating your actual gold.
              This calculator provides approximate estimates to help you plan your visit.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="font-display text-xl font-semibold text-emerald-900 mb-6">Your Old Gold</h2>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Weight (grams)</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOldGoldWeight(Math.max(1, oldGoldWeight - 5))}
                  className="p-2 border border-emerald-900 rounded-full hover:bg-emerald-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={oldGoldWeight}
                  onChange={(e) => setOldGoldWeight(Math.max(1, Number(e.target.value)))}
                  className="w-24 text-center font-semibold text-2xl bg-white border border-gray-200 rounded-lg py-2"
                />
                <button
                  onClick={() => setOldGoldWeight(oldGoldWeight + 5)}
                  className="p-2 border border-emerald-900 rounded-full hover:bg-emerald-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-gray-500">grams</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={oldGoldWeight}
                onChange={(e) => setOldGoldWeight(Number(e.target.value))}
                className="w-full mt-4 accent-emerald-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">What would you like to make?</label>
              <div className="grid grid-cols-2 gap-2">
                {jewelleryTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setJewelleryType(type.id)}
                    className={`p-3 text-sm border-2 rounded-lg transition-all ${
                      jewelleryType === type.id
                        ? 'border-emerald-900 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {prices && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Estimated value of your old gold (22K)</p>
                <p className="text-2xl font-display font-bold text-emerald-900">
                  ₹{Math.round(oldGoldWeight * prices.gold_22k * 0.95).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">*After ~5% melting/processing adjustment</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="font-display text-xl font-semibold text-emerald-900 mb-6">What You Can Make</h2>

            {result && (
              <div className="space-y-4">
                {['light', 'medium', 'heavy'].map(thickness => {
                  const possibility = result.possibilities[thickness];
                  const typicalWeight = result.selectedType.typicalWeight[thickness];

                  return (
                    <div
                      key={thickness}
                      className={`p-4 rounded-lg border-2 ${
                        possibility.possible ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* Visual thickness bar */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(i => (
                              <div
                                key={i}
                                className={`w-2 rounded-full ${
                                  (thickness === 'light' && i <= 1) ||
                                  (thickness === 'medium' && i <= 2) ||
                                  (thickness === 'heavy')
                                    ? 'bg-gold h-6'
                                    : 'bg-gray-300 h-6'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold capitalize">{thickness}</span>
                          <span className="text-sm text-gray-500">({typicalWeight}g typical)</span>
                        </div>
                        {possibility.possible ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <span className="text-xs text-gray-400">Need more gold</span>
                        )}
                      </div>

                      {possibility.extraGoldNeeded > 0 && (
                        <p className="text-sm text-amber-600 mb-2">
                          Extra gold needed: ~{Math.round(possibility.extraGoldNeeded)}g
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        Approx. price range:
                        <span className="font-semibold text-emerald-900 ml-1">
                          ₹{Math.round(possibility.estimateMin).toLocaleString()} - ₹{Math.round(possibility.estimateMax).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center bg-white p-8 rounded-lg border border-gray-200">
          <h3 className="font-display text-xl font-semibold text-emerald-900 mb-3">Ready to Transform Your Gold?</h3>
          <p className="text-gray-600 mb-6">
            Visit our shop with your old gold for an accurate evaluation and to see our designs in person.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Contact Us
            </Link>
            <Link to="/catalogue" className="btn-secondary inline-flex items-center justify-center gap-2">
              Browse Designs <ArrowRight className="w-4 h-4" />
            </Link>
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
      {/* Guided Selection Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-900" />
              <p className="text-emerald-900">
                <span className="font-medium">Not sure what to choose?</span>
                <span className="hidden sm:inline"> Let us help you find the perfect piece.</span>
              </p>
            </div>
            <Link to="/guided-selection" className="text-sm font-medium text-emerald-900 hover:text-emerald-700 flex items-center gap-1">
              Try Guided Selection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h1 className="font-display text-4xl font-bold text-emerald-900 mb-4">Our Collection</h1>
          <p className="text-gray-600">Browse all designs for experienced buyers. Use filters to narrow down your search.</p>
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
  const [selectedImage, setSelectedImage] = useState(0);
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
      } catch (err) {
        toast.error('Failed to load product');
      }
    };
    fetchData();
  }, [itemId]);

  // Calculate price range (min and max)
  const getPriceRange = () => {
    if (!prices || !item) return { min: 0, max: 0 };
    const purityMap = { '24K': prices.gold_24k, '22K': prices.gold_22k, '18K': prices.gold_18k };
    const goldRate = purityMap[item.purity] || prices.gold_22k;

    const calcPrice = (weight) => {
      const goldValue = goldRate * weight;
      const labour = item.labour_cost_per_gram * weight;
      const subtotal = goldValue + labour;
      const gst = subtotal * 0.03;
      return Math.round(subtotal + gst);
    };

    return {
      min: calcPrice(item.weight_min),
      max: calcPrice(item.weight_max)
    };
  };

  const priceRange = getPriceRange();
  const avgEstimate = Math.round((priceRange.min + priceRange.max) / 2);

  if (!item) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={item.images?.[selectedImage] || item.images?.[0] || 'https://via.placeholder.com/800'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {item.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-gray-100 overflow-hidden transition-all ${
                      selectedImage === i ? 'ring-2 ring-emerald-900' : 'hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt={`${item.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-sm rounded-full capitalize">{item.type}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize">{item.occasion}</span>
              <span className="px-3 py-1 bg-gold/20 text-gold-dark text-sm rounded-full">{item.purity}</span>
            </div>

            <h1 className="font-display text-4xl font-bold text-emerald-900 mb-4">{item.name}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{item.description}</p>

            {/* Simplified Price Display */}
            <div className="bg-emerald-50 p-6 rounded-lg mb-8" data-testid="price-display">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm text-gray-600">Approximate Price Range</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-emerald-900">
                  ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Final price varies based on exact weight and gold rates at time of purchase. Visit shop for accurate pricing.
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Weight Range</p>
                <p className="font-semibold">{item.weight_min}g - {item.weight_max}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purity</p>
                <p className="font-semibold">{item.purity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Craftsmanship</p>
                <p className="font-semibold capitalize">{item.making_complexity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Suitable For</p>
                <p className="font-semibold capitalize">{item.occasion}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => addToCart(item, avgEstimate)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                data-testid="add-to-selection-btn"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Selection
              </button>
              <Link to="/contact" className="btn-secondary flex items-center gap-2" data-testid="inquire-btn">
                <Phone className="w-5 h-5" /> Inquire
              </Link>
            </div>

            {/* Comparison Helper */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Comparing designs?</span> Add multiple pieces to your selection and we'll help you decide at the shop.
              </p>
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
          <p className="text-xl text-gray-200 max-w-2xl"> 25+ years of crafting timeless jewellery</p>
        </div>
      </section>
      
      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-accent italic text-gold-dark mb-4">Our Story</p>
              <h2 className="font-display text-4xl font-bold text-emerald-900 mb-6">Built on Trust & Craftsmanship</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                  With over 25 years of hands-on experience, our journey began in a single goldsmith workshop built on trust and craftsmanship. Today, we are reimagining that same craft through a modern, guided jewellery experience—making it easier for families to choose, plan, and create jewellery with confidence.
              </p>
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
          {[
            'Custom Gold Jewellery',
            'Old Gold Remodelling',
            'Traditional & Daily Wear Designs',
            'Hallmarked Quality Craftsmanship'
          ].map((spec, i) => (
            <div key={i} className="bg-white p-8 border-l-2 border-emerald-900 hover:shadow-hover transition-all">
              <Gem className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-emerald-900">{spec}</h3>
            </div>
          ))}
          </div>
        </div>
      </section>


      {/* Visit Workshop */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-emerald-900 text-white p-12 rounded-lg max-w-2xl mx-auto text-center">
            <h3 className="font-display text-3xl font-bold mb-8">Visit Our Workshop</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 justify-center">
                <MapPin className="w-6 h-6 text-gold mt-1 flex-shrink-0" />
                <p className="text-left">Gangamma Temple Road, Gajaana Circle,<br />Chintamani, Karnataka</p>
              </div>
              <div className="flex items-center gap-4 justify-center">
                <Phone className="w-6 h-6 text-gold flex-shrink-0" />
                <a href="tel:+919901907349" className="hover:text-gold transition-colors">+91 9901907349</a>
              </div>
              <div className="flex items-center gap-4 justify-center">
                <Mail className="w-6 h-6 text-gold flex-shrink-0" />
                <p>{profile.contact_email}</p>
              </div>
            </div>
            <Link to="/contact" className="mt-8 inline-block bg-gold text-emerald-900 hover:bg-gold-light rounded-full px-8 py-3 font-medium transition-all">
              Contact Us
            </Link>
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
          <p className="text-gray-600 mb-8">Get in touch with us and we'll help you understand everything about gold jewellery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" /> Contact Us
            </Link>
            <Link to="/guided-selection" className="btn-secondary inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Find Your Jewellery
            </Link>
          </div>
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
                <div>
                <div className="flex items-start gap-4 p-6 bg-white">
                  <MapPin className="w-6 h-6 text-emerald-900 mt-1" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Visit Our Workshop</h3>
                    <p className="text-gray-600">Gangamma Temple Road, Gajaana Circle,<br />Chintamani, Karnataka</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-white">
                  <Phone className="w-6 h-6 text-emerald-900 mt-1" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-1">Call Us</h3>
                    <a href="tel:+919901907349" className="text-gray-600 hover:text-emerald-900 transition-colors">+91 9901907349</a>
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

// ==================== AI CHAT WIDGET (Hidden for V1) ====================
// Keeping the component code for potential future use
/*
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isOpen ? 'bg-gray-800 rotate-0' : 'bg-emerald-900 hover:bg-emerald-800'
        }`}
        data-testid="chat-toggle"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] glass rounded-lg shadow-glass flex flex-col overflow-hidden" data-testid="chat-window">
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
*/

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
              <span className="font-display text-xl font-semibold">Hari Jewellery Works</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
                25+ years of trusted craftsmanship, making it easier for families to choose and create jewellery with confidence.
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
                { name: 'Find Your Jewellery', path: '/guided-selection' },
                { name: 'Collection', path: '/catalogue' },
                { name: 'Old Gold Exchange', path: '/old-gold-exchange' },
                { name: 'About Us', path: '/about' },
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
                <span>Gangamma Temple Road, Gajaana Circle, Chintamani, Karnataka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold" />
                <a href="tel:+919901907349" className="hover:text-gold transition-colors">+91 9901907349</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold" />
                <a
                  href="mailto:contact@mohithh20@gmail.com"
                  className="hover:text-gold transition-colors"
                >
                  contact@mohithh20@gmail.com
                </a>

              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Hari Jewellery Works. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Guided jewellery experience • Prices are estimates only

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
            <Route path="/guided-selection" element={<GuidedSelectionPage />} />
            <Route path="/old-gold-exchange" element={<OldGoldExchangePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Footer />
          {/* AI Chat Widget hidden for V1 - can be re-enabled later */}
          {/* <AIChatWidget /> */}
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
