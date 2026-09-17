import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const replacements = {
    'bg-white': 'bg-[#0e1026]',
    'bg-slate-50': 'bg-white/5',
    'bg-slate-100': 'bg-white/5',
    'bg-slate-200': 'bg-white/10',
    'bg-slate-800': 'bg-purple-600',
    'bg-slate-900': 'bg-purple-600',
    'border-slate-100': 'border-white/10',
    'border-slate-200': 'border-white/10',
    'border-slate-700': 'border-white/10',
    'text-slate-800': 'text-white',
    'text-slate-900': 'text-white',
    'text-slate-700': 'text-zinc-200',
    'text-slate-600': 'text-zinc-300',
    'text-slate-500': 'text-zinc-400',
    'text-slate-400': 'text-zinc-500',
    'hover:bg-slate-700': 'hover:bg-purple-700',
    'hover:bg-slate-800': 'hover:bg-purple-700',
    'hover:bg-slate-200': 'hover:bg-white/10',
    'hover:bg-slate-100': 'hover:bg-white/5',
    'hover:text-slate-800': 'hover:text-white',
    'hover:border-slate-300': 'hover:border-white/20',
    'border-slate-400': 'border-purple-500',
    'bg-[#ecfdfe]': 'bg-cyan-950/30',
    'border-[#cffafe]': 'border-cyan-500/20',
    'text-[#083344]': 'text-cyan-200'
  };

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  // A couple of specific manual adjustments if any
  content = content.replace(/border-slate-200\/60/g, "border-white/5");

  fs.writeFileSync(filePath, content);
}

replaceInFile(path.resolve('./src/components/SecurityBot.tsx'));
replaceInFile(path.resolve('./src/pages/WithdrawPage.tsx'));
replaceInFile(path.resolve('./src/pages/SavingsPage.tsx'));
replaceInFile(path.resolve('./src/pages/LandingPage.tsx'));
replaceInFile(path.resolve('./src/pages/AdminPage.tsx'));
replaceInFile(path.resolve('./src/App.tsx'));
