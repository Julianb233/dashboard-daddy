import { readFile } from 'fs/promises';
import { join } from 'path';
import type { AgentsConfigFile } from '@/types/agent-api';

let cachedConfig: AgentsConfigFile | null = null;
let configLoadTime: number = 0;
const CONFIG_CACHE_TTL = 30000; // 30 seconds

export async function loadAgentsConfig(): Promise<AgentsConfigFile> {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && (now - configLoadTime) < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  // Try multiple paths (dashboard cwd vs root cwd)
  const paths = [
    join(process.cwd(), '..', 'config', 'agents.json'),
    join(process.cwd(), 'config', 'agents.json'),
    '/opt/agency-workspace/dashboard-daddy/config/agents.json', // Docker absolute fallback
  ];

  for (const configPath of paths) {
    try {
      const content = await readFile(configPath, 'utf-8');
      cachedConfig = JSON.parse(content) as AgentsConfigFile;
      configLoadTime = now;
      return cachedConfig;
    } catch {
      continue;
    }
  }

  throw new Error('Failed to load agents config from any known path');
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
  configLoadTime = 0;
}

export function getAgentConfig(agentId: string): Promise<AgentsConfigFile['agents'][string] | null> {
  return loadAgentsConfig().then(config => config.agents[agentId] || null);
}
