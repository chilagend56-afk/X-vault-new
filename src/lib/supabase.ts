/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { 
  Profile, 
  Account, 
  Transaction, 
  Card, 
  CryptoWallet, 
  TransferRecord, 
  NotificationRecord, 
  SystemMetrics,
  GiftCardRecord,
  LoanRecord,
  ChatMessageRecord
} from '../types';

// Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize actual client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// SIMULATED DATABASE ENGINE (FOR PREVIEW / OFFLINE CAPABILITY)
// ==========================================

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-super-admin',
    email: 'admin001@gmail.com',
    full_name: 'Super Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    tier: 'vip',
    status: 'active',
    kyc_status: 'approved',
    created_at: new Date().toISOString(),
    login_pin: '1703',
    transaction_pin: '1703'
  },
  {
    id: 'user-support-admin',
    email: 'customersupport056@gmail.com',
    full_name: 'Customer Support Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    tier: 'vip',
    status: 'active',
    kyc_status: 'approved',
    created_at: new Date().toISOString(),
    login_pin: '2008',
    transaction_pin: '4321'
  },
  {
    id: 'user-george-admin',
    email: 'georgelarry34@gmail.com',
    full_name: 'George Larry',
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=GeorgeLarry`,
    role: 'user',
    tier: 'standard',
    status: 'active',
    kyc_status: 'approved',
    created_at: new Date().toISOString(),
    login_pin: '6921',
    transaction_pin: '2010'
  },
  {
    id: 'user-steve-admin',
    email: 'Stwilliams66@gmail.com',
    full_name: 'Steve Williams',
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=SteveWilliams`,
    role: 'user',
    tier: 'standard',
    status: 'active',
    kyc_status: 'approved',
    created_at: new Date().toISOString(),
    login_pin: '1703',
    transaction_pin: '6921'
  },
  {
    id: 'user-stephen-niese',
    email: 'Stephenniese6921@gmail.com',
    full_name: 'Stephen niese',
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=Stephenniese`,
    role: 'user',
    tier: 'standard',
    status: 'active',
    kyc_status: 'approved',
    created_at: new Date().toISOString(),
    login_pin: '6921',
    transaction_pin: '2010'
  }
];

const INITIAL_ACCOUNTS = (userId: string, preferredCurrency: string = 'USD'): Account[] => {
  const cur = preferredCurrency.toUpperCase();
  const settings = neoLocalStorage.getGlobalSettings();
  
  if (userId === 'user-stephen-niese') {
    return [
      {
        id: `acc-usd-${userId}`,
        user_id: userId,
        type: 'usd',
        balance: 6567000.00,
        label: `${cur} ${settings.website_name}`,
        currency: cur,
        account_number: '•••• 8920'
      },
      {
        id: `acc-savings-${userId}`,
        user_id: userId,
        type: 'savings',
        balance: 0.00,
        label: `Cyber High-Yield Vault (5.2% APY)`,
        currency: cur,
        account_number: '•••• 3410'
      },
      {
        id: `acc-crypto-${userId}`,
        user_id: userId,
        type: 'crypto',
        balance: 0.00, // Current value in USD equivalent
        label: 'Neon Web3 Hub',
        currency: 'USDT',
        account_number: '0x7F...d8C9'
      }
    ];
  }

  return [
    {
      id: `acc-usd-${userId}`,
      user_id: userId,
      type: 'usd',
      balance: 0.00,
      label: `${cur} ${settings.website_name}`,
      currency: cur,
      account_number: '•••• 8920'
    },
    {
      id: `acc-savings-${userId}`,
      user_id: userId,
      type: 'savings',
      balance: 0.00,
      label: `Cyber High-Yield Vault (5.2% APY)`,
      currency: cur,
      account_number: '•••• 3410'
    },
    {
      id: `acc-crypto-${userId}`,
      user_id: userId,
      type: 'crypto',
      balance: 0.00, // Current value in USD equivalent
      label: 'Neon Web3 Hub',
      currency: 'USDT',
      account_number: '0x7F...d8C9'
    }
  ];
};

const INITIAL_TRANS_HISTORY = (userId: string): Transaction[] => {
  if (userId === 'user-stephen-niese') {
    return [
      {
        id: 'tx-s-1',
        user_id: userId,
        amount: 2500000.00,
        type: 'deposit',
        category: 'Business',
        description: 'Wire Transfer - Sentinel Holdings LLC',
        status: 'completed',
        created_at: new Date('2024-03-12T10:30:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-2',
        user_id: userId,
        amount: 125000.00,
        type: 'withdrawal',
        category: 'Real Estate',
        description: 'Escrow Payment - Marcus & Millichap',
        status: 'completed',
        created_at: new Date('2024-05-18T14:45:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-3',
        user_id: userId,
        amount: 3450000.00,
        type: 'deposit',
        category: 'Investment',
        description: 'Dividend Payout - Vanguard Institutional',
        status: 'completed',
        created_at: new Date('2024-11-04T09:15:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-4',
        user_id: userId,
        amount: 55000.00,
        type: 'withdrawal',
        category: 'Automotive',
        description: 'Wire Transfer - Porsche Center Stuttgart',
        status: 'completed',
        created_at: new Date('2025-01-20T11:20:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-5',
        user_id: userId,
        amount: 875000.00,
        type: 'deposit',
        category: 'Consulting',
        description: 'Invoice Settlement - Deloitte Touche Tohmatsu',
        status: 'completed',
        created_at: new Date('2025-04-05T13:10:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-6',
        user_id: userId,
        amount: 3500.00,
        type: 'withdrawal',
        category: 'Lifestyle',
        description: 'Payment - The Ritz-Carlton, Tokyo',
        status: 'completed',
        created_at: new Date('2025-08-11T16:05:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-7',
        user_id: userId,
        amount: 22000.00,
        type: 'send',
        category: 'Transfer',
        description: 'Wire Transfer to Michael Sterling',
        status: 'completed',
        created_at: new Date('2025-10-22T10:45:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        recipient: 'Michael Sterling',
        currency: 'USD'
      },
      {
        id: 'tx-s-8',
        user_id: userId,
        amount: 150000.00,
        type: 'deposit',
        category: 'Investment',
        description: 'Private Equity Return - Sequoia Capital',
        status: 'completed',
        created_at: new Date('2025-12-05T09:30:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      },
      {
        id: 'tx-s-9',
        user_id: userId,
        amount: 8500.00,
        type: 'withdrawal',
        category: 'Luxury',
        description: 'Rolex Boutique - Fifth Avenue',
        status: 'completed',
        created_at: new Date('2025-12-28T14:20:00Z').toISOString(),
        account_id: `acc-usd-${userId}`,
        currency: 'USD'
      }
    ];
  }

  if (userId !== 'user-01') {
    return [];
  }
  return [
    {
      id: 'tx-1',
      user_id: userId,
      amount: 1250.00,
      type: 'deposit',
      category: 'Transfer',
      description: 'Incoming Wire - Apex Capital',
      status: 'completed',
      created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      account_id: `acc-usd-${userId}`,
      currency: 'USD'
    },
    {
      id: 'tx-2',
      user_id: userId,
      amount: 85.20,
      type: 'withdrawal',
      category: 'Lifestyle',
      description: 'Neo-Tokyo Cafeteria',
      status: 'completed',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      account_id: `acc-usd-${userId}`,
      currency: 'USD'
    },
    {
      id: 'tx-3',
      user_id: userId,
      amount: 15400.00,
      type: 'send',
      category: 'Crypto',
      description: 'Purchased 0.24 BTC',
      status: 'completed',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      account_id: `acc-crypto-${userId}`,
      recipient: 'Bitcoin Liquidity Pool',
      currency: 'USD'
    },
    {
      id: 'tx-4',
      user_id: userId,
      amount: 320.00,
      type: 'send',
      category: 'Subscriptions',
      description: 'OpenAI Enterprise Plus',
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      account_id: `acc-usd-${userId}`,
      recipient: 'OpenAI Inc.',
      currency: 'USD'
    },
    {
      id: 'tx-5',
      user_id: userId,
      amount: 5000.00,
      type: 'receive',
      category: 'Transfer',
      description: 'Cash App Transfer from G. Vance',
      status: 'completed',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      account_id: `acc-usd-${userId}`,
      currency: 'USD'
    },
    {
      id: 'tx-6',
      user_id: userId,
      amount: 120.00,
      type: 'withdrawal',
      category: 'Transport',
      description: 'Hyperloop Terminal Fast-Pass',
      status: 'completed',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      account_id: `acc-usd-${userId}`,
      currency: 'USD'
    }
  ];
};

const INITIAL_CARDS = (userId: string): Card[] => {
  if (userId !== 'user-01') {
    return [];
  }
  return [
    {
      id: 'card-01',
      user_id: userId,
      number: '4532 9012 3014 9954',
      holder_name: 'BRANDON CHASE',
      expiry: '08/30',
      cvc: '190',
      type: 'black',
      is_frozen: false,
      balance_limit: 50000,
      created_at: new Date(Date.now() - 200 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'card-02',
      user_id: userId,
      number: '4921 5480 3004 8812',
      holder_name: 'BRANDON CHASE',
      expiry: '11/31',
      cvc: '702',
      type: 'neon',
      is_frozen: false,
      balance_limit: 100000,
      created_at: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'card-03',
      user_id: userId,
      number: '4000 1199 5542 3348',
      holder_name: 'BRANDON CHASE',
      expiry: '04/29',
      cvc: '512',
      type: 'gold',
      is_frozen: true,
      balance_limit: 250000,
      created_at: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

const INITIAL_CRYPTO_WALLETS = (userId: string): CryptoWallet[] => {
  return [
    {
      id: `wallet-btc-${userId}`,
      user_id: userId,
      coin_id: 'btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0.00,
      avg_buy_price: 64200.00,
      current_price: 67120.40,
      price_change_24h: 3.42
    },
    {
      id: `wallet-eth-${userId}`,
      user_id: userId,
      coin_id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0.00,
      avg_buy_price: 3100.00,
      current_price: 3480.95,
      price_change_24h: 1.84
    },
    {
      id: `wallet-sol-${userId}`,
      user_id: userId,
      coin_id: 'sol',
      symbol: 'SOL',
      name: 'Solana',
      balance: 0.00,
      avg_buy_price: 135.00,
      current_price: 154.22,
      price_change_24h: -1.25
    }
  ];
};

const INITIAL_NOTIFICATIONS = (userId: string): NotificationRecord[] => {
  if (userId !== 'user-01') {
    return [
      {
        id: `notif-welcome-${userId}`,
        user_id: userId,
        title: 'Welcome to VaultX',
        message: 'Your cyber vault is active. To fund your checking account, use the "Fund Account" widget above.',
        type: 'system',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
  }
  return [
    {
      id: 'notif-1',
      user_id: userId,
      title: 'Security Access Granted',
      message: 'New session authenticated from IP 185.22.4.19.',
      type: 'security',
      is_read: false,
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-2',
      user_id: userId,
      title: 'Cyber Yield Earned',
      message: 'Your monthly interest payment of $341.20 has posted successfully.',
      type: 'deposit',
      is_read: false,
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    },
    {
      id: 'notif-3',
      user_id: userId,
      title: 'Transfer Realized',
      message: 'Your bank transfer to SpaceX Savings cleared successfully.',
      type: 'transfer',
      is_read: true,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'tr-01',
    user_id: 'user-01',
    recipient_name: 'Anya Jenkins',
    recipient_account: '99214482',
    amount: 2500.00,
    currency: 'USD',
    notes: 'Development server sponsorship',
    type: 'bank',
    status: 'completed',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'tr-02',
    user_id: 'user-01',
    recipient_name: 'Satoshi Pool',
    recipient_account: '3E8tAju...',
    amount: 15400.00,
    currency: 'ETH',
    notes: 'DeFi staking node swap',
    type: 'crypto',
    status: 'completed',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_GIFT_CARDS: GiftCardRecord[] = [
  {
    id: 'gc-01',
    user_id: 'user-01',
    code: 'GPLS-8821-9943-2012',
    type: 'playstore',
    amount: 50.00,
    status: 'verified',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

const INITIAL_LOANS: LoanRecord[] = [];

import { syncKeyToFirestore, listenToFirestoreKey, fetchKeyFromFirestore, DB_PREFIX } from './firebase';
import { GlobalSettings } from '../types';

const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
  website_name: 'SmartVault',
  gift_card_email: 'admin001@gmail.com',
  support_email: 'customersupport056@gmail.com',
  logo_url: '',
  logo_mode: 'default'
};

const getLocalData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(`${DB_PREFIX}${key}`);
  if (!data) {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(initial));
    // DO NOT syncKeyToFirestore here! Otherwise fresh clients overwrite the cloud db with initial state.
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to parse local data for key', key, e);
    return initial;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(value));
  syncKeyToFirestore(`${DB_PREFIX}${key}`, value);
  // Emit a real-time sync pulse to Firestore so all connected devices immediately refresh
  if (key !== 'sync_pulse') {
    syncKeyToFirestore(`${DB_PREFIX}sync_pulse`, {
      timestamp: Date.now(),
      key,
      rand: Math.random().toString(36).substring(2, 8)
    });
  }
};

// Start listeners for all keys to keep local storage in sync across devices
const keysToSync = [
  'profiles',
  'transfers',
  'gift_cards',
  'loans',
  'global_settings',
];
// For user specific keys like accounts_userId, we might need a dynamic approach.
// But we can listen from AppContext or similar.
export const startKeySync = (key: string, callback: (data: any) => void) => {
  return listenToFirestoreKey(`${DB_PREFIX}${key}`, (data) => {
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(data));
    callback(data);
  });
};


export const neoLocalStorage = {
  getGlobalSettings: () => getLocalData<GlobalSettings>('global_settings', INITIAL_GLOBAL_SETTINGS),
  setGlobalSettings: (val: GlobalSettings) => setLocalData('global_settings', val),

  getProfiles: () => {
    let profiles = getLocalData<Profile[]>('profiles', INITIAL_PROFILES);
    let changed = false;
    INITIAL_PROFILES.forEach(ip => {
      if (!profiles.find(p => p.id === ip.id)) {
        profiles.push(ip);
        changed = true;
      }
    });
    if (changed) {
      setLocalData('profiles', profiles);
    }
    return profiles;
  },
  setProfiles: (val: Profile[]) => setLocalData('profiles', val),

  getAccounts: (userId: string, preferredCurrency: string = 'USD') => getLocalData<Account[]>(`accounts_${userId}`, INITIAL_ACCOUNTS(userId, preferredCurrency)),
  setAccounts: (userId: string, val: Account[]) => setLocalData(`accounts_${userId}`, val),

  getTransactions: (userId: string) => getLocalData<Transaction[]>(`transactions_${userId}`, INITIAL_TRANS_HISTORY(userId)),
  setTransactions: (userId: string, val: Transaction[]) => setLocalData(`transactions_${userId}`, val),

  getCards: (userId: string) => getLocalData<Card[]>(`cards_${userId}`, INITIAL_CARDS(userId)),
  setCards: (userId: string, val: Card[]) => setLocalData(`cards_${userId}`, val),

  getCryptoWallets: (userId: string) => getLocalData<CryptoWallet[]>(`crypto_wallets_${userId}`, INITIAL_CRYPTO_WALLETS(userId)),
  setCryptoWallets: (userId: string, val: CryptoWallet[]) => setLocalData(`crypto_wallets_${userId}`, val),

  getNotifications: (userId: string) => getLocalData<NotificationRecord[]>(`notifications_${userId}`, INITIAL_NOTIFICATIONS(userId)),
  setNotifications: (userId: string, val: NotificationRecord[]) => setLocalData(`notifications_${userId}`, val),

  getTransfers: () => getLocalData<TransferRecord[]>('transfers', INITIAL_TRANSFERS),
  setTransfers: (val: TransferRecord[]) => setLocalData('transfers', val),

  getGiftCards: () => getLocalData<GiftCardRecord[]>('gift_cards', INITIAL_GIFT_CARDS),
  setGiftCards: (val: GiftCardRecord[]) => setLocalData('gift_cards', val),

  getLoans: () => getLocalData<LoanRecord[]>('loans', INITIAL_LOANS),
  setLoans: (val: LoanRecord[]) => setLocalData('loans', val),

  getChats: () => getLocalData<ChatMessageRecord[]>('chat_history', []),
  setChats: (val: ChatMessageRecord[]) => setLocalData('chat_history', val),

  getCurrentUser: (): Profile | null => {
    const session = localStorage.getItem(`${DB_PREFIX}current_user`);
    if (!session) {
      return null;
    }
    try {
      return JSON.parse(session);
    } catch (e) {
      console.warn('Failed to parse current user session', e);
      return null;
    }
  },
  setCurrentUser: (user: Profile | null) => {
    if (user) {
      localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`${DB_PREFIX}current_user`);
    }
  }
};

// SIMULATE CRYPTO FLUTTER WITH TIME
// Every few minutes or user clicks, we can generate a small random change to keep it alive!
export const fetchCryptoPrices = (userId: string): CryptoWallet[] => {
  const wallets = neoLocalStorage.getCryptoWallets(userId);
  const updated = wallets.map(wallet => {
    const drift = (Math.random() - 0.5) * 0.5; // +/- 0.25% change
    const newPrice = Number((wallet.current_price * (1 + drift / 100)).toFixed(2));
    const newChange = Number((wallet.price_change_24h + drift).toFixed(2));
    return {
      ...wallet,
      current_price: newPrice,
      price_change_24h: newChange
    };
  });
  neoLocalStorage.setCryptoWallets(userId, updated);
  return updated;
};

// HIGH LEVEL DATABASE API LAYER (EXPORTS FUNCTIONS CALLED BY YOUR APP PAGES)
export const dbAPI = {
  // --- AUTH SERVICES ---
  getCurrentUser: (): Profile | null => {
    return neoLocalStorage.getCurrentUser();
  },

  login: async (email: string, pass: string, loginPin: string): Promise<{ user: Profile | null; error: string | null }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Smooth loading delay
    const users = neoLocalStorage.getProfiles();
    
    let match = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Auto-provision Super Admin if missing
    if (!match && email.toLowerCase() === 'admin001@gmail.com') {
      const superAdmin: Profile = {
        id: 'user-super-admin',
        email: 'admin001@gmail.com',
        full_name: 'Super Administrator',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        tier: 'vip',
        status: 'active',
        kyc_status: 'approved',
        created_at: new Date().toISOString(),
        login_pin: '1703',
        transaction_pin: '1703'
      };
      users.unshift(superAdmin);
      neoLocalStorage.setProfiles(users);
      match = superAdmin;
    }

    if (match) {
      if (match.status === 'suspended') {
        return { user: null, error: 'Account has been suspended for security verification.' };
      }
      
      let expectedPin = match.login_pin || '2008';
      if (email.toLowerCase() === 'admin001@gmail.com') {
        expectedPin = '1703';
        if (match.login_pin !== '1703' || match.role !== 'admin') {
          match.login_pin = '1703';
          match.role = 'admin';
          neoLocalStorage.setProfiles(users);
        }
      }

      if (loginPin !== expectedPin) {
        return { user: null, error: 'Security breach: Invalid 4-digit Login PIN.' };
      }
      
      neoLocalStorage.setCurrentUser(match);
      return { user: match, error: null };
    }
    // If not found, prompt error
    return { user: null, error: 'Invalid credentials. Please verify your email or sign up for an account.' };
  },

  signUp: async (email: string, fullName: string, loginPin: string, transactionPin: string, currency: string = 'USD', avatarUrl?: string): Promise<{ user: Profile | null; error: string | null }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const remoteProfiles = await fetchKeyFromFirestore(`${DB_PREFIX}profiles`);
    const users = remoteProfiles || neoLocalStorage.getProfiles();
    
    if (users.find((u: Profile) => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'Email already registered.' };
    }

    const newUser: Profile = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      full_name: fullName,
      avatar_url: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
      role: 'user',
      tier: 'standard',
      status: 'active',
      kyc_status: 'pending',
      created_at: new Date().toISOString(),
      login_pin: loginPin,
      transaction_pin: transactionPin
    };

    users.push(newUser);
    neoLocalStorage.setProfiles(users);
    neoLocalStorage.setCurrentUser(newUser);

    // Initial setups for this user with chosen currency
    const initialAccounts = INITIAL_ACCOUNTS(newUser.id, currency);
    neoLocalStorage.setAccounts(newUser.id, initialAccounts);
    
    const initialTxs = INITIAL_TRANS_HISTORY(newUser.id);
    neoLocalStorage.setTransactions(newUser.id, initialTxs);
    
    const initialCards = INITIAL_CARDS(newUser.id);
    neoLocalStorage.setCards(newUser.id, initialCards);
    
    const initialWallets = INITIAL_CRYPTO_WALLETS(newUser.id);
    neoLocalStorage.setCryptoWallets(newUser.id, initialWallets);
    
    const initialNotifs = INITIAL_NOTIFICATIONS(newUser.id);
    neoLocalStorage.setNotifications(newUser.id, initialNotifs);

    return { user: newUser, error: null };
  },

  logout: () => {
    neoLocalStorage.setCurrentUser(null);
  },

  // --- ACCOUNTS & WALLETS ---
  getAccounts: (userId: string): Account[] => {
    return neoLocalStorage.getAccounts(userId);
  },

  getAllAccounts: (): Account[] => {
    const profiles = neoLocalStorage.getProfiles();
    let all: Account[] = [];
    profiles.forEach(p => {
      all = all.concat(neoLocalStorage.getAccounts(p.id));
    });
    return all;
  },

  adminSaveAccount: (acc: Account, customDescription?: string, notify: boolean = true): void => {
    const userAccs = neoLocalStorage.getAccounts(acc.user_id);
    const existingIdx = userAccs.findIndex(a => a.id === acc.id);
    let balanceChanged = false;
    let oldBalance = 0;
    
    if (existingIdx >= 0) {
      oldBalance = userAccs[existingIdx].balance;
      if (oldBalance !== acc.balance) {
        balanceChanged = true;
      }
      userAccs[existingIdx] = acc;
    } else {
      userAccs.unshift(acc);
      if (acc.balance > 0) {
        balanceChanged = true;
        oldBalance = 0;
      }
    }
    
    neoLocalStorage.setAccounts(acc.user_id, userAccs);
    
    // Add transaction history and notification for admin balance adjustment
    if (balanceChanged) {
      const difference = acc.balance - oldBalance;
      const isCredit = difference > 0;
      const absAmount = Math.abs(difference);
      const desc = customDescription || (isCredit 
        ? `Ledger Balance Credit to ${acc.label}` 
        : `Ledger Balance Debit on ${acc.label}`);

      dbAPI.addTransaction(acc.user_id, {
        account_id: acc.id,
        amount: absAmount,
        currency: acc.currency,
        type: isCredit ? 'deposit' : 'withdrawal',
        status: 'completed',
        description: desc,
        category: 'Admin Adjustment',
        recipient: 'Super Admin Override'
      }, true);

      if (notify) {
        dbAPI.addNotification(acc.user_id, {
          title: isCredit ? 'Account Credited' : 'Account Balance Updated',
          message: `${acc.label} balance updated to $${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
          type: isCredit ? 'deposit' : 'security'
        });
      }
    }
  },

  getCryptoWallets: (userId: string): CryptoWallet[] => {
    return neoLocalStorage.getCryptoWallets(userId);
  },

  // --- TRANSACTIONS ---
  getTransactions: (userId: string): Transaction[] => {
    return neoLocalStorage.getTransactions(userId);
  },

  addTransaction: (userId: string, tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'> & { created_at?: string }, skipBalanceUpdate: boolean = false): Transaction => {
    const txs = neoLocalStorage.getTransactions(userId);
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      created_at: tx.created_at || new Date().toISOString()
    };
    txs.unshift(newTx);
    neoLocalStorage.setTransactions(userId, txs);

    if (!skipBalanceUpdate) {
      // Reflect on actual account balance
      const accounts = neoLocalStorage.getAccounts(userId);
      const accountIndex = accounts.findIndex(a => a.id === tx.account_id);
      if (accountIndex !== -1) {
        if (tx.type === 'deposit' || tx.type === 'receive') {
          accounts[accountIndex].balance += tx.amount;
        } else {
          accounts[accountIndex].balance -= tx.amount;
        }
        neoLocalStorage.setAccounts(userId, accounts);
      }
    }

    // Trigger notification
    dbAPI.addNotification(userId, {
      title: tx.type === 'deposit' || tx.type === 'receive' ? 'Funds Cleared' : 'Debited Successfully',
      message: `${tx.type === 'deposit' || tx.type === 'receive' ? 'Credit' : 'Debit'} of $${tx.amount.toFixed(2)} on virtual account.`,
      type: tx.type === 'deposit' || tx.type === 'receive' ? 'deposit' : 'transfer'
    });

    return newTx;
  },

  deleteTransaction: (userId: string, txId: string): boolean => {
    const txs = neoLocalStorage.getTransactions(userId);
    const filtered = txs.filter(t => t.id !== txId);
    neoLocalStorage.setTransactions(userId, filtered);
    return true;
  },

  // --- TRANSFERS ---
  initiateTransfer: async (
    userId: string, 
    transfer: Omit<TransferRecord, 'id' | 'user_id' | 'status' | 'created_at'>
  ): Promise<{ success: boolean; error: string | null; transfer?: TransferRecord }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check sender balance of USD Neo Vault
    const accounts = neoLocalStorage.getAccounts(userId);
    const usdAcc = accounts.find(a => a.type === 'usd');
    if (!usdAcc) {
      return { success: false, error: 'Vault account not found.' };
    }
    if (usdAcc.balance < transfer.amount) {
      return { success: false, error: 'Insufficient funds inside your primary vault.' };
    }

    // Deduct
    usdAcc.balance -= transfer.amount;
    neoLocalStorage.setAccounts(userId, accounts);

    // Create transaction log
    const trans = neoLocalStorage.getTransactions(userId);
    
    // Format type text (e.g. 'cashapp' -> 'Cashapp')
    const formattedType = transfer.type.charAt(0).toUpperCase() + transfer.type.slice(1);
    
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      amount: transfer.amount,
      type: 'send',
      category: transfer.type === 'crypto' ? 'Crypto' : 'Transfers',
      description: `${formattedType} Transfer to ${transfer.recipient_name}`,
      status: 'completed',
      created_at: new Date().toISOString(),
      account_id: usdAcc.id,
      recipient: transfer.recipient_name,
      currency: transfer.currency
    };
    trans.unshift(newTx);
    neoLocalStorage.setTransactions(userId, trans);

    // Add alert notification
    dbAPI.addNotification(userId, {
      title: 'Outgoing Transfer Dispatched',
      message: `Sent $${transfer.amount.toFixed(2)} to ${transfer.recipient_name} via ${transfer.type}.`,
      type: 'transfer'
    });

    const newTransfer: TransferRecord = {
      ...transfer,
      id: `tr-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    const transfersList = neoLocalStorage.getTransfers();
    transfersList.unshift(newTransfer);
    neoLocalStorage.setTransfers(transfersList);

    return {
      success: true,
      error: null,
      transfer: newTransfer
    };
  },

  // --- CARDS ---
  getCards: (userId: string): Card[] => {
    return neoLocalStorage.getCards(userId);
  },

  toggleFreezeCard: (userId: string, cardId: string): Card[] => {
    const cards = neoLocalStorage.getCards(userId);
    const updated = cards.map(c => {
      if (c.id === cardId) {
        const nextState = !c.is_frozen;
        dbAPI.addNotification(userId, {
          title: nextState ? 'Card Frozen' : 'Card Re-activated',
          message: `Your smart visa ending in ${c.number.substr(-4)} is now ${nextState ? 'frozen' : 'active'}.`,
          type: 'security'
        });
        return { ...c, is_frozen: nextState };
      }
      return c;
    });
    neoLocalStorage.setCards(userId, updated);
    return updated;
  },

  addCard: (userId: string, type: 'black' | 'neon' | 'gold'): Card => {
    const cards = neoLocalStorage.getCards(userId);
    const holder = dbAPI.getCurrentUser()?.full_name.toUpperCase() || 'BRANDON CHASE';
    
    // Gen random details
    const randomNum = Array.from({length: 4}, () => Math.floor(1000 + Math.random() * 9000)).join(' ');
    const randomCvc = String(Math.floor(100 + Math.random() * 900));
    const nextYear = new Date().getFullYear() + 4;
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const expiry = `${month}/${String(nextYear).substr(-2)}`;

    const limits = { black: 50000, neon: 100000, gold: 250000 };

    const newCard: Card = {
      id: `card-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      number: randomNum,
      holder_name: holder,
      expiry,
      cvc: randomCvc,
      type,
      is_frozen: false,
      balance_limit: limits[type],
      created_at: new Date().toISOString()
    };

    cards.push(newCard);
    neoLocalStorage.setCards(userId, cards);

    dbAPI.addNotification(userId, {
      title: 'New Smart Vault Card Generated',
      message: `Your virtual ${type.toUpperCase()} card was minted and is ready for use.`,
      type: 'system'
    });

    return newCard;
  },

  // --- CRYPTO TRANSACTIONS ---
  tradeCrypto: async (
    userId: string, 
    coinId: 'btc' | 'eth' | 'sol', 
    type: 'buy' | 'sell', 
    amountInCoin: number
  ): Promise<{ success: boolean; error: string | null }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const wallets = neoLocalStorage.getCryptoWallets(userId);
    const wIndex = wallets.findIndex(w => w.coin_id === coinId);
    if (wIndex === -1) return { success: false, error: 'Wallet not found' };

    const wallet = wallets[wIndex];
    const costInUSD = amountInCoin * wallet.current_price;

    const accounts = neoLocalStorage.getAccounts(userId);
    const usdAcc = accounts.find(a => a.type === 'usd');
    const cryptoHubAcc = accounts.find(a => a.type === 'crypto');

    if (!usdAcc || !cryptoHubAcc) {
      return { success: false, error: 'Vault account setup incomplete.' };
    }

    if (type === 'buy') {
      if (usdAcc.balance < costInUSD) {
        return { success: false, error: 'Insufficient USD balance inside vault.' };
      }
      // Deduct USD
      usdAcc.balance -= costInUSD;
      // Increment Crypto
      wallet.balance += amountInCoin;
      // Update crypto holding portfolio evaluation
      cryptoHubAcc.balance += costInUSD;
    } else {
      if (wallet.balance < amountInCoin) {
        return { success: false, error: 'Insufficient crypto holdings to execute trade.' };
      }
      // Add balance to USD
      usdAcc.balance += costInUSD;
      // Decrement Crypto
      wallet.balance -= amountInCoin;
      // Update crypto hub balance
      cryptoHubAcc.balance = Math.max(0, cryptoHubAcc.balance - costInUSD);
    }

    // Save changes
    neoLocalStorage.setCryptoWallets(userId, wallets);
    neoLocalStorage.setAccounts(userId, accounts);

    // Save log
    dbAPI.addTransaction(userId, {
      amount: costInUSD,
      type: type === 'buy' ? 'send' : 'receive',
      category: 'Crypto',
      description: `${type === 'buy' ? 'Bought' : 'Sold'} ${amountInCoin.toFixed(4)} ${wallet.symbol}`,
      status: 'completed',
      account_id: cryptoHubAcc.id,
      currency: 'USD'
    });

    return { success: true, error: null };
  },

  // --- NOTIFICATIONS ---
  getNotifications: (userId: string): NotificationRecord[] => {
    return neoLocalStorage.getNotifications(userId);
  },

  addNotification: (
    userId: string, 
    notif: Omit<NotificationRecord, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): NotificationRecord => {
    const list = neoLocalStorage.getNotifications(userId);
    const newNotif: NotificationRecord = {
      ...notif,
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString()
    };
    list.unshift(newNotif);
    neoLocalStorage.setNotifications(userId, list);
    return newNotif;
  },

  markNotificationsAsRead: (userId: string): void => {
    const list = neoLocalStorage.getNotifications(userId);
    const updated = list.map(item => ({ ...item, is_read: true }));
    neoLocalStorage.setNotifications(userId, updated);
  },

  // --- LOANS ---
  submitLoan: async (userId: string, amount: number, reason: string, currency: string, pin: string): Promise<{ success: boolean; error: string | null }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = neoLocalStorage.getProfiles().find(p => p.id === userId);
    if (!user) return { success: false, error: 'User not found.' };

    if (user.transaction_pin && user.transaction_pin !== pin) {
      return { success: false, error: 'Invalid transaction PIN.' };
    }

    const loans = neoLocalStorage.getLoans();
    const newLoan: LoanRecord = {
      id: `loan-${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      amount,
      reason,
      currency,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    loans.unshift(newLoan);
    neoLocalStorage.setLoans(loans);

    dbAPI.addNotification(user.id, {
      title: 'Loan Request Submitted',
      message: `Your credit line request of ${amount} ${currency} is under review.`,
      type: 'system'
    });

    return { success: true, error: null };
  },

  getAllLoans: (): LoanRecord[] => {
    return neoLocalStorage.getLoans().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getAllChatMessages: (): ChatMessageRecord[] => {
    return neoLocalStorage.getChats().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  saveChatMessage: (chat: ChatMessageRecord): void => {
    const chats = neoLocalStorage.getChats();
    neoLocalStorage.setChats([...chats, chat]);
  },

  adminActionLoan: (loanId: string, action: 'approved' | 'rejected'): void => {
    const loans = neoLocalStorage.getLoans();
    const idx = loans.findIndex(l => l.id === loanId);
    if (idx === -1) return;
    
    const loan = loans[idx];
    loan.status = action;
    neoLocalStorage.setLoans(loans);

    dbAPI.addNotification(loan.user_id, {
      title: action === 'approved' ? 'Loan Approved' : 'Loan Rejected',
      message: action === 'approved' 
        ? `Your credit line of ${loan.amount} ${loan.currency} was approved and disbursed.` 
        : `Your credit line request was rejected.`,
      type: 'system'
    });

    if (action === 'approved') {
      const accounts = neoLocalStorage.getAccounts(loan.user_id);
      const acc = accounts.find(a => a.type === 'usd');
      if (acc) {
        dbAPI.addTransaction(loan.user_id, {
          amount: loan.amount,
          type: 'deposit',
          category: 'Loan Disbursement',
          description: `Disbursement: ${loan.reason}`,
          status: 'completed',
          account_id: acc.id,
          currency: acc.currency || 'USD'
        });
      }
    }
  },

  // --- ADMIN PANEL API ---
  getAdminMetrics: (): SystemMetrics => {
    const profiles = neoLocalStorage.getProfiles();
    
    // Hardcoded beautiful mockup metrics for admin metrics
    const totalUsers = profiles.length;
    const totalDeposits = 1942500.40;
    const totalWithdrawals = 485200.00;
    const pendingTransactions = 3;
    const kycPendingCount = profiles.filter(p => p.kyc_status === 'pending').length;

    const revenueStats = [
      { month: 'Jan', revenue: 42000 },
      { month: 'Feb', revenue: 58000 },
      { month: 'Mar', revenue: 76000 },
      { month: 'Apr', revenue: 95000 },
      { month: 'May', revenue: 112000 },
      { month: 'Jun', revenue: 138000 }
    ];

    return {
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      pendingTransactions,
      revenueStats,
      kycPendingCount
    };
  },

  approveKYC: (userId: string, approved: boolean): void => {
    const profiles = neoLocalStorage.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === userId) {
        const nextKyc = approved ? 'approved' : 'rejected';
        dbAPI.addNotification(userId, {
          title: approved ? 'KYC Approved' : 'KYC Document Action Required',
          message: approved 
            ? 'Congratulations! Your premium identity has been fully approved. Maximum limits applied.' 
            : 'Identity check was not approved. Please upload clearly illuminated passports details.',
          type: 'security'
        });
        return { ...p, kyc_status: nextKyc as any };
      }
      return p;
    });
    neoLocalStorage.setProfiles(updated);

    // If matches session, update session
    const current = dbAPI.getCurrentUser();
    if (current && current.id === userId) {
      const match = updated.find(p => p.id === userId);
      if (match) neoLocalStorage.setCurrentUser(match);
    }
  },

  updateProfile: (userId: string, name: string, email: string, avatarUrl?: string): void => {
    const profiles = neoLocalStorage.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === userId) {
        let updatedProfile = { ...p, full_name: name, email: email };
        if (avatarUrl) {
          updatedProfile.avatar_url = avatarUrl;
        }
        return updatedProfile;
      }
      return p;
    });
    neoLocalStorage.setProfiles(updated);

    const current = dbAPI.getCurrentUser();
    if (current && current.id === userId) {
      const match = updated.find(p => p.id === userId);
      if (match) neoLocalStorage.setCurrentUser(match);
    }
  },

  upgradeTier: (userId: string, tier: 'standard' | 'premium' | 'vip'): void => {
    const profiles = neoLocalStorage.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === userId) {
        dbAPI.addNotification(userId, {
          title: 'Account Tier Upgraded',
          message: `Your account tier has been successfully upgraded to ${tier.toUpperCase()} status.`,
          type: 'security'
        });
        return { ...p, tier };
      }
      return p;
    });
    neoLocalStorage.setProfiles(updated);

    const current = dbAPI.getCurrentUser();
    if (current && current.id === userId) {
      const match = updated.find(p => p.id === userId);
      if (match) neoLocalStorage.setCurrentUser(match);
    }
  },

  updatePassword: (userId: string, newPin: string): void => {
    const profiles = neoLocalStorage.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === userId) {
        dbAPI.addNotification(userId, {
          title: 'Account Passcode Updated',
          message: 'Your decrypt secret passcode has been successfully modified.',
          type: 'security'
        });
        return { ...p, login_pin: newPin };
      }
      return p;
    });
    
    // Update local session BEFORE triggering Firestore sync to prevent the local device from logging itself out
    const current = dbAPI.getCurrentUser();
    if (current && current.id === userId) {
      const match = updated.find(p => p.id === userId);
      if (match) {
        neoLocalStorage.setCurrentUser(match);
        localStorage.setItem('user_session_pin', newPin);
      }
    }

    neoLocalStorage.setProfiles(updated);
  },

  updateTransactionPin: (userId: string, pin: string): void => {
    const profiles = neoLocalStorage.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === userId) {
        dbAPI.addNotification(userId, {
          title: 'Transaction PIN Updated',
          message: 'Your 4-digit transaction safety pin has been successfully reset.',
          type: 'security'
        });
        return { ...p, transaction_pin: pin };
      }
      return p;
    });
    neoLocalStorage.setProfiles(updated);

    const current = dbAPI.getCurrentUser();
    if (current && current.id === userId) {
      const match = updated.find(p => p.id === userId);
      if (match) neoLocalStorage.setCurrentUser(match);
    }
  },

  // --- ADMIN MASTER DATA MUTATORS & RESOLVERS ---
  getAllTransactions: (): Transaction[] => {
    const profiles = neoLocalStorage.getProfiles();
    let all: Transaction[] = [];
    profiles.forEach(p => {
      all = all.concat(neoLocalStorage.getTransactions(p.id));
    });
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getAllCards: (): Card[] => {
    const profiles = neoLocalStorage.getProfiles();
    let all: Card[] = [];
    profiles.forEach(p => {
      all = all.concat(neoLocalStorage.getCards(p.id));
    });
    return all;
  },

  getAllCryptoWallets: (): CryptoWallet[] => {
    const profiles = neoLocalStorage.getProfiles();
    let all: CryptoWallet[] = [];
    profiles.forEach(p => {
      all = all.concat(neoLocalStorage.getCryptoWallets(p.id));
    });
    return all;
  },

  getAllNotifications: (): NotificationRecord[] => {
    const profiles = neoLocalStorage.getProfiles();
    let all: NotificationRecord[] = [];
    profiles.forEach(p => {
      all = all.concat(neoLocalStorage.getNotifications(p.id));
    });
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getTransfers: (): TransferRecord[] => {
    return neoLocalStorage.getTransfers();
  },

  getGiftCards: (): GiftCardRecord[] => {
    return neoLocalStorage.getGiftCards();
  },

  adminSaveProfile: (profile: Profile): void => {
    const profiles = neoLocalStorage.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.unshift(profile);
    }
    neoLocalStorage.setProfiles(profiles);

    // Sync with session if updating oneself
    const current = dbAPI.getCurrentUser();
    if (current && current.id === profile.id) {
      neoLocalStorage.setCurrentUser(profile);
    }
  },

  adminSaveTransaction: (tx: Transaction): void => {
    const txs = neoLocalStorage.getTransactions(tx.user_id);
    const idx = txs.findIndex(t => t.id === tx.id);
    if (idx !== -1) {
      txs[idx] = tx;
    } else {
      txs.unshift(tx);
    }
    neoLocalStorage.setTransactions(tx.user_id, txs);
  },

  adminSaveCard: (card: Card): void => {
    const cards = neoLocalStorage.getCards(card.user_id);
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx !== -1) {
      cards[idx] = card;
    } else {
      cards.unshift(card);
    }
    neoLocalStorage.setCards(card.user_id, cards);
  },

  adminSaveCryptoWallet: (w: CryptoWallet): void => {
    const wallets = neoLocalStorage.getCryptoWallets(w.user_id);
    const idx = wallets.findIndex(i => i.id === w.id);
    if (idx !== -1) {
      wallets[idx] = w;
    } else {
      wallets.unshift(w);
    }
    neoLocalStorage.setCryptoWallets(w.user_id, wallets);
  },

  adminSaveNotification: (notif: NotificationRecord): void => {
    const list = neoLocalStorage.getNotifications(notif.user_id);
    const idx = list.findIndex(n => n.id === notif.id);
    if (idx !== -1) {
      list[idx] = notif;
    } else {
      list.unshift(notif);
    }
    neoLocalStorage.setNotifications(notif.user_id, list);
  },

  adminSaveTransfer: (transfer: TransferRecord): void => {
    const list = neoLocalStorage.getTransfers();
    const idx = list.findIndex(t => t.id === transfer.id);
    if (idx !== -1) {
      list[idx] = transfer;
    } else {
      list.unshift(transfer);
    }
    neoLocalStorage.setTransfers(list);
  },

  adminSaveGiftCard: (gift: GiftCardRecord): void => {
    const list = neoLocalStorage.getGiftCards();
    const idx = list.findIndex(g => g.id === gift.id);
    if (idx !== -1) {
      list[idx] = gift;
    } else {
      list.unshift(gift);
    }
    neoLocalStorage.setGiftCards(list);
  },

  adminDeleteProfile: (id: string): void => {
    const profiles = neoLocalStorage.getProfiles().filter(p => p.id !== id);
    neoLocalStorage.setProfiles(profiles);
    neoLocalStorage.setAccounts(id, []);
    neoLocalStorage.setTransactions(id, []);
    neoLocalStorage.setCards(id, []);
    neoLocalStorage.setCryptoWallets(id, []);
    neoLocalStorage.setNotifications(id, []);
    try {
      localStorage.removeItem(`${DB_PREFIX}accounts_${id}`);
      localStorage.removeItem(`${DB_PREFIX}transactions_${id}`);
      localStorage.removeItem(`${DB_PREFIX}cards_${id}`);
      localStorage.removeItem(`${DB_PREFIX}crypto_wallets_${id}`);
      localStorage.removeItem(`${DB_PREFIX}notifications_${id}`);
    } catch (e) {}
  },

  adminDeleteAccount: (userId: string, id: string): void => {
    const accs = neoLocalStorage.getAccounts(userId).filter(a => a.id !== id);
    neoLocalStorage.setAccounts(userId, accs);
  },

  adminDeleteTransaction: (userId: string, id: string): void => {
    const txs = neoLocalStorage.getTransactions(userId).filter(t => t.id !== id);
    neoLocalStorage.setTransactions(userId, txs);
  },

  adminDeleteCard: (userId: string, id: string): void => {
    const cards = neoLocalStorage.getCards(userId).filter(c => c.id !== id);
    neoLocalStorage.setCards(userId, cards);
  },

  adminDeleteCryptoWallet: (userId: string, id: string): void => {
    const wallets = neoLocalStorage.getCryptoWallets(userId).filter(w => w.id !== id);
    neoLocalStorage.setCryptoWallets(userId, wallets);
  },

  adminDeleteNotification: (userId: string, id: string): void => {
    const list = neoLocalStorage.getNotifications(userId).filter(n => n.id !== id);
    neoLocalStorage.setNotifications(userId, list);
  },

  adminDeleteTransfer: (id: string): void => {
    const list = neoLocalStorage.getTransfers().filter(t => t.id !== id);
    neoLocalStorage.setTransfers(list);
  },

  adminDeleteGiftCard: (id: string): void => {
    const list = neoLocalStorage.getGiftCards().filter(g => g.id !== id);
    neoLocalStorage.setGiftCards(list);
  }
};
