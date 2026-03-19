import { useEffect, useState } from 'react';
import { categoryAPI, productAPI } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [imageFile, setImageFile] = useState(null);

  const fetchCategories = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, submitData);
      } else {
        await categoryAPI.create(submitData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
      setImageFile(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug || '' });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.delete(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    const relatedProducts = products.filter(
      (p) => p.category?._id === category._id || p.category === category._id
    );
    setCategoryProducts(relatedProducts);
    setShowDetailModal(true);
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
    setImageFile(null);
    setShowModal(true);
  };

  const getProductCount = (categoryId) => {
    return products.filter(
      (p) => p.category?._id === categoryId || p.category === categoryId
    ).length;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category.image ? (
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_CATEGORY}/${category.image}`} 
                      alt={category.name} 
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      No img
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{category.name}</td>
                <td className="px-6 py-4">{category.slug || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {getProductCount(category._id)} Products
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(category)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">No categories found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit}>
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
                  slug
                </label>
                <textarea
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category Image
                </label>
                {editingCategory?.image && !imageFile && (
                  <div className="mb-2">
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_CATEGORY}/${editingCategory.image}`} 
                      alt={editingCategory.name} 
                      className="h-20 w-20 object-cover rounded" 
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">
              {selectedCategory.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedCategory.slug || 'No slug'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Total Products: {categoryProducts.length}
            </p>
            
            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryProducts.map((product) => (
                  <div key={product._id} className="border rounded-lg p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                      {product.image ? (
                        <img
                          src={`http://localhost:5007/uploads/product/${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.shortDesc || 'No slug'}</p>
                      <p className="text-blue-600 font-bold mt-1">Rs.{product.price}</p>
                      <span className={`text-xs ${product.active ? 'text-green-600' : 'text-red-600'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No products in this category</p>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
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

export default AdminCategories;
