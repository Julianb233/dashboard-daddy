import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action, comment } = await request.json();
    const { id: approvalId } = await params;
    const supabase = await createClient();

    // Check if approval exists
    const { data: existingApproval, error: fetchError } = await supabase
      .from('approval_queue')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (fetchError || !existingApproval) {
      return NextResponse.json(
        { success: false, message: 'Approval not found' },
        { status: 404 }
      );
    }

    // Update approval status
    const updates: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updates.approved_by = 'current-user';
      updates.approved_at = new Date().toISOString();
    } else {
      updates.rejected_by = 'current-user';
      updates.rejected_at = new Date().toISOString();
    }

    if (comment) {
      updates.comment = comment;
    }

    const { data: updatedApproval, error: updateError } = await supabase
      .from('approval_queue')
      .update(updates)
      .eq('id', approvalId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update approval', error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Approval ${action}d successfully`,
      approval: updatedApproval
    });

  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process approval action' 
      },
      { status: 500 }
    );
  }
}