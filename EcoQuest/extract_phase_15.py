import re
with open('real_roadmap.txt', encoding='utf-8') as f:
    text = f.read()
match = re.search(r'(?i)PHASE 15.*?PHASE 16', text, re.DOTALL)
if match:
    with open('phase15_info.txt', 'w', encoding='utf-8') as out:
        out.write(match.group(0))
else:
    match2 = re.search(r'(?i)PHASE 15.*', text, re.DOTALL)
    if match2:
        with open('phase15_info.txt', 'w', encoding='utf-8') as out:
            out.write(match2.group(0))
