import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export interface CartItem {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  custom_images?: string[];
  custom_text?: string;
  is_customizable?: boolean;
}

export interface FlyingItem {
  id: number;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
    startElementOrEvent?: React.MouseEvent | HTMLElement | null
  ) => void;
  triggerFlyAnimation: (
    imageSrc: string,
    startElementOrEvent?: React.MouseEvent | HTMLElement | null
  ) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subTotal: number;
  couponCode: string;
  discount: number;
  applyCouponAsync: (code: string) => Promise<{ success: boolean; message?: string }>;
  updateCustomization: (id: string, size?: string, custom_images?: string[], custom_text?: string) => void;
  removeCoupon: () => void;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'browniesnframes_cart';
const COUPON_KEY = 'browniesnframes_coupon_data';

const sanitizeCartItem = (item: any): CartItem => {
  if (!item) return item;
  const knownKeywords = ['frame', 'brownie', 'hamper', 'box', 'gift', 'chocolate', 'biscoff', 'nutella', 'walnut', 'collage', 'wooden', 'memories', 'classic', 'minimal'];
  const titleLower = (item.title || '').trim().toLowerCase();
  const hasKeyword = knownKeywords.some(kw => titleLower.includes(kw));

  let realTitle = item.title;
  let customText = item.custom_text;

  // If title was saved as a customer name or custom text (like "asba" or "inayath")
  if (!hasKeyword || titleLower === 'asba' || titleLower === 'inayath' || (customText && titleLower === customText.trim().toLowerCase())) {
    if (!customText && item.title && !hasKeyword) {
      customText = item.title;
    }
    realTitle = item.category?.toLowerCase() === 'brownies' ? 'Belgian Chocolate Brownie' : 'Memories Collage Frame';
  }

  return {
    ...item,
    title: realTitle,
    custom_text: customText
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleanCart = (parsed || []).filter((item: any) => 
          !(item.id === '1' && item.title === 'Gourmet Brownie Box') &&
          !(item.id === '9' && item.title === 'Curated Birthday Gift Hamper')
        );
        return cleanCart.map(sanitizeCartItem);
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
    }
    return [];
  });

  const [couponState, setCouponState] = useState<{
    code: string;
    type: 'percentage' | 'flat';
    value: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(COUPON_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { code: '', type: 'percentage', value: 0 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  useEffect(() => {
    if (couponState.code) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(couponState));
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  }, [couponState]);

  // Real-time subscription to promo_codes table
  useEffect(() => {
    const channel = supabase
      .channel('cart_promo_codes_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promo_codes' },
        (payload) => {
          console.log('⚡ Realtime promo code change in Cart:', payload);
          const appliedCode = couponState.code.toUpperCase();
          if (!appliedCode) return;

          if (payload.eventType === 'DELETE') {
            const deletedCode = (payload.old.code || '').toUpperCase();
            // Since payload.old might not contain the code string depending on publication settings,
            // we re-verify or handle it by comparing id or code if present.
            if (deletedCode === appliedCode || payload.old.id) {
              removeCoupon();
              alert(`⚠️ The applied promo code "${appliedCode}" has been removed by the administrator.`);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCode = payload.new;
            if (updatedCode.code?.toUpperCase() === appliedCode) {
              if (updatedCode.is_active === false) {
                removeCoupon();
                alert(`⚠️ The applied promo code "${appliedCode}" is now inactive.`);
              } else {
                const discVal = Number(updatedCode.discount_value ?? updatedCode.discount_percent ?? updatedCode.value ?? 10);
                const discType = updatedCode.discount_type || (updatedCode.discount_percent && !updatedCode.discount_value ? 'percentage' : 'flat');
                setCouponState({
                  code: updatedCode.code,
                  type: discType as any,
                  value: discVal
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couponState.code]);

  const triggerFlyAnimation = (
    imageSrc: string,
    startElementOrEvent?: React.MouseEvent | HTMLElement | null
  ) => {
    let startX = window.innerWidth / 2 - 28;
    let startY = window.innerHeight / 2 - 28;

    if (startElementOrEvent) {
      let el: HTMLElement | null = null;
      if (startElementOrEvent instanceof HTMLElement) {
        el = startElementOrEvent;
      } else if (startElementOrEvent.currentTarget instanceof HTMLElement) {
        el = startElementOrEvent.currentTarget;
      } else if (startElementOrEvent.target instanceof HTMLElement) {
        el = startElementOrEvent.target;
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        startX = rect.left + rect.width / 2 - 28;
        startY = rect.top + rect.height / 2 - 28;
      }
    }

    const headerCartEl = document.getElementById('header-cart-icon') || document.querySelector('[data-cart-icon]');
    let endX = window.innerWidth - 45;
    let endY = 25;

    if (headerCartEl) {
      const rect = headerCartEl.getBoundingClientRect();
      endX = rect.left + rect.width / 2 - 14;
      endY = rect.top + rect.height / 2 - 14;
    }

    const newItem: FlyingItem = {
      id: Date.now() + Math.random(),
      image: imageSrc || '/images/home_brownies.jpg',
      startX,
      startY,
      endX,
      endY
    };

    setFlyingItems(prev => [...prev, newItem]);
  };

  const addToCart = (
    rawItem: Omit<CartItem, 'quantity'> & { quantity?: number },
    startElementOrEvent?: React.MouseEvent | HTMLElement | null
  ) => {
    const newItem = sanitizeCartItem(rawItem);

    // 1. Trigger visual fly-to-cart animation
    triggerFlyAnimation(newItem.image, startElementOrEvent);

    // 2. Update cart state
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.id === newItem.id && item.size === newItem.size
      );

      const addQty = newItem.quantity || 1;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += addQty;
        if (newItem.custom_images) updated[existingIndex].custom_images = newItem.custom_images;
        if (newItem.custom_text) updated[existingIndex].custom_text = newItem.custom_text;
        return updated;
      } else {
        return [...prevCart, { ...newItem, quantity: addQty }];
      }
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const updateCustomization = (id: string, size?: string, custom_images?: string[], custom_text?: string) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id && item.size === size) {
          return {
            ...item,
            custom_images: custom_images ?? item.custom_images,
            custom_text: custom_text ?? item.custom_text
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponState({ code: '', type: 'percentage', value: 0 });
  };

  const applyCouponAsync = async (code: string): Promise<{ success: boolean; message?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a promo code.' };

    try {
      let dbPromo: any = null;

      // 1. Try fetching from Supabase
      try {
        const { data, error } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (!error && data) {
          dbPromo = data;
        }
      } catch (e) {}

      // 2. Check localStorage fallback if not found in Supabase
      if (!dbPromo) {
        try {
          const stored = localStorage.getItem('browniesnframes_promo_codes');
          if (stored) {
            const localList = JSON.parse(stored);
            dbPromo = localList.find((p: any) => p.code?.toUpperCase() === cleanCode);
          }
        } catch (e) {}
      }

      // 3. Fallback default promos
      if (!dbPromo) {
        const defaultList = [
          { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, is_active: true },
          { code: 'FLAT100', discount_type: 'flat', discount_value: 100, is_active: true },
          { code: 'BASHA', discount_type: 'flat', discount_value: 100, is_active: true }
        ];
        dbPromo = defaultList.find(p => p.code === cleanCode);
      }

      if (!dbPromo) {
        return { success: false, message: `Promo code "${cleanCode}" is invalid or does not exist.` };
      }

      if (dbPromo.is_active === false) {
        return { success: false, message: `Promo code "${cleanCode}" is currently inactive.` };
      }

      const minSpend = Number(dbPromo.min_order_value || dbPromo.min_order_amount || 0);
      if (minSpend > 0 && subTotal < minSpend) {
        return { 
          success: false, 
          message: `Minimum order total of ₹${minSpend} required for "${cleanCode}".` 
        };
      }

      const discVal = Number(dbPromo.discount_value ?? dbPromo.discount_percent ?? dbPromo.value ?? 10);
      const discType = dbPromo.discount_type || (dbPromo.discount_percent && !dbPromo.discount_value ? 'percentage' : 'flat');

      setCouponState({
        code: dbPromo.code,
        type: discType as any,
        value: discVal
      });

      return { 
        success: true, 
        message: `🎉 Code "${dbPromo.code}" applied (${discType === 'flat' ? `₹${discVal}` : `${discVal}%`} OFF)!` 
      };

    } catch (err: any) {
      console.error('Promo code validation error:', err);
      return { success: false, message: 'Invalid promo code.' };
    }
  };

  const removeCoupon = () => {
    setCouponState({ code: '', type: 'percentage', value: 0 });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discount = 0;
  if (couponState.code && subTotal > 0) {
    if (couponState.type === 'percentage') {
      discount = Math.round((subTotal * couponState.value) / 100);
    } else {
      discount = Math.min(subTotal, couponState.value);
    }
  }

  const finalTotal = Math.max(0, subTotal - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        triggerFlyAnimation,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subTotal,
        couponCode: couponState.code,
        discount,
        applyCouponAsync,
        updateCustomization,
        removeCoupon,
        finalTotal
      }}
    >
      {children}

      {/* Global Fly-to-Cart Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map(item => (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                opacity: 1,
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
              }}
              animate={{
                x: item.endX,
                y: item.endY,
                scale: 0.22,
                opacity: 0.85,
                borderRadius: '50%'
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              onAnimationComplete={() => {
                setFlyingItems(prev => prev.filter(f => f.id !== item.id));
              }}
              className="fixed top-0 left-0 w-14 h-14 bg-white p-1 border-2 border-[#8C4A27] overflow-hidden shadow-2xl pointer-events-none"
            >
              <img src={item.image} alt="Flying item" className="w-full h-full object-cover rounded-xl" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
