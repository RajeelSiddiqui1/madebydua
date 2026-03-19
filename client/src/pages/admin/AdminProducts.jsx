import { useEffect, useState } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Star, Edit, Trash2, X, Image, Plus } from 'lucide-react';

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
    images: [],
    mainImage: '',
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({ ...formData, images: [...formData.images, ...files] });
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviews]);
    }
  };

  const removeNewImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    
    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const removeExistingImage = async (imageName) => {
    if (!editingProduct?._id) return;
    
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await productAPI.deleteImage(editingProduct._id, imageName);
        const newExistingImages = existingImages.filter(img => img !== imageName);
        setExistingImages(newExistingImages);
        
        // Update main image if deleted image was main
        if (editingProduct.image === imageName) {
          setEditingProduct({ ...editingProduct, image: newExistingImages[0] || '' });
        }
        fetchProducts();
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const setAsMainImage = (imageName) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: imageName });
    }
  };

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
    
    // Append multiple images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image) => {
        data.append('images', image);
      });
    }
    
    // Set main image if editing
    if (editingProduct) {
      data.append('mainImage', editingProduct.image || '');
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
      images: [],
      mainImage: product.image || '',
    });
    setPreviewImages([]);
    // Set existing images from product
    setExistingImages(product.images || []);
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
    if (isNaN(qty) < 0) return;
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
      images: [],
      mainImage: '',
    });
    setPreviewImages([]);
    setExistingImages([]);
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

  const getImageUrl = (imageName) => {
    return `${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${imageName}`;
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
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
                  <div className="flex items-center gap-1">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        <Image size={16} />
                      </div>
                    )}
                    {(product.images && product.images.length > 1) && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                        +{product.images.length - 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryName(product.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rs.{product.price}
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
              
              {/* Multiple Images Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Images (Select Multiple)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                />
                
                {/* Existing Images (when editing) */}
                {existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={getImageUrl(img)}
                            alt={`Image ${idx + 1}`}
                            className={`h-20 w-20 object-cover rounded ${editingProduct?.image === img ? 'ring-2 ring-blue-500' : ''}`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                            <button
                              type="button"
                              onClick={() => setAsMainImage(img)}
                              className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                              title="Set as main"
                            >
                              Main
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img)}
                              className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                              title="Delete"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          {editingProduct?.image === img && (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Preview Images */}
                {previewImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">New Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {previewImages.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {/* Multiple Images in Detail Modal */}
            <div className="mb-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden mb-3">
                {selectedProduct.image ? (
                  <img
                    src={getImageUrl(selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-contain"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {(selectedProduct.images && selectedProduct.images.length > 1) && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedProduct.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`h-16 w-16 object-cover rounded cursor-pointer ${selectedProduct.image === img ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => {
                        // Could add click to change main image
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              Category: {getCategoryName(selectedProduct.category)}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-blue-600">
                Rs.{selectedProduct.price}
              </span>
              {selectedProduct.comparePrice && selectedProduct.comparePrice > selectedProduct.price && (
                <span className="text-lg text-gray-400 line-through">
                  Rs.{selectedProduct.comparePrice}
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
              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                Stock: {selectedProduct.quantity || 0}
              </span>
            </div>
            {selectedProduct.shortDesc && (
              <p className="text-gray-600 mb-2">{selectedProduct.shortDesc}</p>
            )}
            {selectedProduct.longDesc && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedProduct.longDesc}</p>
              </div>
            )}
            
            {/* Ratings */}
            {selectedProduct.ratings && selectedProduct.ratings.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Ratings</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${star <= Math.round(selectedProduct.ratings.reduce((acc, r) => acc + r.rating, 0) / selectedProduct.ratings.length)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({selectedProduct.ratings.length} reviews)
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedProduct);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
