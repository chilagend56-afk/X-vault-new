import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { PiggyBank, Sparkles, TrendingUp, Plus, Target, ArrowRight, Wallet, Lock, X } from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const { user, accounts, showToast, refreshUserData } = useApp();
  const [lockAmount, setLockAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('General Savings Pool');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinEntry, setPinEntry] = useState('');

  // Parse checking and savings values
  const usdAcc = accounts.find(a => a.type === 'usd');
  const savingsAcc = accounts.find(a => a.type === 'savings');

  const mainCurrency = usdAcc?.currency ?? 'USD';
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

  const mockGoals = [
    { title: 'Emergency Reserve Fund', target: 50000, current: savingsBalance, icon: PiggyBank },
    { title: 'Real Estate Investment Vault', target: 250000, current: 84000, icon: Target },
    { title: 'Tax & Retirement Allocation', target: 75000, current: 32000, icon: Sparkles }
  ];

  const handleSavingsLock = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToLock = parseFloat(lockAmount);

    if (isNaN(amountToLock) || amountToLock <= 0) {
      showToast('Validation Error', 'Please enter a valid amount to deposit.', 'error');
      return;
    }

    if (amountToLock > usdBalance) {
      showToast('Insufficient Funds', 'Your checking account balance is insufficient for this deposit.', 'error');
      return;
    }

    setShowPinModal(true);
    setPinEntry('');
  };

  const processSavingsAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.transaction_pin && user.transaction_pin !== pinEntry) {
      showToast('Authentication Error', 'Invalid 4-digit security PIN.', 'error');
      return;
    }

    setIsProcessing(true);
    setShowPinModal(false);
    
    const amountToLock = parseFloat(lockAmount);

    setTimeout(() => {
      setIsProcessing(false);

      if (user && usdAcc && savingsAcc) {
        // Debit checking
        dbAPI.addTransaction(user.id, {
          amount: amountToLock,
          type: 'withdrawal',
          category: 'Savings',
          description: `Transferred to ${selectedGoal}`,
          status: 'completed',
          account_id: usdAcc.id,
          currency: mainCurrency
        });

        // Credit savings
        dbAPI.addTransaction(user.id, {
          amount: amountToLock,
          type: 'deposit',
          category: 'Savings',
          description: `Deposit from checking account`,
          status: 'completed',
          account_id: savingsAcc.id,
          currency: mainCurrency
        });

        refreshUserData();
        setLockAmount('');
        showToast(
          'Savings Deposit Confirmed', 
          `Transferred ${currencySymbol}${amountToLock.toLocaleString()} into your High-Yield Savings account.`, 
          'success'
        );
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4 text-left max-w-5xl mx-auto py-1">
      <div>
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          High-Yield Savings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Grow your liquid wealth with daily compound interest at 5.20% APY
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left column - locked savings lockup box */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Savings Balance Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 block uppercase font-semibold">SAVINGS BALANCE</span>
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">5.20% APY</span>
            </div>

            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight">
              {currencySymbol}{savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interest compounds daily and credits on the 1st of each calendar month.</span>
            </p>
          </div>

          {/* Savings Deposit Block */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="font-sans text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-slate-700" />
              <span>Deposit From Checking</span>
            </h3>

            <form onSubmit={handleSavingsLock} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Amount ({mainCurrency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      required
                      step="any"
                      max={usdBalance}
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Checking Available: {currencySymbol}{usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Target Savings Goal</label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Emergency Reserve Fund">Emergency Reserve Fund</option>
                    <option value="Real Estate Investment Vault">Real Estate Investment Vault</option>
                    <option value="Tax & Retirement Allocation">Tax & Retirement Allocation</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 mt-1 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isProcessing ? 'Processing Transfer...' : 'Transfer to High-Yield Savings'}
              </button>
            </form>
          </div>

        </div>

        {/* Right column - goals details cards */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="font-sans text-sm font-bold text-slate-900">Savings Target Trackers</h3>
          
          {mockGoals.map((g, idx) => {
            const Icon = g.icon;
            const progress = Math.min(100, Math.max(0, (g.current / g.target) * 100));

            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-900">{g.title}</h4>
                    <span className="text-[11px] text-slate-400">Target: {currencySymbol}{g.target.toLocaleString()} {mainCurrency}</span>
                  </div>
                </div>

                {/* Progress sliding meter */}
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                    <span>{currencySymbol}{g.current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="font-semibold text-slate-700">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowPinModal(false)} />
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center text-slate-900">
                <Lock className="w-4 h-4 mr-2 text-slate-700" />
                <h3 className="font-sans text-xs font-bold">Transaction Authentication</h3>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={processSavingsAuth} className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-600 text-center">
                Enter your 4-digit security PIN to authorize the deposit of {currencySymbol}{parseFloat(lockAmount).toFixed(2)}.
              </p>
              
              <div className="relative">
                <input 
                  type="password"
                  required
                  maxLength={4}
                  value={pinEntry}
                  onChange={(e) => setPinEntry(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-lg tracking-[0.5em] h-11 bg-white border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-mono text-slate-900"
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                disabled={pinEntry.length < 4 || isProcessing}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
