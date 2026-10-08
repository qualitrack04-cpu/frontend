const fs = require('fs');
let code = fs.readFileSync('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features/findings/components/finding_form_page.tsx', 'utf8');

code = code.replace(/className=\"page-container fd-page\"/g, 'className=\"page-container text-[#0b2141]\"');
code = code.replace(/className=\"fd-back\"/g, 'className=\"inline-flex items-center gap-[0.5rem] text-[#3d4757] no-underline text-[1rem] mb-[0.75rem] hover:underline\"');
code = code.replace(/className=\"fd-title fd-title--form\"/g, 'className=\"m-[1rem_0_0] text-[2.25rem] font-bold text-[#0a2a52]\"');
code = code.replace(/className=\"fd-subtitle\"/g, 'className=\"m-[0.75rem_0_2rem] text-[1.1rem] text-[#4a5568]\"');
code = code.replace(/className=\"fd-form-grid\"/g, 'className=\"grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-[1.75rem] items-start\"');
code = code.replace(/className=\"fd-form-main\"/g, 'className=\"flex flex-col gap-[1.5rem]\"');
code = code.replace(/className=\"fd-panel\"/g, 'className=\"bg-white border border-[#e2e7f2] rounded-[12px] p-[1.25rem_1.5rem] shadow-[0_1px_6px_rgba(15,40,90,0.05)]\"');
code = code.replace(/className=\"fd-label\"/g, 'className=\"block mb-[0.5rem] text-[0.8rem] font-bold tracking-[0.06em] uppercase text-[#0b2141]\"');
code = code.replace(/className=\"fd-input\"/g, 'className=\"w-full box-border p-[0.85rem_1rem] border border-[#c3c9d6] rounded-[4px] bg-white text-[#0b2141] font-inherit text-[1.1rem] aria-[invalid=true]:border-[#c0141c]\"');
code = code.replace(/className=\"fd-input fd-textarea\"/g, 'className=\"w-full box-border p-[0.85rem_1rem] border border-[#c3c9d6] rounded-[4px] bg-white text-[#0b2141] font-inherit text-[1.1rem] aria-[invalid=true]:border-[#c0141c] resize-y min-h-[150px]\"');
code = code.replace(/className=\"fd-error\"/g, 'className=\"m-[0.5rem_0_0] text-[#c0141c] text-[1rem]\"');
code = code.replace(/className=\"fd-row\"/g, 'className=\"grid grid-cols-1 sm:grid-cols-2 gap-[1.5rem]\"');
code = code.replace(/className=\"fd-form-side\"/g, 'className=\"flex flex-col gap-[1.5rem]\"');
code = code.replace(/className=\"fd-locked\"/g, 'className=\"relative\"');
code = code.replace(/className=\"fd-add-photo\"/g, 'className=\"w-full flex flex-col items-center gap-[0.5rem] p-[1.75rem_1rem] border-[2px] border-dashed border-[#b8c0d2] rounded-[12px] bg-[#fafbfe] text-[#5b667d] cursor-pointer hover:bg-[#eef2fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#012a55] focus-visible:outline-offset-2\"');
code = code.replace(/className=\"fd-photo-grid\"/g, 'className=\"flex flex-wrap gap-[0.75rem] mb-[1rem]\"');
code = code.replace(/className=\"fd-btn-primary fd-btn-block\"/g, 'className=\"inline-flex justify-center items-center gap-[0.5rem] border-none rounded-[10px] bg-[#012a55] text-white font-semibold no-underline cursor-pointer w-full p-[1.1rem_1rem] text-[1.25rem] hover:bg-[#011c38] disabled:opacity-60 disabled:cursor-not-allowed\"');
code = code.replace(/className=\"fd-guidelines\"/g, 'className=\"p-[1.5rem] border border-[#c7cee0] rounded-[12px] bg-[#e2e6f2]\"');
code = code.replace(/className=\"fd-panel-head\"/g, 'className=\"flex justify-between items-center mb-[1rem]\"');
code = code.replace(/className=\"fd-label fd-label--flat\"/g, 'className=\"block m-0 text-[0.8rem] font-bold tracking-[0.06em] uppercase text-[#0b2141]\"');
code = code.replace(/className=\"fd-chip\"/g, 'className=\"px-[0.75rem] py-[0.2rem] rounded-[6px] bg-[#d9e5fb] text-[#1e4a91] text-[0.85rem] font-semibold\"');
code = code.replace(/className=\"fd-optional\"/g, 'className=\"font-medium normal-case tracking-normal text-[#64708a]\"');

// Fix locked input
code = code.replace(/className=\"fd-input\"\\s+value=\{reporterName\}/g, 'className=\"w-full box-border p-[0.85rem_1rem] border border-[#d6def2] rounded-[4px] bg-[#eef2fc] text-[#0b2141] font-inherit text-[1.1rem] pr-[2.5rem]\" value={reporterName}');
code = code.replace(/<Lock size=\{16\} \/>/g, '<Lock size={16} className=\"absolute top-1/2 -translate-y-1/2 right-[0.9rem] text-[#3d4757]\" />');
code = code.replace(/<h2[^>]*>\\s*<Info[\\s\\S]*?<\/h2>/g, '<h2 className=\"flex items-center gap-[0.6rem] m-[0_0_1rem] text-[1.5rem] text-[#0a2a52]\"><Info size={22} /> Severity Guidelines</h2>');
code = code.replace(/<p>\\s*<strong>/g, '<p className=\"m-[0_0_1rem_2rem] text-[1.05rem] leading-[1.5]\"><strong>');

// Fix thumbnail classes
code = code.replace(/className=\"fd-thumb\"/g, 'className=\"relative w-[96px] h-[96px] grid place-items-center overflow-hidden border border-[#e2e7f2] rounded-[10px] bg-[#f1f4fa] transition-all hover:shadow-[0_4px_12px_rgba(15,40,90,0.18)] hover:-translate-y-[1px]\"');
code = code.replace(/className=\"fd-thumb-open\"/g, 'className=\"block w-full h-full p-0 border-none bg-transparent cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#012a55] focus-visible:-outline-offset-2\"');
code = code.replace(/<img src=\{p.url\}/g, '<img src={p.url} className=\"w-full h-full object-cover block\"');
code = code.replace(/className=\"fd-thumb-remove\"/g, 'className=\"absolute top-[4px] right-[4px] w-[24px] h-[24px] grid place-items-center border-none rounded-[6px] bg-[#fde2e4] text-[#dd3333] cursor-pointer\"');

fs.writeFileSync('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features/findings/components/finding_form_page.tsx', code);
