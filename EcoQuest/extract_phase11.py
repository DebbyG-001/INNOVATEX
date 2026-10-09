import re
with open('real_roadmap.txt', encoding='utf-8') as f:
    text = f.read()
match = re.search(r'(?i)PHASE 11.*?PHASE 12', text, re.DOTALL)
if match:
    with open('phase11_info.txt', 'w', encoding='utf-8') as out:
        out.write(match.group(0))
