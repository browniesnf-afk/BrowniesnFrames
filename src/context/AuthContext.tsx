import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

type AdminRole = 'Super Admin' | 'Manager' | 'Staff' | 'Viewer' | null;

interface AuthContextType {
  user: User | null;
  adminRole: AdminRole;
  loading: boolean;
  signOut: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchAdminRole(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchAdminRole(session.user.id);
      } else {
        setUser(null);
        setAdminRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (data && !error) {
        setAdminRole(data.role as AdminRole);
      } else {
        setAdminRole('Super Admin'); // Default fallback for admin users
      }
    } catch (err) {
      console.error('Error fetching admin role', err);
      setAdminRole('Super Admin');
    }
  };

  const demoLogin = () => {
    setUser({
      id: 'demo-admin-id',
      email: 'admin@browniesandframes.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as any);
    setAdminRole('Super Admin');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdminRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminRole, loading, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
