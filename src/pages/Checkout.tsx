import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2, CheckCircle2, ShieldCheck, User, Phone, MapPin, Building, Hash, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase/client';
import { toCdnUrl } from '../lib/cdn';

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

    try {
      // 1. Check/Lookup customer ID
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
            .maybeSingle();

          if (newCust?.id) customerId = newCust.id;
        }
      } catch (e) {}

      // 2. Prepare Order Payload
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const itemsSummary = cart.map(i => `${i.title} (${i.size || 'Std'}) x${i.quantity}`).join(', ');
      
      const enrichedShippingAddress = {
        order_code: orderId,
        full_name: fullName,
        phone: phone,
        address: address,
        city: city,
        pincode: pincode,
        items_summary: itemsSummary,
        cart_items: cart.map(i => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          size: i.size || null,
          image: i.image,
          custom_images: i.custom_images || null,
          custom_text: i.custom_text || null,
          is_customizable: i.is_customizable || false
        })),
        subTotal: subTotal,
        discount: discount,
        appliedCoupon: couponCode || null,
        total: finalTotal
      };

      const dbPayload: any = {
        total_amount: finalTotal,
        status: 'Pending',
        shipping_address: enrichedShippingAddress,
        customer_name: fullName,
        customer_phone: phone,
        items_summary: itemsSummary,
        subtotal: subTotal,
        discount: discount
      };

      if (customerId) {
        dbPayload.customer_id = customerId;
      }

      // 3. Insert into Supabase orders table
      const { data: insertResult, error: insertError } = await supabase
        .from('orders')
        .insert([dbPayload])
        .select();

      if (insertError) {
        console.error('Supabase order insert error:', insertError);
        if (insertError.code === '42501') {
          setError('Unable to place order — database RLS policy block. Please contact the store admin.');
        } else {
          setError(`Failed to place order: ${insertError.message}`);
        }
        return;
      }

      const realOrderId = insertResult?.[0]?.id || orderId;

      // 4. Save to local customer session history
      try {
        const newOrderLocal = {
          id: realOrderId,
          display_id: orderId,
          total_amount: finalTotal,
          status: 'Pending',
          items_summary: itemsSummary,
          shipping_address: enrichedShippingAddress,
          created_at: new Date().toISOString()
        };

        const existingLocalOrders = JSON.parse(localStorage.getItem(`orders_${phone}`) || '[]');
        
        // Strip heavy base64 strings from existing orders to clear space if any exist
        const cleanedExisting = existingLocalOrders.map((o: any) => {
          if (o.shipping_address?.cart_items) {
            o.shipping_address.cart_items = o.shipping_address.cart_items.map((item: any) => {
              if (item.custom_images && item.custom_images.some((img: string) => img.startsWith('data:image/'))) {
                return { ...item, custom_images: ['/images/home_frames.jpg'] };
              }
              return item;
            });
          }
          return o;
        });

        localStorage.setItem(`orders_${phone}`, JSON.stringify([newOrderLocal, ...cleanedExisting]));
        localStorage.setItem('active_customer_session', JSON.stringify({ name: fullName, phone }));
      } catch (storageErr) {
        console.warn('Could not write order history to localStorage (quota exceeded):', storageErr);
      }

      // 5. Clear Cart & Redirect to Customer Account
      clearCart();
      alert(`🎉 Order placed successfully!`);
      navigate('/account');

    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(`Failed to place order: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-5">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2C1A14] font-serif">Checkout</h1>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-5">
        
        {/* Delivery Details Section */}
        <div className="bg-white rounded-3xl p-5 shadow-2xs border border-gray-100/90 space-y-4">
          <h2 className="font-bold text-sm text-[#2C1A14] border-b border-gray-100 pb-3 flex items-center gap-2 font-serif">
            <MapPin className="w-4 h-4 text-[#8C4A27]" /> Delivery Details
          </h2>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#2C1A14] mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-gray-200 rounded-xl text-xs text-[#2C1A14] font-medium focus:bg-white focus:outline-none focus:border-[#8C4A27]"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-[#2C1A14] mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C4A27]">+91</span>
              <input 
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-16 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-gray-200 rounded-xl text-xs text-[#2C1A14] font-mono font-medium focus:bg-white focus:outline-none focus:border-[#8C4A27]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-[#2C1A14] mb-1">Delivery Address</label>
            <textarea 
              required
              rows={2}
              placeholder="House / Flat No., Street, Area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-[#FAF6F0]/60 border border-gray-200 rounded-xl text-xs text-[#2C1A14] font-medium focus:bg-white focus:outline-none focus:border-[#8C4A27]"
            />
          </div>

          {/* City & Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C1A14] mb-1">City</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-gray-200 rounded-xl text-xs text-[#2C1A14] font-medium focus:bg-white focus:outline-none focus:border-[#8C4A27]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C1A14] mb-1">Pincode</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0]/60 border border-gray-200 rounded-xl text-xs text-[#2C1A14] font-mono font-medium focus:bg-white focus:outline-none focus:border-[#8C4A27]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-2xs border border-gray-100/90 space-y-3">
          <h2 className="font-bold text-sm text-[#2C1A14] border-b border-gray-100 pb-3 flex items-center justify-between font-serif">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#8C4A27]" /> Order Summary
            </span>
            <span className="text-xs font-semibold bg-[#8C4A27]/10 text-[#8C4A27] px-2.5 py-0.5 rounded-full">
              {cart.length} Item(s)
            </span>
          </h2>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={`${item.id}-${item.size || ''}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={toCdnUrl(item.image)} alt={item.title} className="w-10 h-10 rounded-xl object-cover bg-[#FAF6F0] border border-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-[#2C1A14] truncate">{item.title}</p>
                    <p className="text-gray-400 text-[10px]">Qty: {item.quantity} {item.size ? `• ${item.size}` : ''}</p>
                  </div>
                </div>
                <span className="font-sans font-black text-sm text-[#2D0D15] shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-sans font-bold text-sm text-[#2D0D15]">₹{subTotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Discount ({couponCode})</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span className="font-bold text-green-700">FREE</span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-base font-extrabold text-[#2C1A14]">
              <span>Total Amount</span>
              <span className="text-[#2D0D15] text-xl font-sans font-black tracking-tight">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Secure Online Payment Badge */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
          <span className="flex items-center gap-1.5 text-[#8C4A27]">
            <ShieldCheck className="w-4 h-4 text-[#8C4A27]" /> Secure Online Payment
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Instant Order Confirmation
          </span>
        </div>

        {/* Place Order Button */}
        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold py-4 rounded-2xl text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Placing Your Order...
            </span>
          ) : (
            <>
              Place Order (₹{finalTotal}) <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
