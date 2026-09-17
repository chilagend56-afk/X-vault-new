import React from 'react';
import { useApp } from './AppContext';

export interface BankLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'navy' | 'dark' | 'white' | 'on-card' | 'plain';
  showText?: boolean;
  name?: string;
  subtitle?: string;
  layout?: 'horizontal' | 'vertical';
  logoUrl?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}

/**
 * The single, unified vector mark for the bank.
 * Isometric precision-engineered vault plate geometry representing security,
 * layered asset vaults, and compound financial growth.
 */
export const BankMark: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Top isometric vault plate with ambient fill & central vault diamond */}
    <path 
      d="M12 2.5L21.5 7.5L12 12.5L2.5 7.5L12 2.5Z" 
      fill="currentColor" 
      fillOpacity="0.3" 
      stroke="currentColor" 
      strokeWidth="1.9" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M12 5.75L15.25 7.5L12 9.25L8.75 7.5L12 5.75Z" 
      fill="currentColor" 
    />
    
    {/* Middle tier plate */}
    <path 
      d="M2.5 12L12 17L21.5 12" 
      stroke="currentColor" 
      strokeWidth="2.1" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Foundation base plate */}
    <path 
      d="M2.5 16.75L12 21.75L21.5 16.75" 
      stroke="currentColor" 
      strokeWidth="2.1" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

export const BankLogo: React.FC<BankLogoProps> = ({
  size = 'md',
  variant = 'navy',
  showText = true,
  name,
  subtitle,
  layout = 'horizontal',
  logoUrl,
  className = '',
  iconClassName = '',
  textClassName = '',
  onClick,
}) => {
  // Gracefully attempt to get website_name and logo_url from AppContext if not provided
  let contextName = '';
  let contextLogo = '';
  let contextMode = 'default';
  try {
    const appContext = useApp();
    contextName = appContext?.globalSettings?.website_name || '';
    contextLogo = appContext?.globalSettings?.logo_url || '';
    contextMode = appContext?.globalSettings?.logo_mode || (contextLogo ? 'custom' : 'default');
  } catch (e) {
    // Rendered outside AppContext (e.g. standalone)
    contextName = 'SmartVault';
  }

  const displayName = name || contextName || 'SmartVault';
  const effectiveLogo = logoUrl || (contextMode === 'custom' || (!logoUrl && contextLogo) ? contextLogo : '');

  // Sizing definitions
  const sizeStyles = {
    xs: {
      container: 'w-5 h-5 rounded-md p-0.5',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs font-bold',
      sub: 'text-[9px]',
      gap: 'gap-1.5'
    },
    sm: {
      container: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-1',
      icon: 'w-5 h-5',
      text: 'text-sm sm:text-base font-bold',
      sub: 'text-[10px]',
      gap: 'gap-2'
    },
    md: {
      container: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-1.5',
      icon: 'w-6 h-6',
      text: 'text-base sm:text-lg font-bold',
      sub: 'text-[11px]',
      gap: 'gap-2.5'
    },
    lg: {
      container: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1.5',
      icon: 'w-7 h-7',
      text: 'text-xl sm:text-2xl font-bold',
      sub: 'text-xs',
      gap: 'gap-3'
    },
    xl: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-3 shadow-2xl',
      icon: 'w-14 h-14',
      text: 'text-3xl sm:text-4xl font-bold',
      sub: 'text-sm',
      gap: 'gap-4'
    }
  }[size];

  // Variant styling for the icon badge
  const variantStyles = {
    navy: 'bg-gradient-to-tr from-[#0a1e3b] via-[#0f274a] to-[#1e3a8a] text-white shadow-xs border border-white/10 ring-1 ring-blue-900/40',
    dark: 'bg-slate-900 text-white shadow-xs border border-slate-800',
    white: 'bg-white text-slate-900 shadow-xs border border-slate-200',
    'on-card': 'bg-white/15 backdrop-blur-xs text-white border border-white/25 shadow-xs',
    plain: 'bg-transparent text-current'
  }[variant];

  // Text color based on variant if not overridden
  const defaultTextColor = 
    variant === 'on-card' 
      ? 'text-white' 
      : 'text-slate-900';

  const isVertical = layout === 'vertical';

  return (
    <div
      onClick={onClick}
      className={`inline-flex ${isVertical ? 'flex-col items-center text-center' : 'items-center text-left'} ${sizeStyles.gap} ${onClick ? 'cursor-pointer select-none' : ''} ${className}`}
    >
      {/* Icon Badge / Custom Logo */}
      <div
        className={`flex items-center justify-center flex-shrink-0 transition-transform ${
          effectiveLogo 
            ? `${sizeStyles.container} bg-transparent border-0 shadow-none p-0 overflow-visible` 
            : `overflow-hidden ${sizeStyles.container} ${variantStyles}`
        } ${iconClassName}`}
      >
        {effectiveLogo ? (
          <img 
            src={effectiveLogo} 
            alt={displayName} 
            className="w-full h-full max-h-full max-w-full object-contain drop-shadow-none"
          />
        ) : (
          <BankMark className={sizeStyles.icon} />
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col min-w-0 ${isVertical ? 'items-center' : ''}`}>
          <span
            className={`font-sans tracking-tight leading-none truncate ${sizeStyles.text} ${textClassName || defaultTextColor}`}
          >
            {displayName}
          </span>
          {subtitle && (
            <span className={`text-slate-400 font-medium tracking-wide mt-0.5 ${sizeStyles.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
