import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

const Login = () => {
  const [email, setEmail] = useState('roshiniadmin786@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginWithCredentials(email, password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials. Please verify your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo showSubtitle={false} size="lg" to="/admin/login" />
        <p className="mt-1.5 text-center text-xs font-bold text-[#8C4A27] uppercase tracking-widest">
          Admin Portal Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md sm:rounded-3xl sm:px-10 border border-gray-200/80">
          
          <div className="mb-6 text-center">
            <h2 className="font-serif font-bold text-xl text-[#2C1A14]">Admin Sign In</h2>
            <p className="text-xs text-gray-500 mt-1">Please enter your Super Admin credentials to access the management portal.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs leading-relaxed font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#8C4A27] focus:ring-1 focus:ring-[#8C4A27]"
                  placeholder="roshiniadmin786@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#8C4A27] focus:ring-1 focus:ring-[#8C4A27]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8C4A27] hover:bg-[#733c21] text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In to Admin Dashboard
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
