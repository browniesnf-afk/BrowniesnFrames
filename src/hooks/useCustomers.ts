import { useState, useEffect } from 'react';
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

  const fetchCustomers = async () => {
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
  };

  useEffect(() => {
    fetchCustomers();

    // Subscribe to customers table realtime events
    const channel = supabase
      .channel('customers_admin_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('⚡ Realtime customer update:', payload);
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => {
              if (prev.some(c => c.id === payload.new.id)) return prev;
              return [payload.new as Customer, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => prev.map(c => c.id === payload.new.id ? (payload.new as Customer) : c));
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { customers, loading, refetch: fetchCustomers };
}
