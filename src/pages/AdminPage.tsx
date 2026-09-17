import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppContext';
import { BankLogo } from '../components/BankLogo';
import { dbAPI, neoLocalStorage } from '../lib/supabase';
import { 
  Profile, 
  Account,
  Transaction, 
  Card, 
  TransferRecord, 
  NotificationRecord, 
  CryptoWallet, 
  GiftCardRecord,
  LoanRecord,
  ChatMessageRecord,
  GlobalSettings
} from '../types';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileCheck, 
  CheckCircle2, 
  ShieldAlert, 
  X,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  CreditCard,
  Send,
  Bell,
  Wallet,
  Gift,
  Coins,
  History,
  XCircle,
  Sparkles,
  Info,
  Layers,
  Settings,
  Landmark,
  DollarSign,
  RefreshCw,
  Download,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Lock,
  ArrowRight,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

type AdminTab = 'overview' | 'profiles' | 'adjuster' | 'transfers' | 'cards' | 'gift_cards' | 'loans' | 'chats' | 'settings';

interface BalanceModalData {
  profile: Profile;
  account: Account;
  targetBalance: string;
  mode: 'exact' | 'credit' | 'debit';
  adjustAmount: string;
  reason: string;
}

export const AdminPage: React.FC = () => {
  const { user, showToast, refreshUserData, dbUpdatedTimestamp, globalSettings, updateGlobalSettings } = useApp();
  
  // Navigation & Search
  const [activeTab, setActiveTab] = useState<AdminTab>('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Core state from database
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCardRecord[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [chats, setChats] = useState<ChatMessageRecord[]>([]);

  // Balance Modal for quick setting balance on any account
  const [balanceModal, setBalanceModal] = useState<BalanceModalData | null>(null);

  // Direct Balance Adjuster form state
  const [adjustUserId, setAdjustUserId] = useState<string>('');
  const [adjustAccountId, setAdjustAccountId] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit' | 'exact'>('exact');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('Administrative Deposit Adjustment');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Edit / Create Modals
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserState, setNewUserState] = useState<Partial<Profile>>({
    full_name: '',
    email: '',
    tier: 'standard',
    login_pin: '2008',
    transaction_pin: '4321',
    status: 'active',
    kyc_status: 'approved',
    avatar_url: ''
  });

  const editFileInputRef = React.useRef<HTMLInputElement>(null);
  const newFileInputRef = React.useRef<HTMLInputElement>(null);

  // Client-side image compression for fast avatar storage & cross-device instant sync
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Invalid image file. Please upload an image (PNG, JPG, WebP).'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 256;
            const MAX_HEIGHT = 256;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          };
          img.onerror = () => reject(new Error('Failed to render selected image'));
          img.src = event.target.result as string;
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const generateRandomAvatar = (seedName?: string) => {
    const seed = seedName || Math.random().toString(36).substring(2, 9);
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
  };

  // Settings tab form state
  const [siteNameInput, setSiteNameInput] = useState(globalSettings.website_name || 'SmartVault');
  const [giftEmailInput, setGiftEmailInput] = useState(globalSettings.gift_card_email || 'admin001@gmail.com');
  const [supportEmailInput, setSupportEmailInput] = useState(globalSettings.support_email || 'customersupport056@gmail.com');
  const [logoUrlInput, setLogoUrlInput] = useState(globalSettings.logo_url || '');
  const [logoModeInput, setLogoModeInput] = useState<'default' | 'custom'>(globalSettings.logo_mode || (globalSettings.logo_url ? 'custom' : 'default'));
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    setSiteNameInput(globalSettings.website_name || 'SmartVault');
    setGiftEmailInput(globalSettings.gift_card_email || 'admin001@gmail.com');
    setSupportEmailInput(globalSettings.support_email || 'customersupport056@gmail.com');
    setLogoUrlInput(globalSettings.logo_url || '');
    setLogoModeInput(globalSettings.logo_mode || (globalSettings.logo_url ? 'custom' : 'default'));
  }, [globalSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const dataUrl = await compressImageFile(file);
      setLogoUrlInput(dataUrl);
      setLogoModeInput('custom');
      showToast('Logo Loaded', 'Preview generated. Click "Save Global Settings" to broadcast globally.', 'info');
    } catch (err) {
      showToast('Upload Failed', 'Failed to process logo image.', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const reloadData = () => {
    try {
      const p = neoLocalStorage.getProfiles();
      const a = dbAPI.getAllAccounts();
      setProfiles(p);
      setAccounts(a);
      setTransactions(dbAPI.getAllTransactions());
      setCards(dbAPI.getAllCards());
      setTransfers(dbAPI.getTransfers());
      setNotifications(dbAPI.getAllNotifications());
      setGiftCards(dbAPI.getGiftCards());
      setLoans(dbAPI.getAllLoans());
      setChats(dbAPI.getAllChatMessages());

      if (!adjustUserId && p.length > 0) {
        setAdjustUserId(p[0].id);
        const userAccs = a.filter(acc => acc.user_id === p[0].id);
        if (userAccs.length > 0) {
          setAdjustAccountId(userAccs[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load admin logs", e);
    }
  };

  useEffect(() => {
    reloadData();
  }, [dbUpdatedTimestamp]);

  useEffect(() => {
    if (adjustUserId) {
      const userAccs = accounts.filter(acc => acc.user_id === adjustUserId);
      if (userAccs.length > 0 && !userAccs.some(a => a.id === adjustAccountId)) {
        setAdjustAccountId(userAccs[0].id);
      }
    }
  }, [adjustUserId, accounts]);

  // Guard entry for super admin only
  if (!user || (user.email !== 'admin001@gmail.com' && user.email !== 'customersupport056@gmail.com' && user.role !== 'admin')) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-rose-500/20 text-center text-slate-500 max-w-xl mx-auto mt-12 shadow-2xl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-pulse" />
        <span className="block font-semibold text-slate-900 text-lg">Unauthorized Access</span>
        <span className="text-xs text-slate-500 mt-1 block">
          This command center requires Super Administrator credentials.
        </span>
      </div>
    );
  }

  // Cloud sync handler
  const handleSyncFromCloud = async (silent: boolean = false) => {
    try {
      if (!silent) {
        showToast('Syncing', 'Pulling latest records from Firebase cloud database...', 'info');
      }
      const { fetchKeyFromFirestore } = await import('../lib/firebase');
      
      const pData = await fetchKeyFromFirestore('profiles');
      if (pData && Array.isArray(pData)) {
        setProfiles(pData);
        neoLocalStorage.setProfiles(pData);
        
        for (const p of pData) {
          const accData = await fetchKeyFromFirestore(`accounts_${p.id}`);
          if (accData) neoLocalStorage.setAccounts(p.id, accData);
          
          const cardData = await fetchKeyFromFirestore(`cards_${p.id}`);
          if (cardData) neoLocalStorage.setCards(p.id, cardData);
          
          const txData = await fetchKeyFromFirestore(`transactions_${p.id}`);
          if (txData) neoLocalStorage.setTransactions(p.id, txData);

          const notifData = await fetchKeyFromFirestore(`notifications_${p.id}`);
          if (notifData) neoLocalStorage.setNotifications(p.id, notifData);

          const cryptoData = await fetchKeyFromFirestore(`crypto_wallets_${p.id}`);
          if (cryptoData) neoLocalStorage.setCryptoWallets(p.id, cryptoData);
        }
      }

      const transfersData = await fetchKeyFromFirestore('transfers');
      if (transfersData) neoLocalStorage.setTransfers(transfersData);

      const giftData = await fetchKeyFromFirestore('gift_cards');
      if (giftData) neoLocalStorage.setGiftCards(giftData);

      const loansData = await fetchKeyFromFirestore('loans');
      if (loansData) neoLocalStorage.setLoans(loansData);

      const settingsData = await fetchKeyFromFirestore('global_settings');
      if (settingsData) neoLocalStorage.setGlobalSettings(settingsData);

      reloadData();
      if (!silent) {
        showToast('Sync Complete', 'Cloud database synchronized in real-time.', 'success');
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        showToast('Sync Failed', 'Could not sync cloud data.', 'error');
      }
    }
  };

  // Database JSON backup download
  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      profiles,
      accounts,
      transfers,
      giftCards,
      loans,
      globalSettings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Backup Created', 'Database snapshot downloaded.', 'success');
  };

  // Metrics
  const totalDeposits = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const pendingKYC = profiles.filter(p => p.kyc_status === 'pending');
  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const pendingGiftCards = giftCards.filter(g => g.status === 'pending');
  const totalPendingActionCount = pendingKYC.length + pendingTransfers.length + pendingLoans.length + pendingGiftCards.length;

  // DIRECT BALANCE MODAL HANDLER (Sets balance on exact account & syncs immediately)
  const handleSaveBalanceModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!balanceModal) return;

    let finalBalance = balanceModal.account.balance;
    let customReason = balanceModal.reason.trim();

    if (balanceModal.mode === 'exact') {
      const val = parseFloat(balanceModal.targetBalance);
      if (isNaN(val) || val < 0) {
        showToast('Invalid Amount', 'Please enter a valid non-negative number.', 'error');
        return;
      }
      finalBalance = val;
      if (!customReason) {
        customReason = `Balance adjusted to $${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      }
    } else if (balanceModal.mode === 'credit') {
      const val = parseFloat(balanceModal.adjustAmount);
      if (isNaN(val) || val <= 0) {
        showToast('Invalid Amount', 'Please enter a valid positive number to credit.', 'error');
        return;
      }
      finalBalance = balanceModal.account.balance + val;
      if (!customReason) {
        customReason = `Credit of $${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} on ${balanceModal.account.label}`;
      }
    } else if (balanceModal.mode === 'debit') {
      const val = parseFloat(balanceModal.adjustAmount);
      if (isNaN(val) || val <= 0) {
        showToast('Invalid Amount', 'Please enter a valid positive number to debit.', 'error');
        return;
      }
      finalBalance = Math.max(0, balanceModal.account.balance - val);
      if (!customReason) {
        customReason = `Debit of $${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} on ${balanceModal.account.label}`;
      }
    }

    const updatedAcc: Account = {
      ...balanceModal.account,
      balance: finalBalance
    };

    // Save and sync immediately to cloud and local storage
    dbAPI.adminSaveAccount(updatedAcc, customReason, true);

    const updatedAccounts = accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a);
    setAccounts(updatedAccounts);

    showToast(
      'Balance Updated & Synced',
      `${balanceModal.account.label} set to $${finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Synced immediately.`,
      'success'
    );

    setBalanceModal(null);
    reloadData();
    refreshUserData();
  };

  // DIRECT BALANCE ADJUSTMENT HANDLER (TAB)
  const handleExecuteBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount < 0) {
      showToast('Validation Error', 'Enter a valid numeric amount.', 'error');
      return;
    }

    const targetAccount = accounts.find(a => a.id === adjustAccountId);
    const targetProfile = profiles.find(p => p.id === adjustUserId);
    if (!targetAccount || !targetProfile) {
      showToast('Account Error', 'Target account not found.', 'error');
      return;
    }

    setIsAdjusting(true);
    setTimeout(() => {
      setIsAdjusting(false);
      let newBalance = targetAccount.balance;
      if (adjustType === 'exact') {
        newBalance = amount;
      } else if (adjustType === 'credit') {
        newBalance = targetAccount.balance + amount;
      } else {
        newBalance = Math.max(0, targetAccount.balance - amount);
      }

      // Update account in DB (adminSaveAccount handles real-time cloud sync, transaction & notification)
      const updatedAcc: Account = { ...targetAccount, balance: newBalance };
      dbAPI.adminSaveAccount(updatedAcc, adjustReason || `${adjustType.toUpperCase()} Balance Adjustment`, true);

      reloadData();
      refreshUserData();
      setAdjustAmount('');
      showToast('Balance Adjusted & Synced', `Successfully set ${targetProfile.full_name}'s ${targetAccount.label} balance to $${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`, 'success');
    }, 400);
  };

  // PROFILE ACTIONS
  const handleToggleSuspend = (p: Profile) => {
    const nextStatus = p.status === 'suspended' ? 'active' : 'suspended';
    dbAPI.adminSaveProfile({ ...p, status: nextStatus });
    showToast('Status Updated', `User account marked ${nextStatus}.`, 'info');
    reloadData();
    refreshUserData();
  };

  const handleApproveKYC = (p: Profile) => {
    dbAPI.adminSaveProfile({ ...p, kyc_status: 'approved' });
    dbAPI.addNotification(p.id, {
      title: 'KYC Verification Approved',
      message: 'Your identity documents have been approved by bank compliance.',
      type: 'security'
    });
    showToast('KYC Approved', `Approved identity verification for ${p.full_name}.`, 'success');
    reloadData();
    refreshUserData();
  };

  const handleResetPin = (p: Profile) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    dbAPI.adminSaveProfile({ ...p, login_pin: newPin });
    dbAPI.addNotification(p.id, {
      title: 'Login PIN Reset',
      message: `Your account login PIN has been administratively reset to ${newPin}.`,
      type: 'security'
    });
    showToast('PIN Reset', `New PIN for ${p.full_name} is ${newPin}.`, 'success');
    reloadData();
    refreshUserData();
  };

  const confirmDeleteProfile = () => {
    if (!profileToDelete) return;
    const target = profileToDelete;
    dbAPI.adminDeleteProfile(target.id);
    showToast('Profile Deleted', `${target.full_name} and all associated accounts were permanently deleted.`, 'success');
    if (editingProfile?.id === target.id) {
      setEditingProfile(null);
    }
    setProfileToDelete(null);
    reloadData();
    refreshUserData();
  };

  // WIRE & TRANSFER APPROVALS
  const handleUpdateTransferStatus = (t: TransferRecord, status: 'completed' | 'failed') => {
    dbAPI.adminSaveTransfer({ ...t, status });
    showToast('Transfer Updated', `Transfer marked as ${status}.`, 'success');
    reloadData();
    refreshUserData();
  };

  // LOAN APPROVALS
  const handleLoanAction = (loanId: string, action: 'approved' | 'rejected') => {
    dbAPI.adminActionLoan(loanId, action);
    showToast('Loan Updated', `Loan application ${action}.`, 'success');
    reloadData();
    refreshUserData();
  };

  // CARD TOGGLES
  const handleToggleCardFreeze = (card: Card) => {
    const updated = { ...card, is_frozen: !card.is_frozen };
    dbAPI.adminSaveCard(updated);
    showToast('Card Updated', `Card ${updated.is_frozen ? 'Frozen' : 'Active'}.`, 'info');
    reloadData();
    refreshUserData();
  };

  // GIFT CARDS
  const handleGiftCardAction = (gc: GiftCardRecord, status: 'verified' | 'failed') => {
    dbAPI.adminSaveGiftCard({ ...gc, status });
    if (status === 'verified') {
      dbAPI.upgradeTier(gc.user_id, 'premium');
      dbAPI.addNotification(gc.user_id, {
        title: 'Voucher Verified & Upgraded',
        message: 'Your gift voucher was verified. Account upgraded to Premium VIP Tier!',
        type: 'security'
      });
    }
    showToast('Gift Card Updated', `Voucher marked ${status}.`, 'success');
    reloadData();
    refreshUserData();
  };

  // SAVE GLOBAL SETTINGS
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: GlobalSettings = {
      website_name: siteNameInput.trim() || 'SmartVault',
      gift_card_email: giftEmailInput.trim(),
      support_email: supportEmailInput.trim(),
      logo_url: logoUrlInput.trim(),
      logo_mode: logoModeInput
    };
    updateGlobalSettings(newSettings);
    showToast('Platform Settings Saved', 'Branding name, logo, and support email updated and synced across all devices.', 'success');
  };

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-sans text-2xl font-bold text-slate-900">
            Admin Management Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer accounts, transfers, cards, gift vouchers, and platform configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFromCloud}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Sync Cloud Data
          </button>
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export JSON
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS (2-ON-A-ROW HORIZONTAL GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:flex xl:flex-wrap gap-1.5 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
        {[
          { id: 'overview', label: 'Operations Queue', icon: Layers, count: totalPendingActionCount },
          { id: 'profiles', label: 'User Directory', icon: Users, count: profiles.length },
          { id: 'adjuster', label: 'Set Balance', icon: DollarSign },
          { id: 'transfers', label: 'Transfers', icon: Send, count: pendingTransfers.length },
          { id: 'cards', label: 'Issued Cards', icon: CreditCard, count: cards.length },
          { id: 'gift_cards', label: 'Gift Cards', icon: Gift, count: pendingGiftCards.length },
          { id: 'loans', label: 'Loan Requests', icon: Landmark, count: pendingLoans.length },
          { id: 'chats', label: 'Live Support Desk', icon: MessageSquare },
          { id: 'settings', label: 'Global Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{tab.label}</span>
              </div>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200/60'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* OVERVIEW / OPERATIONS QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {totalPendingActionCount === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">All Operations Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are no pending KYC document submissions, unverified wire transfers, or loan requests in the queue.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending KYC Verifications */}
              {pendingKYC.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pending KYC Identity Verifications ({pendingKYC.length})
                      </h3>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingKYC.map(p => (
                      <div key={p.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{p.full_name}</p>
                          <p className="text-slate-500">{p.email} • ID: {p.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveKYC(p)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve Identity
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Wire Transfers */}
              {pendingTransfers.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pending Outgoing Wires & Transfers ({pendingTransfers.length})
                      </h3>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingTransfers.map(t => (
                      <div key={t.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            ${t.amount.toFixed(2)} to {t.recipient_name} ({t.recipient_account})
                          </p>
                          <p className="text-slate-500">Method: {t.type} • Sender ID: {t.user_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateTransferStatus(t, 'completed')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Release & Settle
                          </button>
                          <button
                            onClick={() => handleUpdateTransferStatus(t, 'failed')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 cursor-pointer"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Loans */}
              {pendingLoans.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pending Loan Underwriting Requests ({pendingLoans.length})
                      </h3>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingLoans.map(l => (
                      <div key={l.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            ${l.amount.toLocaleString()} requested for "{l.purpose}"
                          </p>
                          <p className="text-slate-500">Term: {l.term_months} months • APR: {l.interest_rate}% • Applicant ID: {l.user_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoanAction(l.id, 'approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve & Disburse Funds
                          </button>
                          <button
                            onClick={() => handleLoanAction(l.id, 'rejected')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Gift Cards */}
              {pendingGiftCards.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Pending Gift Card VIP Verifications ({pendingGiftCards.length})
                      </h3>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {pendingGiftCards.map(gc => (
                      <div key={gc.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">
                            {gc.type.toUpperCase()} Card • Amount: ${gc.amount}
                          </p>
                          <p className="font-mono text-slate-600 mt-0.5">Code: {gc.code} • User: {gc.user_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGiftCardAction(gc, 'verified')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Verify & Upgrade VIP
                          </button>
                          <button
                            onClick={() => handleGiftCardAction(gc, 'failed')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 cursor-pointer"
                          >
                            Mark Invalid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMER ACCOUNTS & DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients by name, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Client Profile
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3.5">Client Information</th>
                    <th className="p-3.5">Accounts & Balance</th>
                    <th className="p-3.5">Tier & KYC</th>
                    <th className="p-3.5">Security PINs</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.map(p => {
                    const userAccs = accounts.filter(a => a.user_id === p.id);
                    const totalBal = userAccs.reduce((sum, a) => sum + (a.balance || 0), 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt={p.full_name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                                  {p.full_name?.slice(0, 2) || 'CL'}
                                </div>
                              )}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                p.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{p.full_name}</p>
                              <p className="text-slate-500 text-[11px] truncate">{p.email}</p>
                              <p className="font-mono text-[10px] text-slate-400">ID: {p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-slate-900">
                            ${totalBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-slate-500 text-[11px]">{userAccs.length} accounts</p>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.tier === 'personal_admin' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : p.tier === 'vip' 
                                ? 'bg-amber-100 text-amber-800' 
                                : p.tier === 'premium' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-blue-50 text-blue-700'
                          }`}>
                            {p.tier === 'personal_admin' ? 'Personal Admin' : p.tier}
                          </span>
                          <span className={`block mt-1 text-[10px] font-semibold ${
                            p.kyc_status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            KYC: {p.kyc_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          <p>Login: {p.login_pin || '2008'}</p>
                          <p>Tx PIN: {p.transaction_pin || '4321'}</p>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const userAccs = accounts.filter(a => a.user_id === p.id);
                                const targetAcc = userAccs[0] || null;
                                if (targetAcc) {
                                  setBalanceModal({
                                    profile: p,
                                    account: targetAcc,
                                    targetBalance: targetAcc.balance.toString(),
                                    mode: 'exact',
                                    adjustAmount: '1000',
                                    reason: `Administrative Balance Adjustment on ${targetAcc.label}`
                                  });
                                } else {
                                  setEditingProfile(p);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 border border-emerald-200"
                              title="Set Balance Instantly"
                            >
                              <DollarSign className="w-3 h-3 text-emerald-600" /> Set Balance
                            </button>
                            <button
                              onClick={() => setEditingProfile(p)}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                              title="Edit Details & Balance"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleToggleSuspend(p)}
                              className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                              title={p.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProfileToDelete(p)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BALANCE ADJUSTER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'adjuster' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-sans text-xl font-bold text-slate-900">
                    Direct Ledger Balance Adjuster
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set, credit, or debit any user's balance. Changes sync instantly across all devices.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-5">
            {/* Customer Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Client Account
              </label>
              <select
                value={adjustUserId}
                onChange={(e) => {
                  setAdjustUserId(e.target.value);
                  const userAccs = accounts.filter(a => a.user_id === e.target.value);
                  if (userAccs.length > 0) setAdjustAccountId(userAccs[0].id);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.email}) — ID: {p.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Ledger Account
              </label>
              <select
                value={adjustAccountId}
                onChange={(e) => setAdjustAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {accounts
                  .filter(a => a.user_id === adjustUserId)
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.label} ({a.account_number}) — Current: ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </option>
                  ))}
              </select>
            </div>

            {/* Action Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Adjustment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('exact')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'exact'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Set Exact Balance
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Credit (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'debit'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Debit (-)
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {adjustType === 'exact' ? 'Target New Balance (USD)' : 'Adjustment Amount (USD)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">$</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {adjustType === 'exact' ? (
                  ['0', '1000', '10000', '50000', '100000', '500000', '1000000', '6567000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustAmount(val)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer"
                    >
                      ${parseInt(val).toLocaleString()}
                    </button>
                  ))
                ) : (
                  ['500', '1000', '5000', '10000', '50000', '100000', '1000000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustAmount(val)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer"
                    >
                      +${parseInt(val).toLocaleString()}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Audit Reason / Transaction Note
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Administrative Balance Adjustment, Wire Deposit"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isAdjusting}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAdjusting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying & Syncing to Cloud...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Confirm & Sync {adjustType === 'exact' ? `Balance to $${parseFloat(adjustAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${adjustType.toUpperCase()} of $${adjustAmount || '0.00'}`}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WIRE & TRANSFER CLEARING */}
      {/* ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Bank Wire & Outgoing Transfer Ledger ({transfers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Reference / Date</th>
                  <th className="p-3">Sender ID</th>
                  <th className="p-3">Recipient Details</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">No transfer records in database.</td>
                  </tr>
                ) : (
                  transfers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-mono font-bold text-slate-800">{t.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{t.user_id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{t.recipient_name}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{t.recipient_account}</p>
                      </td>
                      <td className="p-3 capitalize font-medium text-slate-700">{t.type}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">${t.amount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          t.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {t.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(t, 'completed')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {t.status !== 'failed' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(t, 'failed')}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LOANS UNDERWRITING */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Credit Lines & Loan Underwriting Queue ({loans.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Loan ID / Date</th>
                  <th className="p-3">Applicant ID</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Term & Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">No submitted loan applications.</td>
                  </tr>
                ) : (
                  loans.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-mono font-bold text-slate-800">{l.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(l.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{l.user_id}</td>
                      <td className="p-3 font-medium text-slate-800">{l.purpose}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">${l.amount.toLocaleString()}</td>
                      <td className="p-3 text-slate-600">{l.term_months} mo @ {l.interest_rate}%</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          l.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          l.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleLoanAction(l.id, 'approved')}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLoanAction(l.id, 'rejected')}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CARDS MANAGEMENT */}
      {activeTab === 'cards' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Issued Physical & Virtual Debit Cards ({cards.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Card Number</th>
                  <th className="p-3">Cardholder</th>
                  <th className="p-3">Expires / CVC</th>
                  <th className="p-3">Spending Limit</th>
                  <th className="p-3">Security State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900">{c.number}</td>
                    <td className="p-3 font-medium text-slate-800">{c.holder_name}</td>
                    <td className="p-3 font-mono text-slate-500">{c.expiry} • {c.cvc}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">${c.balance_limit.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.is_frozen ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {c.is_frozen ? 'Frozen' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleCardFreeze(c)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          c.is_frozen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.is_frozen ? 'Unfreeze Card' : 'Freeze Card'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GIFT VOUCHERS */}
      {activeTab === 'gift_cards' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submitted Gift Cards for VIP Tier Upgrades ({giftCards.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Voucher Code</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {giftCards.map(gc => (
                  <tr key={gc.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 uppercase">{gc.type}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{gc.code}</td>
                    <td className="p-3 font-mono text-slate-700">${gc.amount}</td>
                    <td className="p-3 font-mono text-slate-500">{gc.user_id}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        gc.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                        gc.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {gc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleGiftCardAction(gc, 'verified')}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Verify & Upgrade
                        </button>
                        <button
                          onClick={() => handleGiftCardAction(gc, 'failed')}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                        >
                          Invalid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: LIVE SUPPORT DESK */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Customer Support & Security Communications ({chats.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review user inquiries and send administrative security notifications directly to client inboxes.
            </p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {chats.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-xs">No active customer inquiries.</p>
            ) : (
              chats.map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 capitalize">
                      {c.sender === 'user' ? `User ${c.user_id}` : 'Admin Agent'}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Platform Configuration & Global Branding
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize website name, bank logo, human support email, and voucher clearing destinations.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-semibold text-emerald-700 self-start sm:self-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cross-Device Auto-Sync
            </div>
          </div>

          {/* LIVE BRANDING PREVIEW CONTAINER */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Live Brand & Logo Visual Preview
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Light Mode Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Header & Light Surface</span>
                <BankLogo 
                  size="md" 
                  name={siteNameInput} 
                  logoUrl={logoModeInput === 'custom' ? logoUrlInput : undefined} 
                  variant="navy" 
                />
              </div>

              {/* Dark Navy Preview */}
              <div className="p-4 rounded-2xl bg-[#0a1e3b] border border-blue-900/50 flex flex-col items-center justify-center text-center space-y-2 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300/60">Dark Navy Navbar</span>
                <BankLogo 
                  size="md" 
                  name={siteNameInput} 
                  logoUrl={logoModeInput === 'custom' ? logoUrlInput : undefined} 
                  variant="navy" 
                  textClassName="text-white" 
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Website Brand Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Banking Platform Brand Name
              </label>
              <input
                type="text"
                required
                value={siteNameInput}
                onChange={(e) => setSiteNameInput(e.target.value)}
                placeholder="e.g., SmartVault, Apex Federal, Horizon Trust"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400">
                This name immediately updates the header navbar, footer, statements, emails, login screen, and page titles across all connected user devices.
              </p>
            </div>

            {/* Human Support Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Human Support Email Address
                </label>
                <span className="text-[10px] text-blue-600 font-semibold">Replaces all hardcoded support emails</span>
              </div>
              <input
                type="email"
                required
                value={supportEmailInput}
                onChange={(e) => setSupportEmailInput(e.target.value)}
                placeholder="e.g., customersupport056@gmail.com or support@yourbank.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                The AI Agent chat assistant, support action buttons, and customer help triggers will route directly to this address.
              </p>
            </div>

            {/* Platform Logo Customization */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Website & Bank Logo Branding
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLogoModeInput('default');
                      setLogoUrlInput('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      logoModeInput === 'default' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Default Vector Mark
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoModeInput('custom')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      logoModeInput === 'custom' 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Custom Logo
                  </button>
                </div>
              </div>

              {logoModeInput === 'custom' && (
                <div className="space-y-3 pt-2 border-t border-slate-200/80">
                  {/* File Upload / Image Picker */}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-100/50 cursor-pointer transition-colors text-slate-600">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-xs">
                        {isUploadingLogo ? 'Processing image...' : 'Upload Logo Image (PNG, SVG, JPG)'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                      />
                    </label>
                  </div>

                  {/* Or Direct Image URL */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-600 text-[10px] uppercase">
                      Or Paste Direct Logo Image URL
                    </label>
                    <input
                      type="url"
                      value={logoUrlInput}
                      onChange={(e) => {
                        setLogoUrlInput(e.target.value);
                        setLogoModeInput('custom');
                      }}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Gift Card Receiver Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Gift Card Receiver Email (Voucher Settlement Target)
              </label>
              <input
                type="email"
                required
                value={giftEmailInput}
                onChange={(e) => setGiftEmailInput(e.target.value)}
                placeholder="admin001@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Automated voucher codes submitted during PIN upgrade flows are dispatched here.
              </p>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Save Global Settings & Broadcast
            </button>
          </form>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setEditingProfile(null)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full z-10 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Edit Client: {editingProfile.full_name}</h3>
              <button onClick={() => setEditingProfile(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Profile Picture Management */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Profile Picture / Avatar</label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Syncs across all devices
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {editingProfile.avatar_url ? (
                      <img
                        src={editingProfile.avatar_url}
                        alt={editingProfile.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center uppercase shadow-md">
                        {editingProfile.full_name?.slice(0, 2) || 'CL'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer border border-white"
                      title="Upload New Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImageFile(file);
                          setEditingProfile({ ...editingProfile, avatar_url: compressed });
                          showToast('Photo Ready', 'Image loaded and ready to save.', 'info');
                        } catch (err: any) {
                          showToast('Upload Error', err.message || 'Could not load photo.', 'error');
                        }
                      }}
                    />
                    
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        Upload Photo
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newAvatar = generateRandomAvatar(editingProfile.full_name + Math.random());
                          setEditingProfile({ ...editingProfile, avatar_url: newAvatar });
                          showToast('Avatar Generated', 'Assigned dynamic client avatar.', 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        Random Avatar
                      </button>

                      {editingProfile.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setEditingProfile({ ...editingProfile, avatar_url: '' })}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Or paste direct image URL (https://...)"
                        value={editingProfile.avatar_url || ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, avatar_url: e.target.value })}
                        className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-[11px] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editingProfile.full_name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingProfile.email}
                  onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingProfile.login_pin || '2008'}
                    onChange={(e) => setEditingProfile({ ...editingProfile, login_pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingProfile.transaction_pin || '4321'}
                    onChange={(e) => setEditingProfile({ ...editingProfile, transaction_pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Tier</label>
                  <select
                    value={editingProfile.tier}
                    onChange={(e) => {
                      const newTier = e.target.value as any;
                      setEditingProfile({ 
                        ...editingProfile, 
                        tier: newTier,
                        role: newTier === 'personal_admin' ? 'personal_admin' : editingProfile.role
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-semibold"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP Private</option>
                    <option value="personal_admin">Personal Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KYC Status</label>
                  <select
                    value={editingProfile.kyc_status}
                    onChange={(e) => setEditingProfile({ ...editingProfile, kyc_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-semibold"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Client Ledger Accounts & Balance Control */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">Ledger Accounts & Balance</label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Instant Cloud Sync
                  </span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {accounts.filter(a => a.user_id === editingProfile.id).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No ledger accounts registered for this profile.</p>
                  ) : (
                    accounts.filter(a => a.user_id === editingProfile.id).map(acc => (
                      <div key={acc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div>
                          <p className="font-semibold text-slate-900">{acc.label}</p>
                          <p className="font-mono text-[10px] text-slate-500">{acc.account_number} • <span className="font-bold text-emerald-700">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBalanceModal({
                              profile: editingProfile,
                              account: acc,
                              targetBalance: acc.balance.toString(),
                              mode: 'exact',
                              adjustAmount: '1000',
                              reason: `Administrative Balance Adjustment on ${acc.label}`
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          Set Balance
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setProfileToDelete(editingProfile)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Profile
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalRole = editingProfile.tier === 'personal_admin' ? 'personal_admin' : editingProfile.role;
                    dbAPI.adminSaveProfile({
                      ...editingProfile,
                      role: finalRole
                    });
                    showToast('Saved', `Client profile updated${editingProfile.tier === 'personal_admin' ? ' (Personal Admin access granted)' : ''}.`, 'success');
                    setEditingProfile(null);
                    reloadData();
                    refreshUserData();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsNewUserModalOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full z-10 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Create New Client Account</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Profile Picture Upload & Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Profile Photo / Avatar</label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time Cloud Sync
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {newUserState.avatar_url ? (
                      <img
                        src={newUserState.avatar_url}
                        alt={newUserState.full_name || 'Client'}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center uppercase shadow-md">
                        {newUserState.full_name?.slice(0, 2) || 'NEW'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer border border-white"
                      title="Upload Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={newFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImageFile(file);
                          setNewUserState({ ...newUserState, avatar_url: compressed });
                          showToast('Photo Loaded', 'Profile photo attached.', 'info');
                        } catch (err: any) {
                          showToast('Upload Error', err.message || 'Could not load photo.', 'error');
                        }
                      }}
                    />

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => newFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        Upload Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newAvatar = generateRandomAvatar(newUserState.full_name || 'avatar');
                          setNewUserState({ ...newUserState, avatar_url: newAvatar });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        Preset Avatar
                      </button>

                      {newUserState.avatar_url && (
                        <button
                          type="button"
                          onClick={() => setNewUserState({ ...newUserState, avatar_url: '' })}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Or direct image URL (https://...)"
                        value={newUserState.avatar_url || ''}
                        onChange={(e) => setNewUserState({ ...newUserState, avatar_url: e.target.value })}
                        className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-[11px] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={newUserState.full_name}
                  onChange={(e) => setNewUserState({ ...newUserState, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. client@domain.com"
                  value={newUserState.email}
                  onChange={(e) => setNewUserState({ ...newUserState, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Tier</label>
                <select
                  value={newUserState.tier}
                  onChange={(e) => setNewUserState({ ...newUserState, tier: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 uppercase font-semibold"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP Private</option>
                  <option value="personal_admin">Personal Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login PIN (4 digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newUserState.login_pin}
                    onChange={(e) => setNewUserState({ ...newUserState, login_pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newUserState.transaction_pin}
                    onChange={(e) => setNewUserState({ ...newUserState, transaction_pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newUserState.full_name || !newUserState.email) {
                    showToast('Required', 'Name and email are required.', 'error');
                    return;
                  }
                  const newId = `user-${Math.random().toString(36).substr(2, 7)}`;
                  const isPersonalAdmin = newUserState.tier === 'personal_admin';
                  const avatar = newUserState.avatar_url?.trim() || generateRandomAvatar(newUserState.full_name);
                  const fullProfile: Profile = {
                    id: newId,
                    full_name: newUserState.full_name,
                    email: newUserState.email,
                    avatar_url: avatar,
                    role: isPersonalAdmin ? 'personal_admin' : 'user',
                    tier: newUserState.tier as any || 'standard',
                    status: 'active',
                    kyc_status: 'approved',
                    login_pin: newUserState.login_pin || '2008',
                    transaction_pin: newUserState.transaction_pin || '4321',
                    created_at: new Date().toISOString()
                  };
                  dbAPI.adminSaveProfile(fullProfile);

                  // Create initial accounts
                  const initialAcc: Account = {
                    id: `acc-usd-${newId}`,
                    user_id: newId,
                    type: 'usd',
                    balance: 1000.00,
                    label: 'Everyday Checking',
                    currency: 'USD',
                    account_number: `1029${Math.floor(100000 + Math.random() * 900000)}`
                  };
                  dbAPI.adminSaveAccount(initialAcc);

                  showToast('Created', 'Client registered with initial checking account.', 'success');
                  setIsNewUserModalOpen(false);
                  reloadData();
                  refreshUserData();
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Create Client Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setProfileToDelete(null)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full z-10 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Client Account</h3>
                <p className="text-[11px] text-slate-500">Permanent administrative action</p>
              </div>
            </div>

            <div className="space-y-2 text-slate-600 text-xs">
              <p>
                Are you sure you want to permanently delete the account for:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-sm">{profileToDelete.full_name}</p>
                <p className="font-mono text-slate-600">{profileToDelete.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    Tier: {profileToDelete.tier}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">ID: {profileToDelete.id}</span>
                </div>
              </div>
              <p className="text-rose-600 font-medium pt-1">
                This will immediately purge all checking and savings balances, transaction histories, debit cards, and notifications associated with this user.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProfile}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SET ACCOUNT BALANCE (REAL-TIME CLOUD SYNC) */}
      {/* ========================================================================= */}
      {balanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-sans text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Set Account Balance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {balanceModal.profile.full_name} ({balanceModal.profile.email})
                </p>
              </div>
              <button
                onClick={() => setBalanceModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceModal} className="space-y-4 pt-4">
              {/* Account Info Card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Ledger</span>
                  <span className="text-xs font-bold text-slate-800">{balanceModal.account.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 block">{balanceModal.account.account_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Balance</span>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    ${balanceModal.account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adjustment Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBalanceModal({ ...balanceModal, mode: 'exact' })}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      balanceModal.mode === 'exact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Exact Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceModal({ ...balanceModal, mode: 'credit' })}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      balanceModal.mode === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    + Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceModal({ ...balanceModal, mode: 'debit' })}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      balanceModal.mode === 'debit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
                    }`}
                  >
                    - Debit
                  </button>
                </div>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {balanceModal.mode === 'exact' ? 'New Target Balance ($ USD)' : balanceModal.mode === 'credit' ? 'Credit Amount (+ $ USD)' : 'Debit Amount (- $ USD)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">$</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={balanceModal.mode === 'exact' ? balanceModal.targetBalance : balanceModal.adjustAmount}
                    onChange={(e) => {
                      if (balanceModal.mode === 'exact') {
                        setBalanceModal({ ...balanceModal, targetBalance: e.target.value });
                      } else {
                        setBalanceModal({ ...balanceModal, adjustAmount: e.target.value });
                      }
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quick Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {balanceModal.mode === 'exact' ? (
                    [
                      { label: '$0.00', val: '0' },
                      { label: '$1,000', val: '1000' },
                      { label: '$10,000', val: '10000' },
                      { label: '$50,000', val: '50000' },
                      { label: '$100,000', val: '100000' },
                      { label: '$500,000', val: '500000' },
                      { label: '$1,000,000', val: '1000000' },
                      { label: '$6,567,000', val: '6567000' },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setBalanceModal({ ...balanceModal, targetBalance: preset.val })}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold cursor-pointer transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))
                  ) : (
                    [
                      { label: '+$500', val: '500' },
                      { label: '+$1,000', val: '1000' },
                      { label: '+$5,000', val: '5000' },
                      { label: '+$10,000', val: '10000' },
                      { label: '+$50,000', val: '50000' },
                      { label: '+$100,000', val: '100000' },
                      { label: '+$1,000,000', val: '1000000' },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setBalanceModal({ ...balanceModal, adjustAmount: preset.val })}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold cursor-pointer transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Projected Balance Display */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <span className="font-semibold">Projected New Balance:</span>
                <span className="font-mono font-bold text-sm text-emerald-800">
                  ${(() => {
                    if (balanceModal.mode === 'exact') {
                      const num = parseFloat(balanceModal.targetBalance);
                      return isNaN(num) ? '0.00' : num.toLocaleString(undefined, { minimumFractionDigits: 2 });
                    } else if (balanceModal.mode === 'credit') {
                      const add = parseFloat(balanceModal.adjustAmount) || 0;
                      return (balanceModal.account.balance + add).toLocaleString(undefined, { minimumFractionDigits: 2 });
                    } else {
                      const sub = parseFloat(balanceModal.adjustAmount) || 0;
                      return Math.max(0, balanceModal.account.balance - sub).toLocaleString(undefined, { minimumFractionDigits: 2 });
                    }
                  })()}
                </span>
              </div>

              {/* Audit Note / Reason */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={balanceModal.reason}
                  onChange={(e) => setBalanceModal({ ...balanceModal, reason: e.target.value })}
                  placeholder="e.g. Administrative Ledger Update"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Live sync notice */}
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Syncs immediately to the user's phone / device in real time via Firestore.</span>
              </p>

              {/* Submit & Cancel */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Save & Sync Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
