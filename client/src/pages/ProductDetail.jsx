import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        
        const allProducts = productRes.data || [];
        const foundProduct = allProducts.find((p) => p._id === id);
        setProduct(foundProduct || null);
        setCategories(categoriesRes.data || []);
        
        if (foundProduct) {
          const related = allProducts.filter(
            (p) =>
              p._id !== id &&
              p.category === foundProduct.category &&
              p.active !== false
          );
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
        <Link to="/page/user" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const categoryName = categories.find(
    (c) => c._id === product.category?._id || c._id === product.category
  )?.name;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <Link to="/page/user" className="text-blue-600 hover:underline">
          Products
        </Link>
        {categoryName && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{categoryName}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={`http://localhost:5007/uploads/product/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          {categoryName && (
            <p className="text-sm text-gray-500 mb-4">Category: {categoryName}</p>
          )}
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              ${product.price}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xl text-gray-400 line-through">
                ${product.comparePrice}
              </span>
            )}
          </div>

          {product.shortDesc && (
            <p className="text-gray-600 mb-4">{product.shortDesc}</p>
          )}

          {product.longDesc && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.longDesc}</p>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="mt-8">
            {isAuthenticated ? (
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            ) : (
              <div>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Login to Add to Cart
                </button>
                <p className="text-sm text-orange-500 mt-2">
                  Please login to add this product to your cart
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct._id}
                to={`/product/${relProduct._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200">
                  {relProduct.image ? (
                    <img
                      src={`http://localhost:5007/uploads/product/${relProduct.image}`}
                      alt={relProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{relProduct.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">${relProduct.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
