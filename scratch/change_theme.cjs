const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src';

const replacements = [
  { from: /bg-\[#f8fafc\]/g, to: 'bg-[#0a192f]' }, // Main background
  { from: /bg-slate-50/g, to: 'bg-[#0a192f]' }, // Secondary backgrounds
  { from: /bg-white/g, to: 'bg-[#112240]' }, // Card backgrounds
  { from: /text-\[#0f2c52\]/g, to: 'text-[#e2e8f0]' }, // Headers
  { from: /text-slate-800/g, to: 'text-[#e2e8f0]' }, // Dark text
  { from: /text-slate-900/g, to: 'text-[#e2e8f0]' }, // Dark text
  { from: /text-\[#1e293b\]/g, to: 'text-[#e2e8f0]' }, // Dark text
  { from: /text-slate-700/g, to: 'text-[#cbd5e1]' },
  { from: /text-slate-600/g, to: 'text-[#94a3b8]' }, // Subtitles
  { from: /text-slate-500/g, to: 'text-[#94a3b8]' }, // Muted text
  { from: /border-slate-200/g, to: 'border-[#1e293b]' }, // Borders
  { from: /border-slate-300/g, to: 'border-[#334155]' }, // Borders
  { from: /border-\[#e2e8f0\]/g, to: 'border-[#1e293b]' }, // Borders
  { from: /text-black/g, to: 'text-white' },
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
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

walkDir(directory);
console.log('Done!');
