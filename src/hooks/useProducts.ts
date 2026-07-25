import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  weight?: string;
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: 'BESTSELLER' | 'NEW' | null;
  link: string;
  category: string;
}

export function useProducts(categoryFilter?: string) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRow = (item: any): ProductItem => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    price: item.price,
    weight: item.weight || '250g',
    image: item.images?.[0] || '/images/home_brownies.jpg',
    rating: item.rating || 5,
    reviewsCount: item.reviews_count || 100,
    badge: item.badge as any || null,
    link: `/products/${item.slug || item.id}`,
    category: item.category
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('products').select('*');
      
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map(mapRow));
      } else {
        setProducts(getFallbackProducts(categoryFilter));
      }
    } catch (err: any) {
      console.warn('Supabase fetch notice (using fallback):', err.message);
      setProducts(getFallbackProducts(categoryFilter));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchProducts();

    // Unique channel per hook instance to prevent "cannot add callbacks after subscribe" error
    const uniqueChannelName = 'rt_prod_' + Math.random().toString(36).substring(2, 9);
    let channel: any = null;

    try {
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('⚡ Realtime product change:', payload.eventType);
            const newRow = payload.new as any;
            const oldRow = payload.old as any;

            if (categoryFilter && newRow?.category && newRow.category !== categoryFilter) {
              return;
            }

            if (payload.eventType === 'INSERT') {
              setProducts(prev => [mapRow(newRow), ...prev]);
            } else if (payload.eventType === 'DELETE') {
              setProducts(prev => prev.filter(p => p.id !== oldRow.id));
            } else if (payload.eventType === 'UPDATE') {
              setProducts(prev =>
                prev.map(p => p.id === newRow.id ? mapRow(newRow) : p)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('Products realtime status:', status);
        });
    } catch (err) {
      console.warn('Realtime subscription error in useProducts:', err);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, [categoryFilter, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

function getFallbackProducts(categoryFilter?: string): ProductItem[] {
  const all: ProductItem[] = [
    // Brownies
    { id: '1', title: 'Belgian Chocolate Brownie', description: 'Rich, fudgy & decadent chocolate brownie.', price: 399, weight: '250g', image: '/images/brownie_belgian.jpg', rating: 5, reviewsCount: 132, badge: 'BESTSELLER', link: '/products/belgian-chocolate-brownie', category: 'brownies' },
    { id: '2', title: 'Walnut Brownie', description: 'Crunchy walnuts with rich chocolate brownie.', price: 449, weight: '250g', image: '/images/brownie_walnut.jpg', rating: 5, reviewsCount: 96, badge: 'NEW', link: '/products/walnut-brownie', category: 'brownies' },
    { id: '3', title: 'Nutella Brownie', description: 'Gooey Nutella swirl in every bite.', price: 499, weight: '250g', image: '/images/brownie_nutella.jpg', rating: 5, reviewsCount: 118, badge: null, link: '/products/nutella-brownie', category: 'brownies' },
    { id: '4', title: 'Biscoff Brownie', description: 'Biscoff spread with crunchy biscoff crumbs.', price: 449, weight: '250g', image: '/images/brownie_biscoff.jpg', rating: 5, reviewsCount: 87, badge: null, link: '/products/biscoff-brownie', category: 'brownies' },
    
    // Frames
    { id: '5', title: 'Classic Collage Frame', description: 'Elegant wooden collage frame to hold your favorite moments.', price: 799, image: '/images/frame_classic.jpg', rating: 5, reviewsCount: 128, badge: 'BESTSELLER', link: '/products/classic-collage-frame', category: 'frames' },
    { id: '6', title: 'Minimal Wooden Frame', description: 'Simple, natural & perfect for any space.', price: 599, image: '/images/frame_minimal.jpg', rating: 5, reviewsCount: 96, badge: 'NEW', link: '/products/minimal-wooden-frame', category: 'frames' },
    { id: '7', title: 'Black Border Frame', description: 'Modern black frame with a premium matte finish.', price: 549, image: '/images/frame_black.jpg', rating: 5, reviewsCount: 72, badge: null, link: '/products/black-border-frame', category: 'frames' },
    { id: '8', title: 'Memories Collage Frame', description: 'Multiple memories, one beautiful frame.', price: 899, image: '/images/frame_memories.jpg', rating: 5, reviewsCount: 54, badge: null, link: '/products/memories-collage-frame', category: 'frames' },

    // Gifts
    { id: '9', title: 'Premium Gift Hamper', description: 'A perfect blend of brownies, candle, and mug in a luxury box.', price: 1299, image: '/images/gift_hamper.jpg', rating: 5, reviewsCount: 145, badge: 'BESTSELLER', link: '/products/premium-gift-hamper', category: 'gifts' },
    { id: '10', title: 'Luxury Gift Box', description: 'Elegant gift box filled with handpicked delights.', price: 1099, image: '/images/gift_luxury.jpg', rating: 5, reviewsCount: 98, badge: 'NEW', link: '/products/luxury-gift-box', category: 'gifts' },
    { id: '11', title: 'Brownie Gift Box', description: 'Delicious brownies in a beautifully crafted gift box.', price: 899, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', rating: 5, reviewsCount: 112, badge: null, link: '/products/brownie-gift-box', category: 'gifts' },
    { id: '12', title: 'Brownie Bouquet', description: 'A unique bouquet made of rich chocolate brownies.', price: 1199, image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', rating: 5, reviewsCount: 76, badge: 'NEW', link: '/products/brownie-bouquet', category: 'gifts' },
  ];

  if (!categoryFilter) return all;
  return all.filter(p => p.category === categoryFilter);
}
