import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RotateCcw, Heart, Image, Building2, Package, Star, MessageSquare, Instagram, CheckCircle, Quote, X } from 'lucide-react';
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
  const [reviewForm, setReviewForm] = useState({ reviewText: '', rating: 5 });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewImage, setReviewImage] = useState(null);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }
    setReviewSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reviewText', reviewForm.reviewText);
      formData.append('rating', reviewForm.rating);
      if (reviewImage) {
        formData.append('image', reviewImage);
      }
      
      await testimonialAPI.create(formData);
      setReviewSuccess(true);
      setReviewForm({ reviewText: '', rating: 5 });
      setReviewImage(null);
      setReviewModalOpen(false);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setReviewSubmitting(false);
    }
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
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-[1.1] text-background mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Handmade By <br /><span className="text-accent font-bold">Syeda DuaeZahra</span>
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
        <h2 className="text-2xl sm:text-4xl font-bold  text-center mb-10" style={{ fontFamily: 'var(--font-serif)' }}>
          Shop by Category
        </h2>
        {displayCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {displayCategories.map((cat, idx) => (
               <Link key={cat._id || idx} to={`/shop?category=${cat._id || cat.name}`} className="group relative rounded-xl overflow-hidden aspect-square shadow-lg hover:shadow-2xl transition-all duration-500">
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
            
            <h2 className="text-2xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Featured Pieces</h2>
            
          </div>
          {displayFeatured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayFeatured.map((product, idx) => (
                <Link key={product._id || idx} to={`/product/${product._id || product.name}`} className="group block bg-background p-3 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500">
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
          
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Most Popular</h2>
        </div>
        {displayNewArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayNewArrivals.map((product, idx) => (
              <Link key={product._id || idx} to={`/product/${product._id || product.name}`} className="group block bg-background p-3 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500">
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
<section className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-accent/[0.03] to-background">

  {/* Soft Background Decor */}
  <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl -z-10 animate-pulse"></div>
  <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDelay: '2s'}}></div>

     {/* Customization & COD Banner - The "Glass" Look */}
   
  <div className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
     <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-foreground/90 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
         What Our <span className="italic text-accent/80">Customers</span> Are Saying
       </h2>
       
       <h3 className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">Why You'll Love Shopping Here</h3>
       <div className="w-24 h-1 bg-accent/30 mx-auto rounded-full mb-8"></div>
       
       {isAuthenticated ? (
         <button
           onClick={() => setReviewModalOpen(true)}
           className="bg-accent  text-accent-foreground px-8 py-3 rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
         >
           ✍️ Share Your Experience
         </button>
       ) : (
         <Link
           to="/login"
           className="bg-accent text-accent-foreground px-8 py-3 rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 inline-block"
         >
           🔐 Login to Write Review
         </Link>
       )}
     </div>

    {/* Testimonials Section */}
    {testimonials.length > 0 && (
      <div className="mb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative group">
            <div className="overflow-hidden py-10">
              <div 
                className="flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" 
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
                     <div className="relative bg-white border border-accent/15 p-8 sm:p-14 rounded-[3rem] shadow-xl shadow-accent/5 text-center flex flex-col items-center transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1">
                      <Quote className="absolute top-8 left-8 text-accent/10" size={60} />
                      
                      {testimonial.image && (
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-accent/20 rounded-full blur-md animate-pulse"></div>
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '/uploads/testimonial')}/${testimonial.image}`} 
                            alt={testimonial.name}
                            className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        </div>
                      )}

                      <div className="text-accent mb-6 flex gap-1.5 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} fill={i < testimonial.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} />
                        ))}
                      </div>

                      <p className="text-xl lg:text-2xl text-foreground/80 font-medium leading-relaxed italic mb-10 max-w-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        "{testimonial.reviewText}"
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="h-[1px] w-8 bg-accent/20"></div>
                        <h4 className="font-black text-xs tracking-[0.3em] uppercase text-accent">{testimonial.name}</h4>
                        <div className="h-[1px] w-8 bg-accent/20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Dots Navigation */}
            <div className="flex justify-center gap-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`group relative h-1 transition-all duration-500 ${index === currentReview ? 'w-12 bg-accent' : 'w-4 bg-accent/20'}`}
                  aria-label={`Slide ${index + 1}`}
                >
                  <span className="absolute -top-4 left-0 w-full h-8 bg-transparent"></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Features Grid - Refined Spacing & Animation */}
    <div className="bg-background p-6 sm:p-10 mb-32 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: <Star />, title: "Loyalty Reward", desc: "10% off for our repeat family members" },
          { icon: <Shield />, title: "Secure Delivery", desc: "Double-layered protection for safe arrival" },
          { icon: <Package />, title: "Free Shipping", desc: "Complimentary delivery on orders above Rs. 3,499" },
          { icon: <Truck />, title: "Nationwide", desc: "Bringing handmade love to every corner of PK" }
        ].map((feature, i) => (
          <div key={i} className="group bg-black  p-6 sm:p-8 rounded-[2rem] shadow-md hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center transform hover:-translate-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-white">{feature.title}</h3>
            <p className="text-xs text-white/80 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
        </div>
      </div>
    </div>

  <div className="relative group  lg:rounded-[5rem] overflow-hidden border border-white/40 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-secondary/10 opacity-60"></div>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl"></div>
      
      <div className="relative z-10 p-12 sm:p-24 flex flex-col items-center text-center">
        <div className="mb-14 max-w-2xl">
         
          <h4 className="text-4xl lg:text-4xl font-bold mb-6 tracking-tight text-foreground/90" style={{ fontFamily: 'var(--font-serif)' }}>
            Design Your <span className="text-accent underline decoration-accent/10 underline-offset-8">Color Customization</span> & Queries
          </h4>
          <p className="text-muted-foreground text-lg sm:text-xl font-light">For any custom or queries.feel free to chat with us</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl justify-center">
          {[
            { 
              name: "WhatsApp Us", 
              sub: "For Instant Orders", 
              href: "https://wa.me/923133992762", 
              icon: <MessageSquare size={24} />,
              theme: "bg-green-500"
            },
            { 
              name: "Instagram Gallery", 
              sub: "Daily Behind the Scenes", 
              href: "https://instagram.com/handmade.by.dua", 
              icon: <Instagram size={24} />,
              theme: "bg-pink-500"
            }
          ].map((card, i) => (
            <a 
              key={i}
              href={card.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/btn flex-1 flex items-center justify-between p-7 bg-white/60 border border-white rounded-[2rem] transition-all duration-500 hover:scale-[1.03] hover:bg-white hover:shadow-2xl hover:shadow-accent/5"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl text-white shadow-lg transition-transform group-hover/btn:scale-110 duration-500 ${card.theme}`}>
                  {card.icon}
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-foreground/80">{card.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{card.sub}</p>
                </div>
              </div>
              <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover/btn:bg-accent group-hover/btn:text-white transition-all duration-500">
                <ChevronRight size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>

  </div>
</section>

       {/* Review Modal */}
       {reviewModalOpen && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-background rounded-3xl p-8 w-full max-w-lg shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Share Your Experience</h2>
               <button onClick={() => setReviewModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                 <X size={24} />
               </button>
             </div>
             
             {reviewSuccess ? (
               <div className="text-center py-8">
                 <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                 <p className="text-lg text-green-600 font-medium">Thank you for your review! It will be visible after admin approval.</p>
               </div>
             ) : (
               <form onSubmit={handleReviewSubmit} className="space-y-5">
                 <div>
                   <label className="block text-sm font-medium mb-2">Your Photo (Optional)</label>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => setReviewImage(e.target.files[0])}
                     className="w-full p-3 border border-border rounded-xl text-sm"
                   />
                   {reviewImage && <p className="text-xs text-muted-foreground mt-1">Selected: {reviewImage.name}</p>}
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">Your Rating</label>
                   <div className="flex gap-2">
                     {[1,2,3,4,5].map((star) => (
                       <button
                         key={star}
                         type="button"
                         onClick={() => setReviewForm({...reviewForm, rating: star})}
                         className="p-1"
                       >
                         <Star 
                           size={28} 
                           className={star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}
                           fill={star <= reviewForm.rating ? 'currentColor' : 'none'}
                         />
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">Your Review</label>
                   <textarea
                     required
                     rows={4}
                     value={reviewForm.reviewText}
                     onChange={(e) => setReviewForm({...reviewForm, reviewText: e.target.value})}
                     className="w-full p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                     placeholder="Share your experience with our products..."
                   />
                 </div>
                 
                 <div className="pt-2 flex gap-3">
                   <button
                     type="button"
                     onClick={() => setReviewModalOpen(false)}
                     className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     disabled={reviewSubmitting}
                     className="flex-1 bg-accent text-accent-foreground py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                   >
                     {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                   </button>
                 </div>
               </form>
             )}
           </div>
         </div>
       )}
    
       <Footer />
    </div>
  );
};

export default Home;
