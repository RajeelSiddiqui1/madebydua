import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm opacity-70">
              {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'FAQ'].map((l) => (
                <li key={l}><Link to="#" className="hover:opacity-100 transition-opacity">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-sm opacity-70 mb-3">Subscribe for updates and exclusive offers.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-l-lg text-sm bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none"
              />
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-r-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
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
