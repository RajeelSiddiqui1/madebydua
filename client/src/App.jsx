import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrders from './pages/admin/AdminOrders';

// User Pages
import Shop from './pages/Shop';
import UserDashboard from './pages/user/UserDashboard';
import Wishlist from './pages/user/Wishlist';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Profile from './pages/user/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/page/admin' : '/page/user'} replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// User Route Wrapper
const UserRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      {children}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Admin Routes */}
          <Route
            path="/page/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>

          {/* User Routes */}
          <Route
            path="/shop"
            element={
              <UserRoute>
                <Shop />
              </UserRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* User Profile Route - Direct access */}
          <Route
            path="/user"
            element={
              <UserRoute>
                <Shop />
              </UserRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="orders" element={<UserDashboard />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
