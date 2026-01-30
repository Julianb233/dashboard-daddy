import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
const VAPI_BASE_URL = 'https://api.vapi.ai';

async function getVapiApiKey() {
  if (VAPI_API_KEY) {
    return VAPI_API_KEY;
  }
  
  try {
    // Fallback to reading from file
    const keyPath = join(process.env.HOME || '/home/dev', '.config/vapi/api_key');
    const key = await readFile(keyPath, 'utf-8');
    return key.trim();
  } catch (error) {
    console.error('Failed to read Vapi API key:', error);
    throw new Error('Vapi API key not found');
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = await getVapiApiKey();
    
    // Get calls from Vapi API
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Vapi calls to our format
    const calls = (data.calls || []).map((call: any) => ({
      id: call.id,
      phoneNumber: call.customer?.number || 'Unknown',
      purpose: call.metadata?.purpose || 'inquiry',
      status: call.status || 'unknown',
      duration: call.endedAt ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.createdAt).getTime()) / 1000) : undefined,
      startedAt: call.createdAt,
      endedAt: call.endedAt,
      outcome: call.metadata?.outcome,
      recording: call.recordingUrl ? {
        url: call.recordingUrl,
        duration: call.duration || 0,
      } : undefined,
      transcript: call.transcript,
    })).sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return NextResponse.json({
      success: true,
      calls,
      total: calls.length,
    });

  } catch (error) {
    console.error('Error fetching call history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch call history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}