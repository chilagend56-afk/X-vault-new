import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { Landmark, TrendingDown, ArrowRight, ShieldCheck, BadgeCheck, X, Lock } from 'lucide-react';

export const LoansPage: React.FC = () => {
  const { user, accounts, showToast, refreshUserData } = useApp();
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReason, setLoanReason] = useState('Personal Liquidity Bridge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinEntry, setPinEntry] = useState('');

  const usdAcc = accounts.find(a => a.type === 'usd');
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

  const handleLoanApply = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast('Validation Error', 'Please enter a valid loan amount.', 'error');
      return;
    }

    if (amount > 500000) {
      showToast('Limit Exceeded', 'The maximum pre-approved auto-loan limit without human underwriting is $500,000.', 'error');
      return;
    }

    setShowPinModal(true);
    setPinEntry('');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinEntry) return;

    setIsProcessing(true);
    setShowPinModal(false);

    if (user) {
      const res = await dbAPI.submitLoan(user.id, parseFloat(loanAmount), loanReason, mainCurrency, pinEntry);
      
      if (res.success) {
        setLoanAmount('');
        showToast('Request Submitted', 'Loan request pending support team approval.', 'success');
        refreshUserData();
      } else {
        showToast('Verification Failed', res.error || 'Invalid transaction PIN.', 'error');
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 text-left max-w-5xl mx-auto py-1">
      <div>
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Credit & Credit Lines
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Apply for instant overdraft coverage and personal liquidity lines with fixed terms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-sans text-sm font-bold text-slate-900">Credit Line Application</h2>
              <p className="text-[11px] text-slate-500">Underwritten directly into your primary checking account</p>
            </div>
          </div>

          <form onSubmit={handleLoanApply} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 relative overflow-hidden flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 flex justify-between mb-1">
                <span>Requested Principal</span>
                <span className="text-emerald-700 font-medium">Pre-approved: {currencySymbol}500,000</span>
              </label>
              <div className="h-10 relative bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-600/10 focus-within:border-blue-600 transition-all flex items-center">
                <span className="absolute left-3 font-semibold text-slate-400 text-xs">{currencySymbol}</span>
                <input 
                  type="number"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-full pl-8 pr-3 bg-transparent outline-none font-mono text-xs text-slate-900 placeholder:text-slate-300"
                  placeholder="25000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Facility Purpose</label>
              <div className="h-10 relative bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-600/10 focus-within:border-blue-600 transition-all overflow-hidden flex items-center px-3">
                <select 
                  value={loanReason}
                  onChange={(e) => setLoanReason(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs text-slate-800 cursor-pointer"
                >
                  <option>Personal Working Capital & Liquidity</option>
                  <option>Real Estate Bridge Financing</option>
                  <option>Commercial Equipment & Inventory</option>
                  <option>Debt Consolidation Facility</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Processing Underwriting...' : 'Submit Credit Application'}
                {!isProcessing && <ArrowRight className="w-3.5 h-3.5 ml-1.5" /> }
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2">Soft credit inquiries do not affect your institutional rating.</p>
            </div>
          </form>
        </div>

        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs">
            <h3 className="font-sans text-sm font-bold mb-1">Fixed APR Tiers</h3>
            <p className="text-xs text-slate-400 mb-4">Preferential interest rates calculated based on relationship balance.</p>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-slate-400"/>
                  <span>Standard Tier</span>
                </span>
                <span className="font-mono text-xs font-bold text-white">4.8% APR</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-amber-200 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-amber-400"/>
                  <span>Premier Tier</span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-300">1.9% APR</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                <span className="text-xs text-blue-200 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-blue-400"/>
                  <span>Corporate Reserve</span>
                </span>
                <span className="font-mono text-xs font-bold text-blue-300">0.0% APR</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex gap-3 text-slate-800">
             <div className="mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
             </div>
             <div>
                <h4 className="font-bold text-xs mb-0.5">FDIC Insured Clearing</h4>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Approved loan balances are disbursed automatically into your primary checking account ledger upon verification.
                </p>
             </div>
          </div>
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowPinModal(false)} />
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center text-slate-900">
                <Lock className="w-4 h-4 mr-2 text-slate-700" />
                <h3 className="font-sans text-xs font-bold">Sign Loan Agreement</h3>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handlePinSubmit} className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-600 text-center">
                Enter your 4-digit security PIN to electronically authorize this application.
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
                disabled={pinEntry.length < 4}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center transition-all disabled:opacity-50 shadow-xs"
              >
                Sign & Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
