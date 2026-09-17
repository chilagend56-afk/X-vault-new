import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix CryptoPage.tsx
  if (filePath.includes('CryptoPage.tsx')) {
    content = content.replace(/{cryptoWallets\.map\(\(wallet\) => {/g, '{cryptoWallets.map((wallet, idx) => {');
    content = content.replace(/key={wallet\.coin_id}/g, 'key={`${wallet.coin_id}-${idx}`}');
    content = content.replace(/key=\{wallet\.id\}/g, 'key={`${wallet.id}-${idx}`}');
  }

  // Fix AdminPage.tsx line 844+
  if (filePath.includes('AdminPage.tsx')) {
    content = content.replace(/{getFilteredData\(cryptoWallets\)\.map\(\(w\) => \(/g, '{getFilteredData(cryptoWallets).map((w, idx) => (');
    content = content.replace(/<tr key={w\.id}/g, '<tr key={`${w.id}-${idx}`}');
  }

  fs.writeFileSync(filePath, content);
}

fixFile(path.resolve('src/pages/CryptoPage.tsx'));
fixFile(path.resolve('src/pages/AdminPage.tsx'));
