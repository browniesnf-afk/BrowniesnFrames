import { useState, useEffect } from 'react';
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
  Sparkles, 
  Heart,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Tag,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';

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
          () => {
            console.log('⚡ Realtime status update for customer order received!');
            fetchCustomerOrders(customer.phone);
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
      // Lookup existing or insert new customer safely
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      
      {customer ? (
        /* Logged In Customer Portal View */
        <div className="space-y-6 md:space-y-8">
          
          {/* Welcome Card */}
          <div className="bg-[#F5EAE1] p-6 sm:p-8 rounded-3xl border border-[#8C4A27]/20 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            
            {/* Background Decorative Accent */}
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-[#8C4A27]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 sm:gap-5 z-10">
              {/* Luxury Avatar Monogram with Ring */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#8C4A27] text-[#FAF6F0] flex items-center justify-center font-serif font-bold text-2xl sm:text-3xl shadow-sm border-2 border-white">
                  {customer.name[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2C1A14] text-white flex items-center justify-center text-[10px]">
                  <Sparkles className="w-3 h-3 text-[#F8D8CF]" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C4A27] flex items-center gap-1 mb-1">
                  <Heart className="w-3 h-3 fill-[#8C4A27]" /> Member Profile
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C1A14] leading-tight">
                  Welcome back, <span className="font-semibold text-[#8C4A27]">{customer.name}</span>!
                </h1>
                <p className="text-xs text-[#6E5F55] font-sans flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-[#8C4A27]" /> +91 {customer.phone}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#2C1A14] bg-white/80 hover:bg-white hover:text-red-600 rounded-full transition-colors border border-[#8C4A27]/20 w-fit z-10 shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {/* Order History Section */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#2C1A14]">Order History</h2>
                <div className="flex items-center gap-1 mt-1 opacity-75">
                  <div className="h-[1px] w-6 bg-[#8C4A27]"></div>
                  <div className="w-1 h-1 rotate-45 bg-[#8C4A27]"></div>
                </div>
              </div>
              <span className="text-xs font-semibold bg-[#F5EAE1] text-[#8C4A27] px-3.5 py-1 rounded-full border border-[#8C4A27]/15">
                {orders.length} Orders
              </span>
            </div>

            {loadingOrders ? (
              <div className="py-16 flex flex-col items-center justify-center text-[#8C4A27]">
                <Loader2 className="w-7 h-7 animate-spin mb-3" />
                <span className="text-xs text-[#6E5F55]">Fetching your order history...</span>
              </div>
            ) : orders.length === 0 ? (
              /* Premium Empty State */
              <div className="py-12 sm:py-16 text-center text-[#6E5F55] max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#F5EAE1] text-[#8C4A27] flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#2C1A14] mb-2">No past orders yet</h3>
                <p className="text-xs text-[#6E5F55] mb-6 leading-relaxed">
                  Your sweet brownies, custom frames, and gift hamper orders will appear here once placed.
                </p>
                <Link
                  to="/categories/brownies"
                  className="inline-flex items-center gap-2 bg-[#8C4A27] hover:bg-[#733c21] text-white text-xs font-medium px-6 py-3 rounded-full transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  Explore Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => {
                  const displayCode = order.shipping_address?.order_code || order.display_id || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
                  const isExpanded = expandedOrderIds.has(order.id);

                  return (
                    <div key={order.id} className="bg-[#FAF6F0] rounded-2xl border border-[#8C4A27]/20 overflow-hidden transition-all shadow-2xs hover:shadow-xs">
                      
                      {/* Order Card Header */}
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#8C4A27]/10 bg-white/60">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#F5EAE1] text-[#8C4A27] flex items-center justify-center font-bold text-sm border border-[#8C4A27]/20 shadow-2xs shrink-0">
                            <Package className="w-5 h-5 text-[#8C4A27]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm sm:text-base text-[#2C1A14]">
                                #{displayCode}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-[#6E5F55] mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#8C4A27]" />
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-medium text-[#2C1A14]">
                                <ShoppingBag className="w-3 h-3 text-[#8C4A27]" />
                                {order.shipping_address?.cart_items?.length ? `${order.shipping_address.cart_items.length} Item(s)` : 'Order Package'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#8C4A27]/10">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-[#6E5F55] uppercase tracking-wider block font-semibold">Total Paid</span>
                            <span className="font-serif font-bold text-lg sm:text-xl text-[#8C4A27]">₹{order.total_amount}</span>
                          </div>
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="px-3.5 py-2 text-xs font-semibold text-[#8C4A27] bg-[#F5EAE1] hover:bg-[#8C4A27] hover:text-white rounded-xl transition-all border border-[#8C4A27]/20 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Visual Order Progress Tracker (Only shown if status is active & not cancelled) */}
                      {order.status !== 'Cancelled' && (
                        <div className="px-5 py-4 bg-white/80 border-b border-[#8C4A27]/10">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C4A27] mb-3 block flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#8C4A27]" /> Delivery Status Track
                          </span>
                          <div className="grid grid-cols-4 gap-2 relative">
                            {[
                              { step: 1, label: 'Placed' },
                              { step: 2, label: 'Confirmed' },
                              { step: 3, label: 'Shipped' },
                              { step: 4, label: 'Delivered' }
                            ].map((s) => {
                              const currentStep = getStatusStep(order.status);
                              const isDone = currentStep >= s.step;
                              return (
                                <div key={s.step} className="flex flex-col items-center text-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs mb-1 ${
                                    isDone ? 'bg-[#8C4A27] text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
                                  }`}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4 text-white" /> : s.step}
                                  </div>
                                  <span className={`text-[10px] font-semibold ${isDone ? 'text-[#2C1A14]' : 'text-gray-400'}`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Expanded Order Details Drawer */}
                      {isExpanded && (
                        <div className="p-5 space-y-4 bg-white">
                          
                          {/* Items Breakdown */}
                          <div>
                            <h4 className="text-xs font-bold text-[#2C1A14] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#8C4A27]" /> Items Ordered
                            </h4>

                            {order.shipping_address?.cart_items && order.shipping_address.cart_items.length > 0 ? (
                              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-[#FAF6F0]/60 p-3 space-y-2.5">
                                {order.shipping_address.cart_items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between gap-3 pt-2.5 first:pt-0">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                        <img 
                                          src={item.image || '/images/home_brownies.jpg'} 
                                          alt={item.title} 
                                          className="w-full h-full object-cover"
                                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                        />
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-[#2C1A14] block leading-snug">{item.title}</span>
                                        {item.size && (
                                          <span className="text-[10px] bg-[#8C4A27]/10 text-[#8C4A27] px-2 py-0.5 rounded-md font-semibold inline-block mt-0.5">
                                            {item.size}
                                          </span>
                                        )}
                                        <span className="text-[11px] text-gray-500 block mt-0.5">Qty: {item.quantity} × ₹{item.price}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#2C1A14]">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/10 text-xs text-[#2C1A14] font-medium flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#8C4A27]" />
                                <span>{order.items_summary || 'Custom Gift Order Items'}</span>
                              </div>
                            )}
                          </div>

                          {/* Address & Pricing Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            
                            {/* Delivery Address */}
                            <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/10 space-y-1 text-xs">
                              <span className="text-[10px] font-bold text-[#8C4A27] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#8C4A27]" /> Delivery Address
                              </span>
                              <p className="font-bold text-[#2C1A14]">{order.shipping_address?.full_name || order.customer_name || 'Customer'}</p>
                              <p className="text-gray-600 leading-relaxed">
                                {order.shipping_address?.address || 'Standard Shipping Address'}
                              </p>
                              <p className="text-gray-600">
                                {order.shipping_address?.city}{order.shipping_address?.pincode ? ` - ${order.shipping_address.pincode}` : ''}
                              </p>
                              <p className="text-gray-500 font-mono text-[11px] pt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#8C4A27]" /> +91 {order.shipping_address?.phone || order.customer_phone || 'N/A'}
                              </p>
                            </div>

                            {/* Payment Summary */}
                            <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/10 space-y-2 text-xs">
                              <span className="text-[10px] font-bold text-[#8C4A27] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-[#8C4A27]" /> Payment Summary
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
                              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-[#2C1A14]">
                                <span>Total Paid</span>
                                <span className="text-[#8C4A27]">₹{order.total_amount}</span>
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
