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
    
    // Convert dark hex background combining with dark text to white text
    let changed = false;
    content = content.replace(/(bg-\[\#[0-9a-fA-F]+\][^>]*?)text-slate-[89]00/g, (match, p1) => {
        // Checking if the bg hex is dark enough. #0a2540, #101222, #1a1f36, #161b22, #243B71
        if (p1.toLowerCase().match(/bg-\[#(0[a-f0-9]|1[a-f0-9]|2[0-5])[a-f0-9]{4}\]/)) {
            changed = true;
            return p1 + 'text-white';
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content);
    }
});
