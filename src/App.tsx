import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Storefront Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { MobileBottomBar } from './components/layout/MobileBottomBar';

// Storefront Pages
import { HomePage } from './pages/store/HomePage';
import { ShopPage } from './pages/store/ShopPage';
import { CategoriesPage } from './pages/store/CategoriesPage';
import { CategoryDetailPage } from './pages/store/CategoryDetailPage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { SearchResultsPage } from './pages/store/SearchResultsPage';
import { CartPage } from './pages/store/CartPage';
import { WishlistPage } from './pages/store/WishlistPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { AboutPage } from './pages/store/AboutPage';
import { ContactPage } from './pages/store/ContactPage';
import { PrivacyPolicyPage } from './pages/store/PrivacyPolicyPage';
import { TermsPage } from './pages/store/TermsPage';
import { NotFoundPage } from './pages/store/NotFoundPage';

// Admin Components & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Public Storefront Layout Wrapper
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] dark:bg-charcoal-950 text-charcoal-900 dark:text-charcoal-100 transition-colors duration-200">
      <Navbar />
      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>
      <Footer />
      <CartDrawer />
      <MobileBottomBar />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <HashRouter>
              <Routes>
                {/* Customer Storefront Routes */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:slug" element={<CategoryDetailPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Portal Authentication */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Secure Admin Dashboard Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<AdminProductFormPage />} />
                  <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Routes>
            </HashRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
