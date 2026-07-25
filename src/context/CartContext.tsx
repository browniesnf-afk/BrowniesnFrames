import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface CartItem {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subTotal: number;
  couponCode: string;
  discount: number;
  applyCouponAsync: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'browniesnframes_cart';
const COUPON_KEY = 'browniesnframes_coupon_data';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
    }
    return [
      {
        id: '1',
        title: 'Gourmet Brownie Box',
        category: 'Custom Gift Hamper',
        price: 699,
        image: '/images/brownie_belgian.jpg',
        quantity: 1
      },
      {
        id: '9',
        title: 'Curated Birthday Gift Hamper',
        category: 'Custom Gift Hamper',
        price: 1199,
        image: '/images/home_gifts.jpg',
        quantity: 1
      }
    ];
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
    return { code: 'WELCOME10', type: 'percentage', value: 10 };
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

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.id === newItem.id && item.size === newItem.size
      );

      const addQty = newItem.quantity || 1;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += addQty;
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

  const clearCart = () => {
    setCart([]);
    setCouponState({ code: '', type: 'percentage', value: 0 });
  };

  const applyCouponAsync = async (code: string): Promise<{ success: boolean; message?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a coupon code.' };

    try {
      // 1. Try querying Supabase promo_codes table
      const { data: dbPromo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (dbPromo) {
        setCouponState({
          code: dbPromo.code,
          type: dbPromo.discount_type || 'percentage',
          value: dbPromo.discount_value || 10
        });
        return { success: true, message: `Promo code "${dbPromo.code}" applied!` };
      }
    } catch (e) {}

    // 2. Fallback static promo rules
    if (cleanCode === 'WELCOME10') {
      setCouponState({ code: 'WELCOME10', type: 'percentage', value: 10 });
      return { success: true, message: '10% OFF Welcome discount applied!' };
    }
    if (cleanCode === 'FESTIVE20') {
      setCouponState({ code: 'FESTIVE20', type: 'percentage', value: 20 });
      return { success: true, message: '20% OFF Festive discount applied!' };
    }
    if (cleanCode === 'FLAT100') {
      setCouponState({ code: 'FLAT100', type: 'flat', value: 100 });
      return { success: true, message: '₹100 FLAT discount applied!' };
    }

    return { success: false, message: 'Invalid or expired promo code.' };
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
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subTotal,
        couponCode: couponState.code,
        discount,
        applyCouponAsync,
        removeCoupon,
        finalTotal
      }}
    >
      {children}
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
