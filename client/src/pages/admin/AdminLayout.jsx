import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Package, Tag, Home, ShoppingBag, LogOut, Receipt, MessageSquare } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/page/admin', label: 'Dashboard', icon: Home, exact: true },
    { path: '/page/admin/categories', label: 'Categories', icon: Tag },
    { path: '/page/admin/products', label: 'Products', icon: Package },
    { path: '/page/admin/orders', label: 'Orders', icon: Receipt },
    { path: '/page/admin/coupons', label: 'Coupons', icon: Tag },
    { path: '/page/admin/testimonials', label: 'Reviews', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 pt-16 lg:pt-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user?.firstName}</p>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Shop Link */}
        {/* <div className="px-6 py-3 mt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 uppercase mb-2">Quick Links</p>
          <NavLink
            to="/shop"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 py-2 hover:text-blue-400 text-gray-300"
          >
            <ShoppingBag size={20} />
            View Shop
          </NavLink>
        </div> */}
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 p-4 pt-20 lg:pt-8 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
