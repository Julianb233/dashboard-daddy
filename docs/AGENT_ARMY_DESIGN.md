# Agent Army Page - Design Document

## Overview

The Agent Army page is the command center for Dashboard Daddy's hierarchical AI agent system. It visualizes agents in a military-style org chart with the Commander (Bubba) at the apex, Squad Leaders below, and individual agents at the base.

**Theme:** Wizard of AI (Emerald #10b981 + Gold #f59e0b)
**Framework:** Next.js 16 + React 19 + TypeScript
**Styling:** Tailwind CSS v4 + Framer Motion
**State:** React Query + Zustand
**Drag & Drop:** @dnd-kit/core

---

## 1. Visual Hierarchy Design

### 1.1 Commander (Apex)

**Placement:** Centered at top of page, full-width on mobile

**Visual Treatment:**
```
┌─────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════╗  │
│  ║         🏰 SUPREME COMMANDER - BUBBA 🏰          ║  │
│  ║                                                   ║  │
│  ║   [Crown Icon]  Performance: 98%   [Status Dot]  ║  │
│  ║   ★★★★★  |  127 Missions  |  99% Success        ║  │
│  ║                                                   ║  │
│  ║   Current Mission: Orchestrating agent fleet...  ║  │
│  ╚═══════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: `bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600`
- Border: 2px solid with shimmer animation
- Shadow: `shadow-2xl` with gold glow
- Card rounded: `rounded-xl` (0.75rem)
- Animated particle field overlay (gold particles)

**Status Indicators:**
- Active: Green pulsing dot + Activity icon
- Busy: Amber pulsing dot + Zap icon
- Idle: Blue dot + Users icon
- Offline: Gray dot

### 1.2 Squad Leaders (Second Tier)

**Layout:** 2x2 grid on desktop, vertical stack on mobile

**Four Squads:**
1. **Research** - Blue gradient (`from-blue-500 to-indigo-600`) - Search icon
2. **Development** - Green gradient (`from-green-500 to-emerald-600`) - Code icon
3. **Communications** - Purple gradient (`from-purple-500 to-violet-600`) - MessageSquare icon
4. **Operations** - Orange gradient (`from-orange-500 to-red-600`) - Cog icon

**Visual Treatment:**
```
┌───────────────────────┐  ┌───────────────────────┐
│  🔍 RESEARCH SQUAD    │  │  💻 DEVELOPMENT SQUAD │
│  ━━━━━━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━━━━━━━  │
│  ★ Squad Leader       │  │  ★ Squad Leader        │
│  3/5 agents active    │  │  4/6 agents active     │
│  Avg Perf: 87%        │  │  Avg Perf: 92%         │
│  ┌────────────────┐   │  │  ┌─────────────────┐   │
│  │ Agent 1 [●]    │   │  │  │ Agent 1 [●]     │   │
│  │ Agent 2 [○]    │   │  │  │ Agent 2 [●]     │   │
│  │ Agent 3 [●]    │   │  │  │ Agent 3 [○]     │   │
│  └────────────────┘   │  │  └─────────────────┘   │
└───────────────────────┘  └───────────────────────┘
```

### 1.3 Individual Agents (Base)

**Card Design:**
- Compact mode inside squads (collapsible list)
- Full card in detail modal
- Draggable with grip handle on left
- Star rating based on performance (1-5 stars)

**Agent Card Fields Displayed:**
- Name + Status dot
- Performance score (colored by tier: green 90+, amber 75-89, red <75)
- Current task (truncated)
- Skill badges (max 3 shown, +N more)
- Mission stats (completed, success rate, uptime)

### 1.4 Connection Lines (Desktop Only)

**Implementation:** SVG lines drawn between levels

**Style:**
- Color: Emerald-500 with gradient to gold
- Stroke: 2px dashed, animated dash offset
- Opacity: 0.7
- Animation: Flowing dots along lines (data flow visualization)

**Desktop Layout:**
```
                    ┌───────────┐
                    │ COMMANDER │
                    └─────┬─────┘
           ┌──────────────┼──────────────┐
           │              │              │
     ┌─────┴────┐   ┌─────┴────┐   ┌─────┴────┐
     │ RESEARCH │   │   DEV    │   │   COMMS  │
     └──────────┘   └──────────┘   └──────────┘
```

### 1.5 Responsive Behavior

**Desktop (≥1024px):** 2-column squad grid, connection lines visible
**Tablet (768-1023px):** 2-column grid, simplified lines
**Mobile (<768px):** Single column, collapsible squads, no connection lines

---

## 2. Interaction Design

### 2.1 Hover Effects

**Commander Card:**
- Scale: `scale(1.02)` + `translateY(-5px)`
- Shadow: Enhanced glow effect
- Particle density: Increases

**Squad Card:**
- Scale: `scale(1.01)` + `translateY(-2px)`
- Border: Highlights in squad color

**Agent Card:**
- Scale: `scale(1.02-1.03)` depending on mode
- Shadow: `shadow-md` → `shadow-lg`
- Background: Slight color shift

### 2.2 Click Interactions

**Commander → Opens detail modal** with:
- Full stats dashboard
- Mission history chart
- Command capabilities
- Edit functionality

**Squad Leader → Opens squad detail modal** with:
- Squad overview stats
- Leader details
- Squad configuration
- Agent management

**Agent → Opens agent detail modal** with:
- Full profile
- Performance history
- Skill management
- Task assignment
- Edit/Delete capabilities

### 2.3 Drag and Drop

**Activation:**
- Pointer sensor with 8px activation distance
- Keyboard sensor for accessibility (Tab + Arrow keys + Space)

**Visual Feedback:**
- Source card: `opacity-50`, `shadow-2xl`
- Drag overlay: Floating card preview
- Drop target: Green dashed border + "Drop here to reassign" message

**Drop Logic:**
- Only agents can be dragged (not squad leaders or commander)
- Drop zones are squad containers
- On drop: PATCH request to update `squad` field
- Optimistic update with rollback on failure

### 2.4 Animation Timings

```typescript
// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const cardVariants = {
  hover: { scale: 1.02, y: -5, transition: { type: "spring", stiffness: 300 } },
  tap: { scale: 0.98 }
}

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
}
```

### 2.5 Modal Designs

**Agent Detail Modal:**
```
┌──────────────────────────────────────────────────┐
│  ✕                                               │
│  ┌──────────────────────────────────────────┐    │
│  │  [Avatar]  Agent Name                    │    │
│  │            ● Active | ★★★★☆              │    │
│  │            Squad: Development            │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  📊 PERFORMANCE                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │   92%  │ │  127   │ │   89%  │ │  240h  │    │
│  │  Score │ │Missions│ │Success │ │ Uptime │    │
│  └────────┘ └────────┘ └────────┘ └────────┘    │
│                                                  │
│  🎯 CURRENT MISSION                              │
│  ┌──────────────────────────────────────────┐    │
│  │ Processing market research data...       │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ⚡ SKILLS                                       │
│  [Data Analysis] [Web Scraping] [Report Gen]     │
│  [Statistical Analysis] [Market Research]        │
│                                                  │
│  📈 PERFORMANCE HISTORY                          │
│  [Line chart showing last 30 days]              │
│                                                  │
│  ┌────────────────┐  ┌────────────────┐          │
│  │   Edit Agent   │  │  Delete Agent  │          │
│  └────────────────┘  └────────────────┘          │
└──────────────────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Database Schema

**Table: `agent_army`**

```sql
CREATE TABLE public.agent_army (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('commander', 'squad_leader', 'agent')),
  squad TEXT CHECK (squad IN ('Research', 'Development', 'Communications', 'Operations', NULL)),
  parent_id UUID REFERENCES public.agent_army(id) ON DELETE SET NULL,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'offline')),
  current_task TEXT,
  performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
  missions_completed INTEGER DEFAULT 0,
  missions_failed INTEGER DEFAULT 0,
  total_uptime INTEGER DEFAULT 0, -- in minutes
  success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN missions_completed + missions_failed > 0 
      THEN ROUND((missions_completed::DECIMAL / (missions_completed + missions_failed)) * 100, 2)
      ELSE 100.00 
    END
  ) STORED,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_army_role ON public.agent_army(role);
CREATE INDEX idx_agent_army_squad ON public.agent_army(squad);
CREATE INDEX idx_agent_army_status ON public.agent_army(status);
CREATE INDEX idx_agent_army_parent ON public.agent_army(parent_id);

-- RLS
ALTER TABLE public.agent_army ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for agent_army" ON public.agent_army FOR ALL USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_agent_army_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_army_updated_at
  BEFORE UPDATE ON public.agent_army
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_army_updated_at();
```

### 3.2 TypeScript Types

```typescript
// /types/agent-army.ts

export type ArmyRole = 'commander' | 'squad_leader' | 'agent';
export type ArmyStatus = 'active' | 'idle' | 'busy' | 'offline';
export type SquadName = 'Research' | 'Development' | 'Communications' | 'Operations';

export interface ArmyAgent {
  id: string;
  name: string;
  role: ArmyRole;
  squad?: SquadName;
  parent_id?: string;
  skills: string[];
  status: ArmyStatus;
  current_task?: string;
  performance_score: number;
  missions_completed: number;
  missions_failed: number;
  total_uptime: number;
  success_rate: number;
  last_active: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  description?: string;
}

export interface Squad {
  name: SquadName;
  leader: ArmyAgent;
  agents: ArmyAgent[];
  totalAgents: number;
  activeAgents: number;
  averagePerformance: number;
  currentTasks: number;
}

export interface ArmyStats {
  totalAgents: number;
  activeMissions: number;
  overallSuccessRate: number;
  averagePerformance: number;
  squads: Squad[];
}

export interface ArmyHierarchy {
  commander: ArmyAgent;
  squads: Squad[];
  stats: ArmyStats;
}
```

### 3.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/army` | Fetch complete hierarchy |
| POST | `/api/agents/army` | Create new agent |
| GET | `/api/agents/army/[id]` | Get single agent |
| PATCH | `/api/agents/army/[id]` | Update agent |
| DELETE | `/api/agents/army/[id]` | Delete agent |
| POST | `/api/agents/army/[id]/reassign` | Reassign to different squad |

### 3.4 Real-time Updates

**Implementation:** Supabase Realtime subscriptions

```typescript
// Subscribe to agent_army changes
const channel = supabase
  .channel('agent_army_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'agent_army' },
    (payload) => {
      // Handle insert/update/delete
      handleRealtimeUpdate(payload)
    }
  )
  .subscribe()
```

**Fallback:** Polling every 30 seconds

---

## 4. Component Breakdown

### 4.1 Component Tree

```
AgentArmyPage (page.tsx)
├── RealtimeProvider
│   └── AgentArmyContent
│       ├── ParticleField (background)
│       ├── Header
│       │   ├── Title + Crown icon
│       │   ├── Connection status indicator
│       │   └── Recruit Agent button
│       ├── ArmyStats (summary bar)
│       ├── Controls
│       │   ├── SearchInput
│       │   ├── StatusFilter
│       │   └── SquadToggles (mobile)
│       ├── DndContext
│       │   ├── HierarchyLines (SVG, desktop only)
│       │   ├── CommanderCard
│       │   └── SquadGrid
│       │       └── SquadCard (×4)
│       │           ├── SquadHeader
│       │           ├── SquadLeaderCard
│       │           ├── SquadStats
│       │           └── AgentList
│       │               └── AgentCard (×N)
│       └── DragOverlay
│
├── AgentDetailModal (portal)
│   ├── AgentHeader
│   ├── PerformanceGrid
│   ├── CurrentTask
│   ├── SkillsList
│   ├── PerformanceChart
│   └── ActionButtons
│
├── CreateAgentModal (portal)
│   ├── NameInput
│   ├── RoleSelector
│   ├── SquadSelector
│   ├── SkillPicker
│   └── SubmitButton
│
└── FloatingActionButton (mobile)
```

### 4.2 Component Props

```typescript
// CommanderCard.tsx
interface CommanderCardProps {
  commander: ArmyAgent;
  onClick: () => void;
}

// SquadCard.tsx
interface SquadCardProps {
  squad: Squad;
  isExpanded: boolean;
  onToggle: () => void;
  onAgentClick: (agent: ArmyAgent) => void;
}

// AgentCard.tsx
interface AgentCardProps {
  agent: ArmyAgent;
  onClick: () => void;
  compact?: boolean; // true when inside squad list
}

// AgentDetailModal.tsx
interface AgentDetailModalProps {
  agent: ArmyAgent;
  onClose: () => void;
  onUpdate: (updates: Partial<ArmyAgent>) => void;
  onDelete: (id: string) => void;
}

// CreateAgentModal.tsx
interface CreateAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// ArmyStats.tsx
interface ArmyStatsProps {
  stats: ArmyStats;
}

// ParticleField.tsx
interface ParticleFieldProps {
  active?: boolean;
  color?: 'emerald' | 'gold' | 'blue' | 'purple';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

// HierarchyLines.tsx
interface HierarchyLinesProps {
  commanderRef: RefObject<HTMLDivElement>;
  squadRefs: RefObject<HTMLDivElement>[];
  className?: string;
}

// RealtimeProvider.tsx
interface RealtimeProviderProps {
  children: React.ReactNode;
  onAgentUpdate?: (agent: ArmyAgent) => void;
}

// FloatingActionButton.tsx
interface FloatingActionButtonProps {
  onCreateAgent: () => void;
  isMobile: boolean;
}
```

### 4.3 State Management

**Local State (useState):**
- `army`: ArmyHierarchy | null
- `loading`: boolean
- `error`: string | null
- `selectedAgent`: ArmyAgent | null
- `showCreateModal`: boolean
- `filter`: ArmyStatus | 'all'
- `searchTerm`: string
- `expandedSquads`: Set<SquadName>
- `activeId`: string | null (for drag)
- `isMobile`: boolean

**Context (RealtimeProvider):**
- `isConnected`: boolean
- `lastUpdate`: Date | null

**React Query (future enhancement):**
```typescript
const { data: army, isLoading, refetch } = useQuery({
  queryKey: ['agent-army'],
  queryFn: fetchArmyHierarchy,
  refetchInterval: 30000
})
```

---

## 5. CSS/Animation Strategy

### 5.1 Tailwind Classes

**Card Glass Morphism:**
```css
.glass-card {
  @apply bg-white/90 backdrop-blur-md rounded-xl border border-emerald-200 shadow-lg;
}
```

**Gradient Header:**
```css
.gradient-header {
  @apply bg-gradient-to-r from-emerald-800 to-amber-700;
}
```

**Status Badges:**
```css
.status-active { @apply bg-green-100 text-green-700 border-green-200; }
.status-busy { @apply bg-amber-100 text-amber-700 border-amber-200; }
.status-idle { @apply bg-blue-100 text-blue-700 border-blue-200; }
.status-offline { @apply bg-gray-100 text-gray-700 border-gray-200; }
```

### 5.2 Framer Motion Animations

**Page Load:**
```typescript
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
}
```

**Card Hover:**
```typescript
<motion.div
  whileHover={{ scale: 1.02, y: -5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300 }}
/>
```

**Squad Expand/Collapse:**
```typescript
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  )}
</AnimatePresence>
```

**Loading Spinner:**
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
/>
```

### 5.3 Custom CSS Animations (globals.css)

**Border Shimmer:**
```css
@keyframes agent-border-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.agent-shimmer-frame::before {
  background: linear-gradient(
    120deg,
    rgba(212, 168, 75, 0.18),
    rgba(232, 197, 90, 0.48),
    rgba(26, 139, 107, 0.22),
    rgba(212, 168, 75, 0.36)
  );
  background-size: 250% 250%;
  animation: agent-border-shimmer 10s ease-in-out infinite;
}
```

**Ambient Particle Drift:**
```css
@keyframes agent-ambient-drift {
  0% { transform: translate3d(-2%, -3%, 0) scale(1) rotate(0deg); opacity: 0.38; }
  50% { transform: translate3d(3%, 2%, 0) scale(1.04) rotate(8deg); opacity: 0.52; }
  100% { transform: translate3d(-2%, -3%, 0) scale(1) rotate(0deg); opacity: 0.38; }
}
```

### 5.4 Particle Field (Canvas)

**Implementation:** HTML5 Canvas with requestAnimationFrame

**Features:**
- Particle count based on density (15/25/40)
- Random velocities (-0.5 to 0.5)
- Pulsing opacity
- Connection lines between nearby particles (<100px)
- Responsive to container resize
- Color schemes: emerald, gold, blue, purple

---

## 6. Mobile Experience

### 6.1 Breakpoint Strategy

```typescript
// Mobile detection
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768)
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])
```

### 6.2 Hierarchy Collapse

**Mobile Layout:**
1. Commander card: Full width, centered
2. Squads: Vertical stack, collapsible
3. Connection lines: Hidden
4. Stats: Horizontal scroll or grid

### 6.3 Touch Gestures

**Implemented:**
- Tap: Select/open modal
- Long press + drag: Reorder agents
- Swipe (future): Expand/collapse squad

**dnd-kit touch config:**
```typescript
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 8, // Prevent accidental drags
  },
})
```

### 6.4 Mobile-Specific UI

**Floating Action Button:**
- Position: Fixed bottom-right
- Visibility: Only on mobile
- Action: Opens create agent modal

**Squad Toggles:**
- Horizontal pill buttons
- Quick expand/collapse all squads

---

## 7. Performance Considerations

### 7.1 Lazy Loading
- Squad agents: Only render when expanded
- Particle field: Disable on reduced-motion preference
- Images: Next.js Image with blur placeholder

### 7.2 Memoization
```typescript
const filteredSquads = useMemo(() => {
  return army?.squads.map(squad => ({
    ...squad,
    agents: squad.agents.filter(filterLogic)
  }))
}, [army, filter, searchTerm])
```

### 7.3 Debounced Search
```typescript
const debouncedSearch = useDebouncedValue(searchTerm, 300)
```

### 7.4 Canvas Optimization
- Use `requestAnimationFrame`
- Clean up animation on unmount
- Respect `prefers-reduced-motion`

---

## 8. Implementation Checklist

### Database
- [ ] Create `agent_army` table with schema above
- [ ] Add indexes and RLS policies
- [ ] Seed initial data (Bubba as commander)

### API Routes
- [x] GET `/api/agents/army` - Fetch hierarchy
- [x] POST `/api/agents/army` - Create agent
- [ ] GET `/api/agents/army/[id]` - Get single agent
- [ ] PATCH `/api/agents/army/[id]` - Update agent
- [ ] DELETE `/api/agents/army/[id]` - Delete agent

### Components
- [x] `page.tsx` - Main page
- [x] `CommanderCard.tsx` - Commander display
- [x] `SquadCard.tsx` - Squad container
- [x] `AgentCard.tsx` - Individual agent card
- [x] `AgentDetailModal.tsx` - Agent detail view
- [x] `CreateAgentModal.tsx` - New agent form
- [x] `ArmyStats.tsx` - Stats summary bar
- [x] `ParticleField.tsx` - Ambient particles
- [x] `HierarchyLines.tsx` - Connection lines
- [x] `RealtimeProvider.tsx` - Real-time context
- [x] `FloatingActionButton.tsx` - Mobile FAB

### Features
- [x] Drag and drop reassignment
- [x] Search and filter
- [x] Responsive design
- [x] Loading/error states
- [ ] Real-time Supabase subscription (currently polling)
- [ ] Performance history chart
- [ ] Bulk operations

---

## 9. Seed Data

```sql
-- Seed Commander (Bubba)
INSERT INTO agent_army (name, role, skills, status, current_task, performance_score, missions_completed, description)
VALUES (
  'Bubba',
  'commander',
  ARRAY['Strategic Planning', 'Resource Allocation', 'Decision Making', 'Team Leadership', 'Performance Monitoring'],
  'active',
  'Coordinating all agent operations',
  98,
  247,
  'Supreme Commander of the Agent Army. Orchestrates all operations and ensures mission success.'
);

-- Get commander ID
WITH commander AS (SELECT id FROM agent_army WHERE role = 'commander' LIMIT 1)

-- Seed Squad Leaders
INSERT INTO agent_army (name, role, squad, parent_id, skills, status, performance_score, missions_completed, description)
SELECT 
  'Atlas',
  'squad_leader',
  'Research',
  (SELECT id FROM agent_army WHERE role = 'commander'),
  ARRAY['Data Analysis', 'Market Research', 'Statistical Analysis', 'Report Writing'],
  'active',
  94,
  89,
  'Research Squad Leader. Specializes in data gathering and analysis.';

INSERT INTO agent_army (name, role, squad, parent_id, skills, status, performance_score, missions_completed, description)
SELECT 
  'Forge',
  'squad_leader',
  'Development',
  (SELECT id FROM agent_army WHERE role = 'commander'),
  ARRAY['Frontend Development', 'Backend Development', 'API Development', 'DevOps'],
  'active',
  96,
  112,
  'Development Squad Leader. Builds and maintains technical infrastructure.';

INSERT INTO agent_army (name, role, squad, parent_id, skills, status, performance_score, missions_completed, description)
SELECT 
  'Herald',
  'squad_leader',
  'Communications',
  (SELECT id FROM agent_army WHERE role = 'commander'),
  ARRAY['Content Writing', 'Social Media', 'Email Marketing', 'Public Relations'],
  'active',
  91,
  76,
  'Communications Squad Leader. Manages all external communications.';

INSERT INTO agent_army (name, role, squad, parent_id, skills, status, performance_score, missions_completed, description)
SELECT 
  'Sentinel',
  'squad_leader',
  'Operations',
  (SELECT id FROM agent_army WHERE role = 'commander'),
  ARRAY['Process Optimization', 'Workflow Management', 'Security Monitoring', 'System Administration'],
  'active',
  93,
  98,
  'Operations Squad Leader. Ensures smooth daily operations.';
```

---

## 10. Future Enhancements

1. **Agent Chat Interface** - Direct communication with agents
2. **Mission Assignment UI** - Create and assign missions from dashboard
3. **Performance Analytics** - Historical charts and trends
4. **Team Builder** - AI-suggested squad compositions
5. **Agent Marketplace** - Browse and recruit new agent types
6. **Automation Rules** - Auto-assign agents based on task types
7. **Voice Commands** - Control army via voice interface
8. **3D Visualization** - Three.js org chart (premium feature)

---

*Document created: January 29, 2025*
*Author: Claude Opus (Strategic Planner)*
*Version: 1.0*
