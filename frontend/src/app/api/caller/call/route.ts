import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, purpose, customScript } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get Vapi API key
    const apiKeyPath = '/home/dev/.config/vapi/api_key';
    if (!fs.existsSync(apiKeyPath)) {
      return NextResponse.json({ error: 'Vapi API key not configured' }, { status: 500 });
    }
    
    const apiKey = fs.readFileSync(apiKeyPath, 'utf-8').trim();
    
    // Use New Sahara assistant
    const assistantId = '811c7837-c7a0-420e-8c4d-b7c18386b698';
    
    // Format phone number
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const fullPhone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;

    // Create the call
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId,
        customer: {
          number: fullPhone
        },
        // Use one of Julian's registered phone numbers
        phoneNumberId: 'e2ddfd0b-82b0-4ec9-812c-dbd24bd8f008', // +15753005311
        assistantOverrides: customScript ? {
          firstMessage: customScript
        } : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vapi call error:', response.status, errorData);
      return NextResponse.json({ 
        error: 'Failed to initiate call', 
        details: errorData 
      }, { status: response.status });
    }

    const callData = await response.json();
    
    // Return formatted call info
    return NextResponse.json({
      success: true,
      call: {
        id: callData.id,
        phoneNumber: fullPhone,
        status: 'queued',
        createdAt: new Date().toISOString(),
        assistantId
      }
    });

  } catch (error) {
    console.error('Error making call:', error);
    return NextResponse.json({ error: 'Failed to make call' }, { status: 500 });
  }
}
