import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { BankLogo } from './BankLogo';
import { 
  BarChart3, 
  CreditCard, 
  Send, 
  ArrowDown, 
  RefreshCw, 
  PiggyBank, 
  History, 
  Star, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  Shield,
  Plus,
  ChevronRight,
  Landmark,
  FileText,
  Camera,
  Clock,
  Lock,
  Phone,
  Info,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { dbAPI } from '../lib/supabase';
import { SecurityBot } from './SecurityBot';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children, activeView, onNavigate }) => {
  const { user, handleLogout, toasts, removeToast, showToast, refreshUserData, globalSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(900); // 15 minutes session timeout
  const [copiedRouting, setCopiedRouting] = useState<string | null>(null);

  // Bank session timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds(prev => {
        if (prev <= 1) {
          showToast('Session Expired', 'For your security, your session has timed out due to inactivity.', 'error');
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExtendSession = () => {
    setSessionSeconds(900);
    showToast('Session Extended', 'Your secure banking session has been renewed for 15 minutes.', 'info');
  };

  const copyBankInfo = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRouting(label);
    showToast('Copied', `${label} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedRouting(null), 2000);
  };
  
  // Real-time notifications count from simulated db
  const notifications = user ? dbAPI.getNotifications(user.id) : [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navSections = [
    {
      title: 'Core Banking',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'transfers', label: 'Send Money & Wire', icon: Send },
        { id: 'check_deposit', label: 'Mobile Check Deposit', icon: Camera, badge: 'New' },
        { id: 'statements', label: 'Statements & Forms', icon: FileText },
        { id: 'withdraw', label: 'Withdraw & Wire Out', icon: ArrowDown },
        { id: 'cards', label: 'Cards & Controls', icon: CreditCard },
      ]
    },
    {
      title: 'Wealth & Credit',
      items: [
        { id: 'savings', label: 'High-Yield Savings', icon: PiggyBank, badge: '5.2% APY' },
        { id: 'loans', label: 'Credit Lines & Loans', icon: Landmark },
        { id: 'crypto', label: 'Currency Exchange', icon: RefreshCw },
      ]
    },
    {
      title: 'Account & Security',
      items: [
        { id: 'transactions', label: 'Account Activity', icon: History },
        { id: 'premium', label: 'VIP Privileges', icon: Star, badge: user?.tier || 'VIP' },
        { id: 'settings', label: 'Security & Settings', icon: Settings },
      ]
    }
  ];

  const handleMarkAllRead = () => {
    if (user) {
      dbAPI.markNotificationsAsRead(user.id);
      refreshUserData();
      showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
    }
  };

  const handleInjectSandboxCash = () => {
    onNavigate('crypto');
  };

  // Generate a consistent user id if none exists to display in profile like #9839686638 in Screen 2
  const fallbackId = '9839686638';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      
      {/* GLOBAL TOAST POPUPS LAYOUT */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-[360px] w-full">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl flex items-start gap-3 relative overflow-hidden animate-fade-in transition-all duration-300"
          >
            {/* Soft Glowing Side Glow Accent */}
            <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${
              t.type === 'success' ? 'bg-emerald-500' :
              t.type === 'error' ? 'bg-rose-500' :
              t.type === 'crypto' ? 'bg-amber-400' :
              t.type === 'security' ? 'bg-cyan-400' : 'bg-indigo-600'
            }`} />
            
            <div className="flex-1 text-left">
              <span className="text-[10px] font-mono tracking-widest text-slate-800 uppercase block font-bold">{t.title}</span>
              <p className="text-xs text-slate-500 mt-1">{t.message}</p>
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-slate-900 text-xs p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* INSTITUTIONAL SECURITY TOP BAR */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1 text-[11px] flex flex-wrap items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Lock className="w-3 h-3" /> 256-Bit TLS 1.3 Encryption
          </span>
          <span className="hidden sm:inline-block text-slate-600">•</span>
          <button
            onClick={() => setIsRoutingModalOpen(true)}
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white underline cursor-pointer"
          >
            <Landmark className="w-3 h-3 text-blue-400" /> Routing & ABA Numbers
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="hidden md:flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> Support: 1-800-VAULT-24
          </span>
          <span className="hidden md:inline-block text-slate-600">•</span>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>
              Session: {Math.floor(sessionSeconds / 60)}:{String(sessionSeconds % 60).padStart(2, '0')}
            </span>
            <button
              onClick={handleExtendSession}
              className="text-blue-400 hover:text-blue-300 underline font-sans text-[10px] ml-1 cursor-pointer"
            >
              Extend
            </button>
          </div>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2.5 sm:py-3 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1.5 -ml-1.5 md:hidden text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <BankLogo 
            size="sm" 
            onClick={() => onNavigate('dashboard')} 
          />

          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pl-3 border-l border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            FDIC Insured • Member FDIC
          </span>
        </div>

        {/* Dynamic Navigation Title Indicator */}
        <div className="hidden md:block">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {activeView === 'dashboard' && 'Accounts & Overview'}
            {activeView === 'cards' && 'Debit & Virtual Cards'}
            {activeView === 'transfers' && 'Wire & Instant Transfers'}
            {activeView === 'check_deposit' && 'Mobile Check Deposit'}
            {activeView === 'statements' && 'Statements & Tax Documents'}
            {activeView === 'withdraw' && 'Cashout & Withdraw'}
            {activeView === 'crypto' && 'Currency Exchange'}
            {activeView === 'savings' && 'High-Yield Savings'}
            {activeView === 'loans' && 'Credit & Lending'}
            {activeView === 'transactions' && 'Account Statement'}
            {activeView === 'premium' && 'Private Client VIP'}
            {activeView === 'settings' && 'Account Settings'}
            {activeView === 'admin' && 'Bank Management Portal'}
            {activeView === 'personal_admin' && 'Account Executive Center'}
          </span>
        </div>

        {/* Right Icons: Add Money, Notifications Bell, Profile Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DEPOSIT / ADD MONEY */}
          <button
            onClick={handleInjectSandboxCash}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Add funds or deposit money"
          >
            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add</span> Money
          </button>

          {/* Bell Icon Notification Drawer Trigger */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* NOTIFICATIONS DRAWER POPUP */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[300px] sm:w-[320px] rounded-xl bg-white border border-slate-200 shadow-xl p-3.5 text-left z-50">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-2.5">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1.5 no-scrollbar">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-4">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                          n.is_read ? 'bg-slate-50/50 border-slate-100 text-slate-500' : 'bg-blue-50/40 border-blue-100 text-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <span className={`font-semibold text-xs ${!n.is_read ? 'text-slate-800' : 'text-slate-500'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer" onClick={() => onNavigate('settings')}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shadow-xs" />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shadow-xs">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">{user?.full_name}</span>
              <span className="text-[10px] text-slate-400 capitalize">
                {user?.tier || 'Standard'} Tier
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* SIDEBAR NAVIGATION - DESKTOP */}
        <aside className="hidden md:flex flex-col justify-between w-60 bg-white border-r border-slate-200/90 p-3 h-[calc(100vh-73px)] sticky top-[73px]">
          <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
            
            {/* Labeled Header Logo inside sidebar */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <BankLogo 
                size="sm" 
                onClick={() => onNavigate('dashboard')} 
              />
            </div>

            {/* Compact Executive User Credentials Card */}
            <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs border border-white shadow-2xs">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'B'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" title="Secure Session Active" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] font-bold truncate text-slate-900 leading-tight">{user?.full_name || 'Brandon Chase'}</h4>
                    <span className="text-[8px] font-semibold text-blue-700 bg-blue-100/80 px-1 py-0.2 rounded uppercase">
                      {user?.tier || 'VIP'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] font-mono text-slate-500">Checking ••6638</span>
                    <span className="text-[7px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded">FDIC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grouped Categorized Navigation Links */}
            <nav className="flex flex-col gap-2.5">
              {navSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase px-2 mb-0.5 text-left">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all outline-none text-left cursor-pointer group ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                            isActive 
                              ? 'bg-blue-600 text-white shadow-2xs' 
                              : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                          }`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {item.badge && (
                            <span className={`text-[8px] font-mono font-semibold px-1 py-0.2 rounded ${
                              isActive 
                                ? 'bg-blue-200/80 text-blue-900' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3 h-3 transition-transform ${
                            isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Show Admin backoffice to Admin keys */}
              {(user?.role === 'admin' || user?.email === 'admin001@gmail.com' || user?.email === 'customersupport056@gmail.com') && (
                <div className="pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all outline-none text-left cursor-pointer border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-950/20 ${
                      activeView === 'admin' 
                        ? 'bg-cyan-950/30 text-slate-900 font-bold' 
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Admin Portal</span>
                    </div>
                    <span className="text-[8px] font-mono bg-cyan-500 text-white px-1.5 py-0.2 rounded font-bold">LIVE</span>
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Sidebar Sign Out & Trust Footer */}
          <div className="pt-2 mt-auto border-t border-slate-100 flex flex-col gap-1.5">
            <button 
              onClick={handleLogout}
              className="w-full py-1.5 px-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
            <div className="px-1.5 flex items-center justify-between text-[8px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                256-Bit SSL
              </span>
              <span>Member FDIC</span>
            </div>
          </div>
        </aside>

        {/* DRAWER FOR MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-72 max-w-[82vw] bg-white text-slate-900 shadow-2xl border-r border-slate-200 h-full text-left">
              
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                <BankLogo 
                  size="sm" 
                  onClick={() => { setMobileMenuOpen(false); onNavigate('dashboard'); }} 
                />
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors select-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body with compact spacing so it doesn't need scrolling */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 no-scrollbar">
                
                {/* Ultra-compact Executive User Credentials Card */}
                <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs border border-white shadow-2xs">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'B'}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[11px] font-bold truncate text-slate-900 leading-tight">{user?.full_name || 'Brandon Chase'}</h4>
                        <span className="text-[8px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded uppercase">
                          {user?.tier || 'VIP'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-500">Checking ••6638</span>
                        <span className="text-[7px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded">FDIC</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorized Menu Links - Compact & Streamlined */}
                <div className="space-y-2">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase px-2 text-left block">
                        {section.title}
                      </span>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all text-left cursor-pointer group ${
                              isActive 
                                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                                isActive 
                                  ? 'bg-blue-600 text-white shadow-2xs' 
                                  : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                              }`}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span className="truncate">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.badge && (
                                <span className={`text-[8px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                  isActive 
                                    ? 'bg-blue-200/80 text-blue-900' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3 h-3 ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {(user?.role === 'admin' || user?.email === 'admin001@gmail.com' || user?.email === 'customersupport056@gmail.com') && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between text-slate-800 border border-cyan-500/20 bg-cyan-950/10 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-600 flex items-center justify-center">
                            <ShieldAlert className="w-3 h-3" />
                          </div>
                          <span>Admin Portal</span>
                        </div>
                        <span className="text-[8px] font-mono bg-cyan-500 text-white px-1 py-0.2 rounded font-bold">LIVE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Bottom Footer with Sign Out and FDIC Notice */}
              <div className="px-3 py-2 border-t border-slate-100 bg-white space-y-1.5 mt-auto">
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center gap-2 text-left cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign Out of Session</span>
                </button>
                <div className="flex items-center justify-between text-[8px] text-slate-400 font-medium px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>Member FDIC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTAINER MAIN WINDOWS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-73px)] no-scrollbar">
          {children}
        </main>
      </div>

      {/* MOBILE EASY BOTTOM NAVIGATION (STANDARD BANKING TARGETS) */}
      <nav className="md:hidden sticky bottom-0 left-0 right-0 border-t border-slate-200/90 py-2 px-3 flex justify-around items-center z-30 bg-white/95 backdrop-blur-lg shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeView === 'dashboard' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>
        <button 
          onClick={() => onNavigate('transfers')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeView === 'transfers' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Transfer</span>
        </button>
        <button 
          onClick={() => onNavigate('cards')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeView === 'cards' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Cards</span>
        </button>
        <button 
          onClick={() => onNavigate('crypto')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeView === 'crypto' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Exchange</span>
        </button>
        <button 
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeView === 'transactions' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Activity</span>
        </button>
      </nav>
      
      {/* Floating AI Security Assistant Agent */}
      <SecurityBot onNavigate={onNavigate} />

      {/* OFFICIAL BANK ROUTING & WIRE DETAILS MODAL */}
      {isRoutingModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsRoutingModalOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-left z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h3 className="font-sans text-base font-bold text-slate-900">
                  Bank Routing & Wire Details
                </h3>
              </div>
              <button 
                onClick={() => setIsRoutingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Use these certified routing credentials for domestic ACH direct deposits, incoming Fedwire transfers, and international SWIFT transactions.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Bank Name</span>
                  <span className="font-bold text-slate-900 text-sm">{globalSettings.website_name} Bank, N.A.</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Member FDIC
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">ABA Routing Number (ACH / Direct Deposit)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">021000021</span>
                </div>
                <button
                  onClick={() => copyBankInfo('021000021', 'ACH Routing')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedRouting === 'ACH Routing' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Domestic Wire Routing (Fedwire)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">026009593</span>
                </div>
                <button
                  onClick={() => copyBankInfo('026009593', 'Wire Routing')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedRouting === 'Wire Routing' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">International SWIFT / BIC Code</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">VLTXUS33</span>
                </div>
                <button
                  onClick={() => copyBankInfo('VLTXUS33', 'SWIFT BIC')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedRouting === 'SWIFT BIC' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Bank Headquarters Address</span>
                <span className="text-slate-800 font-medium mt-0.5 block">100 Financial Plaza, Suite 400, New York, NY 10005, USA</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                FDIC Certificate #35112
              </span>
              <button
                onClick={() => setIsRoutingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
