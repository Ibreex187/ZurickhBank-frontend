import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { LANDING_STYLES } from './pages/Land.styles';
import { DASHBOARD_STYLES } from './pages/Dashboard.styles';
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

function App() {


  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingWatch />}>
          <Routes>
            <Route path="/" element={<Land styles={LANDING_STYLES} />} />
            <Route path="/login" element={<Login styles={AUTH_STYLES} />} />
            <Route path="/register" element={<Registerrr styles={AUTH_STYLES} />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard_new styles={DASHBOARD_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/beneficiaries"
              element={
                <ProtectedRoute>
                  <BeneficiaryManagement styles={BENEFICIARY_MANAGEMENT_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/investments"
              element={
                <ProtectedRoute>
                  <InvestmentPlans styles={INVESTMENT_PLANS_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/savings"
              element={
                <ProtectedRoute>
                  <SavingsManagement styles={SAVINGS_MANAGEMENT_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <Ledger />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications styles={DASHBOARD_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile styles={PROFILE_STYLES} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard styles={ADMIN_DASHBOARD_STYLES} />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
