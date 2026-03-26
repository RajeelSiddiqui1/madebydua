import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cartAPI } from '../services/api';

const Shop = () => {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (isAuthenticated) {
        try {
          const cartRes = await cartAPI.getCart();
          setCartCount(cartRes.data?.products?.length || 0);
        } catch (error) {
          console.error('Error fetching counts:', error);
        }
      }
    };
    fetchCounts();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header cartCount={cartCount} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
