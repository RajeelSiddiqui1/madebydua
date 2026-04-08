import { Link } from 'react-router-dom';
import { HandMetal, Leaf, HeartHandshake, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { wishlistAPI } from '../services/api';

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
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await wishlistAPI.getAll();
          setWishlistCount(response.data?.length || 0);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
        }
      }
    };
    fetchWishlistCount();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header 
        cartCount={0} // This can be managed by a context or passed from App
        wishlistCount={wishlistCount}
        navLinks={[
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Collections', path: '/shop' },
          { name: 'About', path: '/about' }
        ]}
        showAuthButtons={true}
        showSearch={true}
      />

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
                Handmade By Dua was founded with a simple vision: to bring the ancient art of pottery into modern homes. What started as a small studio has grown into a beloved brand, trusted by thousands of customers worldwide.
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
      <section className="bg-primary text-white py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
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
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Shop Collection
              <ChevronRight size={16} />
            </Link>
            <Link
              to="https://wa.me/923133992762"
              className="inline-flex items-center gap-2 px-8 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
