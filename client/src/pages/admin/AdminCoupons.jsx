import { useEffect, useState } from 'react';
import { couponAPI, productAPI } from '../../services/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponProducts, setCouponProducts] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    minQuantity: 1,
    expiryDate: '',
    active: true,
    quantity: null,
    products: [],
  });

  const fetchCoupons = async () => {
    try {
      const [couponsRes, productsRes] = await Promise.all([
        couponAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCoupons(couponsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      code: formData.code.toUpperCase(),
      discountPercent: Number(formData.discountPercent),
      minQuantity: Number(formData.minQuantity),
      expiryDate: formData.expiryDate || null,
      active: formData.active,
      quantity: formData.quantity ? Number(formData.quantity) : null,
      products: formData.products,
    };

    try {
      if (editingCoupon) {
        await couponAPI.update(editingCoupon._id, data);
      } else {
        await couponAPI.create(data);
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponAPI.delete(id);
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      await couponAPI.update(coupon._id, { active: !coupon.active });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    }
  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    // Get products associated with this coupon
    if (coupon.products && coupon.products.length > 0) {
      const relatedProducts = products.filter((p) =>
        coupon.products.includes(p._id)
      );
      setCouponProducts(relatedProducts);
    } else {
      setCouponProducts([]);
    }
    setShowDetailModal(true);
  };

  const handleProductSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, products: selectedOptions });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercent: '',
      minQuantity: 1,
      expiryDate: '',
      active: true,
      quantity: null,
      products: [],
    });
  };

  const openModal = () => {
    setEditingCoupon(null);
    resetForm();
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => {
              const productCount = coupon.products?.length || 0;
              const expired = isExpired(coupon.expiryDate);
              const isUnlimited = coupon.quantity === null;
              
              return (
                <tr key={coupon._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.discountPercent}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isUnlimited ? '∞' : coupon.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.usedCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.minQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={expired ? 'text-red-600' : ''}>
                      {formatDate(coupon.expiryDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      {productCount === 0 ? 'All' : `${productCount} Products`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCouponStatus(coupon)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                        coupon.active && !expired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coupon.active && !expired ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(coupon)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setEditingCoupon(coupon);
                        setFormData({
                          code: coupon.code,
                          discountPercent: coupon.discountPercent,
                          minQuantity: coupon.minQuantity || 1,
                          expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
                          active: coupon.active,
                          quantity: coupon.quantity,
                          products: coupon.products || [],
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="text-center py-8 text-gray-500">No coupons found</div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Quantity Limit (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Apply to Products (leave empty for all products)
                </label>
                <select
                  multiple
                  value={formData.products}
                  onChange={handleProductSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - Rs.{product.price}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple products
                </p>
              </div>
              <div className="mb-4">
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Coupon: {selectedCoupon.code}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Discount</p>
                <p className="text-2xl font-bold text-green-600">{selectedCoupon.discountPercent}% OFF</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Quantity Limit</p>
                <p className="text-2xl font-bold">
                  {selectedCoupon.quantity === null ? '∞ Unlimited' : selectedCoupon.quantity}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Used Count</p>
                <p className="text-2xl font-bold">{selectedCoupon.usedCount || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Minimum Quantity</p>
                <p className="text-2xl font-bold">{selectedCoupon.minQuantity}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-semibold">{formatDate(selectedCoupon.expiryDate)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedCoupon.active && !isExpired(selectedCoupon.expiryDate)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedCoupon.active && !isExpired(selectedCoupon.expiryDate) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">
              Applicable Products ({couponProducts.length})
            </h3>
            
            {couponProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {couponProducts.map((product) => (
                  <div key={product._id} className="border rounded-lg p-4 flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
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
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-blue-600 font-bold">Rs.{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  This coupon applies to ALL products (no specific products selected)
                </p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
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

export default AdminCoupons;
