import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowRightLeft, 
  HelpCircle,
  Copy,
  CheckCircle,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const CryptoPage: React.FC = () => {
  const { user, cryptoWallets, accounts, processCryptoTrade, showToast, openSecurityBot, globalSettings } = useApp();
  const [selectedCoinId, setSelectedCoinId] = useState<'btc' | 'eth' | 'sol'>('btc');
  
  // Trade Forms
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [coinAmountInput, setCoinAmountInput] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCoin = cryptoWallets.find(w => w.coin_id === selectedCoinId);
  const usdAccount = accounts.find(a => a.type === 'usd');
  const usdMax = usdAccount?.balance ?? 0;

  // Render mock historic price chart lines depending on currently chosen Coin
  const coinHistories = {
    btc: [
      { date: '06/07', price: 63200 },
      { date: '06/08', price: 64100 },
      { date: '06/09', price: 65900 },
      { date: '06/10', price: 65400 },
      { date: '06/11', price: 66800 },
      { date: '06/12', price: 66400 },
      { date: '06/13', price: activeCoin?.current_price ?? 67120.40 }
    ],
    eth: [
      { date: '06/07', price: 2950 },
      { date: '06/08', price: 3010 },
      { date: '06/09', price: 3180 },
      { date: '06/10', price: 3120 },
      { date: '06/11', price: 3340 },
      { date: '06/12', price: 3290 },
      { date: '06/13', price: activeCoin?.current_price ?? 3480.95 }
    ],
    sol: [
      { date: '06/07', price: 122 },
      { date: '06/08', price: 130 },
      { date: '06/09', price: 145 },
      { date: '06/10', price: 141 },
      { date: '06/11', price: 159 },
      { date: '06/12', price: 150 },
      { date: '06/13', price: activeCoin?.current_price ?? 154.22 }
    ]
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText('0x7F2be9819cdE98C1204dFE3190ab7cCaD28C9130');
    showToast('Address Copied', 'EVM blockchain receive address saved to clipboard key registers.', 'success');
  };

  const onSubmitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinAmountInput || !activeCoin) return;

    if (!transactionPin || transactionPin.length !== 4) {
      showToast('PIN Required', 'Please enter your 4-digit transaction safety PIN to execute this trade.', 'error');
      return;
    }

    const expectedPin = user?.transaction_pin || '4321';
    if (transactionPin !== expectedPin) {
      showToast('PIN Validation Failed', 'Incorrect Secure PIN. Trade rejected.', 'error');
      return;
    }

    const valueNum = parseFloat(coinAmountInput);
    if (isNaN(valueNum) || valueNum <= 0) {
      showToast('Trade Failure', 'Provide a decimal token size exceeding zero.', 'error');
      return;
    }

    const totalUSDValue = valueNum * activeCoin.current_price;

    if (tradeAction === 'buy') {
      if (totalUSDValue > usdMax) {
        showToast('Trade Refused', 'Your USD Account balance limits are insufficient for this size.', 'error');
        return;
      }
    } else {
      if (valueNum > activeCoin.balance) {
        showToast('Trade Refused', 'You do not hold that volume of digital assets.', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await processCryptoTrade(selectedCoinId, tradeAction, valueNum);
      if (res.success) {
        setCoinAmountInput('');
        setTransactionPin('');
      }
    } catch (err) {
      showToast('Ledger Sync Error', 'Trading queue reported core errors.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="crypto-window" className="flex flex-col gap-4 text-left max-w-6xl mx-auto py-1">
      {/* Page Header */}
      <div>
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Digital Asset Treasury
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute institutional spot buy/sell orders and manage custodial cryptocurrency holdings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ACTIVE ASSETS LIST & CHARTS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* ASSET SELECTOR TILES */}
          <div className="grid grid-cols-3 gap-2.5">
            {cryptoWallets.map((wallet, idx) => {
              const isSelected = wallet.coin_id === selectedCoinId;
              const isUp = wallet.price_change_24h >= 0;
              return (
                <button
                  key={`${wallet.coin_id}-${idx}`}
                  onClick={() => setSelectedCoinId(wallet.coin_id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-2xs ${
                    isSelected 
                      ? 'bg-white border-blue-600 ring-2 ring-blue-600/10' 
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {wallet.symbol}
                    </span>
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isUp ? '+' : ''}{wallet.price_change_24h}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Balance</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm font-bold text-slate-900 font-mono">{wallet.balance.toFixed(4)}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                      ≈ ${(wallet.balance * wallet.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ASSET SPECIFIC CHART */}
          {activeCoin && (
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block font-semibold">
                    MARKET BENCHMARK
                  </span>
                  <h3 className="font-sans text-base font-bold text-slate-900 mt-0.5">
                    {activeCoin.name} Spot Price: ${activeCoin.current_price.toLocaleString()} USD
                  </h3>
                </div>

                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  activeCoin.price_change_24h >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}>
                  {activeCoin.price_change_24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{activeCoin.price_change_24h > 0 ? '+' : ''}{activeCoin.price_change_24h}% (24h)</span>
                </div>
              </div>

              <div className="h-[220px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={coinHistories[selectedCoinId]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => `$${v.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#93c5fd' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2563eb" 
                      strokeWidth={2} 
                      dot={{ r: 3, strokeWidth: 0, fill: '#2563eb' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* BLOCKCHAIN RECEIVE WALLET INFO */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block font-semibold">CUSTODY DEPOSIT GATEWAY</span>
            <h4 className="font-sans text-xs font-bold text-slate-900 mt-0.5">Account Inward Settlement Address</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Use this multi-chain address to deposit supported digital assets directly into your {globalSettings.website_name} treasury.
            </p>

            <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between font-mono text-xs text-slate-800">
              <span className="truncate mr-2 text-[11px]">0x7F2be9819cdE98C1204dFE3190ab7cCaD28C9130</span>
              <button 
                type="button" 
                onClick={handleCopyHash}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer select-none"
                title="Copy receiver address"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COIN TRADE SLIDER */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* TRADE CONTROL BOARD */}
          {activeCoin && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs relative">
              <h3 className="font-sans text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-slate-700" />
                <span>Trade Execution Desk</span>
              </h3>

              {/* ACTION SELECTOR */}
              <div className="p-1 bg-slate-100 rounded-xl flex gap-1 mb-3.5">
                <button
                  type="button"
                  onClick={() => setTradeAction('buy')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tradeAction === 'buy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Buy {activeCoin.symbol}
                </button>
                <button
                  type="button"
                  onClick={() => setTradeAction('sell')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tradeAction === 'sell' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sell {activeCoin.symbol}
                </button>
              </div>

              <form onSubmit={onSubmitTrade} className="flex flex-col gap-3">
                {/* WALLET DEPT LIMIT BANNER */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Available Cash (USD):</span>
                    <span className="font-mono text-slate-900 font-bold">${usdMax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Held {activeCoin.symbol}:</span>
                    <span className="font-mono text-slate-900 font-semibold">{activeCoin.balance} {activeCoin.symbol}</span>
                  </div>
                </div>

                {/* TOKEN DIGITS SIZE INPUT */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {tradeAction === 'buy' ? 'Buy Order Quantity' : 'Sell Order Quantity'} ({activeCoin.symbol})
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={coinAmountInput}
                      onChange={(e) => setCoinAmountInput(e.target.value)}
                      placeholder="0.00"
                      step="any"
                      className="w-full pl-3.5 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-xs font-mono"
                      required
                      disabled={loading}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                      {activeCoin.symbol}
                    </span>
                  </div>
                </div>

                {/* CONVERSIONS SUMMARY TEXT */}
                {coinAmountInput && !isNaN(parseFloat(coinAmountInput)) && (
                  <div className="p-3 bg-slate-50 text-xs font-mono rounded-xl border border-slate-200/80 flex flex-col gap-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Rate:</span>
                      <span>${activeCoin.current_price.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span>Estimated Value:</span>
                      <span className="text-blue-600">
                        ${(parseFloat(coinAmountInput) * activeCoin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                )}

                {/* TRANSACTION PIN CHECK */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Security / ATM PIN</label>
                    <button
                      type="button"
                      onClick={() => openSecurityBot('forgot_transaction_pin')}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-mono text-center text-xs font-bold tracking-[0.4em] text-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-1 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black font-semibold text-xs text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Order...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Submit Spot Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
