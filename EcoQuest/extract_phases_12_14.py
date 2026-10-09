import re
with open('real_roadmap.txt', encoding='utf-8') as f:
    text = f.read()
match = re.search(r'(?i)PHASE 12.*?PHASE 15', text, re.DOTALL)
if match:
    with open('phases12_14_info.txt', 'w', encoding='utf-8') as out:
        out.write(match.group(0))
