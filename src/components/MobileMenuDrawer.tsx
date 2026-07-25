import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, 
  Home as HomeIcon, 
  ShoppingCart, 
  Info, 
  Mail, 
  LogIn 
} from 'lucide-react';
import { Logo } from './ui/Logo';
import { useCategories } from '../hooks/useCategories';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const { activeCategories } = useCategories();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Overlay Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer Panel - Elegant Warm White/Cream Theme (#FAF6F0) */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
            className="relative w-[85%] max-w-sm bg-[#FAF6F0] text-[#2C1A14] h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
          >
            
            {/* Dark Wine Top Header Bar with Logo & Close Button */}
            <div className="bg-[#2D0D15] p-6 sm:p-7 flex items-center justify-between border-b border-white/10 shrink-0">
              <Logo variant="wine" size="sm" className="items-start text-left" />
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warm Cream Body Content */}
            <div className="p-6 sm:p-7 space-y-7 flex-1">
              
              {/* MAIN NAVIGATION */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-widest text-[#8C4A27] mb-4 px-1">
                  MENU
                </span>
                <div className="space-y-4">
                  <Link 
                    to="/" 
                    onClick={onClose}
                    className="flex items-center gap-4 text-base font-semibold text-[#2C1A14] hover:text-[#8C4A27] transition-colors group"
                  >
                    <HomeIcon className="w-5 h-5 text-[#8C4A27] group-hover:scale-110 transition-transform" />
                    <span>Home</span>
                  </Link>
                  
                  <Link 
                    to="/products" 
                    onClick={onClose}
                    className="flex items-center gap-4 text-base font-semibold text-[#2C1A14] hover:text-[#8C4A27] transition-colors group"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#8C4A27] group-hover:scale-110 transition-transform" />
                    <span>All Products</span>
                  </Link>

                  <Link 
                    to="/#our-story" 
                    onClick={onClose}
                    className="flex items-center gap-4 text-base font-semibold text-[#2C1A14] hover:text-[#8C4A27] transition-colors group"
                  >
                    <Info className="w-5 h-5 text-[#8C4A27] group-hover:scale-110 transition-transform" />
                    <span>Our Story</span>
                  </Link>

                  <Link 
                    to="/#contact" 
                    onClick={onClose}
                    className="flex items-center gap-4 text-base font-semibold text-[#2C1A14] hover:text-[#8C4A27] transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-[#8C4A27] group-hover:scale-110 transition-transform" />
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>

              <div className="h-[1px] bg-[#8C4A27]/15 w-full" />

              {/* LIVE CATEGORIES SECTION - Clean White Pill Cards */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-widest text-[#8C4A27] mb-4 px-1">
                  CATEGORIES
                </span>
                <div className="space-y-3">
                  {activeCategories.map((cat) => (
                    <Link 
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      onClick={onClose}
                      className="block w-full p-4 rounded-2xl bg-white hover:bg-[#F5EAE1] text-[#2C1A14] font-semibold text-base transition-colors border border-[#8C4A27]/15 shadow-2xs"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#8C4A27]/15 w-full" />

              {/* CUSTOMER PORTAL SECTION */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-widest text-[#8C4A27] mb-4 px-1">
                  ACCOUNT
                </span>
                <Link 
                  to="/account" 
                  onClick={onClose}
                  className="flex items-center gap-4 text-base font-semibold text-[#2C1A14] hover:text-[#8C4A27] transition-colors group"
                >
                  <LogIn className="w-5 h-5 text-[#8C4A27] group-hover:scale-110 transition-transform" />
                  <span>Sign In / Register</span>
                </Link>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
