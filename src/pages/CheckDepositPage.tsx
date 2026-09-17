import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI, neoLocalStorage } from '../lib/supabase';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Landmark, 
  ShieldCheck, 
  Lock, 
  History, 
  ArrowRight,
  HelpCircle,
  FileCheck,
  RotateCw
} from 'lucide-react';

export const CheckDepositPage: React.FC = () => {
  const { user, accounts, showToast, refreshUserData, globalSettings } = useApp();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [checkAmount, setCheckAmount] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isEndorsed, setIsEndorsed] = useState(false);
  const [transactionPin, setTransactionPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<any | null>(null);

  const targetAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const mainCurrency = targetAccount?.currency || 'USD';
  const getCurrencySymbol = (cur: string) => {
    switch (cur.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'CA$';
      default: return '$';
    }
  };
  const curSymbol = getCurrencySymbol(mainCurrency);

  // Generate simulated check upload if user clicks sample check or uploads custom
  const handleSampleFrontCheck = () => {
    setFrontImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    showToast('Front Captured', 'Front of check image uploaded and aligned.', 'info');
  };

  const handleSampleBackCheck = () => {
    setBackImage('https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80');
    setIsEndorsed(true);
    showToast('Back Captured', 'Endorsed back of check captured.', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (side === 'front') {
        setFrontImage(event.target?.result as string);
        showToast('Front Captured', 'Front check image loaded.', 'info');
      } else {
        setBackImage(event.target?.result as string);
        setIsEndorsed(true);
        showToast('Back Captured', 'Back check image loaded.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetAccount) return;

    const parsedAmount = parseFloat(checkAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Validation Error', 'Please enter a valid check amount.', 'error');
      return;
    }

    if (parsedAmount > 25000) {
      showToast('Deposit Limit', 'Daily mobile check deposit limit is $25,000.00. For larger amounts, please visit a branch.', 'error');
      return;
    }

    if (!frontImage || !backImage) {
      showToast('Images Required', 'Please capture or upload both front and back photos of your check.', 'error');
      return;
    }

    if (!isEndorsed) {
      showToast('Endorsement Required', 'Please endorse the back of your check with your signature and "For Mobile Deposit Only".', 'error');
      return;
    }

    if (!transactionPin || transactionPin !== (user.transaction_pin || '4321')) {
      showToast('Authentication Error', 'Incorrect 4-digit security PIN.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Record transaction and credit account
      const depositRecord = {
        amount: parsedAmount,
        type: 'deposit' as const,
        category: 'Mobile Deposit',
        description: `Mobile Check Deposit #${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'completed' as const,
        account_id: targetAccount.id,
        currency: targetAccount.currency
      };

      dbAPI.addTransaction(user.id, depositRecord);

      // Update account balance
      const allAccounts = dbAPI.getAccounts(user.id);
      const updatedAccounts = allAccounts.map(a => {
        if (a.id === targetAccount.id) {
          return { ...a, balance: a.balance + parsedAmount };
        }
        return a;
      });
      neoLocalStorage.setAccounts(user.id, updatedAccounts);

      // Add security notification
      dbAPI.addNotification(user.id, {
        title: 'Check Deposit Credited',
        message: `Your mobile check deposit of ${curSymbol}${parsedAmount.toFixed(2)} has been accepted and credited to your ${targetAccount.label}.`,
        type: 'deposit'
      });

      refreshUserData();

      setDepositSuccess({
        amount: parsedAmount,
        account: targetAccount.label,
        reference: `CHK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date().toLocaleDateString()
      });

      showToast('Deposit Accepted', `${curSymbol}${parsedAmount.toFixed(2)} successfully credited to ${targetAccount.label}.`, 'success');
      
      // Reset form
      setCheckAmount('');
      setFrontImage(null);
      setBackImage(null);
      setIsEndorsed(false);
      setTransactionPin('');
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Mobile Check Deposit
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Instant Remote Capture
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Deposit checks safely from anywhere using your camera. Funds typically clear with same-day provisional credit.
        </p>
      </div>

      {/* Success Modal Notification if just deposited */}
      {depositSuccess && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 text-emerald-900 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Check Deposit Processed Successfully!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your deposit of <strong>{curSymbol}{depositSuccess.amount.toFixed(2)}</strong> has been credited to your <strong>{depositSuccess.account}</strong>.
              </p>
              <p className="text-[11px] font-mono text-emerald-600 mt-1">
                Confirmation Reference: {depositSuccess.reference} • Date: {depositSuccess.date}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDepositSuccess(null)}
            className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Deposit Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <form onSubmit={handleSubmitDeposit} className="space-y-6">
            {/* Target Account Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Deposit To Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.label} ({acc.account_number}) — Balance: {getCurrencySymbol(acc.currency)}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Check Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Check Amount ({mainCurrency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                  {curSymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="25000"
                  required
                  placeholder="0.00"
                  value={checkAmount}
                  onChange={(e) => setCheckAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Daily mobile deposit limit: $25,000.00</p>
            </div>

            {/* Check Capture Photos (Front and Back) */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Capture Check Photos
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front of Check */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors relative bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px]">
                  {frontImage ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={frontImage} alt="Front of check" className="w-full h-28 object-cover rounded-lg shadow-xs" />
                      <span className="text-[10px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Front Photo Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => setFrontImage(null)}
                        className="text-[10px] text-rose-600 hover:underline mt-0.5"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">Front of Check</p>
                      <p className="text-[10px] text-slate-400">Place on a dark flat surface</p>
                      <div className="flex gap-2 mt-1">
                        <label className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 cursor-pointer">
                          Upload / Snap
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileUpload(e, 'front')}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleSampleFrontCheck}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-300 cursor-pointer"
                        >
                          Use Demo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back of Check */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors relative bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px]">
                  {backImage ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={backImage} alt="Back of check" className="w-full h-28 object-cover rounded-lg shadow-xs" />
                      <span className="text-[10px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Back Endorsed & Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => setBackImage(null)}
                        className="text-[10px] text-rose-600 hover:underline mt-0.5"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <RotateCw className="w-8 h-8 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">Back of Check</p>
                      <p className="text-[10px] text-slate-400">Must include signature & endorsement</p>
                      <div className="flex gap-2 mt-1">
                        <label className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 cursor-pointer">
                          Upload / Snap
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileUpload(e, 'back')}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleSampleBackCheck}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-medium hover:bg-slate-300 cursor-pointer"
                        >
                          Use Demo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Endorsement Guarantee Checkbox */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="endorse-check"
                checked={isEndorsed}
                onChange={(e) => setIsEndorsed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="endorse-check" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <strong>Endorsement Confirmation:</strong> I confirm the back of this check has been signed by all payees and explicitly endorsed with <em>"For Mobile Deposit at {globalSettings?.website_name || 'SmartVault'} Only"</em>.
              </label>
            </div>

            {/* Transaction PIN Verification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4-Digit Transaction Security PIN
              </label>
              <div className="relative max-w-xs">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:bg-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying MICR & Processing Deposit...
                </>
              ) : (
                <>
                  Submit Mobile Check Deposit <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Informational Guidance Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h4 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Deposit Guidelines
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Endorse check with your signature and write <strong>"For Mobile Deposit Only"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Ensure all 4 corners of the check are visible within the frame.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Keep original paper check in a secure place for 14 business days.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
            <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Landmark className="w-4 h-4 text-blue-400" />
              Funds Availability
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deposits submitted before <strong>5:00 PM EST</strong> on business days typically receive up to $1,000 provisional credit immediately, with remainder clearing by the next business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
