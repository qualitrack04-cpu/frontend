import glob
import os
import re

files = glob.glob('c:/Users/HP/project-flutter/QualiTrack-Team/frontend/src/features/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the h1 class strings to be smaller, navy, and bold, with less margin so it goes up
    new_content = re.sub(
        r'className="text-\[3rem\] font-bold text-\[\#0f2c52\][^"]+"',
        'className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6"',
        content
    )
    new_content = re.sub(
        r'className="text-\[32px\] font-bold text-\[\#0f2c52\][^"]+"',
        'className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6"',
        new_content
    )
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
