import React, { useState, useMemo } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { 
  Search, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  ListFilter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { user, showToast, transactions: liveTransactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Load complete live transactions from context and database
  const transactions = useMemo(() => {
    if (liveTransactions && liveTransactions.length > 0) return liveTransactions;
    return user ? dbAPI.getTransactions(user.id) : [];
  }, [user, liveTransactions]);

  // Combined search and filtering logic
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'deposit' && tx.type !== 'deposit' && tx.type !== 'receive') return false;
        if (activeCategory === 'send' && tx.type !== 'send' && tx.type !== 'withdrawal') return false;
        if (activeCategory === 'crypto' && tx.category !== 'Crypto') return false;
        if (activeCategory === 'lifestyle' && tx.category !== 'Lifestyle') return false;
      }
      
      // Text Search search term
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term)
      );
    });
  }, [transactions, searchTerm, activeCategory]);

  // EXPORT TRANSACTIONS ENGINE
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      showToast('Export Rejected', 'No transaction logs match your active filters to assemble.', 'error');
      return;
    }

    // Assemble CSV headers and columns
    const headers = ['Transaction ID', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'State', 'Logged Chrono'];
    const rows = filteredTxs.map(tx => [
      tx.id,
      `"${tx.description}"`,
      tx.category,
      tx.type,
      tx.amount.toFixed(2),
      tx.currency,
      tx.status,
      tx.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Download triggers
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neo_vault_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      'Ledger Exported', 
      `Successfully generated CSV package for ${filteredTxs.length} transaction entries.`, 
      'success'
    );
  };

  return (
    <div id="transactions-window" className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse complete cryptographic, fiat, and bank wire transaction logs. PCIe secure.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-slate-700 border border-blue-500/20 text-xs font-semibold cursor-pointer transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Ledger CSV
        </button>
      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <div className="p-4 glass-panel rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* SEARCH INPUT */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs text-slate-900"
          />
        </div>

        {/* QUICK CATEGORY CHIP GRID */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Signals' },
            { id: 'deposit', label: 'Credits' },
            { id: 'send', label: 'Debits' },
            { id: 'crypto', label: 'Crypto Node' },
            { id: 'lifestyle', label: 'Lifestyle Point' }
          ].map((cat) => {
            const isSel = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-3 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  isSel 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* HISTORIC TRANSACTION TABLE */}
      <div className="glass-panel rounded-2xl border border-slate-200 p-6 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          {filteredTxs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ListFilter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-sm font-semibold">No transactions found matching active keywords.</p>
              <button 
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="mt-3 text-xs text-slate-500 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-mono uppercase tracking-wider text-gray-500">
                  <th className="pb-3 text-left">Signal ID</th>
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-left">Settle Date</th>
                  <th className="pb-3 text-left">Verification Status</th>
                  <th className="pb-3 text-right">Transaction Weight</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => {
                  const isIncoming = tx.type === 'deposit' || tx.type === 'receive';
                  return (
                    <tr key={tx.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-left font-mono text-gray-500 text-[10px]">
                        {tx.id}
                      </td>
                      <td className="py-4 text-left flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isIncoming ? 'bg-emerald-500/10 text-slate-500' : 'bg-rose-500/10 text-slate-500'
                        }`}>
                          {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{tx.description}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Settle Network: Cryptographic</p>
                        </div>
                      </td>
                      <td className="py-4 text-left font-mono">
                        <span className="bg-slate-50 px-2.5 py-1 rounded text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 text-left text-slate-500">
                        {new Date(tx.created_at).toLocaleDateString()} at{' '}
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 text-left">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            VERIFIED_NODE
                          </span>
                        </div>
                      </td>
                      <td className={`py-4 text-right font-display font-bold text-sm tabular-nums ${isIncoming ? 'text-slate-500' : 'text-slate-500'}`}>
                        {isIncoming ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
