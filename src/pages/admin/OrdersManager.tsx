import { useState } from 'react';
import { useOrders, type OrderItem } from '../../hooks/useOrders';
import { toCdnUrl } from '../../lib/cdn';
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
  Sparkles,
  CreditCard,
  Truck,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  RefreshCw,
  Box
} from 'lucide-react';

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  Confirmed: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-500' },
  Packed:    { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', dot: 'bg-violet-500' },
  Shipped:   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-500' },
  Cancelled: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-500' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {status}
    </span>
  );
};

const SectionCard = ({ icon, title, children, accent = false }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <div className={`rounded-2xl border overflow-hidden ${accent ? 'border-[#8C4A27]/20 bg-[#FDF8F4]' : 'border-gray-200 bg-white'}`}>
    <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${accent ? 'border-[#8C4A27]/15 bg-[#FAF3EC]' : 'border-gray-100 bg-gray-50'}`}>
      <span className={accent ? 'text-[#8C4A27]' : 'text-gray-500'}>{icon}</span>
      <h4 className={`font-bold text-sm tracking-tight ${accent ? 'text-[#5C2E10]' : 'text-gray-800'}`}>{title}</h4>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

export default function OrdersManager() {
  const { orders, loading, updateOrderStatus, seedSampleOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('');

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    setUpdatingId(orderId);
    setSuccessMsg(null);
    const result = await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
    if (result.success) {
      setSuccessMsg(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        setModalStatus(newStatus);
      }
    } else {
      alert('Failed to update status: ' + result.error);
    }
  };

  const openOrderModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setModalStatus(order.status);
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

  // ── Summary counts ─────────────────────────────────────────
  const countByStatus = (status: string) => orders.filter(o => o.status === status).length;
  const totalItems = orders.reduce((sum, o) => {
    const items = o.shipping_address?.cart_items;
    return sum + (Array.isArray(items) ? items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 1);
  }, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const statCards = [
    { key: 'All',       label: 'Total Orders',  value: orders.length,              sub: `${totalItems} items`,       icon: ShoppingCart,  bg: 'bg-white',         border: 'border-gray-200', text: 'text-gray-900', ring: 'ring-[#8C4A27]' },
    { key: 'Pending',   label: 'Pending',       value: countByStatus('Pending'),    sub: 'Awaiting confirmation',     icon: Package,       bg: 'bg-amber-50',      border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-500' },
    { key: 'Confirmed', label: 'Confirmed',     value: countByStatus('Confirmed'),  sub: 'Order accepted',           icon: CheckCircle2,  bg: 'bg-blue-50',       border: 'border-blue-200',  text: 'text-blue-700',  ring: 'ring-blue-500' },
    { key: 'Packed',    label: 'Packed',        value: countByStatus('Packed'),     sub: 'Ready to ship',            icon: Box,           bg: 'bg-violet-50',     border: 'border-violet-200',text: 'text-violet-700',ring: 'ring-violet-500' },
    { key: 'Shipped',   label: 'Shipped',       value: countByStatus('Shipped'),    sub: 'On the way',               icon: Truck,         bg: 'bg-indigo-50',     border: 'border-indigo-200',text: 'text-indigo-700',ring: 'ring-indigo-500' },
    { key: 'Delivered', label: 'Delivered',     value: countByStatus('Delivered'),  sub: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',ring: 'ring-emerald-500' },
    { key: 'Cancelled', label: 'Cancelled',     value: countByStatus('Cancelled'),  sub: 'Cancelled',                icon: X,             bg: 'bg-red-50',        border: 'border-red-200',   text: 'text-red-700',   ring: 'ring-red-500' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Order Manager</h1>
          <p className="text-xs text-gray-500">View complete customer order details and update live tracking statuses.</p>
        </div>
        <button
          onClick={seedSampleOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Database className="w-3.5 h-3.5" />
          Seed Sample Orders
        </button>
      </div>

      {/* ── KPI Stats Bar ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {statCards.map(({ key, label, value, sub, icon: Icon, bg, border, text, ring }) => {
          const isActive = selectedStatus === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedStatus(key)}
              className={`${bg} border ${isActive ? `${border} ring-2 ${ring} shadow-md scale-[1.02]` : `${border} opacity-85 hover:opacity-100 hover:shadow-sm`} rounded-2xl p-3 cursor-pointer transition-all group`}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5 truncate">{label}</p>
                  <p className={`text-2xl font-black ${text} leading-none`}>{loading ? '—' : value}</p>
                  <p className="text-[9px] mt-1 text-gray-500/80 truncate font-medium">{sub}</p>
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} border ${border} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-3.5 h-3.5 ${text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(s => {
            const count = s === 'All' ? orders.length : countByStatus(s);
            const active = selectedStatus === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active ? 'bg-[#8C4A27] text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
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
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
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
                      <td className="p-4 font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">+91 {phone}</div>
                      </td>
                      <td className="p-4 max-w-sm">
                        {addr?.cart_items && addr.cart_items.length > 0 ? (
                          <div className="space-y-1.5">
                            {addr.cart_items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <img
                                  src={item.image || item.custom_images?.[0] || '/images/home_brownies.jpg'}
                                  alt={item.title}
                                  className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                />
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  <span className="font-semibold">{item.title}</span>
                                  {item.size && <span className="text-[10px] text-gray-500"> ({item.size})</span>}
                                  <span className="text-xs font-bold text-[#8C4A27]"> x{item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-gray-800 text-xs">
                            <img src="/images/home_brownies.jpg" alt="thumbnail" className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs" />
                            <span>{order.items_summary || 'Custom Order'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-[#111827] text-sm">₹{order.total_amount}</td>
                      <td className="p-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-4"><StatusBadge status={order.status} /></td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openOrderModal(order)}
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
                            {['Pending','Confirmed','Packed','Shipped','Delivered','Cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  REDESIGNED ORDER DETAILS MODAL                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="bg-gray-50 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 max-h-[94vh] flex flex-col">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4 shadow-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] uppercase font-black text-[#8C4A27] tracking-widest">Order Details</span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className="text-[10px] font-mono font-semibold text-gray-400">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight leading-none">
                  {selectedOrder.shipping_address?.order_code || `#${selectedOrder.id.slice(0, 8).toUpperCase()}`}
                </h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(selectedOrder.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">

              {/* 1. Customer Information */}
              <SectionCard icon={<User className="w-4 h-4" />} title="Customer Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedOrder.shipping_address?.fullName || selectedOrder.customer_name || 'Valued Customer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone Number</p>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#8C4A27]" />
                      +91 {selectedOrder.shipping_address?.phone || selectedOrder.customer_phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* 2. Delivery Address */}
              <SectionCard icon={<MapPin className="w-4 h-4" />} title="Delivery Address">
                <p className="text-sm text-gray-800 font-medium leading-relaxed mb-3">
                  {selectedOrder.shipping_address?.address || 'Address not provided'}
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">City</p>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.shipping_address?.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Pincode</p>
                    <p className="text-sm font-bold text-gray-900 font-mono">{selectedOrder.shipping_address?.pincode || '—'}</p>
                  </div>
                </div>
              </SectionCard>

              {/* 3. Ordered Products */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <Package className="w-4 h-4 text-gray-500" />
                  <h4 className="font-bold text-sm text-gray-800">
                    Ordered Products
                    {selectedOrder.shipping_address?.cart_items?.length > 0 && (
                      <span className="ml-2 text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {selectedOrder.shipping_address.cart_items.length} item{selectedOrder.shipping_address.cart_items.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h4>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {selectedOrder.shipping_address?.cart_items && selectedOrder.shipping_address.cart_items.length > 0 ? (
                    selectedOrder.shipping_address.cart_items.map((item: any, idx: number) => {
                      const knownKeywords = ['frame', 'brownie', 'hamper', 'box', 'gift', 'chocolate', 'biscoff', 'nutella', 'walnut', 'collage', 'wooden', 'memories', 'classic', 'minimal'];
                      const titleLower = (item.title || '').toLowerCase();
                      const hasKeyword = knownKeywords.some(kw => titleLower.includes(kw));
                      const realTitle = hasKeyword && titleLower !== 'inayath' ? item.title : 'Memories Collage Frame';
                      const customText = item.custom_text || (!hasKeyword ? item.title : null);
                      const lineTotal = (item.price || 0) * (item.quantity || 1);

                      return (
                        <div key={idx} className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors">
                          
                          {/* Product Row */}
                          <div className="flex items-center gap-4 p-4">
                            <img
                              src={toCdnUrl(item.image || '/images/home_brownies.jpg')}
                              alt={realTitle}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 bg-white shrink-0 shadow-xs"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/home_brownies.jpg'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 leading-tight">{realTitle}</p>
                              {item.size && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Size: <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">{item.size}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">{item.category || 'Product'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-gray-900">₹{lineTotal.toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">₹{item.price} × {item.quantity}</p>
                              <span className="inline-block mt-1.5 text-[10px] font-bold text-[#8C4A27] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>

                          {/* Customization Block */}
                          {(item.custom_images?.length > 0 || customText || item.is_customizable) && (
                            <div className="mx-4 mb-4 rounded-xl border border-[#8C4A27]/20 bg-[#FAF3EC] p-4 space-y-4">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#8C4A27]" />
                                <span className="text-xs font-black text-[#8C4A27] uppercase tracking-widest">Customization Details</span>
                              </div>

                              {customText && (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Custom Text to Print</p>
                                  <div className="inline-flex items-start gap-2 bg-white border border-[#8C4A27]/20 rounded-xl px-3 py-2.5 shadow-2xs max-w-full">
                                    <ClipboardList className="w-4 h-4 text-[#8C4A27] shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold text-[#2C1A14] break-words">"{customText}"</span>
                                  </div>
                                </div>
                              )}

                              {item.custom_images && item.custom_images.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Customer Photo{item.custom_images.length > 1 ? 's' : ''} ({item.custom_images.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2.5">
                                    {item.custom_images.map((imgUrl: string, i: number) => (
                                      <a
                                        key={i}
                                        href={imgUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group"
                                        title="Click to open full-size photo"
                                      >
                                        <img
                                          src={toCdnUrl(imgUrl)}
                                          alt={`Customer photo ${i + 1}`}
                                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#8C4A27]/30 shadow-xs group-hover:border-[#8C4A27] group-hover:shadow-md transition-all"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 rounded-xl transition-colors">
                                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-2">Click photo to open full-resolution image for printing.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 leading-relaxed">
                      {selectedOrder.items_summary || 'Order details not available.'}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Order Summary */}
              <SectionCard icon={<IndianRupee className="w-4 h-4" />} title="Order Summary" accent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-800">
                      ₹{(selectedOrder.shipping_address?.subTotal ?? selectedOrder.total_amount)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {(selectedOrder.shipping_address?.discount > 0) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-600 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Discount
                        {selectedOrder.shipping_address?.appliedCoupon && (
                          <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md">
                            {selectedOrder.shipping_address.appliedCoupon}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-emerald-600">−₹{selectedOrder.shipping_address?.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      Delivery
                    </span>
                    <span className="text-sm font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="h-px bg-[#8C4A27]/15 my-1" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      ₹{selectedOrder.total_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* 5. Payment Information */}
              <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Payment Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Payment Method</p>
                    <p className="text-sm font-bold text-gray-900">Online Payment</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Payment Status</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Confirmed
                    </span>
                  </div>
                </div>
              </SectionCard>

            </div>

            {/* ── Sticky Footer / Status Update ── */}
            <div className="sticky bottom-0 bg-white rounded-b-3xl border-t border-gray-200 px-6 py-4 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 shrink-0">
                  <RefreshCw className="w-4 h-4 text-[#8C4A27]" />
                  Update Status:
                </div>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="flex-1 min-w-[160px] bg-gray-50 border border-gray-300 text-gray-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#8C4A27] focus:ring-2 focus:ring-[#8C4A27]/20 cursor-pointer"
                >
                  <option value="Pending">⏳  Pending</option>
                  <option value="Confirmed">✅  Confirmed</option>
                  <option value="Packed">📦  Packed</option>
                  <option value="Shipped">🚚  Shipped</option>
                  <option value="Delivered">🎉  Delivered</option>
                  <option value="Cancelled">❌  Cancelled</option>
                </select>
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, modalStatus)}
                  disabled={updatingId === selectedOrder.id || modalStatus === selectedOrder.status}
                  className="flex items-center gap-2 bg-[#8C4A27] hover:bg-[#733c21] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95 shrink-0"
                >
                  {updatingId === selectedOrder.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
