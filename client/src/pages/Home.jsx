import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RotateCcw, Heart, Image, Building2, Package, Star } from 'lucide-react';
import { productAPI, categoryAPI, testimonialAPI } from '../services/api';
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
  const [currentReview, setCurrentReview] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, featuredRes, categoriesRes, testimonialsRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getFeatured(),
          categoryAPI.getAll(),
          testimonialAPI.getAll()
        ]);
        setProducts(productsRes.data?.filter(p => p.active !== false) || []);
        setFeaturedProducts(featuredRes.data?.filter(p => p.active !== false) || []);
        setCategories(categoriesRes.data || []);
        setTestimonials(testimonialsRes.data || []);
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

      {/* ── Features ── */}
      <section className="bg-secondary/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Repeated Customer</h3>
                <p className="text-sm text-muted-foreground mt-1">10% off on your next purchase</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Careful Packaging</h3>
                <p className="text-sm text-muted-foreground mt-1">Securely packed for safe arrival</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Prepaid Order</h3>
                <p className="text-sm text-muted-foreground mt-1">Enjoy free shopping on order above 3499</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>Nationwide Delivery</h3>
                <p className="text-sm text-muted-foreground mt-1">Delivery available across Pakistan</p>
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
