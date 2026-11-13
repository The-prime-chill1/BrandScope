export function preloadBrandWorkspace() {
  return Promise.all([
    import('../layouts/DashboardLayout'),
    import('../pages/dashboard/DashboardOverview')
  ]);
}

export function preloadAdminWorkspace() {
  return Promise.all([
    import('../layouts/AdminLayout'),
    import('../pages/admin/AdminPages')
  ]);
}

