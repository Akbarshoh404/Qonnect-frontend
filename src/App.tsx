import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateQRPage } from './pages/CreateQRPage';
import { QREditPage } from './pages/QREditPage';
import { QRAnalyticsPage } from './pages/QRAnalyticsPage';
import { DomainsPage } from './pages/DomainsPage';
import { DriveSettingsPage } from './pages/DriveSettingsPage';
import { AdminPage } from './pages/AdminPage';
import { PageLoader } from './components/ui/Spinner';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/create" element={
        <ProtectedRoute><CreateQRPage /></ProtectedRoute>
      } />
      <Route path="/qr/:id/edit" element={
        <ProtectedRoute><QREditPage /></ProtectedRoute>
      } />
      <Route path="/qr/:id/analytics" element={
        <ProtectedRoute><QRAnalyticsPage /></ProtectedRoute>
      } />
      <Route path="/settings/domains" element={
        <ProtectedRoute><DomainsPage /></ProtectedRoute>
      } />
      <Route path="/settings/google-drive" element={
        <ProtectedRoute><DriveSettingsPage /></ProtectedRoute>
      } />

      {/* Admin dashboard — protected by API secret, not session */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
