import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuthSession } from '../hooks/use-auth';
import { PublicShell } from '../components/layout/PublicShell';
import { AdminShell } from '../components/layout/AdminShell';
import { RequireAdmin, RequireAuth } from '../components/layout/RouteGuards';
import { ScrollToTop } from '../components/layout/ScrollToTop';
import { LoadingDots } from '../components/layout/LoadingDots';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { RoomDetailPage } from '../pages/RoomDetailPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { LoginPage } from '../pages/LoginPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const AdminDashboardPage = React.lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const ApprovalQueuePage = React.lazy(() =>
  import('../pages/admin/ApprovalQueuePage').then((module) => ({
    default: module.ApprovalQueuePage,
  })),
);
const MasterSchedulePage = React.lazy(() =>
  import('../pages/admin/MasterSchedulePage').then((module) => ({
    default: module.MasterSchedulePage,
  })),
);
const RoomManagementPage = React.lazy(() =>
  import('../pages/admin/RoomManagementPage').then((module) => ({
    default: module.RoomManagementPage,
  })),
);

const LazyAdminFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <LoadingDots label="Memuat portal pengelola" />
  </div>
);

const lazyAdminPage = (page: React.ReactNode) => (
  <Suspense fallback={<LazyAdminFallback />}>{page}</Suspense>
);

/**
 * Keeps the persisted token in sync with the current user profile.
 * Rendered once, above the router content, so guards can rely on auth state.
 */
const AuthSessionBridge: React.FC = () => {
  useAuthSession();
  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthSessionBridge />

      <Routes>
        {/* Public area */}
        <Route element={<PublicShell />}>
          <Route index element={<HomePage />} />
          <Route path="katalog" element={<CatalogPage />} />
          <Route path="ruangan/:roomId" element={<RoomDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Authenticated borrower area */}
        <Route element={<RequireAuth />}>
          <Route element={<PublicShell />}>
            <Route path="pengajuan-saya" element={<MyBookingsPage />} />
          </Route>
        </Route>

        {/* Administrator area */}
        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminShell />}>
            <Route index element={lazyAdminPage(<AdminDashboardPage />)} />
            <Route path="antrean" element={lazyAdminPage(<ApprovalQueuePage />)} />
            <Route path="jadwal" element={lazyAdminPage(<MasterSchedulePage />)} />
            <Route path="ruangan" element={lazyAdminPage(<RoomManagementPage />)} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
