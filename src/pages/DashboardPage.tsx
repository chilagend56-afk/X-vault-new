import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppContext';
import { 
  ArrowRightLeft,
  Download,
  RefreshCw,
  CreditCard,
  PiggyBank,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  X,
  Lock,
  Send,
  Activity,
  Zap,
  FileText
} from 'lucide-react';
import { dbAPI } from '../lib/supabase';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const spendData = [
  { name: 'Mon', spend: 400 },
  { name: 'Tue', spend: 300 },
  { name: 'Wed', spend: 550 },
  { name: 'Thu', spend: 200 },
  { name: 'Fri', spend: 780 },
  { name: 'Sat', spend: 1200 },
  { name: 'Sun', spend: 600 },
];

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, accounts, cryptoWallets, refreshUserData, showToast, transactions: liveTransactions } = useApp();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [rates, setRates] = useState<{ EUR: number, GBP: number, CAD: number }>({ EUR: 0, GBP: 0, CAD: 0 });

  const usdAcc = accounts.find(a => a.type === 'usd');
  const savingsAcc = accounts.find(a => a.type === 'savings');

  const mainCurrency = usdAcc?.currency ?? 'USD';

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${mainCurrency}`);
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();
        setRates({
          EUR: data.rates.EUR || 0.9,
          GBP: data.rates.GBP || 0.8,
          CAD: data.rates.CAD || 1.35
        });
      } catch (err) {
        console.error('Failed to fetch rates', err);
        // Fallback rates roughly from USD if fetch fails
        if (mainCurrency === 'USD') {
          setRates({ EUR: 0.92, GBP: 0.79, CAD: 1.36 });
        }
      }
    };
    fetchRates();
  }, [mainCurrency]);

  const getCurrencySymbol = (currencyStr: string) => {
    switch (currencyStr.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'CA$';
      case 'AUD': return 'A$';
      case 'USD': default: return '$';
    }
  };
  const currencySymbol = getCurrencySymbol(mainCurrency);

  const usdBalance = usdAcc?.balance ?? 0;
  const savingsBalance = savingsAcc?.balance ?? 0;
  const cryptoBalanceValue = cryptoWallets.reduce((sum, coin) => sum + (coin.balance * coin.current_price), 0);
  const totalWeight = usdBalance + savingsBalance + cryptoBalanceValue;

  const getHiddenText = (text: string) => text.replace(/[0-9]/g, '*');

  const formatBalance = (amount: number, symbol: string) => {
    const formatted = `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return isBalanceHidden ? getHiddenText(formatted) : formatted;
  };

  // Recent transactions list
  const txHistory = (liveTransactions && liveTransactions.length > 0 ? liveTransactions : (user ? dbAPI.getTransactions(user.id) : [])).slice(0, 15);

  const foreignLedgers = accounts.filter(a => a.currency !== mainCurrency && a.type !== 'savings');

  return (
    <div className="flex flex-col gap-4 sm:gap-5 text-left max-w-4xl mx-auto pb-16">
      
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 capitalize">
              {user?.tier || 'Standard'} Account
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Member ID: {user?.id?.slice(0, 8).toUpperCase()} • FDIC Insured
          </p>
        </div>

        {/* Quick status pill on desktop */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>All Accounts Operational</span>
        </div>
      </div>

      {/* COMPACT EXECUTIVE BANKING BALANCE CARD */}
      <div className="bg-gradient-to-br from-[#0a1e3b] via-[#0f2952] to-[#07152b] p-5 sm:p-6 rounded-2xl text-white relative overflow-hidden shadow-sm border border-blue-900/40">
        {/* Subtle executive glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-200/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Total Liquid Balance ({mainCurrency})</span>
            </div>
            <button 
              onClick={() => setIsBalanceHidden(!isBalanceHidden)} 
              className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle balance visibility"
            >
              {isBalanceHidden ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums leading-tight">
              {formatBalance(totalWeight, currencySymbol)}
            </h2>
            <div className="text-[11px] text-blue-200/70 font-mono">
              Account No: •••• {usdAcc?.account_number ? usdAcc.account_number.slice(-4) : '4028'}
            </div>
          </div>

          {/* Sub-Ledger Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            <div className="bg-white/[0.07] p-2.5 rounded-xl text-left">
              <span className="text-[10px] text-blue-200/80 block">Checking ({mainCurrency})</span>
              <span className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                {formatBalance(usdBalance, currencySymbol)}
              </span>
            </div>
            <div className="bg-white/[0.07] p-2.5 rounded-xl text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-200/80">Savings (4.85% APY)</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-300 tabular-nums">
                {formatBalance(savingsBalance, currencySymbol)}
              </span>
            </div>
            {foreignLedgers.slice(0, 2).map(fl => (
              <div key={fl.id} className="bg-white/[0.07] p-2.5 rounded-xl text-left">
                <span className="text-[10px] text-blue-200/80 block">{fl.currency} Account</span>
                <span className="text-xs sm:text-sm font-semibold text-white tabular-nums">
                  {formatBalance(fl.balance, getCurrencySymbol(fl.currency))}
                </span>
              </div>
            ))}
            {foreignLedgers.length === 0 && (
              <div className="bg-white/[0.07] p-2.5 rounded-xl text-left hidden sm:block col-span-2">
                <span className="text-[10px] text-blue-200/80 block">Deposit Insurance</span>
                <span className="text-xs font-medium text-slate-200">
                  Backed by FDIC up to $250,000
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPACT STANDARD QUICK ACTIONS */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
        <button 
          onClick={() => onNavigate('transfers')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Transfer</span>
        </button>

        <button 
          onClick={() => onNavigate('withdraw')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <Download className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Withdraw</span>
        </button>

        <button 
          onClick={() => onNavigate('cards')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Cards</span>
        </button>

        <button 
          onClick={() => onNavigate('crypto')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <RefreshCw className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Exchange</span>
        </button>

        <button 
          onClick={() => onNavigate('savings')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <PiggyBank className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Savings</span>
        </button>

        <button 
          onClick={() => onNavigate('loans')} 
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">Credit</span>
        </button>
      </div>

      {/* ANALYTICS & BILLS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RECURRING BILLS */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <h3 className="font-sans text-sm font-bold text-slate-900">Scheduled Bills</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Monthly Auto-Pay</span>
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs">N</div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Netflix Premium</p>
                  <p className="text-[10px] text-slate-400">Due tomorrow</p>
                </div>
              </div>
              <span className="font-sans text-xs font-bold text-slate-800">{currencySymbol}15.99</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">S</div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Spotify Family</p>
                  <p className="text-[10px] text-slate-400">Due in 3 days</p>
                </div>
              </div>
              <span className="font-sans text-xs font-bold text-slate-800">{currencySymbol}9.99</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">A</div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Amazon Prime</p>
                  <p className="text-[10px] text-slate-400">Due in 5 days</p>
                </div>
              </div>
              <span className="font-sans text-xs font-bold text-slate-800">{currencySymbol}14.99</span>
            </div>
          </div>
        </div>

        {/* SPENDING FLOW */}
        <div className="md:col-span-2 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <h3 className="font-sans text-sm font-bold text-slate-900">Spending Analytics</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Last 7 Days</span>
          </div>
          
          <div className="flex-1 w-full relative min-h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '11px' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="spend" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT SETTLEMENTS LEDGER */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="font-sans text-sm font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <button 
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            View all statements
          </button>
        </div>

        {txHistory.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-700">
              <tbody>
                {txHistory.slice(0, 5).map((tx) => {
                  const isIncoming = tx.type === 'deposit' || tx.type === 'receive';
                  return (
                    <tr key={tx.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isIncoming ? <Download className="w-3.5 h-3.5" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-left font-sans">
                          <p className="text-xs font-semibold text-slate-900">{tx.description}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </td>
                      <td className={`py-2.5 text-right font-sans font-semibold text-xs tabular-nums ${isIncoming ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIncoming ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8 gap-2">
            <ArrowRightLeft className="w-8 h-8 opacity-40" strokeWidth={1.5} />
            <p className="text-xs font-medium">No recent transactions recorded</p>
          </div>
        )}
      </div>

    </div>
  );
};

