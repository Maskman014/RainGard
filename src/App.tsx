import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMonitorPage } from './pages/RiskMonitorPage';
import { ConfirmationsPage } from './pages/ConfirmationsPage';
import { PayoutHistoryPage } from './pages/PayoutHistoryPage';
import { ZoneMapPage } from './pages/ZoneMapPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AuthPage } from './pages/AuthPage';
import { SplashScreen } from './components/SplashScreen';

function StartupFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const splashTimer = useRef<number | undefined>(undefined);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    splashTimer.current = window.setTimeout(() => {
      splashTimer.current = undefined;
      setShowSplash(false);
      navigateRef.current('/auth', { replace: true });
    }, 2200);

    return () => window.clearTimeout(splashTimer.current);
  }, []);

  if (showSplash) {
    return (
      <SplashScreen
        onSkip={() => {
          window.clearTimeout(splashTimer.current);
          setShowSplash(false);
          navigateRef.current('/auth', { replace: true });
        }}
      />
    );
  }

  return (
    <Routes>
      {/* Dedicated Auth Route */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

      {/* Dashboard Shell with Classical Left Sidebar Layout */}
      <Route path="/" element={user ? <AppLayout /> : <Navigate to="/auth" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="risk-monitor" element={<RiskMonitorPage />} />
        <Route path="confirmations" element={<ConfirmationsPage />} />
        <Route path="payouts" element={<PayoutHistoryPage />} />
        <Route path="zone-map" element={<ZoneMapPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPanelPage />} />
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <StartupFlow />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
