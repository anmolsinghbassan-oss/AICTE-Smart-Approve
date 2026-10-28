import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertsProvider } from './context/AlertsContext';
import { Layout } from './components/Layout';

// Public pages
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Help } from './pages/Help';
import { AuthPortal } from './pages/AuthPortal';
import { AdminLogin } from './pages/AdminLogin';
import { InstitutionLogin } from './pages/InstitutionLogin';
import { InstitutionSignup } from './pages/InstitutionSignup';

// 12 Feature modules & Dedicated Institute Dashboard
import { InstituteDashboardPage } from './pages/InstituteDashboardPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApprovalProcessPage } from './pages/ApprovalProcessPage';
import { ComplianceCheckingPage } from './pages/ComplianceCheckingPage';
import { AlertsPage } from './pages/AlertsPage';
import { DataSilosPage } from './pages/DataSilosPage';
import { ComplianceVisibilityPage } from './pages/ComplianceVisibilityPage';
import { EarlyWarningPage } from './pages/EarlyWarningPage';
import { DocumentVerificationPage } from './pages/DocumentVerificationPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { OfficerAccountabilityPage } from './pages/OfficerAccountabilityPage';
import { PolicySimulatorPage } from './pages/PolicySimulatorPage';
import { PublicVerificationPortalPage } from './pages/PublicVerificationPortalPage';

// Route Guard: Ensures user is logged in
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Route Guard for Admin-only modules & Admin Dashboard (enforces RBAC)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'Institution User') {
    return <Navigate to="/institute/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route Guard for Root '/' and Fallback '*'
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'Institution User') {
    return <Navigate to="/institute/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertsProvider>
          <BrowserRouter>
            <Routes>
              {/* Dual-Role Login Portal (Option A: Admin, Option B: Institute) */}
              <Route path="/login" element={<AuthPortal />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/institute/login" element={<InstitutionLogin />} />
              <Route path="/signup" element={<InstitutionSignup />} />

              {/* Main Application with Global Layout */}
              <Route path="/" element={<Layout />}>
                {/* Root Route: Redirects to /login if unauthenticated, or to appropriate dashboard */}
                <Route index element={<RootRedirect />} />

                {/* Public Marketing & Help Pages */}
                <Route path="home" element={<Home />} />
                <Route path="features" element={<Features />} />
                <Route path="help" element={<Help />} />

                {/* Dedicated Institute Dashboard (for participating colleges) */}
                <Route
                  path="institute/dashboard"
                  element={
                    <ProtectedRoute>
                      <InstituteDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Executive Admin Dashboard (Protected via RBAC) */}
                <Route
                  path="dashboard"
                  element={
                    <AdminRoute>
                      <DashboardPage />
                    </AdminRoute>
                  }
                />

                {/* Core Workflow Modules (Protected) */}
                <Route
                  path="approval-process"
                  element={
                    <ProtectedRoute>
                      <ApprovalProcessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="compliance-checking"
                  element={
                    <ProtectedRoute>
                      <ComplianceCheckingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="alerts"
                  element={
                    <ProtectedRoute>
                      <AlertsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="data-silos"
                  element={
                    <AdminRoute>
                      <DataSilosPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="compliance-visibility"
                  element={
                    <ProtectedRoute>
                      <ComplianceVisibilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="early-warning"
                  element={
                    <AdminRoute>
                      <EarlyWarningPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="document-verification"
                  element={
                    <AdminRoute>
                      <DocumentVerificationPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="inspections"
                  element={
                    <AdminRoute>
                      <InspectionsPage />
                    </AdminRoute>
                  }
                />

                {/* Admin Only Modules */}
                <Route
                  path="officer-accountability"
                  element={
                    <AdminRoute>
                      <OfficerAccountabilityPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="policy-simulator"
                  element={
                    <AdminRoute>
                      <PolicySimulatorPage />
                    </AdminRoute>
                  }
                />

                {/* Public Trust Verification Portal (Accessible without login) */}
                <Route path="public-verification" element={<PublicVerificationPortalPage />} />
                <Route path="verify" element={<PublicVerificationPortalPage />} />

                {/* Fallback */}
                <Route path="*" element={<RootRedirect />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AlertsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
