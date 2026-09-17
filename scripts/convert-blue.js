import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.resolve('./src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace purple with blue
    content = content.replace(/purple-/g, 'blue-');
    
    // Attempting to fix "invisible" words by targeting obvious bad contrasts:
    // If we see text-white on something that might be light
    content = content.replace(/bg-white[^>]*text-white/g, match => match.replace('text-white', 'text-slate-900'));
    content = content.replace(/bg-slate-50[^>]*text-white/g, match => match.replace('text-white', 'text-slate-900'));
    content = content.replace(/bg-slate-100[^>]*text-white/g, match => match.replace('text-white', 'text-slate-900'));

    fs.writeFileSync(file, content);
});
