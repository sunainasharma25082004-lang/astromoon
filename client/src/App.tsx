import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { AuthProvider } from './context/Auth';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

/* ── Public pages ── */
import { HomePage } from './pages/public/HomePage';
import AstrologersPage from './pages/public/Astrologers';
import HoroscopePage from './pages/public/Horoscope';
import KundliPage from './pages/public/Kundli';
import ShopPage from './pages/public/Shop';
import ProductPage from './pages/public/ProductPage';
import AstrologerProfilePage from './pages/public/AstrologerProfilePage';
import BecomeAstrologerPage from './pages/public/BecomeAstrologerPage';
import { TermsPage, PrivacyPage } from './pages/public/LegalPage';
import NotFoundPage from './pages/public/NotFoundPage';
import RoleSelectionPage from './pages/auth/RoleSelection';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import UserProfilePage from './pages/user/ProfilePage';

/* ── USER PANEL ── */
import UserPanelLayout from './panels/user/Layout';
import UserDashboard from './panels/user/Dashboard';
import UserOrders from './panels/user/Orders';
import UserKundlis from './panels/user/Kundlis';
import UserSaved from './panels/user/Saved';
import UserNotifications from './panels/user/Notifications';
import UserSettings from './panels/user/Settings';
import UserBecomeAstrologer from './panels/user/BecomeAstrologer';

/* ── ASTROLOGER PANEL ── */
import AstroPanelLayout from './panels/astrologer/Layout';
import AstroDashboard from './panels/astrologer/Dashboard';
import AstroAvailability from './panels/astrologer/Availability';
import AstroProfile from './panels/astrologer/Profile';
import AstroReviews from './panels/astrologer/Reviews';

/* ── ADMIN PANEL ── */
import AdminPanelLayout from './panels/admin/Layout';
import AdminDashboard from './panels/admin/Dashboard';
import AdminProducts from './panels/admin/Products';
import AdminOrders from './panels/admin/Orders';
import AdminApplications from './panels/admin/Applications';
import AdminSettings from './panels/admin/Settings';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1a1333', color: '#fff', borderRadius: '12px' } }} />
            <Routes>
              <Route path="/get-started" element={<RoleSelectionPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/astrologers" element={<AstrologersPage />} />
                <Route path="/astrologer/:id" element={<AstrologerProfilePage />} />
                <Route path="/horoscope" element={<HoroscopePage />} />
                <Route path="/horoscope/:sign" element={<HoroscopePage />} />
                <Route path="/kundli" element={<KundliPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/product/:id" element={<ProductPage />} />
                <Route path="/become-astrologer" element={<BecomeAstrologerPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfilePage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* USER PANEL */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserPanelLayout /></ProtectedRoute>}>
                <Route index element={<UserDashboard />} />
                <Route path="orders" element={<UserOrders />} />
                <Route path="kundlis" element={<UserKundlis />} />
                <Route path="saved" element={<UserSaved />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="become-astrologer" element={<UserBecomeAstrologer />} />
              </Route>

              {/* ASTROLOGER PANEL */}
              <Route path="/astro" element={<ProtectedRoute allowedRoles={['astrologer']}><AstroPanelLayout /></ProtectedRoute>}>
                <Route index element={<AstroDashboard />} />
                <Route path="availability" element={<AstroAvailability />} />
                <Route path="profile" element={<AstroProfile />} />
                <Route path="reviews" element={<AstroReviews />} />
              </Route>

              {/* ADMIN PANEL */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanelLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

            </Routes>
          </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}