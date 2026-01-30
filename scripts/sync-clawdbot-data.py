#!/usr/bin/env python3
"""
Clawdbot → Dashboard Daddy Sync Script
Runs every 10 minutes via cron

Uses DeepSeek (cheap) to:
1. Parse session messages
2. Extract people context
3. Summarize interactions
4. Store in Supabase
"""

import os
import json
import glob
import hashlib
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Config
DEEPSEEK_API_KEY = open(os.path.expanduser("~/.config/deepseek/api_key")).read().strip()
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Load from .env if not in environment
ENV_FILE = "/home/dev/dashboard-daddy/frontend/.env.local"
if os.path.exists(ENV_FILE) and not SUPABASE_URL:
    with open(ENV_FILE) as f:
        for line in f:
            if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                SUPABASE_URL = line.split("=", 1)[1].strip().strip('"')
            if line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                SUPABASE_KEY = line.split("=", 1)[1].strip().strip('"')

CLAWDBOT_DIR = os.path.expanduser("~/.clawdbot")
MEMORY_DIR = "/home/dev/clawd/memory"
STATE_FILE = "/home/dev/dashboard-daddy/scripts/.sync-state.json"


def load_state():
    """Load sync state to avoid reprocessing"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"last_sync": None, "processed_hashes": []}


def save_state(state):
    """Save sync state"""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)


def deepseek_chat(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str:
    """Call DeepSeek API (OpenAI-compatible, very cheap)"""
    try:
        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt[:15000]}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.3
            },
            timeout=30
        )
        if response.ok:
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"DeepSeek error: {e}")
    return ""


def extract_people_from_text(text: str) -> list:
    """Use DeepSeek to extract people mentioned in conversations"""
    prompt = """Extract all people mentioned in this conversation. Return JSON array with:
- name: person's name
- relationship: (family/business/friend/client/unknown)
- context: brief context about them (1 sentence)
- sentiment: (positive/neutral/negative)

Only return the JSON array, nothing else. If no people found, return []"""
    
    result = deepseek_chat(prompt, text)
    try:
        # Try to parse JSON from response
        if "[" in result:
            json_str = result[result.find("["):result.rfind("]")+1]
            return json.loads(json_str)
    except:
        pass
    return []


def summarize_activity(text: str) -> dict:
    """Summarize session activity for audit log"""
    prompt = """Analyze this session and return JSON with:
- summary: 1-2 sentence summary of what happened
- tasks_completed: number of tasks/actions completed
- key_actions: list of main actions taken (max 5)
- tokens_estimate: rough estimate of tokens used

Only return JSON, nothing else."""
    
    result = deepseek_chat(prompt, text[:10000])
    try:
        if "{" in result:
            json_str = result[result.find("{"):result.rfind("}")+1]
            return json.loads(json_str)
    except:
        pass
    return {"summary": "Session activity", "tasks_completed": 0, "key_actions": [], "tokens_estimate": 1000}


def get_telegram_messages():
    """Read recent Telegram messages from Clawdbot"""
    messages = []
    telegram_dir = os.path.join(CLAWDBOT_DIR, "telegram")
    
    # Check for message cache/history files
    for pattern in ["*.json", "messages*.json", "history*.json"]:
        for f in glob.glob(os.path.join(telegram_dir, pattern)):
            try:
                with open(f) as fp:
                    data = json.load(fp)
                    if isinstance(data, list):
                        messages.extend(data)
                    elif isinstance(data, dict) and "messages" in data:
                        messages.extend(data["messages"])
            except:
                pass
    
    return messages


def get_session_logs():
    """Get Clawdbot session logs"""
    sessions = []
    sessions_file = os.path.join(CLAWDBOT_DIR, "agents/main/sessions/sessions.json")
    
    if os.path.exists(sessions_file):
        try:
            with open(sessions_file) as f:
                data = json.load(f)
                if isinstance(data, dict):
                    sessions = list(data.values()) if not isinstance(list(data.values())[0], str) else [data]
                elif isinstance(data, list):
                    sessions = data
        except Exception as e:
            print(f"Error reading sessions: {e}")
    
    return sessions


def get_memory_files():
    """Read memory markdown files for context"""
    content = []
    
    # Read today's and yesterday's memory files
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    for date in [today, yesterday]:
        filepath = os.path.join(MEMORY_DIR, f"{date}.md")
        if os.path.exists(filepath):
            with open(filepath) as f:
                content.append({"date": date, "content": f.read()})
    
    # Also read MEMORY.md
    memory_md = "/home/dev/clawd/MEMORY.md"
    if os.path.exists(memory_md):
        with open(memory_md) as f:
            content.append({"date": "long-term", "content": f.read()[:5000]})
    
    return content


def store_people(people: list):
    """Store extracted people in local JSON file"""
    if not people:
        return 0
    
    DATA_FILE = "/home/dev/dashboard-daddy/data/relationships.json"
    
    # Read existing
    existing = []
    try:
        with open(DATA_FILE) as f:
            existing = json.load(f)
    except:
        pass
    
    existing_names = {p.get("name", "").lower() for p in existing}
    
    stored = 0
    for person in people:
        name = person.get("name", "Unknown")
        if name.lower() not in existing_names:
            record = {
                "id": str(len(existing) + stored + 1),
                "name": name,
                "relationship_type": person.get("relationship", "unknown"),
                "notes": person.get("context", ""),
                "priority": "high" if person.get("relationship") == "family" else "medium",
                "status": "active",
                "last_contact": datetime.now().strftime("%Y-%m-%d")
            }
            existing.append(record)
            existing_names.add(name.lower())
            stored += 1
    
    # Save
    with open(DATA_FILE, "w") as f:
        json.dump(existing, f, indent=2)
    
    return stored


def store_activity(activity: dict, source: str):
    """Store activity in local audit log"""
    DATA_FILE = "/home/dev/dashboard-daddy/data/audit_log.json"
    
    # Read existing
    logs = []
    try:
        with open(DATA_FILE) as f:
            logs = json.load(f)
    except:
        pass
    
    record = {
        "id": str(len(logs) + 1),
        "action": "sync_activity",
        "actor": "Bubba",
        "actor_role": "agent",
        "details": activity.get("summary", "Sync completed"),
        "metadata": {
            "tasks_completed": activity.get("tasks_completed", 0),
            "key_actions": activity.get("key_actions", []),
            "tokens_estimate": activity.get("tokens_estimate", 0),
            "source": source
        },
        "created_at": datetime.now().isoformat()
    }
    
    logs.insert(0, record)
    logs = logs[:100]  # Keep last 100
    
    with open(DATA_FILE, "w") as f:
        json.dump(logs, f, indent=2)
    
    return True


def store_stats(stats: dict):
    """Update dashboard stats in local file"""
    STATS_FILE = "/home/dev/dashboard-daddy/data/stats.json"
    
    # Read existing
    existing = {}
    try:
        with open(STATS_FILE) as f:
            existing = json.load(f)
    except:
        pass
    
    # Update with new stats
    existing.update({
        "activeAgents": 1,
        "totalMessages": existing.get("totalMessages", 0) + stats.get("messages_processed", 0),
        "tokensUsed": existing.get("tokensUsed", 0) + stats.get("tokens_estimate", 0),
        "monthlyCost": (existing.get("tokensUsed", 0) + stats.get("tokens_estimate", 0)) * 0.00003,  # ~$30/1M tokens avg
        "lastUpdated": datetime.now().isoformat()
    })
    
    with open(STATS_FILE, "w") as f:
        json.dump(existing, f, indent=2)
    
    return True


def main():
    print(f"=== Clawdbot Data Sync ({datetime.now().strftime('%Y-%m-%d %H:%M')}) ===")
    print(f"DeepSeek: {'configured' if DEEPSEEK_API_KEY else 'missing'}")
    print(f"Supabase: {'configured' if SUPABASE_URL else 'missing'}")
    
    state = load_state()
    
    # Collect all text to process
    all_text = ""
    
    # 1. Get memory files
    print("\n📝 Reading memory files...")
    memories = get_memory_files()
    for mem in memories:
        all_text += f"\n--- Memory {mem['date']} ---\n{mem['content']}\n"
    print(f"   Found {len(memories)} memory files")
    
    # 2. Get session logs
    print("\n📊 Reading session logs...")
    sessions = get_session_logs()
    print(f"   Found {len(sessions)} sessions")
    
    # 3. Extract people from all content
    print("\n👥 Extracting people with DeepSeek...")
    if all_text:
        content_hash = hashlib.md5(all_text[:5000].encode()).hexdigest()
        if content_hash not in state.get("processed_hashes", []):
            people = extract_people_from_text(all_text[:10000])
            print(f"   Found {len(people)} people mentioned")
            
            for p in people[:10]:  # Limit to avoid spam
                print(f"   • {p.get('name', 'Unknown')} ({p.get('relationship', 'unknown')})")
            
            stored = store_people(people)
            print(f"   Stored {stored} people in Supabase")
            
            state["processed_hashes"] = state.get("processed_hashes", [])[-50:] + [content_hash]
        else:
            print("   (content unchanged, skipping)")
    
    # 4. Summarize recent activity
    print("\n📈 Summarizing activity...")
    if all_text:
        activity = summarize_activity(all_text[:8000])
        print(f"   Summary: {activity.get('summary', 'N/A')[:100]}...")
        print(f"   Tasks: {activity.get('tasks_completed', 0)}")
        
        if store_activity(activity, "sync"):
            print("   ✓ Stored in audit log")
    
    # 5. Update stats
    stats = {
        "messages_processed": len(memories),
        "sessions_found": len(sessions),
        "sync_time": datetime.now().isoformat(),
        "tokens_estimate": len(all_text) // 4
    }
    store_stats(stats)
    
    # Save state
    state["last_sync"] = datetime.now().isoformat()
    save_state(state)
    
    print(f"\n✅ Sync complete!")


if __name__ == "__main__":
    main()
