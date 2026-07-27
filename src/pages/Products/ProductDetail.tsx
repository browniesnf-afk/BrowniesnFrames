import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, Search, Loader2, Upload, Sparkles, X, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { toCdnUrl } from '../../lib/cdn';

const DEFAULT_FRAME_SIZES = ['6 x 6 inch', '8 x 8 inch', '10 x 10 inch', '12 x 12 inch'];

const fallbackProducts: Record<string, any> = {
  // Brownies
  'belgian-chocolate-brownie': {
    title: 'Belgian Chocolate Brownie',
    slug: 'belgian-chocolate-brownie',
    category: 'Brownies',
    price: 399,
    compare_at_price: 499,
    description: 'Rich, fudgy & decadent chocolate brownie baked fresh with authentic Belgian dark chocolate.',
    images: ['/images/brownie_belgian.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 100,
    badge: 'BESTSELLER'
  },
  'walnut-brownie': {
    title: 'Walnut Brownie Box',
    slug: 'walnut-brownie',
    category: 'Brownies',
    price: 449,
    compare_at_price: 549,
    description: 'Crunchy roasted walnuts combined with dense dark chocolate fudge. Includes 9 rich, fudgy pieces.',
    images: ['/images/brownie_walnut.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 96,
    badge: 'NEW'
  },
  'walnut-fudge-brownie': {
    title: 'Walnut Brownie Box',
    slug: 'walnut-fudge-brownie',
    category: 'Brownies',
    price: 449,
    compare_at_price: 549,
    description: 'Crunchy roasted walnuts combined with dense dark chocolate fudge. Includes 9 rich, fudgy pieces.',
    images: ['/images/brownie_walnut.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 96,
    badge: 'NEW'
  },
  'nutella-brownie': {
    title: 'Nutella Swirl Brownie',
    slug: 'nutella-brownie',
    category: 'Brownies',
    price: 499,
    compare_at_price: 599,
    description: 'Gooey Nutella swirl in every bite, baked fresh to chocolate fudge perfection.',
    images: ['/images/brownie_nutella.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 118,
    badge: 'BESTSELLER'
  },
  'nutella-swirl-brownie': {
    title: 'Nutella Swirl Brownie',
    slug: 'nutella-swirl-brownie',
    category: 'Brownies',
    price: 499,
    compare_at_price: 599,
    description: 'Gooey Nutella swirl in every bite, baked fresh to chocolate fudge perfection.',
    images: ['/images/brownie_nutella.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 118,
    badge: 'BESTSELLER'
  },
  'biscoff-brownie': {
    title: 'Lotus Biscoff Brownie',
    slug: 'biscoff-brownie',
    category: 'Brownies',
    price: 449,
    compare_at_price: 549,
    description: 'Biscoff spread with crunchy biscoff crumbs topped over dark Belgian chocolate fudge.',
    images: ['/images/brownie_biscoff.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 87,
    badge: 'NEW'
  },
  'lotus-biscoff-brownie': {
    title: 'Lotus Biscoff Brownie',
    slug: 'lotus-biscoff-brownie',
    category: 'Brownies',
    price: 449,
    compare_at_price: 549,
    description: 'Biscoff spread with crunchy biscoff crumbs topped over dark Belgian chocolate fudge.',
    images: ['/images/brownie_biscoff.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 87,
    badge: 'NEW'
  },

  // Frames
  'classic-collage-frame': {
    title: 'Classic Collage Frame',
    slug: 'classic-collage-frame',
    category: 'Frames',
    price: 799,
    compare_at_price: 999,
    description: 'Elegant wooden collage frame to hold your favorite moments.',
    images: ['/images/frame_classic.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 128,
    badge: 'BESTSELLER'
  },
  'minimal-wooden-frame': {
    title: 'Minimal Wooden Frame',
    slug: 'minimal-wooden-frame',
    category: 'Frames',
    price: 599,
    compare_at_price: 799,
    description: 'Simple, natural & perfect for any space.',
    images: ['/images/frame_minimal.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 96,
    badge: 'NEW'
  },
  'minimalist-white-frame': {
    title: 'Minimal Wooden Frame',
    slug: 'minimalist-white-frame',
    category: 'Frames',
    price: 599,
    compare_at_price: 799,
    description: 'Simple, natural & perfect for any space.',
    images: ['/images/frame_minimal.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 96,
    badge: 'NEW'
  },
  'black-border-frame': {
    title: 'Black Border Frame',
    slug: 'black-border-frame',
    category: 'Frames',
    price: 549,
    compare_at_price: 749,
    description: 'Modern black frame with a premium matte finish.',
    images: ['/images/frame_black.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 72,
    badge: 'POPULAR'
  },
  'black-gallery-frame': {
    title: 'Black Border Frame',
    slug: 'black-gallery-frame',
    category: 'Frames',
    price: 549,
    compare_at_price: 749,
    description: 'Modern black frame with a premium matte finish.',
    images: ['/images/frame_black.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 72,
    badge: 'POPULAR'
  },
  'memories-collage-frame': {
    title: 'Memories Collage Frame',
    slug: 'memories-collage-frame',
    category: 'Frames',
    price: 899,
    compare_at_price: 1199,
    description: 'Multiple memories, one beautiful frame.',
    images: ['/images/frame_memories.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop'],
    sizes: DEFAULT_FRAME_SIZES,
    rating: 5.0,
    reviews_count: 54,
    badge: 'BESTSELLER'
  },

  // Gifts
  'premium-gift-hamper': {
    title: 'Premium Gift Hamper',
    slug: 'premium-gift-hamper',
    category: 'Gifts',
    price: 1299,
    compare_at_price: 1699,
    description: 'A perfect blend of brownies, candle, and mug in a luxury gift box.',
    images: ['/images/gift_hamper.jpg', '/images/home_gifts.jpg', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 145,
    badge: 'BESTSELLER'
  },
  'luxury-gift-box': {
    title: 'Luxury Gift Box',
    slug: 'luxury-gift-box',
    category: 'Gifts',
    price: 1099,
    compare_at_price: 1499,
    description: 'Elegant gift box filled with handpicked delights.',
    images: ['/images/gift_luxury.jpg', '/images/home_gifts.jpg', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'],
    rating: 5.0,
    reviews_count: 98,
    badge: 'NEW'
  },
  'brownie-gift-box': {
    title: 'Brownie Gift Box',
    slug: 'brownie-gift-box',
    category: 'Gifts',
    price: 899,
    compare_at_price: 1199,
    description: 'Delicious brownies in a beautifully crafted gift box.',
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', '/images/home_gifts.jpg', '/images/brownie_belgian.jpg'],
    rating: 5.0,
    reviews_count: 112,
    badge: 'POPULAR'
  },
  'brownie-bouquet': {
    title: 'Brownie Bouquet',
    slug: 'brownie-bouquet',
    category: 'Gifts',
    price: 1199,
    compare_at_price: 1599,
    description: 'A unique bouquet made of rich chocolate brownies.',
    images: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', '/images/home_gifts.jpg', '/images/brownie_nutella.jpg'],
    rating: 5.0,
    reviews_count: 76,
    badge: 'NEW'
  }
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
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

const checkIsCustomizable = (p: any): boolean => {
  if (!p) return false;
  if (p.metadata && typeof p.metadata.is_customizable === 'boolean') {
    return p.metadata.is_customizable;
  }
  if (typeof p.is_customizable === 'boolean') {
    return p.is_customizable;
  }
  return p.category?.toLowerCase() === 'frames';
};

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!product) return;

    const isCustomizable = checkIsCustomizable(product);

    if (isCustomizable) {
      if (customImages.length === 0 || !customText.trim()) {
        setCustomError('Please upload your photo and add custom text before adding to cart.');
        return;
      }
    }

    const imgs = product.images && product.images.length > 0 ? product.images : ['/images/home_brownies.jpg'];
    const activeImg = imgs[activeImageIndex] || imgs[0];
    addToCart({
      id: product.id || product.slug,
      title: product.title,
      category: product.category || 'Custom Gift Hamper',
      price: product.price,
      image: activeImg,
      quantity: quantity,
      size: selectedSize || undefined,
      custom_images: customImages.length > 0 ? customImages : undefined,
      custom_text: customText.trim() || undefined,
      is_customizable: isCustomizable
    }, e);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (!product) return;
    const isCustomizable = checkIsCustomizable(product);

    if (isCustomizable) {
      if (customImages.length === 0 || !customText.trim()) {
        setCustomError('Please upload your photo and add custom text before adding to cart.');
        return;
      }
    }

    handleAddToCart(e);
    navigate('/cart');
  };

  useEffect(() => {
    if (!id) return;
    fetchProductDetails();

    // Subscribe to products table updates to show stock and detail changes instantly
    const channel = supabase
      .channel(`product_detail_realtime_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          console.log('⚡ Product detail realtime update:', payload);
          if (payload.new.id === product?.id || payload.new.slug === id) {
            setProduct(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'products' },
        (payload) => {
          console.log('⚡ Product detail realtime delete:', payload);
          if (payload.old.id === product?.id) {
            setProduct(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, product?.id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // 1. Try fetching by slug from Supabase
      let { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', id)
        .maybeSingle();

      // 2. If not found by slug and id looks like UUID, try fetching by id
      if (!data && id && id.length === 36 && id.includes('-')) {
        const { data: idData } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = idData;
      }

      // 3. Fallback dictionary if not found in database yet
      if (!data) {
        data = fallbackProducts[id || ''] || null;
      }

      setProduct(data);
      if (data?.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      } else if (data?.category === 'frames') {
        setSelectedSize(DEFAULT_FRAME_SIZES[0]);
      }
    } catch (err) {
      console.warn('Product detail fetch error:', err);
      const fb = fallbackProducts[id || ''] || null;
      setProduct(fb);
      if (fb?.sizes && fb.sizes.length > 0) {
        setSelectedSize(fb.sizes[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-[#8C4A27]">
        <Loader2 className="w-7 h-7 animate-spin mb-2" />
        <span className="text-xs text-[#6E5F55]">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center text-[#6E5F55]">
        <h2 className="font-serif text-xl text-[#2C1A14] mb-2">Product Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-[#8C4A27] font-semibold underline cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/images/home_brownies.jpg'];

  const productSizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : product.category === 'frames' 
      ? DEFAULT_FRAME_SIZES 
      : null;

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Image Section: Main Image on Left, Vertical Thumbnails Column on Right */}
      <div className="flex gap-3 mb-3.5">
        {/* Main Image with Shorter Aspect Ratio */}
        <div className="flex-1 relative bg-[#FAF6F0] rounded-3xl overflow-hidden aspect-[4/3] max-h-[300px] border border-gray-100/80 shadow-2xs">
          <img 
            src={toCdnUrl(productImages[activeImageIndex] || productImages[0])} 
            alt={product.title} 
            className="w-full h-full object-cover" 
          />
          {/* Circular Search Zoom Button */}
          <button 
            aria-label="Zoom image"
            className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 shadow-xs text-[#2C1A14] flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical Thumbnails Stacked on the Right */}
        {productImages.length > 1 && (
          <div className="w-16 flex flex-col gap-2.5 shrink-0">
            {productImages.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={cn(
                  "w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                  activeImageIndex === i ? "border-[#F05365] ring-1 ring-[#F05365]" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={toCdnUrl(img)} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info Block Below Image - Exact Layout from Reference */}
      <div className="flex flex-col space-y-1.5">
        
        {/* BEST SELLER Badge */}
        <span className="bg-[#1C1C1C] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md w-fit">
          {product.badge || 'BESTSELLER'}
        </span>

        {/* Title */}
        <h1 className="font-sans text-2xl sm:text-3xl text-[#1C1C1C] font-bold leading-tight">
          {product.title}
        </h1>

        {/* Star Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-3.5 h-3.5", i < (product.rating || 5) ? "fill-current" : "fill-transparent text-gray-300")} />
            ))}
          </div>
          <span className="font-bold text-gray-900">{product.rating || 5}</span>
          <span className="text-gray-500">({product.reviews_count || 100} customer reviews)</span>
        </div>

        {/* Price & Special Offer Tag */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="font-sans text-3xl sm:text-4xl font-black text-[#2D0D15] tracking-tight">₹{product.price}</span>
          {product.compare_at_price && (
            <span className="text-sm text-gray-400 line-through font-semibold">₹{product.compare_at_price}</span>
          )}
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            Special Offer
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed pt-1 font-sans">
          {product.description}
        </p>



        {/* Dynamic Size Variants Pill Selector */}
        {productSizes && (
          <div className="pt-2">
            <span className="block font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1.5">Size</span>
            <div className="flex flex-wrap gap-2">
              {productSizes.map((size: string) => (
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
        )}

        {/* Customization Options UI (Only shown if is_customizable is true) */}
        {checkIsCustomizable(product) && (
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
        )}

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
            className="bg-[#181818] hover:bg-black text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-95"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="bg-[#F06292] hover:bg-[#E91E63] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center active:scale-95"
          >
            Buy Now
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 pt-3 text-[11px] font-medium flex-wrap">
          <span className="flex items-center gap-1.5 text-[#8C4A27] bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C4A27]" /> Secure Online Payment
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Free Pan-India Delivery
          </span>
        </div>

      </div>

    </div>
  );
}
