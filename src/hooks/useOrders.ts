import { useState, useEffect, useCallback } from 'react';
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    let allOrders: OrderItem[] = [];

    // 1. Fetch live orders directly from Supabase orders table
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase orders fetch notice:', error.message);
        setError(error.message);
      } else if (data && data.length > 0) {
        allOrders = data.map(o => {
          const addr = o.shipping_address || {};
          return {
            id: o.id,
            customer_name: addr.full_name || o.customer_name || 'Customer',
            customer_phone: addr.phone || o.customer_phone || 'N/A',
            total_amount: o.total_amount,
            status: o.status || 'Pending',
            created_at: o.created_at,
            items_summary: o.items_summary || addr.items_summary || 'Order items',
            shipping_address: addr
          };
        });
      }
    } catch (err: any) {
      console.warn('Orders fetch error:', err.message);
    }

    // 2. Merge local storage cached orders for instant device sync
    try {
      const dbIds = new Set(allOrders.map(o => o.id));
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('orders_')) {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          for (const item of items) {
            if (!dbIds.has(item.id)) {
              allOrders.push(item);
              dbIds.add(item.id);
            }
          }
        }
      }
    } catch (e) {}

    setOrders(allOrders);
    setLoading(false);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderItem['status']) => {
    try {
      // Only attempt Supabase update if orderId is a valid UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

      if (isUUID) {
        // 1. Update Supabase database
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) {
          console.warn('Supabase status update notice:', error.message);
          return { success: false, error: error.message };
        }
      } else {
        console.warn('Skipping Supabase update — order ID is not a valid UUID:', orderId);
      }

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
        { 
          customer_id: custData?.[0]?.id, 
          total_amount: 798, 
          status: 'Delivered' as const, 
          shipping_address: { full_name: 'Ananya Sharma', phone: '9876543210', items_summary: 'Belgian Chocolate Brownie x2', city: 'Mumbai', pincode: '400001' } 
        },
        { 
          customer_id: custData?.[1]?.id, 
          total_amount: 899, 
          status: 'Confirmed' as const, 
          shipping_address: { full_name: 'Rohan Mehta', phone: '9812345678', items_summary: 'Memories Collage Frame x1', city: 'Delhi', pincode: '110001' } 
        },
        { 
          customer_id: custData?.[2]?.id, 
          total_amount: 1299, 
          status: 'Shipped' as const, 
          shipping_address: { full_name: 'Priya Patel', phone: '9765432109', items_summary: 'Premium Gift Hamper x1', city: 'Bangalore', pincode: '560001' } 
        },
        { 
          customer_id: custData?.[3]?.id, 
          total_amount: 1347, 
          status: 'Pending' as const, 
          shipping_address: { full_name: 'Vikram Singh', phone: '9988776655', items_summary: 'Walnut Brownie x3', city: 'Pune', pincode: '411001' } 
        },
      ];

      for (const order of sampleOrders) {
        await supabase.from('orders').insert([order]);
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

    // Real-time subscription to orders table changes via Supabase Realtime
    const channel = supabase
      .channel('orders_admin_realtime_v2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('⚡ Realtime order change received in Admin:', payload.eventType, payload.new);
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Orders realtime channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return { orders, loading, error, updateOrderStatus, seedSampleOrders, refetch: fetchOrders };
}
