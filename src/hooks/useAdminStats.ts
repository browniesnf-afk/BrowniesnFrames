import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  totalCustomers: number;
  loading: boolean;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalCustomers: 0,
    loading: true
  });

  const fetchStats = async () => {
    try {
      // 1. Fetch Orders Count & Sum
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount');

      const totalOrders = ordersData?.length || 0;
      const totalSales = ordersData?.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0) || 0;

      // 2. Fetch Products Count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch Customers Count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalSales,
        totalOrders,
        activeProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time changes on orders, products, and customers
    const channel = supabase
      .channel('admin_dashboard_stats_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...stats, refetch: fetchStats };
}
