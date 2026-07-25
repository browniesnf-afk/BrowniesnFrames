import { useState } from 'react';
import { Star, Minus, Plus, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const images = [
  '/images/home_gifts.jpg',
  '/images/gift_luxury.jpg',
  '/images/gift_hamper.jpg'
];

const whatsInside = [
  { icon: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=200&auto=format&fit=crop', label: 'Brownies' },
  { icon: 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=200&auto=format&fit=crop', label: 'Candle' },
  { icon: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=200&auto=format&fit=crop', label: 'Mug' },
  { icon: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=200&auto=format&fit=crop', label: 'Cookies' }
];

export default function PremiumGiftHamper() {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({
      id: 'premium-gift-hamper',
      title: 'Premium Gift Hamper',
      category: 'Gifts',
      price: 1299,
      image: images[0],
      quantity: quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Image Section: Main Image on Left, Vertical Thumbnails Column on Right */}
      <div className="flex gap-3 mb-3.5">
        {/* Main Image with Shorter Aspect Ratio */}
        <div className="flex-1 relative bg-[#FAF6F0] rounded-3xl overflow-hidden aspect-[4/3] max-h-[300px] border border-gray-100/80 shadow-2xs">
          <img src={images[activeImageIndex]} alt="Main Product" className="w-full h-full object-cover" />
          <button className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 shadow-xs text-[#2C1A14] flex items-center justify-center cursor-pointer">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Vertical Thumbnails Column */}
        <div className="w-16 flex flex-col gap-2.5 shrink-0">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                activeImageIndex === i ? "border-[#8C4A27] ring-1 ring-[#8C4A27]" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info Block Below Image */}
      <div className="flex flex-col space-y-1.5">
        
        {/* BEST SELLER Badge */}
        <span className="bg-[#2C1A14] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md w-fit">
          BEST SELLER
        </span>

        {/* Title */}
        <h1 className="font-sans text-2xl sm:text-3xl text-[#2C1A14] font-bold leading-tight">
          Premium Gift Hamper
        </h1>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-3.5 h-3.5", i < 5 ? "fill-current" : "fill-transparent text-gray-300")} />
            ))}
          </div>
          <span className="font-bold text-gray-900">4.8</span>
          <span className="text-gray-500">(145 customer reviews)</span>
        </div>

        {/* Price & Special Offer Tag */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="font-sans text-3xl sm:text-4xl font-black text-[#2D0D15] tracking-tight">₹1,299</span>
          <span className="text-sm text-gray-400 line-through font-semibold">₹1,699</span>
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            Special Offer
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed pt-1 font-sans">
          A thoughtfully curated hamper with delicious artisanal brownies, scented candle, luxury ceramic mug, and handcrafted cookies.
        </p>

        {/* What's Inside Gallery */}
        <div className="pt-2">
          <span className="block font-bold text-[#2C1A14] text-xs uppercase tracking-wider mb-2 font-sans">WHAT'S INSIDE</span>
          <div className="flex items-center gap-4">
            {whatsInside.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200/90 bg-[#FAF6F0] shadow-2xs shrink-0">
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </div>
                <span className="text-xs text-center font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 pt-3">
          <span className="font-bold text-[#2C1A14] text-xs uppercase tracking-wider">QTY:</span>
          <div className="flex items-center w-28 border border-gray-200 rounded-full bg-white px-3 py-1 shadow-2xs">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input 
              type="text" 
              value={quantity} 
              readOnly
              className="w-full text-center bg-transparent font-bold text-gray-900 text-xs focus:outline-none" 
            />
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button 
            onClick={handleAddToCart}
            className="bg-[#2C1A14] hover:bg-black text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-95"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-95"
          >
            Buy Now
          </button>
        </div>

      </div>
    </div>
  );
}
