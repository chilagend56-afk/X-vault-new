export interface CounterpartyPreset {
  id: string;
  name: string;
  avatarColor: string;
  roleOrNote: string;
  defaultAmount: number;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive';
  category: string;
  description: string;
  bankName: string;
  method: string;
}

export const REAL_INJECT_FUNDS_PRESETS: CounterpartyPreset[] = [
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins',
    avatarColor: '#10B981',
    roleOrNote: 'Senior Partner • Horizon Capital',
    defaultAmount: 8500,
    type: 'deposit',
    category: 'Zelle Transfer',
    description: 'Zelle Payment from Sarah Jenkins (Q3 Advisory Retainer)',
    bankName: 'JPMorgan Chase',
    method: 'Zelle Instant'
  },
  {
    id: 'marcus-thorne',
    name: 'Marcus Aurelius Thorne',
    avatarColor: '#6366F1',
    roleOrNote: 'Managing Director • Thorne & Co. Wealth',
    defaultAmount: 48500,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Domestic Fedwire Credit from Marcus A. Thorne #88241',
    bankName: 'Morgan Stanley Private Bank',
    method: 'Fedwire Funds'
  },
  {
    id: 'liam-vance',
    name: 'Liam Vance',
    avatarColor: '#0EA5E9',
    roleOrNote: 'Principal • Apex Venture Partners',
    defaultAmount: 25000,
    type: 'deposit',
    category: 'Direct Deposit',
    description: 'Direct Deposit from Liam Vance (Venture Seed Equity Distribution)',
    bankName: 'Silicon Valley Bank / First Citizens',
    method: 'ACH Direct Deposit'
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    avatarColor: '#EC4899',
    roleOrNote: 'Private Client • Global Commodities',
    defaultAmount: 14200,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'International Wire Inbound from Elena Rostova (Consulting Escrow)',
    bankName: 'Barclays Private Wealth',
    method: 'SWIFT Wire'
  },
  {
    id: 'david-sterling',
    name: 'David K. Sterling',
    avatarColor: '#F59E0B',
    roleOrNote: 'Founder & CEO • Sterling Equity Group',
    defaultAmount: 75000,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Wire Credit from David K. Sterling (Real Estate LP Capital Return)',
    bankName: 'Citibank N.A.',
    method: 'Fedwire Funds'
  },
  {
    id: 'sophia-chen',
    name: 'Sophia Chen',
    avatarColor: '#8B5CF6',
    roleOrNote: 'Creative Director • Studio Chen Paris',
    defaultAmount: 6400,
    type: 'deposit',
    category: 'ACH Transfer',
    description: 'ACH Settlement from Sophia Chen (Brand Architecture Milestone #2)',
    bankName: 'Bank of America',
    method: 'Same-Day ACH'
  },
  {
    id: 'alexander-wright',
    name: 'Alexander Wright',
    avatarColor: '#14B8A6',
    roleOrNote: 'Managing Partner • Wright Real Estate Trust',
    defaultAmount: 32000,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Domestic Wire Transfer from Alexander Wright (Property Acquisition Yield)',
    bankName: 'Wells Fargo Premier',
    method: 'Fedwire Funds'
  },
  {
    id: 'dr-robert-vance',
    name: 'Dr. Robert Vance, MD',
    avatarColor: '#3B82F6',
    roleOrNote: 'Chief Medical Officer • Vance BioHealth',
    defaultAmount: 12500,
    type: 'deposit',
    category: 'Direct Deposit',
    description: 'Direct Deposit from Dr. Robert Vance (Executive Medical Board Fee)',
    bankName: 'PNC Private Bank',
    method: 'ACH Direct Credit'
  },
  {
    id: 'emily-watson',
    name: 'Emily Watson',
    avatarColor: '#F43F5E',
    roleOrNote: 'Executive Producer • Watson Media Group',
    defaultAmount: 9800,
    type: 'deposit',
    category: 'Zelle Transfer',
    description: 'Zelle Transfer from Emily Watson (Media Production Royalties)',
    bankName: 'Capital One 360',
    method: 'Zelle Instant'
  },
  {
    id: 'arthur-pendelton',
    name: 'Arthur Pendelton, Esq.',
    avatarColor: '#64748B',
    roleOrNote: 'Senior Counsel • Pendelton & Sterling LLP',
    defaultAmount: 18000,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Attorney Trust Settlement Wire from Arthur Pendelton Law',
    bankName: 'BNY Mellon Private Wealth',
    method: 'Fedwire Wire'
  },
  {
    id: 'chloe-bennett',
    name: 'Chloe Bennett',
    avatarColor: '#D946EF',
    roleOrNote: 'Operations Director • Bennett Tech Ventures',
    defaultAmount: 4750,
    type: 'deposit',
    category: 'Transfer',
    description: 'Inbound Transfer from Chloe Bennett (Shared Portfolio Management)',
    bankName: 'Charles Schwab Bank',
    method: 'Internal Transfer'
  },
  {
    id: 'benjamin-foster',
    name: 'Benjamin Foster',
    avatarColor: '#059669',
    roleOrNote: 'Lead Architect • Foster System Dynamics',
    defaultAmount: 15300,
    type: 'deposit',
    category: 'ACH Transfer',
    description: 'ACH Corporate Payment from Benjamin Foster (Contract Milestone #4)',
    bankName: 'US Bank Corporate',
    method: 'Same-Day ACH'
  },
  {
    id: 'victoria-vance',
    name: 'Victoria Vance-Montgomery',
    avatarColor: '#9333EA',
    roleOrNote: 'Trustee • Montgomery Family Trust',
    defaultAmount: 62000,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Trust Distribution Wire Credit from Victoria Vance-Montgomery',
    bankName: 'Northern Trust Wealth',
    method: 'Fedwire Funds'
  },
  {
    id: 'lucas-scott',
    name: 'Lucas Scott',
    avatarColor: '#2563EB',
    roleOrNote: 'Managing Partner • Scott Aviation Global',
    defaultAmount: 21500,
    type: 'deposit',
    category: 'Wire Transfer',
    description: 'Wire Credit from Lucas Scott (Aircraft Lease Distribution)',
    bankName: 'Goldman Sachs Bank USA',
    method: 'Fedwire Funds'
  },
  {
    id: 'isabella-rodriguez',
    name: 'Isabella Rodriguez',
    avatarColor: '#EA580C',
    roleOrNote: 'Principal Consultant • Rodriguez Advisory',
    defaultAmount: 7800,
    type: 'deposit',
    category: 'Zelle Transfer',
    description: 'Zelle Inbound from Isabella Rodriguez (Strategy Consulting Retainer)',
    bankName: 'TD Bank Premier',
    method: 'Zelle Instant'
  }
];

export const REAL_SEND_FUNDS_PRESETS: CounterpartyPreset[] = [
  {
    id: 'send-chloe-bennett',
    name: 'Chloe Bennett',
    avatarColor: '#D946EF',
    roleOrNote: 'Bennett Tech Ventures • Checking #4092',
    defaultAmount: 3850,
    type: 'send',
    category: 'Zelle Transfer',
    description: 'Zelle Transfer to Chloe Bennett (Quarterly Co-op Settlement)',
    bankName: 'Charles Schwab Bank',
    method: 'Zelle Instant'
  },
  {
    id: 'send-arthur-pendelton',
    name: 'Arthur Pendelton, Esq.',
    avatarColor: '#64748B',
    roleOrNote: 'Pendelton & Sterling LLP • Client Trust Acct',
    defaultAmount: 12500,
    type: 'send',
    category: 'Wire Transfer',
    description: 'Outbound Wire to Arthur Pendelton, Esq. (Legal Retainer & Filing Fees)',
    bankName: 'BNY Mellon Private Wealth',
    method: 'Fedwire Funds'
  },
  {
    id: 'send-benjamin-foster',
    name: 'Benjamin Foster',
    avatarColor: '#059669',
    roleOrNote: 'Foster System Dynamics • Wire Dept',
    defaultAmount: 6200,
    type: 'send',
    category: 'ACH Transfer',
    description: 'ACH Outbound Payment to Benjamin Foster (Software Infrastructure Fee)',
    bankName: 'US Bank Corporate',
    method: 'ACH Transfer'
  },
  {
    id: 'send-sophia-chen',
    name: 'Sophia Chen',
    avatarColor: '#8B5CF6',
    roleOrNote: 'Studio Chen Paris • International IBAN',
    defaultAmount: 4500,
    type: 'send',
    category: 'Wire Transfer',
    description: 'International Wire to Sophia Chen (Brand Identity Phase 3 Completion)',
    bankName: 'BNP Paribas',
    method: 'SWIFT Wire'
  },
  {
    id: 'send-jonathan-hayes',
    name: 'Jonathan Hayes',
    avatarColor: '#D97706',
    roleOrNote: 'Hayes Commercial Real Estate Corp',
    defaultAmount: 8900,
    type: 'send',
    category: 'Wire Transfer',
    description: 'Outbound Wire to Jonathan Hayes (Executive Suite Monthly Lease)',
    bankName: 'JPMorgan Chase',
    method: 'Fedwire Funds'
  },
  {
    id: 'send-elena-rostova',
    name: 'Elena Rostova',
    avatarColor: '#EC4899',
    roleOrNote: 'Private Client • $elena_rostova',
    defaultAmount: 2400,
    type: 'send',
    category: 'CashApp',
    description: 'Payment to Elena Rostova (Private Concierge Reimbursement)',
    bankName: 'Cash App Network',
    method: 'Cash App P2P'
  },
  {
    id: 'send-marcus-thorne',
    name: 'Marcus Aurelius Thorne',
    avatarColor: '#6366F1',
    roleOrNote: 'Thorne & Co. Wealth Management',
    defaultAmount: 17500,
    type: 'send',
    category: 'Wire Transfer',
    description: 'Wire Transfer to Marcus A. Thorne (LP Investment Capital Call)',
    bankName: 'Morgan Stanley Private Bank',
    method: 'Fedwire Funds'
  },
  {
    id: 'send-victoria-vance',
    name: 'Victoria Vance-Montgomery',
    avatarColor: '#9333EA',
    roleOrNote: 'Montgomery Family Holdings LLC',
    defaultAmount: 14000,
    type: 'send',
    category: 'Wire Transfer',
    description: 'Outbound Wire to Victoria Vance-Montgomery (Estate Contribution)',
    bankName: 'Northern Trust',
    method: 'Fedwire Funds'
  },
  {
    id: 'send-lucas-scott',
    name: 'Lucas Scott',
    avatarColor: '#2563EB',
    roleOrNote: 'Scott Aviation • @lucas-scott',
    defaultAmount: 1850,
    type: 'send',
    category: 'Venmo',
    description: 'Venmo Outbound to Lucas Scott (Shared Flight Charter & Fuel)',
    bankName: 'Venmo / PayPal',
    method: 'Venmo Instant'
  },
  {
    id: 'send-sarah-jenkins',
    name: 'Sarah Jenkins',
    avatarColor: '#10B981',
    roleOrNote: 'Horizon Capital • sarah.j@horizon.io',
    defaultAmount: 3200,
    type: 'send',
    category: 'Zelle Transfer',
    description: 'Zelle Transfer to Sarah Jenkins (Conference Travel & Accommodations)',
    bankName: 'JPMorgan Chase',
    method: 'Zelle Instant'
  },
  {
    id: 'send-david-sterling',
    name: 'David K. Sterling',
    avatarColor: '#F59E0B',
    roleOrNote: 'Sterling Partners Escrow Account',
    defaultAmount: 22000,
    type: 'send',
    category: 'Wire Transfer',
    description: 'Domestic Fedwire to David K. Sterling (Asset Acquisition Deposit)',
    bankName: 'Citibank N.A.',
    method: 'Fedwire Funds'
  },
  {
    id: 'send-dr-robert-vance',
    name: 'Dr. Robert Vance, MD',
    avatarColor: '#3B82F6',
    roleOrNote: 'Vance Health Concierge Services',
    defaultAmount: 5600,
    type: 'send',
    category: 'ACH Transfer',
    description: 'Direct Payment to Dr. Robert Vance (Executive Wellness Retainer)',
    bankName: 'PNC Bank',
    method: 'ACH Direct Debit'
  }
];

// Helper to generate a completely randomized real person deposit or withdrawal transaction
export function generateRandomPersonTransaction(direction: 'deposit' | 'send', customAccountCurrency = 'USD'): {
  amount: number;
  type: 'deposit' | 'receive' | 'withdrawal' | 'send';
  category: string;
  description: string;
  recipient: string;
  created_at: string;
} {
  const pool = direction === 'deposit' ? REAL_INJECT_FUNDS_PRESETS : REAL_SEND_FUNDS_PRESETS;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  // Add realistic jitter to amount (e.g. ±20% with realistic cents or clean round)
  const baseAmount = picked.defaultAmount;
  const variance = (Math.random() * 0.4 - 0.2); // -20% to +20%
  let calculated = Math.round((baseAmount * (1 + variance)) / 50) * 50;
  if (calculated <= 0) calculated = baseAmount;

  // Realistic random recent timestamp (within last 14 days)
  const daysAgo = Math.floor(Math.random() * 10);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  const date = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000 + minutesAgo * 60000));

  return {
    amount: calculated,
    type: direction === 'deposit' ? 'deposit' : 'send',
    category: picked.category,
    description: picked.description,
    recipient: picked.name,
    created_at: date.toISOString()
  };
}
