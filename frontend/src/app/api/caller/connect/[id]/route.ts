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
    const body = await request.json();
    const { humanPhoneNumber } = body;

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Call ID is required' },
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

    // For Vapi, we'll update the call metadata to flag human handoff
    // In a real implementation, you might use Vapi's function calling
    // or assistant message features to trigger a transfer
    const updatePayload = {
      metadata: {
        ...callData.metadata,
        humanHandoffRequested: true,
        humanHandoffRequestedAt: new Date().toISOString(),
        humanPhoneNumber: humanPhoneNumber || 'pending',
        handoffReason: 'user_requested',
      },
    };

    // Update the call with handoff metadata
    const updateResponse = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to request handoff: ${updateResponse.status}`);
    }

    // Send a message to the AI to inform about the handoff
    const messagePayload = {
      message: {
        role: 'assistant',
        content: 'I understand you\'d like to speak with a human representative. Let me connect you with someone who can better assist you. Please hold on for just a moment.',
      },
    };

    try {
      await fetch(`${VAPI_BASE_URL}/call/${callId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });
    } catch (error) {
      console.warn('Failed to send handoff message:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Human handoff requested successfully',
      callId: callId,
      handoffRequested: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error requesting human handoff:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to request human handoff',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}