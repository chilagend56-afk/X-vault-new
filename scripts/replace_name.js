import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/NexaBank/g, 'VaultX');
  fs.writeFileSync(filePath, content);
}

const files = [
 'src/lib/supabase.ts',
 'src/pages/TransfersPage.tsx',
 'src/pages/AdminPage.tsx',
 'src/pages/AuthPage.tsx',
 'src/pages/CardsPage.tsx',
 'src/pages/LandingPage.tsx',
 'src/components/ProtectedLayout.tsx'
];

files.forEach(f => replaceInFile(path.resolve(f)));
