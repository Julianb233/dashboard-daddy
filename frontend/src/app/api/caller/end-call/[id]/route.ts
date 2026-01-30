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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Call ID is required' },
        { status: 400 }
      );
    }

    const apiKey = await getVapiApiKey();

    // End the call via Vapi API
    const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status}`);
    }

    // Get call details after ending
    let callData = null;
    try {
      const callResponse = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (callResponse.ok) {
        callData = await callResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch call details after ending:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Call ended successfully',
      callId: callId,
      data: callData,
    });

  } catch (error) {
    console.error('Error ending call:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to end call',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}