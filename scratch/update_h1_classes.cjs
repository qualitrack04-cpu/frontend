const fs = require('fs');
const path = require('path');

const targetClass = 'text-[3rem] font-bold text-[#0f2c52] m-0 mb-[20px] tracking-[-0.5px] leading-[1.25]';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') && !file.includes('auth_brand_panel')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /<h1(?: className="[^"]*")?>/g;
    if (regex.test(content)) {
        content = content.replace(regex, `<h1 className="${targetClass}">`);
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
