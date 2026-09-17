import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbAPI, neoLocalStorage, fetchCryptoPrices, startKeySync } from '../lib/supabase';
import { fetchKeyFromFirestore, syncKeyToFirestore, DB_PREFIX } from '../lib/firebase';
import { Profile, Account, Transaction, Card, CryptoWallet, GlobalSettings, NotificationRecord } from '../types';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'crypto' | 'security';
}

interface AppContextType {
  user: Profile | null;
  accounts: Account[];
  cards: Card[];
  cryptoWallets: CryptoWallet[];
  transactions: Transaction[];
  notifications: NotificationRecord[];
  toasts: ToastMessage[];
  globalSettings: GlobalSettings;
  dbUpdatedTimestamp: number;
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  refreshUserData: () => void;
  updateGlobalSettings: (newSettings: GlobalSettings) => void;
  handleLogin: (email: string, pass: string, loginPin: string) => Promise<{ success: boolean; error: string | null }>;
  handleSignUp: (email: string, fullName: string, loginPin: string, transactionPin: string, currency: string, avatarUrl?: string) => Promise<{ success: boolean; error: string | null }>;
  handleLogout: () => void;
  toggleCardFreeze: (cardId: string) => void;
  mintNewCard: (type: 'black' | 'neon' | 'gold') => void;
  processTransfer: (transferData: any) => Promise<{ success: boolean; error: string | null }>;
  processCryptoTrade: (coinId: 'btc' | 'eth' | 'sol', type: 'buy' | 'sell', amount: number) => Promise<{ success: boolean; error: string | null }>;
  triggerKYCState: (userId: string, status: boolean) => void;
  isSecurityBotOpen: boolean;
  securityBotInitialMessage: string | null;
  openSecurityBot: (message?: string) => void;
  closeSecurityBot: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(dbAPI.getCurrentUser());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(neoLocalStorage.getGlobalSettings());
  const [dbUpdatedTimestamp, setDbUpdatedTimestamp] = useState<number>(Date.now());
  const [isSecurityBotOpen, setIsSecurityBotOpen] = useState(false);
  const [securityBotInitialMessage, setSecurityBotInitialMessage] = useState<string | null>(null);

  // Auto update language via google translate cookie
  useEffect(() => {
    if (user?.language) {
      const getCookie = (name: string) => {
        const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? decodeURIComponent(matches[1]) : undefined;
      };

      const currentGoogTrans = getCookie('googtrans');
      const targetVal = user.language === 'en' ? undefined : `/en/${user.language}`;

      if (user.language === 'en') {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${document.domain}; path=/;`;
      } else {
        document.cookie = `googtrans=/en/${user.language}; path=/`;
        document.cookie = `googtrans=/en/${user.language}; domain=${document.domain}; path=/`;
      }

      if (currentGoogTrans !== targetVal && !(currentGoogTrans === undefined && targetVal === undefined)) {
        window.location.reload();
      }
    }
  }, [user?.language]);

  // Sync document title dynamically with website_name
  useEffect(() => {
    if (globalSettings?.website_name) {
      document.title = `${globalSettings.website_name} - Online & Mobile Banking`;
    }
  }, [globalSettings?.website_name]);

  const updateGlobalSettings = (newSettings: GlobalSettings) => {
    neoLocalStorage.setGlobalSettings(newSettings);
    setGlobalSettings(newSettings);
  };

  const openSecurityBot = (message?: string) => {
    setIsSecurityBotOpen(true);
    if (message) {
      setSecurityBotInitialMessage(message);
    }
  };

  const closeSecurityBot = () => {
    setIsSecurityBotOpen(false);
    setSecurityBotInitialMessage(null);
  };

  // Show Toast
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data loaded from simulated db
  const refreshUserData = () => {
    if (user) {
      // Always look up the latest from the profiles list to ensure cross-device sync works
      const allProfiles = neoLocalStorage.getProfiles();
      const updatedProfile = allProfiles.find(p => p.id === user.id);
      
      if (updatedProfile) {
        const storedPin = localStorage.getItem('user_session_pin') || user.login_pin;
        if (storedPin && updatedProfile.login_pin && storedPin !== updatedProfile.login_pin) {
          // Pin changed elsewhere, log out
          dbAPI.logout();
          setUser(null);
          localStorage.removeItem('user_session_pin');
          showToast('Security Alert', 'Login PIN was changed on another device. You have been logged out.', 'error');
          return;
        }
        
        // Ensure the stored pin is up to date if it was missing
        if (!localStorage.getItem('user_session_pin') && updatedProfile.login_pin) {
          localStorage.setItem('user_session_pin', updatedProfile.login_pin);
        }
        setUser(updatedProfile);
        neoLocalStorage.setCurrentUser(updatedProfile);
      } else {
        setUser(null);
      }
      setAccounts(dbAPI.getAccounts(user.id));
      setCards(dbAPI.getCards(user.id));
      setCryptoWallets(dbAPI.getCryptoWallets(user.id));
      setTransactions(dbAPI.getTransactions(user.id));
      setNotifications(dbAPI.getNotifications(user.id));
    } else {
      setAccounts([]);
      setCards([]);
      setCryptoWallets([]);
      setTransactions([]);
      setNotifications([]);
    }
    setDbUpdatedTimestamp(Date.now());
  };

  // Proactively fetch initial cloud state on mount to prevent stale local cache
  useEffect(() => {
    const hydrateFromCloud = async () => {
      try {
        const remoteSettings = await fetchKeyFromFirestore('global_settings');
        if (remoteSettings && (remoteSettings as any).website_name) {
          localStorage.setItem(`${DB_PREFIX}global_settings`, JSON.stringify(remoteSettings));
          setGlobalSettings(remoteSettings as any);
        } else {
          // New database auto-sync: seed initial settings
          const initialSettings = neoLocalStorage.getGlobalSettings();
          await syncKeyToFirestore('global_settings', initialSettings);
        }

        const remoteProfiles = await fetchKeyFromFirestore('profiles');
        if (remoteProfiles && Array.isArray(remoteProfiles) && remoteProfiles.length > 0) {
          localStorage.setItem(`${DB_PREFIX}profiles`, JSON.stringify(remoteProfiles));
        } else {
          // New database auto-sync: seed initial profiles so users can log in across any device
          const initialProfiles = neoLocalStorage.getProfiles();
          await syncKeyToFirestore('profiles', initialProfiles);
        }

        const remoteTransfers = await fetchKeyFromFirestore('transfers');
        if (remoteTransfers && Array.isArray(remoteTransfers)) {
          localStorage.setItem(`${DB_PREFIX}transfers`, JSON.stringify(remoteTransfers));
        } else {
          const initialTransfers = neoLocalStorage.getTransfers();
          await syncKeyToFirestore('transfers', initialTransfers);
        }

        const remoteGiftCards = await fetchKeyFromFirestore('gift_cards');
        if (remoteGiftCards && Array.isArray(remoteGiftCards)) {
          localStorage.setItem(`${DB_PREFIX}gift_cards`, JSON.stringify(remoteGiftCards));
        } else {
          const initialGiftCards = neoLocalStorage.getGiftCards();
          await syncKeyToFirestore('gift_cards', initialGiftCards);
        }

        const remoteLoans = await fetchKeyFromFirestore('loans');
        if (remoteLoans && Array.isArray(remoteLoans)) {
          localStorage.setItem(`${DB_PREFIX}loans`, JSON.stringify(remoteLoans));
        } else {
          const initialLoans = neoLocalStorage.getLoans();
          await syncKeyToFirestore('loans', initialLoans);
        }

        if (user) {
          const remoteAccounts = await fetchKeyFromFirestore(`accounts_${user.id}`);
          if (remoteAccounts && Array.isArray(remoteAccounts)) {
            localStorage.setItem(`${DB_PREFIX}accounts_${user.id}`, JSON.stringify(remoteAccounts));
          } else {
            const initialAccs = neoLocalStorage.getAccounts(user.id);
            await syncKeyToFirestore(`accounts_${user.id}`, initialAccs);
          }

          const remoteTransactions = await fetchKeyFromFirestore(`transactions_${user.id}`);
          if (remoteTransactions && Array.isArray(remoteTransactions)) {
            localStorage.setItem(`${DB_PREFIX}transactions_${user.id}`, JSON.stringify(remoteTransactions));
          } else {
            const initialTxs = neoLocalStorage.getTransactions(user.id);
            await syncKeyToFirestore(`transactions_${user.id}`, initialTxs);
          }

          const remoteCards = await fetchKeyFromFirestore(`cards_${user.id}`);
          if (remoteCards && Array.isArray(remoteCards)) {
            localStorage.setItem(`${DB_PREFIX}cards_${user.id}`, JSON.stringify(remoteCards));
          } else {
            const initialCards = neoLocalStorage.getCards(user.id);
            await syncKeyToFirestore(`cards_${user.id}`, initialCards);
          }

          const remoteCrypto = await fetchKeyFromFirestore(`crypto_wallets_${user.id}`);
          if (remoteCrypto && Array.isArray(remoteCrypto)) {
            localStorage.setItem(`${DB_PREFIX}crypto_wallets_${user.id}`, JSON.stringify(remoteCrypto));
          } else {
            const initialCrypto = neoLocalStorage.getCryptoWallets(user.id);
            await syncKeyToFirestore(`crypto_wallets_${user.id}`, initialCrypto);
          }

          const remoteNotifications = await fetchKeyFromFirestore(`notifications_${user.id}`);
          if (remoteNotifications && Array.isArray(remoteNotifications)) {
            localStorage.setItem(`${DB_PREFIX}notifications_${user.id}`, JSON.stringify(remoteNotifications));
          } else {
            const initialNotifs = neoLocalStorage.getNotifications(user.id);
            await syncKeyToFirestore(`notifications_${user.id}`, initialNotifs);
          }
        }
        refreshUserData();
      } catch (err) {
        console.warn('Initial cloud hydration check completed with note:', err);
      }
    };

    hydrateFromCloud();
  }, [user?.id]);

  useEffect(() => {
    refreshUserData();

    // Start real-time sync across devices via Firebase Firestore
    const unsubSyncPulse = startKeySync('sync_pulse', () => refreshUserData());
    const unsubProfiles = startKeySync('profiles', () => refreshUserData());
    const unsubTransfers = startKeySync('transfers', () => refreshUserData());
    const unsubGiftCards = startKeySync('gift_cards', () => refreshUserData());
    const unsubLoans = startKeySync('loans', () => refreshUserData());
    const unsubGlobalSettings = startKeySync('global_settings', (s) => {
      if (s && s.website_name) {
        localStorage.setItem(`${DB_PREFIX}global_settings`, JSON.stringify(s));
        setGlobalSettings(s);
      }
    });
    const unsubChats = startKeySync('chat_history', () => refreshUserData());
    
    let unsubs: Array<() => void> = [];
    if (user) {
      unsubs.push(startKeySync(`accounts_${user.id}`, () => refreshUserData()));
      unsubs.push(startKeySync(`cards_${user.id}`, () => refreshUserData()));
      unsubs.push(startKeySync(`transactions_${user.id}`, () => refreshUserData()));
      unsubs.push(startKeySync(`crypto_wallets_${user.id}`, () => refreshUserData()));
      unsubs.push(startKeySync(`notifications_${user.id}`, () => refreshUserData()));
    }

    // For admin users, also listen to all accounts dynamically
    let adminAccountUnsubs: Array<() => void> = [];
    if (user && (user.role === 'admin' || user.email === 'admin001@gmail.com' || user.email === 'customersupport056@gmail.com')) {
      const allProfiles = neoLocalStorage.getProfiles();
      allProfiles.forEach(p => {
        if (p.id !== user.id) {
          adminAccountUnsubs.push(startKeySync(`accounts_${p.id}`, () => refreshUserData()));
          adminAccountUnsubs.push(startKeySync(`transactions_${p.id}`, () => refreshUserData()));
        }
      });
    }

    return () => {
      unsubSyncPulse();
      unsubProfiles();
      unsubTransfers();
      unsubGiftCards();
      unsubLoans();
      unsubGlobalSettings();
      unsubChats();
      unsubs.forEach(unsub => unsub());
      adminAccountUnsubs.forEach(unsub => unsub());
    };
  }, [user?.id, user?.email]);

  // Periodic crypto price simulation to make UI feel simulated and alive
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const updated = fetchCryptoPrices(user.id);
      setCryptoWallets(updated);
      
      // Randomly notify a minor drift occasionally to look alive
      if (Math.random() > 0.82) {
        const randomCoin = updated[Math.floor(Math.random() * updated.length)];
        showToast(
          `${randomCoin.name} Price Alert`,
          `Live rate: $${randomCoin.current_price.toLocaleString()} (${randomCoin.price_change_24h > 0 ? '+' : ''}${randomCoin.price_change_24h}%)`,
          'crypto'
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user?.id, user?.email]);

  const handleLogin = async (email: string, pass: string, loginPin: string) => {
    const res = await dbAPI.login(email, pass, loginPin);
    if (res.user) {
      localStorage.setItem('user_session_pin', res.user.login_pin || loginPin);
      setUser(res.user);
      showToast('Welcome Back', `Welcome back, ${res.user.full_name}.`, 'success');
      return { success: true, error: null };
    }
    return { success: false, error: res.error };
  };

  const handleSignUp = async (email: string, fullName: string, loginPin: string, transactionPin: string, currency: string, avatarUrl?: string) => {
    const res = await dbAPI.signUp(email, fullName, loginPin, transactionPin, currency, avatarUrl);
    if (res.user) {
      localStorage.setItem('user_session_pin', res.user.login_pin || loginPin);
      setUser(res.user);
      showToast(`${globalSettings.website_name} Activated`, `Welcome to your secure ${globalSettings.website_name} account!`, 'success');
      return { success: true, error: null };
    }
    return { success: false, error: res.error };
  };

  const handleLogout = () => {
    dbAPI.logout();
    setUser(null);
    localStorage.removeItem('user_session_pin');
    showToast('Logged Out', 'You have been successfully logged out of your account.', 'info');
  };

  const toggleCardFreeze = (cardId: string) => {
    if (!user) return;
    const updatedCards = dbAPI.toggleFreezeCard(user.id, cardId);
    setCards(updatedCards);
    const target = updatedCards.find(c => c.id === cardId);
    if (target) {
      showToast(
        target.is_frozen ? 'Card Frozen' : 'Card Activated',
        `Your card has been ${target.is_frozen ? 'frozen' : 'unfrozen'} successfully.`,
        'security'
      );
    }
  };

  const mintNewCard = (type: 'black' | 'neon' | 'gold') => {
    if (!user) return;
    dbAPI.addCard(user.id, type);
    refreshUserData();
    showToast('Card Created', `Your premium card has been successfully created.`, 'success');
  };

  const processTransfer = async (transferData: any) => {
    if (!user) return { success: false, error: 'Unauthenticated session' };
    const res = await dbAPI.initiateTransfer(user.id, transferData);
    if (res.success) {
      refreshUserData();
      showToast(
        'Transfer Sent', 
        `Successfully transferred $${transferData.amount.toFixed(2)} to ${transferData.recipient_name} via ${transferData.type.toUpperCase()}.`, 
        'success'
      );
      return { success: true, error: null };
    }
    showToast('Transfer Failed', res.error || 'System rejection', 'error');
    return { success: false, error: res.error };
  };

  const processCryptoTrade = async (coinId: 'btc' | 'eth' | 'sol', type: 'buy' | 'sell', amount: number) => {
    if (!user) return { success: false, error: 'Unauthenticated session' };
    const res = await dbAPI.tradeCrypto(user.id, coinId, type, amount);
    if (res.success) {
      refreshUserData();
      const coinName = coinId === 'btc' ? 'Bitcoin' : coinId === 'eth' ? 'Ethereum' : 'Solana';
      showToast(
        'Trade Successful', 
        `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${coinId.toUpperCase()}.`, 
        'success'
      );
      return { success: true, error: null };
    }
    showToast('Order Failed', res.error || 'Broker engine error', 'error');
    return { success: false, error: res.error };
  };

  const triggerKYCState = (userId: string, approved: boolean) => {
    dbAPI.approveKYC(userId, approved);
    // Refresh user state in context if current user was affected
    if (user && user.id === userId) {
      setUser(dbAPI.getCurrentUser());
    }
    showToast(
      'KYC Status Updated', 
      `Identity verification status has been updated to ${approved ? 'APPROVED' : 'REJECTED'}.`, 
      'info'
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        accounts,
        cards,
        cryptoWallets,
        transactions,
        notifications,
        toasts,
        globalSettings,
        updateGlobalSettings,
        dbUpdatedTimestamp,
        showToast,
        removeToast,
        refreshUserData,
        handleLogin,
        handleSignUp,
        handleLogout,
        toggleCardFreeze,
        mintNewCard,
        processTransfer,
        processCryptoTrade,
        triggerKYCState,
        isSecurityBotOpen,
        securityBotInitialMessage,
        openSecurityBot,
        closeSecurityBot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
