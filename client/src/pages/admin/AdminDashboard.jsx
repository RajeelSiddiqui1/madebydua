import { useEffect, useState } from 'react';
import { categoryAPI, productAPI, couponAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    coupons: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, productsRes, couponsRes] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getAll(),
          couponAPI.getAll(),
        ]);
        setStats({
          categories: categoriesRes.data.length || 0,
          products: productsRes.data.length || 0,
          coupons: couponsRes.data.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Categories', count: stats.categories, color: 'bg-blue-500' },
    { title: 'Products', count: stats.products, color: 'bg-green-500' },
    { title: 'Coupons', count: stats.coupons, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className={`${card.color} text-white rounded-lg p-6 shadow-lg`}>
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="text-4xl font-bold mt-2">{card.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
