import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './components/AppLayout';
import { LANDING_STYLES } from './pages/Land.styles';
import { PROFILE_STYLES } from './pages/Profile.styles';
import { INVESTMENT_PLANS_STYLES } from './pages/InvestmentPlans.styles';
import { SAVINGS_MANAGEMENT_STYLES } from './pages/SavingsManagement.styles';
import { BENEFICIARY_MANAGEMENT_STYLES } from './pages/BeneficiaryManagement.styles';
import { AUTH_STYLES } from './pages/Auth.styles';
import { ADMIN_DASHBOARD_STYLES } from './pages/AdminDashboard.styles';
import LoadingWatch from './components/LoadingWatch';
import './App.css';

const Login = lazy(() => import('./pages/Login'));
const Registerrr = lazy(() => import('./pages/Registerrr'));
const Dashboard_new = lazy(() => import('./pages/Dashboard_new'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BeneficiaryManagement = lazy(() => import('./pages/BeneficiaryManagement'));
const InvestmentPlans = lazy(() => import('./pages/InvestmentPlans'));
const SavingsManagement = lazy(() => import('./pages/SavingsManagement'));
const Ledger = lazy(() => import('./pages/Ledger'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Land = lazy(() => import('./pages/Land'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingWatch />}>
          <Routes>
            <Route path="/" element={<Land styles={LANDING_STYLES} />} />
            <Route path="/login" element={<Login styles={AUTH_STYLES} />} />
            <Route path="/register" element={<Registerrr />} />
            <Route path="/forgot-password" element={<ForgotPassword styles={AUTH_STYLES} />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Signed-in pages share one layout (sidebar + header) that stays mounted between pages */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard_new />} />
              <Route path="/beneficiaries" element={<BeneficiaryManagement styles={BENEFICIARY_MANAGEMENT_STYLES} />} />
              <Route path="/investments" element={<InvestmentPlans styles={INVESTMENT_PLANS_STYLES} />} />
              <Route path="/savings" element={<SavingsManagement styles={SAVINGS_MANAGEMENT_STYLES} />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile styles={PROFILE_STYLES} />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard styles={ADMIN_DASHBOARD_STYLES} />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
