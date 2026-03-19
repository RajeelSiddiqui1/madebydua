import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, productAPI, couponAPI, adminAPI, orderAPI } from '../../services/api';
import { Package, ShoppingBag, Users, Tag, Star, Heart, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    coupons: 0,
    users: 0,
    orders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, productsRes, couponsRes, usersRes, ordersRes] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getAll(),
          couponAPI.getAll(),
          adminAPI.getUsers(),
          adminAPI.getAllOrders(),
        ]);
        
        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        setStats({
          categories: categoriesRes.data.length || 0,
          products: productsRes.data.length || 0,
          coupons: couponsRes.data.length || 0,
          users: usersRes.data.length || 0,
          orders: orders.length || 0,
          totalRevenue: totalRevenue,
        });
        
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Products', count: stats.products, color: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: Package, path: '/page/admin/products' },
    { title: 'Categories', count: stats.categories, color: 'bg-gradient-to-br from-green-500 to-green-600', icon: Tag, path: '/page/admin/categories' },
    { title: 'Users', count: stats.users, color: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: Users, path: '/page/admin' },
    { title: 'Orders', count: stats.orders, color: 'bg-gradient-to-br from-orange-500 to-orange-600', icon: ShoppingBag, path: '/page/admin/orders' },
    { title: 'Revenue', count: `Rs.${stats.totalRevenue.toFixed(2)}`, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', icon: DollarSign, path: '/page/admin' },
    { title: 'Coupons', count: stats.coupons, color: 'bg-gradient-to-br from-pink-500 to-pink-600', icon: Tag, path: '/page/admin/coupons' },
  ];

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className={`${card.color} text-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <card.icon size={20} md:size={24} className="opacity-80" />
            </div>
            <p className="text-xl md:text-3xl font-bold">{card.count}</p>
            <p className="text-white/80 text-xs md:text-sm">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Link
          to="/page/admin/products"
          className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-blue-500 hover:shadow-md transition-all"
        >
          <Package className="mx-auto mb-1 text-blue-500" size={20} />
          <p className="font-medium text-sm">Products</p>
        </Link>
        <Link
          to="/page/admin/categories"
          className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-green-500 hover:shadow-md transition-all"
        >
          <Tag className="mx-auto mb-1 text-green-500" size={20} />
          <p className="font-medium text-sm">Categories</p>
        </Link>
        <Link
          to="/page/admin/coupons"
          className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-pink-500 hover:shadow-md transition-all"
        >
          <Tag className="mx-auto mb-1 text-pink-500" size={20} />
          <p className="font-medium text-sm">Coupons</p>
        </Link>
        <Link
          to="/shop"
          className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-purple-500 hover:shadow-md transition-all"
        >
          <ShoppingBag className="mx-auto mb-1 text-purple-500" size={20} />
          <p className="font-medium text-sm">Shop</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        
        {/* Table View - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-gray-500 text-sm">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs font-mono text-gray-600">{order._id?.slice(-8)}</td>
                    <td className="px-3 py-2 text-xs">{order.user?.firstName || 'Unknown'} {order.user?.lastName || ''}</td>
                    <td className="px-3 py-2 text-xs">{order.products?.length || 0} items</td>
                    <td className="px-3 py-2 text-xs font-medium">Rs.{order.totalAmount?.toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Card View - Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {recentOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-mono text-gray-600">#{order._id?.slice(-8)}</p>
                    <p className="text-sm font-medium">{order.user?.firstName || 'Unknown'} {order.user?.lastName || ''}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{order.products?.length || 0} items</span>
                  <span className="text-sm font-bold">Rs.{order.totalAmount?.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
