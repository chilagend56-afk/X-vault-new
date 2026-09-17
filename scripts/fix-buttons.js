import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // replace text-slate-XYZ with text-white if bg is dark anywhere in the file
  content = content.replace(/(['"`])([^'"`]*)(['"`])/g, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    let hasDarkBg = classes.some(c => 
      c.startsWith('bg-purple-') && ['600','700','800','900'].includes(c.split('-')[2]) ||
      c.startsWith('bg-cyan-') && ['600','700','800','900'].includes(c.split('-')[2]) ||
      c.startsWith('bg-indigo-') && ['600','700','800','900'].includes(c.split('-')[2]) ||
      c.startsWith('bg-slate-') && ['800','900'].includes(c.split('-')[2])
    );
    
    if (hasDarkBg) {
      classes = classes.map(c => c.match(/^text-slate-\d{3}$/) ? 'text-white' : c);
    }
    
    return p1 + classes.join(' ') + p3;
  });

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

files.forEach(f => fixFile(path.resolve(f)));
