import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, LogOut, User, ChevronRight, Home, Grid, Store, Menu, X } from 'lucide-react';
import { useState } from 'react';
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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate breadcrumb from current path
  const getBreadcrumb = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    pathnames.forEach((name) => {
      currentPath += `/${name}`;
      const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ name: displayName, path: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumb();
  const showBreadcrumb = location.pathname !== '/'; // Don't show on home page

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
      {/* Free Shipping Banner */}
      <div className="bg-accent text-accent-foreground text-center py-1 text-xs font-medium">
        🚚 Free shipping on orders above Rs.2500
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo - Left */}
        <Link to="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          NewDua
        </Link>
        
        {/* Breadcrumb - Right */}
        {showBreadcrumb && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto max-w-[60%]">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && <ChevronRight size={12} className="mx-0.5 shrink-0" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium whitespace-nowrap">{crumb.name}</span>
                ) : (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-accent transition-colors flex items-center gap-0.5 whitespace-nowrap"
                  >
                    {index === 0 && <Home size={12} />}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
      
      {/* Desktop Breadcrumb */}
      {showBreadcrumb && (
        <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && <ChevronRight size={14} className="mx-1 shrink-0" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium whitespace-nowrap">{crumb.name}</span>
                ) : (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-accent transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    {index === 0 && <Home size={14} />}
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tight shrink-0 hidden lg:block" style={{ fontFamily: 'var(--font-serif)' }}>
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

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 hover:text-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {showAuthButtons ? (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link to="/user" className="p-2 hover:text-accent transition-colors relative" title="My Profile">
                      <User size={20} />
                    </Link>
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
                    <Link to="/user" className="p-2 hover:text-accent transition-colors relative" title="My Profile">
                      <User size={20} />
                    </Link>
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(80px+env(safe-area-inset-top))] z-40 bg-background">
          <div className="px-4 py-4 space-y-2">
            <Link 
              to="/shop" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store size={20} />
              <span>Shop</span>
            </Link>
          
            {isAuthenticated ? (
              <>
                <Link 
                  to="/user" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <Link 
                  to="/shop/wishlist" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={20} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <span className="ml-auto bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs">{wishlistCount}</span>}
                </Link>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around py-2">
          <Link to="/shop" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors">
            <Store size={20} />
            <span className="text-xs">Shop</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/user" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors">
                <User size={20} />
                <span className="text-xs">Profile</span>
              </Link>
              <Link to="/shop/wishlist" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-accent text-[8px] font-bold text-accent-foreground flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
                <span className="text-xs">Wishlist</span>
              </Link>
              <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors">
                <LogOut size={20} />
                <span className="text-xs">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 p-2 hover:text-accent transition-colors">
              <User size={20} />
              <span className="text-xs">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
