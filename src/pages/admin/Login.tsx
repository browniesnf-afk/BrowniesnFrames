import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('roshinibrownies@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please provide both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        // Register Mode: Call supabase.auth.signUp
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });

        if (signUpErr) {
          throw signUpErr;
        }

        if (signUpData.user) {
          // Attempt linking user in admins table
          try {
            await supabase.from('admins').insert([{ id: signUpData.user.id, email: cleanEmail, role: 'Super Admin' }]);
          } catch (e) {}

          if (signUpData.session) {
            setSuccessMsg(`🎉 Admin account created successfully! Logging you in...`);
            setTimeout(() => navigate('/admin/dashboard'), 1200);
          } else {
            setSuccessMsg(`🎉 Account registered for ${cleanEmail}! If email confirmation is enabled in your Supabase project, check your inbox to confirm. Otherwise, switch to Sign In tab to log in.`);
            setIsRegisterMode(false);
          }
        }
      } else {
        // Sign In Mode: Call supabase.auth.signInWithPassword
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (signInErr) {
          if (signInErr.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error(`Account not found or password incorrect. If you haven't registered ${cleanEmail} yet, click "Register Admin" tab above.`);
          }
          throw signInErr;
        }

        if (data.user) {
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials or Supabase Auth settings.');
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

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegisterMode ? 'bg-white text-[#8C4A27] shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegisterMode ? 'bg-white text-[#8C4A27] shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Admin
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs leading-relaxed">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs leading-relaxed">
                {successMsg}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Admin Email Address
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
                  placeholder="roshinibrownies@gmail.com"
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
                  placeholder="Enter your password (min 6 chars)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2C1A14] hover:bg-black text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isRegisterMode ? (
                <>Register New Admin Account</>
              ) : (
                <>Sign In with Supabase</>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
