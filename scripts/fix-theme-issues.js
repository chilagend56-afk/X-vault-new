import fs from 'fs';
import path from 'path';

function fixProtectedLayout() {
    const file = path.resolve('src/components/ProtectedLayout.tsx');
    let content = fs.readFileSync(file, 'utf8');
    // The mobile drawer has `bg-[#0a2540] text-white` normally
    content = content.replace(/bg-\[#0a2540\] text-white/g, 'bg-white text-slate-900 shadow-xl border-r border-slate-200');
    // Ensure VaultX logo in mobile drawer is dark
    content = content.replace(/text-lg text-white/g, 'text-lg text-slate-900');
    fs.writeFileSync(file, content);
}

function fixCardsPage() {
    const file = path.resolve('src/pages/CardsPage.tsx');
    let content = fs.readFileSync(file, 'utf8');

    // Make neon theme text white
    content = content.replace(/textColor: 'text-slate-900',/g, "textColor: 'text-slate-100',");

    // Replace the text-slate-900 hardcodes inside the card div
    content = content.replace(/relative text-slate-900/g, 'relative text-white');
    
    // specifically target card numbers and holder names
    content = content.replace(/className="((?:[^"]*))text-slate-900((?:[^"]*))"/g, (match, p1, p2) => {
        // if this match is inside the area that looks like a credit card text, we replace with text-white
        // but this could accidentally hit other things in CardsPage that are supposed to be dark.
        return match; // fallback
    });

    // Instead let's just do a string replacement on lines 149 through ~200
    let lines = content.split('\n');
    let inCardMode = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('bg-gradient-to-br ${cardThemes[activeCard.type]')) {
            inCardMode = true;
        }
        if (inCardMode && lines[i].includes('flex flex-col gap-4')) {
            inCardMode = false;
        }
        if (inCardMode) {
            lines[i] = lines[i].replace(/text-slate-900/g, 'text-white')
                               .replace(/text-slate-800/g, 'text-slate-100')
                               .replace(/text-slate-700/g, 'text-slate-300');
        }
    }

    fs.writeFileSync(file, lines.join('\n'));
}

fixProtectedLayout();
fixCardsPage();
