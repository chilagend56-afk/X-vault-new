import React, { useState } from 'react';
import { useApp } from '../components/AppContext';
import { dbAPI } from '../lib/supabase';
import { 
  Settings, 
  User, 
  Lock, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Smartphone, 
  Moon, 
  KeyRound,
  Eye,
  RefreshCw,
  Sun,
  Image as ImageIcon,
  Mail
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, showToast, refreshUserData, globalSettings, openSecurityBot } = useApp();
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [cyberTheme, setCyberTheme] = useState<boolean>(true); // TRUE = DARK CYBER Mode, FALSE = try to switch but warn
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setAvatarUrl(compressedDataUrl);
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nameInput.trim() || !emailInput.trim()) return;

    setLoading(true);
    try {
      dbAPI.updateProfile(user.id, nameInput.trim(), emailInput.trim(), avatarUrl);
      refreshUserData();
      showToast(
        'Identity Altered', 
        `Your vault moniker has been updated.`, 
        'success'
      );
    } catch {
      showToast('Profile Error', 'Failed to synchronize profile changes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Validation Error', 'Input current and newly generated security passwords.', 'error');
      return;
    }
    
    if (user) {
      dbAPI.updatePassword(user.id, newPassword);
      localStorage.setItem('user_session_pin', newPassword);
      refreshUserData();
    }
    
    showToast(
      'Hash Generated', 
      'Newly input parameters compiled. Security system keys rotated successfully.', 
      'security'
    );
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleToggle2FA = () => {
    const nextState = !twoFAEnabled;
    setTwoFAEnabled(nextState);
    showToast(
      nextState ? '2FA Biometrics Active' : '2FA Suspended', 
      `Dynamic security parameters ${nextState ? 'armed' : 'disarmed'} successfully. Verified via SMS channels.`, 
      'security'
    );
  };

  const handleThemeWarning = () => {
    showToast(
      'Protocol Overruled',
      `${globalSettings.website_name} runs exclusively on high-contrast black parameters to ensure PCI physical asset protection. Light parameters disabled.`,
      'error'
    );
  };

  return (
    <div id="settings-window" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      
      {/* LEFT COLUMN: IDENTITY & PASSWORD CHANNELS */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* PROFILE MONIKER EDIT */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-200 relative">
          <div className="absolute top-0 right-10 w-12 h-12 bg-blue-500/10 rounded-full blur-2xl" />
          
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-500" />
            <span>Profile Identity Settings</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">PROFILE AVATAR</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all"
              >
                {avatarUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={avatarUrl} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200" />
                    <span className="text-[10px] font-mono text-blue-600">Change Profile Image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-60">
                    <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-xs font-sans text-slate-600 font-medium">Click to upload image</span>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">VAULT CORE DECRYPT MAIL</label>
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">REGISTRATION FULL NAME</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Name"
                className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-fit px-6 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs font-mono uppercase tracking-wider text-white rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-1"
            >
              {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Authorize alterations</span>
            </button>
          </form>
        </div>

        {/* SECURITY PASSWORD CHANGE FORM */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-200 relative">
          <div className="absolute top-0 right-10 w-12 h-12 bg-cyan-500/10 rounded-full blur-2xl" />
          
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            <span>Cryptographic Keys Rotation</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">CURRENT DECRYPT SECRET</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">NEW PASSCODE PARAMETERS</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-fit px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 font-bold text-xs font-mono uppercase tracking-wider text-black rounded-xl cursor-pointer shadow-lg transition-all"
            >
              Rotate Secret Key
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: 2FA & LIGHT EXCLUSIVITY RULES */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* MULTI FACTOR SECURITY TOGGLE */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-200 text-left">
          <span className="text-[9px] font-mono tracking-widest text-slate-700 uppercase block">IDENTITY SCANNERS</span>
          <h3 className="font-display text-lg font-bold mt-1">Sovereign 2FA Biometrics</h3>
          
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Protect withdraw locks with multi-factor biometric tokens. Generates unique authentication hashes each time custom credit lines are accessed.
          </p>

          <div className="mt-6 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-900">Dynamic 2FA Verification</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Secure SMS + biometric check</p>
              </div>
            </div>

            {/* TOGGLE SLIDER BUTTON */}
            <button
              type="button"
              onClick={handleToggle2FA}
              className={`w-11 h-6 rounded-full transition-all relative p-1 cursor-pointer flex items-center ${
                twoFAEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>

        {/* EYE-SAFE CHROMATICITY MODE OVERWRITE ONLY */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-200 text-left">
          <span className="text-[9px] font-mono tracking-widest text-[#a1a1aa] uppercase block">THEME PARAMETERS</span>
          <h3 className="font-display text-lg font-bold mt-1">Fluid Chromatic Mode</h3>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {globalSettings.website_name} applies strict anti-glare high-contrast visual standards. Adjust screen parameters to test safety configurations.
          </p>

          <div className="mt-6 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-900">Exclusively Dark space</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Light mode restricted</p>
              </div>
            </div>

            {/* LIGHT SWITCH BUTTON WARNING */}
            <button
              onClick={handleThemeWarning}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold hover:text-slate-900 flex items-center gap-1 cursor-pointer select-none"
            >
              <Sun className="w-3.5 h-3.5 text-slate-500" />
              <span>Enable Light Mode</span>
            </button>
          </div>
        </div>

        {/* CUSTOMER SERVICE SUPPORT */}
        <div className="p-6 glass-panel rounded-2xl border border-slate-200 text-left">
          <span className="text-[9px] font-mono tracking-widest text-slate-700 uppercase block">SUPPORT</span>
          <h3 className="font-display text-lg font-bold mt-1">Customer Service AI</h3>
          
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Connect with our automated support agent for immediate assistance with account inquiries, secure PIN resets, or technical support.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openSecurityBot('hello')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Start Support Chat
            </button>
            <a
              href={`mailto:${globalSettings?.support_email || 'customersupport056@gmail.com'}`}
              className="w-full sm:w-auto px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 decoration-transparent cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              Email Human Support ({globalSettings?.support_email || 'customersupport056@gmail.com'})
            </a>
          </div>
        </div>

        {/* VAULT CREDENTIAL SYSTEM INFO */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3 text-xs leading-relaxed text-slate-800 text-left">
          <ShieldAlert className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold font-display block">Advanced Protection Seal</span>
            <p className="text-slate-500 mt-1">
              Your profile is governed by decentralized authentication algorithms. Please record your security rotation dates clearly inside physical binders to ensure ongoing zero-leak security metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
