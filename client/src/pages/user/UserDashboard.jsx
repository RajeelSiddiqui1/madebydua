import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, SlidersHorizontal, SearchX, ShoppingBag } from 'lucide-react';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const category = searchParams.get('category') || '';
    setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Sync category via URL when selected category changes
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.category?._id === selectedCategory ||
          product.category === selectedCategory ||
          product.category?.name === selectedCategory
      )
    : products;

  const activeProducts = filteredProducts.filter(
    (product) => product.active !== false
  );

  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) return item.image;
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

  const getDiscountPercent = (product) => {
    if (product.comparePrice && product.price && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium" style={{ fontFamily: 'var(--font-serif)' }}>Loading pieces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 font-semibold mb-6 pb-4 border-b border-border">
              <SlidersHorizontal size={20} />
              <span className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>Filters</span>
            </div>

            <div className="mb-8">
              <h3 className="font-medium text-sm uppercase tracking-wider mb-4 flex items-center justify-between cursor-pointer">
                Categories
                <ChevronDown size={16} />
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`text-sm flex items-center gap-3 transition-colors w-full text-left ${
                      selectedCategory === '' ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedCategory === '' ? 'border-accent' : 'border-muted-foreground/30'
                    }`}>
                      {selectedCategory === '' && <div className="w-2 h-2 rounded-full bg-accent" />}
                    </div>
                    All Products
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      onClick={() => handleCategorySelect(category._id)}
                      className={`text-sm flex items-center gap-3 transition-colors w-full text-left ${
                        selectedCategory === category._id || selectedCategory === category.name ? 'text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedCategory === category._id || selectedCategory === category.name ? 'border-accent' : 'border-muted-foreground/30'
                      }`}>
                        {(selectedCategory === category._id || selectedCategory === category.name) && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {activeProducts.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-border flex flex-col items-center">
              <SearchX size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>No products found</h3>
              <p className="text-muted-foreground max-w-sm">We couldn't find anything matching your selected category. Please try changing your filters.</p>
              <button 
                onClick={() => handleCategorySelect('')}
                className="mt-6 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
              {activeProducts.map((product) => (
                <div key={product._id} className="group flex flex-col">
                  <Link
                    to={`/product/${product._id}`}
                    className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-muted mb-4 border border-border/50 block"
                  >
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       {product.isFeatured && (
                         <span className="bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                           Featured
                         </span>
                       )}
                       {getDiscountPercent(product) > 0 && (
                         <span className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                           -{getDiscountPercent(product)}%
                         </span>
                       )}
                    </div>
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button className="w-full py-3 bg-white/90 backdrop-blur-md text-foreground rounded-full font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-white">
                        <ShoppingBag size={14} /> View Details
                      </button>
                    </div>
                  </Link>
                  
                  <div className="px-1 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">{product.category?.name || 'Uncategorized'}</p>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-lg font-bold text-foreground mb-2 truncate group-hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-base font-bold text-foreground">
                        Rs.{product.price}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through font-medium">
                          Rs.{product.comparePrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
