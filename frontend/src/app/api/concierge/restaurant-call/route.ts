import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Vapi API configuration
const VAPI_API_URL = 'https://api.vapi.ai';

interface RestaurantCall {
  restaurant_name: string;
  restaurant_phone: string;
  call_purpose: 'hours' | 'reservation' | 'wait_time' | 'menu' | 'availability';
  additional_info?: string;
}

interface VapiCallRequest {
  assistant_id: string;
  phone_number_id: string;
  customer: {
    number: string;
  };
  assistant_overrides?: {
    variable_values?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'make_call':
        return await makeRestaurantCall(body as RestaurantCall);
      case 'get_call_status':
        return await getCallStatus(body.call_id);
      case 'get_call_history':
        return await getCallHistory(body.restaurant_name);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Restaurant call API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const restaurant_name = searchParams.get('restaurant_name');

    switch (action) {
      case 'history':
        return await getCallHistory(restaurant_name);
      case 'recent':
        return await getRecentCalls();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Restaurant call API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function makeRestaurantCall(callRequest: RestaurantCall): Promise<NextResponse> {
  try {
    const { restaurant_name, restaurant_phone, call_purpose, additional_info } = callRequest;

    // Validate phone number format
    const cleanPhone = cleanPhoneNumber(restaurant_phone);
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Create call log entry
    const callLogData = {
      restaurant_name,
      restaurant_phone: cleanPhone,
      call_purpose,
      call_status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: callLog, error: logError } = await supabase
      .from('restaurant_call_logs')
      .insert([callLogData])
      .select()
      .single();

    if (logError) throw logError;

    // Get assistant configuration based on call purpose
    const assistantConfig = getAssistantConfigForPurpose(call_purpose, {
      restaurant_name,
      additional_info
    });

    // Prepare Vapi call request
    const vapiRequest: VapiCallRequest = {
      assistant_id: assistantConfig.assistant_id,
      phone_number_id: process.env.VAPI_PHONE_NUMBER_ID!,
      customer: {
        number: cleanPhone
      },
      assistant_overrides: {
        variable_values: assistantConfig.variables
      }
    };

    // Make the call via Vapi
    const response = await fetch(`${VAPI_API_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiRequest)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Vapi API error:', errorData);
      
      // Update call log with failure
      await supabase
        .from('restaurant_call_logs')
        .update({ call_status: 'failed', call_summary: `Vapi API error: ${errorData}` })
        .eq('id', callLog.id);

      return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
    }

    const callData = await response.json();

    // Update call log with Vapi call ID
    const { error: updateError } = await supabase
      .from('restaurant_call_logs')
      .update({
        vapi_call_id: callData.id,
        call_status: 'initiated'
      })
      .eq('id', callLog.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      call_id: callData.id,
      local_call_id: callLog.id,
      message: `Call initiated to ${restaurant_name}`,
      purpose: call_purpose,
      estimated_duration: getEstimatedDuration(call_purpose)
    });

  } catch (error) {
    console.error('Error making restaurant call:', error);
    return NextResponse.json({ error: 'Failed to make call' }, { status: 500 });
  }
}

async function getCallStatus(callId: string): Promise<NextResponse> {
  try {
    // Get call status from Vapi
    const response = await fetch(`${VAPI_API_URL}/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY!}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get call status from Vapi');
    }

    const callData = await response.json();

    // Update our local call log
    await updateCallLogFromVapi(callData);

    return NextResponse.json({
      success: true,
      status: callData.status,
      duration: callData.duration,
      summary: callData.summary,
      transcript: callData.transcript
    });

  } catch (error) {
    console.error('Error getting call status:', error);
    return NextResponse.json({ error: 'Failed to get call status' }, { status: 500 });
  }
}

async function getCallHistory(restaurantName: string | null): Promise<NextResponse> {
  try {
    let query = supabase
      .from('restaurant_call_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (restaurantName) {
      query = query.eq('restaurant_name', restaurantName);
    }

    const { data: calls, error } = await query.limit(20);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      calls
    });

  } catch (error) {
    console.error('Error getting call history:', error);
    return NextResponse.json({ error: 'Failed to get call history' }, { status: 500 });
  }
}

async function getRecentCalls(): Promise<NextResponse> {
  try {
    const { data: calls, error } = await supabase
      .from('restaurant_call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      calls
    });

  } catch (error) {
    console.error('Error getting recent calls:', error);
    return NextResponse.json({ error: 'Failed to get recent calls' }, { status: 500 });
  }
}

// Helper functions
function cleanPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 or 11 digits)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return null;
}

function getAssistantConfigForPurpose(purpose: string, context: any) {
  // Default assistant ID - you can create specific assistants for different purposes
  const baseAssistantId = process.env.VAPI_ASSISTANT_ID || '811c7837-c7a0-420e-8c4d-b7c18386b698';
  
  const configs: Record<string, any> = {
    hours: {
      assistant_id: baseAssistantId,
      variables: {
        call_purpose: 'Check operating hours',
        restaurant_name: context.restaurant_name,
        greeting: `Hi, I'm calling to check what your current operating hours are for ${context.restaurant_name}?`,
        questions: [
          'What are your current operating hours today?',
          'Are these hours the same every day of the week?',
          'Do you have different hours for weekends?'
        ]
      }
    },
    reservation: {
      assistant_id: baseAssistantId,
      variables: {
        call_purpose: 'Make a reservation',
        restaurant_name: context.restaurant_name,
        greeting: `Hi, I'd like to make a reservation at ${context.restaurant_name}. ${context.additional_info || ''}`,
        questions: [
          'What availability do you have for tonight?',
          'Do you take reservations for parties of 2?',
          'What information do you need to make a reservation?'
        ]
      }
    },
    wait_time: {
      assistant_id: baseAssistantId,
      variables: {
        call_purpose: 'Check wait time',
        restaurant_name: context.restaurant_name,
        greeting: `Hi, I'm wondering what the current wait time is at ${context.restaurant_name}?`,
        questions: [
          'What is the current wait time for a table for two?',
          'Are you accepting walk-ins right now?',
          'Would you recommend calling ahead?'
        ]
      }
    },
    menu: {
      assistant_id: baseAssistantId,
      variables: {
        call_purpose: 'Ask about menu items',
        restaurant_name: context.restaurant_name,
        greeting: `Hi, I have some questions about your menu at ${context.restaurant_name}. ${context.additional_info || ''}`,
        questions: [
          'Do you have any vegetarian options available?',
          'What are your most popular dishes?',
          'Do you have any daily specials today?'
        ]
      }
    },
    availability: {
      assistant_id: baseAssistantId,
      variables: {
        call_purpose: 'Check availability',
        restaurant_name: context.restaurant_name,
        greeting: `Hi, I'm calling to check if ${context.restaurant_name} is open and taking orders right now?`,
        questions: [
          'Are you currently open and serving food?',
          'Are you taking takeout orders?',
          'Do you offer delivery?'
        ]
      }
    }
  };

  return configs[purpose] || configs.availability;
}

function getEstimatedDuration(purpose: string): string {
  const durations: Record<string, string> = {
    hours: '1-2 minutes',
    reservation: '2-5 minutes',
    wait_time: '1-2 minutes',
    menu: '3-5 minutes',
    availability: '1-2 minutes'
  };

  return durations[purpose] || '2-3 minutes';
}

async function updateCallLogFromVapi(vapiCallData: any): Promise<void> {
  try {
    const updateData: any = {
      call_status: vapiCallData.status,
      call_duration_seconds: vapiCallData.duration,
    };

    if (vapiCallData.summary) {
      updateData.call_summary = vapiCallData.summary;
    }

    if (vapiCallData.transcript) {
      updateData.transcript = vapiCallData.transcript;
    }

    if (vapiCallData.recording_url) {
      updateData.audio_url = vapiCallData.recording_url;
    }

    // Extract structured information from the call
    if (vapiCallData.transcript || vapiCallData.summary) {
      updateData.extracted_info = extractStructuredInfo(
        vapiCallData.transcript,
        vapiCallData.summary
      );
    }

    const { error } = await supabase
      .from('restaurant_call_logs')
      .update(updateData)
      .eq('vapi_call_id', vapiCallData.id);

    if (error) {
      console.error('Error updating call log:', error);
    }
  } catch (error) {
    console.error('Error updating call log from Vapi data:', error);
  }
}

function extractStructuredInfo(transcript: string, summary: string): Record<string, any> {
  const info: Record<string, any> = {};

  if (!transcript && !summary) return info;

  const text = (transcript || summary || '').toLowerCase();

  // Extract hours
  const hourPatterns = [
    /(\d{1,2}):?(\d{2})?\s*(am|pm)\s*(?:to|until|-)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)/g,
    /open\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/g,
    /close\s+(\d{1,2}):?(\d{2})?\s*(am|pm)/g
  ];

  hourPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      info.hours_mentioned = matches;
    }
  });

  // Extract wait times
  const waitPatterns = [
    /(\d+)\s*(?:minute|min)/g,
    /(\d+)\s*(?:hour|hr)/g,
    /no wait/g,
    /busy|full|packed/g
  ];

  waitPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      info.wait_time = matches[0];
    }
  });

  // Extract availability
  if (text.includes('closed') || text.includes('not open')) {
    info.is_open = false;
  } else if (text.includes('open') || text.includes('serving')) {
    info.is_open = true;
  }

  // Extract reservation info
  if (text.includes('reservation') || text.includes('book')) {
    info.takes_reservations = !text.includes('no reservation') && !text.includes('don\'t take');
  }

  return info;
}