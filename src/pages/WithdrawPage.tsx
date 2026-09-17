import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { ChevronDown, Download, Lock, Loader2, Building2, ShieldCheck } from 'lucide-react';
import { ExternalBankPicker } from '../components/ExternalBankPicker';
import { ExternalInstitution, EXTERNAL_INSTITUTIONS } from '../data/externalBanks';

export const WithdrawPage: React.FC = () => {
  const { user, accounts, showToast, refreshUserData, openSecurityBot, globalSettings } = useApp();
  
  // Derive USD account as default active balance
  const activeAcc = accounts.find(a => a.type === 'usd') || accounts[0];
  const mainCurrency = activeAcc?.currency ?? 'USD';
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
  const maxBalance = activeAcc?.balance ?? 0;

  // Form states
  const [selectedInstitution, setSelectedInstitution] = useState<ExternalInstitution | null>(
    EXTERNAL_INSTITUTIONS.find(i => i.id === 'chase') || EXTERNAL_INSTITUTIONS[0]
  );
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [destination, setDestination] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (mainCurrency) {
      setCurrency(mainCurrency);
    }
  }, [mainCurrency]);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);
    
    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      showToast('Validation Error', 'Please enter a valid transaction amount greater than 0.00.', 'error');
      return;
    }

    if (withdrawAmt > maxBalance) {
      showToast('Insufficient Funds', 'Your primary vault balance is insufficient.', 'error');
      return;
    }

    if (!destination) {
      showToast('Validation Error', 'Please specify a destination account, email, or identifier.', 'error');
      return;
    }

    if (!pin || pin.length !== 4) {
      showToast('Security Action', 'Please submit your 4-digit security ATM/security PIN.', 'error');
      return;
    }

    const expectedPin = user?.transaction_pin || '4321';
    if (pin !== expectedPin) {
      showToast('PIN Validation Failed', 'Incorrect Secure ATM PIN. Cashout rejected.', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      const institutionName = selectedInstitution?.name || 'External Account';
      const destSummary = `${institutionName} (${destination})`;

      // Request processed successfully in mock storage
      if (user && activeAcc) {
        dbAPI.addTransaction(user.id, {
          amount: withdrawAmt,
          type: 'withdrawal',
          category: 'Checking',
          description: `Withdrawal to ${destSummary}`,
          status: 'completed',
          account_id: activeAcc.id,
          currency: activeAcc.currency
        });

        // Add alert notification
        dbAPI.addNotification(user.id, {
          title: 'Outbound Withdrawal Requested',
          message: `Withdrawal of ${currencySymbol}${withdrawAmt.toFixed(2)} to ${destSummary} is pending dispatch.`,
          type: 'transfer'
        });

        // Save
        refreshUserData();
        setAmount('');
        setDestination('');
        setPin('');
        
        showToast(
          'Withdrawal Requested',
          `Withdrawal of ${currencySymbol}${withdrawAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} requested successfully to ${institutionName}.`,
          'success'
        );
      }
    }, 1500);
  };

  const handleForgotPIN = () => {
    openSecurityBot('forgot_transaction_pin');
    showToast(
      'Security Desk Activated',
      'The AI Security Agent has been launched in the bottom corner to manage your PIN recovery.',
      'info'
    );
  };

  return (
    <div id="withdraw-window" className="w-full max-w-lg mx-auto text-left py-2 px-1">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Withdraw Funds
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Initiate an outward withdrawal to 50+ external banks, payment apps, or wire networks
        </p>
      </div>

      {/* Main Form Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative">
        <div className="mb-4">
          <h2 className="font-sans text-sm font-bold text-slate-900">
            Outward Withdrawal Order
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Funds will be cleared and debited upon confirmation
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="flex flex-col gap-3.5">
          {/* External Bank Picker */}
          <ExternalBankPicker
            selectedInstitution={selectedInstitution}
            onSelect={(inst) => setSelectedInstitution(inst)}
            disabled={isProcessing}
          />

          {/* AMOUNT AND CURRENCY GROUP */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Withdrawal Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                max={maxBalance}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono"
                required
                disabled={isProcessing}
              />
              <span className="text-[11px] text-slate-500 font-sans mt-0.5 block">
                Available: {currencySymbol}{maxBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {mainCurrency}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer"
                  disabled={isProcessing}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* DESTINATION ACCOUNT / EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">
              {selectedInstitution?.fieldLabel || 'Destination Account / Clearing Address'}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={selectedInstitution?.placeholder || 'e.g. IBAN, ABA Routing #, PayPal, or Wire coordinates'}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400 font-mono"
              required
              disabled={isProcessing}
            />
          </div>

          {/* WITHDRAWAL PIN */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">4-Digit ATM / Security PIN</label>
              <button
                type="button"
                onClick={handleForgotPIN}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>
            
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-center"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* INFORMATION NOTICE PANEL */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex gap-2.5 text-left">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
              {selectedInstitution?.badge === 'Instant' || selectedInstitution?.badge === 'Real-time'
                ? `Instant clearance authorized. Funds dispatch immediately to ${selectedInstitution?.name}.`
                : `Withdrawals to ${selectedInstitution?.name || 'external accounts'} settle through standard clearing networks within 1-2 business days.`}
            </p>
          </div>

          {/* REQUEST BUTTON */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold rounded-xl shadow-xs transition-all text-xs cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>Authorize & Confirm Withdrawal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
