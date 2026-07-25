import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { Loader2, Grid, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AllProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filterParam = selectedCategory === 'all' ? undefined : selectedCategory;
  const { products, loading } = useProducts(filterParam);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'brownies', label: 'Brownies' },
    { id: 'frames', label: 'Frames' },
    { id: 'gifts', label: 'Gifts & Hampers' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Page Title Header */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C4A27] flex items-center justify-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" /> Full Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2C1A14] leading-tight">
          All Products
        </h1>
        <p className="text-xs text-[#6E5F55] font-sans mt-2">
          Explore our complete selection of fresh artisanal brownies, handcrafted wooden frames, and luxury gift hampers.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border shadow-2xs",
              selectedCategory === cat.id
                ? "bg-[#8C4A27] text-white border-[#8C4A27] font-semibold shadow-xs"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#8C4A27]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs text-[#6E5F55]">Loading catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-[#6E5F55] bg-white rounded-3xl border border-gray-200 max-w-md mx-auto">
          <Grid className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold text-base text-gray-900">No products found</p>
          <p className="text-xs text-gray-500 mt-1">Try selecting a different category filter above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

    </div>
  );
}
