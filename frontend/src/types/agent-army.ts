// Agent Army types for hierarchical organization

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
  total_uptime: number; // in minutes
  success_rate: number; // calculated field
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

// For drag and drop operations
export interface DragItem {
  id: string;
  name: string;
  role: ArmyRole;
  currentSquad?: SquadName;
}

export interface DropTarget {
  squad: SquadName;
  role: 'squad_leader' | 'agent';
}

// For agent detail modal
export interface AgentDetailProps {
  agent: ArmyAgent;
  onClose: () => void;
  onUpdate: (updates: Partial<ArmyAgent>) => void;
  onDelete: (id: string) => void;
}

// For creating new agents
export interface CreateAgentData {
  name: string;
  role: ArmyRole;
  squad?: SquadName;
  parent_id?: string;
  skills: string[];
  description?: string;
}

// API response types
export interface ArmyResponse {
  success: boolean;
  data?: ArmyHierarchy;
  error?: string;
}

export interface AgentUpdateResponse {
  success: boolean;
  agent?: ArmyAgent;
  error?: string;
}

// Skill categories for the skill selector
export const SKILL_CATEGORIES = {
  Technical: [
    'Frontend Development',
    'Backend Development', 
    'Database Design',
    'API Development',
    'DevOps',
    'Quality Assurance',
    'System Administration',
    'Security Monitoring'
  ],
  Research: [
    'Data Analysis',
    'Market Research',
    'Competitive Analysis',
    'Web Scraping',
    'Statistical Analysis',
    'Predictive Analytics',
    'Report Writing',
    'Information Synthesis'
  ],
  Communication: [
    'Content Writing',
    'Social Media',
    'Email Marketing',
    'Customer Support',
    'Public Relations',
    'Brand Management',
    'Campaign Management',
    'Conflict Resolution'
  ],
  Management: [
    'Project Management',
    'Team Leadership',
    'Strategic Planning',
    'Process Optimization',
    'Workflow Management',
    'Performance Monitoring',
    'Decision Making',
    'Resource Allocation'
  ]
} as const;

export type SkillCategory = keyof typeof SKILL_CATEGORIES;