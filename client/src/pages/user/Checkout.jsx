import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI, couponAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, Tag, X, Check, Trash2, Upload, Building2, Smartphone, Instagram, MessageSquare } from 'lucide-react';

const Checkout = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan'
  });
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('easy paisa');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  // Coupon state
  const [productCoupons, setProductCoupons] = useState({});
  const [couponInputs, setCouponInputs] = useState({});
  const [couponErrors, setCouponErrors] = useState({});
  const [couponLoading, setCouponLoading] = useState({});
  const [appliedCoupons, setAppliedCoupons] = useState({});
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data || { products: [] });
      // Initialize coupon state for each cart item
      const initialCoupons = {};
      const initialInputs = {};
      (response.data?.products || []).forEach(item => {
        const productId = item.product?._id;
        if (productId) {
          initialCoupons[productId] = null;
          initialInputs[productId] = '';
        }
      });
      setProductCoupons(initialCoupons);
      setCouponInputs(initialInputs);
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

  const calculateTotal = () => {
    return cart.products.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    let totalDiscount = 0;
    Object.values(appliedCoupons).forEach(coupon => {
      if (coupon) {
        totalDiscount += coupon.discount || 0;
      }
    });
    return totalDiscount;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateDiscount();
  };

  // Shipping charge
  const SHIPPING_CHARGE = 200;
  const FREE_SHIPPING_THRESHOLD = 2500;

  const calculateShipping = () => {
    const subtotal = calculateTotal() - calculateDiscount();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  };

  const calculateGrandTotal = () => {
    return calculateFinalTotal() + calculateShipping();
  };

  const handleCouponInputChange = (productId, value) => {
    setCouponInputs(prev => ({ ...prev, [productId]: value }));
  };

  const applyCouponForProduct = async (productId) => {
    const code = couponInputs[productId]?.trim();
    if (!code) return;

    setCouponLoading(prev => ({ ...prev, [productId]: true }));
    setCouponErrors(prev => ({ ...prev, [productId]: '' }));

    try {
      // Find the cart item to get quantity
      const cartItem = cart.products.find(item => item.product?._id === productId);
      const quantity = cartItem?.quantity || 1;

      const response = await couponAPI.validate({
        code,
        productId,
        quantity
      });

      if (response.data) {
        setAppliedCoupons(prev => ({
          ...prev,
          [productId]: {
            ...response.data,
            code: response.data.coupon?.code || code
          }
        }));
        setProductCoupons(prev => ({
          ...prev,
          [productId]: response.data
        }));
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid coupon';
      setCouponErrors(prev => ({ ...prev, [productId]: message }));
      setAppliedCoupons(prev => {
        const newCoupons = { ...prev };
        delete newCoupons[productId];
        return newCoupons;
      });
    } finally {
      setCouponLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeCoupon = (productId) => {
    setAppliedCoupons(prev => {
      const newCoupons = { ...prev };
      delete newCoupons[productId];
      return newCoupons;
    });
    setCouponInputs(prev => ({ ...prev, [productId]: '' }));
    setCouponErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
  };

  // Remove product from cart
  const removeProductFromCart = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product from your cart?')) {
      try {
        await cartAPI.removeFromCart(productId);
        fetchCart();
      } catch (error) {
        console.error('Error removing product:', error);
      }
    }
  };

  // Handle payment receipt file selection
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  // Remove receipt
  const removeReceipt = () => {
    setPaymentReceipt(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);
    
    try {
      const addressString = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;
      
      // Prepare coupons data
      const couponsData = Object.entries(appliedCoupons).map(([productId, couponData]) => ({
        code: couponData.code,
        productId,
      }));

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('shippingAddress', addressString);
      formData.append('coupons', JSON.stringify(couponsData));
      formData.append('paymentMethod', paymentMethod);
      
      if (paymentReceipt) {
        formData.append('paymentReceipt', paymentReceipt);
      }

      const response = await orderAPI.checkout(formData);
      setOrderId(response.data.order._id);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error processing order:', error);
      setError(error.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) return item.image;
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  const getItemDiscount = (item) => {
    const productId = item.product?._id;
    const coupon = appliedCoupons[productId];
    return coupon?.discount || 0;
  };

  const getItemFinalPrice = (item) => {
    const originalPrice = (item.product?.price || 0) * item.quantity;
    return originalPrice - getItemDiscount(item);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Order Placed!</h1>
          <p className="text-muted-foreground mb-2">Thank you for your order!</p>
          <p className="text-sm text-muted-foreground mb-8">Order ID: <span className="font-mono text-foreground">{orderId}</span></p>
          <div className="space-y-3">
            <Link
              to="/shop"
              className="block w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.products.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/shop" className="text-accent hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-secondary/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-1">
            <Link 
              to="/shop/cart" 
              className="p-1.5 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-xl lg:text-2xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>
              Checkout
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Shipping Details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customization & COD Info */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-accent" style={{ fontFamily: 'var(--font-serif)' }}>
                      Color Customization & Queries
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For any custom colors or queries, feel free to chat with us.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href="https://wa.me/923133992762" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      <MessageSquare size={16} />
                      WhatsApp
                    </a>
                    <a 
                      href="https://instagram.com/handmade.by.dua" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-accent/10">
                  <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    Cash on Delivery (COD) Orders
                  </h3>
                  <div className="flex items-start gap-3 bg-white/50 p-3 rounded-lg border border-accent/10">
                    <CheckCircle size={18} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      For <span className="font-bold text-foreground">Cash on Delivery</span>, please place your order directly via Instagram or WhatsApp chat. 
                      A small advance payment (including delivery charges) is required to confirm COD orders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Shipping Address</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Karachi"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Sindh"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="74000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Payment Method</h2>
                
                {/* EasyPaisa */}
                <label 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer mb-2 transition-all ${
                    paymentMethod === 'easy paisa' ? 'border-accent bg-accent/5' : 'border-border hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('easy paisa')}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="easy paisa"
                    checked={paymentMethod === 'easy paisa'}
                    onChange={() => setPaymentMethod('easy paisa')}
                    className="hidden"
                  />
                  <Smartphone size={18} className="text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">EasyPaisa</p>
                    <p className="text-xs text-muted-foreground">Send payment to: 03422996302</p>
                    <p className="text-xs text-muted-foreground">IBAN: PK02TMFB0000000063987806</p>
                  </div>
                  {paymentMethod === 'easy paisa' && (
                    <Check size={18} className="text-green-600" />
                  )}
                </label>
                
                {/* Bank Transfer */}
                <label 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer mb-2 transition-all ${
                    paymentMethod === 'bank_transfer' ? 'border-accent bg-accent/5' : 'border-border hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="hidden"
                  />
                  <Building2 size={18} className="text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Bank Alfalah</p>
                    <p className="text-xs text-muted-foreground">Account: 58595001864714</p>
                    <p className="text-xs text-muted-foreground"></p>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <Check size={18} className="text-green-600" />
                  )}
                </label>
                
                {/* Payment Receipt Upload - Always show for online payments */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2 font-medium">
                      Please send payment and upload receipt:
                    </p>
                    {paymentMethod === 'easy paisa' && (
                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-yellow-700">
                          Send PKR to: 03422996302 
                        </p>
                        <p className="text-xs text-yellow-700">
                          IBAN: PK57ALFH5859005001864714
                        </p>
                        <p className="text-xs text-yellow-700">
                          Syeda Dua-e-Zahra
                        </p>
                      </div>
                    )}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="text-xs text-yellow-700 mb-3 space-y-1">
                        <p>Bank: Bank Alfalah</p>
                        <p>Account: 58595001864714</p>
                        <p>IBAN: PK57ALFH5859005001864714</p>
                        <p>Title: SYED DANIYAL ALI</p>
                     
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <label className="block text-xs font-medium mb-1">Upload Payment Receipt</label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 bg-white border border-yellow-300 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
                          <Upload size={16} className="text-yellow-600" />
                          <span className="text-xs">Choose File</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={handleReceiptChange}
                            className="hidden"
                          />
                        </label>
                        {receiptPreview && (
                          <button
                            type="button"
                            onClick={removeReceipt}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {receiptPreview && (
                        <div className="mt-2">
                          <img 
                            src={receiptPreview} 
                            alt="Receipt Preview" 
                            className="h-20 w-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              {/* Product Coupons Section */}
              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  <Tag size={18} className="text-accent" />
                  Apply Coupons
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  You can apply a different coupon to each product
                </p>
                
                <div className="space-y-3">
                  {cart.products.map((item) => {
                    const productId = item.product?._id;
                    const hasCoupon = appliedCoupons[productId];
                    const isLoading = couponLoading[productId];
                    const error = couponErrors[productId];

                    return (
                      <div key={productId} className="border rounded-lg p-3">
                        <div className="flex gap-3 items-center">
                          <img
                            src={getImageUrl(item.product)}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × Rs.{item.product?.price}</p>
                          </div>
                          
                          <button
                            onClick={() => removeProductFromCart(productId)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove product"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          {hasCoupon ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                {hasCoupon.code} (-Rs.{hasCoupon.discount?.toFixed(2)})
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCoupon(productId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Enter coupon"
                                value={couponInputs[productId] || ''}
                                onChange={(e) => handleCouponInputChange(productId, e.target.value)}
                                className="w-28 px-2 py-1 text-sm rounded border border-border focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                              <button
                                type="button"
                                onClick={() => applyCouponForProduct(productId)}
                                disabled={isLoading || !couponInputs[productId]}
                                className="px-2 py-1 bg-accent text-accent-foreground rounded text-sm hover:opacity-90 disabled:opacity-50"
                              >
                                {isLoading ? '...' : <Check size={14} />}
                              </button>
                            </div>
                          )}
                        </div>
                        {error && (
                          <p className="text-red-500 text-xs mt-2">{error}</p>
                        )}
                        {hasCoupon && (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <Check size={12} />
                            Coupon applied! You save Rs.{hasCoupon.discount?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
                <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Summary</h2>
                
                {/* Items */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {cart.products.map((item) => (
                    <div key={item.product?._id} className="flex gap-2 items-center group">
                      <img
                        src={getImageUrl(item.product)}
                        alt={item.product?.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{item.product?.name}</p>
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeProductFromCart(item.product?._id)}
                        className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove product"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="text-right">
                        {getItemDiscount(item) > 0 ? (
                          <>
                            <p className="font-medium text-xs line-through text-gray-400">Rs.{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                            <p className="font-medium text-xs text-green-600">Rs.{getItemFinalPrice(item).toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="font-medium text-sm">Rs.{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs.{calculateTotal().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount</span>
                      <span>-Rs.{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{calculateShipping() === 0 ? 'Free' : `Rs.${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  {calculateShipping() === 0 && (
                    <div className="text-xs text-green-600">
                      🎉 Free shipping on orders above Rs.2,500!
                    </div>
                  )}
                
                  <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                    <span>Total</span>
                    <span>Rs.{(calculateGrandTotal() * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || !paymentReceipt}
                  className="w-full mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : !paymentReceipt ? 'Upload Payment Receipt to Proceed' : 'Place Order'}
                </button>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
