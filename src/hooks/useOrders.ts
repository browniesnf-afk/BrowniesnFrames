import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface OrderItem {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  items_summary?: string;
  shipping_address?: any;
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    let allOrders: OrderItem[] = [];

    // Check all localStorage keys for placed orders
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('orders_')) {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          allOrders.push(...items);
        }
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbIds = new Set(data.map(o => o.id));
        const localUnique = allOrders.filter(lo => !dbIds.has(lo.id));
        allOrders = [...data, ...localUnique];
      }
    } catch (err: any) {
      console.warn('Orders fetch notice:', err.message);
    } finally {
      setOrders(allOrders);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderItem['status']) => {
    try {
      // 1. Update Supabase database
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) console.warn('Supabase status update notice:', error.message);

      // 2. Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // 3. Update all local storage customer order caches
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('orders_')) {
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            const hasOrder = items.some((item: any) => item.id === orderId);
            if (hasOrder) {
              const updated = items.map((item: any) => 
                item.id === orderId ? { ...item, status: newStatus } : item
              );
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        }
      } catch (e) {}

      return { success: true };
    } catch (err: any) {
      console.error('Update status error:', err);
      return { success: false, error: err.message };
    }
  };

  const seedSampleOrders = async () => {
    setLoading(true);
    try {
      const sampleCustomers = [
        { full_name: 'Ananya Sharma', phone: '9876543210', email: 'ananya@example.com' },
        { full_name: 'Rohan Mehta', phone: '9812345678', email: 'rohan@example.com' },
        { full_name: 'Priya Patel', phone: '9765432109', email: 'priya@example.com' },
        { full_name: 'Vikram Singh', phone: '9988776655', email: 'vikram@example.com' }
      ];

      const { data: custData } = await supabase.from('customers').upsert(sampleCustomers, { onConflict: 'phone' }).select('*');
      
      const sampleOrders = [
        { customer_id: custData?.[0]?.id, total_amount: 798, status: 'Delivered', items_summary: 'Belgian Chocolate Brownie x2', shipping_address: { city: 'Mumbai', pin: '400001' } },
        { customer_id: custData?.[1]?.id, total_amount: 899, status: 'Confirmed', items_summary: 'Memories Collage Frame x1', shipping_address: { city: 'Delhi', pin: '110001' } },
        { customer_id: custData?.[2]?.id, total_amount: 1299, status: 'Shipped', items_summary: 'Premium Gift Hamper x1', shipping_address: { city: 'Bangalore', pin: '560001' } },
        { customer_id: custData?.[3]?.id, total_amount: 1347, status: 'Pending', items_summary: 'Walnut Brownie x3', shipping_address: { city: 'Pune', pin: '411001' } },
      ];

      for (const order of sampleOrders) {
        try {
          await supabase.from('orders').insert([order]);
        } catch (e) {
          const { items_summary, ...rest } = order;
          await supabase.from('orders').insert([rest]);
        }
      }
      await fetchOrders();
    } catch (err: any) {
      console.error('Order seeding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, updateOrderStatus, seedSampleOrders, refetch: fetchOrders };
}
