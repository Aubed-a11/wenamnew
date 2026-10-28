import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute, AdminPublicRoute } from './routes/guards'
import InstallPrompt from './components/common/InstallPrompt'
import RouteBranding from './components/miawezon/RouteBranding'

import HomePage from './pages/public/HomePage'
import MenuPage from './pages/public/MenuPage'
import CartPage from './pages/public/CartPage'
import CheckoutPage from './pages/public/CheckoutPage'
import OrderTrackingPage from './pages/public/OrderTrackingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ProfilePage from './pages/public/ProfilePage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import MiawezonPage from './pages/public/miawezon/MiawezonPage'
import BuffetMenuPage from './pages/public/miawezon/BuffetMenuPage'
import BookingPage from './pages/public/miawezon/BookingPage'
import TicketsPage from './pages/public/miawezon/TicketsPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import OrdersPage from './pages/admin/OrdersPage'
import MenuManagePage from './pages/admin/MenuManagePage'
import ReviewsPage from './pages/admin/ReviewsPage'
import UsersPage from './pages/admin/UsersPage'
import GalleryPage from './pages/admin/GalleryPage'
import SettingsPage from './pages/admin/SettingsPage'
import MiawezonAdminPage from './pages/admin/miawezon/MiawezonAdminPage'
import CheckinPage from './pages/admin/miawezon/CheckinPage'
import AdminLayout from './components/admin/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <RouteBranding />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Lato, sans-serif', fontSize: '14px', borderRadius: '10px' },
          success: { iconTheme: { primary: '#C4531A', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ── Site public ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── MIAWÉZON ── */}
        <Route path="/miawezon" element={<MiawezonPage />} />
        <Route path="/miawezon/menu" element={<BuffetMenuPage />} />
        <Route path="/miawezon/reserver" element={<BookingPage />} />
        <Route path="/miawezon/billets/:id" element={<TicketsPage />} />

        {/* ── Admin : login séparé ── */}
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />

        {/* ── Admin : toutes les pages sous AdminLayout ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuManagePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="miawezon" element={<MiawezonAdminPage />} />
          <Route path="miawezon/controle" element={<CheckinPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  )
}


