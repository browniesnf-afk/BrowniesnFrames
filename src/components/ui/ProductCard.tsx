import { useState } from 'react';
import { Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { toCdnUrl } from '../../lib/cdn';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: 'BESTSELLER' | 'NEW' | null;
  link: string;
  category?: string;
  isCustomizable?: boolean;
}

const removeEmojis = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{200D}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const toTitleCase = (str: string): string => {
  if (!str) return '';
  const clean = removeEmojis(str);
  return clean.replace(/\w\S*/g, (txt) => {
    if (/^\d+[a-zA-Z]+$/.test(txt) || /^[a-zA-Z]+\d+$/.test(txt)) return txt;
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const ProductCard = ({
  id,
  title,
  description,
  price,
  image,
  rating,
  reviewsCount,
  badge,
  link,
  category,
  isCustomizable
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const formattedTitle = toTitleCase(title);
  const formattedDescription = removeEmojis(description);

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(link);
  };

  const handleCartIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if customizable (from prop or fallback check on title/category)
    const checkCustomizable = isCustomizable !== undefined 
      ? isCustomizable 
      : (
          category?.toLowerCase() === 'frames' || 
          title.toLowerCase().includes('frame') || 
          title.toLowerCase().includes('custom') ||
          title.toLowerCase().includes('collage') ||
          title.toLowerCase().includes('photo') ||
          title.toLowerCase().includes('lamp') ||
          title.toLowerCase().includes('shaker')
        );

    if (checkCustomizable) {
      // 1. Customized Products: Navigate to Product Details Page for mandatory customization options
      navigate(link);
      return;
    }

    // 2. Non-Customized Products: Direct quick add to cart
    addToCart({
      id: id,
      title: title,
      category: category || 'Brownies',
      price: price,
      image: image,
      quantity: 1
    }, e);

    // Show Success Toast Notification
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="group flex flex-col bg-[#FDFBF7] rounded-2xl overflow-hidden border border-gray-200/60 shadow-xs hover:shadow-md transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F5EAE1]/70 p-3 flex items-center justify-center overflow-hidden">
        <Link to={link} className="w-full h-full flex items-center justify-center">
          <img 
            src={toCdnUrl(image)} 
            alt={title} 
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
          />
        </Link>
        
        {/* Badges */}
        {badge && (
          <div className={cn(
            "absolute top-2.5 left-2.5 text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full text-white shadow-xs",
            badge === 'BESTSELLER' ? "bg-[#8C4A27]" : "bg-[#A56845]"
          )}>
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Title */}
          <Link to={link}>
            <h3 className="font-serif text-xs sm:text-base font-bold text-[#2C1A14] mb-0.5 hover:text-[#8C4A27] transition-colors truncate">
              {formattedTitle}
            </h3>
          </Link>
          
          {/* Description */}
          <p className="text-[#6E5F55] text-[10px] sm:text-xs truncate mb-1.5 font-sans">
            {formattedDescription}
          </p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-[#C87533]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", i < Math.floor(rating) ? "fill-current" : "fill-transparent")} />
              ))}
            </div>
            <span className="text-[10px] text-[#6E5F55] ml-0.5 font-sans">({reviewsCount})</span>
          </div>
        </div>

        {/* Bottom Section: Price + Actions */}
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-sans font-black text-lg sm:text-2xl text-[#2D0D15] tracking-tight">₹{price}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <button 
              onClick={handleBuyNowClick}
              className="flex-1 bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold py-1.5 px-2 rounded-lg transition-all duration-200 text-[10px] sm:text-xs text-center truncate cursor-pointer active:scale-95 shadow-2xs"
            >
              Buy Now
            </button>
            <button 
              onClick={handleCartIconClick}
              aria-label="Add to Cart"
              title="Add to Cart"
              className="bg-white border border-[#8C4A27] text-[#8C4A27] hover:bg-[#F5EAE1] p-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast Notification for Non-Customized Quick Add */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2C1A14] text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold border border-amber-900/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Product added to cart.</span>
        </div>
      )}

    </div>
  );
};
