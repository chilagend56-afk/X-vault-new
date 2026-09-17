import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  Check, 
  ChevronDown, 
  Globe, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { 
  ExternalInstitution, 
  EXTERNAL_INSTITUTIONS, 
  EXTERNAL_CATEGORIES 
} from '../data/externalBanks';

interface ExternalBankPickerProps {
  selectedInstitution: ExternalInstitution | null;
  onSelect: (institution: ExternalInstitution) => void;
  disabled?: boolean;
}

export const ExternalBankPicker: React.FC<ExternalBankPickerProps> = ({
  selectedInstitution,
  onSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return EXTERNAL_INSTITUTIONS.filter(inst => {
      // Category match
      let matchCategory = true;
      if (activeCategory === 'popular') {
        matchCategory = !!inst.popular;
      } else if (activeCategory !== 'all') {
        matchCategory = inst.category === activeCategory;
      }

      if (!matchCategory) return false;

      // Search match
      if (!query) return true;

      return (
        inst.name.toLowerCase().includes(query) ||
        inst.shortName.toLowerCase().includes(query) ||
        inst.country.toLowerCase().includes(query) ||
        inst.countryCode.toLowerCase().includes(query) ||
        inst.routingType.toLowerCase().includes(query) ||
        (inst.defaultRouting && inst.defaultRouting.includes(query)) ||
        (inst.swiftBic && inst.swiftBic.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, activeCategory]);

  const handleSelect = (inst: ExternalInstitution) => {
    onSelect(inst);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomBank = () => {
    const customInst: ExternalInstitution = {
      id: `custom-${Date.now()}`,
      name: searchQuery.trim(),
      shortName: searchQuery.trim(),
      category: 'major_bank',
      country: 'United States / Global',
      countryCode: 'US',
      currency: 'USD',
      routingType: 'ACH / Routing',
      fieldLabel: 'Account Number & Routing / IBAN',
      placeholder: 'Enter account number and routing/BIC code',
      badge: '1-2 Days',
      accentColor: '#1E293B'
    };
    onSelect(customInst);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Instant':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Real-time':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Fedwire':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Same Day':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="relative text-left w-full" ref={dropdownRef}>
      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
        <span>Destination Bank / Financial Platform</span>
        <span className="text-[10px] font-normal text-blue-600">
          50+ Banks & Networks Available
        </span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs ${
          isOpen 
            ? 'border-blue-600 ring-2 ring-blue-600/15' 
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {selectedInstitution ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shadow-2xs flex-shrink-0"
              style={{ backgroundColor: selectedInstitution.accentColor || '#1E293B' }}
            >
              {selectedInstitution.shortName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedInstitution.name}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${getBadgeStyle(selectedInstitution.badge)}`}>
                  {selectedInstitution.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {selectedInstitution.country} • {selectedInstitution.routingType}
                {selectedInstitution.defaultRouting && ` (ABA: ${selectedInstitution.defaultRouting})`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Search or select bank, payment app, or wire rail...</span>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {/* Popover Dropdown Picker */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[460px] animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header & Search Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bank name, ABA routing, SWIFT BIC, or country..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar select-none text-[10px]">
              {EXTERNAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Popular Shortcut Badges (when not searching) */}
          {!searchQuery && activeCategory === 'all' && (
            <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 bg-white">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Popular Quick Selection
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EXTERNAL_INSTITUTIONS.filter(i => i.popular).slice(0, 8).map(inst => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelect(inst)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 border border-slate-200/90 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: inst.accentColor }} 
                    />
                    {inst.shortName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Institutions List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[300px] overscroll-contain">
            {filteredInstitutions.length > 0 ? (
              filteredInstitutions.map((inst) => {
                const isSelected = selectedInstitution?.id === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleSelect(inst)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/80 hover:bg-blue-50' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Monogram / Logo Mark */}
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs flex-shrink-0"
                        style={{ backgroundColor: inst.accentColor || '#1E293B' }}
                      >
                        {inst.shortName.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Institution Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {inst.name}
                          </span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${getBadgeStyle(inst.badge)}`}>
                            {inst.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-600">{inst.routingType}</span>
                          <span>•</span>
                          <span className="truncate">{inst.country}</span>
                          {inst.defaultRouting && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">ABA: {inst.defaultRouting}</span>
                            </>
                          )}
                          {inst.swiftBic && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">SWIFT: {inst.swiftBic}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    No matching standard banks found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    You can still route transfers directly to this bank using standard wire or ACH.
                  </p>
                </div>

                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomBank}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Use "{searchQuery.trim()}" as Destination Bank</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Direct Fedwire, ACH & Global SWIFT Clearing
            </span>
            <span className="font-medium">
              {filteredInstitutions.length} institutions shown
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
