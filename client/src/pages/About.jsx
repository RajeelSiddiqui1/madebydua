import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, HandMetal, Leaf, HeartHandshake, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const stats = [
  { value: '10+', label: 'Years of Craft' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '500+', label: 'Unique Pieces' },
  { value: '100%', label: 'Handmade' },
];

const values = [
  { icon: HandMetal, title: 'Handcrafted Excellence', desc: 'Every piece is meticulously crafted by skilled artisans.' },
  { icon: Leaf, title: 'Sustainable Practice', desc: 'We use natural, eco-friendly materials and sustainable methods.' },
  { icon: HeartHandshake, title: 'Made with Love', desc: 'We put passion and care into every piece.' },
];

const process = [
  { step: 1, title: 'Sourcing Clay', desc: 'Premium sustainable clay' },
  { step: 2, title: 'Shaping', desc: 'Hand-thrown on wheel' },
  { step: 3, title: 'Firing', desc: 'Kiln-fired for durability' },
  { step: 4, title: 'Glazing', desc: 'Hand-applied finishes' },
];

const About = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="text-2xl font-bold tracking-tight shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
              NewDua
            </Link>
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for handcrafted pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/page/user' },
                { name: 'Collections', path: '/page/user' },
                { name: 'About', path: '/about' }
              ].map((item) => (
                <Link key={item.name} to={item.path} className={item.name === 'About' ? 'text-accent' : 'hover:text-accent transition-colors'}>
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/page/user" className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  My Account
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Login</Link>
                  <Link to="/register" className="px-4 py-1.5 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors hidden sm:block">Sign Up</Link>
                </>
              )}
              <button className="p-2 hover:text-accent transition-colors"><Heart size={20} /></button>
              <button className="p-2 hover:text-accent transition-colors"><ShoppingBag size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-secondary py-16 lg:py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider mb-4">Our Story</span>
          <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            The Art of <span className="italic text-accent">Handcrafted</span> Pottery
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            We believe that every piece of pottery tells a story. Each creation is born from clay, shaped by hands, and fired with passion.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&h=500&fit=crop"
              alt="Pottery making"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              A Journey of <span className="italic text-accent">Craftsmanship</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                NewDua was founded with a simple vision: to bring the ancient art of pottery into modern homes. What started as a small studio has grown into a beloved brand, trusted by thousands of customers worldwide.
              </p>
              <p>
                Every piece we create is a testament to the timeless beauty of handcrafted ceramics. We source the finest clay, use traditional techniques passed down through generations, and add our own contemporary flair.
              </p>
              <p>
                Our artisans pour their heart and soul into every creation, ensuring that each piece is unique and carries the warmth of human touch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-card py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-medium uppercase tracking-widest mb-1 block">Our Values</span>
            <h2 className="text-3xl lg:text-4xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center p-8 rounded-2xl bg-background border border-border hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <v.icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-1 block">Our Process</span>
          <h2 className="text-3xl lg:text-4xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>How We Create</h2>
          <p className="text-muted-foreground mt-2">From clay to finished piece</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {process.map((p) => (
            <div key={p.step} className="text-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {p.step}
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{s.value}</p>
              <p className="text-sm opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-light mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Ready to Adorn Your Home?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Explore our collection of handcrafted pottery and bring the warmth of artisanal craftsmanship into your home.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/page/user"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Shop Collection
              <ChevronRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
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
                  <li key={l}><a href="#" className="hover:opacity-100 transition-opacity">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm opacity-70">
                {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'FAQ'].map((l) => (
                  <li key={l}><a href="#" className="hover:opacity-100 transition-opacity">{l}</a></li>
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
    </div>
  );
};

export default About;
