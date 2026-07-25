import { useState, useEffect } from 'react';
import { Phone, Lock, User, ShoppingBag, LogOut, Loader2, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Heart } from 'lucide-react';
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

  // Fetch orders when customer is logged in
  useEffect(() => {
    if (customer?.phone) {
      fetchCustomerOrders(customer.phone);
    }
  }, [customer]);

  const fetchCustomerOrders = async (customerPhone: string) => {
    setLoadingOrders(true);
    let combinedOrders: any[] = [];
    try {
      // Local order cache
      const localSaved = JSON.parse(localStorage.getItem(`orders_${customerPhone}`) || '[]');
      combinedOrders = [...localSaved];

      const { data: custData } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .maybeSingle();

      if (custData?.id) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', custData.id)
          .order('created_at', { ascending: false });

        if (orderData && orderData.length > 0) {
          // Merge without duplicates
          const dbIds = new Set(orderData.map(o => o.id));
          const uniqueLocal = localSaved.filter((lo: any) => !dbIds.has(lo.id));
          combinedOrders = [...orderData, ...uniqueLocal];
        }
      }
    } catch (err) {
      console.warn('Customer orders fetch notice:', err);
    } finally {
      setOrders(combinedOrders);
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
      const { error } = await supabase
        .from('customers')
        .upsert([{
          full_name: name,
          phone: phone,
          email: `${phone}@customer.store`
        }], { onConflict: 'phone' });

      if (error) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', phone)
          .single();

        if (existing) {
          await supabase
            .from('customers')
            .update({ full_name: name })
            .eq('id', existing.id);
        } else {
          const { error: insertErr } = await supabase
            .from('customers')
            .insert([{
              full_name: name,
              phone: phone,
              email: `${phone}@customer.store`
            }]);
          if (insertErr) throw new Error('Supabase Error: ' + insertErr.message);
        }
      }

      const activeCust = { name, phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));
      setCustomer(activeCust);
      setSuccessMsg('Account created successfully!');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
                  Welcome back, {customer.name}!
                </h1>
                <p className="text-xs text-[#6E5F55] font-sans flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-[#8C4A27]" /> +91 {customer.phone}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-[#2C1A14] bg-white/80 hover:bg-white hover:text-red-600 rounded-full transition-colors border border-[#8C4A27]/20 w-fit z-10 shadow-2xs"
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
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border border-[#8C4A27]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-[#8C4A27]/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#2C1A14]">#{order.id.slice(0, 8)}</span>
                        <span className="text-[10px] bg-[#8C4A27]/10 text-[#8C4A27] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#2C1A14] mt-1.5">{order.items_summary || 'Custom Gift Order'}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-lg sm:text-xl font-bold text-[#2C1A14] block">₹{order.total_amount}</span>
                    </div>
                  </div>
                ))}
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
