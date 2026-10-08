const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src';

const replacements = [
  // Restore backgrounds
  { from: /bg-\[#0a192f\]/g, to: 'bg-[#f8fafc]' }, 
  { from: /bg-\[#112240\]/g, to: 'bg-white' }, 
  // Restore borders
  { from: /border-\[#1e293b\]/g, to: 'border-slate-200' },
  { from: /border-\[#334155\]/g, to: 'border-slate-300' },
  
  // Make font colors darker (navy blue as requested)
  // Our previous script changed dark colors to e2e8f0, cbd5e1, 94a3b8
  { from: /text-\[#e2e8f0\]/g, to: 'text-[#0a192f]' }, // A very dark navy for headers
  { from: /text-\[#cbd5e1\]/g, to: 'text-[#0f2c52]' }, // Dark navy for normal text
  { from: /text-\[#94a3b8\]/g, to: 'text-[#1e3a5f]' }, // Dark navy/slate for subtitles, darker than original slate-500
];

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      replacements.forEach(r => {
        content = content.replace(r.from, r.to);
      });
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Reverted: ${fullPath}`);
      }
    }
  });
}

walkDir(directory);
console.log('Revert and dark fonts applied!');
