import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ChevronRight, ShoppingBag, CheckCircle2, AlertCircle, ArrowRight, Tag, Sparkles } from 'lucide-react';
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

  const [inputCoupon, setInputCoupon] = useState(couponCode || '');
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
      setCouponError(res.message || 'Invalid promo code.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      
      {/* Header Bar */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#2C1A14] font-serif">My Cart</h1>
      </div>

      {/* Empty Cart View */}
      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-2xs my-8">
          <ShoppingBag className="w-16 h-16 mx-auto text-[#8C4A27]/40 mb-3" />
          <h2 className="text-lg font-bold text-[#2C1A14] mb-1 font-serif">Your cart is empty</h2>
          <p className="text-xs text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/categories/brownies"
            className="inline-flex bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-xs"
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
                <div className="relative shrink-0">
                  <img 
                    src={item.custom_images?.[0] || item.image} 
                    alt={item.title} 
                    className="w-24 h-24 rounded-2xl object-cover bg-[#FAF6F0] border border-gray-100 shadow-2xs" 
                  />
                  {item.custom_images && item.custom_images.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      +{item.custom_images.length - 1} photos
                    </span>
                  )}
                </div>

                {/* Item Info Column */}
                <div className="flex-1 flex flex-col justify-between self-stretch pr-6">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-bold text-sm sm:text-base text-[#2C1A14] leading-snug">
                        {item.title}
                      </h3>
                      {(item.custom_images?.length || item.custom_text || item.is_customizable) && (
                        <span className="bg-amber-100 text-[#8C4A27] border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-[#8C4A27]" /> Customized
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 font-medium mb-1">
                      {item.category || 'Custom Gift Hamper'}
                      {item.size ? ` • ${item.size}` : ''}
                    </p>

                    {item.custom_text && (
                      <div className="my-1.5 p-2 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/20 text-xs">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">Custom Text / Message:</span>
                        <span className="font-extrabold text-[#2C1A14]">"{item.custom_text}"</span>
                      </div>
                    )}

                    <span className="font-sans font-black text-lg text-[#2D0D15] tracking-tight">
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

                {/* Red Dustbin Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  aria-label="Remove item"
                  title="Remove item"
                  className="absolute bottom-4 right-4 p-2 text-[#E53935] bg-red-50 hover:bg-red-100/90 rounded-full transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center border border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Coupon Code Input Bar */}
          <form onSubmit={handleApplyCoupon} className="mb-6">
            <div className="bg-white rounded-full p-2 pl-6 border border-gray-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 flex-1">
                <Tag className="w-4 h-4 text-[#8C4A27] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Enter Promo Code"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#2C1A14] placeholder:text-gray-400 placeholder:font-normal focus:outline-none uppercase"
                />
              </div>
              <button 
                type="submit"
                className="w-9 h-9 rounded-full bg-[#8C4A27] hover:bg-[#733c21] text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer ml-2 shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Coupon Feedback Messages */}
            {couponSuccess && (
              <div className="mt-2 text-xs text-green-700 flex items-center justify-between px-3">
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {couponSuccess}
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    removeCoupon();
                    setInputCoupon('');
                    setCouponSuccess(null);
                  }} 
                  className="text-gray-400 hover:text-red-500 text-[10px] underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
            {couponError && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1 px-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> {couponError}
              </div>
            )}
          </form>

          {/* Summary Calculations */}
          <div className="space-y-3 mb-6 px-1">
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Sub Total</span>
              <span className="font-sans font-bold text-base text-[#2D0D15]">₹{subTotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-700 font-medium">
                <span>Discount ({couponCode})</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Shipping</span>
              <span className="font-bold text-green-700">Free</span>
            </div>

            <div className="h-px bg-gray-200 border-dashed my-2"></div>

            <div className="flex items-center justify-between text-[#2C1A14]">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-sans font-black text-[#2D0D15] tracking-tight">₹{finalTotal}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold py-4 rounded-full text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            Checkout <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}

    </div>
  );
}
