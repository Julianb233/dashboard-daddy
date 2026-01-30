// Caller/Vapi AI types

export type CallStatus = 'active' | 'completed' | 'failed' | 'queued' | 'ringing' | 'in-progress';

export type CallOutcome = 'resolved' | 'callback_needed' | 'transferred';

export type CallPurpose = 'customer_service' | 'order' | 'booking' | 'inquiry';

export interface CallRecording {
  url: string;
  duration: number;
  format?: string;
}

export interface Call {
  id: string;
  phoneNumber: string;
  purpose: CallPurpose;
  status: CallStatus;
  duration?: number;
  startedAt: string;
  endedAt?: string;
  outcome?: CallOutcome;
  recording?: CallRecording;
  transcript?: string;
  assistantId: string;
  metadata?: Record<string, any>;
}

export interface CallHistoryResponse {
  success: boolean;
  calls: Call[];
  total: number;
  error?: string;
  message?: string;
}

export interface MakeCallRequest {
  phoneNumber: string;
  purpose: CallPurpose;
  assistantId: string;
  humanPhoneNumber?: string;
}

export interface MakeCallResponse {
  success: boolean;
  callId?: string;
  message: string;
  data?: any;
  error?: string;
}

export interface EndCallResponse {
  success: boolean;
  callId: string;
  message: string;
  data?: any;
  error?: string;
}

export interface ConnectCallRequest {
  humanPhoneNumber?: string;
}

export interface ConnectCallResponse {
  success: boolean;
  callId: string;
  message: string;
  handoffRequested: boolean;
  timestamp: string;
  error?: string;
}

export interface UpdateOutcomeRequest {
  outcome: CallOutcome;
}

export interface UpdateOutcomeResponse {
  success: boolean;
  callId: string;
  outcome: CallOutcome;
  message: string;
  timestamp: string;
  data?: any;
  error?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  model?: string;
  voice?: string;
}

export interface CallPurposeOption {
  value: CallPurpose;
  label: string;
  script: string;
}

// Vapi API specific types (for internal use)
export interface VapiCall {
  id: string;
  status: string;
  customer?: {
    number: string;
  };
  assistant?: {
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
  metadata?: Record<string, any>;
}

export interface VapiCallRequest {
  assistantId: string;
  customer: {
    number: string;
  };
  assistantOverrides?: {
    firstMessage?: string;
    model?: {
      messages?: Array<{
        role: string;
        content: string;
      }>;
    };
  };
  metadata?: Record<string, any>;
}

export interface VapiApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}