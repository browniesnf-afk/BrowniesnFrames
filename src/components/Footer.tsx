import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

const Footer = () => {
  return (
    <footer className="hidden md:block bg-[#2D0D15] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Logo variant="light" showSubtitle={false} size="md" className="items-start text-left mb-4" />
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Handcrafted brownies, personalized frames, and thoughtful gifts made just for you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4 text-[#F8D8CF]">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/categories/brownies" className="hover:text-[#F8D8CF] transition-colors">Brownies</Link></li>
              <li><Link to="/categories/frames" className="hover:text-[#F8D8CF] transition-colors">Frames</Link></li>
              <li><Link to="/categories/gifts" className="hover:text-[#F8D8CF] transition-colors">Gift Hampers</Link></li>
              <li><Link to="/offers" className="hover:text-[#F8D8CF] transition-colors">Offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4 text-[#F8D8CF]">Company</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-[#F8D8CF] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#F8D8CF] transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-[#F8D8CF] transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="hover:text-[#F8D8CF] transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4 text-[#F8D8CF]">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/terms" className="hover:text-[#F8D8CF] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#F8D8CF] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-[#F8D8CF] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund" className="hover:text-[#F8D8CF] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} <span className="font-serif text-[#F8D8CF]">Brownies<span className="italic">n</span>Frames</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
