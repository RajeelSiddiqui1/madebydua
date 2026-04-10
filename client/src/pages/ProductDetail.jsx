import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all product images for gallery
  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (!images.includes(img)) images.push(img);
      });
    }
    return images;
  };

  const allImages = getAllImages();

  // Calculate discount percentage
  const getDiscountPercent = () => {
    if (product && product.comparePrice && product.price && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  const discountPercent = getDiscountPercent();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll(),
        ]);

        const allProducts = productRes.data || [];
        const foundProduct = allProducts.find((p) => p._id === id);
        setProduct(foundProduct || null);
        setCategories(categoriesRes.data || []);

        if (foundProduct) {
          const related = allProducts.filter(
            (p) =>
              p._id !== id &&
              (p.category?._id === foundProduct.category?._id || p.category === foundProduct.category) &&
              p.active !== false
          );
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    // Allow unauthenticated users to add to cart

    setCartLoading(true);
    try {
      await cartAPI.addToCart(product._id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-muted-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Product not found</h2>
        <Link to="/shop" className="text-accent hover:underline mt-4 inline-block font-medium">
          Back to Shop
        </Link>
      </div>
    );
  }

  const categoryName = categories.find(
    (c) => c._id === product.category?._id || c._id === product.category
  )?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="bg-secondary/5 rounded-2xl overflow-hidden relative aspect-square border border-border/50 group">
            {allImages.length > 0 ? (
              <>
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${allImages[selectedImageIndex]}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                <Image size={64} strokeWidth={1} />
                <p className="mt-2 text-sm font-medium">No Image Available</p>
              </div>
            )}
            
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-xl">
                {discountPercent}% OFF
              </div>
            )}
            
            {/* Out of Stock Badge */}
            {(!product.quantity || product.quantity <= 0) && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-2xl tracking-widest uppercase">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-accent shadow-md' : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${img}`}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
               {categoryName || 'Uncategorized'}
             </span>
             <span className="w-1 h-1 rounded-full bg-border"></span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
               SKU: DU-{product._id.toString().slice(-6).toUpperCase()}
             </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-bold text-foreground">
              Rs.{product.price}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xl text-muted-foreground line-through font-medium">
                Rs.{product.comparePrice}
              </span>
            )}
          </div>

          <div className="space-y-6 mb-10">
           
            
            <div className="px-1 text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {product.longDesc || product.shortDesc}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || (!product.quantity || product.quantity <= 0)}
              className={`w-full py-4 rounded-full font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] ${
                addedToCart 
                  ? 'bg-green-600 text-white' 
                  : (product.quantity > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed')
              }`}
            >
              <ShoppingBag size={20} className={cartLoading ? 'animate-bounce' : ''} />
              {addedToCart ? 'Added to Cart!' : cartLoading ? 'Adding...' : (product.quantity > 0 ? 'Add to Cart' : 'Currently Unavailable')}
            </button>
            
          
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-20 border-t border-border">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>More to Explore</h2>
            <Link to="/shop" className="text-sm font-bold text-accent hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct._id}
                to={`/product/${relProduct._id}`}
                className="group flex flex-col"
              >
                <div className="aspect-[4/5] bg-secondary/5 rounded-2xl overflow-hidden mb-4 border border-border/50">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${relProduct.image}`}
                    alt={relProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1 truncate">{relProduct.name}</h3>
                <span className="text-sm font-bold text-accent">Rs.{relProduct.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailWithLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <ProductDetailContent />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailWithLayout;
