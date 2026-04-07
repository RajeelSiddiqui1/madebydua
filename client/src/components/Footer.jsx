import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>NewDua</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Discover our unique collection of handcrafted ceramics. Each piece is made with love and care.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {['Home', 'Shop', 'Collections', 'About Us'].map((l) => (
                <li key={l}>
                  <Link to={l === 'Home' ? '/' : l === 'Shop' ? '/shop' : '#'} className="hover:opacity-100 transition-opacity">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">My Account</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {isAuthenticated ? (
                <>
                  <li><Link to="/user" className="hover:opacity-100 transition-opacity">My Profile</Link></li>
                  <li><Link to="/user/orders" className="hover:opacity-100 transition-opacity">My Orders</Link></li>
                  <li><Link to="/user/wishlist" className="hover:opacity-100 transition-opacity">Wishlist</Link></li>
                  <li><Link to="/shop/cart" className="hover:opacity-100 transition-opacity">Cart</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:opacity-100 transition-opacity">Login</Link></li>
                  <li><Link to="/register" className="hover:opacity-100 transition-opacity">Register</Link></li>
                </>
              )}
            </ul>
          </div>
         
        </div>
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-xs opacity-50">
          © 2024 NewDua. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
