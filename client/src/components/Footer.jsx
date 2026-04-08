import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-primary text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-6 text-center sm:text-left">
            <h3 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>Handmade By Dua</h3>
            <p className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto sm:mx-0">
            Each piece is handmade with care to add warmth and beauty to your home
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-white">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              {['Home', 'Shop', 'Collections', 'About Us'].map((l) => (
                <li key={l}>
                  <Link to={l === 'Home' ? '/' : l === 'Shop' ? '/shop' : '#'} className="text-white hover:text-accent transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: My Account */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-white">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              {isAuthenticated ? (
                <>
                  <li><Link to="/user" className="text-white hover:text-accent transition-colors">My Profile</Link></li>
                  <li><Link to="/user" className="text-white hover:text-accent transition-colors">My Orders</Link></li>
                  <li><Link to="/shop/cart" className="text-white hover:text-accent transition-colors">Shopping Cart</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="text-white hover:text-accent transition-colors">Login</Link></li>
                  <li><Link to="/register" className="text-white hover:text-accent transition-colors">Register</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Brand Promises (Right Side) */}
          <div className="text-center sm:text-left space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10 lg:bg-transparent lg:p-0 lg:border-0 lg:rounded-none">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-2 text-white">Why Us?</h4>
            <div className="space-y-5">
              {[
                { title: "Repeated Customer", desc: "10% off on your next purchase." },
                { title: "Careful Packaging", desc: "Securely double-wrapped." },
                { title: "Prepaid Order", desc: "Free delivery above Rs. 3499." },
                { title: "Pakistan Delivery", desc: "Nationwide shipping service." }
              ].map((promise, i) => (
                <div key={i} className="group">
                  <h5 className="text-[13px] font-bold text-accent mb-0.5">{promise.title}</h5>
                  <p className="text-[11px] text-white leading-tight">{promise.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <p>© {new Date().getFullYear()} Handmade By Dua. All rights reserved.</p>
          <div className="flex gap-6">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
