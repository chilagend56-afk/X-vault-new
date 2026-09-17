import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { BankLogo } from '../components/BankLogo';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Landmark, 
  ShieldCheck, 
  Calendar, 
  ArrowDownToLine, 
  FileCheck,
  Building,
  DollarSign,
  Copy,
  ExternalLink
} from 'lucide-react';

export const StatementsPage: React.FC = () => {
  const { user, accounts, showToast, globalSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'statements' | 'direct_deposit' | 'tax_forms' | 'proof_of_funds'>('statements');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const primaryAcc = accounts.find(a => a.type === 'usd') || accounts[0];
  const savingsAcc = accounts.find(a => a.type === 'savings');
  const transactions = user ? dbAPI.getTransactions(user.id) : [];

  const mainCurrency = primaryAcc?.currency || 'USD';
  const getCurrencySymbol = (cur: string) => {
    switch (cur.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'CA$';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };
  const curSymbol = getCurrencySymbol(mainCurrency);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast('Copied', `${label} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate realistic monthly statement data based on actual transactions
  const statementMonths = [
    { value: '2026-08', label: 'August 2026 Statement', dateRange: 'Aug 01, 2026 - Aug 31, 2026', openingBalance: 12450.00 },
    { value: '2026-07', label: 'July 2026 Statement', dateRange: 'Jul 01, 2026 - Jul 31, 2026', openingBalance: 9800.00 },
    { value: '2026-06', label: 'June 2026 Statement', dateRange: 'Jun 01, 2026 - Jun 30, 2026', openingBalance: 8150.00 },
    { value: '2026-05', label: 'May 2026 Statement', dateRange: 'May 01, 2026 - May 31, 2026', openingBalance: 7200.00 },
    { value: '2025-Annual', label: 'Annual Summary 2025', dateRange: 'Jan 01, 2025 - Dec 31, 2025', openingBalance: 5000.00 },
  ];

  const currentStatementMeta = statementMonths.find(m => m.value === selectedMonth) || statementMonths[0];
  const depositsTotal = transactions
    .filter(t => t.type === 'deposit' || t.type === 'receive')
    .reduce((sum, t) => sum + t.amount, 0);
  const withdrawalsTotal = transactions
    .filter(t => t.type === 'withdrawal' || t.type === 'send')
    .reduce((sum, t) => sum + t.amount, 0);

  const endingBalance = primaryAcc ? primaryAcc.balance : 0;
  const openingBalance = Math.max(0, endingBalance - depositsTotal + withdrawalsTotal);

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Statements & Tax Documents
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Official Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Access certified electronic bank statements, tax forms, and direct deposit setup authorizations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Document
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'statements', label: 'Monthly e-Statements', icon: FileText },
          { id: 'direct_deposit', label: 'Direct Deposit Form', icon: Landmark },
          { id: 'tax_forms', label: 'Tax Forms (1099-INT)', icon: FileCheck },
          { id: 'proof_of_funds', label: 'Proof of Funds Letter', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MONTHLY STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="space-y-6">
          {/* Statement Selector Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statement Cycle</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-0.5 text-sm font-semibold text-slate-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
                >
                  {statementMonths.map((m) => (
                    <option key={m.value} value={m.value}>{m.label} ({m.dateRange})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast('Statement Downloaded', `PDF statement for ${currentStatementMeta.label} generated.`, 'success');
                  handlePrint();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* OFFICIAL STATEMENT PAPER SHEET (PRINTABLE) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-sm print:border-0 print:shadow-none print:p-0">
            {/* Bank Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
              <div>
                <BankLogo size="md" />
                <p className="text-xs text-slate-500 mt-2">
                  {globalSettings.website_name} Commercial & Retail Banking N.A.<br />
                  Member FDIC • Equal Housing Lender<br />
                  100 Financial Plaza, Suite 400, New York, NY 10005<br />
                  Customer Support: 1-800-VAULT-24
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-800">
                  OFFICIAL ACCOUNT STATEMENT
                </span>
                <p className="text-xs text-slate-600 mt-2">
                  <span className="text-slate-400">Statement Period:</span><br />
                  <span className="font-semibold text-slate-800">{currentStatementMeta.dateRange}</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">Account Number:</span><br />
                  <span className="font-mono font-semibold text-slate-800">{primaryAcc?.account_number || '•••• 8920'}</span>
                </p>
              </div>
            </div>

            {/* Account Holder Details & Balance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Account Holder</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user?.full_name || 'Valued Client'}</p>
                <p className="text-xs text-slate-600 mt-0.5">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1">Status: Active • Tier: {user?.tier?.toUpperCase() || 'STANDARD'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Banking Routing Details</p>
                <div className="mt-1 space-y-1 text-xs">
                  <p className="flex justify-between"><span className="text-slate-500">ABA Routing Number:</span> <span className="font-mono font-bold text-slate-800">021000021</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">Wire Routing:</span> <span className="font-mono font-bold text-slate-800">026009593</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">SWIFT / BIC Code:</span> <span className="font-mono font-bold text-slate-800">VLTXUS33</span></p>
                </div>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
              <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Activity Summary</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 p-4 text-center">
                <div className="p-2">
                  <p className="text-[11px] text-slate-500 font-medium">Starting Balance</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {curSymbol}{openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-[11px] text-emerald-600 font-medium">+ Total Deposits</p>
                  <p className="text-base font-bold text-emerald-700 mt-0.5 font-mono">
                    +{curSymbol}{depositsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-[11px] text-rose-600 font-medium">- Total Withdrawals</p>
                  <p className="text-base font-bold text-rose-700 mt-0.5 font-mono">
                    -{curSymbol}{withdrawalsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-[11px] text-blue-600 font-medium">= Ending Balance</p>
                  <p className="text-base font-bold text-blue-700 mt-0.5 font-mono">
                    {curSymbol}{endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Itemized Transaction History</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Post Date</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold">Category</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount ({mainCurrency})</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No transactions recorded during this statement cycle.
                        </td>
                      </tr>
                    ) : (
                      transactions.slice(0, 10).map((tx) => {
                        const isCredit = tx.type === 'deposit' || tx.type === 'receive';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[220px] truncate">
                              {tx.description}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {tx.category}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono font-semibold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {isCredit ? '+' : '-'}{curSymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 capitalize">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legal Disclosures */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-400 space-y-1.5 leading-relaxed">
              <p>
                <strong>IN CASE OF ERRORS OR QUESTIONS ABOUT YOUR ELECTRONIC TRANSFERS:</strong> Call us at 1-800-VAULT-24 or write us at {globalSettings.website_name} Disputed Services, 100 Financial Plaza, Suite 400, New York, NY 10005. Contact us as soon as you can if you think your statement is wrong or if you need more information about a transfer listed on the statement. We must hear from you no later than 60 days after we sent the FIRST statement on which the problem or error appeared.
              </p>
              <p>
                Deposits are insured up to $250,000 per eligible depositor by the Federal Deposit Insurance Corporation (FDIC). Certificate #35112.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT DEPOSIT AUTHORIZATION FORM */}
      {activeTab === 'direct_deposit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-slate-800" />
                <h3 className="font-sans text-xl font-bold text-slate-900">Direct Deposit Authorization Form</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Provide this completed form to your employer or payroll provider to route your salary directly to your account.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download & Print Form
            </button>
          </div>

          {/* Quick Copy Banking Routing Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{globalSettings.website_name} Bank, N.A.</p>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Member FDIC</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ABA Routing Number (ACH)</p>
                <p className="text-base font-mono font-bold text-slate-900 mt-1">021000021</p>
              </div>
              <button
                onClick={() => copyToClipboard('021000021', 'Routing Number')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> {copiedField === 'Routing Number' ? 'Copied!' : 'Copy Routing'}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</p>
                <p className="text-base font-mono font-bold text-slate-900 mt-1">{primaryAcc?.account_number || '•••• 8920'}</p>
              </div>
              <button
                onClick={() => copyToClipboard(primaryAcc?.account_number || '10293848920', 'Account Number')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> {copiedField === 'Account Number' ? 'Copied!' : 'Copy Account #'}
              </button>
            </div>
          </div>

          {/* VISUAL VOIDED CHECK GRAPHIC */}
          <div className="border border-slate-300 rounded-2xl p-6 bg-gradient-to-r from-cyan-50/50 via-slate-50 to-blue-50/50 relative overflow-hidden shadow-xs">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <span className="text-7xl sm:text-9xl font-black text-slate-600 tracking-widest uppercase rotate-[-15deg]">
                VOID
              </span>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-slate-900">{user?.full_name || 'Account Holder'}</p>
                  <p className="text-[11px] text-slate-500">123 Financial Way, Apt 4B</p>
                  <p className="text-[11px] text-slate-500">New York, NY 10001</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-slate-700">CHECK # 1001</p>
                  <p className="text-[11px] text-slate-500 mt-1">Date: __________________</p>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 py-3 flex justify-between items-end">
                <span className="text-xs text-slate-500">PAY TO THE ORDER OF:</span>
                <span className="text-sm font-serif italic text-slate-700 flex-1 ml-4 border-b border-slate-400">VOID - FOR DIRECT DEPOSIT ONLY</span>
                <span className="text-sm font-mono font-bold text-slate-800 ml-4">$ ______________</span>
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">{globalSettings.website_name} Bank, N.A.</p>
                  <p className="text-[10px] text-slate-500">100 Financial Plaza, New York, NY</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Authorized Signature:</p>
                  <p className="font-serif italic text-slate-800 text-sm mt-1">{user?.full_name}</p>
                </div>
              </div>

              {/* MICR Encoding Line */}
              <div className="pt-3 border-t border-slate-300 font-mono text-sm tracking-widest text-slate-700 flex items-center justify-between">
                <span>⑆021000021⑆</span>
                <span>{primaryAcc?.account_number.replace(/[^0-9]/g, '') || '09819283920'}⑈</span>
                <span>1001</span>
              </div>
            </div>
          </div>

          {/* Form Sign-off fields */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Employee / Depositor Authorization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium">Employee Full Legal Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.full_name || ''}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium">Deposit Allocation</label>
                <input
                  type="text"
                  readOnly
                  value="100% of Net Pay (Full Direct Deposit)"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              I hereby authorize my employer/payroll department to deposit any amounts owed to me directly into the above-designated account at {globalSettings.website_name} Bank.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: TAX FORMS (1099-INT) */}
      {activeTab === 'tax_forms' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-slate-800" />
                <h3 className="font-sans text-xl font-bold text-slate-900">Form 1099-INT Interest Income</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Internal Revenue Service (IRS) reported taxable interest income statements for your high-yield savings accounts.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Form 1099-INT
            </button>
          </div>

          <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/70 font-mono text-xs space-y-4">
            <div className="flex justify-between border-b border-slate-300 pb-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">FORM 1099-INT</p>
                <p className="text-slate-500">Interest Income • Tax Year 2025</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">OMB No. 1545-0112</p>
                <p className="text-slate-500">Copy B for Recipient</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 bg-white p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">PAYER'S Name and Address</span>
                <p className="font-sans font-bold text-slate-900 text-xs mt-1">{globalSettings.website_name} Bank N.A.</p>
                <p className="font-sans text-slate-600 text-[11px]">100 Financial Plaza, New York, NY 10005</p>
                <p className="font-sans text-slate-500 text-[11px] mt-1">TIN: 13-9847291</p>
              </div>

              <div className="border border-slate-200 bg-white p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">RECIPIENT'S Name and Address</span>
                <p className="font-sans font-bold text-slate-900 text-xs mt-1">{user?.full_name || 'Account Holder'}</p>
                <p className="font-sans text-slate-600 text-[11px]">{user?.email}</p>
                <p className="font-sans text-slate-500 text-[11px] mt-1">Account: {primaryAcc?.account_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-slate-200 bg-white p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Box 1. Interest income</span>
                <p className="text-base font-bold text-slate-900 mt-1">$482.50</p>
              </div>
              <div className="border border-slate-200 bg-white p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Box 2. Early withdrawal penalty</span>
                <p className="text-base font-bold text-slate-900 mt-1">$0.00</p>
              </div>
              <div className="border border-slate-200 bg-white p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Box 4. Federal income tax withheld</span>
                <p className="text-base font-bold text-slate-900 mt-1">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROOF OF FUNDS LETTER */}
      {activeTab === 'proof_of_funds' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-slate-800" />
                <h3 className="font-sans text-xl font-bold text-slate-900">Official Proof of Funds & Balance Verification</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                A formal bank verification letter suitable for mortgage lenders, visa applications, and commercial agreements.
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official Letter
            </button>
          </div>

          <div className="border border-slate-300 rounded-xl p-8 sm:p-12 bg-white text-slate-800 space-y-6 max-w-3xl mx-auto shadow-sm">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <BankLogo size="md" />
              <div className="text-right text-xs text-slate-500">
                <p>Ref: POF-{user?.id?.slice(0, 6).toUpperCase()}-2026</p>
                <p>Date: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-900">TO WHOM IT MAY CONCERN,</p>
              <p className="mt-4 leading-relaxed">
                This letter serves as official verification that <strong>{user?.full_name}</strong> is an active client in good standing with {globalSettings.website_name} Bank, N.A. The details of their accounts as of {new Date().toLocaleDateString()} are as follows:
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Account Type</th>
                    <th className="p-3 font-semibold">Account Number</th>
                    <th className="p-3 font-semibold">Current Available Balance</th>
                    <th className="p-3 font-semibold">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map(acc => (
                    <tr key={acc.id}>
                      <td className="p-3 font-medium text-slate-900 capitalize">{acc.type} Account</td>
                      <td className="p-3 font-mono text-slate-600">{acc.account_number}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {getCurrencySymbol(acc.currency)}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {acc.currency}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Active / Good Standing
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="font-serif italic text-base text-slate-900">Jonathan Sterling</p>
                <p className="font-bold text-slate-800">Jonathan Sterling, VP Client Operations</p>
                <p className="text-slate-500">{globalSettings.website_name} Bank, N.A. • Member FDIC</p>
              </div>

              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/60 flex items-center justify-center text-center p-1 rotate-[-12deg]">
                <span className="text-[9px] font-bold font-mono text-emerald-800 uppercase tracking-tighter">
                  OFFICIAL BANK SEAL • VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
