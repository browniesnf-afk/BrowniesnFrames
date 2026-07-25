import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
}

const fallbackCategories: CategoryItem[] = [
  {
    id: 'brownies',
    name: 'Brownies',
    slug: 'brownies',
    description: 'Rich. Fudgy.\nIrresistible.',
    image_url: '/images/home_brownies.jpg',
    is_active: true
  },
  {
    id: 'frames',
    name: 'Frames',
    slug: 'frames',
    description: 'Your memories.\nBeautifully framed.',
    image_url: '/images/home_frames.jpg',
    is_active: true
  },
  {
    id: 'gifts',
    name: 'Gifts',
    slug: 'gifts',
    description: 'Thoughtful gifts\nfor every occasion.',
    image_url: '/images/home_gifts.jpg',
    is_active: true
  }
];

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data.map(c => ({
          ...c,
          is_active: c.is_active ?? true
        })));
      } else {
        setCategories(fallbackCategories);
      }
    } catch (err: any) {
      console.warn('Live categories fetch notice:', err.message);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    // Unique channel per hook instance to prevent "cannot add callbacks after subscribe" error
    const uniqueChannelName = 'rt_cat_' + Math.random().toString(36).substring(2, 9);
    let channel: any = null;

    try {
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload) => {
            console.log('⚡ Realtime category change:', payload.eventType);
            if (payload.eventType === 'INSERT') {
              setCategories(prev => [...prev, { ...payload.new as CategoryItem, is_active: (payload.new as any).is_active ?? true }]);
            } else if (payload.eventType === 'DELETE') {
              setCategories(prev => prev.filter(c => c.id !== (payload.old as any).id));
            } else if (payload.eventType === 'UPDATE') {
              setCategories(prev =>
                prev.map(c => c.id === (payload.new as CategoryItem).id
                  ? { ...payload.new as CategoryItem, is_active: (payload.new as any).is_active ?? true }
                  : c
                )
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('Categories realtime status:', status);
        });
    } catch (err) {
      console.warn('Realtime subscription error in useCategories:', err);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, [fetchCategories]);

  const activeCategories = categories.filter(c => c.is_active !== false);

  return {
    categories,
    activeCategories,
    loading,
    error,
    refetch: fetchCategories
  };
}
