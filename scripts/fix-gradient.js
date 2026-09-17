import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/(['"`])([^'"`]*bg-gradient-to-[a-z]+[^'"`]*)(['"`])/g, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    // if it has from-purple-* or from-cyan-* and is likely dark
    let hasDarkGradient = classes.some(c => c.startsWith('from-purple-') || c.startsWith('from-cyan-') || c.startsWith('to-indigo-'));
    if (hasDarkGradient) {
      classes = classes.map(c => c.match(/^text-slate-[89]00$/) ? 'text-white' : c);
    }
    return p1 + classes.join(' ') + p3;
  });
  
  fs.writeFileSync(filePath, content);
}

const files = [
 'src/pages/CryptoPage.tsx',
 'src/pages/AdminPage.tsx',
 'src/pages/LandingPage.tsx',
 'src/pages/SavingsPage.tsx'
];

files.forEach(f => fixFile(path.resolve(f)));
