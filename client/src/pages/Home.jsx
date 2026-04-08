import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RotateCcw, Heart, Image, Building2, Package, Star, MessageSquare, Instagram, CheckCircle } from 'lucide-react';
import { productAPI, categoryAPI, testimonialAPI, settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { wishlistAPI } from '../services/api';

/* ── Static Fallback Data ─────────────────────────────────────────── */


/* ── Component ────────────────────────────────────── */

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [currentReview, setCurrentReview] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, featuredRes, categoriesRes, testimonialsRes, settingsRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getFeatured(),
          categoryAPI.getAll(),
          testimonialAPI.getAll(),
          settingsAPI.get()
        ]);
        setProducts(productsRes.data?.filter(p => p.active !== false) || []);
        setFeaturedProducts(featuredRes.data?.filter(p => p.active !== false) || []);
        setCategories(categoriesRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setSettings(settingsRes.data || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % testimonials.length);
      }, 5000); // changes review every 5 seconds
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await wishlistAPI.getAll();
          setWishlistCount(response.data?.length || 0);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
        }
      }
    };
    fetchWishlistCount();
  }, [isAuthenticated]);

  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) {
      return item.image;
    }
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  const getImageCount = (item) => {
    if (item.images && Array.isArray(item.images)) {
      return item.images.length;
    }
    return item.image ? 1 : 0;
  };

  // Calculate discount percentage
  const getDiscountPercent = (item) => {
    if (item.comparePrice && item.price && item.comparePrice > item.price) {
      return Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100);
    }
    return 0;
  };

  const getCategoryImage = (item) => {
    if (item.image && item.image.startsWith('http')) return item.image;
    if (item.image) return `${import.meta.env.VITE_BACKEND_URL_PRODUCT_CATEGORY}/${item.image}`;
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  const displayCategories = categories.map(c => ({
    ...c,
    image: getCategoryImage(c)
  }));

  const apiFeatured = featuredProducts.slice(0, 8);
  const displayFeatured = apiFeatured.map(p => ({
    ...p,
    image: getImageUrl(p)
  }));

  const apiNewArrivals = [...products].reverse().slice(0, 8);
  const displayNewArrivals = apiNewArrivals.map(p => ({
    ...p,
    image: getImageUrl(p)
  }));

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>

      <Header 
        wishlistCount={wishlistCount}
        navLinks={[
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Collections', path: '/shop' },
          { name: 'About', path: '/about' }
        ]}
        showAuthButtons={true}
        showSearch={true}
      />

      {/* ── Hero ── */}
      <section className="relative h-[50vh] min-h-[250px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&h=1080&fit=crop"
          alt="Beautiful Handcrafted Pottery"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-light leading-[1.1] text-background mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Handmade By <span className="text-accent italic">Syeda DuaeZahra</span>
          </h1>
          <p className="text-background/80 text-lg mb-8 max-w-md">
            Each piece is handmade with care to add warmth and beauty to your home
          </p>
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Explore Collection
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          Shop by Category
        </h2>
        {displayCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {displayCategories.map((cat, idx) => (
               <Link key={cat._id || idx} to={`/shop?category=${cat._id || cat.name}`} className="group relative rounded-xl overflow-hidden aspect-square">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-background text-sm sm:text-base font-semibold tracking-wide">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No categories available</p>
            <p className="text-muted-foreground text-sm mt-2">Check back later for our collection categories</p>
          </div>
        )}
      </section>

      {/* ── Featured Pieces ── */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-accent text-sm font-medium uppercase tracking-widest mb-1">Featured</p>
            <h2 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Featured Pieces</h2>
            <p className="text-muted-foreground mt-2">Handpicked for you</p>
          </div>
          {displayFeatured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayFeatured.map((product, idx) => (
                <Link key={product._id || idx} to={`/product/${product._id || product.name}`} className="group block">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-square bg-muted mb-3">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.isNew && (
                      <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    {/* Discount Badge */}
                    {getDiscountPercent(product) > 0 && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        -{getDiscountPercent(product)}% OFF
                      </span>
                    )}
                    {/* Multiple Images Indicator */}
                    {getImageCount(product) > 1 && (
                      <span className="absolute bottom-3 left-3 bg-background/80 text-foreground text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                        <Image size={10} />
                        {getImageCount(product)}
                      </span>
                    )}
                    <button className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.preventDefault(); }}>
                      <Heart size={14} />
                    </button>
                  </div>
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold">Rs.{product.price}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">Rs.{product.comparePrice}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No featured products available</p>
              <p className="text-muted-foreground text-sm mt-2">Check back later for our featured collection</p>
            </div>
          )}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-medium uppercase tracking-widest mb-1">New Arrivals</p>
          <h2 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Latest Creations</h2>
        </div>
        {displayNewArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayNewArrivals.map((product, idx) => (
              <Link key={product._id || idx} to={`/product/${product._id || product.name}`} className="group block">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-square bg-muted mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Discount Badge */}
                  {getDiscountPercent(product) > 0 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      -{getDiscountPercent(product)}% OFF
                    </span>
                  )}
                  {/* Multiple Images Indicator */}
                  {getImageCount(product) > 1 && (
                    <span className="absolute bottom-3 left-3 bg-background/80 text-foreground text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                      <Image size={10} />
                      {getImageCount(product)}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.preventDefault(); }}>
                    <Heart size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold">Rs.{product.price}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through">Rs.{product.comparePrice}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available</p>
            <p className="text-muted-foreground text-sm mt-2">Check back later for our latest arrivals</p>
          </div>
        )}
      </section>

      {/* ── Brand Promises & Customization ── */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-bold uppercase tracking-[0.2em] mb-4">The Dua Standards</p>
            <h2 className="text-4xl sm:text-5xl font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Why Shop With <span className="text-accent italic">Dua</span>
            </h2>
            <div className="w-24 h-1 bg-accent/30 mx-auto rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {[
              { icon: <Star size={32} />, title: "Repeated Customer", desc: "Loyalty pays! Get 10% off on your next direct purchase." },
              { icon: <Shield size={32} />, title: "Careful Packaging", desc: "Each item is securely double-wrapped for a safe journey." },
              { icon: <Package size={32} />, title: "Prepaid Order", desc: "Spend Rs. 3499 or more and enjoy complimentary shipping." },
              { icon: <Truck size={32} />, title: "Nationwide Delivery", desc: "Reliable distribution to every corner of Pakistan." }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-background/50 backdrop-blur-sm p-10 rounded-[2.5rem] border border-border shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full transition-transform group-hover:scale-125"></div>
                <div className="w-16 h-16 bg-accent text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent/20 group-hover:rotate-12 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Customization & COD Banner */}
         <div className="group rounded-[3rem] lg:rounded-[5rem] overflow-hidden border border-accent/20 shadow-2xl relative transition-all duration-700 hover:shadow-accent/10">
  {/* Background Effects: Soft Gradient for Depth */}
  <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 backdrop-blur-3xl"></div>
  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
  
  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-accent/10">
    
    {/* Left Side: Messaging & Hook */}
    <div className="p-8 sm:p-16 lg:p-20">
      <div className="flex flex-col h-full justify-center max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit border border-accent/20">
          <Star size={12} fill="currentColor" className="animate-pulse" />
          Bespoke Experience
        </div>
        
        <h3 className="text-4xl lg:text-5xl font-medium mb-6 leading-[1.1] tracking-tight text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
          Tailored to your <span className="italic text-accent">unique</span> taste.
        </h3>
        
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed opacity-90">
          From specific color palettes to matching your home decor—if you can imagine it, we can craft it. Let’s collaborate on your next favorite piece.
        </p>

        {/* Added: Quick Trust Badges */}
        <div className="flex items-center gap-6 text-sm font-medium text-foreground/70">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Custom Colors
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
            Fast Response
          </div>
        </div>
      </div>
    </div>

    {/* Right Side: Interactive Connect Cards */}
    <div className="p-8 sm:p-16 lg:p-20 bg-accent/[0.03] flex flex-col justify-center">
      <div className="mb-10">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Connect with Dua</h4>
        <p className="text-sm text-muted-foreground/60">Choose your preferred way to chat with us.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* WhatsApp Card */}
        <a 
          href="https://wa.me/923133992762" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group/btn flex items-center justify-between p-6 bg-white dark:bg-white/5 border border-green-500/20 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl group-hover/btn:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">WhatsApp Us</p>
              <p className="text-xs text-muted-foreground italic">Instant replies & customization</p>
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            →
          </div>
        </a>

        {/* Instagram Card */}
        <a 
          href="https://instagram.com/handmade.by.dua" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group/btn flex items-center justify-between p-6 bg-white dark:bg-white/5 border border-pink-500/20 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-2xl group-hover/btn:scale-110 transition-transform">
              <Instagram size={24} />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Follow Gallery</p>
              <p className="text-xs text-muted-foreground italic">Daily updates & inspiration</p>
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#DD2A7B] to-[#8134AF] text-white shadow-lg">
            →
          </div>
        </a>
      </div>
    </div>
    
  </div>
</div>
        </div>
      </section>

      {/* ── Reviews ── */}
      {testimonials.length > 0 && (
        <section className="bg-card py-20 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Kind Words</h2>
              <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">What our lovely customers say</p>
            </div>
            
            <div className="relative group">
              <div className="overflow-hidden">
                 <div 
                   className="flex transition-transform duration-700 ease-in-out" 
                   style={{ transform: `translateX(-${currentReview * 100}%)` }}
                 >
                    {testimonials.map((testimonial) => (
                      <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
                        <div className="bg-background/50 backdrop-blur-sm p-10 rounded-3xl border border-border shadow-soft text-center h-full flex flex-col justify-center items-center">
                          {testimonial.image && (
                            <div className="mb-6">
                              <img 
                                src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '/uploads/testimonial')}/${testimonial.image}`} 
                                alt={testimonial.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-accent/20 p-1 bg-background"
                              />
                            </div>
                          )}
                          <div className="text-accent mb-6 flex gap-1 justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={20} fill={i < testimonial.rating ? "currentColor" : "none"} stroke={i < testimonial.rating ? "currentColor" : "gray"} />
                            ))}
                          </div>
                          <p className="text-lg lg:text-xl text-foreground font-medium leading-relaxed italic mb-8 max-w-2xl">
                            "{testimonial.reviewText}"
                          </p>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-[1px] bg-accent/30"></div>
                             <h4 className="font-bold text-sm tracking-widest uppercase">{testimonial.name}</h4>
                             <div className="w-10 h-[1px] bg-accent/30"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex justify-center gap-3 mt-10">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentReview ? 'w-8 bg-accent' : 'w-2 bg-accent/20'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
};

export default Home;
