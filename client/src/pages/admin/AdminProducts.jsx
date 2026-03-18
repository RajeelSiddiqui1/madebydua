import { useEffect, useState } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Star, Heart, Package, Edit, Trash2, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortDesc: '',
    longDesc: '',
    price: '',
    comparePrice: '',
    category: '',
    isFeatured: false,
    active: true,
    quantity: 0,
    image: null,
  });

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
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('shortDesc', formData.shortDesc);
    data.append('longDesc', formData.longDesc);
    data.append('price', formData.price);
    data.append('comparePrice', formData.comparePrice);
    data.append('category', formData.category);
    data.append('isFeatured', formData.isFeatured);
    data.append('active', formData.active);
    data.append('quantity', formData.quantity || 0);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, data);
      } else {
        await productAPI.create(data);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      shortDesc: product.shortDesc || '',
      longDesc: product.longDesc || '',
      price: product.price,
      comparePrice: product.comparePrice || '',
      category: product.category._id || product.category,
      isFeatured: product.isFeatured || false,
      active: product.active !== false,
      quantity: product.quantity || 0,
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const newStatus = !product.active;
      const data = new FormData();
      data.append('active', newStatus);
      data.append('name', product.name);
      data.append('price', product.price);
      await productAPI.update(product._id, data);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const updateProductQuantity = async (product, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) return;
    try {
      const data = new FormData();
      data.append('quantity', qty);
      data.append('name', product.name);
      data.append('price', product.price);
      await productAPI.update(product._id, data);
      fetchProducts();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleViewDetails = async (product) => {
    try {
      // Fetch the full product with ratings and wishlist
      const response = await productAPI.getById(product._id);
      setSelectedProduct(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedProduct(product);
      setShowDetailModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortDesc: '',
      longDesc: '',
      price: '',
      comparePrice: '',
      category: '',
      isFeatured: false,
      active: true,
      quantity: 0,
      image: null,
    });
  };

  const openModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (c) => c._id === categoryId || c._id === categoryId?._id
    );
    return category?.name || 'Unknown';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.image ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${product.image}`}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                      No img
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryName(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    defaultValue={product.quantity || 0}
                    onBlur={(e) => updateProductQuantity(product, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateProductQuantity(product, e.target.value);
                        e.target.blur();
                      }
                    }}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.isFeatured ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleProductStatus(product)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                      product.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(product)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">No products found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Compare Price
                  </label>
                  <input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity (Stock)
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Long Description
                </label>
                <textarea
                  value={formData.longDesc}
                  onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                />
                {editingProduct?.image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current: {editingProduct.image}
                  </p>
                )}
              </div>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex gap-6 flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                {selectedProduct.image ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  Category: {getCategoryName(selectedProduct.category)}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${selectedProduct.price}
                  </span>
                  {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ${selectedProduct.comparePrice}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded ${selectedProduct.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedProduct.isFeatured ? 'Featured' : 'Not Featured'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${selectedProduct.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedProduct.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-500">Stock Quantity</p>
                  <p className={`text-lg font-bold ${selectedProduct.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.quantity || 0} units
                  </p>
                </div>
                {selectedProduct.shortDesc && (
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm">Short Description</h3>
                    <p className="text-gray-600 text-sm">{selectedProduct.shortDesc}</p>
                  </div>
                )}
                {selectedProduct.longDesc && (
                  <div>
                    <h3 className="font-semibold text-sm">Long Description</h3>
                    <p className="text-gray-600 text-sm">{selectedProduct.longDesc}</p>
                  </div>
                )}
                
                {/* Ratings & Reviews */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Reviews ({selectedProduct.ratings?.length || 0})
                  </h3>
                  {selectedProduct.ratings && selectedProduct.ratings.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedProduct.ratings.map((rating, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={`${star <= rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{rating.user?.name || 'Anonymous'}</span>
                          </div>
                          {rating.comment && <p className="text-gray-600 text-xs">{rating.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No reviews yet</p>
                  )}
                </div>

                {/* Wishlist Count */}
                <div className="mt-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Heart size={14} className="text-red-500" />
                    {selectedProduct.wishList?.length || 0} users in wishlist
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
