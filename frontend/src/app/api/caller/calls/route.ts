import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Get Vapi API key
    const apiKeyPath = '/home/dev/.config/vapi/api_key';
    if (!fs.existsSync(apiKeyPath)) {
      return NextResponse.json({ calls: [], error: 'Vapi API key not configured' });
    }
    
    const apiKey = fs.readFileSync(apiKeyPath, 'utf-8').trim();
    
    // Fetch calls from Vapi
    const response = await fetch('https://api.vapi.ai/call', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Vapi API error:', response.status);
      return NextResponse.json({ calls: [] });
    }

    const data = await response.json();
    
    // Transform to our format
    const calls = (data || []).map((call: any) => ({
      id: call.id,
      phoneNumber: call.customer?.number || call.phoneNumber || 'Unknown',
      status: call.status === 'ended' ? 'completed' : 
              call.status === 'ringing' || call.status === 'in-progress' ? 'in-progress' :
              call.status === 'failed' ? 'failed' : 'queued',
      duration: call.endedAt && call.startedAt 
        ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : undefined,
      recordingUrl: call.recordingUrl,
      transcript: call.transcript,
      outcome: call.analysis?.successEvaluation || null,
      createdAt: call.createdAt,
      assistantId: call.assistantId
    }));

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({ calls: [], error: 'Failed to fetch calls' });
  }
}
