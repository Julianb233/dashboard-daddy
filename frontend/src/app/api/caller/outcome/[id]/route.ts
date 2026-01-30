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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const body = await request.json();
    const { outcome } = body;

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Call ID is required' },
        { status: 400 }
      );
    }

    if (!outcome || !['resolved', 'callback_needed', 'transferred'].includes(outcome)) {
      return NextResponse.json(
        { success: false, error: 'Valid outcome is required (resolved, callback_needed, transferred)' },
        { status: 400 }
      );
    }

    const apiKey = await getVapiApiKey();

    // First, get the current call details
    const callResponse = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!callResponse.ok) {
      throw new Error(`Failed to get call details: ${callResponse.status}`);
    }

    const callData = await callResponse.json();

    // Update the call metadata with the outcome
    const updatePayload = {
      metadata: {
        ...callData.metadata,
        outcome: outcome,
        outcomeUpdatedAt: new Date().toISOString(),
        outcomeUpdatedBy: 'dashboard-daddy',
      },
    };

    // Update the call with outcome metadata
    const updateResponse = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update call outcome: ${updateResponse.status} - ${errorText}`);
    }

    const updatedCall = await updateResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Call outcome updated successfully',
      callId: callId,
      outcome: outcome,
      data: updatedCall,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating call outcome:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update call outcome',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}