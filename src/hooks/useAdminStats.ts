import { useState, useEffect, useCallback } from 'react';
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

  const fetchStats = useCallback(async () => {
    try {
      // Parallel fetch all 4 queries
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total_amount'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
      ]);

      const totalOrders = ordersRes.data?.length || 0;
      const totalSales = ordersRes.data?.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0) || 0;

      setStats({
        totalSales,
        totalOrders,
        activeProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time changes on all 3 tables via a single channel
    const channel = supabase
      .channel('admin_dashboard_realtime_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('⚡ Dashboard: orders changed, refreshing stats');
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log('⚡ Dashboard: products changed, refreshing stats');
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        console.log('⚡ Dashboard: customers changed, refreshing stats');
        fetchStats();
      })
      .subscribe((status) => {
        console.log('Dashboard stats realtime channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  return { ...stats, refetch: fetchStats };
}
