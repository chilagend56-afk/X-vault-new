import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppContext';
import { neoLocalStorage, dbAPI } from '../lib/supabase';
import { Account, Transaction, GiftCardRecord } from '../types';
import { 
  Database, 
  Activity, 
  Gift, 
  Settings as SettingsIcon, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Send, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  Sliders,
  DollarSign,
  Edit3,
  Lock,
  Clock,
  CheckCircle2,
  FileText,
  Trash2,
  User,
  Shuffle,
  Search,
  Building2,
  Sparkles,
  Wallet
} from 'lucide-react';
import {
  REAL_INJECT_FUNDS_PRESETS,
  REAL_SEND_FUNDS_PRESETS,
  generateRandomPersonTransaction,
  CounterpartyPreset
} from '../data/randomCounterparties';

export const PersonalAdminPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { user, showToast, refreshUserData, dbUpdatedTimestamp } = useApp();
  const [activeSegment, setActiveSegment] = useState<'profile' | 'accounts' | 'transactions' | 'gift_cards' | 'chat_history' | 'settings'>('accounts');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCardRecord[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  
  // Transaction sub-tab: 'inject' (Inbound Deposits) | 'send' (Outbound Transfers) | 'history' (Ledger List)
  const [txSubTab, setTxSubTab] = useState<'inject' | 'send' | 'history'>('inject');
  const [txFilter, setTxFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [txSearch, setTxSearch] = useState('');

  // Custom Transaction Modal / Form states
  const [isCustomTxOpen, setIsCustomTxOpen] = useState(false);
  const [txAccountId, setTxAccountId] = useState('');
  const [txType, setTxType] = useState<'deposit' | 'withdrawal' | 'send' | 'receive'>('deposit');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('Deposit');
  const [txRecipient, setTxRecipient] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 16));

  // Edit Account Number Modal
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editAccNum, setEditAccNum] = useState('');
  const [editAccLabel, setEditAccLabel] = useState('');

  const [newPin, setNewPin] = useState('');
  const [newTxPin, setNewTxPin] = useState('');

  const loadData = () => {
    if (!user) return;
    const currentAccs = neoLocalStorage.getAccounts(user.id, user.currency);
    setAccounts(currentAccs);
    if (!txAccountId && currentAccs.length > 0) {
      setTxAccountId(currentAccs[0].id);
    }
    setTransactions(neoLocalStorage.getTransactions(user.id));
    setGiftCards(dbAPI.getGiftCards().filter(g => g.user_id === user.id));
    setChats(dbAPI.getAllChatMessages());
  };

  useEffect(() => {
    loadData();
  }, [user?.id, dbUpdatedTimestamp]);

  // Access validation: Personal Admins and Super Admins
  const isAuthorized = user && (
    user.role === 'personal_admin' || 
    user.tier === 'personal_admin' || 
    user.email === 'georgelarry34@gmail.com' || 
    user.email === 'Stwilliams66@gmail.com' || 
    user.email === 'Stephenniese6921@gmail.com' ||
    user.role === 'admin' ||
    user.email === 'admin001@gmail.com' ||
    user.email === 'customersupport056@gmail.com'
  );

  if (!isAuthorized) {
    return (
      <div className="p-12 text-center bg-[#0d0e15] text-white min-h-[500px] flex flex-col items-center justify-center rounded-2xl">
        <Shield className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Personal Executive Portal Restricted</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md">This dedicated override console is configured exclusively for authorized account executives.</p>
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPin.length < 4) {
      showToast('Validation Error', 'PIN must be at least 4 digits.', 'error');
      return;
    }
    dbAPI.updatePassword(user.id, newPin);
    localStorage.setItem('user_session_pin', newPin);
    refreshUserData();
    showToast('Success', 'Login PIN updated and synced across all devices.', 'success');
    setNewPin('');
  };

  const handleUpdateTxPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newTxPin.length < 4) {
      showToast('Validation Error', 'Transaction PIN must be at least 4 digits.', 'error');
      return;
    }
    const profiles = neoLocalStorage.getProfiles();
    const idx = profiles.findIndex(p => p.id === user.id);
    if (idx !== -1) {
      profiles[idx].transaction_pin = newTxPin;
      neoLocalStorage.setProfiles(profiles);
      refreshUserData();
      showToast('Success', 'Transaction PIN updated and synced.', 'success');
      setNewTxPin('');
    }
  };

  const handleAddCurrencyLedger = (currencyCode: 'EUR' | 'GBP' | 'CAD') => {
    if (!user) return;
    const exists = accounts.find(a => a.currency === currencyCode);
    if (exists) {
      showToast('Notice', `A ${currencyCode} ledger already exists.`, 'info');
      return;
    }

    const typeStr = currencyCode.toLowerCase();
    const newAcc: Account = {
      id: `acc-${typeStr}-${user.id}`,
      user_id: user.id,
      account_number: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      type: typeStr as any,
      balance: 0,
      currency: currencyCode,
      label: `${currencyCode} Checking Wallet`
    };

    const updated = [...accounts, newAcc];
    neoLocalStorage.setAccounts(user.id, updated);
    setAccounts(updated);
    showToast('Ledger Created', `${currencyCode} account provisioned and active on all devices.`, 'success');
    refreshUserData();
  };

  const handleUpdateAccountBalance = (accountId: string, newBalance: number) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const updatedAcc: Account = { ...acc, balance: newBalance };
    dbAPI.adminSaveAccount(updatedAcc, 'Personal Admin Balance Override', true);
    loadData();
    refreshUserData();
    showToast('Balance Synchronized', `${acc.label} balance updated to $${newBalance.toLocaleString()} and synced to database.`, 'success');
  };

  const handleSaveAccountCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccId) return;
    const target = accounts.find(a => a.id === editingAccId);
    if (!target) return;

    const updatedAcc: Account = {
      ...target,
      account_number: editAccNum.trim() || target.account_number,
      label: editAccLabel.trim() || target.label
    };

    const updatedList = accounts.map(a => a.id === editingAccId ? updatedAcc : a);
    neoLocalStorage.setAccounts(user.id, updatedList);
    setAccounts(updatedList);
    setEditingAccId(null);
    refreshUserData();
    showToast('Account Details Saved', 'Account number and label updated.', 'success');
  };

  const handleCreateCustomTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedAmount = parseFloat(txAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Validation Error', 'Please enter a valid positive amount.', 'error');
      return;
    }

    const targetAccount = accounts.find(a => a.id === txAccountId) || accounts[0];
    if (!targetAccount) {
      showToast('Error', 'Target account not found.', 'error');
      return;
    }

    const isCredit = txType === 'deposit' || txType === 'receive';
    const txRecord = {
      account_id: targetAccount.id,
      amount: parsedAmount,
      type: txType,
      category: txCategory || (isCredit ? 'Deposit' : 'Withdrawal'),
      description: txDescription.trim() || (isCredit ? `Funds Credited $${parsedAmount.toLocaleString()}` : `Payment Debited $${parsedAmount.toLocaleString()}`),
      status: 'completed' as const,
      recipient: txRecipient.trim() || undefined,
      currency: targetAccount.currency,
      created_at: txDate ? new Date(txDate).toISOString() : new Date().toISOString()
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    setIsCustomTxOpen(false);
    setTxAmount('');
    setTxDescription('');
    setTxRecipient('');
    showToast('Transaction Injected', `Transaction successfully logged and balance updated.`, 'success');
  };

  const handleQuickInject = (amount: number, type: 'deposit' | 'withdrawal', category: string, desc: string) => {
    if (!user) return;
    const targetAccount = accounts[0];
    if (!targetAccount) {
      showToast('Error', 'No account found.', 'error');
      return;
    }

    const txRecord = {
      account_id: targetAccount.id,
      amount: amount,
      type: type,
      category: category,
      description: desc,
      status: 'completed' as const,
      currency: targetAccount.currency
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    showToast('Action Completed', `${type === 'deposit' ? '+' : '-'}$${amount.toLocaleString()} ${category} injected.`, 'success');
  };

  const handleInjectPreset = (preset: CounterpartyPreset, customAmount?: number) => {
    if (!user) return;
    const targetAccount = accounts[0];
    if (!targetAccount) {
      showToast('Error', 'No account found.', 'error');
      return;
    }
    const amt = customAmount && customAmount > 0 ? customAmount : preset.defaultAmount;
    const txRecord = {
      account_id: targetAccount.id,
      amount: amt,
      type: 'deposit' as const,
      category: preset.category,
      description: preset.description,
      recipient: preset.name,
      status: 'completed' as const,
      currency: targetAccount.currency
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    showToast('Funds Injected', `+$${amt.toLocaleString()} received from ${preset.name}.`, 'success');
  };

  const handleSendPreset = (preset: CounterpartyPreset, customAmount?: number) => {
    if (!user) return;
    const targetAccount = accounts[0];
    if (!targetAccount) {
      showToast('Error', 'No account found.', 'error');
      return;
    }
    const amt = customAmount && customAmount > 0 ? customAmount : preset.defaultAmount;
    const txRecord = {
      account_id: targetAccount.id,
      amount: amt,
      type: 'send' as const,
      category: preset.category,
      description: preset.description,
      recipient: preset.name,
      status: 'completed' as const,
      currency: targetAccount.currency
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    showToast('Funds Sent', `-$${amt.toLocaleString()} transferred to ${preset.name}.`, 'success');
  };

  const handleRandomInjectFunds = () => {
    if (!user) return;
    const targetAccount = accounts[0];
    if (!targetAccount) {
      showToast('Error', 'No account found.', 'error');
      return;
    }
    const rand = generateRandomPersonTransaction('deposit', targetAccount.currency);
    const txRecord = {
      account_id: targetAccount.id,
      amount: rand.amount,
      type: 'deposit' as const,
      category: rand.category,
      description: rand.description,
      recipient: rand.recipient,
      status: 'completed' as const,
      currency: targetAccount.currency,
      created_at: rand.created_at
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    showToast('Random Inbound Injected', `+$${rand.amount.toLocaleString()} received from ${rand.recipient}.`, 'success');
  };

  const handleRandomSendFunds = () => {
    if (!user) return;
    const targetAccount = accounts[0];
    if (!targetAccount) {
      showToast('Error', 'No account found.', 'error');
      return;
    }
    const rand = generateRandomPersonTransaction('send', targetAccount.currency);
    const txRecord = {
      account_id: targetAccount.id,
      amount: rand.amount,
      type: 'send' as const,
      category: rand.category,
      description: rand.description,
      recipient: rand.recipient,
      status: 'completed' as const,
      currency: targetAccount.currency,
      created_at: rand.created_at
    };

    dbAPI.addTransaction(user.id, txRecord);
    loadData();
    refreshUserData();
    showToast('Random Transfer Logged', `-$${rand.amount.toLocaleString()} sent to ${rand.recipient}.`, 'success');
  };

  const handleDeleteTransaction = (txId: string, desc: string) => {
    if (!user) return;
    dbAPI.deleteTransaction(user.id, txId);
    loadData();
    refreshUserData();
    showToast('Transaction Removed', `Record "${desc.slice(0, 24)}..." deleted from ledger history.`, 'info');
  };

  const handleFillCustomFormWithPreset = (preset: CounterpartyPreset) => {
    setTxType(preset.type);
    setTxAmount(preset.defaultAmount.toString());
    setTxCategory(preset.category);
    setTxDescription(preset.description);
    setTxRecipient(preset.name);
  };

  const handleRandomizeCustomForm = () => {
    const isDeposit = Math.random() > 0.4;
    const rand = generateRandomPersonTransaction(isDeposit ? 'deposit' : 'send');
    setTxType(isDeposit ? 'deposit' : 'send');
    setTxAmount(rand.amount.toString());
    setTxCategory(rand.category);
    setTxDescription(rand.description);
    setTxRecipient(rand.recipient);
    setTxDate(rand.created_at.slice(0, 16));
  };

  const handleUpdateGiftCardStatus = (g: GiftCardRecord, status: 'verified' | 'failed') => {
    const updated = { ...g, status };
    dbAPI.adminSaveGiftCard(updated);
    if (status === 'verified' && g.status !== 'verified') {
      const matchAcc = accounts[0];
      if (matchAcc) {
        handleUpdateAccountBalance(matchAcc.id, matchAcc.balance + (g.amount || 100));
      }
    }
    loadData();
    showToast('Voucher Status', `Voucher marked as ${status}.`, 'success');
  };

  // Modern Indigo / Dark Slate Theme styling
  const T = {
    btnInactive: "flex items-center gap-3 p-3.5 text-left rounded-xl text-xs font-semibold tracking-wide transition-all bg-[#1a1b26] text-[#8c91a0] hover:bg-[#202230] border border-transparent shadow-xs cursor-pointer",
    btnActive: "flex items-center gap-3 p-3.5 text-left rounded-xl text-xs font-semibold tracking-wide transition-all bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border border-indigo-400 shadow-md cursor-pointer",
    valueBox: "bg-[#14151f] p-4 border border-[#2d2f40] rounded-xl font-mono text-sm text-[#e0e2eb]",
    label: "text-[10px] text-[#8c91a0] font-sans font-medium uppercase tracking-widest block mb-1.5"
  };

  return (
    <div className="min-h-screen bg-[#0d0e15] text-[#e0e2eb] p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1f212f] border border-[#2d2f40] rounded-3xl p-5 sm:p-6 mb-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-indigo-100">
                  {user.full_name}'s Executive Portal
                </h1>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CLOUD SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-indigo-300/70 mt-0.5 font-mono tracking-wider">Direct Database Overrides & Multi-Device Synchronization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => {
                refreshUserData();
                loadData();
                showToast('Sync Check', 'Fetched latest state from database.', 'info');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#14151f] border border-[#2d2f40] text-xs text-[#8c91a0] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Now
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-semibold shadow-md transition cursor-pointer"
            >
              Return to Bank
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <button 
              onClick={() => setActiveSegment('accounts')}
              className={activeSegment === 'accounts' ? T.btnActive : T.btnInactive}
            >
              <Database className="w-4 h-4" /> Account Balances
            </button>
            <button 
              onClick={() => setActiveSegment('transactions')}
              className={activeSegment === 'transactions' ? T.btnActive : T.btnInactive}
            >
              <Activity className="w-4 h-4" /> Transactions Spoofer
            </button>
            <button 
              onClick={() => setActiveSegment('profile')}
              className={activeSegment === 'profile' ? T.btnActive : T.btnInactive}
            >
              <Shield className="w-4 h-4" /> Profile & Identity
            </button>
            <button 
              onClick={() => setActiveSegment('gift_cards')}
              className={activeSegment === 'gift_cards' ? T.btnActive : T.btnInactive}
            >
              <Gift className="w-4 h-4" /> Gift Card Vouchers
            </button>
            <button 
              onClick={() => setActiveSegment('chat_history')}
              className={activeSegment === 'chat_history' ? T.btnActive : T.btnInactive}
            >
              <Send className="w-4 h-4" /> Chat Intercepts
            </button>
            <button 
              onClick={() => setActiveSegment('settings')}
              className={activeSegment === 'settings' ? T.btnActive : T.btnInactive}
            >
              <SettingsIcon className="w-4 h-4" /> Security Credentials
            </button>
          </div>

          {/* Main Content View */}
          <div className="md:col-span-9 bg-[#1f212f] border border-[#2d2f40] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* SEGMENT: ACCOUNTS & BALANCES */}
            {activeSegment === 'accounts' && (
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#2d2f40] pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">Real-Time Ledger Balances</h3>
                    <p className="text-xs text-[#8c91a0]">Type any amount and press Tab or click away to sync immediately across all devices.</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => handleAddCurrencyLedger('EUR')} className="bg-[#14151f] hover:bg-indigo-500/20 text-[#e0e2eb] border border-[#2d2f40] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                      + EUR
                    </button>
                    <button onClick={() => handleAddCurrencyLedger('GBP')} className="bg-[#14151f] hover:bg-indigo-500/20 text-[#e0e2eb] border border-[#2d2f40] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                      + GBP
                    </button>
                    <button onClick={() => handleAddCurrencyLedger('CAD')} className="bg-[#14151f] hover:bg-indigo-500/20 text-[#e0e2eb] border border-[#2d2f40] px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer">
                      + CAD
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {accounts.map(acc => (
                    <div key={acc.id} className="bg-[#14151f] p-4 sm:p-5 border border-[#2d2f40] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-bold tracking-wide uppercase">{acc.label}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-semibold">{acc.currency}</span>
                          <button
                            onClick={() => {
                              setEditingAccId(acc.id);
                              setEditAccNum(acc.account_number);
                              setEditAccLabel(acc.label);
                            }}
                            className="text-xs text-[#8c91a0] hover:text-indigo-400 p-1 cursor-pointer"
                            title="Edit Account Number or Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs text-[#8c91a0] font-mono mt-0.5 block">Account Number: {acc.account_number}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c91a0] font-mono font-bold">$</span>
                          <input 
                            type="number" 
                            defaultValue={acc.balance}
                            key={`${acc.id}-${acc.balance}`}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val !== acc.balance) {
                                handleUpdateAccountBalance(acc.id, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(val)) {
                                  handleUpdateAccountBalance(acc.id, val);
                                }
                              }
                            }}
                            className="bg-[#1a1b26] border border-[#2d2f40] rounded-xl px-4 py-2.5 pl-7 text-base w-44 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-indigo-300 font-bold font-mono transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Account Customization Modal */}
                {editingAccId && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-[#1f212f] border border-[#2d2f40] p-6 rounded-2xl max-w-md w-full text-left">
                      <h4 className="text-base font-bold text-white mb-1">Customize Ledger Account</h4>
                      <p className="text-xs text-[#8c91a0] mb-4">Update the displayed account number and title for this ledger.</p>
                      
                      <form onSubmit={handleSaveAccountCustomization} className="space-y-3.5">
                        <div>
                          <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Account Label</label>
                          <input 
                            type="text" 
                            value={editAccLabel} 
                            onChange={(e) => setEditAccLabel(e.target.value)} 
                            className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Account Number</label>
                          <input 
                            type="text" 
                            value={editAccNum} 
                            onChange={(e) => setEditAccNum(e.target.value)} 
                            className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setEditingAccId(null)} 
                            className="px-4 py-2 rounded-xl text-xs text-[#8c91a0] hover:text-white bg-[#14151f] border border-[#2d2f40] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-2 rounded-xl text-xs text-white font-semibold bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEGMENT: TRANSACTIONS SPOOFER & INJECTOR */}
            {activeSegment === 'transactions' && (
              <div className="flex flex-col gap-5 relative z-10">
                {/* Header with Quick Actions */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3 border-b border-[#2d2f40] pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Transaction Injector & Spoofer</h3>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                        REALISTIC COUNTERPARTIES
                      </span>
                    </div>
                    <p className="text-xs text-[#8c91a0] mt-0.5">
                      Inject inbound credits or outbound debits with authentic counterparties, institutions, and ledger timestamps.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={handleRandomInjectFunds}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Instantly inject funds from a random real person"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Random Inbound (+)
                    </button>
                    <button 
                      onClick={handleRandomSendFunds}
                      className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs px-3 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Instantly record a payment to a random real person"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Random Outbound (-)
                    </button>
                    <button 
                      onClick={() => {
                        handleRandomizeCustomForm();
                        setIsCustomTxOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-indigo-400 font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Custom Transaction
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-2 p-1 bg-[#14151f] border border-[#2d2f40] rounded-2xl w-full sm:w-fit">
                  <button
                    onClick={() => setTxSubTab('inject')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      txSubTab === 'inject' 
                        ? 'bg-emerald-500 text-slate-950 shadow-md' 
                        : 'text-[#8c91a0] hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Inject Funds (Senders)
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      txSubTab === 'inject' ? 'bg-black/20 text-slate-950' : 'bg-[#1f212f] text-emerald-400'
                    }`}>
                      {REAL_INJECT_FUNDS_PRESETS.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTxSubTab('send')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      txSubTab === 'send' 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'text-[#8c91a0] hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Send Funds (Recipients)
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      txSubTab === 'send' ? 'bg-black/20 text-white' : 'bg-[#1f212f] text-rose-400'
                    }`}>
                      {REAL_SEND_FUNDS_PRESETS.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTxSubTab('history')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      txSubTab === 'history' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-[#8c91a0] hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Ledger History
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      txSubTab === 'history' ? 'bg-black/20 text-white' : 'bg-[#1f212f] text-indigo-400'
                    }`}>
                      {transactions.length}
                    </span>
                  </button>
                </div>

                {/* SUBTAB 1: INJECT FUNDS (REAL SENDERS) */}
                {txSubTab === 'inject' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#14151f] p-3.5 rounded-2xl border border-[#2d2f40]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white">Click any real person counterparty below to inject instant inbound credit:</span>
                      </div>
                      <div className="relative w-full sm:w-56">
                        <Search className="w-3.5 h-3.5 text-[#8c91a0] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          placeholder="Search real people..."
                          className="w-full bg-[#1a1b26] border border-[#2d2f40] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#8c91a0] outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                      {REAL_INJECT_FUNDS_PRESETS
                        .filter(p => !txSearch || p.name.toLowerCase().includes(txSearch.toLowerCase()) || p.roleOrNote.toLowerCase().includes(txSearch.toLowerCase()) || p.bankName.toLowerCase().includes(txSearch.toLowerCase()))
                        .map((preset) => {
                          const initials = preset.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                          return (
                            <div 
                              key={preset.id}
                              className="bg-[#14151f] hover:bg-[#181926] border border-[#2d2f40] hover:border-emerald-500/40 p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner"
                                    style={{ backgroundColor: preset.avatarColor }}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                                      {preset.name}
                                    </h4>
                                    <p className="text-[11px] text-[#8c91a0] line-clamp-1">{preset.roleOrNote}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-emerald-400/90 font-mono font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {preset.bankName}
                                      </span>
                                      <span className="text-[9px] bg-[#1f212f] text-[#8c91a0] px-1.5 py-0.5 rounded font-mono">
                                        {preset.method}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                                    +${preset.defaultAmount.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-[#8c91a0] uppercase">{preset.category}</span>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#8c91a0] bg-[#0d0e15] px-3 py-1.5 rounded-xl border border-[#2d2f40]/70 font-mono italic line-clamp-1">
                                "{preset.description}"
                              </p>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleInjectPreset(preset)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Inject +${preset.defaultAmount.toLocaleString()}
                                </button>
                                <button
                                  onClick={() => {
                                    handleFillCustomFormWithPreset(preset);
                                    setIsCustomTxOpen(true);
                                  }}
                                  className="bg-[#1f212f] hover:bg-[#252838] border border-[#2d2f40] text-[#8c91a0] hover:text-white text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                                  title="Customize Amount or Date"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: SEND FUNDS (REAL RECIPIENTS) */}
                {txSubTab === 'send' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#14151f] p-3.5 rounded-2xl border border-[#2d2f40]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-semibold text-white">Click any real person counterparty below to simulate outbound transfer payment:</span>
                      </div>
                      <div className="relative w-full sm:w-56">
                        <Search className="w-3.5 h-3.5 text-[#8c91a0] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          placeholder="Search real people..."
                          className="w-full bg-[#1a1b26] border border-[#2d2f40] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#8c91a0] outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                      {REAL_SEND_FUNDS_PRESETS
                        .filter(p => !txSearch || p.name.toLowerCase().includes(txSearch.toLowerCase()) || p.roleOrNote.toLowerCase().includes(txSearch.toLowerCase()) || p.bankName.toLowerCase().includes(txSearch.toLowerCase()))
                        .map((preset) => {
                          const initials = preset.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                          return (
                            <div 
                              key={preset.id}
                              className="bg-[#14151f] hover:bg-[#181926] border border-[#2d2f40] hover:border-rose-500/40 p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner"
                                    style={{ backgroundColor: preset.avatarColor }}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                                      {preset.name}
                                    </h4>
                                    <p className="text-[11px] text-[#8c91a0] line-clamp-1">{preset.roleOrNote}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-rose-400/90 font-mono font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {preset.bankName}
                                      </span>
                                      <span className="text-[9px] bg-[#1f212f] text-[#8c91a0] px-1.5 py-0.5 rounded font-mono">
                                        {preset.method}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-mono font-bold text-rose-400 block">
                                    -${preset.defaultAmount.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-[#8c91a0] uppercase">{preset.category}</span>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#8c91a0] bg-[#0d0e15] px-3 py-1.5 rounded-xl border border-[#2d2f40]/70 font-mono italic line-clamp-1">
                                "{preset.description}"
                              </p>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleSendPreset(preset)}
                                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Send -${preset.defaultAmount.toLocaleString()}
                                </button>
                                <button
                                  onClick={() => {
                                    handleFillCustomFormWithPreset(preset);
                                    setIsCustomTxOpen(true);
                                  }}
                                  className="bg-[#1f212f] hover:bg-[#252838] border border-[#2d2f40] text-[#8c91a0] hover:text-white text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                                  title="Customize Amount or Date"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: TRANSACTION HISTORY LEDGER */}
                {txSubTab === 'history' && (
                  <div className="flex flex-col gap-4">
                    {/* History Filters & Search */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#14151f] p-3 rounded-2xl border border-[#2d2f40]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setTxFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            txFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-[#8c91a0] hover:text-white'
                          }`}
                        >
                          All ({transactions.length})
                        </button>
                        <button
                          onClick={() => setTxFilter('inbound')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            txFilter === 'inbound' ? 'bg-emerald-600 text-white' : 'text-[#8c91a0] hover:text-emerald-400'
                          }`}
                        >
                          Inbound (+)
                        </button>
                        <button
                          onClick={() => setTxFilter('outbound')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            txFilter === 'outbound' ? 'bg-rose-600 text-white' : 'text-[#8c91a0] hover:text-rose-400'
                          }`}
                        >
                          Outbound (-)
                        </button>
                      </div>

                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 text-[#8c91a0] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          placeholder="Search counterparty, memo..."
                          className="w-full bg-[#1a1b26] border border-[#2d2f40] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#8c91a0] outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Transactions Table List */}
                    <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                      {transactions
                        .filter(tx => {
                          const isCredit = tx.type === 'deposit' || tx.type === 'receive';
                          if (txFilter === 'inbound' && !isCredit) return false;
                          if (txFilter === 'outbound' && isCredit) return false;
                          if (txSearch) {
                            const query = txSearch.toLowerCase();
                            const descMatch = tx.description.toLowerCase().includes(query);
                            const catMatch = tx.category.toLowerCase().includes(query);
                            const recMatch = tx.recipient?.toLowerCase().includes(query);
                            return descMatch || catMatch || recMatch;
                          }
                          return true;
                        })
                        .map(tx => {
                          const isCredit = tx.type === 'deposit' || tx.type === 'receive';
                          return (
                            <div 
                              key={tx.id} 
                              className="bg-[#14151f] p-4 border border-[#2d2f40] hover:border-[#383a4d] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors"
                            >
                              <div className="flex items-start sm:items-center gap-3.5">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCredit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-white font-medium">{tx.description}</span>
                                    {tx.recipient && (
                                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                        <User className="w-3 h-3" /> {tx.recipient}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-[#8c91a0] font-mono">
                                    <span>{new Date(tx.created_at).toLocaleString()}</span>
                                    <span>•</span>
                                    <span className="bg-[#1f212f] px-1.5 py-0.5 rounded text-[#b3b7c6]">{tx.category}</span>
                                    <span>•</span>
                                    <span className="uppercase text-slate-400 font-bold">{tx.status}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                                <span className={`text-sm font-bold font-mono ${
                                  isCredit ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {isCredit ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>

                                <button
                                  onClick={() => handleDeleteTransaction(tx.id, tx.description)}
                                  className="text-[#8c91a0] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Delete transaction record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {transactions.length === 0 && (
                        <div className="text-center p-12 text-[#8c91a0] text-xs uppercase tracking-widest bg-[#14151f] rounded-2xl border border-dashed border-[#2d2f40]">
                          No transactions recorded
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Transaction Modal */}
                {isCustomTxOpen && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[#1f212f] border border-[#2d2f40] p-6 rounded-3xl max-w-lg w-full text-left shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-white">Create Custom Transaction</h4>
                        <button 
                          type="button" 
                          onClick={handleRandomizeCustomForm}
                          className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-indigo-500/30 transition cursor-pointer"
                        >
                          <Shuffle className="w-3 h-3" /> Randomize Real Person
                        </button>
                      </div>
                      <p className="text-xs text-[#8c91a0] mb-4">Set exact transaction parameters, choose a real person preset, or customize freely.</p>

                      {/* Real People Preset Quick Select Chips */}
                      <div className="mb-4">
                        <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1.5">Quick Auto-Fill From Real People</label>
                        <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1 no-scrollbar">
                          {[...REAL_INJECT_FUNDS_PRESETS.slice(0, 4), ...REAL_SEND_FUNDS_PRESETS.slice(0, 4)].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleFillCustomFormWithPreset(p)}
                              className="text-[10px] bg-[#14151f] hover:bg-indigo-600/30 border border-[#2d2f40] text-[#c4c7d5] hover:text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <form onSubmit={handleCreateCustomTransaction} className="space-y-3.5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Account</label>
                            <select 
                              value={txAccountId} 
                              onChange={(e) => setTxAccountId(e.target.value)}
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            >
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.label} (${a.balance.toLocaleString()})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Type</label>
                            <select 
                              value={txType} 
                              onChange={(e) => setTxType(e.target.value as any)}
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            >
                              <option value="deposit">Deposit (+ Inbound Credit)</option>
                              <option value="receive">Receive (+ Inbound Credit)</option>
                              <option value="withdrawal">Withdrawal (- Debit)</option>
                              <option value="send">Transfer Out (- Outbound)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Amount ($)</label>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={txAmount} 
                              onChange={(e) => setTxAmount(e.target.value)} 
                              placeholder="e.g. 15000"
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Category</label>
                            <input 
                              type="text" 
                              value={txCategory} 
                              onChange={(e) => setTxCategory(e.target.value)} 
                              placeholder="e.g. Wire Transfer, Zelle"
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Description / Memo</label>
                          <input 
                            type="text" 
                            value={txDescription} 
                            onChange={(e) => setTxDescription(e.target.value)} 
                            placeholder="e.g. Domestic Wire Credit from Marcus A. Thorne"
                            className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Counterparty Person / Entity</label>
                            <input 
                              type="text" 
                              value={txRecipient} 
                              onChange={(e) => setTxRecipient(e.target.value)} 
                              placeholder="e.g. Marcus Aurelius Thorne"
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#8c91a0] uppercase font-bold block mb-1">Date & Time</label>
                            <input 
                              type="datetime-local" 
                              value={txDate} 
                              onChange={(e) => setTxDate(e.target.value)} 
                              className="w-full bg-[#14151f] border border-[#2d2f40] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3">
                          <button 
                            type="button" 
                            onClick={() => setIsCustomTxOpen(false)} 
                            className="px-4 py-2 rounded-xl text-xs text-[#8c91a0] hover:text-white bg-[#14151f] border border-[#2d2f40] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-2 rounded-xl text-xs text-white font-semibold bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                          >
                            Inject Transaction
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEGMENT: IDENTITY & PROFILE */}
            {activeSegment === 'profile' && (
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Identity State</h3>
                  <p className="text-xs text-[#8c91a0]">Core profile configuration and account privileges.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={T.valueBox}>
                    <span className={T.label}>Full Legal Name</span>
                    <span className="text-white text-sm font-semibold">{user.full_name}</span>
                  </div>
                  <div className={T.valueBox}>
                    <span className={T.label}>Email Gateway</span>
                    <span className="text-white text-sm font-semibold">{user.email}</span>
                  </div>
                  <div className={T.valueBox}>
                    <span className={T.label}>Account Tier</span>
                    <span className="text-indigo-400 font-bold">{user.tier?.toUpperCase()}</span>
                  </div>
                  <div className={T.valueBox}>
                    <span className={T.label}>KYC Status</span>
                    <span className={`font-bold ${user.kyc_status ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {user.kyc_status ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT: GIFT CARDS */}
            {activeSegment === 'gift_cards' && (
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Gift Card Voucher Intercepts</h3>
                  <p className="text-xs text-[#8c91a0]">Review, approve, or reject user-submitted voucher vouchers.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {giftCards.map((g) => (
                    <div key={g.id} className="bg-[#14151f] border border-[#2d2f40] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white capitalize">{g.type} Card</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            g.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            g.status === 'approved' || g.status === 'verified' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                        <div className="font-mono bg-[#0d0e15] px-2.5 py-1 rounded-lg border border-[#2d2f40] text-xs text-indigo-300 inline-block w-fit">
                          {g.code}
                        </div>
                        <span className="text-[10px] text-[#8c91a0]">Submitted: {new Date(g.created_at).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateGiftCardStatus(g, 'verified')}
                          disabled={g.status === 'verified' || g.status === 'approved'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1a1b26] border border-[#2d2f40] text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateGiftCardStatus(g, 'failed')}
                          disabled={g.status === 'failed'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1a1b26] border border-[#2d2f40] text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {giftCards.length === 0 && (
                    <div className="text-center p-12 text-[#8c91a0] text-xs uppercase tracking-widest bg-[#14151f] rounded-2xl border border-dashed border-[#2d2f40]">
                      No vouchers found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEGMENT: CHATS */}
            {activeSegment === 'chat_history' && (
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Live AI Agent Chat Logs</h3>
                  <p className="text-xs text-[#8c91a0]">Review all conversations and security requests across sessions.</p>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                  {chats.length > 0 ? chats.map((msg, idx) => (
                    <div key={idx} className={`p-3.5 rounded-xl border ${msg.sender === 'bot' ? 'bg-[#1a1b26] border-indigo-900/30' : 'bg-[#14151f] border-[#2d2f40]'} flex flex-col gap-1.5`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${msg.sender === 'bot' ? 'text-indigo-400' : 'text-[#8c91a0]'}`}>
                          {msg.sender === 'bot' ? 'Security Bot' : `User (${msg.user_email})`}
                        </span>
                        <span className="text-[10px] text-[#56596a] font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-white whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )) : (
                    <div className="text-center p-12 text-[#8c91a0] text-xs uppercase tracking-widest bg-[#14151f] rounded-2xl border border-dashed border-[#2d2f40]">
                      No chat logs found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEGMENT: CREDENTIALS & PIN SETTINGS */}
            {activeSegment === 'settings' && (
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Security Credentials Override</h3>
                  <p className="text-xs text-[#8c91a0]">Update login and transaction PIN codes with immediate synchronization.</p>
                </div>

                <div className="bg-[#14151f] p-5 border border-[#2d2f40] rounded-2xl flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-white">Login 4-Digit PIN</span>
                    <form onSubmit={handleUpdatePin} className="flex gap-2">
                      <input 
                        type="password" 
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="New 4-digit PIN"
                        className="bg-[#0f111a] border border-[#2d2f40] rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500 w-44"
                        maxLength={6}
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer">
                        Update Login PIN
                      </button>
                    </form>
                  </div>

                  <div className="w-full h-px bg-[#2d2f40]" />

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-white">Transfer & Wire Transaction PIN</span>
                    <form onSubmit={handleUpdateTxPin} className="flex gap-2">
                      <input 
                        type="password" 
                        value={newTxPin}
                        onChange={(e) => setNewTxPin(e.target.value)}
                        placeholder="New Transaction PIN"
                        className="bg-[#0f111a] border border-[#2d2f40] rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500 w-44"
                        maxLength={6}
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer">
                        Update Transaction PIN
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
