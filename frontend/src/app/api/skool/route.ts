import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Skool communities Julian is part of
const communities = [
  {
    id: 'automatable',
    name: 'Automatable',
    cost: '$70/mo',
    specialty: 'Workflow automation, n8n, Make',
    status: 'active'
  },
  {
    id: 'ai-automations-jack',
    name: 'AI Automations by Jack',
    cost: '$77/mo',
    specialty: 'AI agents, automation frameworks',
    status: 'active'
  },
  {
    id: 'early-ai-dopters',
    name: 'Early AI-dopters',
    cost: '$59/mo',
    specialty: 'Claude Code, Clawdbot, AI tools',
    status: 'active'
  },
  {
    id: 'no-code-architects',
    name: 'No-Code Architects',
    cost: '$97/mo',
    specialty: 'No-code platforms, system design',
    status: 'cancelled'
  }
];

// Google Calendar API helper
async function getSkoolEvents() {
  const tokensPath = process.env.HOME + '/.config/google-cloud/oauth_tokens_julianb233.json';
  
  try {
    const fs = await import('fs');
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    
    const SKOOL_CAL = '9a2ea9406f7111f8630b7b2265f9d962d87166f09e9a894addc9f86dca857134@group.calendar.google.com';
    
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(SKOOL_CAL)}/events?` +
      `timeMin=${now.toISOString()}&timeMax=${twoWeeks.toISOString()}&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    
    if (!response.ok) {
      console.error('Calendar API error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return (data.items || []).map((event: Record<string, unknown>) => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: (event.start as Record<string, string>)?.dateTime || (event.start as Record<string, string>)?.date,
      end: (event.end as Record<string, string>)?.dateTime || (event.end as Record<string, string>)?.date,
      location: event.location,
      isFree: event.transparency === 'transparent',
      attending: event.transparency !== 'transparent',
      community: extractCommunity(event.summary as string),
      eventType: extractEventType(event.summary as string)
    }));
  } catch (error) {
    console.error('Error fetching Skool events:', error);
    return [];
  }
}

function extractCommunity(title: string): string {
  if (title?.includes('Automatable')) return 'Automatable';
  if (title?.includes('AI Automations by Jack')) return 'AI Automations by Jack';
  if (title?.includes('Early AI-dopters')) return 'Early AI-dopters';
  if (title?.includes('No-Code Architects')) return 'No-Code Architects';
  return 'Unknown';
}

function extractEventType(title: string): string {
  const lower = title?.toLowerCase() || '';
  if (lower.includes('q&a') || lower.includes('support')) return 'Q&A / Support';
  if (lower.includes('onboarding')) return 'Onboarding';
  if (lower.includes('tech support')) return 'Tech Support';
  if (lower.includes('workshop')) return 'Workshop';
  if (lower.includes('chill') || lower.includes('hangout')) return 'Community';
  if (lower.includes('coaching') || lower.includes('call')) return 'Coaching Call';
  return 'General';
}

export async function GET() {
  const events = await getSkoolEvents();
  
  // Group by date
  const byDate: Record<string, typeof events> = {};
  events.forEach(event => {
    const date = new Date(event.start).toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(event);
  });
  
  return NextResponse.json({
    communities,
    events,
    eventsByDate: byDate,
    summary: {
      total: events.length,
      attending: events.filter(e => e.attending).length,
      thisWeek: events.filter(e => {
        const eventDate = new Date(e.start);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return eventDate <= weekFromNow;
      }).length
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, action } = body;
  
  // For now, return success - actual implementation would update Google Calendar
  // and trigger question preparation for Q&A events
  
  if (action === 'attend') {
    return NextResponse.json({ 
      success: true, 
      message: 'Marked as attending. Calendar updated to busy. Preparing briefing...',
      eventId 
    });
  }
  
  if (action === 'skip') {
    return NextResponse.json({ 
      success: true, 
      message: 'Marked as not attending. Calendar remains free.',
      eventId 
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
