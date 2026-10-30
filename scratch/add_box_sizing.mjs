import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../src/index.css');
let content = fs.readFileSync(filePath, 'utf8');

const target = '@import "tailwindcss/utilities" layer(utilities);';
const insertion = `\r\n\r\n*, *::before, *::after, input, select, textarea, button {\r\n  box-sizing: border-box;\r\n}`;

if (!content.includes('*, *::before, *::after')) {
  content = content.replace(target, target + insertion);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added universal box-sizing: border-box to index.css');
} else {
  console.log('Already exists');
}

