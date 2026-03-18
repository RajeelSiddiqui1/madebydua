import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getAll();
      setWishlist(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlist(wishlist.filter((item) => item._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) return item.image;
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-secondary/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/shop" 
              className="p-2 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl lg:text-4xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>
              My <span className="italic text-accent">Wishlist</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            You have {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {wishlist.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border flex flex-col items-center">
            <Heart size={64} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Your wishlist is empty</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Save items you love by clicking the heart icon on any product.</p>
            <Link 
              to="/shop" 
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                <Link to={`/product/${product._id}`}>
                  <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Remove Button */}
                    <button 
                      className="absolute top-3 right-3 p-2 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground text-foreground transition-all shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(product._id);
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Link>
                 
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{product.category?.name || 'Uncategorized'}</p>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-base font-semibold text-foreground truncate hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">
                      ${product.price}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through font-medium">
                        ${product.comparePrice}
                      </span>
                    )}
                  </div>

                  <Link 
                    to={`/product/${product._id}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ShoppingBag size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
