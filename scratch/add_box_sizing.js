const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/index.css');
let content = fs.readFileSync(filePath, 'utf8');

const target = '@import "tailwindcss/utilities" layer(utilities);';
const insertion = `\n\n*, *::before, *::after, input, select, textarea, button {\n  box-sizing: border-box;\n}`;

if (!content.includes('box-sizing: border-box;\n}')) {
  content = content.replace(target, target + insertion);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added universal box-sizing: border-box to index.css');
} else {
  console.log('Already exists');
}

