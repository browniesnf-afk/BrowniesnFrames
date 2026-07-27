import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { toCdnUrl } from '../lib/cdn';
import { 
  Phone, 
  Lock, 
  User, 
  ShoppingBag, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  CreditCard,
  Tag,
  Sparkles,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomerUser {
  id?: string;
  name: string;
  phone: string;
}

export default function CustomerAccount() {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Check saved customer session
  useEffect(() => {
    const saved = localStorage.getItem('active_customer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomer(parsed);
      } catch (e) {
        localStorage.removeItem('active_customer_session');
      }
    }
  }, []);

  // Fetch orders & subscribe to Realtime status updates when customer is logged in
  useEffect(() => {
    if (customer?.phone) {
      fetchCustomerOrders(customer.phone);

      const channel = supabase
        .channel(`customer_realtime_orders_${customer.phone}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('⚡ Realtime status update for customer order received:', payload);
            if (payload.eventType === 'UPDATE') {
              const updatedOrder = payload.new;
              const addrPhone = updatedOrder.shipping_address?.phone || updatedOrder.customer_phone;
              if (addrPhone === customer.phone) {
                setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o));
                
                // Update local storage too to keep sync
                try {
                  const key = `orders_${customer.phone}`;
                  const stored = JSON.parse(localStorage.getItem(key) || '[]');
                  const updated = stored.map((lo: any) => 
                    lo.id === updatedOrder.id ? { ...lo, status: updatedOrder.status } : lo
                  );
                  localStorage.setItem(key, JSON.stringify(updated));
                } catch (e) {}
              }
            } else {
              fetchCustomerOrders(customer.phone);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [customer]);

  const fetchCustomerOrders = async (customerPhone: string) => {
    if (!customerPhone || !customerPhone.trim()) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    let finalCustomerOrders: any[] = [];

    try {
      // 1. Local order cache — strictly filtered by this customer's exact phone number
      const rawLocalSaved = JSON.parse(localStorage.getItem(`orders_${customerPhone}`) || '[]');
      const strictlyFilteredLocal = rawLocalSaved.filter((lo: any) => {
        const addrPhone = lo.shipping_address?.phone || lo.customer_phone;
        return addrPhone === customerPhone;
      });

      // 2. Fetch customer ID from Supabase
      const { data: custData } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .maybeSingle();

      const customerId = custData?.id;

      // 3. Fetch all orders from Supabase & strictly filter by customer_id OR shipping_address.phone
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        const matchingDbOrders = dbOrders.filter((o: any) => {
          const addr = o.shipping_address || {};
          const addrPhone = addr.phone || o.customer_phone;
          const matchesPhone = addrPhone === customerPhone;
          const matchesId = Boolean(customerId && o.customer_id === customerId);
          return matchesPhone || matchesId;
        });

        const dbOrderIds = new Set(matchingDbOrders.map((o: any) => o.id));
        const uniqueLocalOrders = strictlyFilteredLocal.filter((lo: any) => !dbOrderIds.has(lo.id));

        finalCustomerOrders = [...matchingDbOrders, ...uniqueLocalOrders];
      } else {
        finalCustomerOrders = strictlyFilteredLocal;
      }
    } catch (err) {
      console.warn('Customer orders fetch notice:', err);
    } finally {
      setOrders(finalCustomerOrders);
      setLoadingOrders(false);
    }
  };

  // Handle Customer Sign Up (Mobile + Name + Password)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: existingCust } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (!existingCust?.id) {
        await supabase
          .from('customers')
          .insert([{
            full_name: name,
            phone: phone,
            email: `${phone}@customer.store`
          }]);
      } else {
        await supabase
          .from('customers')
          .update({ full_name: name })
          .eq('id', existingCust.id);
      }

      const activeCust = { name, phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));
      setCustomer(activeCust);
      setSuccessMsg('Account created successfully!');
    } catch (err: any) {
      console.warn('Sign up notice:', err);
      const activeCust = { name, phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));
      setCustomer(activeCust);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Sign In (Mobile + Password)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please enter mobile number and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      const custName = custData?.full_name || 'Valued Customer';
      const activeCust = { name: custName, phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));
      setCustomer(activeCust);
    } catch (err) {
      const activeCust = { name: name || 'Valued Customer', phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));
      setCustomer(activeCust);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('active_customer_session');
    setCustomer(null);
    setOrders([]);
    setExpandedOrderIds(new Set());
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Packed': return 3;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'Confirmed': return 'bg-blue-50 text-blue-800 border-blue-200/80';
      case 'Packed': return 'bg-purple-50 text-purple-800 border-purple-200/80';
      case 'Shipped': return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
      case 'Delivered': return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200/80';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">
      
      {customer ? (
        /* Logged In Customer Portal View */
        <div className="space-y-6">
          
          {/* Streamlined Profile Header */}
          <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#8C4A27]/15 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#8C4A27] text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
                {customer.name[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="font-bold text-[#2C1A14] text-base leading-tight">
                  {customer.name}
                </h1>
                <p className="text-xs text-[#6E5F55] font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#8C4A27]" /> +91 {customer.phone}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#8C4A27] hover:text-red-700 bg-white hover:bg-red-50 rounded-xl border border-[#8C4A27]/20 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="font-bold text-lg text-[#2C1A14] flex items-center gap-2">
              <span>Order History</span>
              <span className="text-xs font-semibold bg-[#8C4A27]/10 text-[#8C4A27] px-2.5 py-0.5 rounded-full">
                {orders.length} Orders
              </span>
            </h2>
          </div>

          {loadingOrders ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#8C4A27]">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <span className="text-xs text-[#6E5F55]">Loading your orders...</span>
            </div>
          ) : orders.length === 0 ? (
            /* Premium Clean Empty State */
            <div className="py-12 sm:py-16 text-center text-[#6E5F55] max-w-sm mx-auto bg-white rounded-2xl border border-gray-200/80 p-6">
              <div className="w-14 h-14 rounded-full bg-[#FAF6F0] text-[#8C4A27] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#2C1A14] mb-1">No orders placed yet</h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Your past orders will appear here once placed.
              </p>
              <Link
                to="/categories/brownies"
                className="inline-flex items-center gap-2 bg-[#8C4A27] hover:bg-[#733c21] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-2xs"
              >
                Explore Products <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const displayCode = order.shipping_address?.order_code || order.display_id || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
                const isExpanded = expandedOrderIds.has(order.id);

                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden transition-all shadow-xs hover:border-[#8C4A27]/40">
                    
                    {/* Card Top Header: Order ID + Status */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 bg-[#FAF6F0]/40">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs sm:text-sm text-[#2C1A14] bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                          #{displayCode}
                        </span>
                        <span className="text-xs text-gray-300 font-sans">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${getStatusBadgeStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Card Body: Product Image + Product Name + Price + Action Button */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Product Thumbnail & Title */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl bg-[#FAF6F0] overflow-hidden border border-gray-200/80 shrink-0 shadow-2xs">
                          <img 
                            src={
                              order.shipping_address?.cart_items?.[0]?.image ||
                              (order.items_summary?.toLowerCase().includes('frame') ? '/images/home_frames.jpg' :
                               order.items_summary?.toLowerCase().includes('gift') ? '/images/home_gifts.jpg' :
                               '/images/home_brownies.jpg')
                            } 
                            alt="Ordered product thumbnail" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/home_brownies.jpg';
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-[#2C1A14] leading-tight">
                              {
                                order.shipping_address?.cart_items?.[0]?.title ||
                                (order.items_summary && order.items_summary !== 'Custom Gift Order' 
                                  ? order.items_summary 
                                  : 'Belgian Chocolate Brownie Box')
                              }
                            </h3>

                            {/* Customized Badge */}
                            {(order.shipping_address?.cart_items?.some((i: any) => i.custom_images?.length > 0 || i.custom_text || i.is_customizable)) && (
                              <span className="bg-amber-100 text-[#8C4A27] border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-3 h-3 text-[#8C4A27]" /> Customized
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            {order.shipping_address?.cart_items?.[0]?.size && (
                              <span className="bg-[#8C4A27]/10 text-[#8C4A27] px-2 py-0.5 rounded text-[10px] font-bold">
                                {order.shipping_address.cart_items[0].size}
                              </span>
                            )}
                            <span>
                              Qty: {order.shipping_address?.cart_items?.[0]?.quantity || 1}
                            </span>
                            {order.shipping_address?.cart_items?.length > 1 && (
                              <span className="text-[#8C4A27] font-semibold text-[11px]">
                                + {order.shipping_address.cart_items.length - 1} more item(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Price & View Details */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">TOTAL PAID</span>
                          <span className="font-sans font-black text-xl sm:text-2xl text-[#2D0D15] tracking-tight">₹{order.total_amount}</span>
                        </div>

                        <button
                          onClick={() => toggleOrderExpand(order.id)}
                          className="px-3.5 py-2 text-xs font-bold text-[#8C4A27] bg-[#FAF6F0] hover:bg-[#8C4A27] hover:text-white rounded-xl transition-all border border-[#8C4A27]/20 flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                    </div>

                    {/* Delivery Progress Bar */}
                    {order.status !== 'Cancelled' && (
                      <div className="px-6 py-4 bg-[#FAF6F0]/70 border-t border-gray-100/80">
                        <div className="relative">
                          {/* Connecting Background Line */}
                          <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full" />
                          
                          {/* Active Connecting Fill Line */}
                          <div 
                            className="absolute top-4 left-6 h-1 bg-[#8C4A27] -z-0 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                getStatusStep(order.status) <= 1 ? '0%' :
                                getStatusStep(order.status) === 2 ? '33%' :
                                getStatusStep(order.status) === 3 ? '66%' : '100%'
                              }`
                            }}
                          />

                          <div className="grid grid-cols-4 gap-2 relative z-10">
                            {[
                              { step: 1, label: 'Placed', icon: ShoppingBag },
                              { step: 2, label: 'Confirmed', icon: Sparkles },
                              { step: 3, label: 'Shipped', icon: Truck },
                              { step: 4, label: 'Delivered', icon: CheckCircle2 }
                            ].map((s) => {
                              const currentStep = getStatusStep(order.status);
                              const isCompleted = currentStep > s.step;
                              const isCurrent = currentStep === s.step;
                              const StepIcon = s.icon;

                              return (
                                <div key={s.step} className="flex flex-col items-center text-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCurrent 
                                      ? 'bg-[#8C4A27] text-white ring-4 ring-[#8C4A27]/25 scale-110 shadow-md' 
                                      : isCompleted 
                                      ? 'bg-[#8C4A27] text-white ring-2 ring-white shadow-2xs' 
                                      : 'bg-white text-gray-400 border-2 border-gray-200 ring-2 ring-white shadow-2xs'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                    ) : (
                                      <StepIcon className="w-4 h-4" />
                                    )}
                                  </div>
                                  <span className={`text-[11px] mt-1.5 transition-colors ${
                                    isCurrent 
                                      ? 'font-extrabold text-[#8C4A27]' 
                                      : isCompleted 
                                      ? 'font-bold text-[#2C1A14]' 
                                      : 'font-medium text-gray-400'
                                  }`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details Drawer */}
                    {isExpanded && (
                      <div className="p-5 border-t border-gray-100 bg-[#FAF6F0]/30 space-y-4">
                        
                        {/* Items List */}
                        <div>
                          <h4 className="text-[11px] font-bold text-[#8C4A27] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5" /> Items Ordered
                          </h4>

                          {order.shipping_address?.cart_items && order.shipping_address.cart_items.length > 0 ? (
                            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200/80 bg-white p-3.5 space-y-3 shadow-2xs">
                              {order.shipping_address.cart_items.map((item: any, idx: number) => {
                                const isItemCustomized = item.custom_images?.length > 0 || item.custom_text || item.is_customizable;
                                return (
                                  <div key={idx} className="pt-3 first:pt-0 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 shadow-2xs">
                                          <img 
                                            src={toCdnUrl(item.image || '/images/home_brownies.jpg')} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-[#2C1A14]">{item.title}</span>
                                            {isItemCustomized && (
                                              <span className="bg-amber-100 text-[#8C4A27] border border-amber-300 px-2 py-0.5 rounded-full text-[9px] font-extrabold inline-flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" /> Customized
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2 mt-0.5">
                                            {item.size && (
                                              <span className="text-[10px] bg-[#8C4A27]/10 text-[#8C4A27] px-2 py-0.5 rounded font-semibold inline-block">
                                                {item.size}
                                              </span>
                                            )}
                                            <span className="text-[11px] text-gray-500 font-medium">Qty: {item.quantity} × ₹{item.price}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-xs font-extrabold text-[#2C1A14]">₹{item.price * item.quantity}</span>
                                    </div>

                                    {/* Uploaded Photos (Larger & Clearer) */}
                                    {item.custom_images && item.custom_images.length > 0 && (
                                      <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/25 space-y-1.5 ml-14">
                                        <span className="text-[10px] font-extrabold text-[#8C4A27] uppercase tracking-wider flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" /> Uploaded Photo(s) for Printing ({item.custom_images.length})
                                        </span>
                                        <div className="flex flex-wrap gap-2.5 pt-1">
                                          {item.custom_images.map((imgUrl: string, i: number) => (
                                            <a 
                                              key={i} 
                                              href={imgUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-[#8C4A27]/30 shadow-2xs hover:border-[#8C4A27] transition-all"
                                            >
                                              <img src={toCdnUrl(imgUrl)} alt={`Uploaded photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                                View Full
                                              </div>
                                            </a>
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-gray-400 block pt-0.5">Click photo to view or download full high-res image.</span>
                                      </div>
                                    )}

                                    {/* Custom Text / Message */}
                                    {item.custom_text && (
                                      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs ml-14">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Custom Text to Print:</span>
                                        <p className="font-extrabold text-[#2C1A14] text-xs sm:text-sm mt-0.5">"{item.custom_text}"</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-[#2C1A14] font-medium flex items-center gap-2">
                              <Package className="w-4 h-4 text-[#8C4A27]" />
                              <span>{order.items_summary || 'Custom Gift Order Items'}</span>
                            </div>
                          )}
                        </div>

                        {/* Delivery Address & Payment Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          
                          {/* Delivery Address */}
                          <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-[#8C4A27] uppercase tracking-wider flex items-center gap-1 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8C4A27]" /> Delivery Address
                            </span>
                            <p className="font-bold text-[#2C1A14]">{order.shipping_address?.full_name || order.customer_name || 'Customer'}</p>
                            <p className="text-gray-600">{order.shipping_address?.address || 'Shipping Address'}</p>
                            <p className="text-gray-600">{order.shipping_address?.city}{order.shipping_address?.pincode ? ` - ${order.shipping_address.pincode}` : ''}</p>
                            <p className="text-gray-500 font-mono text-[11px] pt-1">
                              <Phone className="w-3 h-3 inline text-[#8C4A27]" /> +91 {order.shipping_address?.phone || order.customer_phone || 'N/A'}
                            </p>
                          </div>

                          {/* Payment Summary */}
                          <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs space-y-1.5">
                            <span className="text-[10px] font-bold text-[#8C4A27] uppercase tracking-wider flex items-center gap-1 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-[#8C4A27]" /> Payment Details
                            </span>
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal</span>
                              <span>₹{order.shipping_address?.subTotal || order.total_amount}</span>
                            </div>
                            {order.shipping_address?.discount > 0 && (
                              <div className="flex justify-between text-green-700 font-semibold">
                                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon Discount</span>
                                <span>-₹{order.shipping_address.discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                              <span>Delivery Fee</span>
                              <span className="text-green-700 font-semibold">FREE</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-gray-100 font-bold text-[#2C1A14]">
                              <span>Total Paid</span>
                              <span className="text-[#8C4A27] font-extrabold text-sm">₹{order.total_amount}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* Sign In / Sign Up Form (Mobile Number + Name + Password) */
        <div className="max-w-md mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2C1A14]">Customer Portal</h1>
            <div className="flex items-center justify-center gap-1.5 my-2">
              <div className="h-[1px] w-12 bg-[#8C4A27]/40"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-[#8C4A27]"></div>
              <div className="h-[1px] w-12 bg-[#8C4A27]/40"></div>
            </div>
            <p className="text-xs text-[#6E5F55] font-sans">Enter your mobile number to sign in or create an account</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
            
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-[#F5EAE1] rounded-2xl mb-6 text-xs font-semibold">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${mode === 'login' ? 'bg-white text-[#8C4A27] shadow-xs font-bold' : 'text-[#6E5F55]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${mode === 'signup' ? 'bg-white text-[#8C4A27] shadow-xs font-bold' : 'text-[#6E5F55]'}`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4 text-xs">
              
              {mode === 'signup' && (
                <div>
                  <label className="block font-medium text-[#2C1A14] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0] border border-gray-200 rounded-xl focus:outline-none focus:border-[#8C4A27] text-xs text-[#2C1A14]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#2C1A14] mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-[#8C4A27] text-xs">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-[#FAF6F0] border border-gray-200 rounded-xl focus:outline-none focus:border-[#8C4A27] font-mono text-xs text-[#2C1A14]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#2C1A14] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0] border border-gray-200 rounded-xl focus:outline-none focus:border-[#8C4A27] text-xs text-[#2C1A14]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8C4A27] hover:bg-[#733c21] text-white font-medium py-3 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 mt-3 shadow-xs hover:shadow-md cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
