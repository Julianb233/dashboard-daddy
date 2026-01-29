# Dashboard Daddy - Memory & Indexing Architecture

## Triple Storage System

Data is stored across three systems for redundancy and different query patterns:

### 1. Local Memory Files (Markdown)
- **Location:** `~/clawd/memory/`
- **Format:** Markdown files
- **Use:** Daily logs, quick reference
- **Example:** `memory/2026-01-28.md`, `memory/faith.md`

### 2. Pinecone (Vector Database)
- **Index:** `lifeos`
- **Dimensions:** 1536 (Gemini embeddings)
- **Namespaces:** business, personal, learning
- **Use:** Semantic search ("what did Julian say about...")

### 3. Supabase (Relational Database)
- **Project:** jrirksdiklqwsaatbhvg
- **Tables:** 25 tables (see DATABASE.md)
- **Use:** Structured queries, UI display, tracking

## Query Patterns

| Query Type | System | Example |
|------------|--------|---------|
| "What's Faith's medication?" | Supabase `pets` | Exact structured data |
| "What did we discuss about Faith?" | Pinecone | Semantic similarity |
| "What happened today?" | Local memory | Daily log file |

## Data Flow

```
User Input → 
  ├── Supabase (structured data)
  ├── Pinecone (vector embedding)
  └── Local markdown (raw log)
```

## Indexing Tools

### Pinecone
```bash
python3 tools/pinecone_tool.py store --namespace personal --text "..."
python3 tools/pinecone_tool.py query --text "search query" --namespace personal
```

### Supabase
Direct REST API or Supabase client library.

### Local Memory
Read/write markdown files in `memory/` directory.
