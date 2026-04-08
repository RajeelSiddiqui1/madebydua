import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, LogOut, User, ChevronRight, Home, Grid, Store, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { categoryAPI } from '../services/api';

const Header = ({ 
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
  const [categories, setCategories] = useState([]);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
    if (!isAuthenticated && path === '/shop') {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Free Shipping Banner */}
      <div className="bg-accent text-accent-foreground text-center py-1 text-xs font-medium">
        🚚 Enjoy FREE shipping on prepaid orders above Rs. 3,499
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        
        
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
          <Link to="/" className="flex items-center gap-3 shrink-0 hidden lg:flex group transition-all duration-300" style={{ fontFamily: 'var(--font-serif)' }}>
           
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">Handmade By Dua</span>
          </Link>

          {/* Search */}
     
          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium ml-8">
            {navLinks.map((item) => (
              <div 
                key={item.name} 
                className="relative group h-16 flex items-center"
                onMouseEnter={() => item.name === 'Shop' && setShopDropdownOpen(true)}
                onMouseLeave={() => item.name === 'Shop' && setShopDropdownOpen(false)}
              >
                {item.name === 'Shop' ? (
                  <div className="flex items-center gap-1 cursor-pointer hover:text-accent transition-colors">
                    <Link to={item.path} onClick={(e) => handleNavClick(e, item.path)}>
                      {item.name}
                    </Link>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className="hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                )}

                {/* Shop Dropdown */}
                {item.name === 'Shop' && shopDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-background border border-border shadow-xl rounded-b-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 mb-2 border-b border-border/50">
                      <Link 
                        to="/shop" 
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
                        onClick={() => setShopDropdownOpen(false)}
                      >
                        All Products
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat._id}`}
                          className="px-4 py-2 hover:bg-accent/5 hover:text-accent transition-colors text-sm flex items-center justify-between group/item"
                          onClick={() => setShopDropdownOpen(false)}
                        >
                          {cat.name}
                          <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <Link to="/shop/cart" className="p-2 hover:text-accent transition-colors relative">
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
        <div className="lg:hidden fixed inset-0 top-[calc(60px+env(safe-area-inset-top))] z-40 bg-background overflow-y-auto">
          <div className="px-4 py-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-4">Menu</h3>
                <div className="space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/' ? 'bg-accent/10 text-accent font-bold' : 'hover:bg-accent/5'}`}
                  >
                    <Home size={20} className={location.pathname === '/' ? 'text-accent' : 'text-muted-foreground'} />
                    <span>Home</span>
                  </Link>
                  
                  {/* Expandable Shop Menu */}
                  <div className="space-y-1">
                    <button 
                      onClick={() => setMobileShopOpen(!mobileShopOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/shop') ? 'bg-accent/10 text-accent font-bold' : 'hover:bg-accent/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Store size={20} className={location.pathname.startsWith('/shop') ? 'text-accent' : 'text-muted-foreground'} />
                        <span>Shop</span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${mobileShopOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {mobileShopOpen && (
                      <div className="ml-4 pl-4 border-l-2 border-accent/20 space-y-1 py-1 animate-in slide-in-from-top-2 duration-300">
                        <Link 
                          to="/shop" 
                          onClick={() => { setMobileMenuOpen(false); setMobileShopOpen(false); }}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-accent font-medium"
                        >
                          Show All Products
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/shop?category=${cat._id}`}
                            onClick={() => { setMobileMenuOpen(false); setMobileShopOpen(false); }}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-accent font-medium truncate"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            </div>

          
            <div className="pt-6 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link to="/user" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/5 transition-colors">
                    <User size={20} className="text-muted-foreground" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/5 transition-colors w-full text-left text-destructive"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-medium transition-opacity">
                  <User size={18} />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Hidden Wishlist) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around py-3 px-2">
          <Link to="/" className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-muted-foreground'}`}>
            <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
          </Link>
          <Link to="/shop" className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${location.pathname === '/shop' ? 'text-accent' : 'text-muted-foreground'}`}>
            <Store size={22} strokeWidth={location.pathname === '/shop' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Shop</span>
          </Link>
          <Link to="/shop/cart" className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors relative ${location.pathname === '/shop/cart' ? 'text-accent' : 'text-muted-foreground'}`}>
            <ShoppingBag size={22} strokeWidth={location.pathname === '/shop/cart' ? 2.5 : 2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-accent text-[8px] font-bold text-accent-foreground flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-tight">Cart</span>
          </Link>
          <Link to={isAuthenticated ? "/user" : "/login"} className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${location.pathname.startsWith('/user') ? 'text-accent' : 'text-muted-foreground'}`}>
            <User size={22} strokeWidth={location.pathname.startsWith('/user') ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{isAuthenticated ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
