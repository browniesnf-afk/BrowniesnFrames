import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, ChevronLeft, User } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { Logo } from './ui/Logo';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-gray-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">
            
            {/* Left - Menu or Back Arrow */}
            <div className="flex items-center">
              {!isHomePage ? (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => navigate(-1)} 
                    className="p-1.5 -ml-1 text-[#2C1A14] hover:text-[#8C4A27] transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Go back"
                  >
                    <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
                  </button>
                  <button 
                    onClick={() => setIsMenuOpen(true)} 
                    className="p-1.5 text-[#2C1A14] hover:text-[#8C4A27] transition-colors cursor-pointer"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-1.5 -ml-1 text-[#2C1A14] hover:text-[#8C4A27] transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>

            {/* Center - Reusable Logo (BrowniesnFrames) */}
            <div className="flex flex-col items-center justify-center flex-1 px-1">
              <Logo size="md" />
            </div>

            {/* Right - Icons */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-[#2C1A14] hover:text-[#8C4A27] transition-colors cursor-pointer"
                title="Search Products"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <button 
                onClick={() => navigate('/account')}
                className="p-1.5 text-[#2C1A14] hover:text-[#8C4A27] transition-colors flex flex-col items-center cursor-pointer"
                title="Customer Account"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="p-1.5 text-[#2C1A14] hover:text-[#8C4A27] transition-colors relative cursor-pointer flex items-center justify-center"
                title="Shopping Cart"
                aria-label={`Shopping Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 -translate-y-1/2 translate-x-1/2 bg-[#F06292] text-white text-[8px] sm:text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-[#FAF6F0] shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </nav>

      {/* Search Overlay Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Navbar;
