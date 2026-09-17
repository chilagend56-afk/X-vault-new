import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const rules = [
    [/bg-\[#030308\]/g, 'bg-slate-50'],
    [/bg-\[#041526\]/g, 'bg-white'],
    [/bg-\[#0e1026\]/g, 'bg-white'],
    [/bg-\[#090b16\]/g, 'bg-white'],
    [/bg-\[#1a1c38\]/g, 'bg-slate-50'],
    [/bg-\[#1a3e66\]/g, 'bg-slate-200'],
    
    // borders
    [/border-white\/[0-9]+/g, 'border-slate-200'],
    
    // hover borders
    [/hover:border-white\/[0-9]+/g, 'hover:border-slate-300'],
    
    // backgrounds
    [/bg-white\/[0-9]+/g, 'bg-slate-50'],
    [/bg-white\/\[0\.[0-9]+\]/g, 'bg-slate-50'],
    
    // hover backgrounds
    [/hover:bg-white\/[0-9]+/g, 'hover:bg-slate-100'],
    [/hover:bg-white\/\[0\.[0-9]+\]/g, 'hover:bg-slate-100'],
    
    // text
    [/text-zinc-100/g, 'text-slate-900'],
    [/text-[A-Za-z0-9]+-200/g, 'text-slate-800'],
    [/text-[A-Za-z0-9]+-300/g, 'text-slate-700'],
    [/text-[A-Za-z0-9]+-400/g, 'text-slate-500'],
    [/text-zinc-500/g, 'text-slate-500'],

    // replace 'text-white' to 'text-slate-900' for text content, 
    // but we have to be careful with buttons. 
    // For now let's just make it text-slate-800, we can fix buttons later if needed.
    // Or we just don't replace text-white directly via script and only replace known text colors
    // Actually, text-white is used everywhere. Let's do it.
    [/text-white/g, 'text-slate-900'],
  ];

  for (const [regex, value] of rules) {
    content = content.replace(regex, value);
  }
  
  // Specific button fixes to restore 'text-white'
  content = content.replace(/className="([^"]*)bg-cyan-400([^"]*)text-slate-900([^"]*)"/g, 'className="$1bg-cyan-600$2text-white$3"');
  content = content.replace(/className="([^"]*)bg-indigo-600([^"]*)text-slate-900([^"]*)"/g, 'className="$1bg-indigo-600$2text-white$3"');
  content = content.replace(/className="([^"]*)bg-slate-900([^"]*)text-slate-900([^"]*)"/g, 'className="$1bg-slate-900$2text-white$3"');
  content = content.replace(/className="([^"]*)bg-emerald-500\/10([^"]*)text-slate-[0-9]+([^"]*)"/g, 'className="$1bg-emerald-50$2text-emerald-700$3"');

  fs.writeFileSync(filePath, content);
}

const files = [
 'src/components/ProtectedLayout.tsx',
 'src/components/SecurityBot.tsx',
 'src/pages/DashboardPage.tsx',
 'src/pages/WithdrawPage.tsx',
 'src/pages/SavingsPage.tsx',
 'src/pages/CryptoPage.tsx',
 'src/pages/LandingPage.tsx',
 'src/pages/AuthPage.tsx',
 'src/pages/AdminPage.tsx',
 'src/pages/PremiumPage.tsx',
 'src/pages/TransactionsPage.tsx',
 'src/pages/CardsPage.tsx',
 'src/pages/TransfersPage.tsx',
 'src/pages/SettingsPage.tsx',
 'src/App.tsx'
];

files.forEach(f => replaceInFile(path.resolve(f)));
