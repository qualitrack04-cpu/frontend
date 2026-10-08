const fs = require('fs');
let code = fs.readFileSync('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/shared/components/date_picker.tsx', 'utf8');

code = code.replace(/className=\"date-picker\"/g, 'className=\"relative w-full\"');
code = code.replace(/className=\"date-picker-toggle\"/g, 'className=\"absolute left-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none p-[6px] text-[#64748b] cursor-pointer flex hover:text-[#0f2c52]\"');
code = code.replace(/className=\"date-picker-popup\"/g, 'className=\"absolute top-[calc(100%+6px)] left-0 z-[40] w-[300px] bg-white border border-[#e2e8f0] rounded-[12px] shadow-[0_10px_25px_rgba(15,44,82,0.12)] p-[12px]\"');
code = code.replace(/className=\"date-picker-header\"/g, 'className=\"flex items-center justify-between mb-[8px] font-semibold text-[#0f2c52] text-[14px]\"');
code = code.replace(/className=\"date-picker-grid\"/g, 'className=\"grid grid-cols-7 gap-[2px]\"');
code = code.replace(/className=\"date-picker-weekday\"/g, 'className=\"text-center text-[11px] font-semibold text-[#94a3b8] py-[4px]\"');
code = code.replace(/className=\"date-picker-today-btn\"/g, 'className=\"w-full mt-[8px] bg-[#f1f5f9] border-none rounded-[8px] p-[8px] text-[13px] text-[#0f2c52] font-semibold cursor-pointer hover:bg-[#e2e8f0]\"');

// Input text
code = code.replace(/<input\\s+type=\"text\"/g, '<input type=\"text\" className=\"w-full p-[12px_14px_12px_42px] border border-[#cbd5e1] rounded-[8px] bg-white text-[14px] text-[#1f2937] box-border font-inherit\"');

// Header buttons
code = code.replace(/<button type=\"button\" onClick=\{\(\) => shiftMonth\(-1\)\}/g, '<button type=\"button\" className=\"bg-transparent border-none p-[4px] rounded-[6px] cursor-pointer text-[#475569] flex hover:bg-[#f1f5f9]\" onClick={() => shiftMonth(-1)}');
code = code.replace(/<button type=\"button\" onClick=\{\(\) => shiftMonth\(1\)\}/g, '<button type=\"button\" className=\"bg-transparent border-none p-[4px] rounded-[6px] cursor-pointer text-[#475569] flex hover:bg-[#f1f5f9]\" onClick={() => shiftMonth(1)}');

// Date picker day
code = code.replace(/const classes = \['date-picker-day'\];/g, 'const classes = [\'bg-transparent border-none rounded-[6px] py-[8px] text-[13px] text-[#1f2937] cursor-pointer hover:not(:disabled):bg-[#e0e7ff] disabled:text-[#cbd5e1] disabled:cursor-not-allowed\'];');
code = code.replace(/classes\.push\('selected'\);/g, 'classes.push(\'!bg-[#0f2c52] text-white\');');
code = code.replace(/classes\.push\('today'\);/g, 'classes.push(\'font-bold text-[#0f2c52] shadow-[inset_0_0_0_1px_#0f2c52]\');');

fs.writeFileSync('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/shared/components/date_picker.tsx', code);
