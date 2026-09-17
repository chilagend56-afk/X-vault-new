import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppContext';
import { ChevronDown, ExternalLink, Loader2, ArrowRightLeft, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ExternalBankPicker } from '../components/ExternalBankPicker';
import { ExternalInstitution, EXTERNAL_INSTITUTIONS } from '../data/externalBanks';

export const TransfersPage: React.FC = () => {
  const { user, accounts, processTransfer, showToast, openSecurityBot, globalSettings } = useApp();
  
  // Tab control: 'internal' or 'external'
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('external');
  
  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings' | 'Brokerage'>('Checking');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [loading, setLoading] = useState(false);

  // External Platform custom dropdown states
  const [selectedInstitution, setSelectedInstitution] = useState<ExternalInstitution | null>(
    EXTERNAL_INSTITUTIONS.find(i => i.id === 'chase') || EXTERNAL_INSTITUTIONS[0]
  );

  // Get active user's USD balance
  const primaryAccount = accounts.find(a => a.type === 'usd');
  const mainCurrency = primaryAccount?.currency ?? 'USD';
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
  const maxBalance = primaryAccount?.balance ?? 0;

  useEffect(() => {
    if (mainCurrency) {
      setCurrency(mainCurrency);
    }
  }, [mainCurrency]);

  // When selected institution changes, auto-fill routing number / swift if available
  useEffect(() => {
    if (selectedInstitution) {
      if (selectedInstitution.defaultRouting) {
        setRoutingNumber(selectedInstitution.defaultRouting);
      } else {
        setRoutingNumber('');
      }
      if (selectedInstitution.swiftBic) {
        setSwiftCode(selectedInstitution.swiftBic);
      } else {
        setSwiftCode('');
      }
    }
  }, [selectedInstitution]);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'external' && !selectedInstitution) {
      showToast('Validation Error', 'Please select a destination bank or external platform.', 'error');
      return;
    }

    if (!recipientAccount) {
      showToast('Validation Error', 'Please provide recipient account or identification details.', 'error');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      showToast('Validation Error', 'Please enter a valid amount greater than 0.00.', 'error');
      return;
    }

    if (value > maxBalance) {
      showToast('Funds Error', `Your current balance is insufficient.`, 'error');
      return;
    }

    if (!transactionPin || transactionPin.length !== 4) {
      showToast('Authentication Required', 'Please provide your 4-digit transaction safety PIN.', 'error');
      return;
    }

    const expectedPin = user?.transaction_pin || '4321';
    if (transactionPin !== expectedPin) {
      showToast('PIN Validation Failed', 'Incorrect Secure PIN. Transfer rejected.', 'error');
      return;
    }

    setLoading(true);

    // Map platform to standard database types
    let mappedType: 'internal' | 'bank' | 'paypal' | 'cashapp' | 'crypto' = 'internal';
    if (activeTab === 'external' && selectedInstitution) {
      if (selectedInstitution.id === 'paypal') mappedType = 'paypal';
      else if (selectedInstitution.id === 'cashapp' || selectedInstitution.id === 'venmo') mappedType = 'cashapp';
      else mappedType = 'bank';
    }

    try {
      // Determine final recipient name
      const finalRecipientName = activeTab === 'internal' 
        ? (recipientName || 'Member Account') 
        : (recipientName || recipientAccount || `${selectedInstitution?.name} Account`);

      let fullNotes = notes;
      if (activeTab === 'external' && selectedInstitution) {
        const parts: string[] = [];
        parts.push(`Platform: ${selectedInstitution.name}`);
        if (routingNumber) parts.push(`ABA: ${routingNumber}`);
        if (swiftCode) parts.push(`SWIFT: ${swiftCode}`);
        if (notes) parts.push(`Memo: ${notes}`);
        fullNotes = parts.join(' | ');
      }

      const res = await processTransfer({
        recipient_name: finalRecipientName,
        recipient_account: recipientAccount,
        amount: value,
        currency,
        notes: fullNotes || `Transfer via ${activeTab === 'internal' ? 'Internal' : selectedInstitution?.name}`,
        type: mappedType
      });

      if (res.success) {
        // Clear forms
        setAmount('');
        setNotes('');
        setRecipientName('');
        setRecipientAccount('');
        setTransactionPin('');
      }
    } catch (err) {
      showToast('System Error', 'Unable to complete transfer request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isBankType = selectedInstitution && (
    selectedInstitution.category === 'major_bank' || 
    selectedInstitution.category === 'brokerage' || 
    selectedInstitution.category === 'international' || 
    selectedInstitution.category === 'wire' ||
    selectedInstitution.category === 'neobank'
  );

  return (
    <div id="transfers-window" className="w-full max-w-lg mx-auto text-left py-2 px-1">
      {/* Title Header */}
      <div className="mb-4">
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Transfer Funds
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Send money internally to members or route outward to 50+ domestic & international banks
        </p>
      </div>

      {/* Navigation Switching Pills */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full border border-slate-200/80 mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('internal');
            setRecipientAccount('');
            setRecipientName('');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'internal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Internal Account
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('external');
            setRecipientAccount('');
            setRecipientName('');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'external'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          External Bank / Platform
        </button>
      </div>

      {/* Card Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative">
        <div className="mb-4">
          <h2 className="font-sans text-sm font-bold text-slate-900 text-left">
            {activeTab === 'internal' 
              ? `Transfer to ${globalSettings?.website_name || 'SmartVault'} Member` 
              : 'External Bank & Wire Clearing Transfer'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 text-left">
            {activeTab === 'internal' 
              ? 'Instant real-time settlement between internal checking accounts' 
              : 'Processed securely via official correspondent ACH, Fedwire, and SWIFT networks'}
          </p>
        </div>

        <form onSubmit={handleExecute} className="flex flex-col gap-3.5">
          {/* SENDER INFO BANNER */}
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Available to Send:</span>
            <span className="font-sans text-slate-900 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 tabular-nums">
              {currencySymbol}{maxBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {mainCurrency}
            </span>
          </div>

          {/* EXTERNAL ONLY: SEARCHABLE BANK & PLATFORM PICKER */}
          {activeTab === 'external' && (
            <ExternalBankPicker
              selectedInstitution={selectedInstitution}
              onSelect={(inst) => {
                setSelectedInstitution(inst);
              }}
              disabled={loading}
            />
          )}

          {/* RECIPIENT FULL NAME (Always shown for banks and internal) */}
          {(activeTab === 'internal' || isBankType) && (
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-semibold text-slate-700">Recipient Full Name / Business Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient's official name on account"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400"
                required={activeTab === 'internal' || isBankType}
                disabled={loading}
              />
            </div>
          )}

          {/* RECIPIENT ACCOUNT / IDENTIFIER */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-slate-700">
              {activeTab === 'internal' 
                ? 'Recipient Account No. or User Email' 
                : (selectedInstitution?.fieldLabel || 'Recipient Account Number / Identifier')}
            </label>
            <input
              type="text"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              placeholder={
                activeTab === 'internal'
                  ? `e.g. 4028910023 or user@${globalSettings?.website_name ? globalSettings.website_name.toLowerCase().replace(/\s+/g, '') : 'bank'}.com`
                  : (selectedInstitution?.placeholder || 'Enter recipient account or username')
              }
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400 font-mono"
              required
              disabled={loading}
            />
          </div>

          {/* BANK ROUTING DETAILS (FOR COMMERCIAL BANKS & WIRE) */}
          {activeTab === 'external' && isBankType && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              {/* Routing / ABA Number */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700">ABA Routing / Sort Code</label>
                  {selectedInstitution?.defaultRouting && (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Filled
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="9-digit ABA Routing"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono"
                  disabled={loading}
                />
              </div>

              {/* Account Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700">Account Type</label>
                <div className="relative">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="Checking">Checking Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Brokerage">Brokerage / Investment</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SWIFT / BIC (if international or wire) */}
              {(selectedInstitution.category === 'international' || selectedInstitution.category === 'wire' || swiftCode) && (
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">SWIFT / BIC Code (Optional for domestic)</label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CHASUS33"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono uppercase"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          )}

          {/* AMOUNT AND CURRENCY GRID */}
          <div className="grid grid-cols-3 gap-2.5 text-left">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Transfer Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                max={maxBalance}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400 font-mono"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer"
                  disabled={loading}
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

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-slate-700">Memo / Reference (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Invoice settlement, Rent, Commercial transfer"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400"
              disabled={loading}
            />
          </div>

          {/* TRANSACTION PIN CHECK */}
          <div className="flex flex-col gap-1 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">4-Digit Transfer Security PIN</label>
              <button
                type="button"
                onClick={() => openSecurityBot('forgot_transaction_pin')}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>
            <input
              type="password"
              maxLength={4}
              value={transactionPin}
              onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-center text-xs font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-400"
              required
              disabled={loading}
            />
          </div>

          {/* NOTICE FOR EXTERNAL */}
          {activeTab === 'external' && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex gap-2.5 text-left">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
                {selectedInstitution?.badge === 'Instant' || selectedInstitution?.badge === 'Real-time'
                  ? `Instant clearance authorized. Funds dispatch immediately to ${selectedInstitution?.name}.`
                  : `Transfers to ${selectedInstitution?.name || 'external institutions'} route through official Fedwire/ACH clearinghouse windows. Confirmation issued upon dispatch.`}
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold rounded-xl shadow-xs transition-all text-xs cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authorizing Transfer...</span>
              </>
            ) : (
              <span>Confirm & Authorize Transfer</span>
            )}
          </button>
        </form>
      </div>
      
      {/* Currency Converter Section */}
      <CurrencyConverter />
    </div>
  );
};

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR'];

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();
        const rate = data.rates[toCurrency];
        if (rate) {
          setExchangeRate(rate);
        } else {
          setError('Rate not found');
        }
      } catch (err) {
        setError('Unable to fetch live rates');
      } finally {
        setLoading(false);
      }
    };
    
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
    } else {
      fetchRate();
    }
  }, [fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const calculateConvertedAmount = () => {
    if (!amount || isNaN(parseFloat(amount))) return '0.00';
    if (!exchangeRate) return '0.00';
    return (parseFloat(amount) * exchangeRate).toFixed(2);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative mt-6">
      <div className="mb-4">
        <h3 className="font-sans text-sm font-bold text-slate-900 text-left">Foreign Exchange Estimator</h3>
        <p className="text-[11px] text-slate-500 mt-0.5 font-sans text-left">Live institutional indicative exchange rates</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Amount */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold text-slate-700">Conversion Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono"
            step="any"
          />
        </div>

        {/* Currencies */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 flex-1 relative text-left">
            <label className="text-xs font-semibold text-slate-700">From</label>
            <div className="relative">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSwap}
            className="mt-4.5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center border border-slate-200 transition-all flex-shrink-0 cursor-pointer"
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-700" />
          </button>

          <div className="flex flex-col gap-1 flex-1 relative text-left">
            <label className="text-xs font-semibold text-slate-700">To</label>
            <div className="relative">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 appearance-none cursor-pointer"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="mt-1 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-2 h-[64px]">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-2 h-[64px]">
              <p className="text-xs text-rose-600 font-semibold">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[64px]">
              <p className="text-[11px] text-slate-500 font-medium mb-0.5">{amount || '0'} {fromCurrency} =</p>
              <h4 className="text-xl font-bold text-slate-900 leading-tight">
                {calculateConvertedAmount()} <span className="text-sm font-semibold text-slate-500">{toCurrency}</span>
              </h4>
              {exchangeRate && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  1 {fromCurrency} = {exchangeRate} {toCurrency}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
