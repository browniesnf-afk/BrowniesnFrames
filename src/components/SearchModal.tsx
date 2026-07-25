import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight, Sparkles, Package } from 'lucide-react';
import { supabase } from '../supabase/client';

interface ProductSearchResult {
  id: string;
  title: string;
  category: string;
  price: number;
  slug: string;
  images: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, category, price, slug, images')
          .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(6);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-[#2C1A14]/60 backdrop-blur-md transition-all duration-300">
      {/* Overlay backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#8C4A27]/20 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input Bar Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#8C4A27]/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F5EAE1] flex items-center justify-center text-[#8C4A27] shrink-0">
            <Search className="w-4 h-4" />
          </div>
          
          <input
            type="text"
            autoFocus
            placeholder="Search brownies, frames, gift hampers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base font-sans text-[#2C1A14] bg-transparent border-none outline-none placeholder:text-[#6E5F55]/60"
          />
          
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#8C4A27] shrink-0" />}
          
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-[#8C4A27] font-medium hover:underline shrink-0 px-1"
            >
              Clear
            </button>
          )}

          <button 
            onClick={onClose}
            className="p-1.5 text-[#6E5F55] hover:text-[#2C1A14] rounded-full hover:bg-[#F5EAE1] transition-colors shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List or Suggestions */}
        <div className="max-h-[380px] overflow-y-auto p-4 sm:p-5">
          {query.trim() && results.length === 0 && !loading ? (
            <div className="py-10 text-center text-[#6E5F55]">
              <div className="w-12 h-12 rounded-full bg-[#F5EAE1] text-[#8C4A27] flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6" />
              </div>
              <p className="font-serif text-lg font-medium text-[#2C1A14]">No matches found for "{query}"</p>
              <p className="text-xs text-[#6E5F55] mt-1">Try searching for "Belgian", "Collage", or "Hamper"</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] uppercase font-bold text-[#8C4A27] tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Matching Products ({results.length})
                </span>
              </div>
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#8C4A27]/10 hover:border-[#8C4A27]/40 hover:shadow-sm transition-all duration-200 group"
                  >
                    <img
                      src={product.images?.[0] || '/images/home_brownies.jpg'}
                      alt={product.title}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200/60 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-[#2C1A14] group-hover:text-[#8C4A27] truncate transition-colors">
                        {product.title}
                      </h4>
                      <span className="text-[9px] uppercase font-bold text-[#8C4A27] bg-[#F5EAE1] px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#2C1A14]">₹{product.price}</span>
                      <div className="w-7 h-7 rounded-full bg-[#F5EAE1] text-[#8C4A27] flex items-center justify-center group-hover:bg-[#8C4A27] group-hover:text-white transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Popular Suggestions Default State */
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rotate-45 bg-[#8C4A27]"></span>
                <span className="text-[10px] uppercase font-bold text-[#8C4A27] tracking-widest">
                  Popular Searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Belgian Chocolate', 
                  'Walnut Brownie', 
                  'Collage Frame', 
                  'Gift Hamper', 
                  'Nutella Swirl', 
                  'Luxury Box'
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-white hover:bg-[#8C4A27] text-[#2C1A14] hover:text-white px-3.5 py-2 rounded-full border border-[#8C4A27]/15 transition-all duration-200 shadow-2xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#8C4A27] hover:bg-white" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F5EAE1]/80 border-t border-[#8C4A27]/10 flex items-center justify-between text-[11px] text-[#6E5F55]">
          <span>Tip: Press ESC or click outside to close</span>
          <span className="font-serif font-bold text-[#8C4A27]">Brownies<span className="italic font-normal font-serif">n</span>Frames</span>
        </div>

      </div>
    </div>
  );
}
