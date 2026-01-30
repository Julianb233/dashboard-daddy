import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// SOP Categories
const categories = [
  'Communication',
  'Research',
  'Development',
  'QA & Testing',
  'Automation',
  'Personal Tasks',
  'Business Operations',
  'Health & Wellness'
];

// Current SOPs (will move to Supabase)
const sops = [
  {
    id: 'sop-qa-verification',
    name: 'QA Verification SOP',
    category: 'QA & Testing',
    status: 'pending_approval',
    description: 'Verify all work before marking complete using browser automation, API checks, and database validation.',
    thoughtProcess: 'Before any deliverable goes to Julian, systematically verify: 1) UI renders correctly, 2) APIs return expected data, 3) Database has correct records, 4) No console errors.',
    tools: ['Browserbase', 'Playwright', 'curl', 'Supabase'],
    skills: ['browser_verify.py', 'browser_qa.py'],
    agents: ['Main Agent'],
    triggers: ['Before marking any task complete', 'After deployment'],
    steps: [
      'Run HTTP status check on all endpoints',
      'Spin up Browserbase session',
      'Navigate to each page',
      'Check for visible errors',
      'Take screenshot as evidence',
      'Log results to qa_verification table',
      'Only mark complete if all checks pass'
    ],
    createdAt: '2026-01-29T09:41:00Z',
    updatedAt: '2026-01-29T09:41:00Z'
  },
  {
    id: 'sop-meeting-briefing',
    name: 'Meeting Briefing SOP',
    category: 'Communication',
    status: 'approved',
    description: 'Prepare and deliver voice briefings before meetings with attendee research and talking points.',
    thoughtProcess: 'Julian needs context before meetings. Research attendees, understand the agenda, prepare talking points, and deliver as voice note so he can listen on-the-go.',
    tools: ['Google Calendar API', 'LinkedIn', 'Web Search', 'TTS'],
    skills: ['tts', 'web_search', 'web_fetch'],
    agents: ['Meeting Briefing Agent (Cron)'],
    triggers: ['Hourly check 7AM-5PM', 'When meeting is 60-90 min away'],
    steps: [
      'Check calendar for upcoming meetings',
      'Get meeting details (title, attendees, description)',
      'Research each attendee (LinkedIn, company, recent activity)',
      'Check memory for previous interactions',
      'Prepare key talking points',
      'Create 60-90 second voice briefing',
      'Send via Telegram as voice note + text summary'
    ],
    createdAt: '2026-01-28T14:49:00Z',
    updatedAt: '2026-01-29T07:00:00Z'
  },
  {
    id: 'sop-faith-care',
    name: 'Pet Care Reminders SOP',
    category: 'Health & Wellness',
    status: 'approved',
    description: 'Send voice reminders for Faith\'s medication and care schedule with detailed instructions.',
    thoughtProcess: 'Health tasks need timely reminders with clear instructions. Voice notes are more engaging and harder to miss than text.',
    tools: ['Google Calendar API', 'TTS', 'Telegram'],
    skills: ['tts', 'cron'],
    agents: ['Pet Care Agent (Cron)'],
    triggers: ['8 PM daily (Mometamax)', 'Tue/Fri (Ear Flush)', 'Monthly 28th (Tick/Flea)'],
    steps: [
      'Check what care is due today',
      'Get instructions from pet care database',
      'Create voice note with step-by-step instructions',
      'Send via Telegram',
      'Log completion in pet_care table'
    ],
    createdAt: '2026-01-29T09:46:00Z',
    updatedAt: '2026-01-29T09:46:00Z'
  },
  {
    id: 'sop-github-linear-sync',
    name: 'GitHub to Linear Sync SOP',
    category: 'Development',
    status: 'approved',
    description: 'Daily sync of GitHub activity to Linear for unified project tracking.',
    thoughtProcess: 'Keep all work visible in one place. GitHub has the code, Linear has the project management. Sync them daily.',
    tools: ['GitHub CLI', 'Linear API'],
    skills: ['github'],
    agents: ['GitHub-Linear Sync Agent (Cron)'],
    triggers: ['Daily at 9 AM PST'],
    steps: [
      'List all repos in Ai-Acrobatics org',
      'For each repo, get recent commits, PRs, issues',
      'Check if corresponding Linear issue exists',
      'Create Linear issue if not tracked',
      'Update existing issues with new activity',
      'Report summary to Julian via Telegram'
    ],
    createdAt: '2026-01-27T09:00:00Z',
    updatedAt: '2026-01-29T09:00:00Z'
  },
  {
    id: 'sop-morning-briefing',
    name: 'Morning Briefing SOP',
    category: 'Communication',
    status: 'approved',
    description: 'Comprehensive morning report with PDF, email, and voice summary of overnight work and daily priorities.',
    thoughtProcess: 'Julian should wake up knowing what happened overnight and what\'s important today. Multi-format delivery (PDF + email + voice) ensures he gets it however he prefers.',
    tools: ['Google Calendar', 'Gmail', 'Linear', 'GitHub', 'TTS', 'PDF Generation'],
    skills: ['tts', 'gmail'],
    agents: ['Morning Briefing Agent (Cron)'],
    triggers: ['Daily at 8 AM PST'],
    steps: [
      'Compile overnight work (commits, PRs, deployments)',
      'Check calendar for today\'s events',
      'Review Linear for priorities',
      'Generate PDF report with ReportLab',
      'Email report to julianb233@gmail.com',
      'Create 90-second voice summary',
      'Send voice note via Telegram'
    ],
    createdAt: '2026-01-28T19:00:00Z',
    updatedAt: '2026-01-29T08:00:00Z'
  },
  {
    id: 'sop-proactive-monitor',
    name: 'Proactive Life Monitor SOP',
    category: 'Business Operations',
    status: 'approved',
    description: 'Regular monitoring of email, calendar, tasks, and receivables with autonomous action on routine items.',
    thoughtProcess: 'Be a CEO reporting to the board - do the work, don\'t just report. Handle routine items autonomously, only escalate what needs Julian\'s input.',
    tools: ['Gmail', 'Calendar', 'Linear', 'Supabase'],
    skills: ['gmail', 'google-calendar'],
    agents: ['Proactive Monitor Agent (Cron)'],
    triggers: ['Twice daily: 9 AM and 6 PM PST'],
    steps: [
      'Check email for actionable items',
      'Review calendar for upcoming events',
      'Check Linear for blocked issues',
      'Review receivables for overdue payments',
      'Take autonomous action on Level 1-2 items',
      'Report only: completed actions, in-progress items, blockers'
    ],
    createdAt: '2026-01-28T18:00:00Z',
    updatedAt: '2026-01-29T09:00:00Z'
  },
  {
    id: 'sop-research-deep',
    name: 'Deep Research SOP',
    category: 'Research',
    status: 'pending_approval',
    description: 'Comprehensive research using Perplexity, web search, and document analysis.',
    thoughtProcess: 'When Julian needs research, go deep. Use multiple sources, cross-reference, and deliver actionable insights - not just links.',
    tools: ['Perplexity API', 'Brave Search', 'Firecrawl', 'Pinecone'],
    skills: ['web_search', 'web_fetch'],
    agents: ['Research Agent (On-demand)'],
    triggers: ['When Julian requests research', 'Before important meetings'],
    steps: [
      'Clarify research scope and deliverables',
      'Search with Perplexity for synthesized answers',
      'Use Brave Search for recent news/updates',
      'Scrape relevant pages with Firecrawl',
      'Cross-reference multiple sources',
      'Store key findings in Pinecone',
      'Deliver structured report with citations'
    ],
    createdAt: '2026-01-29T10:00:00Z',
    updatedAt: '2026-01-29T10:00:00Z'
  }
];

export async function GET() {
  const pending = sops.filter(s => s.status === 'pending_approval');
  const approved = sops.filter(s => s.status === 'approved');
  const declined = sops.filter(s => s.status === 'declined');

  return NextResponse.json({
    categories,
    sops,
    summary: {
      total: sops.length,
      pending: pending.length,
      approved: approved.length,
      declined: declined.length
    },
    lastUpdated: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, sopId, feedback } = body;

  // Find SOP
  const sop = sops.find(s => s.id === sopId);
  if (!sop) {
    return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
  }

  if (action === 'approve') {
    sop.status = 'approved';
    sop.updatedAt = new Date().toISOString();
    return NextResponse.json({ success: true, sop });
  }

  if (action === 'decline') {
    sop.status = 'declined';
    sop.feedback = feedback;
    sop.updatedAt = new Date().toISOString();
    return NextResponse.json({ success: true, sop });
  }

  if (action === 'edit') {
    // Apply edits from voice feedback
    Object.assign(sop, body.updates);
    sop.updatedAt = new Date().toISOString();
    return NextResponse.json({ success: true, sop });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
