import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { BankLogo } from '../components/BankLogo';
import { dbAPI } from '../lib/supabase';
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Plus, 
  X, 
  Cpu, 
  MapPin, 
  Calendar, 
  BadgeCheck, 
  HelpCircle,
  MoreVertical,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Card } from '../types';

export const CardsPage: React.FC = () => {
  const { user, cards, toggleCardFreeze, mintNewCard, showToast, globalSettings, transactions: liveTransactions } = useApp();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Card Mint Modal States
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [mintType, setMintType] = useState<'black' | 'neon' | 'gold'>('black');
  
  // Decrypt toggle states (showing actual credit card credentials)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const activeCardId = selectedCardId || cards[0]?.id;
  const activeCard = cards.find(c => c.id === activeCardId);

  const toggleReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMintCard = (e: React.FormEvent) => {
    e.preventDefault();
    mintNewCard(mintType);
    setIsMintOpen(false);
  };

  // Beautiful themes for the active mockup cards in Screen 4
  const cardThemes = {
    black: {
      bg: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
      glow: 'shadow-slate-800/10',
      border: 'border-slate-700/50',
      textColor: 'text-slate-100',
      accentColor: 'text-slate-700',
      tag: 'OBSIDIAN CORE'
    },
    neon: {
      bg: 'from-[#0f172a] via-[#091e3a] to-[#04334c]',
      glow: 'shadow-cyan-500/10',
      border: 'border-cyan-500/30',
      textColor: 'text-slate-100',
      accentColor: 'text-slate-500',
      tag: 'ULTRAVIOLET NEON'
    },
    gold: {
      bg: 'from-[#653e01] via-[#78350f] to-[#451a03]',
      glow: 'shadow-amber-500/10',
      border: 'border-amber-500/30',
      textColor: 'text-amber-50',
      accentColor: 'text-slate-700',
      tag: 'VIP GOLD RESERVE'
    }
  };

  // List of spending transactions for cards
  const allTxs = liveTransactions && liveTransactions.length > 0 ? liveTransactions : (user ? dbAPI.getTransactions(user.id) : []);
  const cardTxs = allTxs.filter(tx => tx.category === 'Checking' || tx.category === 'Savings' || tx.category === 'Atm Card Cash');

  return (
    <div className="flex flex-col gap-4 text-left max-w-5xl mx-auto py-1">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Card Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your virtual Visa debit cards, freeze status, and authorization limits
          </p>
        </div>
        
        <button
          onClick={() => setIsMintOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Issue Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: VIRTUAL CARD PREVIEW & CONTROLS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Horizontal multi-card picker list */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {cards.map((c) => {
              const theme = cardThemes[c.type] || cardThemes.black;
              const isSelected = c.id === activeCardId;
              
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCardId(c.id)}
                  className={`flex-shrink-0 p-3 rounded-xl bg-white border text-left transition-all min-w-[150px] cursor-pointer flex flex-col justify-between shadow-2xs ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-left font-sans">
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase font-bold">
                      {theme.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block font-mono">
                      •••• {c.number.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[10px] font-mono font-bold ${c.is_frozen ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {c.is_frozen ? 'FROZEN' : 'ACTIVE'}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${c.is_frozen ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Master card mockup */}
          {activeCard && (
            <div className="w-full max-w-[420px] mx-auto">
              <div className="relative aspect-[1.586] w-full rounded-2xl overflow-hidden group select-none shadow-md">
                
                {/* Visual Card Face */}
                <div className={`w-full h-full rounded-2xl p-5 md:p-6 bg-gradient-to-br ${cardThemes[activeCard.type]?.bg || cardThemes.black.bg} border ${cardThemes[activeCard.type]?.border || cardThemes.black.border} flex flex-col justify-between relative text-white`}>
                  
                  {/* Digital overlay pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

                  {/* Header */}
                  <div className="flex justify-between items-start z-10">
                    <BankLogo 
                      size="xs" 
                      variant="on-card" 
                      subtitle={cardThemes[activeCard.type]?.tag || cardThemes.black.tag}
                    />
                    <span className="text-sm font-bold tracking-widest text-slate-200">DEBIT</span>
                  </div>

                  {/* Smart Chip design */}
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-300 to-amber-500 p-[1px]">
                      <div className="w-full h-full bg-[#1e293b] rounded-xs" />
                    </div>
                    <Cpu className="w-4 h-4 text-slate-300 opacity-60" />
                  </div>

                  {/* Card numbers with hide/show support */}
                  <div className="z-10 text-left">
                    <p className="font-mono text-base md:text-lg tracking-wider text-white">
                      {revealedIds[activeCard.id] 
                        ? activeCard.number 
                        : `••••  ••••  ••••  ${activeCard.number.slice(-4)}`
                      }
                    </p>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div className="text-left">
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">Cardholder</p>
                        <p className="text-xs font-mono font-bold tracking-wide text-white uppercase">{activeCard.holder_name}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">Expires</p>
                        <p className="text-xs font-mono font-bold text-white">{activeCard.expiry}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">CVC</p>
                        <p className="text-xs font-mono font-bold text-white">
                          {revealedIds[activeCard.id] ? activeCard.cvc : '•••'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Frozen overlay lock screen */}
                  {activeCard.is_frozen && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                      <Lock className="w-7 h-7 text-amber-400 drop-shadow-sm" />
                      <span className="text-[11px] font-sans text-white font-semibold tracking-wide">Card Temporarily Frozen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons list */}
          {activeCard && (
            <div className="grid grid-cols-2 gap-2.5 max-w-[420px] mx-auto w-full">
              <button
                onClick={() => toggleCardFreeze(activeCard.id)}
                className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  activeCard.is_frozen 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {activeCard.is_frozen ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unfreeze Card</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Freeze Card</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => toggleReveal(activeCard.id, e)}
                className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                {revealedIds[activeCard.id] ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hide Details</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reveal Details</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Structural metadata panel for selected Card */}
          {activeCard && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs max-w-[420px] mx-auto w-full text-left flex flex-col gap-3">
              <h3 className="font-sans font-bold text-slate-900 text-xs pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span>Card Specifications & Limits</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Billing Address</span>
                  <p className="text-slate-800 font-medium mt-0.5 flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>123 {globalSettings?.website_name || 'SmartVault'} Way, Suite 400</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Issuing Network</span>
                  <p className="text-slate-800 font-medium mt-0.5 text-xs">
                    Visa Debit Core Settlement
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Monthly Spending Cap</span>
                  <p className="text-slate-900 font-semibold mt-0.5 tabular-nums text-xs">
                    ${activeCard.balance_limit.toLocaleString()} USD
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Issuance Date</span>
                  <p className="text-slate-800 font-medium mt-0.5 flex items-center gap-1 text-xs">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(activeCard.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RECENT CARD spendings History block */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="mb-3">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block font-bold">SETTLEMENT ACTIVITY</span>
            <h3 className="font-sans text-sm font-bold text-slate-900">Card Transactions</h3>
          </div>

          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto no-scrollbar text-xs">
            {activeCard?.is_frozen ? (
              <p className="text-slate-500 text-xs text-center py-12 italic font-sans animate-pulse">Card temporary frozen. Securely blocking active outbox logs.</p>
            ) : cardTxs.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-12 font-sans">No recent point-of-sale spending recorded.</p>
            ) : (
              cardTxs.map((tx) => (
                <div 
                  key={tx.id} 
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="text-left font-sans">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{tx.description}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 tracking-wider uppercase font-semibold font-mono">{tx.category} // VISA SETTLE</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    -${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs leading-relaxed text-slate-500 text-left font-sans">
            <HelpCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">About Virtual Spending</span>
              <p className="mt-1 leading-relaxed text-[11px]">
                Visa secure tokens let you checkout safely online without exposing your physical plastic credentials. Freeze status updates immediately across global settlement networks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW CARD POPUP MODAL */}
      {isMintOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsMintOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white border border-slate-200/90 shadow-xl rounded-2xl p-5 text-left overflow-hidden">
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-slate-900">Issue Virtual Debit Card</h3>
                <p className="text-[11px] text-slate-500">Instant digital credentials for online payments</p>
              </div>
              <button onClick={() => setIsMintOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMintCard} className="flex flex-col gap-3.5">
              
              {/* Type selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase font-sans">Card Tier & Finish</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'black', label: 'Obsidian', color: 'bg-slate-900 text-white' },
                    { id: 'neon', label: 'Indigo', color: 'bg-indigo-950 text-indigo-200' },
                    { id: 'gold', label: 'Gold', color: 'bg-amber-950 text-amber-200' }
                  ].map((option) => {
                    const isSelected = mintType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setMintType(option.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${option.color} ${
                          isSelected ? 'font-semibold ring-2 ring-blue-600/30 border-blue-600' : 'opacity-60 border-transparent hover:opacity-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specs limits summary info block */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Monthly Limit:</span>
                  <span className="font-mono text-slate-900 font-bold tabular-nums">
                    {mintType === 'black' && '$50,000.00'}
                    {mintType === 'neon' && '$100,000.00'}
                    {mintType === 'gold' && '$250,000.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Card Issuance Fee:</span>
                  <span className="text-emerald-700 font-semibold font-mono">$0.00 (Complimentary)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Activation:</span>
                  <span className="text-slate-900 font-semibold">Immediate</span>
                </div>
              </div>

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMintOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs text-center cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs cursor-pointer text-center font-sans shadow-xs"
                >
                  Issue Card Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
