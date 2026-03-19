import { useEffect, useState } from 'react';
import { orderAPI, adminAPI } from '../../services/api';
import { Eye, Package, User, MapPin, CreditCard, X, Check, Smartphone, Building2, Image } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Handle payment verification
  const handlePaymentVerification = async (orderId, paymentStatus, rejectionReason = '') => {
    try {
      await adminAPI.updateOrderStatus(orderId, { 
        paymentStatus, 
        status: paymentStatus === 'verified' ? 'paid' : 'cancelled',
        paymentRejectionReason: rejectionReason 
      });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          paymentStatus, 
          status: paymentStatus === 'verified' ? 'paid' : 'cancelled',
          paymentRejectionReason: rejectionReason
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-600">
                      {order._id?.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm">
                        {order.user?.firstName || 'Unknown'} {order.user?.lastName || ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-sm">{order.products?.length || 0} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">Rs.{order.totalAmount?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.discountAmount > 0 ? (
                      <span className="text-green-600">-Rs.{order.discountAmount?.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {order.paymentMethod === 'cash_on_delivery' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                          <CreditCard size={12} /> COD
                        </span>
                      )}
                      {order.paymentMethod === 'easy paisa' && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                          <Smartphone size={12} /> EasyPaisa
                        </span>
                      )}
                      {order.paymentMethod === 'bank_transfer' && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1">
                          <Building2 size={12} /> Bank
                        </span>
                      )}
                    </div>
                    {order.paymentReceipt && (
                      <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Image size={12} /> Receipt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-gray-500 text-sm mt-1">Order ID: <span className="font-mono">{selectedOrder._id}</span></p>
                <p className="text-gray-500 text-sm">Placed on: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <User size={18} className="text-blue-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-blue-600" />
                Shipping Address
              </h3>
              <p className="text-sm">{selectedOrder.shippingAddress}</p>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Package size={18} className="text-blue-600" />
                Order Items ({selectedOrder.products?.length || 0})
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.products?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.product?.image && (
                              <img
                                src={`${import.meta.env.VITE_BACKEND_URL_PRODUCT_IMAGE}/${item.product.image}`}
                                alt={item.product?.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{item.product?.name || 'Product'}</p>
                              <p className="text-xs text-gray-500">{item.product?.category?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">Rs.{item.product?.price}</td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          Rs.{((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupons Used */}
            {selectedOrder.coupons && selectedOrder.coupons.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-green-600" />
                  Coupons Applied
                </h3>
                <div className="space-y-2">
                  {selectedOrder.coupons.map((coupon, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="font-mono bg-green-100 px-2 py-1 rounded">
                        {coupon.code || 'Coupon'}
                      </span>
                      <span className="text-green-600">-Rs.{coupon.discount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs.{((selectedOrder.totalAmount || 0) + (selectedOrder.discountAmount || 0)).toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-green-600">
                  <span>Discount</span>
                  <span>-Rs.{selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs.{selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <CreditCard size={18} className="text-blue-600" />
                Payment Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedOrder.paymentMethod === 'cash_on_delivery' && (
                    <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <CreditCard size={14} /> Cash on Delivery
                    </span>
                  )}
                  {selectedOrder.paymentMethod === 'easy paisa' && (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <Smartphone size={14} /> EasyPaisa
                    </span>
                  )}
                  {selectedOrder.paymentMethod === 'bank_transfer' && (
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                      <Building2 size={14} /> Bank Transfer
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedOrder.paymentStatus === 'verified' ? 'bg-green-100 text-green-700' :
                    selectedOrder.paymentStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.paymentStatus || 'pending'}
                  </span>
                </div>
                
                {/* Payment Receipt */}
                {selectedOrder.paymentReceipt && selectedOrder.paymentStatus === 'pending' && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Payment Receipt:</p>
                    <div className="flex items-start gap-3">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL_PAYMENTS || import.meta.env.VITE_BACKEND_URL?.replace('/api', '/uploads')}/${selectedOrder.paymentReceipt}`}
                        alt="Payment Receipt"
                        className="h-32 w-32 object-cover rounded border cursor-pointer hover:scale-150 transition-transform"
                        onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL_PAYMENTS || import.meta.env.VITE_BACKEND_URL?.replace('/api', '/uploads')}/uploads/payments/${selectedOrder.paymentReceipt}`, '_blank')}
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePaymentVerification(selectedOrder._id, 'verified')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check size={14} /> Verify Payment
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter reason for rejection:');
                            if (reason) {
                              handlePaymentVerification(selectedOrder._id, 'rejected', reason);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show rejection reason if rejected */}
                {selectedOrder.paymentStatus === 'rejected' && selectedOrder.paymentRejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-700">Payment Rejected</p>
                    <p className="text-xs text-red-600 mt-1">Reason: {selectedOrder.paymentRejectionReason}</p>
                  </div>
                )}
                
                {/* Show verified status */}
                {selectedOrder.paymentStatus === 'verified' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-700">✓ Payment Verified</p>
                  </div>
                )}
                
                {selectedOrder.paymentMethod !== 'cash_on_delivery' && !selectedOrder.paymentReceipt && (
                  <p className="text-sm text-yellow-600 mt-2">Waiting for payment receipt upload...</p>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="mt-6 pt-4 border-t">
              <label className="block text-sm font-medium mb-2">Update Order Status</label>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedOrder._id, status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                      selectedOrder.status === status
                        ? getStatusColor(status)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
