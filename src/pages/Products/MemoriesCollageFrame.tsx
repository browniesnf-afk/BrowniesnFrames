import { useState } from 'react';
import { Star, Minus, Plus, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const images = [
  '/images/home_frames.jpg',
  '/images/frame_memories.jpg',
  '/images/frame_classic.jpg',
  '/images/frame_minimal.jpg'
];

const sizes = ['6 x 6 inch', '8 x 8 inch', '10 x 10 inch', '12 x 12 inch'];

export default function MemoriesCollageFrame() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8 x 8 inch');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
                activeImageIndex === i ? "border-[#F05365] ring-1 ring-[#F05365]" : "border-transparent opacity-70 hover:opacity-100"
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
        <span className="bg-[#1C1C1C] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md w-fit">
          BEST SELLER
        </span>

        {/* Title */}
        <h1 className="font-sans text-2xl sm:text-3xl text-[#1C1C1C] font-bold leading-tight">
          Memories Collage Frame
        </h1>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-3.5 h-3.5", i < 4.9 ? "fill-current" : "fill-transparent text-gray-300")} />
            ))}
          </div>
          <span className="font-bold text-gray-900">4.9</span>
          <span className="text-gray-500">(54 customer reviews)</span>
        </div>

        {/* Price & Special Offer Tag */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#F05365]">₹899</span>
          <span className="text-sm text-gray-400 line-through">₹1,199</span>
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            Special Offer
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed pt-1 font-sans">
          Multiple memories, one beautiful frame. Handcrafted with natural oak wood and crystal clear glass overlay.
        </p>

        {/* Size Selection */}
        <div className="pt-2">
          <span className="block font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1.5">Size</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-3 py-1.5 border rounded-xl text-xs font-medium transition-colors cursor-pointer",
                  selectedSize === size 
                    ? "border-[#F05365] text-[#F05365] bg-[#FFF0F3]" 
                    : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 pt-2">
          <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">QTY:</span>
          <div className="flex items-center w-24 border border-gray-200 rounded-full bg-white px-2 py-0.5 shadow-2xs">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input 
              type="text" 
              value={quantity} 
              readOnly
              className="w-full text-center bg-transparent font-medium text-gray-900 text-xs focus:outline-none" 
            />
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button className="bg-[#181818] hover:bg-black text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center">
            Add to Cart
          </button>
          <button className="bg-[#F06292] hover:bg-[#E91E63] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center">
            Buy Now
          </button>
        </div>

      </div>
    </div>
  );
}
