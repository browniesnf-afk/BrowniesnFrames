import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

const Login = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Attempt Sign In with Supabase
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        // 2. If user doesn't exist yet in Supabase Auth, attempt Sign Up
        if (signInErr.message.toLowerCase().includes('invalid login credentials')) {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpErr) throw signUpErr;

          if (signUpData.user) {
            await supabase.from('admins').upsert([{ id: signUpData.user.id, email, role: 'Super Admin' }]);
            
            if (signUpData.session) {
              navigate('/admin/dashboard');
              return;
            } else {
              setSuccessMsg('Created admin user in Supabase! If email confirmation is disabled, you can sign in now or click Quick Demo Login below.');
              return;
            }
          }
        }
        throw signInErr;
      }

      if (data.user) {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login with Supabase. Click "Quick Demo Login" above to enter instantly.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    demoLogin();
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo showSubtitle={false} size="lg" to="/admin/login" />
        <p className="mt-1.5 text-center text-xs font-medium text-[#8C4A27] uppercase tracking-widest">
          Admin Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200/60">
          
          {/* Quick Demo Login Banner */}
          <div className="mb-6 p-4 bg-[#F5EAE1] rounded-xl border border-[#8C4A27]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8C4A27]" /> Instant Demo Access
              </span>
              <span className="text-[10px] bg-[#8C4A27] text-white px-2 py-0.5 rounded font-semibold">Ready</span>
            </div>
            <p className="text-[11px] text-[#6E5F55] mb-3">
              Click below to enter the Admin Dashboard &amp; Product Manager instantly in 1 click:
            </p>
            <button
              onClick={handleQuickDemo}
              className="w-full bg-[#8C4A27] hover:bg-[#733c21] text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              Quick Demo Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or Supabase Auth</span></div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs">
                {successMsg}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#8C4A27]"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#8C4A27]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-medium text-white bg-gray-900 hover:bg-black transition-colors disabled:opacity-70 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in / Register Admin with Supabase'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
