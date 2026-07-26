import { useState } from 'react';
import { useOrders, type OrderItem } from '../../hooks/useOrders';
import { 
  ShoppingCart, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Database,
  Eye,
  X,
  User,
  Phone,
  MapPin,
  Tag,
  Package,
  Calendar,
  Sparkles
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Packed: 'bg-purple-100 text-purple-800 border-purple-200',
  Shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200'
};

export default function OrdersManager() {
  const { orders, loading, updateOrderStatus, seedSampleOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    setUpdatingId(orderId);
    setSuccessMsg(null);
    const result = await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
    if (result.success) {
      setSuccessMsg(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      alert('Failed to update status: ' + result.error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items_summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shipping_address?.fullName || order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shipping_address?.phone || order.customer_phone || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Order Manager</h1>
          <p className="text-xs text-gray-500">View complete customer order details and update live tracking statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={seedSampleOrders}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            Seed Sample Orders
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filter Pills & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${selectedStatus === status 
                  ? 'bg-[#8C4A27] text-white font-semibold' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              `}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C4A27] mb-2" />
            <span className="text-xs">Fetching orders from Supabase...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Place a test order from the store or click "Seed Sample Orders".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Live Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const addr = order.shipping_address;
                  const name = addr?.fullName || order.customer_name || 'Valued Customer';
                  const phone = addr?.phone || order.customer_phone || 'N/A';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">+91 {phone}</div>
                      </td>
                      <td className="p-4 max-w-sm">
                        {addr?.cart_items && addr.cart_items.length > 0 ? (
                          <div className="space-y-1.5">
                            {addr.cart_items.map((item: any, idx: number) => {
                              const itemImg = item.image || item.custom_images?.[0] || '/images/home_brownies.jpg';
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <img 
                                    src={itemImg} 
                                    alt={item.title} 
                                    className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                  />
                                  <div className="text-xs font-medium text-gray-900 truncate">
                                    <span className="font-semibold text-gray-900">{item.title}</span> {item.size ? <span className="text-[10px] text-gray-500">({item.size})</span> : null} <span className="text-xs font-bold text-[#8C4A27]">x{item.quantity}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-gray-800 text-xs">
                            <img 
                              src="/images/home_brownies.jpg" 
                              alt="Product thumbnail" 
                              className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                            />
                            <span>{order.items_summary || 'Custom Order'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-sans font-extrabold text-[#111827] text-sm sm:text-base tracking-tight">
                        ₹{order.total_amount}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>

                        {updatingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#8C4A27] inline-block ml-2" />
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-md p-1 focus:outline-none focus:border-[#8C4A27] cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF6F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C4A27] tracking-wider">Complete Order Details</span>
                <h3 className="font-serif font-bold text-xl text-gray-900 flex items-center gap-2">
                  Order #{selectedOrder.id.slice(0, 8)}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Order Status & Date */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 font-medium flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C4A27]" /> Order Date:
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-medium block mb-1">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Customer Information Block */}
              <div className="space-y-2 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#8C4A27]" /> Customer Details
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF6F0]/60 rounded-xl">
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px]">FULL NAME</span>
                    <span className="font-semibold text-gray-900">
                      {selectedOrder.shipping_address?.fullName || selectedOrder.customer_name || 'Customer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px]">PHONE NUMBER</span>
                    <span className="font-mono font-semibold text-gray-900 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#8C4A27]" /> +91 {selectedOrder.shipping_address?.phone || selectedOrder.customer_phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Block */}
              <div className="space-y-2 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8C4A27]" /> Delivery Address
                </h4>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-gray-700 font-medium">
                  <p>{selectedOrder.shipping_address?.address || 'Standard Delivery Address'}</p>
                  <p className="text-gray-500">
                    City: <strong className="text-gray-900">{selectedOrder.shipping_address?.city || 'N/A'}</strong> • Pincode: <strong className="text-gray-900">{selectedOrder.shipping_address?.pincode || 'N/A'}</strong>
                  </p>
                </div>
              </div>

              {/* Items Summary & Customization Data */}
              <div className="space-y-3 border-b border-gray-100 pb-4">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#8C4A27]" /> Items Ordered &amp; Customizations
                </h4>
                
                {selectedOrder.shipping_address?.cart_items && selectedOrder.shipping_address.cart_items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.shipping_address.cart_items.map((item: any, idx: number) => {
                      const knownKeywords = ['frame', 'brownie', 'hamper', 'box', 'gift', 'chocolate', 'biscoff', 'nutella', 'walnut', 'collage', 'wooden', 'memories', 'classic', 'minimal'];
                      const titleLower = (item.title || '').toLowerCase();
                      const hasKeyword = knownKeywords.some(kw => titleLower.includes(kw));

                      // If title was accidentally saved as custom text (like "inayath")
                      const realTitle = hasKeyword && titleLower !== 'inayath' ? item.title : 'Memories Collage Frame';
                      const customText = item.custom_text || (!hasKeyword ? item.title : null);

                      return (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-900">{realTitle} {item.size ? `(${item.size})` : ''}</span>
                            <span className="font-semibold text-gray-700">Qty: {item.quantity} • ₹{item.price}</span>
                          </div>

                          {/* Customer Customization Details (Photos & Custom Text) */}
                          {(item.custom_images?.length > 0 || customText || item.is_customizable) && (
                            <div className="p-3 bg-[#FAF6F0] border border-[#8C4A27]/30 rounded-lg space-y-2.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C4A27]">
                                <Sparkles className="w-3.5 h-3.5" /> Customer Print Details
                              </div>

                              {/* Custom Text */}
                              {customText && (
                                <div className="text-xs">
                                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Custom Text to Print:</span>
                                  <span className="font-bold text-[#2C1A14] bg-white px-2.5 py-1 rounded border border-[#8C4A27]/20 inline-block mt-0.5 shadow-2xs">
                                    "{customText}"
                                  </span>
                                </div>
                              )}

                              {/* Custom Uploaded Images */}
                              {item.custom_images && item.custom_images.length > 0 && (
                                <div>
                                  <span className="text-gray-500 block text-[10px] font-bold uppercase mb-1">Uploaded Photo(s) ({item.custom_images.length}):</span>
                                  <div className="flex flex-wrap gap-2">
                                    {item.custom_images.map((imgUrl: string, i: number) => (
                                      <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#8C4A27]/40 shadow-2xs hover:opacity-90 transition-opacity">
                                        <img src={imgUrl} alt={`Customer upload ${i+1}`} className="w-full h-full object-cover" />
                                      </a>
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-gray-400 mt-1 block">Click photo to open full high-res image.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl font-medium text-gray-800 leading-relaxed text-xs">
                    {selectedOrder.items_summary || 'Gourmet Brownies & Custom Gifts'}
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#8C4A27]" /> Payment Summary
                </h4>
                <div className="p-4 bg-[#FAF6F0] rounded-xl space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges</span>
                    <span className="font-bold text-[#2E7D32]">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-gray-900">Cash on Delivery (Pending)</span>
                  </div>
                  <div className="border-t border-gray-200/80 pt-2 flex justify-between text-base font-extrabold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-[#111827] font-extrabold text-xl">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer / Status Update Action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Change Status:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-lg p-2 focus:outline-none focus:border-[#8C4A27] cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
