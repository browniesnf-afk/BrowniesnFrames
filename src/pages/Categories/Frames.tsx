import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { ProductCard } from '../../components/ui/ProductCard';
import { useProducts } from '../../hooks/useProducts';

const Frames = () => {
  const { products, loading } = useProducts('frames');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      
      {/* Hero Banner */}
      <div className="flex w-full h-[180px] sm:h-[300px] md:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#EBE0D6] mb-6 sm:mb-8 group shadow-xs">
        
        {/* Left Column - Content */}
        <div className="w-[55%] md:w-1/2 p-4 sm:p-10 md:p-14 flex flex-col justify-center text-[#2C1A14] z-20">
          <h1 className="text-xl sm:text-4xl md:text-5xl font-serif text-[#2C1A14] mb-1 sm:mb-3 leading-tight font-medium">
            Frames<br />Collection
          </h1>
          <div className="flex items-center gap-1.5 mb-2 sm:mb-4 opacity-75">
            <div className="h-[1px] w-6 sm:w-10 bg-[#8C4A27]"></div>
            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rotate-45 bg-[#8C4A27]"></div>
          </div>
          <p className="text-[#6E5F55] max-w-xs mb-3 sm:mb-6 leading-tight sm:leading-relaxed text-[10px] sm:text-sm font-sans">
            Beautifully crafted frames to hold your most cherished memories.
          </p>
          <button className="bg-[#8C4A27] hover:bg-[#733c21] text-white px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-colors flex items-center gap-1.5 text-[10px] sm:text-sm font-medium w-fit shadow-xs">
            Shop Collection <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Right Column - Image */}
        <div className="w-[45%] md:w-1/2 h-full relative overflow-hidden">
          <img 
            src="/images/home_frames.jpg" 
            alt="Frames Collection"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Left Edge Seamless Fade */}
          <div className="absolute inset-y-0 left-0 w-6 sm:w-20 bg-gradient-to-r from-[#EBE0D6] to-transparent z-10"></div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-4 sm:mb-8 gap-4 px-1">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#6E5F55]">
          <span>Sort by:</span>
          <button className="flex items-center gap-0.5 font-bold text-[#8C4A27] hover:text-[#733c21] transition-colors">
            Latest <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
        <div className="text-xs sm:text-sm text-[#6E5F55]">
          {products.length} Items Found
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-[#8C4A27]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs text-[#6E5F55]">Fetching live products from Supabase...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
      
    </div>
  );
};

export default Frames;
