import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  Smartphone, 
  Download, 
  Landmark, 
  Lock, 
  CreditCard, 
  PiggyBank, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Star,
  FileText,
  Clock,
  HelpCircle,
  Building,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useApp } from '../components/AppContext';
import { BankLogo } from '../components/BankLogo';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { globalSettings } = useApp();
  const [activeSegment, setActiveSegment] = useState<'personal' | 'business' | 'wealth'>('personal');
  const [activeCardColor, setActiveCardColor] = useState<'navy' | 'slate' | 'emerald'>('navy');
  const [calculatorDeposit, setCalculatorDeposit] = useState<number>(25000);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const apyRate = 0.0525; // 5.25% APY
  const nationalBankRate = 0.0001; // 0.01% national average
  const vaultOneYear = calculatorDeposit * apyRate;
  const bigBankOneYear = calculatorDeposit * nationalBankRate;
  const vaultThreeYears = calculatorDeposit * Math.pow(1 + apyRate, 3) - calculatorDeposit;

  const cardStyles = {
    navy: {
      bg: 'bg-slate-900',
      accent: 'text-slate-400',
      chip: 'bg-amber-400/80',
      visa: 'text-white'
    },
    slate: {
      bg: 'bg-slate-800',
      accent: 'text-slate-400',
      chip: 'bg-amber-400/80',
      visa: 'text-slate-100'
    },
    emerald: {
      bg: 'bg-[#0f382c]',
      accent: 'text-emerald-300',
      chip: 'bg-amber-400/80',
      visa: 'text-emerald-100'
    }
  };

  const faqs = [
    {
      q: `How are my funds insured at ${globalSettings.website_name}?`,
      a: `Your deposits are insured up to $250,000 per depositor for each account ownership category through our FDIC-insured member bank charter (FDIC Certificate #35112). For high-net-worth commercial balances exceeding $250,000, we provide automated sweep network coverage protecting up to $5,000,000 in liquid reserves.`
    },
    {
      q: 'How does the 2-day early direct deposit feature work?',
      a: 'When your employer or payroll provider sends federal ACH payroll files ahead of payday, we make your funds immediately available upon receipt rather than holding them until the standard settlement date. This gives you your paycheck up to two full days earlier with zero fee.'
    },
    {
      q: 'Are there any hidden monthly maintenance fees or minimum balances?',
      a: 'None whatsoever. Standard Checking and High-Yield Savings accounts have $0 monthly maintenance charges, $0 minimum opening balance requirements, and $0 overdraft fees with our complimentary $200 buffer program.'
    },
    {
      q: 'Can I send domestic Fedwire wires and international SWIFT transfers?',
      a: 'Yes. Our platform provides complete domestic wire routing (ABA 026009593) and global SWIFT wire transfers (BIC: VLTXUS33) across 45+ currencies with competitive real-time exchange rates.'
    },
    {
      q: 'How does Mobile Check Deposit operate?',
      a: 'Simply snap high-resolution photos of the front and endorsed back of your check using any smartphone or web camera. Eligible deposits receive up to $1,000 provisional immediate credit with full clearance on the next business day.'
    }
  ];

  return (
    <div id="landing-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-5 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BankLogo size="md" onClick={() => onNavigate('landing')} />

            {/* Segment Selector Tabs */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveSegment('personal')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSegment === 'personal' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveSegment('business')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSegment === 'business' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Business & Commercial
              </button>
              <button
                onClick={() => setActiveSegment('wealth')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSegment === 'wealth' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Private Wealth
              </button>
            </div>
          </div>

          {/* Nav Quick Links & Auth Buttons */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 mr-2">
              <a href="#accounts" className="hover:text-slate-900 transition-colors">Accounts</a>
              <a href="#calculator" className="hover:text-slate-900 transition-colors">APY Calculator</a>
              <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
            </nav>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> App
              </button>
            )}

            <button 
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Sign In
            </button>

            <button 
              onClick={() => onNavigate('signup')}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black font-semibold text-xs text-white shadow-xs transition-all cursor-pointer"
            >
              Open Account
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="px-5 sm:px-8 pt-10 sm:pt-16 pb-14 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column Copy */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 w-fit text-xs text-blue-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>High-Yield Savings: 5.25% APY • Daily Compounding</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight text-slate-900">
            Commercial-grade banking with zero fees and modern speed.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
            Experience complete checking freedom, high-yield savings vaults earning 50x the national average, instant domestic & SWIFT wires, and contactless Visa debit cards backed by $250,000 FDIC insurance.
          </p>

          <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              Open Your Account in 3 Minutes <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Online Banking Login
            </button>
          </div>

          {/* Trust Highlights Strip */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-5 border-t border-slate-200/80 text-left">
            <div>
              <p className="font-sans text-xl sm:text-2xl font-bold text-slate-900">5.25%</p>
              <p className="text-slate-500 text-xs">High-Yield APY</p>
            </div>
            <div>
              <p className="font-sans text-xl sm:text-2xl font-bold text-slate-900">$0.00</p>
              <p className="text-slate-500 text-xs">Monthly Maintenance</p>
            </div>
            <div>
              <p className="font-sans text-xl sm:text-2xl font-bold text-slate-900">$250k</p>
              <p className="text-slate-500 text-xs">FDIC Deposit Insurance</p>
            </div>
          </div>
        </div>

        {/* Right Column: Physical & Virtual Debit Card Demo */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[340px] aspect-[1.586] rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 text-white">
            <div className={`absolute inset-0 ${cardStyles[activeCardColor].bg} transition-colors duration-300`} />
            
            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
              <BankLogo size="xs" variant="on-card" subtitle="Platinum Debit" />
              <span className="font-bold text-sm italic tracking-widest text-white">VISA</span>
            </div>

            {/* NFC Chip */}
            <div className="relative z-10 w-8 h-6 rounded-md bg-amber-300/80 p-0.5 border border-amber-200/50 flex items-center justify-center">
              <div className="w-full h-full border border-amber-600/40 rounded-xs" />
            </div>

            {/* Numbers & Holder */}
            <div className="relative z-10">
              <p className="font-mono text-sm sm:text-base tracking-[0.2em] text-white/95 select-none">
                •••• •••• •••• 4289
              </p>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <p className="text-[8px] text-slate-400 font-mono uppercase">CARDHOLDER</p>
                  <p className="text-xs font-mono font-semibold tracking-wider text-slate-100">CLIENT RESERVE</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400 font-mono text-right uppercase">EXPIRES</p>
                  <p className="text-xs font-mono font-semibold text-slate-100">12 / 29</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Switcher */}
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Finish:</span>
            <button 
              onClick={() => setActiveCardColor('navy')}
              className={`w-4 h-4 rounded-full bg-slate-900 border-2 ${activeCardColor === 'navy' ? 'border-blue-600 scale-110' : 'border-transparent'} transition-all cursor-pointer`}
              title="Midnight Navy"
            />
            <button 
              onClick={() => setActiveCardColor('slate')}
              className={`w-4 h-4 rounded-full bg-slate-700 border-2 ${activeCardColor === 'slate' ? 'border-blue-600 scale-110' : 'border-transparent'} transition-all cursor-pointer`}
              title="Obsidian Slate"
            />
            <button 
              onClick={() => setActiveCardColor('emerald')}
              className={`w-4 h-4 rounded-full bg-[#0f382c] border-2 ${activeCardColor === 'emerald' ? 'border-emerald-600 scale-110' : 'border-transparent'} transition-all cursor-pointer`}
              title="Emerald Green"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Physical Metal Card + Instant Apple & Google Pay Virtual Cards</p>
        </div>
      </section>

      {/* 4. INSTITUTIONAL METRICS BANNER */}
      <section className="bg-white border-y border-slate-200/80 py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2">
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">$250,000</h3>
            <p className="text-slate-500 text-xs mt-0.5">FDIC Insurance per Depositor</p>
          </div>
          <div className="p-2">
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">55,000+</h3>
            <p className="text-slate-500 text-xs mt-0.5">Surcharge-Free Allpoint ATMs</p>
          </div>
          <div className="p-2">
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">99.99%</h3>
            <p className="text-slate-500 text-xs mt-0.5">Core Banking Network Uptime</p>
          </div>
          <div className="p-2">
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-slate-900">2 Days Early</h3>
            <p className="text-slate-500 text-xs mt-0.5">Faster Direct Deposit Settlement</p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE APY INTEREST EARNINGS CALCULATOR */}
      <section id="calculator" className="py-14 px-5 sm:px-8 max-w-5xl mx-auto text-left">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Grow Your Capital</span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Calculate Your 5.25% APY Compounding Yield
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              See how much more your cash reserves earn at {globalSettings.website_name} compared to traditional brick-and-mortar big banks.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Control */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deposit Amount</label>
                  <span className="font-mono text-xl font-bold text-slate-900">
                    ${calculatorDeposit.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={250000}
                  step={1000}
                  value={calculatorDeposit}
                  onChange={(e) => setCalculatorDeposit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>$1,000</span>
                  <span>$100,000</span>
                  <span>$250,000 (FDIC Max)</span>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Institution</th>
                      <th className="p-3 font-semibold">APY Rate</th>
                      <th className="p-3 font-semibold text-right">1-Year Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-blue-50/50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {globalSettings.website_name} High-Yield
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700">5.25% APY</td>
                      <td className="p-3 font-mono font-bold text-blue-700 text-right">
                        +${vaultOneYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-500">Traditional Big Banks</td>
                      <td className="p-3 font-mono text-slate-400">0.01% APY</td>
                      <td className="p-3 font-mono text-slate-400 text-right">
                        +${bigBankOneYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Return Callout Card */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-sm">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">3-YEAR COMPOUND VALUE</span>
              <p className="font-mono text-3xl font-bold text-emerald-400">
                +${vaultThreeYears.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                In 3 years, your ${calculatorDeposit.toLocaleString()} balance grows to ${(calculatorDeposit + vaultThreeYears).toLocaleString(undefined, { maximumFractionDigits: 0 })} with daily compounding yield.
              </p>
              <button
                onClick={() => onNavigate('signup')}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Start Earning 5.25% APY
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPREHENSIVE PRODUCT SUITE */}
      <section id="accounts" className="py-14 px-5 sm:px-8 max-w-6xl mx-auto text-center">
        <div className="max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">FULL BANKING SUITE</span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
            Engineered for Modern Liquidity & Daily Life
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Every feature you expect from an established national bank, elevated with instant digital intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {/* Product 1: Checking */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900">Smart Checking</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                $0 monthly maintenance fee, no minimum balance, and early direct deposit up to 2 days faster.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Free ACH transfers</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> $200 overdraft buffer</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 55k+ Allpoint ATMs</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('signup')} className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              Explore Checking <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Product 2: High Yield Savings */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900">High-Yield Savings & CDs</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Earn 5.25% APY compounding daily with unlimited withdrawals to your checking account.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 5.25% daily APY</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Fixed term CD ladders</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Automated round-up rules</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('signup')} className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              Explore Savings <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Product 3: Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900">Visa Debit & Controls</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Contactless physical metal cards and on-demand virtual cards with in-app security freezing.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 0% foreign transaction fee</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Apple Pay & Google Pay</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Travel notice automation</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('signup')} className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              Explore Cards <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Product 4: Commercial Treasury */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="font-sans text-sm font-bold text-slate-900">Domestic & SWIFT Wires</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Same-day Fedwire domestic transfers and global SWIFT cross-border wires in 45+ currencies.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Fedwire cutoff 4:00 PM EST</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Real-time tracking receipts</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Batch commercial payroll</li>
              </ul>
            </div>
            <button onClick={() => onNavigate('signup')} className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              Explore Wires <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. REGULATORY & SECURITY VERIFICATION */}
      <section id="security" className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          <div className="lg:col-span-7">
            <div className="w-fit px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold mb-3">
              FEDERAL REGULATORY STANDARDS
            </div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold leading-tight text-slate-900">
              Your security, privacy, and assets are strictly protected.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
              Every connection is encrypted with industry-standard TLS 1.3 cryptographic protocols. We maintain independent SOC 2 audits, biometric two-factor authentication, and segregated reserve accounts.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                "256-bit AES cryptographic encryption in transit and at rest",
                "Two-factor authentication (2FA) & biometric FaceID support",
                "Instant one-touch debit card freezing & travel notices",
                "Continuous 24/7 automated AI fraud detection & alert engine",
                "Official monthly e-Statements & Form 1099-INT tax reporting",
                "Remote deposit capture with automatic MICR verification"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full max-w-sm shadow-xs text-center">
              <Shield className="w-10 h-10 text-slate-800 mx-auto mb-3" />
              <h4 className="font-sans text-sm font-bold text-slate-900">FDIC Deposit Insurance</h4>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Eligible deposits are insured up to $250,000 per depositor through our partner banking network under FDIC Certificate #35112.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>CERTIFICATE: #35112</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">MEMBER FDIC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLIENT TESTIMONIALS */}
      <section className="py-14 px-5 sm:px-8 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto text-left">
          <div className="mb-8">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">VERIFIED REVIEWS</span>
            <h2 className="font-sans text-2xl font-bold text-slate-900 mt-1">
              Trusted by Over 140,000 Individuals and Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: `The 5.25% APY compounding yield has added thousands to our company's idle cash reserves. Wire transfers execute cleanly within minutes.`,
                author: 'Marcus Vance',
                role: 'Chief Financial Officer, Vance Logistics',
                stars: 5
              },
              {
                quote: `Setting up direct deposit was seamless with the pre-filled form. Getting paid two days earlier every pay period is a game changer.`,
                author: 'Sarah Lin',
                role: 'Senior Software Engineer, TechCorp',
                stars: 5
              },
              {
                quote: `The card security features and remote check deposit work flawlessly. Having true commercial bank stability without the branch lines is incredible.`,
                author: 'David K. Reynolds',
                role: 'Managing Partner, Horizon Equity',
                stars: 5
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 gap-0.5 mb-3">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{t.author}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section id="faq" className="py-14 px-5 sm:px-8 max-w-4xl mx-auto text-left">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CLARITY & DISCLOSURES</span>
          <h2 className="font-sans text-2xl font-bold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. CALL TO ACTION */}
      <section className="py-14 px-5 sm:px-8 text-center bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-2xl mx-auto bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-sm">
          <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight">
            Ready to upgrade your banking experience?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Open your checking and 5.25% APY high-yield savings account in minutes with zero paperwork and instant debit card issuance.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              Open Account Now
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-xs hover:bg-slate-700 transition-all cursor-pointer"
            >
              Access Online Banking
            </button>
          </div>
        </div>
      </section>

      {/* 11. REGULATORY FOOTNOTES & DISCLOSURES */}
      <footer className="mt-auto border-t border-slate-200/80 py-10 px-5 sm:px-8 bg-white text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto space-y-6 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <BankLogo size="sm" />
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="hover:text-slate-900 cursor-pointer">Privacy Notice</span>
              <span className="hover:text-slate-900 cursor-pointer">Terms of Account</span>
              <span className="hover:text-slate-900 cursor-pointer">Electronic Fund Transfer Act</span>
              <span className="hover:text-slate-900 cursor-pointer">Security Center</span>
              <span className="hover:text-slate-900 cursor-pointer">Fee Schedule</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p>
              <strong>BANKING SERVICES & FDIC DISCLOSURE:</strong> Banking products and services are provided by {globalSettings.website_name} Bank, N.A., Member FDIC. Deposits are insured up to $250,000 per depositor, for each account ownership category under FDIC Certificate #35112.
            </p>
            <p>
              <strong>ANNUAL PERCENTAGE YIELD (APY):</strong> The 5.25% Annual Percentage Yield (APY) for High-Yield Savings is accurate as of September 2026. Rates are variable and may adjust at any time without prior notice. Fees may reduce earnings. No minimum opening deposit required.
            </p>
            <p>
              <strong>EARLY DIRECT DEPOSIT:</strong> Early access to direct deposit funds depends on the timing of the submission of the payment file from the payer. We generally make these funds available on the day the payment file is received, which may be up to 2 days earlier than the scheduled payment date.
            </p>
            <p>
              <strong>EQUAL HOUSING LENDER:</strong> We do business in accordance with federal fair lending laws. NMLS Identifier #1948201.
            </p>
            <p className="pt-2">
              © {new Date().getFullYear()} {globalSettings.website_name} Bank, N.A. All rights reserved. Member FDIC. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
