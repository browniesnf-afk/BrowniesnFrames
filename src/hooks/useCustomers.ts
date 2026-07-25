import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.warn('Customer fetch notice:', err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = async (customerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      // Immediately remove from local state for instant UI feedback
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      return { success: true };
    } catch (err: any) {
      console.error('Customer delete error:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Real-time subscription for live customer additions/deletions
    const channel = supabase
      .channel('customers_realtime_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('⚡ Realtime customer change:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [payload.new as Customer, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== (payload.old as any).id));
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev =>
              prev.map(c => c.id === (payload.new as Customer).id ? payload.new as Customer : c)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Customers realtime channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomers]);

  return { customers, loading, refetch: fetchCustomers, deleteCustomer };
}
