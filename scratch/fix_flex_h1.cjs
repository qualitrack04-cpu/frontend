const fs = require('fs');
const files = [
  'c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features/capa/components/capa_page.tsx',
  'c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features/findings/components/findings_page.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"text-\[3rem\] font-bold text-\[\#0f2c52\] m-0 mb-\[20px\] tracking-\[-0.5px\] leading-\[1.25\]\"/g, 'className=\"text-[3rem] font-bold text-[#0f2c52] m-0 tracking-[-0.5px] leading-[1.25]\"');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
