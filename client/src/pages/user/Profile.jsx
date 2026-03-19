import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Package, Heart, ShoppingBag, LogOut, ArrowRight } from 'lucide-react';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const getImageUrl = (item) => {
    if (!item) return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop';
    if (item.image && item.image.startsWith('http')) return item.image;
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-secondary/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <User size={28} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Link
            to="/shop"
            onClick={() => setActiveTab('orders')}
            className={`p-2 rounded-lg border text-center transition-colors ${activeTab === 'orders' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'}`}
          >
            <ShoppingBag size={16} className="mx-auto mb-1 text-accent" />
            <span className="font-medium text-sm">Shop</span>
          </Link>
          <Link
            to="/shop/wishlist"
            className="p-2 rounded-lg border border-border hover:border-accent text-center transition-colors"
          >
            <Heart size={16} className="mx-auto mb-1 text-accent" />
            <span className="font-medium text-sm">Wishlist</span>
          </Link>
          <Link
            to="/shop/cart"
            className="p-2 rounded-lg border border-border hover:border-accent text-center transition-colors"
          >
            <Package size={16} className="mx-auto mb-1 text-accent" />
            <span className="font-medium text-sm">Cart</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-lg border border-border hover:border-red-500 text-center transition-colors w-full"
          >
            <LogOut size={16} className="mx-auto mb-1 text-red-500" />
            <span className="font-medium text-sm text-red-500">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'orders' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'profile' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Profile Info
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>No orders yet</h3>
                <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Start Shopping <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-xs">{order._id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.paymentStatus && (
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' :
                              order.paymentStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {order.paymentStatus === 'rejected' && order.paymentRejectionReason && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <p className="font-medium">Payment Rejected</p>
                        <p>Reason: {order.paymentRejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-2 mb-2">
                      <p className="text-xs text-muted-foreground mb-2">Items:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {order.products?.map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 flex items-center gap-2 bg-background rounded p-1">
                            <img
                              src={getImageUrl(item.product)}
                              alt={item.product?.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-xs">{item.product?.name}</p>
                              <p className="text-muted-foreground text-xs">x{item.quantity}</p>
                              <p className="font-medium text-xs">Rs.{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-xs">{order.shippingAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-bold text-sm">Rs.{order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">First Name</label>
                <p className="font-medium">{user?.firstName || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Last Name</label>
                <p className="font-medium">{user?.lastName || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Email</label>
                <p className="font-medium">{user?.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Account Type</label>
                <p className="font-medium capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
