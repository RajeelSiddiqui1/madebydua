import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        setProducts(productsRes.data?.filter(p => p.active !== false) || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              MakeIt
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/page/user" className="text-gray-300 hover:text-white transition-colors">
                Shop
              </Link>
              {isAuthenticated ? (
                <Link to="/page/user" className="text-gray-300 hover:text-white transition-colors">
                  My Account
                </Link>
              ) : (
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-pink-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            TRENDING FASHION
          </h1>
          <p className="text-xl mb-8 text-pink-100">
            Discover the latest styles and express your unique personality
          </p>
          <Link
            to="/page/user"
            className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/page/user?category=${category._id}`}
              className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-400 mt-2">{category.description}</p>
              )}
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-400 col-span-4 text-center">
              No categories available
            </p>
          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors border border-gray-700 group"
              >
                <div className="h-64 bg-gray-700 relative">
                  {product.image ? (
                    <img
                      src={`http://localhost:5007/uploads/product/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-pink-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.category?.name || 'Uncategorized'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-pink-500">
                      ${product.price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No featured products available</p>
        )}
      </div>

      {/* All Products CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <h2 className="text-3xl font-bold mb-4">Browse All Products</h2>
          <p className="text-gray-400 mb-6">
            Explore our complete collection of products
          </p>
          <Link
            to="/page/user"
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors inline-block"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2024 MakeIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
