import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data || { products: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      await cartAPI.updateCartItem(productId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdating(true);
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) return item.image;
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  const calculateTotal = () => {
    return cart.products.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateItemTotal = (item) => {
    return (item.product?.price || 0) * item.quantity;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-secondary/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl lg:text-2xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>
              My <span className="italic text-accent">Cart</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-xs ml-10">
            {cart.products.length} {cart.products.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {cart.products.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border flex flex-col items-center">
            <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Your cart is empty</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Start shopping to add items to your cart.</p>
            <Link 
              to="/shop" 
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.products.map((item) => (
                <div key={item.product?._id} className="bg-card rounded-lg border border-border p-3 flex gap-3">
                  <Link to={`/product/${item.product?._id}`}>
                    <img
                      src={getImageUrl(item.product)}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product?._id}`} className="hover:text-accent transition-colors">
                      <h3 className="font-medium text-sm truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                        {item.product?.name || 'Product'}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-xs mb-1">
                      Rs.{item.product?.price}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="p-1 rounded border border-border hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-medium text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                          disabled={updating || (item.product?.quantity !== undefined && item.quantity >= item.product.quantity)}
                          className="p-1 rounded border border-border hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          Rs.{calculateItemTotal(item).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.product?._id)}
                          disabled={updating}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {item.product?.quantity !== undefined && item.quantity >= item.product.quantity && (
                      <p className="text-xs text-red-500 mt-1">
                        ✕ Sorry, only {item.product.quantity} available in stock
                      </p>
                    )}
                    {item.product?.quantity !== undefined && item.quantity < item.product.quantity && item.product.quantity <= 5 && (
                      <p className="text-xs text-orange-500 mt-1">
                        ⚠ Only {item.product.quantity} left in stock
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs.{calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rs.{(calculateTotal() * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/shop/checkout"
                  className="block w-full text-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
