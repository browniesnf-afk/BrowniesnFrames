import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, X, ChevronRight, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    subTotal, 
    couponCode, 
    discount, 
    applyCouponAsync, 
    removeCoupon, 
    finalTotal 
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState(couponCode || 'WELCOME10');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(
    couponCode ? `Coupon "${couponCode}" applied!` : null
  );

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!inputCoupon.trim()) return;

    const res = await applyCouponAsync(inputCoupon);
    if (res.success) {
      setCouponSuccess(res.message || 'Discount code applied!');
    } else {
      setCouponError(res.message || 'Invalid coupon code.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      
      {/* Header Bar */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#1C1C1C] font-sans">My Cart</h1>
      </div>

      {/* Empty Cart View */}
      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-2xs my-8">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">Your cart is empty</h2>
          <p className="text-xs text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/categories/brownies"
            className="inline-flex bg-[#F06292] hover:bg-[#E91E63] text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-xs"
          >
            Explore Gourmet Collection
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div 
                key={`${item.id}-${item.size || ''}`} 
                className="bg-white rounded-3xl p-4 shadow-2xs border border-gray-100/80 flex items-start gap-4 relative group"
              >
                {/* Item Image */}
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-gray-50 border border-gray-100" 
                />

                {/* Item Info Column */}
                <div className="flex-1 flex flex-col justify-between self-stretch pr-6">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#1C1C1C] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-1">
                      {item.category || 'Custom Gift Hamper'}
                      {item.size ? ` • ${item.size}` : ''}
                    </p>
                    <span className="font-bold text-base text-[#1C1C1C]">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-gray-900 min-w-4 text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Remove Item Button */}
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  aria-label="Remove item"
                  className="absolute bottom-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Coupon Code Bar */}
          <form onSubmit={handleApplyCoupon} className="mb-6">
            <div className="bg-white rounded-full p-2 pl-6 border border-gray-200/80 flex items-center justify-between shadow-2xs">
              <input 
                type="text" 
                placeholder="Enter Coupon Code (e.g. WELCOME10)"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#1C1C1C] placeholder:text-gray-400 placeholder:font-normal focus:outline-none uppercase"
              />
              <button 
                type="submit"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer ml-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Coupon Feedback Messages */}
            {couponSuccess && (
              <div className="mt-2 text-xs text-green-700 flex items-center justify-between px-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {couponSuccess}
                </span>
                <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 text-[10px] underline">
                  Remove
                </button>
              </div>
            )}
            {couponError && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1 px-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {couponError}
              </div>
            )}
          </form>

          {/* Summary Calculations */}
          <div className="space-y-3 mb-6 px-1">
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Sub Total</span>
              <span className="font-bold text-gray-900">₹{subTotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                <span>Discount (WELCOME10)</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Shipping</span>
              <span className="font-bold text-[#2E7D32]">Free</span>
            </div>

            <div className="h-px bg-gray-200 border-dashed my-2"></div>

            <div className="flex items-center justify-between text-lg font-bold text-[#1C1C1C]">
              <span>Total</span>
              <span className="text-xl font-extrabold text-[#1C1C1C]">₹{finalTotal}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#F06292] hover:bg-[#E91E63] text-white font-bold py-4 rounded-full text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center active:scale-[0.99]"
          >
            Checkout
          </button>
        </>
      )}

    </div>
  );
}
