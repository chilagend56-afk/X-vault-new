import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransfersPage } from './pages/TransfersPage';
import { CardsPage } from './pages/CardsPage';
import { CryptoPage } from './pages/CryptoPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { SavingsPage } from './pages/SavingsPage';
import { LoansPage } from './pages/LoansPage';
import { PremiumPage } from './pages/PremiumPage';
import { PersonalAdminPage } from './pages/PersonalAdminPage';
import { StatementsPage } from './pages/StatementsPage';
import { CheckDepositPage } from './pages/CheckDepositPage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [view, setView] = useState<string>('landing');
  const [showSplash, setShowSplash] = useState(true);

  // Multi-factor route security boundaries:
  // If no user is logged in, restrict views to landing, login, signup or forgot
  useEffect(() => {
    if (!user) {
      if (view !== 'landing' && view !== 'login' && view !== 'signup' && view !== 'forgot') {
        setView('landing');
      }
    } else {
      // If user is validated, default login landing skip directly to deck
      if (view === 'landing' || view === 'login' || view === 'signup') {
        if (user.email === 'admin001@gmail.com' || user.email === 'customersupport056@gmail.com') {
          setView('admin');
        } else {
          setView('dashboard');
        }
      } else if (view === 'admin' && user.email !== 'admin001@gmail.com' && user.email !== 'customersupport056@gmail.com') {
        setView('dashboard');
      } else if (view === 'personal_admin' && user.role !== 'personal_admin' && user.tier !== 'personal_admin' && user.email !== 'georgelarry34@gmail.com' && user.email !== 'Stwilliams66@gmail.com' && user.email !== 'Stephenniese6921@gmail.com') {
        setView('dashboard');
      }
    }
  }, [user?.id, user?.email, view]);

  return (
    <>
      {showSplash && (
        <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
      )}

      {!showSplash && (
        <>
          {/* UN-AUTHENTICATED PORTALS */}
          {!user ? (
            <>
              {view === 'login' && <AuthPage onNavigate={setView} initialMode="login" />}
              {view === 'signup' && <AuthPage onNavigate={setView} initialMode="signup" />}
              {view === 'forgot' && <AuthPage onNavigate={setView} initialMode="forgot" />}
              {view !== 'login' && view !== 'signup' && view !== 'forgot' && <LandingPage onNavigate={setView} />}
            </>
          ) : (
            /* PROTECTED ACTIVE CHANNELS */
            <ProtectedLayout activeView={view} onNavigate={setView}>
              {view === 'dashboard' && <DashboardPage onNavigate={setView} />}
              {view === 'cards' && <CardsPage />}
              {view === 'transfers' && <TransfersPage />}
              {view === 'crypto' && <CryptoPage />}
              {view === 'transactions' && <TransactionsPage />}
              {view === 'settings' && <SettingsPage />}
              {view === 'admin' && <AdminPage />}
              {view === 'withdraw' && <WithdrawPage />}
              {view === 'savings' && <SavingsPage />}
              {view === 'loans' && <LoansPage />}
              {view === 'premium' && <PremiumPage />}
              {view === 'statements' && <StatementsPage />}
              {view === 'check_deposit' && <CheckDepositPage />}
              {view === 'personal_admin' && <PersonalAdminPage onNavigate={setView} />}
            </ProtectedLayout>
          )}
        </>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
