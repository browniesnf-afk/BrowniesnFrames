import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/PageTransition';

import { Tag } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Promo Codes', href: '/admin/promos', icon: Tag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, adminRole, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-[#2C1A14]">Brownies<span className="italic font-normal text-[#8C4A27] px-0.5">n</span>Frames</span>
              <span className="text-[10px] uppercase bg-[#8C4A27]/10 text-[#8C4A27] font-semibold px-2 py-0.5 rounded">Admin</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#8C4A27] text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#8C4A27] text-white flex items-center justify-center font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.email || 'admin@store.com'}</p>
              <p className="text-[10px] text-gray-500 font-medium">{adminRole || 'Super Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search Input */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products, orders..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/" 
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#8C4A27] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Store
            </Link>

            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-[#8C4A27] rounded-full absolute top-1.5 right-1.5" />
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

      </div>
    </div>
  );
}
