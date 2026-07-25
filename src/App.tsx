import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/admin/Login';
import AdminDashboardPage from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import OrdersManager from './pages/admin/OrdersManager';
import CustomersManager from './pages/admin/CustomersManager';
import PromoManager from './pages/admin/PromoManager';

import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Brownies from './pages/Categories/Brownies';
import Frames from './pages/Categories/Frames';
import Gifts from './pages/Categories/Gifts';
import MemoriesCollageFrame from './pages/Products/MemoriesCollageFrame';
import PremiumGiftHamper from './pages/Products/PremiumGiftHamper';
import ProductDetail from './pages/Products/ProductDetail';
import CustomerAccount from './pages/CustomerAccount';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-background text-text font-sans antialiased">
            <Routes>
              
              {/* Customer Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/all-products" element={<AllProducts />} />
                <Route path="/categories/brownies" element={<Brownies />} />
                <Route path="/categories/frames" element={<Frames />} />
                <Route path="/categories/gifts" element={<Gifts />} />
                <Route path="/products/memories-collage-frame" element={<MemoriesCollageFrame />} />
                <Route path="/products/premium-gift-hamper" element={<PremiumGiftHamper />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/account" element={<CustomerAccount />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>

              {/* Admin Authentication Route */}
              <Route path="/admin/login" element={<Login />} />

              {/* Admin Dashboard Protected Routes */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/products" element={<ProductsManager />} />
                  <Route path="/admin/categories" element={<CategoriesManager />} />
                  <Route path="/admin/orders" element={<OrdersManager />} />
                  <Route path="/admin/promos" element={<PromoManager />} />
                  <Route path="/admin/customers" element={<CustomersManager />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
