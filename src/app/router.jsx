import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import DiscoverPage from '../pages/public/DiscoverPage';
import CategoriesPage from '../pages/public/CategoriesPage';
import CategoryDetailPage from '../pages/public/CategoryDetailPage';
import BrandProfilePage from '../pages/public/BrandProfilePage';
import FeedPage from '../pages/public/FeedPage';
import PostDetailPage from '../pages/public/PostDetailPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, GuidelinesPage } from '../pages/public/StaticPages';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import { ForgotPasswordPage, VerifyEmailPage, SetPasswordPage, AuthConfirmPage } from '../pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import BrandProfileEditor from '../pages/dashboard/BrandProfileEditor';
import ManagePosts from '../pages/dashboard/ManagePosts';
import ManageProducts from '../pages/dashboard/ManageProducts';
import VerificationPortal from '../pages/dashboard/VerificationPortal';
import FollowersPage from '../pages/dashboard/FollowersPage';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import AccountSettings from '../pages/dashboard/AccountSettings';

// Admin Pages
import {
  AdminOverview,
  AdminBrands,
  AdminPosts,
  AdminReports,
  AdminCategories,
  AdminUsers,
  AdminAuditLogs,
  AdminSettings
} from '../pages/admin/AdminPages';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/:slug', element: <CategoryDetailPage /> },
      { path: 'brand/:slug', element: <BrandProfilePage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'post/:postId', element: <PostDetailPage /> },
      { path: 'product/:productId', element: <ProductDetailPage /> },
      { path: 'search', element: <DiscoverPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'guidelines', element: <GuidelinesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'set-password', element: <SetPasswordPage /> },
      { path: 'auth/confirm', element: <AuthConfirmPage /> },
    ]
  },

  // Authenticated Brand Dashboard Routes
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'profile', element: <BrandProfileEditor /> },
      { path: 'products', element: <ManageProducts /> },
      { path: 'posts', element: <ManagePosts /> },
      { path: 'followers', element: <FollowersPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'verification', element: <VerificationPortal /> },
      { path: 'settings', element: <AccountSettings /> },
    ]
  },

  // Protected Admin Console Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'brands', element: <AdminBrands /> },
      { path: 'posts', element: <AdminPosts /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'audit-logs', element: <AdminAuditLogs /> },
      { path: 'settings', element: <AdminSettings /> },
    ]
  },

  // Fallback 404
  {
    path: '*',
    element: (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'var(--font-body)' }}>
        <h2>404 — Page Not Found</h2>
        <p style={{ marginTop: '8px', marginBottom: '24px' }}>The requested route does not exist on BRANDSCOPE.</p>
        <a href="/" style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Return to Homepage</a>
      </div>
    )
  }
]);

export default router;
