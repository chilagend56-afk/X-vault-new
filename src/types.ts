export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'personal_admin';
  tier: 'standard' | 'premium' | 'vip' | 'personal_admin';
  status: 'active' | 'suspended';
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  login_pin?: string;
  transaction_pin?: string;
  language?: string;
  premium_upgrade_fee?: number;
  pin_reset_fee?: number;
}

export interface GlobalSettings {
  website_name: string;
  gift_card_email: string;
  support_email: string;
  logo_url?: string;
  logo_mode?: 'default' | 'custom';
}

export interface Account {
  id: string;
  user_id: string;
  type: 'usd' | 'savings' | 'crypto';
  balance: number;
  label: string;
  currency: string;
  account_number: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive';
  category: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  account_id: string;
  recipient?: string;
  currency: string;
}

export interface Card {
  id: string;
  user_id: string;
  number: string;
  holder_name: string;
  expiry: string;
  cvc: string;
  type: 'black' | 'neon' | 'gold';
  is_frozen: boolean;
  balance_limit: number;
  created_at: string;
}

export interface CryptoWallet {
  id: string;
  user_id: string;
  coin_id: 'btc' | 'eth' | 'sol';
  symbol: string;
  name: string;
  balance: number; // in coin units
  avg_buy_price: number;
  current_price: number;
  price_change_24h: number;
}

export interface TransferRecord {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_account: string;
  amount: number;
  currency: string;
  notes?: string;
  type: 'internal' | 'bank' | 'paypal' | 'cashapp' | 'crypto';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'security' | 'deposit' | 'transfer' | 'alert' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface SystemMetrics {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  revenueStats: { month: string; revenue: number }[];
  kycPendingCount: number;
}

export interface GiftCardRecord {
  id: string;
  user_id: string;
  code: string;
  type: 'playstore' | 'razergold' | 'apple' | 'steam';
  amount: number;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
}

export interface LoanRecord {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ChatMessageRecord {
  id: string;
  user_id: string;
  user_email: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  meta?: {
    type?: 'otp_broadcaster' | 'premium_upgrade_actions' | 'pin_reset_input' | 'gift_card_gateway' | 'personal_admin_link' | 'human_support_link';
    otpCode?: string;
  };
}

