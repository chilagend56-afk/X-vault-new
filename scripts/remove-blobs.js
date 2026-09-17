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
    // We want to delete ANY div that is just a blurry blob
    // Example: <div className="absolute top-[20%] left-[15%] w-[350px] h-[350px] rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 blur-[80px] pointer-events-none" />
    content = content.replace(/<div className="[^"]*blur-\[[0-9]+px\][^"]*" \/>/g, '');
    fs.writeFileSync(file, content);
});
