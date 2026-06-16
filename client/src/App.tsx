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
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import AstrologerProfilePage from './pages/public/AstrologerProfilePage';
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
import UserWallet from './panels/user/Wallet';

/* ── ADMIN PANEL ── */
import AdminPanelLayout from './panels/admin/Layout';
import AdminDashboard from './panels/admin/Dashboard';
import AdminUsers from './panels/admin/Users';
import AdminAstrologers from './panels/admin/Astrologers';
import AdminProducts from './panels/admin/Products';
import AdminOrders from './panels/admin/Orders';
import AdminTransactions from './panels/admin/Transactions';
import AdminReports from './panels/admin/Reports';
import AdminModeration from './panels/admin/Moderation';
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
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfilePage /></ProtectedRoute>} />
              </Route>

              {/* USER PANEL */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserPanelLayout /></ProtectedRoute>}>
                <Route index element={<UserDashboard />} />
                <Route path="orders" element={<UserOrders />} />
                <Route path="kundlis" element={<UserKundlis />} />
                <Route path="saved" element={<UserSaved />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="settings" element={<UserSettings />} />
              </Route>
              <Route path="/wallet" element={<ProtectedRoute allowedRoles={['user']}><UserPanelLayout /></ProtectedRoute>}>
                <Route index element={<UserWallet />} />
              </Route>

              {/* ADMIN PANEL */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanelLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="astrologers" element={<AdminAstrologers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="moderation" element={<AdminModeration />} />
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