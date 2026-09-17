import React, { useState, useRef } from 'react';
import { useApp } from '../components/AppContext';
import { BankLogo } from '../components/BankLogo';
import { Shield, Mail, Lock, User, RefreshCw, KeyRound, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { handleLogin, handleSignUp, showToast, globalSettings } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Forgot password states
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        if (!email || !password || !loginPin) {
          setErrorMsg('Please enter your email, password, and 4-digit security PIN.');
          setLoading(false);
          return;
        }
        if (loginPin.length !== 4) {
          setErrorMsg('Security PIN must be exactly 4 digits.');
          setLoading(false);
          return;
        }
        const res = await handleLogin(email, password, loginPin);
        if (res.success) {
          onNavigate('dashboard');
        } else {
          setErrorMsg(res.error);
        }
      } else if (mode === 'signup') {
        if (!email || !fullName || !loginPin || !transactionPin) {
          setErrorMsg('Please complete all fields to open your account.');
          setLoading(false);
          return;
        }
        if (loginPin.length !== 4 || transactionPin.length !== 4) {
          setErrorMsg('Login PIN and Transaction PIN must be exactly 4 digits.');
          setLoading(false);
          return;
        }
        if (!avatarUrl) {
          setErrorMsg('Please provide a profile photo for verification.');
          setLoading(false);
          return;
        }
        const res = await handleSignUp(email, fullName, loginPin, transactionPin, currency, avatarUrl);
        if (res.success) {
          onNavigate('dashboard');
        } else {
          setErrorMsg(res.error);
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMsg('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        setResetSent(true);
        showToast('Reset Link Sent', `Password reset instructions sent to ${email}`, 'success');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col justify-between overflow-hidden font-sans">
      
      {/* Top Banner Navigation */}
      <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex justify-between items-center z-10">
        <button 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Bank-Grade 256-Bit SSL Encryption
        </span>
      </div>

      {/* Middle Form Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 z-10">
        <div className="w-full max-w-[420px]">
          {/* BANK LOGO */}
          <div className="flex justify-center mb-5">
            <BankLogo 
              size="lg" 
              onClick={() => onNavigate('landing')} 
            />
          </div>

          {/* COMPACT AUTH CONTAINER */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
            <div className="text-center mb-5">
              <h3 className="font-sans text-xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' && 'Sign In to Online Banking'}
                {mode === 'signup' && 'Open a Bank Account'}
                {mode === 'forgot' && 'Reset Account Password'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {mode === 'login' && 'Access your accounts, cards, and instant transfers securely.'}
                {mode === 'signup' && 'Open your multi-currency checking account in minutes.'}
                {mode === 'forgot' && 'Enter your registered email address to receive reset instructions.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              
              {mode === 'signup' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Profile Verification Photo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 cursor-pointer transition-all"
                    >
                      {avatarUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={avatarUrl} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover shadow-xs border border-slate-200" />
                          <span className="text-xs font-medium text-blue-600">Change Photo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 py-1 text-slate-500">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-medium">Upload photo for ID verification</span>
                        </div>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Full Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="First and Last Name" 
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-sans text-xs text-slate-900"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Primary Account Currency</label>
                    <div className="relative">
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-sans text-xs text-slate-900 cursor-pointer"
                        disabled={loading}
                      >
                        <option value="USD">USD ($) - United States Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound Sterling</option>
                        <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                        <option value="AUD">AUD (A$) - Australian Dollar</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-sans text-xs text-slate-900"
                    disabled={loading}
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => { setMode('forgot'); setErrorMsg(null); }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-sans text-xs text-slate-900"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* LOGIN PIN REQUIREMENT */}
                  {mode === 'login' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-700">4-Digit Security PIN</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password"
                          maxLength={4}
                          value={loginPin}
                          onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-mono text-center text-sm font-bold tracking-[0.5em] text-slate-900"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* SIGN UP PINS REQUIREMENT */}
                  {mode === 'signup' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-700">Set Login PIN</label>
                        <div className="relative">
                          <KeyRound className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="password"
                            maxLength={4}
                            value={loginPin}
                            onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full pl-8 pr-2 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-mono text-center text-xs font-bold tracking-[0.3em] text-slate-900"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-700">Set Transfer PIN</label>
                        <div className="relative">
                          <Shield className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="password"
                            maxLength={4}
                            value={transactionPin}
                            onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••"
                            className="w-full pl-8 pr-2 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-mono text-center text-xs font-bold tracking-[0.3em] text-slate-900"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ACTION BUTTON */}
              {resetSent ? (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs">
                  A password reset email has been dispatched to <strong>{email}</strong>. Please check your inbox.
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black font-semibold text-white text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {!loading && (mode === 'login' ? 'Sign In Securely' : mode === 'signup' ? 'Open Account Now' : 'Send Reset Link')}
                </button>
              )}
            </form>

            {/* FOOTER SWITCHER */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-center gap-1.5 text-xs">
              <span className="text-slate-500">
                {mode === 'login' && "Don't have an online account?"}
                {mode === 'signup' && 'Already enrolled in online banking?'}
                {mode === 'forgot' && 'Remember your password?'}
              </span>
              <button 
                type="button"
                className="text-blue-600 font-semibold hover:text-blue-800 cursor-pointer"
                onClick={() => {
                  setErrorMsg(null);
                  setResetSent(false);
                  if (mode === 'login') setMode('signup');
                  else if (mode === 'signup') setMode('login');
                  else setMode('login');
                }}
              >
                {mode === 'login' ? 'Apply Now' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="py-4 px-6 text-center text-[11px] text-slate-500 border-t border-slate-200/60 bg-white/50 z-10">
        Member FDIC • Equal Housing Lender • © {new Date().getFullYear()} {globalSettings.website_name}. All rights reserved.
      </div>
    </div>
  );
};
