#!/usr/bin/env python3
"""
Session Log Indexer for Dashboard Daddy
Uses DeepSeek or Gemini (NOT Claude) for cost-effective processing

This script:
1. Reads Clawdbot session logs from ~/.clawdbot/sessions/
2. Extracts messages, tasks, and token usage
3. Uses DeepSeek/Gemini for embeddings and summarization
4. Stores processed data in Supabase
"""

import os
import json
import glob
from datetime import datetime, timedelta
from pathlib import Path
import requests

# Config
CLAWDBOT_SESSIONS_DIR = os.path.expanduser("~/.clawdbot/sessions")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Use DeepSeek by default (cheaper), fallback to Gemini
USE_DEEPSEEK = bool(DEEPSEEK_API_KEY)
USE_GEMINI = bool(GEMINI_API_KEY) and not USE_DEEPSEEK


def get_deepseek_embedding(text: str) -> list:
    """Get embeddings using DeepSeek API"""
    if not DEEPSEEK_API_KEY:
        return []
    
    # DeepSeek uses OpenAI-compatible API
    response = requests.post(
        "https://api.deepseek.com/v1/embeddings",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek-chat",
            "input": text[:8000]  # Truncate if too long
        }
    )
    
    if response.ok:
        return response.json().get("data", [{}])[0].get("embedding", [])
    return []


def get_gemini_embedding(text: str) -> list:
    """Get embeddings using Gemini API"""
    if not GEMINI_API_KEY:
        return []
    
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={GEMINI_API_KEY}",
        headers={"Content-Type": "application/json"},
        json={
            "model": "models/embedding-001",
            "content": {"parts": [{"text": text[:8000]}]}
        }
    )
    
    if response.ok:
        return response.json().get("embedding", {}).get("values", [])
    return []


def summarize_with_deepseek(text: str) -> str:
    """Summarize text using DeepSeek (much cheaper than Claude)"""
    if not DEEPSEEK_API_KEY:
        return text[:500]
    
    response = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "Summarize this session log in 2-3 sentences. Focus on: tasks completed, key actions taken, and any important outcomes."},
                {"role": "user", "content": text[:10000]}
            ],
            "max_tokens": 200
        }
    )
    
    if response.ok:
        return response.json()["choices"][0]["message"]["content"]
    return text[:500]


def parse_session_log(filepath: str) -> dict:
    """Parse a Clawdbot session log file"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        messages = data.get("messages", [])
        
        # Extract stats
        user_messages = [m for m in messages if m.get("role") == "user"]
        assistant_messages = [m for m in messages if m.get("role") == "assistant"]
        
        # Estimate tokens (rough: 4 chars per token)
        total_chars = sum(len(str(m.get("content", ""))) for m in messages)
        estimated_tokens = total_chars // 4
        
        # Extract tasks (look for task-related patterns)
        task_mentions = 0
        for m in assistant_messages:
            content = str(m.get("content", "")).lower()
            if any(word in content for word in ["completed", "done", "finished", "sent", "created", "updated"]):
                task_mentions += 1
        
        return {
            "session_id": data.get("sessionId", os.path.basename(filepath)),
            "created_at": data.get("createdAt"),
            "message_count": len(messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "estimated_tokens": estimated_tokens,
            "task_mentions": task_mentions,
            "raw_content": json.dumps(messages)[:50000]  # Truncate for embedding
        }
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return None


def store_in_supabase(session_data: dict):
    """Store processed session data in Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase not configured, skipping storage")
        return False
    
    # Get embedding
    if USE_DEEPSEEK:
        embedding = get_deepseek_embedding(session_data.get("raw_content", "")[:5000])
        provider = "deepseek"
    elif USE_GEMINI:
        embedding = get_gemini_embedding(session_data.get("raw_content", "")[:5000])
        provider = "gemini"
    else:
        embedding = []
        provider = "none"
    
    # Store in agent_execution_log table
    record = {
        "action": "session_indexed",
        "metadata": {
            "session_id": session_data["session_id"],
            "message_count": session_data["message_count"],
            "estimated_tokens": session_data["estimated_tokens"],
            "task_mentions": session_data["task_mentions"],
            "embedding_provider": provider
        }
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/agent_execution_log",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        json=record
    )
    
    return response.ok


def main():
    print("=== Dashboard Daddy Session Indexer ===")
    print(f"Using: {'DeepSeek' if USE_DEEPSEEK else 'Gemini' if USE_GEMINI else 'No AI (local only)'}")
    print(f"Sessions dir: {CLAWDBOT_SESSIONS_DIR}")
    
    # Find all session files from last 7 days
    session_files = glob.glob(f"{CLAWDBOT_SESSIONS_DIR}/**/*.json", recursive=True)
    print(f"Found {len(session_files)} session files")
    
    processed = 0
    total_tokens = 0
    total_tasks = 0
    
    for filepath in session_files[-50:]:  # Process last 50 sessions
        session_data = parse_session_log(filepath)
        if session_data:
            total_tokens += session_data["estimated_tokens"]
            total_tasks += session_data["task_mentions"]
            
            if store_in_supabase(session_data):
                processed += 1
                print(f"  ✓ Indexed: {session_data['session_id'][:20]}... ({session_data['message_count']} msgs)")
    
    print(f"\n=== Summary ===")
    print(f"Sessions processed: {processed}")
    print(f"Total estimated tokens: {total_tokens:,}")
    print(f"Total task mentions: {total_tasks}")
    print(f"Estimated cost saved vs Claude: ${(total_tokens * 0.000015):.2f}")  # Claude is ~$15/1M tokens


if __name__ == "__main__":
    main()
