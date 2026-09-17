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
    content = content.replace(/bg-blue-600 text-slate-[89]00/g, 'bg-blue-600 text-white');
    fs.writeFileSync(file, content);
});
