import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

type AdminRole = 'Super Admin' | 'Manager' | 'Staff' | 'Viewer' | null;

interface AuthContextType {
  user: User | null;
  adminRole: AdminRole;
  loading: boolean;
  loginWithCredentials: (emailInput: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
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
      } else {
        const storedAdmin = localStorage.getItem('browniesnframes_admin_user');
        if (storedAdmin) {
          try {
            const parsed = JSON.parse(storedAdmin);
            setUser({
              id: parsed.id || 'admin-roshini-id',
              email: parsed.email || 'roshiniadmin786@gmail.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString()
            } as any);
            setAdminRole('Super Admin');
          } catch (e) {}
        }
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchAdminRole(session.user.id);
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
        setAdminRole('Super Admin');
      }
    } catch (err) {
      setAdminRole('Super Admin');
    }
  };

  const loginWithCredentials = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();

    // 1. Try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: passwordInput,
      });

      if (!error && data.user) {
        setUser(data.user);
        setAdminRole('Super Admin');
        localStorage.setItem('browniesnframes_admin_user', JSON.stringify({
          id: data.user.id,
          email: cleanEmail,
          role: 'Super Admin'
        }));
        return { success: true };
      }
    } catch (e) {}

    // 2. Check explicitly configured credentials roshiniadmin786@gmail.com / Roshini786@
    if (cleanEmail === 'roshiniadmin786@gmail.com' && passwordInput === 'Roshini786@') {
      const adminUser: any = {
        id: 'admin-roshini-id',
        email: 'roshiniadmin786@gmail.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      setUser(adminUser);
      setAdminRole('Super Admin');
      localStorage.setItem('browniesnframes_admin_user', JSON.stringify({
        id: adminUser.id,
        email: adminUser.email,
        role: 'Super Admin'
      }));

      // Try inserting into admins table asynchronously
      try {
        await supabase.from('admins').upsert([{ email: 'roshiniadmin786@gmail.com', role: 'Super Admin' }]);
      } catch (err) {}

      return { success: true };
    }

    return { success: false, error: 'Invalid admin email address or password. Please verify your credentials.' };
  };

  const signOut = async () => {
    localStorage.removeItem('browniesnframes_admin_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setAdminRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminRole, loading, signOut, loginWithCredentials }}>
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
