import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

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
  weight?: string;
  category?: string;
}

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
  weight,
  category
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleQuickAdd = () => {
    addToCart({
      id: id,
      title: title,
      category: category || 'Custom Gift Hamper',
      price: price,
      image: image,
      quantity: 1
    });
  };

  const handleCartIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 1. Add product to cart
    addToCart({
      id: id,
      title: title,
      category: category || 'Custom Gift Hamper',
      price: price,
      image: image,
      quantity: 1
    });
    // 2. Navigate directly to /cart page
    navigate('/cart');
  };

  return (
    <div className="group flex flex-col bg-[#FDFBF7] rounded-2xl overflow-hidden border border-gray-200/60 shadow-xs hover:shadow-md transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F5EAE1]/70 p-3 flex items-center justify-center overflow-hidden">
        <Link to={link} className="w-full h-full flex items-center justify-center">
          <img 
            src={image} 
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

        {/* Heart */}
        <button className="absolute top-2.5 right-2.5 p-1 text-gray-700 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Title */}
          <Link to={link}>
            <h3 className="font-serif text-xs sm:text-base font-bold text-[#2C1A14] mb-0.5 hover:text-[#8C4A27] transition-colors truncate">
              {title}
            </h3>
          </Link>
          
          {/* Description */}
          <p className="text-[#6E5F55] text-[10px] sm:text-xs truncate mb-1.5 font-sans">
            {description}
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

        {/* Bottom Section: Price/Weight + Actions */}
        <div>
          {/* Price & Weight on same line */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-serif text-base sm:text-xl font-extrabold text-[#2D0A14]">₹{price}</span>
            {weight && <span className="text-[10px] sm:text-xs text-[#6E5F55] font-sans font-medium">{weight}</span>}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <button 
              onClick={handleQuickAdd}
              className="flex-1 bg-white border border-[#8C4A27] text-[#8C4A27] hover:bg-[#F5EAE1] font-medium py-1.5 px-2 rounded-lg transition-colors text-[10px] sm:text-xs text-center truncate cursor-pointer active:scale-95"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleCartIconClick}
              aria-label="Add product and view cart"
              title="Go to Cart"
              className="bg-[#8C4A27] hover:bg-[#733c21] text-white p-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
