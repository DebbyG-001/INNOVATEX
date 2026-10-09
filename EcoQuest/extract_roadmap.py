import json
import re

transcript_path = r"C:\Users\Joseph Dania\.gemini\antigravity-ide\brain\cd743ed2-da49-4bc6-b803-27351a46ef8a\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            content = data['content']
            # Find phase 10
            match = re.search(r'(?i)phase\s*10.*?(?=phase\s*11|$)', content, re.DOTALL)
            if match:
                with open('phase10_info.txt', 'w', encoding='utf-8') as out:
                    out.write(match.group(0))
            break
