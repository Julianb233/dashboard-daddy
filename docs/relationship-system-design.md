# Personal Relationship Intelligence System
## Designed for Julian Bradley's Life OS

### Core Philosophy

**Relationships decay without intentional contact.** The system should:
1. Surface who needs attention before it's awkward
2. Remember context so conversations feel continuous
3. Track relationship health, not just contact logs
4. Understand communication preferences by person

---

## Database Schema Design

### 1. PEOPLE (Core Entity)
```sql
CREATE TABLE people (
  id UUID PRIMARY KEY,
  
  -- Identity
  name TEXT NOT NULL,
  nickname TEXT,                    -- How Julian actually refers to them
  photo_url TEXT,
  
  -- Classification
  relationship_type TEXT,           -- family, friend, business, client, acquaintance
  inner_circle BOOLEAN DEFAULT false, -- Top 20 people who matter most
  
  -- Contact Info
  phone TEXT,
  email TEXT,
  instagram TEXT,
  linkedin TEXT,
  preferred_channel TEXT,           -- 'imessage', 'telegram', 'email', 'call'
  
  -- Relationship Health
  health_score INTEGER DEFAULT 50,  -- 0-100, decays over time without contact
  sentiment TEXT DEFAULT 'neutral', -- positive, neutral, cooling, strained
  last_contact TIMESTAMPTZ,
  contact_frequency_target INTEGER, -- Days between ideal contacts
  
  -- Context
  how_we_met TEXT,
  what_they_do TEXT,
  interests TEXT[],
  important_dates JSONB,            -- {birthday: "03-15", anniversary: "06-20"}
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. INTERACTIONS (Every Touchpoint)
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  
  -- What happened
  channel TEXT,                     -- imessage, email, call, in_person, telegram
  direction TEXT,                   -- inbound, outbound
  interaction_type TEXT,            -- casual, business, deep_conversation, quick_check_in
  
  -- Content & Context
  summary TEXT,                     -- AI-generated summary of conversation
  topics TEXT[],                    -- What was discussed
  sentiment TEXT,                   -- How did it feel?
  action_items TEXT[],              -- Things to follow up on
  
  -- For AI context
  raw_content TEXT,                 -- Optional: store actual messages for context
  tokens_used INTEGER,
  
  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,
  
  -- Metadata
  created_by TEXT DEFAULT 'bubba'   -- Who logged this
);
```

### 3. FOLLOW_UPS (Never Drop the Ball)
```sql
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  interaction_id UUID REFERENCES interactions(id),
  
  -- What needs to happen
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',   -- high, medium, low
  due_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending',    -- pending, completed, skipped
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. LIFE_EVENTS (Remember What Matters)
```sql
CREATE TABLE life_events (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  
  event_type TEXT,                  -- birthday, promotion, baby, wedding, loss, milestone
  event_date DATE,
  description TEXT,
  recurring BOOLEAN DEFAULT false,  -- Birthdays repeat, promotions don't
  
  -- Should we reach out?
  requires_acknowledgment BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. RELATIONSHIP_INSIGHTS (AI-Generated)
```sql
CREATE TABLE relationship_insights (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  
  -- AI Analysis
  insight_type TEXT,                -- pattern, suggestion, warning, opportunity
  insight TEXT,
  confidence FLOAT,
  
  -- Action
  suggested_action TEXT,
  actioned BOOLEAN DEFAULT false,
  
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Dashboard Design

### Main View: "Who Needs Attention?"

**Top Section: Relationship Health Overview**
```
┌─────────────────────────────────────────────────────────────┐
│  🟢 Healthy (45)  │  🟡 Cooling (12)  │  🔴 At Risk (3)    │
│  Last 7 days: +8  │  Need check-in   │  Overdue contact   │
└─────────────────────────────────────────────────────────────┘
```

**Priority Queue: People Who Need Attention NOW**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 Mom - Last contact: 5 days ago (target: 3 days)         │
│    └─ Suggested: Quick call to check in                    │
│                                                             │
│ 🟡 Alex Vidger - Follow-up due on modeling collab          │
│    └─ Context: Discussed Live Kolibri shoot pricing        │
│                                                             │
│ 🟡 Sam Habib - Mentioned chicken & waffles plan            │
│    └─ Context: Texted about Mom's C&W earlier today        │
└─────────────────────────────────────────────────────────────┘
```

**Communication Timeline (Recent)**
```
┌─────────────────────────────────────────────────────────────┐
│ Today                                                       │
│  📱 Sam - "chicken waffles plan" (outbound, iMessage)      │
│  📧 R3 Wellness - Model submission (outbound, email)       │
│                                                             │
│ Yesterday                                                   │
│  📱 Rachel - Dinner plans (inbound, iMessage)              │
│  📞 Mom - 12 min call (outbound, phone)                    │
└─────────────────────────────────────────────────────────────┘
```

**Inner Circle Health** (Top 20)
```
┌─────────────────────────────────────────────────────────────┐
│ Family           │ Friends          │ Business             │
│ ───────────────  │ ───────────────  │ ───────────────      │
│ Rachel    🟢 98  │ Sam       🟢 85  │ Fred Cary  🟡 62     │
│ Mom       🟡 72  │ Brother Dan 🟢 78│ Alex V     🟡 58     │
│ Dad       🟡 65  │              │ Stephen P  🟡 55     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. **Relationship Health Decay**
- Health score decreases daily based on contact_frequency_target
- Family decays slower (people forgive family)
- Business contacts decay faster (out of sight = out of mind)
- Deep conversations add more health than quick texts

### 2. **Context Continuity**
- Before any outreach, show: "Last time you talked about..."
- AI summarizes recent interactions
- Surface relevant topics: "They mentioned job hunting 2 weeks ago"

### 3. **Smart Reminders**
- "You haven't talked to Mom in 5 days" (proactive)
- "Sam's birthday is in 3 days" (upcoming events)
- "Follow up with Alex about the shoot" (action items)

### 4. **Communication Analytics**
- Who do you talk to most?
- Which relationships are growing vs cooling?
- Response time patterns
- Preferred channels by person

### 5. **AI Insights**
- "You've been talking to Sam more lately - close friend emerging?"
- "Haven't heard from Dad in 3 weeks - unusual pattern"
- "Good time to reconnect with Brother Dan - last chat was positive"

---

## Implementation Priority

**Phase 1: Foundation**
- [ ] People table with health scoring
- [ ] Basic interaction logging
- [ ] Dashboard: Who needs attention

**Phase 2: Intelligence**
- [ ] AI-generated summaries of conversations
- [ ] Context retrieval before outreach
- [ ] Follow-up tracking

**Phase 3: Proactive**
- [ ] Life events calendar
- [ ] Smart reminders via Telegram
- [ ] Relationship insights engine

---

## Integration Points

1. **iMessage** → Auto-log conversations (via Mac Mini)
2. **Email** → Parse Gmail for contacts and summaries
3. **Telegram** → Direct logging through Bubba
4. **Calendar** → Extract meeting attendees
5. **Contacts** → Sync with Google/Apple contacts

---

*Designed by Bubba for Julian's Life OS - January 2026*
