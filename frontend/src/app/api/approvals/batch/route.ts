import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { action, requestIds, comment } = await request.json();
    const supabase = await createClient();

    // Validate all approval IDs exist
    const { data: existingApprovals, error: fetchError } = await supabase
      .from('approval_queue')
      .select('id')
      .in('id', requestIds);

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch approvals', error: fetchError.message },
        { status: 500 }
      );
    }

    const existingIds = existingApprovals?.map(a => a.id) || [];
    const missingIds = requestIds.filter((id: string) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        { success: false, message: `Approvals not found: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Update all approvals
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

    const { data: updatedApprovals, error: updateError } = await supabase
      .from('approval_queue')
      .update(updates)
      .in('id', requestIds)
      .select();

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update approvals', error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${requestIds.length} approval${requestIds.length !== 1 ? 's' : ''}`,
      processed: updatedApprovals,
      totalProcessed: updatedApprovals?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch approval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process batch approval operation' 
      },
      { status: 500 }
    );
  }
}