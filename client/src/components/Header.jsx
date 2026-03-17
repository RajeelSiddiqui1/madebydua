import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ 
  wishlistCount = 0, 
  cartCount = 0,
  navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' }
  ],
  showAuthButtons = false,
  showSearch = true
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (e, path) => {
    if (!isAuthenticated && (path === '/shop' || path === '/wishlist')) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
            NewDua
          </Link>

          {/* Search */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for handcrafted pieces..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className="hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showAuthButtons ? (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link to="/shop" className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                      My Account
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap">
                      Login
                    </Link>
                    <Link to="/register" className="px-4 py-1.5 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors hidden sm:block">
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium hidden sm:block">
                      Hi, {user?.firstName || 'User'}
                    </span>
                    <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap">
                      Login
                    </Link>
                  </div>
                )}
              </>
            )}
            
            <div className="flex items-center gap-1 border-l border-border pl-2 sm:pl-4 ml-2 sm:ml-0">
              <Link to={isAuthenticated ? "/shop/wishlist" : "/login"} className="p-2 hover:text-accent transition-colors relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to={isAuthenticated ? "/shop/cart" : "/login"} className="p-2 hover:text-accent transition-colors relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
