import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { toCdnUrl } from '../lib/cdn';

export default function Home() {
  const { activeCategories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts();

  // Show only a limited preview of 4 products on the Home Page
  const previewProducts = products.slice(0, 4);

  const getStyleProps = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'brownies':
        return {
          bgClass: 'bg-[#2C1A14]',
          textClass: 'text-[#F5EAE1]',
          gradientClass: 'from-[#2C1A14] via-[#2C1A14]/80 to-transparent'
        };
      case 'frames':
        return {
          bgClass: 'bg-[#EBE0D6]',
          textClass: 'text-[#2C1A14]',
          gradientClass: 'from-[#EBE0D6] via-[#EBE0D6]/80 to-transparent'
        };
      case 'gifts':
      default:
        return {
          bgClass: 'bg-[#F8D8CF]',
          textClass: 'text-[#2C1A14]',
          gradientClass: 'from-[#F8D8CF] via-[#F8D8CF]/80 to-transparent'
        };
    }
  };

  const getCategoryTagline = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'brownies':
        return 'Rich. Fudgy.\nIrresistible.';
      case 'frames':
        return 'Your memories.\nBeautifully framed.';
      case 'gifts':
      default:
        return 'Thoughtful gifts\nfor every occasion.';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-10 sm:space-y-14">
      
      {/* 1. Category Banner Cards Section */}
      {loadingCategories || activeCategories.length === 0 ? (
        <div className="space-y-4 md:space-y-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-full h-[160px] md:h-[280px] rounded-2xl md:rounded-3xl bg-gray-100 animate-pulse border border-gray-200/60"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {activeCategories.map((category) => {
            const styles = getStyleProps(category.slug);
            const categoryLink = `/categories/${category.slug}`;
            const displayImage = toCdnUrl(category.image_url) || `/images/home_${category.slug}.jpg`;

            return (
              <Link 
                key={category.id}
                to={categoryLink}
                className={`flex w-full h-[160px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden ${styles.bgClass} group shadow-sm cursor-pointer block hover:shadow-md transition-all duration-300`}
              >
                {/* Left Column - Content */}
                <div className={`w-[55%] md:w-1/2 p-5 md:p-12 flex flex-col justify-center ${styles.textClass}`}>
                  <h2 className={`text-2xl md:text-4xl font-serif mb-1 md:mb-2 font-normal text-current group-hover:translate-x-1 transition-transform`}>
                    {category.name}
                  </h2>
                  
                  {/* Clean Horizontal Line (No Diamond) */}
                  <div className="h-[2px] w-7 md:w-10 bg-current opacity-70 my-2 md:my-3"></div>
                  
                  <p className="text-[11px] md:text-base whitespace-pre-line mb-3 md:mb-6 opacity-90 leading-snug font-sans text-current">
                    {getCategoryTagline(category.slug)}
                  </p>
                  
                  <div className="uppercase tracking-widest text-[9px] md:text-xs font-medium flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:gap-2 transition-all text-current">
                    EXPLORE <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="w-[45%] md:w-1/2 h-full relative overflow-hidden bg-gray-200/50">
                  <img 
                    src={displayImage} 
                    alt={category.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  {/* Left Edge Seamless Fade */}
                  <div className={`absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r ${styles.gradientClass} z-10`}></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 2. Featured Products Section - Limited 4 Product Preview */}
      <section className="space-y-6">
        
        {/* Section Header with Single Top Right View All Link */}
        <div className="flex items-end justify-between border-b border-[#8C4A27]/15 pb-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C4A27] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8C4A27]" /> Customer Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1A14]">
              All Products
            </h2>
          </div>

          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#8C4A27] hover:bg-[#733c21] py-2.5 px-4.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Product Preview Grid */}
        {loadingProducts ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#8C4A27]">
            <Loader2 className="w-7 h-7 animate-spin mb-2" />
            <span className="text-xs text-[#6E5F55]">Loading featured preview...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {previewProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

      </section>
      
    </div>
  );
}
