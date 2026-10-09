import json

transcript_path = r"C:\Users\Joseph Dania\.gemini\antigravity-ide\brain\cd743ed2-da49-4bc6-b803-27351a46ef8a\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' and 'PHASE' in data.get('content', ''):
            with open('real_roadmap.txt', 'w', encoding='utf-8') as out:
                out.write(data['content'])
            break
