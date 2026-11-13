import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';

const lazyDefault = (loader) => lazy(loader);
const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));
const routeElement = (Component) => (
  <Suspense fallback={<div className="workspace-loading"><span className="workspace-loading-mark" />Loading BRANDSCOPE...</div>}>
    <Component />
  </Suspense>
);

const DashboardLayout = lazyDefault(() => import('../layouts/DashboardLayout'));
const AdminLayout = lazyDefault(() => import('../layouts/AdminLayout'));

const HomePage = lazyDefault(() => import('../pages/public/HomePage'));
const DiscoverPage = lazyDefault(() => import('../pages/public/DiscoverPage'));
const CategoriesPage = lazyDefault(() => import('../pages/public/CategoriesPage'));
const CategoryDetailPage = lazyDefault(() => import('../pages/public/CategoryDetailPage'));
const BrandProfilePage = lazyDefault(() => import('../pages/public/BrandProfilePage'));
const FeedPage = lazyDefault(() => import('../pages/public/FeedPage'));
const PostDetailPage = lazyDefault(() => import('../pages/public/PostDetailPage'));
const ProductDetailPage = lazyDefault(() => import('../pages/public/ProductDetailPage'));
const FaqPage = lazyDefault(() => import('../pages/public/FaqPage'));
const NotFoundPage = lazyDefault(() => import('../pages/public/NotFoundPage'));

const loadStaticPages = () => import('../pages/public/StaticPages');
const AboutPage = lazyNamed(loadStaticPages, 'AboutPage');
const ContactPage = lazyNamed(loadStaticPages, 'ContactPage');
const PrivacyPage = lazyNamed(loadStaticPages, 'PrivacyPage');
const TermsPage = lazyNamed(loadStaticPages, 'TermsPage');
const GuidelinesPage = lazyNamed(loadStaticPages, 'GuidelinesPage');

const LoginPage = lazyDefault(() => import('../pages/auth/LoginPage'));
const SignupPage = lazyDefault(() => import('../pages/auth/SignupPage'));
const loadPasswordPages = () => import('../pages/auth/ForgotPasswordPage');
const ForgotPasswordPage = lazyNamed(loadPasswordPages, 'ForgotPasswordPage');
const VerifyEmailPage = lazyNamed(loadPasswordPages, 'VerifyEmailPage');
const SetPasswordPage = lazyNamed(loadPasswordPages, 'SetPasswordPage');
const AuthConfirmPage = lazyNamed(loadPasswordPages, 'AuthConfirmPage');

const DashboardOverview = lazyDefault(() => import('../pages/dashboard/DashboardOverview'));
const BrandProfileEditor = lazyDefault(() => import('../pages/dashboard/BrandProfileEditor'));
const ManagePosts = lazyDefault(() => import('../pages/dashboard/ManagePosts'));
const ManageProducts = lazyDefault(() => import('../pages/dashboard/ManageProducts'));
const VerificationPortal = lazyDefault(() => import('../pages/dashboard/VerificationPortal'));
const FollowersPage = lazyDefault(() => import('../pages/dashboard/FollowersPage'));
const NotificationsPage = lazyDefault(() => import('../pages/dashboard/NotificationsPage'));
const AnalyticsPage = lazyDefault(() => import('../pages/dashboard/AnalyticsPage'));
const AccountSettings = lazyDefault(() => import('../pages/dashboard/AccountSettings'));

const loadAdminPages = () => import('../pages/admin/AdminPages');
const AdminOverview = lazyNamed(loadAdminPages, 'AdminOverview');
const AdminBrands = lazyNamed(loadAdminPages, 'AdminBrands');
const AdminPosts = lazyNamed(loadAdminPages, 'AdminPosts');
const AdminReports = lazyNamed(loadAdminPages, 'AdminReports');
const AdminInquiries = lazyNamed(loadAdminPages, 'AdminInquiries');
const AdminCategories = lazyNamed(loadAdminPages, 'AdminCategories');
const AdminUsers = lazyNamed(loadAdminPages, 'AdminUsers');
const AdminAuditLogs = lazyNamed(loadAdminPages, 'AdminAuditLogs');
const AdminSettings = lazyNamed(loadAdminPages, 'AdminSettings');

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: routeElement(HomePage) },
      { path: 'discover', element: routeElement(DiscoverPage) },
      { path: 'categories', element: routeElement(CategoriesPage) },
      { path: 'categories/:slug', element: routeElement(CategoryDetailPage) },
      { path: 'brand/:slug', element: routeElement(BrandProfilePage) },
      { path: 'feed', element: routeElement(FeedPage) },
      { path: 'post/:postId', element: routeElement(PostDetailPage) },
      { path: 'product/:productId', element: routeElement(ProductDetailPage) },
      { path: 'search', element: routeElement(DiscoverPage) },
      { path: 'about', element: routeElement(AboutPage) },
      { path: 'faq', element: routeElement(FaqPage) },
      { path: 'contact', element: routeElement(ContactPage) },
      { path: 'privacy', element: routeElement(PrivacyPage) },
      { path: 'terms', element: routeElement(TermsPage) },
      { path: 'guidelines', element: routeElement(GuidelinesPage) },
      { path: 'login', element: routeElement(LoginPage) },
      { path: 'signup', element: routeElement(SignupPage) },
      { path: 'forgot-password', element: routeElement(ForgotPasswordPage) },
      { path: 'verify-email', element: routeElement(VerifyEmailPage) },
      { path: 'set-password', element: routeElement(SetPasswordPage) },
      { path: 'auth/confirm', element: routeElement(AuthConfirmPage) },
    ]
  },
  {
    path: '/dashboard',
    element: routeElement(DashboardLayout),
    children: [
      { index: true, element: routeElement(DashboardOverview) },
      { path: 'profile', element: routeElement(BrandProfileEditor) },
      { path: 'products', element: routeElement(ManageProducts) },
      { path: 'posts', element: routeElement(ManagePosts) },
      { path: 'followers', element: routeElement(FollowersPage) },
      { path: 'notifications', element: routeElement(NotificationsPage) },
      { path: 'analytics', element: routeElement(AnalyticsPage) },
      { path: 'verification', element: routeElement(VerificationPortal) },
      { path: 'settings', element: routeElement(AccountSettings) },
    ]
  },
  {
    path: '/admin',
    element: routeElement(AdminLayout),
    children: [
      { index: true, element: routeElement(AdminOverview) },
      { path: 'brands', element: routeElement(AdminBrands) },
      { path: 'posts', element: routeElement(AdminPosts) },
      { path: 'reports', element: routeElement(AdminReports) },
      { path: 'inquiries', element: routeElement(AdminInquiries) },
      { path: 'categories', element: routeElement(AdminCategories) },
      { path: 'users', element: routeElement(AdminUsers) },
      { path: 'audit-logs', element: routeElement(AdminAuditLogs) },
      { path: 'settings', element: routeElement(AdminSettings) },
    ]
  },
  { path: '*', element: routeElement(NotFoundPage) }
]);

export default router;
