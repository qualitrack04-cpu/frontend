const fs = require('fs');
const path = require('path');

const mappings = {
  '/Auth/': '/auth/',
  '/AuditPlan': '/audit-plans',
  '/AuditSession': '/audit-sessions',
  '/AuditReport': '/audit-reports',
  '/AuditResponse': '/audit-responses',
  '/Capa': '/capas',
  '/Checklist': '/checklists',
  '/Dashboard/': '/dashboard/',
  '/Finding': '/findings',
  '/Health': '/health',
  '/Pdf/': '/pdf/',
  '/Profile': '/profile',
  '/QualityScore/': '/quality-scores/',
  'QualityScore/': 'quality-scores/', // For the one without leading slash
  '/Spc/': '/spc/',
  '/Upload/': '/uploads/',
  
  // Also handle some specific ones that might miss the trailing slash in the regex
  // Let's just do global replace of the exact prefixes.
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace axios calls
  for (const [oldStr, newStr] of Object.entries(mappings)) {
    if (content.includes(oldStr)) {
      content = content.split(oldStr).join(newStr);
      changed = true;
    }
  }

  // Also catch /Auth without trailing slash if it exists
  const others = [
    { old: "'/Auth'", new: "'/auth'" },
    { old: "'/Dashboard'", new: "'/dashboard'" },
    { old: "'/Spc'", new: "'/spc'" },
    { old: "'/Upload'", new: "'/uploads'" },
    { old: "'/Pdf'", new: "'/pdf'" },
    { old: "'/QualityScore'", new: "'/quality-scores'" }
  ];
  for (const {old: o, new: n} of others) {
    if (content.includes(o)) {
      content = content.split(o).join(n);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('Done!');
