import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, Search, Upload, Sparkles, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

const images = [
  '/images/frame_memories.jpg',
  '/images/home_frames.jpg',
  '/images/frame_classic.jpg',
  '/images/frame_minimal.jpg'
];

const sizes = ['6 x 6 inch', '8 x 8 inch', '10 x 10 inch', '12 x 12 inch'];

export default function MemoriesCollageFrame() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8 x 8 inch');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [customImages, setCustomImages] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, 4 - customImages.length);

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setCustomImages(prev => [...prev, reader.result as string].slice(0, 4));
          setCustomError(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCustomImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (customImages.length === 0) {
      setCustomError('Please upload at least 1 photo for your custom frame.');
      return;
    }
    if (!customText.trim()) {
      setCustomError('Please enter your custom text or message for the print.');
      return;
    }

    addToCart({
      id: 'memories-collage-frame',
      title: 'Memories Collage Frame',
      category: 'Frames',
      price: 899,
      image: images[activeImageIndex] || images[0],
      quantity: quantity,
      size: selectedSize,
      custom_images: customImages,
      custom_text: customText.trim(),
      is_customizable: true
    }, e);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (customImages.length === 0) {
      setCustomError('Please upload at least 1 photo for your custom frame.');
      return;
    }
    if (!customText.trim()) {
      setCustomError('Please enter your custom text or message for the print.');
      return;
    }

    handleAddToCart(e);
    navigate('/cart');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Image Section: Main Image on Left, Vertical Thumbnails Column on Right */}
      <div className="flex gap-3 mb-3.5">
        {/* Main Image */}
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
        <span className="bg-[#1C1C1C] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md w-fit">
          BESTSELLER
        </span>

        <h1 className="font-sans text-2xl sm:text-3xl text-[#1C1C1C] font-bold leading-tight">
          Memories Collage Frame
        </h1>

        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="font-bold text-gray-900">4.9</span>
          <span className="text-gray-500">(128 reviews)</span>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <span className="font-sans text-3xl sm:text-4xl font-black text-[#2D0D15] tracking-tight">₹899</span>
          <span className="text-sm text-gray-400 line-through font-semibold">₹1299</span>
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            Special Offer
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed pt-1 font-sans">
          Multiple memories, one beautiful framed artwork. Printed on museum-grade matte photo paper with premium wood moulding.
        </p>

        {/* Dynamic Size Variants Pill Selector */}
        <div className="pt-2">
          <span className="block font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1.5">Size</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
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

        {/* Customization Options UI (Required for Collage Frame) */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] rounded-2xl border border-[#8C4A27]/25 space-y-3.5 my-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#8C4A27] font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" /> Customization Options (Required)
          </div>

          {/* 1. Photo Upload (1-4 Photos) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Upload Your Photo(s) <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(1 - 4 Photos)</span>
            </label>
            
            <div className="flex flex-wrap gap-2.5 my-2">
              {customImages.map((imgUrl, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#8C4A27] shadow-2xs group">
                  <img src={imgUrl} alt={`Custom upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeCustomImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 shadow-xs hover:bg-red-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {customImages.length < 4 && (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#8C4A27]/40 bg-white hover:bg-[#F5EAE1] text-[#8C4A27] flex flex-col items-center justify-center cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">+ Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleCustomImageUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            {customImages.length === 0 && (
              <p className="text-[10px] text-gray-500">Click '+ Photo' to upload your high-res photos for printing.</p>
            )}
          </div>

          {/* 2. Custom Text Field */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Custom Text / Name / Message <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Our Happy Memories 2026, Roshini &amp; Family..."
              value={customText}
              onChange={(e) => { setCustomText(e.target.value); setCustomError(null); }}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#8C4A27]"
            />
          </div>

          {customError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" /> {customError}
            </div>
          )}
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
          <button 
            onClick={handleAddToCart}
            className="bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-98"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="bg-[#2C1A14] hover:bg-black text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-98"
          >
            Buy Now
          </button>
        </div>

      </div>
    </div>
  );
}
