import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2, CheckCircle2, ShieldCheck, User, Phone, MapPin, Building, Hash } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase/client';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subTotal, discount, couponCode, finalTotal, clearCart } = useCart();

  // Customer Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill logged-in customer info if available
  useEffect(() => {
    try {
      const savedCust = localStorage.getItem('active_customer_session');
      if (savedCust) {
        const parsed = JSON.parse(savedCust);
        if (parsed.name) setFullName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch (e) {}
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !city || !pincode) {
      setError('Please fill in all delivery details.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    const itemsSummary = cart.map(item => `${item.title}${item.size ? ` (${item.size})` : ''} x${item.quantity}`).join(', ');
    const shippingAddress = { fullName, phone, address, city, pincode };

    try {
      // 1. Ensure customer exists or create in Supabase
      let customerId: string | null = null;
      try {
        const { data: custData } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();

        if (custData?.id) {
          customerId = custData.id;
        } else {
          const { data: newCust } = await supabase
            .from('customers')
            .insert([{
              full_name: fullName,
              phone: phone,
              email: `${phone}@customer.store`
            }])
            .select('id')
            .single();

          customerId = newCust?.id || null;
        }
      } catch (e) {
        console.warn('Customer upsert notice:', e);
      }

      // 2. Insert order into Supabase orders table
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const newOrderPayload = {
        customer_id: customerId,
        total_amount: finalTotal,
        status: 'Pending' as const,
        items_summary: itemsSummary,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString()
      };

      try {
        await supabase.from('orders').insert([{
          id: orderId,
          ...newOrderPayload
        }]);
      } catch (e) {
        console.warn('Order insert notice:', e);
      }

      // 3. Save order to customer local session history for instant UI reflection
      const newOrderLocal = {
        id: orderId,
        total_amount: finalTotal,
        status: 'Pending',
        items_summary: itemsSummary,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString()
      };

      const existingLocalOrders = JSON.parse(localStorage.getItem(`orders_${phone}`) || '[]');
      localStorage.setItem(`orders_${phone}`, JSON.stringify([newOrderLocal, ...existingLocalOrders]));

      // 4. Save active customer session if not logged in yet
      const activeCust = { name: fullName, phone };
      localStorage.setItem('active_customer_session', JSON.stringify(activeCust));

      // 5. Clear Cart & Redirect to Customer Account
      clearCart();
      alert(`🎉 Order #${orderId.slice(0, 8)} placed successfully! Status: Pending`);
      navigate('/account');

    } catch (err: any) {
      console.error('Order creation error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1C] font-sans">Checkout</h1>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        
        {/* Customer Delivery Information Form */}
        <div className="bg-white rounded-3xl p-5 shadow-2xs border border-gray-100/80 space-y-4">
          <h2 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8C4A27]" /> Delivery Address
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#8C4A27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (For Updates)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600">+91</span>
              <input 
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-16 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-[#8C4A27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Flat / House No. / Street Address</label>
            <textarea 
              required
              rows={2}
              placeholder="House 42, Green Park Avenue..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#8C4A27]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  required
                  placeholder="Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#8C4A27]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="600001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-[#8C4A27]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-2xs border border-gray-100/80 space-y-3">
          <h2 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#8C4A27]" /> Order Summary ({cart.length} items)
          </h2>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={`${item.id}-${item.size || ''}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.title}</p>
                    <p className="text-gray-400 text-[10px]">Qty: {item.quantity} {item.size ? `• ${item.size}` : ''}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Sub Total</span>
              <span className="font-bold text-gray-900">₹{subTotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({couponCode})</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-500">
              <span>Delivery Charges</span>
              <span className="font-bold text-[#2E7D32]">FREE</span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-[#8C4A27]">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Cash on Delivery Available
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Instant Order Confirmation
          </span>
        </div>

        {/* Place Order Button */}
        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full bg-[#F06292] hover:bg-[#E91E63] text-white font-bold py-4 rounded-full text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Placing Your Order...
            </span>
          ) : (
            `Place Order (₹${finalTotal})`
          )}
        </button>

      </form>

    </div>
  );
}
