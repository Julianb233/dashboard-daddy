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

// Script templates based on purpose
const SCRIPT_TEMPLATES = {
  customer_service: {
    firstMessage: "Hello! I'm an AI assistant calling to help resolve any questions or concerns you may have about our services. How can I assist you today?",
    systemPrompt: "You are a helpful customer service representative. Be polite, professional, and focus on resolving the customer's issues. If you cannot help with something, offer to transfer them to a human representative.",
  },
  order: {
    firstMessage: "Hi there! I'm calling regarding your recent order. I wanted to check in and see if you have any questions or if there's anything I can help you with.",
    systemPrompt: "You are calling about a customer's order. Be helpful and informative about order status, shipping, returns, or any order-related questions. Gather order information if needed.",
  },
  booking: {
    firstMessage: "Good day! I'm calling to help schedule an appointment that works best for your availability. What dates and times would work well for you?",
    systemPrompt: "You are helping to schedule an appointment or booking. Be flexible with scheduling, confirm availability, and gather all necessary information for the appointment.",
  },
  inquiry: {
    firstMessage: "Hello! I'm reaching out to gather some information and see how we can best assist you today. Do you have a few minutes to chat?",
    systemPrompt: "You are making a general inquiry call. Be conversational and friendly while gathering the information you need. Ask relevant questions based on the conversation flow.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, purpose, assistantId } = body;

    if (!phoneNumber || !purpose || !assistantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phoneNumber, purpose, assistantId' },
        { status: 400 }
      );
    }

    const apiKey = await getVapiApiKey();
    const scriptTemplate = SCRIPT_TEMPLATES[purpose as keyof typeof SCRIPT_TEMPLATES] || SCRIPT_TEMPLATES.inquiry;

    // Create outbound call via Vapi API
    const callPayload = {
      assistantId: assistantId,
      customer: {
        number: phoneNumber,
      },
      assistantOverrides: {
        firstMessage: scriptTemplate.firstMessage,
        model: {
          messages: [
            {
              role: 'system',
              content: scriptTemplate.systemPrompt,
            },
          ],
        },
      },
      metadata: {
        purpose: purpose,
        createdBy: 'dashboard-daddy',
        timestamp: new Date().toISOString(),
      },
    };

    console.log('Making Vapi call with payload:', JSON.stringify(callPayload, null, 2));

    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callPayload),
    });

    const responseText = await response.text();
    console.log('Vapi response status:', response.status);
    console.log('Vapi response:', responseText);

    if (!response.ok) {
      let errorMessage = `Vapi API error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error('Invalid JSON response from Vapi API');
    }

    return NextResponse.json({
      success: true,
      callId: data.id,
      message: 'Call initiated successfully',
      data: data,
    });

  } catch (error) {
    console.error('Error making call:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to make call',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}