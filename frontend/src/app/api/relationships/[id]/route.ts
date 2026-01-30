import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for server-side access (no auth required for personal dashboard)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;
    
    // Get person with contact history
    const { data: person, error } = await supabase
      .from('people')
      .select(`
        *,
        contact_history(
          id,
          contact_type,
          subject,
          notes,
          outcome,
          next_action,
          contact_date,
          created_at
        ),
        discipleship(
          faith_status,
          current_study,
          prayer_requests,
          favorite_verses,
          next_encouragement_due
        ),
        mentor_notes(
          expertise_areas,
          key_lessons,
          how_julian_can_help
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Person not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching person:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Sort contact history by date (newest first)
    if (person.contact_history) {
      person.contact_history.sort((a: any, b: any) => 
        new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
      );
    }
    
    return NextResponse.json(person);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Prepare update data
    const updateData: any = {};
    
    // Map both old and new field names
    if (body.name) {
      const parts = body.name.trim().split(' ');
      updateData.first_name = parts[0];
      updateData.last_name = parts.slice(1).join(' ') || null;
    }
    if (body.first_name) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.nickname !== undefined) updateData.nickname = body.nickname;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.title !== undefined) updateData.job_title = body.title;
    if (body.job_title !== undefined) updateData.job_title = body.job_title;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.circle !== undefined) updateData.circle = body.circle;
    if (body.relationship_role !== undefined) updateData.relationship_role = body.relationship_role;
    if (body.relationship_type !== undefined) updateData.relationship_type = body.relationship_type;
    if (body.relationship_strength !== undefined) updateData.relationship_strength = body.relationship_strength;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.lastContacted !== undefined) updateData.last_contact_date = body.lastContacted;
    if (body.last_contact_date !== undefined) updateData.last_contact_date = body.last_contact_date;
    if (body.nextFollowUp !== undefined) updateData.next_contact_date = body.nextFollowUp;
    if (body.next_contact_date !== undefined) updateData.next_contact_date = body.next_contact_date;
    if (body.contactFrequency !== undefined) updateData.contact_frequency_days = parseInt(body.contactFrequency) || null;
    if (body.contact_frequency_days !== undefined) updateData.contact_frequency_days = body.contact_frequency_days;
    if (body.birthday !== undefined) updateData.birthday = body.birthday;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.interests !== undefined) updateData.interests = body.interests;
    if (body.how_we_met !== undefined) updateData.how_we_met = body.how_we_met;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: person, error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Person not found' },
          { status: 404 }
        );
      }
      console.error('Error updating person:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(person);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = params;
    
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting person:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
