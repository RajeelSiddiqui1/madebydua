import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RotateCcw, Heart, Image, Building2 } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
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
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, featuredRes, categoriesRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getFeatured(),
          categoryAPI.getAll(),
        ]);
        setProducts(productsRes.data?.filter(p => p.active !== false) || []);
        setFeaturedProducts(featuredRes.data?.filter(p => p.active !== false) || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      <section className="relative h-[70vh] min-h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&h=1080&fit=crop"
          alt="Beautiful Handcrafted Pottery"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] text-background mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Beautiful <span className="text-accent italic">Handcrafted</span> Pottery
          </h1>
          <p className="text-background/80 text-lg mb-8 max-w-md">
            Discover our unique collection of handcrafted ceramics. Each piece is made with care.
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

      
      <Footer />
    </div>
  );
};

export default Home;
