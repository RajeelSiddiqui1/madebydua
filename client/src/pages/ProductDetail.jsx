import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI, wishlistAPI, ratingAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Star } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

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

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (isAuthenticated && product) {
        try {
          const response = await wishlistAPI.getAll();
          const wishlistItems = response.data || [];
          setIsInWishlist(wishlistItems.some((item) => item._id === product._id));
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    };
    checkWishlist();
  }, [isAuthenticated, product]);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (product) {
        try {
          const response = await ratingAPI.getProductRatings(product._id);
          setRatings(response.data.ratings || []);
          setAverageRating(response.data.averageRating || 0);

          // Check if user has already rated
          if (user) {
            const existingRating = response.data.ratings?.find(
              (r) => r.user?._id === user._id
            );
            if (existingRating) {
              setUserRating(existingRating.rating);
              setRatingComment(existingRating.comment || '');
            }
          }
        } catch (error) {
          console.error('Error fetching ratings:', error);
        }
      }
    };
    fetchRatings();
  }, [product, user]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(product._id);
        setIsInWishlist(false);
      } else {
        await wishlistAPI.add(product._id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRatingLoading(true);
    try {
      await ratingAPI.rateProduct(product._id, { rating, comment: ratingComment });
      // Refresh ratings
      const response = await ratingAPI.getProductRatings(product._id);
      setRatings(response.data.ratings || []);
      setAverageRating(response.data.averageRating || 0);
      setUserRating(rating);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCartLoading(true);
    try {
      await cartAPI.addToCart(product._id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }


  const getImageUrl = (item) => {
    if (item.image && item.image.startsWith('http')) {
      return item.image;
    }
    return item.image ? `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.image}` : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop';
  };

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
        <div className="bg-gray-100 rounded-lg overflow-hidden relative">
          {product.image ? (
            <img
              src={ `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${product.image}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
          {/* Out of Stock Badge */}
          {(!product.quantity || product.quantity <= 0) && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          {categoryName && (
            <p className="text-sm text-gray-500 mb-2">Category: {categoryName}</p>
          )}

          {/* Rating Display */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={` ${star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {averageRating.toFixed(1)} ({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

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

          {/* Add to Cart & Wishlist */}
          <div className="mt-8 flex gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${addedToCart ? 'bg-green-600' : ''}`}
                >
                  <ShoppingBag size={20} />
                  {addedToCart ? 'Added!' : cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`p-3 rounded-lg border-2 transition-colors flex items-center gap-2 ${isInWishlist
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-red-500 hover:text-red-500'
                    }`}
                >
                  <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Login to Add to Cart
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="p-3 rounded-lg border-2 border-gray-300 text-gray-500"
                >
                  <Heart size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Rating Section */}
          {isAuthenticated && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Rate this product</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingSubmit(star)}
                    disabled={ratingLoading}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={` ${star <= userRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                        } transition-colors`}
                    />
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    You rated this {userRating} star{userRating > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Write a comment (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                {userRating > 0 && (
                  <button
                    onClick={() => handleRatingSubmit(userRating)}
                    disabled={ratingLoading}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {ratingLoading ? 'Submitting...' : 'Update Review'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reviews List */}
          {ratings.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {ratings.map((rating, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={` ${star <= rating.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {rating.user?.name || rating.user?.email || 'Anonymous'}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-600 text-sm">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                      src={
                      
                          `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${relProduct.image}`
                         } 
                      alt={relProduct.name || "Product"}
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
